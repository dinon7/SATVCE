"""
main.py - FastAPI application entry point for VCE Career Guidance backend.

- Purpose: Defines the FastAPI app, configures middleware, and includes all routers.
- Major components: App setup, CORS, middleware, router inclusion, and basic endpoints.
- Variable scope: Uses global constants for config, local variables within endpoints, and avoids unnecessary globals.
"""

API_VERSION = "v1"  # Global constant for API version

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .middleware.auth import auth_middleware
from .services.supabase_service import supabase_service
from .services.integration_service import integration_service
from .core.config import settings
from .routers import users, auth, quiz, subjects, careers, courses, reports, admin, resources, ai, saved_items
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/api/{API_VERSION}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add auth middleware
app.middleware("http")(auth_middleware)

# Include routers with proper prefixes
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"])
app.include_router(quiz.router, prefix=f"{settings.API_V1_STR}/quiz", tags=["quiz"])
app.include_router(subjects.router, prefix=settings.API_V1_STR, tags=["subjects"])
app.include_router(careers.router, prefix=settings.API_V1_STR, tags=["careers"])
app.include_router(courses.router, prefix=settings.API_V1_STR, tags=["courses"])
app.include_router(reports.router, prefix=settings.API_V1_STR, tags=["reports"])
app.include_router(admin.router, prefix=settings.API_V1_STR, tags=["admin"])
app.include_router(resources.router, prefix=settings.API_V1_STR, tags=["resources"])
app.include_router(ai.router, prefix=settings.API_V1_STR, tags=["ai"])
app.include_router(saved_items.router, prefix=settings.API_V1_STR, tags=["saved-items"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy"}

@app.get("/docs")
async def docs():
    """Redirect to API documentation"""
    return {"message": "API documentation available at /docs"}

@app.get("/api/health")
async def api_health_check():
    """API health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/health/detailed")
async def detailed_health_check():
    """Detailed health check for all services"""
    try:
        health_data = await integration_service.health_check_all_services()
        return health_data
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/api/integration/health")
async def integration_health():
    """Integration service health check"""
    try:
        return await integration_service.health_check_all_services()
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/integration/status")
async def integration_status():
    """Integration service status"""
    try:
        return await integration_service.get_service_status()
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/api/user/profile")
async def get_user_profile(request: Request):
    """Get user profile using Clerk user ID"""
    clerk_user_id = request.state.user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        # Get user profile from Supabase
        user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        return user
    except Exception as e:
        logger.error(f"Error getting profile for user {clerk_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting profile: {str(e)}")

@app.post("/api/user/profile")
async def update_user_profile(request: Request, data: dict):
    """Update user profile using Clerk user ID"""
    clerk_user_id = request.state.user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        # Get user first to get the ID
        user = await supabase_service.get_user_by_clerk_id(clerk_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user profile in Supabase
        updated_user = await supabase_service.update_user(user['id'], data)
        return {"status": "success", "user": updated_user}
    except Exception as e:
        logger.error(f"Error updating profile for user {clerk_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.get("/api/user/preferences")
async def get_user_preferences(request: Request):
    """Get user preferences using Clerk user ID"""
    clerk_user_id = request.state.user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        preferences = await supabase_service.get_user_preferences(clerk_user_id)
        return preferences
    except Exception as e:
        logger.error(f"Error getting preferences for user {clerk_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting preferences: {str(e)}")

@app.put("/api/user/preferences")
async def update_user_preferences(request: Request, data: dict):
    """Update user preferences using Clerk user ID"""
    clerk_user_id = request.state.user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        preferences = await supabase_service.update_user_preferences(clerk_user_id, data)
        return preferences
    except Exception as e:
        logger.error(f"Error updating preferences for user {clerk_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating preferences: {str(e)}")

@app.get("/api/user/dashboard")
async def get_user_dashboard(request: Request):
    """Get comprehensive dashboard data for user"""
    clerk_user_id = request.state.user.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="User ID not found")
    
    try:
        dashboard_data = await integration_service.get_user_dashboard_data(clerk_user_id)
        return dashboard_data
    except Exception as e:
        logger.error(f"Error getting dashboard for user {clerk_user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting dashboard: {str(e)}")

@app.get("/api/resources")
async def get_resources(tags: list = None):
    """Get resources from Supabase"""
    try:
        # Get resources from Supabase
        resources = await supabase_service.get_all_resources()
        if tags:
            # Filter by tags if provided
            filtered_resources = []
            for resource in resources:
                resource_tags = resource.get('tags', [])
                if any(tag in resource_tags for tag in tags):
                    filtered_resources.append(resource)
            return filtered_resources
        return resources
    except Exception as e:
        logger.error(f"Error getting resources: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting resources: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return {
        "error": "Internal server error",
        "detail": "An unexpected error occurred",
        "status_code": 500
    } 