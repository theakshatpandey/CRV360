import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING STRATEGY
# -----------------------------------
# Load .env ONLY for local development
# Cloud Run injects env vars directly
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

# ---- HARD FAIL (NO FALLBACKS) ----
if not MONGO_URI:
    raise RuntimeError(
        "❌ MONGO_URI is not set. "
        "For local dev, define it in .env. "
        "For Cloud Run, set it as an environment variable."
    )

# -----------------------------------
# MONGO CLIENT (SINGLETON, ATLAS-SAFE)
# -----------------------------------
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        retryWrites=True,
    )

    # 🔥 Force connection check at startup
    client.admin.command("ping")

except ServerSelectionTimeoutError as e:
    raise RuntimeError(
        f"❌ MongoDB connection failed. "
        f"Check Atlas availability, credentials, and IP access.\n{e}"
    )

# -----------------------------------
# DATABASE (EXPLICIT)
# -----------------------------------
db = client["CRV360"]

# -----------------------------------
# COLLECTION EXPORTS (SINGLE SOURCE OF TRUTH)
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

# -----------------------------------
# NOTE:
# ❗ DO NOT create MongoClient anywhere else in the codebase
# ❗ All routers MUST import collections from this file
# -----------------------------------
