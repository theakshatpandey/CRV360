# [BACKEND - PYTHON]
# Run this script to wipe the DB and insert fresh test data.

from database import db  # ✅ Centralized import
from datetime import datetime, timedelta

def seed_database():
    try:
        print("✅ SEEDER: Connected to MongoDB via database.py.")

        # 1. Clear old data
        print("🧹 Clearing old data...")
        db.assets.delete_many({})
        db.vulnerabilities.delete_many({})
        db.alerts.delete_many({})

        # 2. Create Assets
        print("🏗️  Creating Assets...")
        assets = [
            {"name": "HQ-Firewall-01", "type": "Network Device", "criticality": "Critical", "ip": "192.168.1.1"},
            {"name": "Finance-DB-Prod", "type": "Database", "criticality": "Critical", "ip": "10.0.5.20"},
            {"name": "HR-Portal-Web", "type": "Web Server", "criticality": "High", "ip": "10.0.5.25"},
            {"name": "Dev-Workstation-04", "type": "Workstation", "criticality": "Low", "ip": "172.16.0.55"}
        ]
        asset_ids = db.assets.insert_many(assets).inserted_ids

        # 3. Create Vulnerabilities (Linked to Assets)
        print("🦠 Creating Vulnerabilities...")
        vulns = [
            {
                "cve_id": "CVE-2024-2345",
                "title": "Remote Code Execution in Firewall Firmware",
                "severity": "Critical",
                "cvss_score": 9.8,
                "status": "Open",
                "asset_id": asset_ids[0], 
                "asset_name": "HQ-Firewall-01",
                "discovered_date": datetime.now() - timedelta(days=5),
                "businessUnits": ["IT Operations", "Network Security"],
                "threat_actors": ["APT29"]
            },
            {
                "cve_id": "CVE-2023-5678",
                "title": "SQL Injection in Finance DB",
                "severity": "High",
                "cvss_score": 8.5,
                "status": "In Progress",
                "asset_id": asset_ids[1],
                "asset_name": "Finance-DB-Prod",
                "discovered_date": datetime.now() - timedelta(days=12),
                "businessUnits": ["Finance", "Internal Audit"],
                "threat_actors": []
            },
            {
                "cve_id": "CVE-2024-1100",
                "title": "Outdated SSL Certificate",
                "severity": "Medium",
                "cvss_score": 5.4,
                "status": "Open",
                "asset_id": asset_ids[2],
                "asset_name": "HR-Portal-Web",
                "discovered_date": datetime.now() - timedelta(days=2),
                "businessUnits": ["HR"],
                "threat_actors": []
            }
        ]
        db.vulnerabilities.insert_many(vulns)

        # 4. Create Alerts (For the 'Active Threats' section)
        print("🚨 Creating Alerts...")
        alerts = [
            {
                "timestamp": datetime.now() - timedelta(minutes=10),
                "severity": "High",
                "source": "SIEM",
                "message": "Multiple failed login attempts detected",
                "affected_asset": "Finance-DB-Prod",
                "status": "New"
            },
            {
                "timestamp": datetime.now() - timedelta(hours=2),
                "severity": "Critical",
                "source": "IDS",
                "message": "Outbound traffic to known C2 server",
                "affected_asset": "HQ-Firewall-01",
                "status": "Escalated"
            }
        ]
        db.alerts.insert_many(alerts)

        print("\n🎉 SUCCESS! Database populated.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    seed_database()