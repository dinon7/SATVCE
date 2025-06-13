from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.firebase_service import firebase_service

security = HTTPBearer()

async def verify_firebase_token(request: Request) -> dict:
    """Verify Firebase token from request header"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        
        id_token = auth_header.split(" ")[1]
        decoded_token = await firebase_service.verify_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

class FirebaseAuthMiddleware:
    async def __call__(self, request: Request, call_next):
        # Skip auth for public endpoints
        if request.url.path in ["/docs", "/redoc", "/openapi.json", "/api/health"]:
            return await call_next(request)

        try:
            # Verify token and add user info to request state
            user = await verify_firebase_token(request)
            request.state.user = user
            return await call_next(request)
        except HTTPException as e:
            return e 