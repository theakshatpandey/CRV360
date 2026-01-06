# ✅ Safe Import
# Ensure 'executive_reports = db["executive_reports"]' is in database.py
from database import executive_reports
from datetime import datetime, timezone

def seed_executive_report_data():
    """
    Seeds executive_reports collection with sample data matching the screenshots.
    """
    print("🔄 Starting Executive Report Data Seeding...")

    # Safe alias
    collection = executive_reports

    # Drop existing
    collection.drop()
    print("   ✓ Dropped existing executive_reports collection")

    now = datetime.now(timezone.utc)

    report_data = {
        "report_id": "REP-2024-12",
        "reporting_period": "December 2024",
        "overall_score": 8.7,
        "score_trend": 0.3,
        "summary": "The organization's security posture improved modestly this month (+0.3 points) driven primarily by enhanced incident response capabilities and accelerated vulnerability remediation. However, regulatory compliance gaps—particularly in GDPR data mapping—pose strategic risk. Three critical initiatives require immediate leadership support: production infrastructure patching, finance network segmentation, and privileged access management completion. Overall cybersecurity maturity is trending positively but remains vulnerable to sophisticated threats.",
        "top_improvements": [
            {"area": "Incident Response SLA", "impact": "MTTR reduced from 48h to 36h", "value": "+12%"},
            {"area": "Vulnerability Remediation", "impact": "Critical patch time reduced 40%", "value": "+8%"},
            {"area": "Security Awareness", "impact": "Phishing click rate down to 3.2%", "value": "+15%"}
        ],
        "areas_of_concern": [
            {"area": "GDPR Compliance Gap", "impact": "-5%", "details": "Data inventory backlog increased"},
            {"area": "Cloud Misconfigurations", "impact": "-3%", "details": "12 new S3 bucket exposures detected"},
            {"area": "Third-Party Risk", "impact": "-2%", "details": "Vendor assessment backlog grew 20%"}
        ],
        "strategic_recommendations": [
            {
                "title": "Patch CVE-2024-12345 Across Production Infrastructure",
                "priority": "Critical",
                "cost": "$15K - $25K",
                "timeline": "2-3 days",
                "impact_description": "65% risk reduction in external attack surface"
            },
            {
                "title": "Implement Network Segmentation for Finance Systems",
                "priority": "High",
                "cost": "$80K - $120K",
                "timeline": "4-6 weeks",
                "impact_description": "78% reduction in lateral movement risk"
            },
            {
                "title": "Complete Privileged Access Management (PAM) Rollout",
                "priority": "High",
                "cost": "$50K - $75K",
                "timeline": "2-3 weeks",
                "impact_description": "8% compliance score improvement"
            }
        ],
        "generated_at": now
    }

    collection.insert_one(report_data)
    print(f"   ✓ Inserted executive report for {report_data['reporting_period']}")
    print("\n✅ Executive Report data seeding completed successfully!")

if __name__ == "__main__":
    seed_executive_report_data()