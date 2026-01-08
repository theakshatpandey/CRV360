import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("❌ MONGO_URI is NOT set")

# 🔹 Create client (NO ping here)
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=20000,
    connectTimeoutMS=20000,
    retryWrites=True,
)

db = client["CRV360"]

# Collections
users_collection = db["users"]
assets_collection = db["assets"]
asset_relationships_collection = db["asset_relationships"]
risk_summary_col = db["risk_summary"]
top_risks = db["top_risks"]
metrics_collection = db["metrics"]
executive_reports = db["executive_reports"]
