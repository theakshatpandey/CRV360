import os
from pymongo import MongoClient
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING
# -----------------------------------
# Local dev: loads .env
# Cloud Run: env vars injected automatically
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError(
        "❌ MONGO_URI is NOT set. "
        "Set it as an environment variable in Cloud Run."
    )

print("✅ MONGO_URI loaded")

# -----------------------------------
# MONGO CLIENT (LAZY / CLOUD-RUN SAFE)
# -----------------------------------
# ⚠️ Do NOT ping here
# ⚠️ Do NOT touch DB at import time
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=20000,
    connectTimeoutMS=20000,
    retryWrites=True,
)

# -----------------------------------
# DATABASE
# -----------------------------------
db = client["CRV360"]

# -----------------------------------
# COLLECTION EXPORTS
# -----------------------------------
# Auth
users_collection = db["users"]

# Assets
assets_collection = db["assets"]
asset_relationships_collection = db["asset_relationships"]

# Risk
risk_summary_col = db["risk_summary"]
top_risks = db["top_risks"]

# Metrics & Reports
metrics_collection = db["metrics"]
executive_reports = db["executive_reports"]

# -----------------------------------
# NOTE:
# ❗ Never create MongoClient elsewhere
# ❗ All routers must import collections from here
# -----------------------------------
