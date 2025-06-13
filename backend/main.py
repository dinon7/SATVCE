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
    description="Backend API for the VCE Career Guidance System",
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

# Health check endpoint
@app.get("/api/health", tags=["System"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify system status.
    
    Returns:
        Dict containing system status information
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Import and include routers
from app.routers import auth, users, careers, resources, quiz

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(careers.router, prefix="/api/careers", tags=["Careers"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 