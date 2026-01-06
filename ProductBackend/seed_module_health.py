# ✅ Safe Import
from database import module_health
from datetime import datetime

# Alias
collection = module_health

modules = [
    {
        "module_id": "assets",
        "name": "Asset & Network Management",
        "status": "Healthy",
        "alerts": 2,
        "updated_at": datetime.utcnow()
    },
    {
        "module_id": "vulnerabilities",
        "name": "Vulnerability & Threat Intel",
        "status": "Attention Needed",
        "alerts": 23,
        "updated_at": datetime.utcnow()
    },
    {
        "module_id": "risk",
        "name": "Risk Exposure Dashboard",
        "status": "Improving",
        "alerts": 5,
        "updated_at": datetime.utcnow()
    },
    {
        "module_id": "compliance",
        "name": "Policy & Compliance Tracker",
        "status": "Healthy",
        "alerts": 8,
        "updated_at": datetime.utcnow()
    },
    {
        "module_id": "events",
        "name": "Events & Alert Monitoring",
        "status": "Active",
        "alerts": 18,
        "updated_at": datetime.utcnow()
    },
    {
        "module_id": "incident-response",
        "name": "Incident Response Lite",
        "status": "Healthy",
        "alerts": 3,
        "updated_at": datetime.utcnow()
    }
]

collection.delete_many({})
collection.insert_many(modules)

print("Module health seeded!")