# ✅ Safe Import
from database import daily_alerts
from datetime import datetime

# Alias for clarity
collection = daily_alerts

alerts = {
    "date": datetime.utcnow().date().isoformat(),
    "critical": 12,
    "high": 34,
    "medium": 67,
    "low": 43,
    "total": 156
}

# Use the safely imported collection
collection.delete_many({})
collection.insert_one(alerts)

print("Daily alerts seeded!")