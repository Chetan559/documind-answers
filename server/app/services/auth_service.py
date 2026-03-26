from datetime import datetime, timedelta
import httpx
from jose import jwt, JWTError
from loguru import logger

from app.core.config import get_settings

settings = get_settings()

ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days


class AuthService:

    async def verify_google_token(self, id_token: str) -> dict:
        """
        Verify Google ID token by calling Google's tokeninfo endpoint.
        Returns: { sub, email, name, picture, email_verified }
        Raises ValueError on failure.
        """
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
            )

        if resp.status_code != 200:
            logger.warning(f"Google token verification failed: {resp.status_code}")
            raise ValueError("Invalid Google token")

        data = resp.json()

        # Validate audience matches our client ID
        if data.get("aud") != settings.GOOGLE_CLIENT_ID:
            logger.warning(f"Token audience mismatch: {data.get('aud')}")
            raise ValueError("Token audience mismatch")

        if data.get("email_verified") != "true":
            raise ValueError("Email not verified")

        return {
            "sub": data["sub"],
            "email": data["email"],
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
        }

    def create_jwt(self, user_id: str, email: str) -> str:
        """Create a signed JWT token."""
        payload = {
            "sub": user_id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=ALGORITHM)

    def decode_jwt(self, token: str) -> dict:
        """
        Decode and validate JWT. Returns { sub (user_id), email }.
        Raises ValueError on invalid/expired tokens.
        """
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
            return {"user_id": payload["sub"], "email": payload["email"]}
        except JWTError as e:
            logger.warning(f"JWT decode failed: {e}")
            raise ValueError("Invalid or expired token")


auth_service = AuthService()
