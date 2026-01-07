from fastapi import APIRouter, HTTPException
from datetime import datetime
from database import assets_collection # ✅ using the safe export from database.py
from core.org_context import get_current_org

router = APIRouter(prefix="/api/assets", tags=["Assets"])

# Alias to keep existing code working
assets = assets_collection

# ---------------------------------------------------
# 🛡️ HELPER: Get Org ID Safely (Defensive)
# ---------------------------------------------------
def _get_org_id():
    org = get_current_org()
    if isinstance(org, dict):
        return org.get("org_id", "org_demo")
    return "org_demo"

# -----------------------------
# 1️⃣ ADD ASSET (MANUAL)
# -----------------------------
@router.post("/")
async def add_asset(asset: dict):
    # ✅ Safe org_id retrieval
    org_id = _get_org_id()

    required_fields = [
        "asset_name",
        "asset_type",
        "business_unit",
        "risk_score",
        "exposure_level",
        "compliance_status"
    ]

    for field in required_fields:
        if field not in asset or asset[field] in [None, ""]:
            raise HTTPException(
                status_code=400,
                detail=f"Missing field: {field}"
            )

    try:
        risk_score = int(asset["risk_score"])
    except Exception:
        raise HTTPException(status_code=400, detail="risk_score must be a number")

    asset_doc = {
        "org_id": org_id,  # ✅ Uses safe variable

        "asset_name": asset["asset_name"],
        "asset_type": asset["asset_type"],              
        "business_unit": asset["business_unit"],

        "risk_score": risk_score,
        "exposure_level": asset["exposure_level"],      
        "compliance_status": asset["compliance_status"],

        "critical_issues": int(asset.get("critical_issues", 0)),
        "created_at": datetime.utcnow(),
        "source": "manual"
    }

    result = assets.insert_one(asset_doc)

    return {
        "status": "success",
        "message": "Asset added successfully",
        "asset_id": str(result.inserted_id)
    }

# -----------------------------
# 2️⃣ ASSET SUMMARY
# -----------------------------
@router.get("/summary")
async def get_asset_summary():
    # ✅ Safe org_id retrieval
    org_id = _get_org_id()

    # ✅ Uses safe variable
    match = {"org_id": org_id}

    total = assets.count_documents(match)

    critical_actions = assets.count_documents({
        **match,
        "exposure_level": "Critical"
    })

    avg_risk_cursor = assets.aggregate([
        {"$match": match},
        {"$group": {"_id": None, "avg": {"$avg": "$risk_score"}}}
    ])

    avg_risk_list = list(avg_risk_cursor)
    avg_risk = avg_risk_list[0]["avg"] if avg_risk_list else 0

    compliant = assets.count_documents({
        **match,
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
# 3️⃣ ASSET DISTRIBUTION
# -----------------------------
@router.get("/distribution")
async def get_asset_distribution():
    # ✅ Safe org_id retrieval
    org_id = _get_org_id()

    pipeline = [
        {"$match": {"org_id": org_id}}, # ✅ Uses safe variable
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
# 4️⃣ TOP RISK ASSETS
# -----------------------------
@router.get("/top-risk") # ✅ Confirmed EXACT route name
async def get_top_risk_assets():
    # ✅ Safe org_id retrieval
    org_id = _get_org_id()

    cursor = assets.find(
        {"org_id": org_id}, # ✅ Uses safe variable
        {
            "_id": 0,
            "asset_name": 1,
            "risk_score": 1,
            "business_unit": 1,
            "asset_type": 1,
            "exposure_level": 1,
            "compliance_status": 1
        }
    ).sort("risk_score", -1).limit(3)

    return list(cursor)

# -----------------------------
# 5️⃣ ASSET INVENTORY
# -----------------------------
@router.get("/")
async def get_asset_inventory():
    # ✅ Safe org_id retrieval
    org_id = _get_org_id()

    cursor = assets.find(
        {"org_id": org_id}, # ✅ Uses safe variable
        {"_id": 0}
    )

    return {"assets": list(cursor)}