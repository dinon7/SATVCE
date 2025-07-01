from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from ..services.supabase_service import supabase_service
import logging

logger = logging.getLogger(__name__)

async def verify_clerk_token(id_token: str) -> dict:
    """
    Verify Clerk JWT token with proper error handling.
    
    Args:
        id_token: The Clerk JWT token to verify
        
    Returns:
        Dict containing the decoded token information
        
    Raises:
        HTTPException: If token verification fails
    """
    try:
        decoded_token = await supabase_service.verify_clerk_token(id_token)
        if not decoded_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        logger.info(f"Token verified for user: {decoded_token.get('sub')}")
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def auth_middleware(request: Request, call_next):
    """
    Middleware to handle authentication for protected routes.
    
    This middleware:
    1. Checks for Authorization header
    2. Verifies Clerk JWT token
    3. Adds user information to request state
    4. Handles authentication errors gracefully
    """
    try:
        # Skip authentication for public routes
        public_paths = [
            "/",
            "/docs",
            "/redoc", 
            "/openapi.json",
            "/health",
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/quiz/answers-simple",
            "/api/v1/quiz/follow-up-simple",
            "/api/v1/quiz/generate-results-simple"
        ]
        
        if any(request.url.path.startswith(path) for path in public_paths):
            response = await call_next(request)
            return response
        
        # Get Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid Authorization header"
            )
        
        # Extract token
        token = auth_header.split(" ")[1]
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing token"
            )
        
        # Verify token
        user_data = await verify_clerk_token(token)
        
        # Add user data to request state
        request.state.user = user_data
        
        # Continue with the request
        response = await call_next(request)
        return response
        
    except HTTPException as e:
        # Return HTTP exception as JSON response
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )
    except Exception as e:
        logger.error(f"Authentication middleware error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"}
        )

def get_current_user_from_request(request: Request) -> dict:
    """
    Get current user from request state.
    
    Args:
        request: FastAPI request object
        
    Returns:
        User data from request state
        
    Raises:
        HTTPException: If user not found in request state
    """
    user = getattr(request.state, 'user', None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )
    return user 