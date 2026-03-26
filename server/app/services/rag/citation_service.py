import fitz
from loguru import logger


class CitationService:

    def resolve_bboxes(
        self,
        file_path: str,
        page_number: int,
        text: str,
    ) -> dict:
        """
        Use PyMuPDF to find the exact bbox of a text snippet on a page.
        Falls back to chunk's stored bbox if not found.

        Returns: {x0, y0, x1, y1}
        """
        try:
            doc = fitz.open(file_path)
            page = doc[page_number - 1]   # fitz is 0-indexed

            # Try full text first, then first 80 chars
            for search_text in [text[:120], text[:60]]:
                hits = page.search_for(search_text.strip())
                if hits:
                    rect = hits[0]
                    doc.close()
                    return {"x0": rect.x0, "y0": rect.y0, "x1": rect.x1, "y1": rect.y1}

            doc.close()
        except Exception as e:
            logger.warning(f"PyMuPDF bbox resolution failed (page {page_number}): {e}")

        return None     # caller falls back to chunk's stored bbox

    def build_citation_records(
        self,
        message_id: str,
        chunks: list[dict],
        pdf_file_path: str,
        pdf_id: str | None = None,
    ) -> list[dict]:
        """
        Build citation DB records from retrieved chunks (single-PDF version).
        chunks: [{chunk_id, text, page_number, bbox, score}]
        """
        path_map = {pdf_id: pdf_file_path} if pdf_id else {}
        return self._build_records(message_id, chunks, path_map, default_path=pdf_file_path)

    def build_citation_records_multi(
        self,
        message_id: str,
        chunks: list[dict],
        pdf_path_map: dict[str, str],
    ) -> list[dict]:
        """
        Build citation DB records for multi-PDF retrieval.
        chunks: [{chunk_id, text, page_number, bbox, score, source_pdf_id}]
        pdf_path_map: {pdf_id: file_path}
        """
        return self._build_records(message_id, chunks, pdf_path_map)

    def _build_records(
        self,
        message_id: str,
        chunks: list[dict],
        pdf_path_map: dict[str, str],
        default_path: str | None = None,
    ) -> list[dict]:
        records = []
        for i, chunk in enumerate(chunks):
            source_pdf_id = chunk.get("source_pdf_id")
            file_path = pdf_path_map.get(source_pdf_id) if source_pdf_id else default_path

            # Try to get precise bbox from PDF text search
            resolved = None
            if file_path:
                resolved = self.resolve_bboxes(file_path, chunk["page_number"], chunk["text"])
            bbox = resolved if resolved else chunk["bbox"]

            records.append({
                "message_id": message_id,
                "chunk_id": chunk["chunk_id"],
                "source_pdf_id": source_pdf_id,
                "page_number": chunk["page_number"],
                "bbox": bbox,
                "cited_text": chunk["text"][:500],
                "relevance_score": round(chunk["score"], 4),
                "is_primary": i == 0,
            })

        return records


citation_service = CitationService()