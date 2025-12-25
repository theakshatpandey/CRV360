# [BACKEND - PYTHON]
# This is your main server file. It listens for requests from the Frontend.

from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import os
from datetime import datetime
from bson.objectid import ObjectId # Added for handling MongoDB IDs

# 1. Initialize Flask
app = Flask(__name__)

# 2. Enable CORS (Allows React to talk to Python)
# We allow all origins (*) for development simplicity
CORS(app, resources={r"/api/*": {"origins": "*"}})

# [DATABASE - MONGODB]
# 3. Database Connection
# REPLACE THIS STRING with your actual MongoDB Atlas connection string
MONGO_URI = "mongodb://localhost:27017"

try:
    client = MongoClient(MONGO_URI)
    db = client.crv360_db
    print("✅ BACKEND: Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ BACKEND: Database connection failed: {e}")

# --- API ROUTES ---

@app.route('/', methods=['GET'])
def health_check():
    """Simple check to see if server is running"""
    return jsonify({"status": "online", "message": "CRV360 API is running"})

# --- MODULE 1: VULNERABILITY MANAGEMENT ROUTES ---

@app.route('/api/vulnerabilities/summary', methods=['GET'])
def get_summary():
    try:
        # Calculate real stats from the database
        total_vulns = db.vulnerabilities.count_documents({})
        critical_count = db.vulnerabilities.count_documents({"severity": "Critical"})
        high_count = db.vulnerabilities.count_documents({"severity": "High"})
        
        # Simple logic for exposure score (Mock calculation)
        exposure_score = min(100, (critical_count * 10) + (high_count * 5))
        
        return jsonify({
            "exposure_score": exposure_score,
            "critical_high_risk": critical_count + high_count,
            "critical_count": critical_count,
            "high_count": high_count,
            "exploited_in_wild": 0, # Placeholder
            "weaponized": 0,
            "active_threats": db.alerts.count_documents({"severity": "Critical"}),
            "patch_coverage": 85.0 
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/vulnerabilities/active-threats', methods=['GET'])
def get_active_threats():
    try:
        # Fetch the latest 5 alerts
        alerts = list(db.alerts.find().sort("timestamp", -1).limit(5))
        
        formatted_alerts = []
        for alert in alerts:
            formatted_alerts.append({
                "id": str(alert["_id"]),
                "type": alert.get("source", "Unknown"),
                "title": alert.get("message", "Security Alert"),
                "timestamp": alert.get("timestamp").strftime("%Y-%m-%d %H:%M"),
                "severity": alert.get("severity", "Medium"),
                "threatActor": "Unknown",
                "exploitAvailability": "Active",
                "businessImpact": "Potential operational disruption",
                "affectedUnits": ["IT Operations"],
                "riskScoreImpact": "+5.0",
                "assetCount": 1,
                "acknowledged": False
            })
            
        return jsonify({"threats": formatted_alerts})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/vulnerabilities/severity-distribution', methods=['GET'])
def get_severity_distribution():
    try:
        distribution = [
            {"name": "Critical", "value": db.vulnerabilities.count_documents({"severity": "Critical"}), "color": "#ef4444", "trend": "stable", "change": "0"},
            {"name": "High", "value": db.vulnerabilities.count_documents({"severity": "High"}), "color": "#f97316", "trend": "down", "change": "-2"},
            {"name": "Medium", "value": db.vulnerabilities.count_documents({"severity": "Medium"}), "color": "#eab308", "trend": "up", "change": "+5"},
            {"name": "Low", "value": db.vulnerabilities.count_documents({"severity": "Low"}), "color": "#22c55e", "trend": "stable", "change": "0"}
        ]
        return jsonify({"distribution": distribution})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/vulnerabilities/patch-velocity', methods=['GET'])
def get_patch_velocity():
    # Returning mock data for the graph for now
    return jsonify({
        "trend": [
            { "day": 5, "patches": 10 },
            { "day": 10, "patches": 15 },
            { "day": 15, "patches": 25 },
            { "day": 20, "patches": 40 },
            { "day": 25, "patches": 55 },
            { "day": 30, "patches": 60 }
        ],
        "summary": { "total_30d": 60, "avg_daily": 2.0 }
    })

@app.route('/api/vulnerabilities/inventory', methods=['GET'])
def get_inventory():
    try:
        vulns = list(db.vulnerabilities.find())
        formatted_vulns = []
        
        for v in vulns:
            # Calculate age
            age_days = 0
            if "discovered_date" in v:
                delta = datetime.now() - v["discovered_date"]
                age_days = delta.days

            formatted_vulns.append({
                "id": v.get("cve_id", "N/A"),
                "title": v.get("title", "Unknown Vulnerability"),
                "cvss_score": v.get("cvss_score", 0),
                "severity": v.get("severity", "Low"),
                "status": v.get("status", "Open"),
                "asset_count": 1,
                "first_detected": v.get("discovered_date", datetime.now()).strftime("%Y-%m-%d"),
                "age_days": age_days,
                "exploitability": "PoC Available",
                "businessUnits": ["IT Operations"],
                "assetCriticality": 80,
                "exposureScore": 75,
                "riskScore": v.get("cvss_score", 0),
                "patch_available": True,
                "threat_actors": []
            })
            
        return jsonify({"vulnerabilities": formatted_vulns})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- MODULE 2: ASSET & NETWORK MANAGEMENT ROUTES ---

# 6. GET ALL ASSETS
@app.route('/api/assets', methods=['GET'])
def get_assets():
    try:
        # Fetch all assets from MongoDB
        assets = list(db.assets.find())
        
        # Transform for Frontend
        formatted_assets = []
        for asset in assets:
            formatted_assets.append({
                "id": str(asset["_id"]),
                "name": asset.get("name", "Unknown Asset"),
                "ip_address": asset.get("ip", "0.0.0.0"),
                "type": asset.get("type", "Unclassified"),
                "criticality": asset.get("criticality", "Low"),
                "status": asset.get("status", "Active"), # Default to Active if missing
                "owner": asset.get("owner", "Unassigned"),
                "location": asset.get("location", "Unknown"),
                # Calculate vulnerability count for this specific asset
                "vuln_count": db.vulnerabilities.count_documents({"asset_id": asset["_id"]})
            })
            
        return jsonify({"assets": formatted_assets})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 7. ADD NEW ASSET
@app.route('/api/assets', methods=['POST'])
def add_asset():
    try:
        data = request.json
        
        # specific validation can go here
        if not data.get("name"):
            return jsonify({"error": "Asset Name is required"}), 400

        new_asset = {
            "name": data.get("name"),
            "ip": data.get("ip_address"),
            "type": data.get("type"),
            "criticality": data.get("criticality"),
            "status": data.get("status", "Active"),
            "owner": data.get("owner"),
            "location": data.get("location"),
            "created_at": datetime.now()
        }
        
        result = db.assets.insert_one(new_asset)
        
        return jsonify({
            "message": "Asset created successfully", 
            "id": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 8. DELETE ASSET
@app.route('/api/assets/<id>', methods=['DELETE'])
def delete_asset(id):
    try:
        # Delete the asset
        result = db.assets.delete_one({"_id": ObjectId(id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Asset not found"}), 404
            
        # OPTIONAL: Clean up linked vulnerabilities?
        # db.vulnerabilities.delete_many({"asset_id": ObjectId(id)})
        
        return jsonify({"message": "Asset deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 9. NETWORK SUMMARY (For the dashboard widgets)
@app.route('/api/network/summary', methods=['GET'])
def get_network_summary():
    try:
        total_assets = db.assets.count_documents({})
        active_assets = db.assets.count_documents({"status": "Active"})
        critical_assets = db.assets.count_documents({"criticality": "Critical"})
        
        return jsonify({
            "total_assets": total_assets,
            "active_assets": active_assets,
            "critical_infrastructure": critical_assets,
            "network_health": "98%" # Placeholder or logic based on uptime
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 4. Start the Server
if __name__ == '__main__':
    # Running on Port 5000 (Standard for Flask)
   import os
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    app.run(debug=debug_mode, port=5000)