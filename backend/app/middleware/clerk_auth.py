from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.supabase_service import supabase_service
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

# List of public endpoints that don't require authentication
PUBLIC_ENDPOINTS = [
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/health",
    "/",
    "/api/v1/auth/register",
    "/api/v1/auth/clerk-webhook",
    "/api/v1/quiz",
    "/api/v1/subjects",
    "/api/v1/careers",
    "/api/v1/courses",
    "/api/resources"
]

async def verify_clerk_token(request: Request) -> dict:
    """Verify Clerk token from request header using Supabase"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid token")
        
        token = auth_header.split(" ")[1]
        
        # Use Supabase service to verify Clerk token
        user_data = await supabase_service.verify_clerk_token(token)
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get additional user info from Supabase if needed
        clerk_user_id = user_data.get('sub')
        if clerk_user_id:
            try:
                user_response = supabase_service.client.table('users').select('*').eq('clerk_user_id', clerk_user_id).single()
                if user_response.data:
                    # Merge Supabase user data with Clerk token data
                    user_data.update({
                        'clerk_user_id': clerk_user_id,
                        'supabase_user': user_response.data
                    })
            except Exception as e:
                logger.warning(f"Could not fetch user data from Supabase: {str(e)}")
        
        return user_data
            
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

class ClerkAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public endpoints
        if any(request.url.path.startswith(endpoint) for endpoint in PUBLIC_ENDPOINTS):
            return await call_next(request)

        try:
            # Verify token and add user info to request state
            user = await verify_clerk_token(request)
            request.state.user = user
            return await call_next(request)
        except HTTPException as e:
            return e

# Dependency for FastAPI routes
async def get_current_user(request: Request) -> dict:
    """Get current user from request state"""
    if not hasattr(request.state, 'user'):
        raise HTTPException(status_code=401, detail="User not authenticated")
    return request.state.user 