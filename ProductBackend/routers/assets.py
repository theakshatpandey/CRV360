from fastapi import APIRouter
from database import db
from core.org_context import get_current_org

router = APIRouter(prefix="/api/assets", tags=["Assets"])

assets = db["assets"]

# -----------------------------
# 1️⃣ ASSET SUMMARY
# -----------------------------
@router.get("/summary")
async def get_asset_summary():
    org = get_current_org()

    query = {"org_id": org["org_id"]}

    total = assets.count_documents(query)

    critical_actions = assets.count_documents({
        **query,
        "exposure_level": "Critical"
    })

    avg_risk_cursor = assets.aggregate([
        {"$match": query},
        {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
    ])
    avg_risk = list(avg_risk_cursor)[0]["avg"] if total > 0 else 0

    compliant = assets.count_documents({
        **query,
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
# 2️⃣ ASSET DISTRIBUTION
# -----------------------------
@router.get("/distribution")
async def get_asset_distribution():
    org = get_current_org()

    pipeline = [
        {"$match": {"org_id": org["org_id"]}},
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
# 3️⃣ TOP RISK ASSETS
# -----------------------------
@router.get("/top-risk")
async def get_top_risk_assets():
    org = get_current_org()

    cursor = assets.find(
        {"org_id": org["org_id"]},
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
# 4️⃣ ASSET INVENTORY
# -----------------------------
@router.get("")
async def get_asset_inventory():
    org = get_current_org()

    cursor = assets.find(
        {"org_id": org["org_id"]},
        {"_id": 0}
    )

    return {"assets": list(cursor)}
