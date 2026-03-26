from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.services.auth_service import auth_service
from app.repos.user_repo import user_repo

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class GoogleLoginRequest(BaseModel):
    credential: str   # Google ID token from frontend


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    avatar_url: str | None


@router.post("/google", response_model=AuthResponse)
async def google_login(
    body: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Frontend sends Google ID token → we verify with Google → upsert user → return JWT.
    """
    try:
        google_data = await auth_service.verify_google_token(body.credential)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    user = await user_repo.upsert_from_google(
        db=db,
        google_id=google_data["sub"],
        email=google_data["email"],
        name=google_data["name"],
        avatar_url=google_data["picture"],
    )
    await db.commit()

    token = auth_service.create_jwt(user.id, user.email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url,
        },
    }


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Return current authenticated user."""
    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar_url": user.avatar_url,
    }
