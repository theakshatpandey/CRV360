from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/metrics/key")
async def get_key_metrics():
    metrics_collection = db["metrics"]
    
    # Get all documents from the metrics collection
    metrics = list(metrics_collection.find({}, {"_id": 0}))
    
    # Convert to a dictionary keyed by type for easy frontend use
    result = {}
    for m in metrics:
        result[m["type"]] = m
    
    return result

@router.get("/metrics/operational")
async def get_operational_indicators():
    collection = db["operational_indicators"]
    indicators = list(collection.find({}, {"_id": 0}))
    result = {}
    for i in indicators:
        result[i["type"]] = i
    return result

@router.get("/metrics/trends/5days")
async def get_5day_trends():
    collection = db["daily_trends"]
    trends = list(collection.find({}, {"_id": 0}).sort("date", 1))
    return {"trends": trends}

@router.get("/calendar/upcoming")
async def get_upcoming_events():
    collection = db["calendar_events"]
    events = list(collection.find({}, {"_id": 0}).sort("date", 1).limit(6))
    return {"events": events}

@router.get("/metrics/module-health")
async def get_module_health():
    collection = db["module_health"]
    health = list(collection.find({}, {"_id": 0}).sort("name", 1))
    return {"modules": health}

@router.get("/metrics/alerts/today")
async def get_today_alerts():
    collection = db["daily_alerts"]
    alert = collection.find_one({}, {"_id": 0})
    if not alert:
        return {"critical": 12, "high": 34, "medium": 67, "low": 43, "total": 156}
    return alert

@router.get("/risks/top")
async def get_top_risks():
    collection = db["top_risks"]
    risks = list(collection.find({}, {"_id": 0}).limit(3))
    return {"risks": risks}