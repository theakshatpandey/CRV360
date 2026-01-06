# ✅ Safe Import
from database import metrics_collection
from datetime import datetime

key_metrics = [
    {
        "type": "security_score",
        "value": 8.7,
        "max": 10,
        "status": "Strong",
        "change": 0.3,
        "change_direction": "up",
        "period": "month",
        "updated_at": datetime.utcnow()
    },
    {
        "type": "mttd",
        "value": 4.2,
        "unit": "h",
        "target": 6.0,
        "status": "Beating target",
        "change": 0.8,
        "change_direction": "down",
        "updated_at": datetime.utcnow()
    },
    {
        "type": "mttr",
        "value": 12.5,
        "unit": "h",
        "target": 16.0,
        "status": "Beating target",
        "change": 2.3,
        "change_direction": "down",
        "updated_at": datetime.utcnow()
    },
    {
        "type": "security_roi",
        "value": 3.2,
        "unit": "x",
        "target": 2.5,
        "status": "Exceeding",
        "change_percentage": 15,
        "change_direction": "up",
        "updated_at": datetime.utcnow()
    }
]

# Insert or update each metric
for m in key_metrics:
    metrics_collection.update_one(
        {"type": m["type"]},
        {"$set": m},
        upsert=True  # create if not exists
    )

print("Key metrics seeded successfully! Check MongoDB Compass.")