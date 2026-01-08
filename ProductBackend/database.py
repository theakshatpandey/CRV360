import os
from pymongo import MongoClient
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING
# -----------------------------------
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    # Fallback for local testing if env var isn't set (Optional)
    print("⚠️ MONGO_URI not set. Defaulting to localhost for safety.")
    MONGO_URI = "mongodb://localhost:27017/CRV360"

print("✅ MONGO_URI loaded")

# -----------------------------------
# MONGO CLIENT
# -----------------------------------
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=20000,
    connectTimeoutMS=20000,
    retryWrites=True,
)

db = client["CRV360"]

# -----------------------------------
# COLLECTIONS (SINGLE SOURCE OF TRUTH)
# -----------------------------------

# Users / Auth
users_collection = db["users"]

# Assets
assets_collection = db["assets"]
asset_relationships_collection = db["asset_relationships"]
asset_ingestion_jobs = db["asset_ingestion_jobs"]
asset_ingestion_rows = db["asset_ingestion_rows"]

# Events / Threats
events_collection = db["events"]
threat_campaigns = db["threat_campaigns"]
security_alerts = db["security_alerts"]
incident_responses = db["incident_responses"]
alert_metrics = db["alert_metrics"]

# Metrics / Ops
metrics_collection = db["metrics"]
operational_indicators = db["operational_indicators"]
daily_trends = db["daily_trends"]
daily_alerts = db["daily_alerts"]
module_health = db["module_health"]
calendar_events = db["calendar_events"]

# Risk
risk_summary_col = db["risk_summary"]
risk_posture_col = db["risk_posture"]
risk_category_breakdown_col = db["risk_category_breakdown"]
risk_business_units_col = db["risk_business_units"]
risk_internal_drivers_col = db["risk_internal_drivers"]
risk_external_drivers_col = db["risk_external_drivers"]
risk_recommendations_col = db["risk_recommendations"]
top_risks = db["top_risks"]

# Compliance
compliance_frameworks = db["compliance_frameworks"]
compliance_violations = db["compliance_violations"]
compliance_actions = db["compliance_actions"]
evidence_intelligence = db["evidence_intelligence"]
evidence_gap_reports = db["evidence_gap_reports"]

# Vulnerabilities
vulnerabilities_collection = db["vulnerabilities"]
vuln_summary_collection = db["vuln_summary"]
active_threats_collection = db["active_threats"]
vuln_severity_dist_collection = db["vuln_severity_distribution"]
patch_velocity_collection = db["patch_velocity"]

# Executive
executive_reports = db["executive_reports"]

# ✅ ADDED MISSING COLLECTIONS:

# Phishing
phishing_intelligence = db["phishing_intelligence"]
phishing_simulations = db["phishing_simulations"]
phishing_templates = db["phishing_templates"]

# Settings
system_settings_collection = db["system_settings"]