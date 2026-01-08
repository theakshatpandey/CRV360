import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from dotenv import load_dotenv

# -----------------------------------
# ENV LOADING
# -----------------------------------
# Local dev only
load_dotenv(override=False)

MONGO_URI = os.getenv("MONGO_URI")

# 🚫 NO FALLBACKS IN CLOUD
if not MONGO_URI:
    raise RuntimeError(
        "❌ MONGO_URI is NOT set. "
        "Cloud Run requires MONGO_URI as an environment variable."
    )

print("✅ MONGO_URI detected")

# -----------------------------------
# MONGO CLIENT (CLOUD SAFE)
# -----------------------------------
try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=20000,
        connectTimeoutMS=20000,
        retryWrites=True,
    )

    # Force early failure if unreachable
    client.admin.command("ping")

except ServerSelectionTimeoutError as e:
    raise RuntimeError(f"❌ MongoDB connection failed: {e}")

# -----------------------------------
# DATABASE
# -----------------------------------
db = client["CRV360"]

# -----------------------------------
# COLLECTIONS (SINGLE SOURCE OF TRUTH)
# -----------------------------------
users_collection = db["users"]

assets_collection = db["assets"]
asset_relationships_collection = db["asset_relationships"]

risk_summary_col = db["risk_summary"]
top_risks = db["top_risks"]

metrics_collection = db["metrics"]
executive_reports = db["executive_reports"]
