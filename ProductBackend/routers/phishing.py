from fastapi import APIRouter, HTTPException, Query
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["product"]

# Create Router
router = APIRouter(prefix="/phishing", tags=["phishing"])

# ============================================
# API ENDPOINTS
# ============================================

@router.get("/intelligence")
async def get_phishing_intelligence():
    """
    GET /api/phishing/intelligence
    
    Fetches all active phishing campaigns for the dashboard.
    Returns a list of threat intelligence objects.
    """
    try:
        # Fetch all records, sorted by detection time (newest first)
        campaigns = list(db["phishing_intelligence"].find({}, {"_id": 0}).sort("detected_at", -1))
        
        return {
            "status": "success",
            "data": campaigns,
            "count": len(campaigns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/intelligence/stats")
async def get_phishing_stats():
    """
    GET /api/phishing/intelligence/stats
    
    Returns aggregated statistics for the dashboard cards.
    (e.g., Total Attempts, Click Rate, Spoof Domains)
    """
    try:
        campaigns = list(db["phishing_intelligence"].find({}, {"_id": 0}))
        
        total_attempts = sum(c.get("targets_count", 0) for c in campaigns)
        avg_click_rate = sum(c.get("click_rate_estimate", 0) for c in campaigns) / len(campaigns) if campaigns else 0
        active_domains = len([c for c in campaigns if not c.get("remediation_status", {}).get("domain_takedown", False)])
        critical_incidents = len([c for c in campaigns if c.get("severity") == "Critical"])

        return {
            "status": "success",
            "data": {
                "total_attempts": total_attempts,
                "avg_click_rate": round(avg_click_rate, 1),
                "active_spoof_domains": active_domains,
                "critical_incidents": critical_incidents
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/intelligence/{threat_id}/block-domain")
async def block_phishing_domain(threat_id: str):
    """
    POST /api/phishing/intelligence/{threat_id}/block-domain
    
    Simulates blocking a malicious domain on the email gateway/firewall.
    Updates the 'remediation_status.domain_takedown' field.
    """
    try:
        result = db["phishing_intelligence"].update_one(
            {"threat_id": threat_id},
            {"$set": {"remediation_status.domain_takedown": True, "status": "Takedown In Progress"}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Threat ID not found")
            
        return {
            "status": "success",
            "message": f"Domain for threat {threat_id} has been added to blocklist."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))