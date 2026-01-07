from fastapi import APIRouter, HTTPException
# ✅ Safe Imports
from database import (
    metrics_collection,
    operational_indicators,
    daily_trends,
    calendar_events,
    module_health,
    daily_alerts,
    top_risks
)
from core.org_context import get_current_org

router = APIRouter(prefix="/api", tags=["Dashboard Metrics"])

@router.get("/metrics/key")
async def get_key_metrics():
    try:
        metrics = list(metrics_collection.find({}, {"_id": 0}))
        result = {}
        for m in metrics:
            result[m.get("type", "unknown")] = m
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/operational")
async def get_operational_indicators():
    try:
        indicators = list(operational_indicators.find({}, {"_id": 0}))
        result = {}
        for i in indicators:
            result[i.get("type", "unknown")] = i
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/trends/5days")
async def get_5day_trends():
    try:
        trends = list(daily_trends.find({}, {"_id": 0}).sort("date", 1))
        return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar/upcoming")
async def get_upcoming_events():
    try:
        events = list(calendar_events.find({}, {"_id": 0}).sort("date", 1).limit(6))
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/module-health")
async def get_module_health():
    try:
        health = list(module_health.find({}, {"_id": 0}).sort("name", 1))
        return {"modules": health}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/alerts/today")
async def get_today_alerts():
    try:
        alert = daily_alerts.find_one({}, {"_id": 0})
        if not alert:
            return {"critical": 12, "high": 34, "medium": 67, "low": 43, "total": 156}
        return alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risks/top")
async def get_top_risks():
    try:
        risks = list(top_risks.find({}, {"_id": 0}).limit(3))
        return {"risks": risks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))