from fastapi import APIRouter
from database import db
from services.org_context import get_current_org

router = APIRouter(prefix="/api/assets", tags=["Assets"])

assets = db["assets"]

# -----------------------------
# 1️⃣ ASSET SUMMARY (Executive KPIs)
# -----------------------------
@router.get("/summary")
async def get_asset_summary():
    org_id = get_current_org()

    total = assets.count_documents({
        "org_id": org_id
    })

    critical_actions = assets.count_documents({
        "org_id": org_id,
        "exposure_level": "Critical"
    })

    avg_risk_cursor = assets.aggregate([
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
    ])

    avg_risk_result = list(avg_risk_cursor)
    avg_risk = avg_risk_result[0]["avg"] if avg_risk_result else 0

    compliant = assets.count_documents({
        "org_id": org_id,
        "compliance_status": "Compliant"
    })

    compliance_rate = round((compliant / total) * 100, 1) if total > 0 else 0

    return {
        "total_assets": total,
        "critical_actions": critical_actions,
        "avg_risk_score": round(avg_risk, 1),
        "compliance_rate": compliance_rate
    }


# -----------------------------
# 2️⃣ ASSET DISTRIBUTION (Charts)
# -----------------------------
@router.get("/distribution")
async def get_asset_distribution():
    org_id = get_current_org()

    pipeline = [
        {"$match": {"org_id": org_id}},
        {
            "$group": {
                "_id": "$asset_type",
                "total": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "category": "$_id",
                "total": 1
            }
        }
    ]

    return list(assets.aggregate(pipeline))


# -----------------------------
# 3️⃣ TOP RISK ASSETS (CISO Focus)
# -----------------------------
@router.get("/top-risk")
async def get_top_risk_assets():
    org_id = get_current_org()

    cursor = assets.find(
        {"org_id": org_id},
        {
            "_id": 0,
            "asset_name": 1,
            "risk_score": 1,
            "business_unit": 1,
            "criticality": 1,
            "exposure_level": 1,
            "compliance_status": 1
        }
    ).sort("risk_score", -1).limit(3)

    return list(cursor)


# -----------------------------
# 4️⃣ ASSET INVENTORY (Table)
# -----------------------------
@router.get("")
async def get_asset_inventory():
    org_id = get_current_org()

    cursor = assets.find(
        {"org_id": org_id},
        {"_id": 0}
    )

    return {
        "assets": list(cursor)
    }
