import os
from pymongo import MongoClient
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING STRATEGY
# -----------------------------------
# Load .env ONLY for local development
# Cloud Run will inject env vars directly
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

# ---- HARD FAIL (NO FALLBACKS) ----
if not MONGO_URI:
    raise RuntimeError(
        "❌ MONGO_URI is not set. "
        "For local dev, define it in .env. "
        "For Cloud Run, set it as an environment variable."
    )

print("✅ MongoDB URI loaded")

# -----------------------------------
# MONGO CLIENT (Atlas-safe)
# -----------------------------------
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
)

# Explicit DB (important)
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
