from fastapi import APIRouter, HTTPException
from datetime import datetime
from pydantic import BaseModel
from database import db  # ✅ centralized import
from core.org_context import get_current_org


router = APIRouter(prefix="/incident-response", tags=["incident-response"])

# ============================================
# MODELS
# ============================================

class IncidentCreate(BaseModel):
    title: str
    severity: str
    business_impact: str
    business_unit: str
    root_cause: str
    owner: str

# ============================================
# API ENDPOINTS
# ============================================

@router.get("/incidents")
async def get_incidents():
    try:
        incidents = list(db["incident_responses"].find({}, {"_id": 0}).sort("detected_at", -1))
        return {"status": "success", "data": incidents}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/incidents/create")
async def create_incident(incident: IncidentCreate):
    try:
        new_incident = {
            "incident_id": f"INC-{int(datetime.utcnow().timestamp())}",
            "title": incident.title,
            "severity": incident.severity,
            "business_impact": incident.business_impact,
            "business_unit": incident.business_unit,
            "root_cause": incident.root_cause,
            "status": "Open",
            "owner": incident.owner,
            "resolution_time": "Just Started",
            "detected_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "regulatory_impact": [],
            "sla_status": "On Track"
        }
        db["incident_responses"].insert_one(new_incident)
        
        # Remove _id before returning
        new_incident.pop("_id", None)
        
        return {"status": "success", "message": "Incident created successfully", "data": new_incident}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_incident_stats():
    try:
        incidents = list(db["incident_responses"].find({}, {"_id": 0}))
        
        total_incidents = len(incidents)
        high_impact = len([i for i in incidents if i.get("severity") in ["Critical", "High"] and i.get("status") != "Resolved"])
        
        # Mock calculation for SLA (real logic would compare timestamps)
        sla_met = len([i for i in incidents if i.get("sla_status") == "Met"])
        sla_compliance = round((sla_met / total_incidents * 100), 1) if total_incidents > 0 else 100.0

        return {
            "status": "success",
            "data": {
                "high_impact_active": high_impact,
                "avg_resolution_hours": 36, 
                "sla_compliance": sla_compliance,
                "regulatory_alerts": 4 
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/incidents/{incident_id}/status")
async def update_status(incident_id: str, status: str):
    try:
        result = db["incident_responses"].update_one(
            {"incident_id": incident_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"status": "success", "message": f"Incident {incident_id} updated to {status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))