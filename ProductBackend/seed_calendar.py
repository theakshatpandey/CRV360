from database import db
from datetime import datetime, timedelta

events_collection = db["calendar_events"]

events = [
    {
        "title": "SOC 2 Audit - Evidence Review",
        "date": (datetime.utcnow() + timedelta(days= -2)).isoformat(),
        "priority": "High",
        "type": "audit"
    },
    {
        "title": "Quarterly Patch Cycle",
        "date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
        "priority": "Normal",
        "type": "patch"
    },
    {
        "title": "GDPR Compliance Review",
        "date": (datetime.utcnow() + timedelta(days=4)).isoformat(),
        "priority": "High",
        "type": "compliance"
    },
    {
        "title": "Incident Response Drill",
        "date": (datetime.utcnow() + timedelta(days=6)).isoformat(),
        "priority": "Normal",
        "type": "drill"
    }
]

events_collection.delete_many({})
events_collection.insert_many(events)

print("Calendar events seeded!")