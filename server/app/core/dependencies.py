from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import get_settings, Settings


def get_settings_dep() -> Settings:
    return get_settings()


# ── DB session shorthand ──────────────────────────────────────────────────────

DBSession = Depends(get_db)


# ── User ID from JWT ─────────────────────────────────────────────────────────

async def get_current_user_id(
    authorization: str = Header(default=None),
) -> str:
    """
    Extract user_id from JWT Bearer token in Authorization header.
    Returns user_id string.
    Raises 401 if token is missing, invalid, or expired.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1]

    from app.services.auth_service import auth_service
    try:
        payload = auth_service.decode_jwt(token)
        return payload["user_id"]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


CurrentUser = Depends(get_current_user_id)