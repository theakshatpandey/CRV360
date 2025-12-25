from database import db
from datetime import datetime

collection = db["daily_alerts"]

alerts = {
    "date": datetime.utcnow().date().isoformat(),
    "critical": 12,
    "high": 34,
    "medium": 67,
    "low": 43,
    "total": 156
}

collection.delete_many({})
collection.insert_one(alerts)

print("Daily alerts seeded!")