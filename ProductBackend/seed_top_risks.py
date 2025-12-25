from database import db
from datetime import datetime

collection = db["top_risks"]

risks = [
    {
        "title": "Unpatched Apache Servers",
        "priority": "Critical",
        "impact": 9.2,
        "likelihood": 8.5,
        "affected_assets": 23,
        "description": "CVE-2024-12345 actively exploited by APT29"
    },
    {
        "title": "Weak Authentication Controls",
        "priority": "High",
        "impact": 8.5,
        "likelihood": 7.2,
        "affected_assets": 234,
        "description": "234 admin accounts without MFA enabled"
    },
    {
        "title": "Cloud Storage Misconfigurations",
        "priority": "High",
        "impact": 7.8,
        "likelihood": 6.5,
        "affected_assets": 67,
        "description": "Public S3 buckets exposing customer data"
    }
]

collection.delete_many({})
collection.insert_many(risks)

print("Top risks seeded!")