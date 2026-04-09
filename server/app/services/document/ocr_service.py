"""
ocr_service.py — PaddleOCR-based text extraction for scanned/handwritten PDFs.

Strategy:
- Two lazy-loaded PaddleOCR instances: English ('en') and Hindi ('hi').
- Each PDF page is rendered to a numpy image via PyMuPDF (already a dependency).
- Both engines run per page; results are merged & deduplicated by bounding box overlap.
- Output: list of {"text", "page_number", "bbox": {x0,y0,x1,y1}} — same format as
  extract_chunks() in ingestion_service.py, so the rest of the pipeline is unchanged.
"""

from __future__ import annotations

import threading
from typing import TYPE_CHECKING

import fitz  # PyMuPDF — already a project dependency
import numpy as np
from loguru import logger

if TYPE_CHECKING:
    from paddleocr import PaddleOCR

# ── Constants ─────────────────────────────────────────────────────────────────

MIN_TEXT_LENGTH = 10        # characters — ignore tiny noise fragments
MIN_CONFIDENCE  = 0.60      # drop low-confidence recognitions
PAGE_DPI        = 200       # render resolution; 200 is a good CPU/quality tradeoff
IOU_THRESHOLD   = 0.50      # overlap ratio above which two regions are "the same"

_SUPPORTED_LANGS = ("en", "hi")


# ── Singleton OCR engine pool ─────────────────────────────────────────────────

class _OcrPool:
    """Thread-safe lazy registry of PaddleOCR instances, one per language."""

    def __init__(self) -> None:
        self._lock      = threading.Lock()
        self._instances: dict[str, "PaddleOCR"] = {}

    def get(self, lang: str) -> "PaddleOCR":
        if lang not in self._instances:
            with self._lock:
                if lang not in self._instances:  # double-checked lock
                    self._instances[lang] = self._create(lang)
        return self._instances[lang]

    @staticmethod
    def _create(lang: str) -> "PaddleOCR":
        # Import here so the module can be imported even if paddleocr is not yet
        # installed — the ImportError surfaces only when OCR is first attempted.
        from paddleocr import PaddleOCR  # noqa: PLC0415

        logger.info(f"Initializing PaddleOCR engine: lang={lang!r} (first use)")
        return PaddleOCR(
            use_angle_cls=True,   # auto-correct rotated text
            lang=lang,
            show_log=False,       # suppress PaddleOCR's verbose stdout
            use_gpu=False,        # CPU-only — no CUDA required
        )


_pool = _OcrPool()


# ── Internal helpers ──────────────────────────────────────────────────────────

def _render_page(doc: fitz.Document, page_idx: int, dpi: int = PAGE_DPI) -> np.ndarray:
    """Render a single PDF page to an RGB numpy array."""
    page  = doc[page_idx]
    scale = dpi / 72.0
    mat   = fitz.Matrix(scale, scale)
    pix   = page.get_pixmap(matrix=mat, alpha=False)
    arr   = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
    return arr  # shape (H, W, 3) — RGB


def _polygon_to_bbox(polygon: list[list[float]]) -> dict[str, float]:
    """Convert PaddleOCR's 4-point polygon [[x,y]×4] to axis-aligned bbox dict."""
    xs = [p[0] for p in polygon]
    ys = [p[1] for p in polygon]
    return {"x0": min(xs), "y0": min(ys), "x1": max(xs), "y1": max(ys)}


def _iou(a: dict, b: dict) -> float:
    """Intersection-over-Union for two axis-aligned bboxes."""
    ix0 = max(a["x0"], b["x0"]); iy0 = max(a["y0"], b["y0"])
    ix1 = min(a["x1"], b["x1"]); iy1 = min(a["y1"], b["y1"])
    inter = max(0.0, ix1 - ix0) * max(0.0, iy1 - iy0)
    if inter == 0.0:
        return 0.0
    area_a = (a["x1"] - a["x0"]) * (a["y1"] - a["y0"])
    area_b = (b["x1"] - b["x0"]) * (b["y1"] - b["y0"])
    return inter / (area_a + area_b - inter)


def _run_single_lang(image: np.ndarray, lang: str) -> list[dict]:
    """Run one PaddleOCR engine on an image; returns [{text, bbox, confidence}]."""
    ocr = _pool.get(lang)
    try:
        raw = ocr.ocr(image, cls=True)
    except Exception as exc:
        logger.warning(f"PaddleOCR ({lang}) error: {exc}")
        return []

    results: list[dict] = []
    if not raw or raw[0] is None:
        return results

    for line in raw[0]:
        polygon, (text, confidence) = line
        text = (text or "").strip()
        if len(text) < MIN_TEXT_LENGTH or confidence < MIN_CONFIDENCE:
            continue
        results.append({
            "text":       text,
            "bbox":       _polygon_to_bbox(polygon),
            "confidence": confidence,
        })
    return results


def _merge_page_results(en_results: list[dict], hi_results: list[dict]) -> list[dict]:
    """
    Merge detections from two language engines for the same page.
    For any pair of detections with IoU > IOU_THRESHOLD (same region), keep the
    one with higher confidence. Remaining non-overlapping detections from both
    engines are combined.
    """
    merged: list[dict] = list(en_results)  # start with English detections

    for hi in hi_results:
        # Check if this Hindi detection overlaps with any existing merged result
        duplicate = False
        for i, existing in enumerate(merged):
            if _iou(hi["bbox"], existing["bbox"]) > IOU_THRESHOLD:
                # Same region — keep whichever has higher confidence
                if hi["confidence"] > existing["confidence"]:
                    merged[i] = hi
                duplicate = True
                break
        if not duplicate:
            merged.append(hi)

    return merged


# ── Public API ────────────────────────────────────────────────────────────────

def extract_chunks_paddle(file_path: str) -> list[dict]:
    """
    Primary entry point for PaddleOCR-based extraction.

    Opens ``file_path`` as a PDF, renders each page, runs English and Hindi OCR
    engines, merges results, and returns a unified chunk list ready for indexing:

        [{"text": str, "page_number": int, "bbox": {"x0","y0","x1","y1"}}, ...]

    Raises on any unrecoverable error so the caller can apply the ocrmypdf fallback.
    """
    doc    = fitz.open(file_path)
    chunks: list[dict] = []

    try:
        for page_idx in range(doc.page_count):
            page_num = page_idx + 1
            logger.debug(f"PaddleOCR page {page_num}/{doc.page_count}")

            image = _render_page(doc, page_idx)

            en_results = _run_single_lang(image, "en")
            hi_results = _run_single_lang(image, "hi")
            page_results = _merge_page_results(en_results, hi_results)

            for res in page_results:
                chunks.append({
                    "text":        res["text"],
                    "page_number": page_num,
                    "bbox":        res["bbox"],
                })
    finally:
        doc.close()

    logger.info(f"PaddleOCR extracted {len(chunks)} blocks from {doc.page_count} pages")
    return chunks
