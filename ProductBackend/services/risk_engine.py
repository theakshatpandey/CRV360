def calculate_risk(asset: dict):
    criticality_map = {
        "Critical": 8,
        "High": 6,
        "Medium": 4,
        "Low": 2
    }

    environment_map = {
        "Production": 2,
        "Staging": 1,
        "Development": 0
    }

    asset_type_map = {
        "Server": 2,
        "Cloud Resource": 2,
        "Endpoint": 1,
        "IoT Device": 3,
        "Network Device": 1
    }

    base = criticality_map.get(asset.get("criticality"), 2)
    env = environment_map.get(asset.get("environment"), 0)
    type_score = asset_type_map.get(asset.get("asset_type"), 1)

    risk_score = min(base + env + type_score, 10)

    if risk_score >= 9:
        exposure = "Critical"
        compliance = "Non-Compliant"
    elif risk_score >= 7:
        exposure = "High"
        compliance = "Needs Review"
    elif risk_score >= 4:
        exposure = "Medium"
        compliance = "Needs Review"
    else:
        exposure = "Low"
        compliance = "Compliant"

    return {
        "risk_score": risk_score,
        "exposure_level": exposure,
        "compliance_status": compliance
    }
