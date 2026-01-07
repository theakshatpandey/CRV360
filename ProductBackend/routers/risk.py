from fastapi import APIRouter
# ✅ Safe Imports
from database import (
    risk_summary_col,
    risk_posture_col,
    risk_category_breakdown_col,
    risk_business_units_col,
    risk_internal_drivers_col,
    risk_external_drivers_col,
    risk_recommendations_col
)

router = APIRouter(prefix="/api/risk", tags=["risk"])

@router.get("/summary")
async def risk_summary():
    data = risk_summary_col.find_one({}, {"_id": False})
    return data or {}

@router.get("/posture")
async def risk_posture():
    data = risk_posture_col.find_one({}, {"_id": False})
    return data or {"categories": []}

@router.get("/category-breakdown")
async def category_breakdown():
    data = risk_category_breakdown_col.find_one({}, {"_id": False})
    return data or {"breakdown": []}

@router.get("/business-units")
async def business_units():
    units = list(risk_business_units_col.find({}, {"_id": False}))
    return {"units": units}

@router.get("/internal-drivers")
async def internal_drivers():
    drivers = list(risk_internal_drivers_col.find({}, {"_id": False}).sort("rank", 1))
    return {"drivers": drivers}

@router.get("/external-drivers")
async def external_drivers():
    drivers = list(risk_external_drivers_col.find({}, {"_id": False}).sort("rank", 1))
    return {"drivers": drivers}

@router.get("/recommendations")
async def recommendations():
    recs = list(risk_recommendations_col.find({}, {"_id": False}))
    return {"recommendations": recs}