from fastapi import APIRouter, HTTPException
from datetime import datetime
from pydantic import BaseModel
from database import db  # ✅ centralized import
from core.org_context import get_current_org


router = APIRouter(prefix="/phishing-simulation", tags=["phishing-simulation"])

# ============================================
# MODELS
# ============================================

class CampaignCreate(BaseModel):
    name: str
    template_id: str
    target_count: int

# ============================================
# API ENDPOINTS
# ============================================

@router.get("/campaigns")
async def get_simulations():
    try:
        simulations = list(db["phishing_simulations"].find({}, {"_id": 0}))
        return {"status": "success", "data": simulations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/create")
async def create_campaign(campaign: CampaignCreate):
    try:
        new_campaign = {
            "campaign_id": f"SIM-{int(datetime.utcnow().timestamp())}",
            "name": campaign.name,
            "status": "Scheduled",
            "targets_count": campaign.target_count,
            "click_rate": 0,
            "report_rate": 0,
            "credentials_captured": 0,
            "risk_score": 0,
            "start_date": datetime.utcnow(),
            "end_date": None
        }
        db["phishing_simulations"].insert_one(new_campaign)
        return {"status": "success", "message": "Campaign created successfully", "data": new_campaign}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def get_templates():
    try:
        templates = list(db["phishing_templates"].find({}, {"_id": 0}))
        return {"status": "success", "data": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates/{template_id}")
async def get_template_preview(template_id: str):
    try:
        template = db["phishing_templates"].find_one({"template_id": template_id}, {"_id": 0})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return {"status": "success", "data": template}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))