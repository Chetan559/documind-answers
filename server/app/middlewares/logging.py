import sys
import os
import time
import logging
from fastapi import FastAPI, Request
from loguru import logger
from app.core.config import get_settings

settings = get_settings()


class InterceptHandler(logging.Handler):
    """
    Default handler from dev.to/astagi/intercepting-native-python-logging-with-loguru-26af
    to route all standard Python logging messages through Loguru.
    """
    def emit(self, record):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


def setup_logger():
    """Configure loguru and silence noisy libraries."""
    logger.remove()

    # Console
    logger.add(
        sys.stdout,
        level=settings.LOG_LEVEL,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level:<8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> — <level>{message}</level>",
    )

    # File with rotation
    if settings.LOG_FILE:
        os.makedirs(os.path.dirname(settings.LOG_FILE), exist_ok=True)
        logger.add(
            settings.LOG_FILE,
            level=settings.LOG_LEVEL,
            rotation="10 MB",
            retention="7 days",
            compression="zip",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level:<8} | {name}:{line} — {message}",
        )

    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Silence noisy libraries
    noisy_libraries = [
        "uvicorn",
        "uvicorn.access",
        "uvicorn.error",
        "fastapi",
        "sqlalchemy",
        "paddle",
        "paddleocr",
        "ppocr",
        "chromadb",
        "hnswlib",
        "httpcore",
        "httpx",
    ]
    for name in noisy_libraries:
        _logger = logging.getLogger(name)
        _logger.setLevel(logging.WARNING)
        _logger.propagate = False

    logger.info(f"Logger ready — level: {settings.LOG_LEVEL}")


def add_request_logging(app: FastAPI):
    """Log method, path, status and duration for every request."""

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        # Skip health check logging to further reduce noise
        if request.url.path == "/health":
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)

        logger.info(
            f"{request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)"
        )
        return response