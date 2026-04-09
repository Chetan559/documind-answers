from loguru import logger

# Only these very explicit social / meta signals skip PDF retrieval entirely
CONTINUATION_SIGNALS = {
    "yes", "no", "ok", "okay", "sure", "yep", "nope", "alright",
    "sounds good", "got it", "understood", "thanks", "thank you",
    "great", "perfect", "nice", "cool", "awesome",
}


class IntentService:

    async def detect(self, message: str, history: list[dict]) -> str:
        """
        Returns 'rag' or 'continuation'.

        Rules (in priority order):
        1. No history                → always rag  (first message)
        2. Pure social/ack signal   → continuation (no retrieval needed)
        3. Everything else          → rag  (always consult PDFs)

        Rationale: this is a document Q&A app. The PDFs must be consulted for
        every substantive question. Previously, short questions after the first
        message were being classified as 'continuation', causing the model to
        answer from conversation history only — losing all PDF context.
        """
        if not history:
            return "rag"

        normalized = message.lower().strip().rstrip(".!?")

        # Only skip retrieval for pure social acknowledgements
        if normalized in CONTINUATION_SIGNALS:
            logger.debug(f"Intent: continuation (ack signal) — '{message}'")
            return "continuation"

        # Everything else — always retrieve from PDFs
        logger.debug(f"Intent: rag (default) — '{message}'")
        return "rag"


intent_service = IntentService()