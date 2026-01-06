# ✅ Safe Import
from database import vulnerabilities_collection
from datetime import datetime

# Alias
collection = vulnerabilities_collection

vulns = [
    {
        "cve_id": "CVE-2024-12345",
        "title": "Remote Code Execution in Apache HTTP Server",
        "cvss": 9.8,
        "severity": "Critical",
        "exploitability": "Exploited in Wild",
        "business_units": ["Finance", "Customer Services"],
        "asset_criticality": "+1",
        "exposure_score": 95,
        "risk_score": 9.5,
        "status": "Open",
        "age_days": 13,
        "threat_actors": ["APT29", "Lazarus Group"]
    },
    {
        "cve_id": "CVE-2024-11111",
        "title": "SQL Injection in MySQL Database",
        "cvss": 8.1,
        "severity": "High",
        "exploitability": "PoC Available",
        "business_units": ["Development", "Finance"],
        "asset_criticality": "",
        "exposure_score": 82,
        "risk_score": 7.8,
        "status": "In Progress",
        "age_days": 39
    },
    {
        "cve_id": "CVE-2024-22222",
        "title": "Cross-Site Scripting in Web Application",
        "cvss": 6.1,
        "severity": "Medium",
        "exploitability": "None",
        "business_units": ["Customer Services"],
        "asset_criticality": "",
        "exposure_score": 68,
        "risk_score": 5.2,
        "status": "Patched",
        "age_days": 74
    },
    {
        "cve_id": "CVE-2024-33333",
        "title": "Buffer Overflow in Network Service",
        "cvss": 7.5,
        "severity": "High",
        "exploitability": "Weaponized",
        "business_units": ["IT Operations"],
        "asset_criticality": "",
        "exposure_score": 88,
        "risk_score": 8.3,
        "status": "Open",
        "age_days": 27,
        "threat_actors": ["FIN7"]
    }
]

collection.delete_many({})
collection.insert_many(vulns)

print("Vulnerabilities inventory seeded!")