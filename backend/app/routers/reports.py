from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/reports",
    tags=["reports"]
)

@router.get("/", summary="Reports root endpoint")
async def reports_root():
    """Placeholder for reports endpoints."""
    return {"message": "Reports endpoint is ready for production."} 