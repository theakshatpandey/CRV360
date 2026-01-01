from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from database import db  # ✅ centralized import

router = APIRouter(prefix="/events", tags=["events"])

# ============================================
# THREAT CAMPAIGNS APIs
# ============================================

@router.get("/campaigns")
async def get_all_campaigns(severity: str = Query(None)):
    try:
        query = {}
        if severity:
            query["severity"] = severity
        
        campaigns = list(db["threat_campaigns"].find(query, {"_id": 0}))
        return {
            "status": "success",
            "data": campaigns,
            "count": len(campaigns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}")
async def get_campaign_details(campaign_id: str):
    try:
        campaign = db["threat_campaigns"].find_one(
            {"campaign_id": campaign_id},
            {"_id": 0}
        )
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return {
            "status": "success",
            "data": campaign
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/launch-response")
async def launch_incident_response(campaign_id: str):
    try:
        campaign = db["threat_campaigns"].find_one({"campaign_id": campaign_id})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Create incident response record
        response_record = {
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
        
        db["incident_responses"].insert_one(response_record)
        
        return {
            "status": "success",
            "data": response_record,
            "message": f"Incident response launched for campaign {campaign_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/{campaign_id}/related-alerts")
async def get_campaign_alerts(campaign_id: str):
    try:
        alerts = list(db["security_alerts"].find(
            {"campaign_id": campaign_id},
            {"_id": 0}
        ))
        return {
            "status": "success",
            "data": alerts,
            "count": len(alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# SECURITY ALERTS APIs
# ============================================

@router.get("/alerts")
async def get_all_alerts(severity: str = Query(None), status: str = Query(None)):
    try:
        query = {}
        if severity:
            query["severity"] = severity
        if status:
            query["status"] = status
        
        alerts = list(db["security_alerts"].find(query, {"_id": 0}))
        return {
            "status": "success",
            "data": alerts,
            "count": len(alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/{alert_id}")
async def get_alert_details(alert_id: str):
    try:
        alert = db["security_alerts"].find_one(
            {"alert_id": alert_id},
            {"_id": 0}
        )
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {
            "status": "success",
            "data": alert
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/update-status")
async def update_alert_status(alert_id: str, new_status: str):
    try:
        allowed_statuses = ["Open", "In Progress", "Resolved", "Contained"]
        if new_status not in allowed_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = db["security_alerts"].update_one(
            {"alert_id": alert_id},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        alert = db["security_alerts"].find_one({"alert_id": alert_id}, {"_id": 0})
        
        return {
            "status": "success",
            "data": alert,
            "message": f"Alert {alert_id} status updated to {new_status}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# INCIDENT RESPONSE APIs
# ============================================

@router.get("/responses")
async def get_all_responses(campaign_id: str = Query(None)):
    try:
        query = {}
        if campaign_id:
            query["campaign_id"] = campaign_id
        
        responses = list(db["incident_responses"].find(query, {"_id": 0}))
        return {
            "status": "success",
            "data": responses,
            "count": len(responses)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/responses/{response_id}")
async def get_response_details(response_id: str):
    try:
        response = db["incident_responses"].find_one(
            {"response_id": response_id},
            {"_id": 0}
        )
        if not response:
            raise HTTPException(status_code=404, detail="Response not found")
        return {
            "status": "success",
            "data": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# METRICS APIs
# ============================================

@router.get("/metrics")
async def get_alert_metrics():
    try:
        metrics = db["alert_metrics"].find_one(
            {},
            {"_id": 0},
            sort=[("metric_date", -1)]
        )
        if not metrics:
            raise HTTPException(status_code=404, detail="Metrics not found")
        return {
            "status": "success",
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# EXECUTIVE BRIEF APIs
# ============================================

@router.post("/campaigns/{campaign_id}/generate-executive-brief")
async def generate_executive_brief(campaign_id: str):
    try:
        campaign = db["threat_campaigns"].find_one({"campaign_id": campaign_id}, {"_id": 0})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        related_alerts = list(db["security_alerts"].find(
            {"campaign_id": campaign_id},
            {"_id": 0}
        ))
        
        brief = {
            "brief_id": f"BRIEF-{datetime.utcnow().timestamp()}",
            "campaign_id": campaign_id,
            "campaign_name": campaign["name"],
            "severity": campaign["severity"],
            "impact_score": campaign["impact_score"],
            "affected_assets": campaign["affected_assets"],
            "alert_count": len(related_alerts),
            "impacted_business_units": campaign["impacted_business_units"],
            "executive_summary": f"{campaign['name']} is a {campaign['severity'].lower()} threat affecting {campaign['affected_assets']} assets across {', '.join(campaign['impacted_business_units'])}. Immediate action required.",
            "recommended_actions": [
                "Isolate affected systems from network",
                "Rotate all compromised credentials",
                "Conduct forensic analysis",
                "Implement additional monitoring",
                "Brief executive leadership"
            ],
            "generated_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        return {
            "status": "success",
            "data": brief,
            "message": "Executive brief generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{alert_id}/generate-report")
async def generate_alert_report(alert_id: str):
    try:
        alert = db["security_alerts"].find_one(
            {"alert_id": alert_id},
            {"_id": 0}
        )
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        
        report = {
            "report_id": f"REPORT-{datetime.utcnow().timestamp()}",
            "alert_id": alert_id,
            "alert_title": alert["title"],
            "severity": alert["severity"],
            "alert_source": alert["alert_source"],
            "detected_at": alert["detected_at"],
            "description": alert["description"],
            "technical_details": {
                "detection_method": "Behavioral analysis",
                "confidence": "High",
                "indicators_of_compromise": ["Suspicious process execution", "Abnormal network traffic"]
            },
            "investigation_findings": "Initial investigation shows signs of lateral movement attempt",
            "recommended_actions": [
                "Isolate affected endpoint",
                "Collect forensic evidence",
                "Review access logs",
                "Patch vulnerable systems"
            ],
            "generated_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }
        
        return {
            "status": "success",
            "data": report,
            "message": "Alert report generated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))