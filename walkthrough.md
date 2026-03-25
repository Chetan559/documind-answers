# Google OAuth + Multi-User Auth — Walkthrough

## What Was Built

Full Google OAuth authentication with JWT session management, user-scoped data, and protected routes.

## Backend Changes (8 files)

### New Files
| File | Purpose |
|------|---------|
| [user_repo.py](file:///f:/Bacancy/documind-answers/server/app/repos/user_repo.py) | User lookup by Google ID, upsert on login |
| [auth_service.py](file:///f:/Bacancy/documind-answers/server/app/services/auth_service.py) | Google token verification, JWT create/decode |
| [auth/routes.py](file:///f:/Bacancy/documind-answers/server/app/routers/auth/routes.py) | `POST /api/auth/google`, `GET /api/auth/me` |

### Modified Files
| File | Change |
|------|--------|
| [config.py](file:///f:/Bacancy/documind-answers/server/app/core/config.py) | Added `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET_KEY` |
| [user.py](file:///f:/Bacancy/documind-answers/server/app/models/user.py) | Added [google_id](file:///f:/Bacancy/documind-answers/server/app/repos/user_repo.py#12-15), `avatar_url`, `auth_provider` columns |
| [dependencies.py](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py) | JWT Bearer token auth (replaced placeholder) |
| [main.py](file:///f:/Bacancy/documind-answers/server/app/main.py) | Registered auth router, removed `seed_default_user` |
| [document/routes.py](file:///f:/Bacancy/documind-answers/server/app/routers/document/routes.py) | Upload + list protected by JWT |
| [chat/routes.py](file:///f:/Bacancy/documind-answers/server/app/routers/chat/routes.py) | Chat endpoint protected, [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) from JWT |
| [quiz/routes.py](file:///f:/Bacancy/documind-answers/server/app/routers/quiz/routes.py) | Generate endpoint protected, [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) from JWT |
| [chat/request.py](file:///f:/Bacancy/documind-answers/server/app/schemas/chat/request.py) | Removed [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) from body |
| [quiz/request.py](file:///f:/Bacancy/documind-answers/server/app/schemas/quiz/request.py) | Removed [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) from body |

## Frontend Changes (9 files)

### New Files
| File | Purpose |
|------|---------|
| [auth.ts](file:///f:/Bacancy/documind-answers/src/api/auth.ts) | [loginWithGoogle()](file:///f:/Bacancy/documind-answers/src/api/auth.ts#16-30), [getMe()](file:///f:/Bacancy/documind-answers/src/api/auth.ts#31-39) API calls |
| [authFetch.ts](file:///f:/Bacancy/documind-answers/src/lib/authFetch.ts) | Auto-injects JWT, auto-logout on 401 |
| [Login.tsx](file:///f:/Bacancy/documind-answers/src/pages/Login.tsx) | Google Sign-In page |
| [ProtectedRoute.tsx](file:///f:/Bacancy/documind-answers/src/components/auth/ProtectedRoute.tsx) | Auth guard component |

### Modified Files
| File | Change |
|------|--------|
| [config.ts](file:///f:/Bacancy/documind-answers/src/config.ts) | Added `GOOGLE_CLIENT_ID` from env |
| [App.tsx](file:///f:/Bacancy/documind-answers/src/App.tsx) | GoogleOAuthProvider, `/login` route, ProtectedRoute |
| [useAppStore.ts](file:///f:/Bacancy/documind-answers/src/store/useAppStore.ts) | [user](file:///f:/Bacancy/documind-answers/server/app/services/document/document_service.py#159-162), `accessToken`, [setAuth()](file:///f:/Bacancy/documind-answers/src/store/useAppStore.ts#268-270), [logout()](file:///f:/Bacancy/documind-answers/src/store/useAppStore.ts#270-271) |
| [documents.ts](file:///f:/Bacancy/documind-answers/src/api/documents.ts) | Uses [authFetch](file:///f:/Bacancy/documind-answers/src/lib/authFetch.ts#4-28), removed hardcoded [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) |
| [chat.ts](file:///f:/Bacancy/documind-answers/src/api/chat.ts) | Uses [authFetch](file:///f:/Bacancy/documind-answers/src/lib/authFetch.ts#4-28), removed `userId` param |
| [quiz.ts](file:///f:/Bacancy/documind-answers/src/api/quiz.ts) | Uses [authFetch](file:///f:/Bacancy/documind-answers/src/lib/authFetch.ts#4-28), removed [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) |
| [Sidebar.tsx](file:///f:/Bacancy/documind-answers/src/components/layout/Sidebar.tsx) | User avatar + logout button |

## Verification

- ✅ `tsc --noEmit` — zero TypeScript errors
- ✅ No [user_id](file:///f:/Bacancy/documind-answers/server/app/core/dependencies.py#18-45) or `default_user` references remain in frontend
- ✅ `python-jose` + `@react-oauth/google` installed
- ✅ PDF file/status endpoints remain unauthenticated (react-pdf compatible)
