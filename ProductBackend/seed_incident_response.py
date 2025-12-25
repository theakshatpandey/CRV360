from pymongo import MongoClient
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["product"]

def seed_incident_data():
    """
    Seeds incident_responses collection with detailed data for IR Lite module.
    """
    print("🔄 Starting Incident Response Data Seeding...")

    COLLECTION_NAME = "incident_responses"

    # Drop to ensure clean slate for this module's testing
    if COLLECTION_NAME in db.list_collection_names():
        db[COLLECTION_NAME].drop()
        print(f"   ✓ Dropped existing {COLLECTION_NAME} collection")

    now = datetime.now(timezone.utc)

    incidents = [
        {
            "incident_id": "INC-2024-0001",
            "title": "Lateral Movement in Finance Network",
            "severity": "Critical",
            "business_impact": "High",
            "business_unit": "Finance",
            "root_cause": "Phishing",
            "status": "Contained",
            "owner": "Sarah Connor",
            "resolution_time": "Ongoing",
            "detected_at": now - timedelta(days=1),
            "updated_at": now - timedelta(hours=2),
            "regulatory_impact": ["GDPR", "SOX"],
            "sla_status": "At Risk"
        },
        {
            "incident_id": "INC-2024-0002",
            "title": "Ransomware in Development Environment",
            "severity": "High",
            "business_impact": "Medium",
            "business_unit": "Development",
            "root_cause": "Malware",
            "status": "Resolved",
            "owner": "John Wick",
            "resolution_time": "18h",
            "detected_at": now - timedelta(days=2),
            "updated_at": now - timedelta(days=1),
            "regulatory_impact": [],
            "sla_status": "Met"
        },
        {
            "incident_id": "INC-2024-0003",
            "title": "Cloud Account Data Exfiltration",
            "severity": "High",
            "business_impact": "High",
            "business_unit": "Corporate IT",
            "root_cause": "Misconfiguration",
            "status": "In Progress",
            "owner": "Neo Anderson",
            "resolution_time": "Ongoing",
            "detected_at": now - timedelta(hours=5),
            "updated_at": now - timedelta(minutes=30),
            "regulatory_impact": ["GDPR"],
            "sla_status": "On Track"
        },
        {
            "incident_id": "INC-2024-0004",
            "title": "DDoS Attack on Customer Portal",
            "severity": "Medium",
            "business_impact": "Medium",
            "business_unit": "Customer Services",
            "root_cause": "External Attack",
            "status": "Resolved",
            "owner": "Trinity",
            "resolution_time": "3h",
            "detected_at": now - timedelta(days=3),
            "updated_at": now - timedelta(days=3, hours=3),
            "regulatory_impact": ["PCI-DSS"],
            "sla_status": "Met"
        },
        {
            "incident_id": "INC-2024-0005",
            "title": "Insider Threat: Unauthorized Data Access",
            "severity": "High",
            "business_impact": "High",
            "business_unit": "HR & Operations",
            "root_cause": "Insider Threat",
            "status": "Resolved",
            "owner": "Morpheus",
            "resolution_time": "2d",
            "detected_at": now - timedelta(days=5),
            "updated_at": now - timedelta(days=3),
            "regulatory_impact": ["HIPAA"],
            "sla_status": "Missed"
        }
    ]

    db[COLLECTION_NAME].insert_many(incidents)
    print(f"   ✓ Inserted {len(incidents)} incidents")
    print("\n✅ Incident Response data seeding completed successfully!")

if __name__ == "__main__":
    seed_incident_data()