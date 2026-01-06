# ✅ Safe Import
from database import vuln_summary_collection
from datetime import datetime

# Alias
collection = vuln_summary_collection

summary = {
    "exposure_score": 72,
    "exposure_trend": -6,
    "critical_high_risk": 323,
    "critical_count": 89,
    "high_count": 234,
    "exploited_in_wild": 12,
    "weaponized": 28,
    "active_threats": 47,
    "patch_coverage": 85.2,
    "patch_trend": 13,
    "updated_at": datetime.utcnow()
}

collection.delete_many({})
collection.insert_one(summary)

print("Vuln summary seeded!")