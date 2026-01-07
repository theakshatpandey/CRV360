import os
from pymongo import MongoClient
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING
# -----------------------------------
# Local: loads .env
# Cloud Run: env vars injected automatically
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

# Fallback for local testing if env var isn't set (Optional, remove for prod)
if not MONGO_URI:
    print("⚠️ MONGO_URI not set. Defaulting to localhost for safety.")
    MONGO_URI = "mongodb://localhost:27017/CRV360"

print("✅ MONGO_URI detected")

# -----------------------------------
# MONGO CLIENT (LAZY, CLOUD-RUN SAFE)
# -----------------------------------
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=30000,  # allow slow Atlas DNS
    connectTimeoutMS=30000,
    retryWrites=True,
)

# -----------------------------------
# DATABASE
# -----------------------------------
db = db = client["CRV360"]


# -----------------------------------
# COLLECTION EXPORTS (Complete List)
# -----------------------------------

# 1. Auth & Users
users_collection = db["users"]

# 2. Assets Module
assets_collection = db["assets"]
asset_ingestion_jobs = db["asset_ingestion_jobs"]
asset_ingestion_rows = db["asset_ingestion_rows"]
asset_relationships_collection = db["asset_relationships"]  # Renamed to match router

# 3. Compliance Module
compliance_frameworks = db["compliance_frameworks"]
compliance_violations = db["compliance_violations"]
compliance_actions = db["compliance_actions"]
evidence_intelligence = db["evidence_intelligence"]
evidence_gap_reports = db["evidence_gap_reports"]

# 4. Events & Incident Response
threat_campaigns = db["threat_campaigns"]
security_alerts = db["security_alerts"]
incident_responses = db["incident_responses"]
alert_metrics = db["alert_metrics"]

# 5. Risk Module
risk_summary_col = db["risk_summary"]
risk_posture_col = db["risk_posture"]
risk_category_breakdown_col = db["risk_category_breakdown"]
risk_business_units_col = db["risk_business_units"]
risk_internal_drivers_col = db["risk_internal_drivers"]
risk_external_drivers_col = db["risk_external_drivers"]
risk_recommendations_col = db["risk_recommendations"]
top_risks = db["top_risks"]

# 6. Phishing Module
phishing_intelligence = db["phishing_intelligence"]
phishing_simulations = db["phishing_simulations"]
phishing_templates = db["phishing_templates"]

# 7. Vulnerabilities Module
vulnerabilities_collection = db["vulnerabilities"]
vuln_summary_collection = db["vuln_summary"]
active_threats_collection = db["active_threats"]
vuln_severity_dist_collection = db["vuln_severity_distribution"]
patch_velocity_collection = db["patch_velocity"]

# 8. Settings & Metrics (General)
system_settings_collection = db["system_settings"]
metrics_collection = db["metrics"]
operational_indicators = db["operational_indicators"]
daily_trends = db["daily_trends"]
calendar_events = db["calendar_events"]
module_health = db["module_health"]
daily_alerts = db["daily_alerts"]
executive_reports = db["executive_reports"]