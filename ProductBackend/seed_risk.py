from database import db  # ✅ Centralized import

# Clear existing data (optional, for clean seeding)
db.risk_summary.drop()
db.risk_posture.drop()
db.risk_category_breakdown.drop()
db.risk_business_units.drop()
db.risk_internal_drivers.drop()
db.risk_external_drivers.drop()
db.risk_recommendations.drop()

print("Seeding risk exposure data...")

# 1. risk_summary
db.risk_summary.insert_one({
    "overall_risk": 7.2,
    "projected_risk": 5.9,
    "time_to_remediate": 23,
    "risk_velocity": -12,
    "top_drivers": ["Unpatched Vulns", "Weak Access Controls", "Cloud Misconfig"],
    "monthly_story": "Risk decreased 4% this month driven by aggressive vulnerability patching and MFA rollout. Production systems remain the highest priority area."
})

# 2. risk_posture
db.risk_posture.insert_one({
    "categories": [
        {"category": "Vulnerabilities", "current": 7.5, "target": 5.5, "industry": 7.2, "peer": 7.4},
        {"category": "Threats", "current": 7.5, "target": 5.5, "industry": 7.2, "peer": 7.4},
        {"category": "Assets", "current": 6.8, "target": 5.0, "industry": 6.5, "peer": 6.8},
        {"category": "Access Control", "current": 7.8, "target": 5.8, "industry": 7.5, "peer": 7.7},
        {"category": "Network Security", "current": 6.5, "target": 5.2, "industry": 6.8, "peer": 6.9},
        {"category": "Compliance", "current": 8.1, "target": 6.0, "industry": 7.8, "peer": 8.0}
    ]
})

# 3. risk_category_breakdown
db.risk_category_breakdown.insert_one({
    "breakdown": [
        {"name": "Vulnerabilities", "value": 35, "color": "#ef4444"},
        {"name": "Compliance Gaps", "value": 25, "color": "#f97316"},
        {"name": "Threat Exposure", "value": 25, "color": "#eab308"},
        {"name": "Asset Exposure", "value": 15, "color": "#22c55e"}
    ]
})

# 4. risk_business_units
db.risk_business_units.insert_many([
    {"name": "Production Systems", "risk": 8.5, "contribution": 28.5, "assets": 89, "vulns": 34, "criticality": 95, "trend": -0.2},
    {"name": "Corporate Network", "risk": 7.1, "contribution": 22.3, "assets": 234, "vulns": 45, "criticality": 78, "trend": 0.3},
    {"name": "Remote Endpoints", "risk": 6.9, "contribution": 19.8, "assets": 445, "vulns": 67, "criticality": 65, "trend": -0.4},
    {"name": "Development Environment", "risk": 6.2, "contribution": 15.2, "assets": 67, "vulns": 23, "criticality": 52, "trend": 0.1}
])

# 5. risk_internal_drivers
db.risk_internal_drivers.insert_many([
    {"rank": 1, "title": "Unpatched Systems", "description": "89 production servers missing critical patches", "risk": 8.5, "issues": 89, "incident": "INC-2024-0045"},
    {"rank": 2, "title": "Weak Authentication", "description": "234 admin accounts without MFA", "risk": 7.8, "issues": 234, "incident": "INC-2024-0031"},
    {"rank": 3, "title": "Cloud Misconfigurations", "description": "67 S3 buckets with public exposure", "risk": 7.1, "issues": 67},
    {"rank": 4, "title": "Data Access Controls", "description": "Over-privileged access to customer databases", "risk": 6.9, "issues": 45}
])

# 6. risk_external_drivers
db.risk_external_drivers.insert_many([
    {"rank": 1, "title": "APT29 Campaign Targeting", "description": "Active targeting of Apache servers with CVE-2024-12345", "risk": 8.8, "actor": "APT29 (Cozy Bear)", "incident": "INC-2024-0045"},
    {"rank": 2, "title": "Exposed Services", "description": "23 internet-facing services with known vulnerabilities", "risk": 8.1, "actor": "Multiple threat actors"},
    {"rank": 3, "title": "Phishing Campaigns", "description": "Finance-themed phishing targeting employees", "risk": 7.2, "actor": "FIN7 (Carbanak)", "incident": "INC-2024-0039"},
    {"rank": 4, "title": "Supply Chain Risk", "description": "Third-party vendor security assessments overdue", "risk": 6.5, "actor": "Nation-state actors"}
])

# 7. risk_recommendations
db.risk_recommendations.insert_many([
    {
        "priority": "Critical",
        "roi": "High",
        "title": "Patch CVE-2024-12345 on 23 production servers",
        "description": "Critical RCE vulnerability actively exploited by APT29. Affects Apache HTTP servers.",
        "riskBefore": 7.2,
        "riskAfter": 6.0,
        "reduction": 1.2,
        "buImpact": 9.2,
        "threatsStopped": 3,
        "exposuresClosed": 23,
        "cost": 5000,
        "timeline": "2-3 days",
        "effort": "Medium",
        "assets": 23,
        "businessUnits": ["Production Systems", "IT Operations"]
    },
    {
        "priority": "Critical",
        "roi": "High",
        "title": "Enable MFA for all administrative accounts",
        "description": "Eliminate authentication bypass risk and meet compliance requirements.",
        "riskBefore": 7.2,
        "riskAfter": 6.3,
        "reduction": 0.9,
        "buImpact": 8.5,
        "threatsStopped": 5,
        "exposuresClosed": 234,
        "cost": 2000,
        "timeline": "1 week",
        "effort": "Low",
        "assets": 234,
        "businessUnits": ["Corporate Network", "Remote Endpoints"]
    },
    {
        "priority": "High",
        "roi": "Medium",
        "title": "Implement network segmentation for IoT devices",
        "description": "Isolate IoT/OT devices to prevent lateral movement and reduce attack surface.",
        "riskBefore": 7.2,
        "riskAfter": 6.4,
        "reduction": 0.8,
        "buImpact": 7.8,
        "threatsStopped": 2,
        "exposuresClosed": 67,
        "cost": 25000,
        "timeline": "2-3 weeks",
        "effort": "High",
        "assets": 67,
        "businessUnits": ["Production Systems", "Corporate Network"]
    },
    {
        "priority": "High",
        "roi": "High",
        "title": "Update firewall rules to reduce exposed services",
        "description": "Close unnecessary open ports and restrict external access to critical services.",
        "riskBefore": 7.2,
        "riskAfter": 6.6,
        "reduction": 0.6,
        "buImpact": 7.2,
        "threatsStopped": 4,
        "exposuresClosed": 89,
        "cost": 8000,
        "timeline": "1-2 weeks",
        "effort": "Medium",
        "assets": 89,
        "businessUnits": ["Production Systems", "Cloud Infrastructure"]
    }
])

print("Risk exposure data seeded successfully!")