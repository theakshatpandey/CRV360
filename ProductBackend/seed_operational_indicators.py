from database import db
from datetime import datetime

indicators_collection = db["operational_indicators"]

indicators = [
    {
        "type": "enterprise_risk",
        "value": 7.2,
        "max": 10,
        "change": 4,
        "change_direction": "down",
        "period": "month",
        "note": "Risk decreased 4% this month",
        "updated_at": datetime.utcnow()
    },
    {
        "type": "active_incidents",
        "total": 7,
        "critical": 2,
        "medium": 5,
        "note": "2 critical, 5 medium priority",
        "updated_at": datetime.utcnow()
    },
    {
        "type": "critical_vulnerabilities",
        "count": 23,
        "previous_count": 31,
        "period": "week",
        "note": "Down from 31 last week",
        "updated_at": datetime.utcnow()
    },
    {
        "type": "compliance_score",
        "percentage": 87.3,
        "status": "On track",
        "target": "Q1 audit",
        "note": "On track for Q1 audit",
        "updated_at": datetime.utcnow()
    }
]

for ind in indicators:
    indicators_collection.update_one(
        {"type": ind["type"]},
        {"$set": ind},
        upsert=True
    )

print("Operational indicators seeded successfully!")