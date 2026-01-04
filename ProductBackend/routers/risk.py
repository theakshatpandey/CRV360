from fastapi import APIRouter
from core.org_context import get_current_org
from database import db  # ✅ centralized import

router = APIRouter(prefix="/api/risk", tags=["risk"])

@router.get("/summary")
async def risk_summary():
    data = db.risk_summary.find_one({}, {"_id": False})
    return data or {}

@router.get("/posture")
async def risk_posture():
    data = db.risk_posture.find_one({}, {"_id": False})
    return data or {"categories": []}

@router.get("/category-breakdown")
async def category_breakdown():
    data = db.risk_category_breakdown.find_one({}, {"_id": False})
    return data or {"breakdown": []}

@router.get("/business-units")
async def business_units():
    units = list(db.risk_business_units.find({}, {"_id": False}))
    return {"units": units}

@router.get("/internal-drivers")
async def internal_drivers():
    drivers = list(db.risk_internal_drivers.find({}, {"_id": False}).sort("rank", 1))
    return {"drivers": drivers}

@router.get("/external-drivers")
async def external_drivers():
    drivers = list(db.risk_external_drivers.find({}, {"_id": False}).sort("rank", 1))
    return {"drivers": drivers}

@router.get("/recommendations")
async def recommendations():
    recs = list(db.risk_recommendations.find({}, {"_id": False}))
    return {"recommendations": recs}