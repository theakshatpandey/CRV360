from pymongo import MongoClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["product"]

def seed_full_settings():
    print("🔄 Starting Full Settings Data Seeding...")

    # 1. System Settings
    if "system_settings" in db.list_collection_names():
        db["system_settings"].drop()
    
    now = datetime.now(timezone.utc)

    settings = {
        "organization_name": "CyberDefense Corp",
        "contact_email": "admin@cyberdefense.com",
        "profile": {
            "first_name": "John",
            "last_name": "Smith",
            "job_title": "CISO",
            "phone": "+1 (555) 123-4567",
            "department": "Information Security",
            "timezone": "Eastern Standard Time",
            "date_format": "MM/DD/YYYY"
        },
        "security_policy": {
            "mfa_enforced": True,
            "ip_whitelist_enabled": False,
            "session_timeout_minutes": 30,
            "password_expiry_days": 90,
            "failed_login_threshold": 5,
            "api_key": "sk_live_51Mz9..." # Mock
        },
        "notifications": {
            "email_alerts": True,
            "sms_alerts": False,
            "slack_integration": True,
            "webhook_enabled": True
        },
        "integrations": [
            {"name": "CrowdStrike EDR", "status": "Connected", "last_sync": now, "details": "Endpoint Security • 1,247 data points"},
            {"name": "AWS GuardDuty", "status": "Connected", "last_sync": now, "details": "Cloud Security • 892 data points"},
            {"name": "Microsoft Sentinel", "status": "Connected", "last_sync": now, "details": "SIEM • 2,134 data points"},
            {"name": "ServiceNow ITSM", "status": "Pending", "last_sync": None, "details": "Ticketing • 0 data points"},
            {"name": "Splunk Enterprise", "status": "Error", "last_sync": now, "details": "Log Analytics • 567 data points"}
        ],
        "webhook_config": {
            "url": "https://api.internal-system.com/webhooks/security",
            "secret_key": "whsec_...",
            "events": ["incident_created", "critical_alert"]
        },
        "system_metrics": {
            "uptime": "99.95%",
            "avg_response_time": "125ms",
            "data_processed": "2.4TB",
            "alerts_processed": 15632
        }
    }
    db["system_settings"].insert_one(settings)
    print("   ✓ Seeding system_settings")

    # 2. Users
    if "users" in db.list_collection_names():
        db["users"].drop()
    
    users = [
        {"id": "u1", "name": "John Smith", "email": "john.smith@company.com", "role": "Admin", "status": "Active", "last_login": now},
        {"id": "u2", "name": "Sarah Johnson", "email": "sarah.johnson@company.com", "role": "Analyst", "status": "Active", "last_login": now},
        {"id": "u3", "name": "Mike Chen", "email": "mike.chen@company.com", "role": "Analyst", "status": "Active", "last_login": now},
        {"id": "u4", "name": "Lisa Davis", "email": "lisa.davis@company.com", "role": "Viewer", "status": "Inactive", "last_login": now}
    ]
    db["users"].insert_many(users)
    print("   ✓ Seeding users")

    print("\n✅ Full Settings seeding completed!")

if __name__ == "__main__":
    seed_full_settings()