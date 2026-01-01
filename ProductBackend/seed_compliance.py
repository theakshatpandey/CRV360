from database import db  # ✅ Centralized import
from datetime import datetime

def seed_compliance_data():
    """
    Seeds the compliance module with sample data.
    """
    
    print("🔄 Starting Compliance Data Seeding...")
    
    # Drop existing collections to avoid duplicates
    collections_to_drop = ["compliance_frameworks", "compliance_violations", "compliance_actions", "evidence_intelligence"]
    for collection in collections_to_drop:
        if collection in db.list_collection_names():
            db[collection].drop()
            print(f"   ✓ Dropped {collection}")
    
    # ============================================
    # 1. COMPLIANCE FRAMEWORKS COLLECTION
    # ============================================
    frameworks_data = [
        {
            "framework_id": "iso27001",
            "name": "ISO 27001:2022",
            "compliance_percentage": 78.5,
            "status": "In Progress",
            "compliant_count": 58,
            "partial_count": 14,
            "missing_count": 21,
            "total_requirements": 93,
            "next_review_date": datetime(2025, 1, 15),
            "days_until_review": 36,
            "trend": 2.1,
            "color": "blue",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "framework_id": "nist",
            "name": "NIST CSF",
            "compliance_percentage": 82.4,
            "status": "Active",
            "compliant_count": 76,
            "partial_count": 13,
            "missing_count": 19,
            "total_requirements": 108,
            "next_review_date": datetime(2025, 2, 1),
            "days_until_review": 53,
            "trend": 1.5,
            "color": "purple",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "framework_id": "gdpr",
            "name": "GDPR",
            "compliance_percentage": 68.1,
            "status": "Needs Attention",
            "compliant_count": 32,
            "partial_count": 6,
            "missing_count": 9,
            "total_requirements": 47,
            "next_review_date": datetime(2024, 12, 20),
            "days_until_review": 11,
            "trend": -1.2,
            "color": "red",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "framework_id": "sox",
            "name": "SOX",
            "compliance_percentage": 85.3,
            "status": "Active",
            "compliant_count": 26,
            "partial_count": 3,
            "missing_count": 5,
            "total_requirements": 34,
            "next_review_date": datetime(2025, 5, 10),
            "days_until_review": 152,
            "trend": 0.8,
            "color": "green",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "framework_id": "pci",
            "name": "PCI DSS",
            "compliance_percentage": 83.3,
            "status": "Active",
            "compliant_count": 61,
            "partial_count": 4,
            "missing_count": 13,
            "total_requirements": 78,
            "next_review_date": datetime(2025, 3, 1),
            "days_until_review": 81,
            "trend": 2.8,
            "color": "indigo",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    db["compliance_frameworks"].insert_many(frameworks_data)
    print(f"   ✓ Inserted {len(frameworks_data)} frameworks")
    
    # ============================================
    # 2. COMPLIANCE VIOLATIONS COLLECTION
    # ============================================
    violations_data = [
        {
            "violation_id": 1,
            "title": "GDPR Article 32 - Security of Processing",
            "severity": "Critical",
            "framework": "GDPR",
            "affected_assets_count": 67,
            "impact_summary": "Customer PII encryption not implemented on 67 database servers",
            "deadline": datetime(2024, 12, 20),
            "days_remaining": 11,
            "owner": "Security Engineering",
            "status": "In Progress",
            "remediation_steps": [
                {"step": 1, "description": "Enable encryption at rest", "completed": True},
                {"step": 2, "description": "Enable encryption in transit", "completed": False},
                {"step": 3, "description": "Audit encryption implementation", "completed": False}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "violation_id": 2,
            "title": "PCI DSS Requirement 8.2 - Multi-Factor Authentication",
            "severity": "High",
            "framework": "PCI DSS",
            "affected_assets_count": 234,
            "impact_summary": "MFA not enabled for administrative access to cardholder data environment",
            "deadline": datetime(2024, 12, 30),
            "days_remaining": 21,
            "owner": "IT Operations",
            "status": "Not Started",
            "remediation_steps": [
                {"step": 1, "description": "Deploy MFA solution", "completed": False},
                {"step": 2, "description": "Enroll admin users", "completed": False},
                {"step": 3, "description": "Test MFA workflow", "completed": False}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "violation_id": 3,
            "title": "ISO 27001 - A.12.1.2 Change Management",
            "severity": "High",
            "framework": "ISO 27001",
            "affected_assets_count": 45,
            "impact_summary": "Unauthorized changes detected in production environment",
            "deadline": datetime(2025, 1, 15),
            "days_remaining": 36,
            "owner": "DevOps",
            "status": "In Progress",
            "remediation_steps": [
                {"step": 1, "description": "Implement change tracking", "completed": True},
                {"step": 2, "description": "Audit historical changes", "completed": False},
                {"step": 3, "description": "Document remediation", "completed": False}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "violation_id": 4,
            "title": "SOX ITGC - Access Control Reviews",
            "severity": "Medium",
            "framework": "SOX",
            "affected_assets_count": 12,
            "impact_summary": "Quarterly access reviews not completed for financial systems",
            "deadline": datetime(2024, 12, 31),
            "days_remaining": 22,
            "owner": "IT Audit",
            "status": "In Progress",
            "remediation_steps": [
                {"step": 1, "description": "Conduct access review", "completed": True},
                {"step": 2, "description": "Remove unnecessary permissions", "completed": False}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "violation_id": 5,
            "title": "NIST CSF PR.AC-4 - Access Permissions",
            "severity": "Medium",
            "framework": "NIST",
            "affected_assets_count": 89,
            "impact_summary": "Over-privileged accounts identified in user access review",
            "deadline": datetime(2025, 1, 31),
            "days_remaining": 52,
            "owner": "Identity & Access",
            "status": "Not Started",
            "remediation_steps": [
                {"step": 1, "description": "Identify over-privileged accounts", "completed": False},
                {"step": 2, "description": "Remediate privileges", "completed": False}
            ],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    db["compliance_violations"].insert_many(violations_data)
    print(f"   ✓ Inserted {len(violations_data)} violations")
    
    # ============================================
    # 3. COMPLIANCE ACTIONS COLLECTION
    # ============================================
    actions_data = [
        {
            "action_id": 1,
            "priority": "Critical",
            "action_title": "Remediate GDPR encryption gaps",
            "business_impact": "Avoid €20M regulatory fine",
            "timeline_days": 11,
            "effort_level": "High",
            "status": "Open",
            "assigned_to": None,
            "taken_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "action_id": 2,
            "priority": "High",
            "action_title": "Deploy MFA for PCI DSS compliance",
            "business_impact": "Prevent payment processing suspension",
            "timeline_days": 21,
            "effort_level": "Medium",
            "status": "Open",
            "assigned_to": None,
            "taken_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "action_id": 3,
            "priority": "High",
            "action_title": "Complete SOC 2 evidence collection",
            "business_impact": "Pass Q1 audit without findings",
            "timeline_days": 38,
            "effort_level": "Low",
            "status": "Open",
            "assigned_to": None,
            "taken_at": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    db["compliance_actions"].insert_many(actions_data)
    print(f"   ✓ Inserted {len(actions_data)} recommended actions")
    
    # ============================================
    # 4. EVIDENCE INTELLIGENCE COLLECTION
    # ============================================
    evidence_data = [
        {
            "evidence_type": "documents",
            "total_count": 1247,
            "coverage_quality": 87,
            "recent_count": 234,
            "outdated_count": 45,
            "overall_coverage_quality": 85.7,
            "gap_count": 34,
            "last_gap_report_generated": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "evidence_type": "screenshots",
            "total_count": 892,
            "coverage_quality": 78,
            "recent_count": 156,
            "outdated_count": 89,
            "overall_coverage_quality": 85.7,
            "gap_count": 34,
            "last_gap_report_generated": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "evidence_type": "configurations",
            "total_count": 567,
            "coverage_quality": 92,
            "recent_count": 123,
            "outdated_count": 23,
            "overall_coverage_quality": 85.7,
            "gap_count": 34,
            "last_gap_report_generated": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    db["evidence_intelligence"].insert_many(evidence_data)
    print(f"   ✓ Inserted {len(evidence_data)} evidence intelligence records")
    
    print("\n✅ Compliance data seeding completed successfully!")
    print("\nCollections created:")
    print("  - compliance_frameworks (5 frameworks)")
    print("  - compliance_violations (5 violations)")
    print("  - compliance_actions (3 actions)")
    print("  - evidence_intelligence (3 evidence types)")

if __name__ == "__main__":
    seed_compliance_data()