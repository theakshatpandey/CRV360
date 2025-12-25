from fastapi import APIRouter
from database import db

router = APIRouter()

@router.get("/assets/summary")
async def get_asset_summary():
    assets = db["assets"]
    total = assets.count_documents({})
    critical_actions = assets.count_documents({"exposure_level": "Critical"})
    avg_risk = list(assets.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
    ]))[0]["avg"] if total > 0 else 0
    compliance_rate = round((assets.count_documents({"compliance_status": "Compliant"}) / total) * 100, 1) if total > 0 else 0

    return {
        "total_assets": total,
        "critical_actions": critical_actions,
        "avg_risk_score": round(avg_risk, 1),
        "compliance_rate": compliance_rate
    }

@router.get("/assets/distribution")
async def get_asset_distribution():
    collection = db["asset_categories"]
    return list(collection.find({}, {"_id": 0}))

@router.get("/assets/top-risk")
async def get_top_risk_assets():
    collection = db["risky_assets"]
    return list(collection.find({}, {"_id": 0}).limit(3))

@router.get("/assets/inventory")
async def get_asset_inventory():
    collection = db["assets"]
    return list(collection.find({}, {"_id": 0}))