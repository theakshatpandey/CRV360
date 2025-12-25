from database import db
from datetime import datetime

collection = db["assets"]

assets = [
    {
        "name": "prod-db-primary",
        "type": "Database Server",
        "category": "Servers",
        "business_unit": "Finance",
        "exposure_level": "Critical",
        "risk_score": 9.2,
        "compliance_status": "Non-Compliant",
        "critical_issues": 3,
        "tasks": 2,
        "updated_at": datetime.utcnow()
    },
    {
        "name": "web-app-gateway",
        "type": "Web Server",
        "category": "Servers",
        "business_unit": "IT Operations",
        "exposure_level": "High",
        "risk_score": 8.5,
        "compliance_status": "Non-Compliant",
        "critical_issues": 8,
        "tasks": 1,
        "updated_at": datetime.utcnow()
    },
    {
        "name": "finance-workstation-12",
        "type": "Endpoint",
        "category": "Endpoints",
        "business_unit": "Finance",
        "exposure_level": "High",
        "risk_score": 7.8,
        "compliance_status": "Needs Review",
        "critical_issues": 5,
        "tasks": 3,
        "updated_at": datetime.utcnow()
    },
    {
        "name": "cloud-storage-s3-prod",
        "type": "Cloud Resource",
        "category": "Cloud Resources",
        "business_unit": "Development",
        "exposure_level": "Medium",
        "risk_score": 5.2,
        "compliance_status": "Compliant",
        "critical_issues": 0,
        "tasks": 0,
        "updated_at": datetime.utcnow()
    },
    {
        "name": "hr-laptop-05",
        "type": "Endpoint",
        "category": "Endpoints",
        "business_unit": "Human Resources",
        "exposure_level": "Low",
        "risk_score": 3.1,
        "compliance_status": "Compliant",
        "critical_issues": 0,
        "tasks": 0,
        "updated_at": datetime.utcnow()
    }
]

collection.delete_many({})
collection.insert_many(assets)

print("Assets seeded!")