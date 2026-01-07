from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
# ✅ Safe Imports
from database import (
    threat_campaigns,
    security_alerts,
    incident_responses,
    alert_metrics
)
from core.org_context import get_current_org

router = APIRouter(prefix="/events", tags=["events"])

# --- Threat Campaigns ---
@router.get("/campaigns")
async def get_all_campaigns(severity: str = Query(None)):
    try:
        query = {"severity": severity} if severity else {}
        data = list(threat_campaigns.find(query, {"_id": 0}))
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}")
async def get_campaign_details(campaign_id: str):
    try:
        data = threat_campaigns.find_one({"campaign_id": campaign_id}, {"_id": 0})
        if not data: raise HTTPException(status_code=404, detail="Campaign not found")
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/launch-response")
async def launch_incident_response(campaign_id: str):
    try:
        campaign = threat_campaigns.find_one({"campaign_id": campaign_id})
        if not campaign: raise HTTPException(status_code=404, detail="Campaign not found")
        
        record = {
            "response_id": f"RESP-{datetime.utcnow().timestamp()}",
            "campaign_id": campaign_id,
            "action_type": "Launch Incident Response",
            "description": f"Incident response initiated for {campaign['name']}",
            "status": "In Progress",
            "started_at": datetime.utcnow(),
            "completed_at": None,
            "owner": "SOC Lead",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        incident_responses.insert_one(record)
        return {"status": "success", "data": record, "message": f"Incident response launched"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}/related-alerts")
async def get_campaign_alerts(campaign_id: str):
    try:
        alerts = list(security_alerts.find({"campaign_id": campaign_id}, {"_id": 0}))
        return {"status": "success", "data": alerts, "count": len(alerts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Security Alerts ---
@router.get("/alerts")
async def get_all_alerts(severity: str = Query(None), status: str = Query(None)):
    try:
        query = {}
        if severity: query["severity"] = severity
        if status: query["status"] = status
        alerts = list(security_alerts.find(query, {"_id": 0}))
        return {"status": "success", "data": alerts, "count": len(alerts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/{alert_id}")
async def get_alert_details(alert_id: str):
    try:
        alert = security_alerts.find_one({"alert_id": alert_id}, {"_id": 0})
        if not alert: raise HTTPException(status_code=404, detail="Alert not found")
        return {"status": "success", "data": alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/update-status")
async def update_alert_status(alert_id: str, new_status: str):
    try:
        allowed = ["Open", "In Progress", "Resolved", "Contained"]
        if new_status not in allowed: raise HTTPException(status_code=400, detail="Invalid status")
        
        result = security_alerts.update_one({"alert_id": alert_id}, {"$set": {"status": new_status, "updated_at": datetime.utcnow()}})
        if result.matched_count == 0: raise HTTPException(status_code=404, detail="Alert not found")
        
        alert = security_alerts.find_one({"alert_id": alert_id}, {"_id": 0})
        return {"status": "success", "data": alert, "message": f"Updated to {new_status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Incident Response ---
@router.get("/responses")
async def get_all_responses(campaign_id: str = Query(None)):
    try:
        query = {"campaign_id": campaign_id} if campaign_id else {}
        responses = list(incident_responses.find(query, {"_id": 0}))
        return {"status": "success", "data": responses, "count": len(responses)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/responses/{response_id}")
async def get_response_details(response_id: str):
    try:
        response = incident_responses.find_one({"response_id": response_id}, {"_id": 0})
        if not response: raise HTTPException(status_code=404, detail="Response not found")
        return {"status": "success", "data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Metrics ---
@router.get("/metrics")
async def get_alert_metrics():
    try:
        metrics = alert_metrics.find_one({}, {"_id": 0}, sort=[("metric_date", -1)])
        if not metrics: raise HTTPException(status_code=404, detail="Metrics not found")
        return {"status": "success", "data": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Executive Brief ---
@router.post("/campaigns/{campaign_id}/generate-executive-brief")
async def generate_executive_brief(campaign_id: str):
    try:
        campaign = threat_campaigns.find_one({"campaign_id": campaign_id}, {"_id": 0})
        if not campaign: raise HTTPException(status_code=404, detail="Campaign not found")
        
        related_alerts = list(security_alerts.find({"campaign_id": campaign_id}, {"_id": 0}))
        
        brief = {
            "brief_id": f"BRIEF-{datetime.utcnow().timestamp()}",
            "campaign_id": campaign_id,
            "campaign_name": campaign["name"],
            "severity": campaign["severity"],
            "impact_score": campaign["impact_score"],
            "affected_assets": campaign["affected_assets"],
            "alert_count": len(related_alerts),
            "impacted_business_units": campaign["impacted_business_units"],
            "executive_summary": f"{campaign['name']} is a {campaign['severity'].lower()} threat. Action required.",
            "recommended_actions": ["Isolate systems", "Rotate credentials", "Brief leadership"],
            "generated_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        return {"status": "success", "data": brief, "message": "Executive brief generated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/generate-report")
async def generate_alert_report(alert_id: str):
    try:
        alert = security_alerts.find_one({"alert_id": alert_id}, {"_id": 0})
        if not alert: raise HTTPException(status_code=404, detail="Alert not found")
        
        report = {
            "report_id": f"REPORT-{datetime.utcnow().timestamp()}",
            "alert_id": alert_id,
            "alert_title": alert["title"],
            "severity": alert["severity"],
            "alert_source": alert["alert_source"],
            "detected_at": alert["detected_at"],
            "description": alert["description"],
            "technical_details": {"detection_method": "Behavioral", "confidence": "High"},
            "investigation_findings": "Initial signs of lateral movement.",
            "recommended_actions": ["Isolate endpoint", "Collect evidence", "Review logs"],
            "generated_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        return {"status": "success", "data": report, "message": "Alert report generated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))