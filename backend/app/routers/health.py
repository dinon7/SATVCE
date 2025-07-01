"""
Health check router for monitoring transaction pooler and system status.

This router provides endpoints for:
- Pooler health status
- Performance metrics
- System availability
- Database connectivity
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
from ..services.enhanced_supabase_service import get_enhanced_supabase_service
from ..services.transaction_pooler import get_transaction_pooler

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    try:
        return {
            "status": "healthy",
            "service": "VCE Career Guidance Backend",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@router.get("/pooler")
async def pooler_health_check() -> Dict[str, Any]:
    """Check transaction pooler health status"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_status()
        
        return {
            "status": "healthy" if status["is_healthy"] else "unhealthy",
            "pooler_status": status,
            "active_connections": status.get("active_connections", 0),
            "queue_size": status.get("queue_size", 0),
            "response_time_ms": status.get("avg_response_time", 0)
        }
    except Exception as e:
        logger.error(f"Pooler health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "pooler_status": None,
            "active_connections": 0,
            "queue_size": 0,
            "response_time_ms": 0
        }

@router.get("/database")
async def database_health_check() -> Dict[str, Any]:
    """Check database connectivity through enhanced service"""
    try:
        enhanced_service = await get_enhanced_supabase_service()
        health_data = await enhanced_service.health_check()
        
        return {
            "status": "healthy" if health_data["is_healthy"] else "unhealthy",
            "database_status": health_data,
            "connection_pool": health_data.get("connection_pool", {}),
            "last_check": health_data.get("timestamp")
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "database_status": None,
            "connection_pool": {},
            "last_check": None
        }

@router.get("/performance")
async def performance_metrics() -> Dict[str, Any]:
    """Get performance metrics from pooler and database"""
    try:
        # Get pooler metrics
        pooler = await get_transaction_pooler()
        pooler_metrics = await pooler.get_performance_metrics()
        
        # Get enhanced service metrics
        enhanced_service = await get_enhanced_supabase_service()
        service_metrics = await enhanced_service.get_performance_metrics()
        
        return {
            "pooler_metrics": pooler_metrics,
            "service_metrics": service_metrics,
            "overall_performance": {
                "avg_response_time_ms": pooler_metrics.get("avg_response_time", 0),
                "throughput_ops_per_sec": pooler_metrics.get("throughput", 0),
                "error_rate_percent": pooler_metrics.get("error_rate", 0),
                "connection_utilization": pooler_metrics.get("connection_utilization", 0)
            }
        }
    except Exception as e:
        logger.error(f"Performance metrics check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get performance metrics: {str(e)}")

@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Comprehensive health check including all components"""
    try:
        # Check pooler health
        pooler_health = await pooler_health_check()
        
        # Check database health
        db_health = await database_health_check()
        
        # Get performance metrics
        performance = await performance_metrics()
        
        # Determine overall health
        overall_healthy = (
            pooler_health["status"] == "healthy" and 
            db_health["status"] == "healthy"
        )
        
        return {
            "status": "healthy" if overall_healthy else "unhealthy",
            "components": {
                "pooler": pooler_health,
                "database": db_health
            },
            "performance": performance,
            "timestamp": pooler_health.get("pooler_status", {}).get("timestamp")
        }
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "components": {
                "pooler": {"status": "unknown"},
                "database": {"status": "unknown"}
            },
            "performance": {},
            "timestamp": None
        } 