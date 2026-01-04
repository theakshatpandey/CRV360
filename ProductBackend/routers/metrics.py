from fastapi import APIRouter, HTTPException
from database import db  # ✅ centralized import
from core.org_context import get_current_org


# matches frontend calls like /api/metrics/..., /api/calendar/...
router = APIRouter(prefix="/api", tags=["Dashboard Metrics"])

@router.get("/metrics/key")
async def get_key_metrics():
    try:
        metrics_collection = db["metrics"]
        
        # Get all documents
        metrics = list(metrics_collection.find({}, {"_id": 0}))
        
        # Convert to dictionary keyed by type
        result = {}
        for m in metrics:
            result[m.get("type", "unknown")] = m
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/operational")
async def get_operational_indicators():
    try:
        collection = db["operational_indicators"]
        indicators = list(collection.find({}, {"_id": 0}))
        
        result = {}
        for i in indicators:
            result[i.get("type", "unknown")] = i
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/trends/5days")
async def get_5day_trends():
    try:
        collection = db["daily_trends"]
        trends = list(collection.find({}, {"_id": 0}).sort("date", 1))
        return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar/upcoming")
async def get_upcoming_events():
    try:
        collection = db["calendar_events"]
        # Sort by date, limit to 6
        events = list(collection.find({}, {"_id": 0}).sort("date", 1).limit(6))
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/module-health")
async def get_module_health():
    try:
        collection = db["module_health"]
        health = list(collection.find({}, {"_id": 0}).sort("name", 1))
        return {"modules": health}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/alerts/today")
async def get_today_alerts():
    try:
        collection = db["daily_alerts"]
        alert = collection.find_one({}, {"_id": 0})
        
        # Fallback if DB is empty (keeps dashboard alive)
        if not alert:
            return {"critical": 12, "high": 34, "medium": 67, "low": 43, "total": 156}
            
        return alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risks/top")
async def get_top_risks():
    try:
        collection = db["top_risks"]
        risks = list(collection.find({}, {"_id": 0}).limit(3))
        return {"risks": risks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))