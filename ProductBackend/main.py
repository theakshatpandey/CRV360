from fastapi import FastAPI, HTTPException, Request, Body, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from datetime import datetime
import os

# --- 1. SETUP & DATABASE ---
# IMPORT DATABASE FROM THE SEPARATE FILE TO FIX THE MODULE ERROR
from database import db, assets_collection, vulnerabilities_collection, alerts_collection

app = FastAPI(title="CRV360 Unified Backend")

# CORS (Allows your React Frontend to talk to this Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://crv360-frontend.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. HELPER FUNCTIONS ---

def serialize_doc(doc):
    """Helper to convert MongoDB ObjectId to string for JSON response"""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

# --- 3. ASSET MANAGEMENT ROUTES (Ported from app.py with FIXES) ---

@app.get("/api/assets")
def get_assets():
    try:
        assets = list(db.assets.find())
        formatted_assets = []
        for asset in assets:
            formatted_assets.append({
                "id": str(asset["_id"]),
                "name": asset.get("name", "Unknown Asset"),
                "ip_address": asset.get("ip", "0.0.0.0"),
                "type": asset.get("type", "Unclassified"),
                "criticality": asset.get("criticality", "Low"),
                "status": asset.get("status", "Active"),
                "owner": asset.get("owner", "Unassigned"),
                "location": asset.get("location", "Unknown"),
                "vuln_count": db.vulnerabilities.count_documents({"asset_id": asset["_id"]})
            })
        return {"assets": formatted_assets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/assets")
async def add_asset(request: Request):
    """
    Creates a new asset. 
    INCLUDES THE FIX for the 'hostname' vs 'name' bug.
    """
    try:
        data = await request.json()
        
        # --- THE FIX: Check for 'name' OR 'hostname' ---
        asset_name = data.get("name") or data.get("hostname")
        
        if not asset_name:
            raise HTTPException(status_code=400, detail="Asset Name (or Hostname) is required")

        new_asset = {
            "name": asset_name,
            "ip": data.get("ip_address") or data.get("ip"),
            "type": data.get("asset_type") or data.get("type"),
            "criticality": data.get("criticality"),
            "status": data.get("status", "Active"),
            "owner": data.get("owner"),
            "business_unit": data.get("business_unit"),
            "location": data.get("location"),
            "created_at": datetime.now()
        }
        
        result = db.assets.insert_one(new_asset)
        
        return {
            "message": "Asset created successfully", 
            "id": str(result.inserted_id)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error adding asset: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets/top-risk")
def get_top_risk_assets():
    try:
        high_risk_assets = list(db.assets.find(
            {"criticality": "High", "status": "Active"},
            {"_id": 1, "name": 1, "ip": 1, "owner": 1}
        ).limit(5))

        return [serialize_doc(asset) for asset in high_risk_assets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assets/distribution")
def get_asset_distribution():
    try:
        # Aggregation to count assets by 'type'
        pipeline = [
            {"$group": {"_id": "$type", "count": {"$sum": 1}}}
        ]
        distribution = list(db.assets.aggregate(pipeline))
        
        formatted_data = [{"name": item["_id"] or "Unknown", "value": item["count"]} for item in distribution]
        return formatted_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: str):
    try:
        result = db.assets.delete_one({"_id": ObjectId(asset_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"message": "Asset deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. VULNERABILITY ROUTES (Ported from app.py) ---

@app.get("/api/vulnerabilities/summary")
def get_vuln_summary():
    try:
        total_vulns = db.vulnerabilities.count_documents({})
        critical_count = db.vulnerabilities.count_documents({"severity": "Critical"})
        high_count = db.vulnerabilities.count_documents({"severity": "High"})
        
        exposure_score = min(100, (critical_count * 10) + (high_count * 5))
        
        return {
            "exposure_score": exposure_score,
            "critical_high_risk": critical_count + high_count,
            "critical_count": critical_count,
            "high_count": high_count,
            "active_threats": db.alerts.count_documents({"severity": "Critical"}),
            "patch_coverage": 85.0 
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vulnerabilities/active-threats")
def get_active_threats():
    try:
        alerts = list(db.alerts.find().sort("timestamp", -1).limit(5))
        formatted_alerts = []
        for alert in alerts:
            formatted_alerts.append({
                "id": str(alert["_id"]),
                "type": alert.get("source", "Unknown"),
                "title": alert.get("message", "Security Alert"),
                "timestamp": alert.get("timestamp").strftime("%Y-%m-%d %H:%M") if isinstance(alert.get("timestamp"), datetime) else str(alert.get("timestamp")),
                "severity": alert.get("severity", "Medium"),
                "acknowledged": False
            })
        return {"threats": formatted_alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vulnerabilities/severity-distribution")
def get_severity_distribution():
    try:
        distribution = [
            {"name": "Critical", "value": db.vulnerabilities.count_documents({"severity": "Critical"}), "color": "#ef4444"},
            {"name": "High", "value": db.vulnerabilities.count_documents({"severity": "High"}), "color": "#f97316"},
            {"name": "Medium", "value": db.vulnerabilities.count_documents({"severity": "Medium"}), "color": "#eab308"},
            {"name": "Low", "value": db.vulnerabilities.count_documents({"severity": "Low"}), "color": "#22c55e"}
        ]
        return {"distribution": distribution}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. NETWORK SUMMARY ---
@app.get("/api/network/summary")
def get_network_summary():
    try:
        total = db.assets.count_documents({})
        active = db.assets.count_documents({"status": "Active"})
        critical = db.assets.count_documents({"criticality": "Critical"})
        return {
            "total_assets": total,
            "active_assets": active,
            "critical_infrastructure": critical,
            "network_health": "98%"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 6. EXISTING ROUTERS ---

from routers import auth, metrics, risk, compliance, events, phishing, phishing_simulation, incident_response, executive_report, settings

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(metrics.router, prefix="/api", tags=["metrics"])
# app.include_router(assets.router, prefix="/api", tags=["assets"])          <-- USING LOCAL LOGIC ABOVE
# app.include_router(vulnerabilities.router, prefix="/api", tags=["vulnerabilities"]) <-- USING LOCAL LOGIC ABOVE
app.include_router(risk.router, prefix="/api", tags=["risk"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["compliance"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(phishing.router, prefix="/api", tags=["phishing"])
app.include_router(phishing_simulation.router, prefix="/api", tags=["phishing-simulation"])
app.include_router(incident_response.router, prefix="/api", tags=["incident-response"])
app.include_router(executive_report.router, prefix="/api", tags=["executive-report"])
app.include_router(settings.router, prefix="/api", tags=["settings"])

@app.get("/")
def home():
    return {"message": "CRV360 Unified Backend Running! 🚀"}