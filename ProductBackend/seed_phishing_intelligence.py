# ✅ Safe Import
from database import phishing_intelligence
from datetime import datetime, timedelta, timezone

def seed_phishing_data():
    """
    Seeds the phishing_intelligence collection with realistic threat data.
    """
    print("🔄 Starting Phishing Intelligence Data Seeding...")

    # Drop existing collection to start fresh
    phishing_intelligence.drop()
    print("   ✓ Dropped existing phishing_intelligence collection")

    now = datetime.now(timezone.utc)

    # Realistic Phishing Campaigns
    phishing_data = [
        {
            "threat_id": "PHISH-2024-001",
            "campaign_name": "Microsoft 365 OAuth Consent Grant",
            "impersonated_brand": "Microsoft",
            "status": "Active",
            "severity": "Critical",
            "detected_at": now - timedelta(hours=2),
            "attack_vector": "Email",
            "targets_count": 450,
            "click_rate_estimate": 12.5,
            "indicators_of_compromise": {
                "urls": ["login-microsoft-update.com", "secure-auth-m365.net"],
                "sender_domains": ["support@microsoft-security-alert.com"],
                "subject_lines": ["Urgent: Action Required for your M365 Account"]
            },
            "remediation_status": {
                "domain_takedown": False,
                "email_gateway_block": True,
                "browser_blocklist": False
            }
        },
        {
            "threat_id": "PHISH-2024-002",
            "campaign_name": "Citibank KYC Update Smishing",
            "impersonated_brand": "Citibank",
            "status": "Takedown In Progress",
            "severity": "High",
            "detected_at": now - timedelta(hours=12),
            "attack_vector": "SMS",
            "targets_count": 1200,
            "click_rate_estimate": 8.2,
            "indicators_of_compromise": {
                "urls": ["citi-mobile-verify.info"],
                "sender_domains": [],
                "subject_lines": [] 
            },
            "remediation_status": {
                "domain_takedown": True,
                "email_gateway_block": False, 
                "browser_blocklist": True
            }
        },
        {
            "threat_id": "PHISH-2024-003",
            "campaign_name": "DocuSign Invoice Fraud",
            "impersonated_brand": "DocuSign",
            "status": "Resolved",
            "severity": "Medium",
            "detected_at": now - timedelta(days=2),
            "attack_vector": "Email",
            "targets_count": 85,
            "click_rate_estimate": 4.1,
            "indicators_of_compromise": {
                "urls": ["docs-sign-secure.org"],
                "sender_domains": ["invoice@docusign-docs.com"],
                "subject_lines": ["Invoice #9923 Pending Signature"]
            },
            "remediation_status": {
                "domain_takedown": True,
                "email_gateway_block": True,
                "browser_blocklist": True
            }
        },
        {
            "threat_id": "PHISH-2024-004",
            "campaign_name": "Internal HR Payroll Update",
            "impersonated_brand": "Internal HR",
            "status": "Active",
            "severity": "Critical",
            "detected_at": now - timedelta(minutes=45),
            "attack_vector": "Email (Spear Phishing)",
            "targets_count": 15,
            "click_rate_estimate": 25.0,
            "indicators_of_compromise": {
                "urls": ["hr-portal-employee-verify.com"],
                "sender_domains": ["hr-internal@company-support.net"],
                "subject_lines": ["Action Required: Verify Payroll Details"]
            },
            "remediation_status": {
                "domain_takedown": False,
                "email_gateway_block": False,
                "browser_blocklist": False
            }
        }
    ]

    # Insert Data
    phishing_intelligence.insert_many(phishing_data)
    print(f"   ✓ Inserted {len(phishing_data)} phishing intelligence records")
    print("\n✅ Phishing Intelligence data seeding completed successfully!")

if __name__ == "__main__":
    seed_phishing_data()