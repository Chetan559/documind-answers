import subprocess
import fitz
import cv2
import numpy as np
from loguru import logger

from app.services.document.ocr_service import extract_chunks_paddle


# ── Type detection ────────────────────────────────────────────────────────────

def detect_pdf_type(file_path: str) -> str:
    """Returns: 'digital' | 'scanned' | 'handwritten'"""
    doc = fitz.open(file_path)
    total_text = "".join(page.get_text().strip() for page in doc)
    doc.close()

    if len(total_text) > 100:
        return "digital"

    doc = fitz.open(file_path)
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
    doc.close()

    if img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)

    return _classify_image(img)


def _classify_image(image: np.ndarray) -> str:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    areas = [cv2.contourArea(c) for c in contours if cv2.contourArea(c) > 10]

    if not areas or len(areas) < 20:
        return "scanned"

    mean = np.mean(areas)
    if mean == 0:
        return "scanned"

    return "handwritten" if (np.var(areas) / mean) > 500 else "scanned"


# ── OCR — Primary (PaddleOCR) ─────────────────────────────────────────────────

def run_paddle_ocr(file_path: str) -> list[dict]:
    """
    Primary OCR path using PaddleOCR (English + Hindi, CPU).

    Renders each PDF page to an image via PyMuPDF and runs two language engines
    (en, hi) whose results are merged by bounding-box overlap and confidence.

    Returns the same chunk format as extract_chunks():
        [{"text": str, "page_number": int, "bbox": {"x0","y0","x1","y1"}}]

    Raises on failure — caller is responsible for triggering the fallback.
    """
    logger.info(f"Running PaddleOCR on: {file_path}")
    chunks = extract_chunks_paddle(file_path)
    if not chunks:
        raise ValueError("PaddleOCR returned zero text blocks")
    logger.info(f"PaddleOCR produced {len(chunks)} chunks")
    return chunks


# ── OCR — Fallback (ocrmypdf) ─────────────────────────────────────────────────

def run_ocr_fallback(file_path: str) -> list[dict]:
    """
    Secondary OCR fallback using ocrmypdf CLI.

    Writes a searchable PDF to <name>_ocr.pdf, then runs extract_chunks() on it.
    Returns the same chunk format as the primary path.
    Raises ValueError if ocrmypdf is not installed, times out, or returns no text.
    """
    output_path = file_path.replace(".pdf", "_ocr.pdf")
    logger.info(f"Running ocrmypdf fallback: {file_path} → {output_path}")
    try:
        result = subprocess.run(
            [
                "ocrmypdf",
                "--deskew",
                "--optimize", "1",
                "--output-type", "pdfa",
                "--skip-text",
                file_path,
                output_path,
            ],
            capture_output=True,
            text=True,
            timeout=300,
        )
        if result.returncode != 0:
            raise ValueError(f"ocrmypdf exited {result.returncode}: {result.stderr[:300]}")
        logger.info(f"ocrmypdf succeeded: {output_path}")
    except subprocess.TimeoutExpired:
        raise ValueError("ocrmypdf timed out after 300 s")
    except FileNotFoundError:
        raise ValueError("ocrmypdf is not installed on this system")

    chunks = extract_chunks(output_path)
    if not chunks:
        raise ValueError("ocrmypdf fallback produced a PDF with no extractable text")
    return chunks


# ── Text extraction ───────────────────────────────────────────────────────────

def extract_chunks(file_path: str) -> list[dict]:
    """Extract text blocks with page number and bbox."""
    doc = fitz.open(file_path)
    chunks = []
    for page_num in range(doc.page_count):
        page = doc[page_num]
        for block in page.get_text("blocks"):
            x0, y0, x1, y1, text, _, block_type = block
            text = text.strip()
            if text and block_type == 0 and len(text) > 20:
                chunks.append({
                    "text": text,
                    "page_number": page_num + 1,
                    "bbox": {"x0": x0, "y0": y0, "x1": x1, "y1": y1},
                })
    doc.close()
    return chunks


def get_page_count(file_path: str) -> int:
    doc = fitz.open(file_path)
    count = doc.page_count
    doc.close()
    return count