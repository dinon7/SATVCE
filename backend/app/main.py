from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.auth import FirebaseAuthMiddleware
from app.services.firebase_service import firebase_service
from app.core.config import settings
from app.routers import users, auth, quiz, subjects, careers, courses
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Firebase auth middleware
app.add_middleware(FirebaseAuthMiddleware)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR, tags=["users"])
app.include_router(quiz.router, prefix=settings.API_V1_STR, tags=["quiz"])
app.include_router(subjects.router, prefix=settings.API_V1_STR, tags=["subjects"])
app.include_router(careers.router, prefix=settings.API_V1_STR, tags=["careers"])
app.include_router(courses.router, prefix=settings.API_V1_STR, tags=["courses"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/user/profile")
async def get_user_profile(request: Request):
    user_id = request.state.user["uid"]
    profile = await firebase_service.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.post("/api/user/profile")
async def update_user_profile(request: Request, data: dict):
    user_id = request.state.user["uid"]
    await firebase_service.create_user_profile(user_id, data)
    return {"status": "success"}

@app.get("/api/user/ai-results")
async def get_user_ai_results(request: Request):
    user_id = request.state.user["uid"]
    results = await firebase_service.get_user_ai_results(user_id)
    return results

@app.get("/api/user/career-suggestions")
async def get_career_suggestions(request: Request):
    user_id = request.state.user["uid"]
    suggestions = await firebase_service.get_career_suggestions(user_id)
    return suggestions

@app.get("/api/resources")
async def get_resources(tags: list = None):
    resources = await firebase_service.get_resources(tags)
    return resources 