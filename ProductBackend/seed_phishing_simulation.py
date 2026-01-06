# ✅ Safe Imports
from database import phishing_simulations, phishing_templates
from datetime import datetime, timedelta, timezone

def seed_simulation_data():
    """
    Seeds phishing_simulations and phishing_templates collections.
    """
    print("🔄 Starting Phishing Simulation Data Seeding...")

    # Drop existing
    phishing_simulations.drop()
    phishing_templates.drop()
    print("   ✓ Dropped existing collections")

    now = datetime.now(timezone.utc)

    # 1. Phishing Simulations
    simulations = [
        {
            "campaign_id": "SIM-2024-Q1",
            "name": "Q1 Executive Impersonation Drill",
            "status": "Active",
            "targets_count": 250,
            "click_rate": 18.2,
            "report_rate": 67.8,
            "credentials_captured": 12,
            "risk_score": 6.8,
            "start_date": now - timedelta(days=5),
            "end_date": now + timedelta(days=2)
        },
        {
            "campaign_id": "SIM-2023-Q4",
            "name": "Finance Team — Wire Transfer Scam",
            "status": "Completed",
            "targets_count": 89,
            "click_rate": 12.4,
            "report_rate": 78.5,
            "credentials_captured": 4,
            "risk_score": 4.2,
            "start_date": now - timedelta(days=45),
            "end_date": now - timedelta(days=40)
        },
        {
            "campaign_id": "SIM-2024-HR",
            "name": "HR Department — Payroll Phishing",
            "status": "Scheduled",
            "targets_count": 67,
            "click_rate": 0,
            "report_rate": 0,
            "credentials_captured": 0,
            "risk_score": 0,
            "start_date": now + timedelta(days=3),
            "end_date": now + timedelta(days=10)
        },
        {
            "campaign_id": "SIM-2024-IT",
            "name": "IT Operations — Security Alert Test",
            "status": "Active",
            "targets_count": 45,
            "click_rate": 8.9,
            "report_rate": 89.1,
            "credentials_captured": 2,
            "risk_score": 2.1,
            "start_date": now - timedelta(days=1),
            "end_date": now + timedelta(days=6)
        }
    ]

    # 2. Phishing Templates
    templates = [
        {
            "template_id": "TMP-001",
            "name": "CEO Urgent Request",
            "category": "Authority",
            "difficulty": "Hard",
            "success_rate": 32,
            "tactics": ["Authority", "Urgency", "Financial"],
            "content_preview": "Subject: URGENT: Wire Transfer Request\nFrom: ceo@company-internal-mail.com\n\nI need you to process a confidential payment immediately..."
        },
        {
            "template_id": "TMP-002",
            "name": "Banking Update",
            "category": "Financial",
            "difficulty": "Medium",
            "success_rate": 24,
            "tactics": ["Fear", "Legitimacy", "Credential Harvest"],
            "content_preview": "Subject: Action Required: Account Suspended\nFrom: security@bank-alert.com\n\nYour corporate card has been flagged for suspicious activity..."
        },
        {
            "template_id": "TMP-003",
            "name": "Microsoft Security Alert",
            "category": "IT Security",
            "difficulty": "Medium",
            "success_rate": 21,
            "tactics": ["Legitimacy", "Urgency", "Brand Spoof"],
            "content_preview": "Subject: Microsoft 365: Password Expiration\nFrom: no-reply@microsoft-support-secure.com\n\nYour password will expire in 24 hours. Click here to keep your current password."
        },
        {
            "template_id": "TMP-004",
            "name": "Payroll Document Delivery",
            "category": "HR",
            "difficulty": "Easy",
            "success_rate": 15,
            "tactics": ["Trust", "Curiosity", "Macro Payload"],
            "content_preview": "Subject: New Payroll Document Available\nFrom: hr@payroll-service.com\n\nPlease review your updated tax documents attached."
        },
        {
            "template_id": "TMP-005",
            "name": "IT Helpdesk Verification",
            "category": "Social Engineering",
            "difficulty": "Hard",
            "success_rate": 28,
            "tactics": ["Authority", "Internal Trust", "MFA Bypass"],
            "content_preview": "Subject: MFA Code Verification\nFrom: helpdesk@internal-support.com\n\nIT is upgrading the VPN. Please reply with the code sent to your phone."
        },
        {
            "template_id": "TMP-006",
            "name": "Package Delivery Notification",
            "category": "Social",
            "difficulty": "Easy",
            "success_rate": 18,
            "tactics": ["Curiosity", "Legitimacy", "Tracking Link"],
            "content_preview": "Subject: Delivery Attempt Failed\nFrom: tracking@courier-logistics.com\n\nWe could not deliver your package. Click here to reschedule."
        }
    ]

    phishing_simulations.insert_many(simulations)
    print(f"   ✓ Inserted {len(simulations)} simulations")

    phishing_templates.insert_many(templates)
    print(f"   ✓ Inserted {len(templates)} templates")

    print("\n✅ Phishing Simulation data seeding completed successfully!")

if __name__ == "__main__":
    seed_simulation_data()