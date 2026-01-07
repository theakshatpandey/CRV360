from fastapi import APIRouter, UploadFile, File, HTTPException
import csv, io, uuid
from datetime import datetime

# ✅ Safe Imports
from database import assets_collection, asset_ingestion_jobs, asset_ingestion_rows
from services.risk_engine import calculate_risk
from core.org_context import get_current_org

router = APIRouter(prefix="/api/assets", tags=["Assets"])

# Aliases for clarity (optional, but keeps code clean)
assets_col = assets_collection
jobs_col = asset_ingestion_jobs
rows_col = asset_ingestion_rows


@router.post("/import")
async def import_assets(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    org = get_current_org()

    # -----------------------------
    # 1️⃣ Create ingestion job
    # -----------------------------
    job_id = f"JOB-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:4]}"

    job = {
        "job_id": job_id,
        "org_id": org["org_id"],
        "uploaded_by": org["user_email"],
        "source": "csv",
        "filename": file.filename,
        "status": "processing",
        "total_rows": 0,
        "inserted": 0,
        "rejected": 0,
        "started_at": datetime.utcnow(),
        "completed_at": None
    }

    jobs_col.insert_one(job)

    # -----------------------------
    # 2️⃣ Read CSV
    # -----------------------------
    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    required_fields = [
        "asset_name",
        "asset_type",
        "business_unit",
        "criticality",
        "environment"
    ]

    inserted = 0
    rejected = 0
    total_rows = 0

    # -----------------------------
    # 3️⃣ Process rows
    # -----------------------------
    for row_number, row in enumerate(reader, start=1):
        total_rows += 1

        if not all(row.get(f) for f in required_fields):
            rows_col.insert_one({
                "job_id": job_id,
                "org_id": org["org_id"],
                "row_number": row_number,
                "row_data": row,
                "status": "rejected",
                "reason": "Missing required fields",
                "created_at": datetime.utcnow()
            })
            rejected += 1
            continue

        asset = {
            "org_id": org["org_id"],
            "asset_name": row["asset_name"],
            "asset_type": row["asset_type"],
            "ip_address": row.get("ip_address"),
            "business_unit": row["business_unit"],
            "owner": row.get("owner"),
            "criticality": row["criticality"],
            "environment": row["environment"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # -----------------------------
        # 4️⃣ Risk engine
        # -----------------------------
        risk = calculate_risk(asset)

        asset.update({
            "risk_score": risk["risk_score"],
            "exposure_level": risk["exposure_level"],
            "compliance_status": risk["compliance_status"]
        })

        assets_col.insert_one(asset)
        inserted += 1

    # -----------------------------
    # 5️⃣ Finalize job
    # -----------------------------
    jobs_col.update_one(
        {"job_id": job_id, "org_id": org["org_id"]},
        {
            "$set": {
                "status": "completed",
                "total_rows": total_rows,
                "inserted": inserted,
                "rejected": rejected,
                "completed_at": datetime.utcnow()
            }
        }
    )

    return {
        "status": "success",
        "job_id": job_id,
        "total_rows": total_rows,
        "inserted": inserted,
        "rejected": rejected
    }


@router.post("/retry/{job_id}")
async def retry_rejected_rows(job_id: str):
    org = get_current_org()

    rejected_rows = rows_col.find({
        "job_id": job_id,
        "org_id": org["org_id"],
        "status": "rejected"
    })

    retried = 0

    for row in rejected_rows:
        data = row["row_data"]

        required_fields = [
            "asset_name",
            "asset_type",
            "business_unit",
            "criticality",
            "environment"
        ]

        if not all(data.get(f) for f in required_fields):
            continue

        asset = {
            "org_id": org["org_id"],
            "asset_name": data["asset_name"],
            "asset_type": data["asset_type"],
            "ip_address": data.get("ip_address"),
            "business_unit": data["business_unit"],
            "owner": data.get("owner"),
            "criticality": data["criticality"],
            "environment": data["environment"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        risk = calculate_risk(asset)

        asset.update({
            "risk_score": risk["risk_score"],
            "exposure_level": risk["exposure_level"],
            "compliance_status": risk["compliance_status"]
        })

        assets_col.insert_one(asset)

        rows_col.update_one(
            {"_id": row["_id"]},
            {
                "$set": {
                    "status": "recovered",
                    "recovered_at": datetime.utcnow()
                }
            }
        )

        retried += 1

    return {
        "job_id": job_id,
        "retried": retried
    }