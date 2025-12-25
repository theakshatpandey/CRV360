from database import db

collection = db["vuln_severity_distribution"]

dist = [
    {"severity": "Critical", "count": 89, "trend": 12},
    {"severity": "High", "count": 234, "trend": -18},
    {"severity": "Medium", "count": 456, "trend": 23},
    {"severity": "Low", "count": 123, "trend": -8}
]

collection.delete_many({})
collection.insert_many(dist)

print("Severity distribution seeded!")