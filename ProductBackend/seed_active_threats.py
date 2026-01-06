from database import active_threats_collection

# Alias for clarity (optional, or just use the variable directly)
collection = active_threats_collection

threats = [
    {
        "cve_id": "CVE-2024-12345",
        "title": "Apache RCE Actively Exploited by APT29",
        "severity": "Critical",
        "cvss": 9.8,
        "exploit_status": "Exploited in Wild",
        "threat_actor": "APT29 (Cozy Bear)",
        "affected_systems": 23,
        "risk_impact": 2.3
    },
    {
        "cve_id": "CVE-2024-XXXXX",
        "title": "Windows Kernel Zero-Day Discovered",
        "severity": "High",
        "cvss": 8.8,
        "exploit_status": "Zero-Day (No patch available)",
        "threat_actor": "Unknown",
        "affected_systems": 145,
        "risk_impact": 1.8
    },
    {
        "cve_id": "CVE-2024-33333",
        "title": "Buffer Overflow - Patch Released",
        "severity": "High",
        "cvss": 7.5,
        "exploit_status": "Weaponized - Public PoC",
        "threat_actor": "FIN7 (Carbanak)",
        "affected_systems": 8,
        "risk_impact": 1.2
    }
]

# Use the safely imported collection
collection.delete_many({})
collection.insert_many(threats)

print("Active threats seeded!")