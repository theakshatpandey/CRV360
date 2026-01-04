from fastapi import APIRouter
from database import db  # ✅ centralized import
from core.org_context import get_current_org


router = APIRouter()

@router.get("/vulnerabilities/summary")
async def get_vuln_summary():
    summary = db["vuln_summary"].find_one({}, {"_id": 0})
    return summary or {}

@router.get("/vulnerabilities/active-threats")
async def get_active_threats():
    threats = list(db["active_threats"].find({}, {"_id": 0}))
    return {"threats": threats}

@router.get("/vulnerabilities/severity-distribution")
async def get_severity_distribution():
    dist = list(db["vuln_severity_distribution"].find({}, {"_id": 0}))
    return {"distribution": dist}

@router.get("/vulnerabilities/patch-velocity")
async def get_patch_velocity():
    velocity = db["patch_velocity"].find_one({}, {"_id": 0, "data": 0})
    trend = list(db["patch_velocity"].find({}, {"_id": 0, "date": 0, "total_30d": 0, "avg_daily": 0}))
    return {"summary": velocity, "trend": trend}

@router.get("/vulnerabilities/inventory")
async def get_vuln_inventory():
    vulns = list(db["vulnerabilities"].find({}, {"_id": 0}))
    return {"vulnerabilities": vulns}