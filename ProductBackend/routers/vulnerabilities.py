from fastapi import APIRouter
# ✅ Safe Imports
from database import (
    vulnerabilities_collection,
    vuln_summary_collection,
    active_threats_collection,
    vuln_severity_dist_collection,
    patch_velocity_collection
)

router = APIRouter()

@router.get("/vulnerabilities/summary")
async def get_vuln_summary():
    summary = vuln_summary_collection.find_one({}, {"_id": 0})
    return summary or {}

@router.get("/vulnerabilities/active-threats")
async def get_active_threats():
    threats = list(active_threats_collection.find({}, {"_id": 0}))
    return {"threats": threats}

@router.get("/vulnerabilities/severity-distribution")
async def get_severity_distribution():
    dist = list(vuln_severity_dist_collection.find({}, {"_id": 0}))
    return {"distribution": dist}

@router.get("/vulnerabilities/patch-velocity")
async def get_patch_velocity():
    velocity = patch_velocity_collection.find_one({}, {"_id": 0, "data": 0})
    trend = list(patch_velocity_collection.find({}, {"_id": 0, "date": 0, "total_30d": 0, "avg_daily": 0}))
    return {"summary": velocity, "trend": trend}

@router.get("/vulnerabilities/inventory")
async def get_vuln_inventory():
    vulns = list(vulnerabilities_collection.find({}, {"_id": 0}))
    return {"vulnerabilities": vulns}