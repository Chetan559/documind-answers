from contextlib import asynccontextmanager
from fastapi import FastAPI
from loguru import logger

from app.core.config import get_settings
from app.core.database import create_tables, AsyncSessionLocal
from app.middlewares.cors import add_cors
from app.middlewares.logging import setup_logger, add_request_logging
from app.middlewares.rate_limit import add_rate_limiting
from app.routers.document.routes import router as document_router
from app.routers.chat.routes import router as chat_router
from app.routers.quiz.routes import router as quiz_router
from app.routers.auth.routes import router as auth_router
from app.routers.health import router as health_router

import app.models.user      # noqa: F401
import app.models.pdf       # noqa: F401
import app.models.chunk     # noqa: F401
import app.models.chat      # noqa: F401
import app.models.citation  # noqa: F401
import app.models.quiz      # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logger()
    logger.info(f"Starting DocuMind API — env: {settings.APP_ENV}")
    await create_tables()
    logger.info("Database ready")
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="DocuMind API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

add_cors(app)
add_rate_limiting(app)
add_request_logging(app)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(document_router)
app.include_router(chat_router)
app.include_router(quiz_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)