"""
Transaction Pooler Monitor API Routes

This module provides API endpoints for monitoring and managing the transaction pooler:
- Health checks and status monitoring
- Performance metrics and analytics
- Pooler configuration and management
- Transaction status and history
- Real-time monitoring dashboard data
- Alerting and notifications
- Pooler lifecycle management

Key Features:
- Real-time monitoring
- Performance analytics
- Health status reporting
- Configuration management
- Transaction tracking
- Alert management
- Dashboard data
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, UTC
from ..services.transaction_pooler import get_transaction_pooler, TransactionPooler
from ..services.enhanced_supabase_service import get_enhanced_supabase_service, EnhancedSupabaseService
from ..middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/pooler", tags=["pooler-monitor"])

@router.get("/health")
async def get_pooler_health():
    """Get transaction pooler health status"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_pool_status()
        
        return {
            "status": "healthy" if status["running"] else "unhealthy",
            "pooler_status": status,
            "timestamp": datetime.now(UTC).isoformat(),
            "service": "transaction_pooler"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(UTC).isoformat(),
            "service": "transaction_pooler"
        }

@router.get("/metrics")
async def get_pooler_metrics():
    """Get detailed performance metrics"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_pool_status()
        
        # Calculate additional metrics
        total_requests = status["metrics"]["total_transactions"]
        successful_requests = status["metrics"]["successful_transactions"]
        failed_requests = status["metrics"]["failed_transactions"]
        
        success_rate = (successful_requests / total_requests * 100) if total_requests > 0 else 0
        failure_rate = (failed_requests / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "performance_metrics": {
                "total_transactions": total_requests,
                "successful_transactions": successful_requests,
                "failed_transactions": failed_requests,
                "success_rate_percent": round(success_rate, 2),
                "failure_rate_percent": round(failure_rate, 2),
                "avg_response_time_ms": round(status["metrics"]["avg_response_time"] * 1000, 2),
                "error_rate": status["metrics"]["error_rate"],
                "active_connections": status["metrics"]["active_connections"],
                "queue_size": status["queue_size"],
                "active_transactions": status["active_transactions"],
            },
            "circuit_breaker": {
                "state": status["circuit_breaker_state"],
                "error_counts": status["error_counts"]
            },
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")

@router.get("/status")
async def get_pooler_status():
    """Get comprehensive pooler status"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_pool_status()
        
        return {
            "pooler_status": status,
            "enhanced_service_status": await get_enhanced_service_status(),
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.get("/transactions/{transaction_id}")
async def get_transaction_status(transaction_id: str):
    """Get status of a specific transaction"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_transaction_status(transaction_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {
            "transaction_id": transaction_id,
            "status": status,
            "timestamp": datetime.now(UTC).isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting transaction status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get transaction status: {str(e)}")

@router.delete("/transactions/{transaction_id}")
async def cancel_transaction(transaction_id: str):
    """Cancel a pending transaction"""
    try:
        pooler = await get_transaction_pooler()
        success = await pooler.cancel_transaction(transaction_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Transaction not found or cannot be cancelled")
        
        return {
            "transaction_id": transaction_id,
            "status": "cancelled",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling transaction: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel transaction: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_data():
    """Get dashboard data for monitoring"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_pool_status()
        
        # Calculate real-time metrics
        total_requests = status["metrics"]["total_transactions"]
        successful_requests = status["metrics"]["successful_transactions"]
        failed_requests = status["metrics"]["failed_transactions"]
        
        success_rate = (successful_requests / total_requests * 100) if total_requests > 0 else 0
        
        # Determine health status
        health_status = "healthy"
        if status["circuit_breaker_state"] == "open":
            health_status = "critical"
        elif status["metrics"]["error_rate"] > 0.1:  # 10% error rate
            health_status = "warning"
        elif status["queue_size"] > 100:  # High queue
            health_status = "warning"
        
        return {
            "health_status": health_status,
            "real_time_metrics": {
                "total_transactions": total_requests,
                "success_rate_percent": round(success_rate, 2),
                "avg_response_time_ms": round(status["metrics"]["avg_response_time"] * 1000, 2),
                "active_connections": status["metrics"]["active_connections"],
                "queue_size": status["queue_size"],
                "active_transactions": status["active_transactions"],
            },
            "circuit_breaker": {
                "state": status["circuit_breaker_state"],
                "error_counts": status["error_counts"]
            },
            "alerts": generate_alerts(status),
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

@router.post("/restart")
async def restart_pooler(background_tasks: BackgroundTasks):
    """Restart the transaction pooler"""
    try:
        pooler = await get_transaction_pooler()
        
        # Schedule restart in background
        background_tasks.add_task(restart_pooler_task)
        
        return {
            "message": "Pooler restart initiated",
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Error restarting pooler: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to restart pooler: {str(e)}")

@router.get("/config")
async def get_pooler_config():
    """Get current pooler configuration"""
    try:
        pooler = await get_transaction_pooler()
        
        return {
            "configuration": {
                "max_concurrent_transactions": pooler.max_concurrent_transactions,
                "batch_size": pooler.batch_size,
                "retry_delays": pooler.retry_delays,
                "health_check_interval": pooler.health_check_interval,
                "metrics_interval": pooler.metrics_interval,
                "max_connections": pooler.connection_pool.max_connections,
                "max_keepalive": pooler.connection_pool.max_keepalive,
                "circuit_breaker_failure_threshold": pooler.circuit_breaker.failure_threshold,
                "circuit_breaker_recovery_timeout": pooler.circuit_breaker.recovery_timeout,
            },
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting config: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get config: {str(e)}")

@router.get("/alerts")
async def get_alerts():
    """Get current alerts and warnings"""
    try:
        pooler = await get_transaction_pooler()
        status = await pooler.get_pool_status()
        
        alerts = generate_alerts(status)
        
        return {
            "alerts": alerts,
            "timestamp": datetime.now(UTC).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

# Helper functions
async def get_enhanced_service_status() -> Dict[str, Any]:
    """Get enhanced service status"""
    try:
        service = await get_enhanced_supabase_service()
        health = await service.health_check()
        return health
    except Exception as e:
        logger.error(f"Error getting enhanced service status: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now(UTC).isoformat()
        }

def generate_alerts(status: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate alerts based on pooler status"""
    alerts = []
    
    # Circuit breaker alerts
    if status["circuit_breaker_state"] == "open":
        alerts.append({
            "level": "critical",
            "message": "Circuit breaker is OPEN - service is failing",
            "timestamp": datetime.now(UTC).isoformat()
        })
    
    # Error rate alerts
    if status["metrics"]["error_rate"] > 0.1:  # 10% error rate
        alerts.append({
            "level": "warning",
            "message": f"High error rate: {status['metrics']['error_rate']:.2%}",
            "timestamp": datetime.now(UTC).isoformat()
        })
    
    # Queue size alerts
    if status["queue_size"] > 100:
        alerts.append({
            "level": "warning",
            "message": f"Large transaction queue: {status['queue_size']} pending",
            "timestamp": datetime.now(UTC).isoformat()
        })
    
    # Response time alerts
    if status["metrics"]["avg_response_time"] > 5.0:  # 5 seconds
        alerts.append({
            "level": "warning",
            "message": f"Slow response time: {status['metrics']['avg_response_time']:.2f}s",
            "timestamp": datetime.now(UTC).isoformat()
        })
    
    # Connection alerts
    if status["metrics"]["active_connections"] > status["metrics"]["total_connections"] * 0.8:
        alerts.append({
            "level": "info",
            "message": "High connection usage",
            "timestamp": datetime.now(UTC).isoformat()
        })
    
    return alerts

async def restart_pooler_task():
    """Background task to restart the pooler"""
    try:
        from ..services.transaction_pooler import shutdown_transaction_pooler, initialize_transaction_pooler
        import os
        
        # Shutdown current pooler
        await shutdown_transaction_pooler()
        
        # Wait a moment
        import asyncio
        await asyncio.sleep(2)
        
        # Reinitialize pooler
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        await initialize_transaction_pooler(supabase_url, supabase_key)
        
        logger.info("Pooler restarted successfully")
    except Exception as e:
        logger.error(f"Error in pooler restart task: {e}") 