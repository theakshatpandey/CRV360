from database import db

collection = db["risky_assets"]

risks = [
    {
        "asset_name": "prod-db-primary",
        "risk_score": 9.2,
        "business_impact": "Customer data exposure risk. Revenue-critical database.",
        "critical_issues": 3,
        "business_unit": "Finance",
        "recommended_action": "Apply emergency patch immediately"
    },
    {
        "asset_name": "web-app-gateway",
        "risk_score": 8.5,
        "business_impact": "Customer portal access point. Brand reputation risk.",
        "critical_issues": 8,
        "business_unit": "IT Operations",
        "recommended_action": "Isolate and patch within 48 hours"
    },
    {
        "asset_name": "finance-workstation-12",
        "risk_score": 7.8,
        "business_impact": "Finance department workstation with access to payment systems.",
        "critical_issues": 5,
        "business_unit": "Finance",
        "recommended_action": "Enable EDR and revoke admin rights"
    }
]

collection.delete_many({})
collection.insert_many(risks)

print("Risky assets seeded!")