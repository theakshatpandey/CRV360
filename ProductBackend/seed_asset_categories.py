from database import db

collection = db["asset_categories"]

categories = [
    {"category": "Servers", "total": 189, "compliant": 137, "percentage": 72.5},
    {"category": "Endpoints", "total": 523, "compliant": 477, "percentage": 91.2},
    {"category": "Cloud Resources", "total": 312, "compliant": 299, "percentage": 95.8},
    {"category": "Network Devices", "total": 89, "compliant": 79, "percentage": 88.3},
    {"category": "IoT Devices", "total": 134, "compliant": 92, "percentage": 68.7}
]

collection.delete_many({})
collection.insert_many(categories)

print("Asset categories seeded!")