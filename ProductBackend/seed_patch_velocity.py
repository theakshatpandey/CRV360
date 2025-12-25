from database import db
from datetime import datetime, timedelta

collection = db["patch_velocity"]

base = datetime.utcnow() - timedelta(days=30)

data = []
for i in range(31):
    day = base + timedelta(days=i)
    patches = 20 + i * 1.6  # increasing trend
    data.append({
        "date": day,
        "patches_applied": round(patches),
        "avg_velocity": round(2.4 + i * 0.02, 1)
    })

collection.delete_many({})
collection.insert_many(data)

collection.update_one({}, {"$set": {"total_30d": 71, "avg_daily": 2.4}})

print("Patch velocity seeded!")