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

if not MONGO_URI:
    raise RuntimeError(
        "❌ MONGO_URI not set. "
        "Set it in .env (local) or Cloud Run env vars."
    )

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

# ❌ DO NOT PING HERE
# Cloud Run must start FAST

# -----------------------------------
# DATABASE
# -----------------------------------
db = client["CRV360"]

# -----------------------------------
# COLLECTION EXPORTS
# -----------------------------------
users_collection = db["users"]

assets_collection = db["assets"]
asset_ingestion_jobs = db["asset_ingestion_jobs"]
asset_ingestion_rows = db["asset_ingestion_rows"]
asset_relationships = db["asset_relationships"]

vulnerabilities_collection = db["vulnerabilities"]
events_collection = db["events"]
incidents_collection = db["incidents"]
metrics_collection = db["metrics"]
settings_collection = db["settings"]
