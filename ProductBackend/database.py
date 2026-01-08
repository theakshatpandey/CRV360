import os
from pymongo import MongoClient
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING
# -----------------------------------
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("❌ MONGO_URI is NOT set")

print("✅ MONGO_URI loaded")

# -----------------------------------
# MONGO CLIENT (NO PING — CLOUD SAFE)
# -----------------------------------
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=20000,
    connectTimeoutMS=20000,
    retryWrites=True,
)

db = client["CRV360"]

# -----------------------------------
# COLLECTION EXPORTS
# -----------------------------------

# Users / Auth
users_collection = db["users"]

# Assets
assets_collection = db["assets"]
asset_relationships_collection = db["asset_relationships"]

# Metrics (🔥 THIS WAS MISSING)
metrics_collection = db["metrics"]
operational_indicators = db["operational_indicators"]
daily_trends = db["daily_trends"]
daily_alerts = db["daily_alerts"]
module_health = db["module_health"]

# Risk
risk_summary_col = db["risk_summary"]
top_risks = db["top_risks"]

# Executive
executive_reports = db["executive_reports"]
