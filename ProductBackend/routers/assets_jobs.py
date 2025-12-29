from fastapi import APIRouter
from database import db

router = APIRouter(prefix="/api/assets/jobs", tags=["Asset Ingestion Jobs"])

jobs = db["asset_ingestion_jobs"]
rows = db["asset_ingestion_rows"]


# -----------------------------
# 1️⃣ List ingestion jobs
# -----------------------------
@router.get("")
async def list_jobs():
    return list(jobs.find({}, {"_id": 0}).sort("started_at", -1))


# -----------------------------
# 2️⃣ Job details (summary)
# -----------------------------
@router.get("/{job_id}")
async def job_details(job_id: str):
    job = jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        return {"error": "Job not found"}

    rejected = rows.count_documents({
        "job_id": job_id,
        "status": "rejected"
    })

    return {
        **job,
        "rejected_rows": rejected
    }


# -----------------------------
# 3️⃣ Rejected rows (for UI / retry)
# -----------------------------
@router.get("/{job_id}/rejected-rows")
async def rejected_rows(job_id: str):
    return list(rows.find(
        {"job_id": job_id, "status": "rejected"},
        {"_id": 0}
    ))
