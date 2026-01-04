from fastapi import APIRouter, HTTPException
from database import db
from core.org_context import get_current_org

router = APIRouter(
    prefix="/api/assets/jobs",
    tags=["Asset Ingestion Jobs"]
)

jobs_col = db["asset_ingestion_jobs"]
rows_col = db["asset_ingestion_rows"]

# -----------------------------------
# 1️⃣ LIST ALL INGESTION JOBS
# -----------------------------------
@router.get("")
async def list_jobs():
    jobs = list(
        jobs_col.find(
            {},
            {"_id": 0}
        ).sort("started_at", -1)
    )

    return {
        "jobs": jobs
    }


# -----------------------------------
# 2️⃣ JOB DETAILS + REJECTED ROWS
# -----------------------------------
@router.get("/{job_id}")
async def job_details(job_id: str):
    job = jobs_col.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    rejected_rows = list(
        rows_col.find(
            {"job_id": job_id},
            {"_id": 0}
        )
    )

    return {
        "job": job,
        "rejected_rows": rejected_rows
    }


# -----------------------------------
# 3️⃣ ONLY REJECTED ROWS (RETRY VIEW)
# -----------------------------------
@router.get("/{job_id}/rejected")
async def rejected_rows(job_id: str):
    rows = list(
        rows_col.find(
            {
                "job_id": job_id,
                "status": "rejected"
            },
            {"_id": 0}
        )
    )

    return {
        "job_id": job_id,
        "rejected_rows": rows
    }
