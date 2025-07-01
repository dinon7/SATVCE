"""
VCE Career Guidance System - Backend Application

This module serves as the main entry point for the VCE Career Guidance System backend.
It implements a FastAPI application with comprehensive error handling, logging,
security features, and user-centred design principles.

Key Features:
- Secure API endpoints with proper authentication
- Comprehensive error handling and logging
- Clear and concise code structure
- Detailed internal documentation
- Efficient request processing
- Robust validation
- User-centred design implementation
- Transaction pooler integration for high-availability data operations
"""

import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
from typing import Dict, Any
import os
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="VCE Career Guidance System",
    description="Backend API for the VCE Career Guidance System with Transaction Pooler",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Transaction Pooler Lifecycle Management
@app.on_event("startup")
async def startup_event():
    """Initialize transaction pooler on application startup"""
    try:
        from services.transaction_pooler import initialize_transaction_pooler
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        redis_url = os.getenv("REDIS_URL")  # Optional Redis for caching
        
        if supabase_url and supabase_key:
            await initialize_transaction_pooler(supabase_url, supabase_key, redis_url)
            logger.info("Transaction pooler initialized successfully")
        else:
            logger.warning("Supabase credentials not found - transaction pooler not initialized")
            
    except Exception as e:
        logger.error(f"Failed to initialize transaction pooler: {e}")
        # Continue without pooler - fallback to direct Supabase calls

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown transaction pooler on application shutdown"""
    try:
        from services.transaction_pooler import shutdown_transaction_pooler
        await shutdown_transaction_pooler()
        logger.info("Transaction pooler shutdown successfully")
    except Exception as e:
        logger.error(f"Error during transaction pooler shutdown: {e}")

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware to track request processing time and log request details.
    
    Args:
        request: The incoming request
        call_next: The next middleware or route handler
        
    Returns:
        Response with added processing time header
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Log request details
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"Status: {response.status_code} "
        f"Time: {process_time:.3f}s"
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions with proper logging and user-friendly responses.
    
    Args:
        request: The request that caused the exception
        exc: The HTTP exception
        
    Returns:
        JSONResponse with error details
    """
    logger.error(f"HTTP Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle validation errors with detailed feedback.
    
    Args:
        request: The request that caused the validation error
        exc: The validation error
        
    Returns:
        JSONResponse with validation error details
    """
    logger.error(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "details": exc.errors(),
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions with proper logging and user-friendly responses.
    
    Args:
        request: The request that caused the exception
        exc: The unexpected exception
        
    Returns:
        JSONResponse with error details
    """
    logger.error(f"Unexpected Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
            "path": request.url.path
        }
    )

# Enhanced health check endpoint with pooler status
@app.get("/api/health", tags=["System"])
async def health_check() -> Dict[str, Any]:
    """
    Enhanced health check endpoint to verify system status including transaction pooler.
    
    Returns:
        Dict containing system status information
    """
    try:
        # Get basic system status
        system_status = {
            "status": "healthy",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "timestamp": time.time()
        }
        
        # Check transaction pooler status
        try:
            from services.transaction_pooler import get_transaction_pooler
            pooler = await get_transaction_pooler()
            pooler_status = await pooler.get_pool_status()
            
            system_status["transaction_pooler"] = {
                "status": "healthy" if pooler_status["running"] else "unhealthy",
                "running": pooler_status["running"],
                "circuit_breaker_state": pooler_status["circuit_breaker_state"],
                "queue_size": pooler_status["queue_size"],
                "active_transactions": pooler_status["active_transactions"]
            }
            
            # Update overall status if pooler is unhealthy
            if not pooler_status["running"]:
                system_status["status"] = "degraded"
                
        except Exception as e:
            logger.warning(f"Transaction pooler health check failed: {e}")
            system_status["transaction_pooler"] = {
                "status": "unavailable",
                "error": str(e)
            }
            system_status["status"] = "degraded"
        
        return system_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "timestamp": time.time()
        }

# Import and include routers
from routers import auth, users, careers, courses, subjects, quiz, saved_items, resources, tags

# Core application routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(careers.router, prefix="/api/careers", tags=["Careers"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(subjects.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])

# Enhanced data routers with transaction pooler
app.include_router(saved_items.router, prefix="/api/saved-items", tags=["Saved Items"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])

# Health check router
try:
    from routers import health
    app.include_router(health.router, prefix="/api", tags=["Health"])
    logger.info("Health check routes included")
except ImportError as e:
    logger.warning(f"Health check routes not available: {e}")

# Transaction pooler monitoring routes
try:
    from routers import pooler_monitor
    app.include_router(pooler_monitor.router, tags=["Pooler Monitor"])
    logger.info("Transaction pooler monitoring routes included")
except ImportError as e:
    logger.warning(f"Transaction pooler monitoring routes not available: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 