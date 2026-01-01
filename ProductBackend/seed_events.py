from database import db  # ✅ Centralized import
from datetime import datetime, timedelta, timezone

def seed_events_data():
    """
    Seeds the events & alert monitoring module with sample data.
    """
    
    print("🔄 Starting Events & Alert Monitoring Data Seeding...")
    
    # Drop existing collections
    collections_to_drop = ["threat_campaigns", "security_alerts", "incident_responses", "alert_metrics"]
    for collection in collections_to_drop:
        if collection in db.list_collection_names():
            db[collection].drop()
            print(f"   ✓ Dropped {collection}")
    
    # Helper for current UTC time
    now = datetime.now(timezone.utc)

    # ============================================
    # 1. THREAT CAMPAIGNS
    # ============================================
    campaigns_data = [
        {
            "campaign_id": "CAMP-001",
            "name": "Operation Cloud Heist",
            "severity": "Critical",
            "status": "Active",
            "confidence": 92,
            "impact_score": 95,
            "duration": "1d 10h",
            "affected_assets": 8,
            "alert_count": 23,
            "impacted_business_units": ["Production", "Finance", "Customer Data"],
            "mitre_tactics": ["Initial Access", "Execution", "Persistence", "Privilege Escalation", "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement", "Collection", "Exfiltration"],
            "techniques": ["T1078", "T1059.001", "T1543", "T1068", "T1562", "T1003", "T1046", "T1021", "T1005", "T1041"],
            "created_at": now,
            "updated_at": now
        },
        {
            "campaign_id": "CAMP-002",
            "name": "Supply Chain Compromise Attempt",
            "severity": "High",
            "status": "Contained",
            "confidence": 87,
            "impact_score": 78,
            "duration": "2h 30m",
            "affected_assets": 3,
            "alert_count": 8,
            "impacted_business_units": ["Development & QA"],
            "mitre_tactics": ["Initial Access", "Discovery", "Lateral Movement"],
            "techniques": ["T1199", "T1046", "T1021"],
            "created_at": now - timedelta(days=1),
            "updated_at": now - timedelta(hours=18)
        },
        {
            "campaign_id": "CAMP-003",
            "name": "Ransomware Pre-Attack Sequence",
            "severity": "Critical",
            "status": "Contained",
            "confidence": 89,
            "impact_score": 88,
            "duration": "1h 45m",
            "affected_assets": 5,
            "alert_count": 15,
            "impacted_business_units": ["IT Operations", "Backup & DR"],
            "mitre_tactics": ["Discovery", "Credential Access", "Defense Evasion", "Impact"],
            "techniques": ["T1082", "T1087", "T1003", "T1562", "T1490"],
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(hours=36)
        }
    ]
    
    db["threat_campaigns"].insert_many(campaigns_data)
    print(f"   ✓ Inserted {len(campaigns_data)} threat campaigns")
    
    # ============================================
    # 2. SECURITY ALERTS
    # ============================================
    alerts_data = [
        {
            "alert_id": "ALT-2024-001234",
            "title": "Suspicious PowerShell Execution",
            "description": "Base64 encoded PowerShell command detected on multiple servers",
            "severity": "Critical",
            "status": "Open",
            "alert_source": "CrowdStrike EDR",
            "campaign_id": "CAMP-001",
            "detected_at": now - timedelta(hours=4),
            "assigned_to": "SOC Analyst 1",
            "last_activity": now - timedelta(hours=3),
            "created_at": now - timedelta(hours=4),
            "updated_at": now - timedelta(hours=3)
        },
        {
            "alert_id": "ALT-2024-001235",
            "title": "Unusual Network Traffic Pattern",
            "description": "Abnormal data exfiltration pattern detected to external IP",
            "severity": "High",
            "status": "In Progress",
            "alert_source": "AWS GuardDuty",
            "campaign_id": "CAMP-001",
            "detected_at": now - timedelta(hours=3),
            "assigned_to": "SOC Analyst 2",
            "last_activity": now - timedelta(minutes=30),
            "created_at": now - timedelta(hours=3),
            "updated_at": now - timedelta(minutes=30)
        },
        {
            "alert_id": "ALT-2024-001236",
            "title": "Failed Authentication Attempts",
            "description": "Multiple failed login attempts from suspicious IP addresses",
            "severity": "Medium",
            "status": "Resolved",
            "alert_source": "Microsoft Sentinel",
            "campaign_id": None,
            "detected_at": now - timedelta(days=1),
            "assigned_to": "SOC Analyst 3",
            "last_activity": now - timedelta(hours=12),
            "created_at": now - timedelta(days=1),
            "updated_at": now - timedelta(hours=12)
        },
        {
            "alert_id": "ALT-2024-001237",
            "title": "Ransomware Behavior Detected",
            "description": "File encryption patterns and shadow copy deletion attempts",
            "severity": "Critical",
            "status": "Contained",
            "alert_source": "CrowdStrike EDR",
            "campaign_id": "CAMP-003",
            "detected_at": now - timedelta(days=2),
            "assigned_to": "SOC Lead",
            "last_activity": now - timedelta(hours=36),
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(hours=36)
        },
        {
            "alert_id": "ALT-2024-001238",
            "title": "Port Scanning Activity",
            "description": "Systematic port scanning detected from external source",
            "severity": "Medium",
            "status": "Open",
            "alert_source": "Palo Alto Firewall",
            "campaign_id": None,
            "detected_at": now - timedelta(hours=6),
            "assigned_to": "SOC Analyst 1",
            "last_activity": now - timedelta(hours=5),
            "created_at": now - timedelta(hours=6),
            "updated_at": now - timedelta(hours=5)
        },
        {
            "alert_id": "ALT-2024-001239",
            "title": "Vendor VPN Anomaly",
            "description": "Unusual access patterns from third-party vendor VPN connection",
            "severity": "High",
            "status": "Contained",
            "alert_source": "VPN Gateway",
            "campaign_id": "CAMP-002",
            "detected_at": now - timedelta(hours=5),
            "assigned_to": "SOC Analyst 2",
            "last_activity": now - timedelta(hours=4),
            "created_at": now - timedelta(hours=5),
            "updated_at": now - timedelta(hours=4)
        }
    ]
    
    db["security_alerts"].insert_many(alerts_data)
    print(f"   ✓ Inserted {len(alerts_data)} security alerts")
    
    # ============================================
    # 3. INCIDENT RESPONSES
    # ============================================
    responses_data = [
        {
            "response_id": "RESP-001",
            "campaign_id": "CAMP-001",
            "action_type": "Launch Incident Response",
            "description": "Immediate isolation of affected systems, credential rotation, forensic analysis, and executive briefing.",
            "status": "In Progress",
            "started_at": now - timedelta(hours=4),
            "completed_at": None,
            "owner": "SOC Lead",
            "created_at": now - timedelta(hours=4),
            "updated_at": now - timedelta(minutes=30)
        },
        {
            "response_id": "RESP-002",
            "campaign_id": "CAMP-002",
            "action_type": "Launch Incident Response",
            "description": "Vendor access review, MFA enforcement, network segmentation validation.",
            "status": "Completed",
            "started_at": now - timedelta(hours=5),
            "completed_at": now - timedelta(hours=2),
            "owner": "Security Engineering",
            "created_at": now - timedelta(hours=5),
            "updated_at": now - timedelta(hours=2)
        },
        {
            "response_id": "RESP-003",
            "campaign_id": "CAMP-003",
            "action_type": "Launch Incident Response",
            "description": "System isolation, backup system access blocked, attacker isolated, threat neutralized before encryption phase.",
            "status": "Completed",
            "started_at": now - timedelta(days=2),
            "completed_at": now - timedelta(hours=36),
            "owner": "SOC Lead",
            "created_at": now - timedelta(days=2),
            "updated_at": now - timedelta(hours=36)
        }
    ]
    
    db["incident_responses"].insert_many(responses_data)
    print(f"   ✓ Inserted {len(responses_data)} incident responses")
    
    # ============================================
    # 4. ALERT METRICS
    # ============================================
    
    # Mongo cannot accept date() objects, so we use datetime set to midnight
    today_midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)

    metrics_data = [
        {
            "metric_date": today_midnight, 
            "mttr_minutes": 45,
            "mittd_minutes": 8,
            "sla_compliance": 94.5,
            "critical_threats": 3,
            "alerts_24h": 156,
            "alerts_7d": 1089,
            "alerts_30d": 4532,
            "escalation_rate": 12,
            "correlation_efficiency": 87,
            "created_at": now,
            "updated_at": now
        }
    ]
    
    db["alert_metrics"].insert_many(metrics_data)
    print(f"   ✓ Inserted {len(metrics_data)} alert metrics")
    
    print("\n✅ Events & Alert Monitoring data seeding completed successfully!")

if __name__ == "__main__":
    seed_events_data()