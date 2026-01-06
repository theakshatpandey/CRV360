# ✅ Safe Import
from database import daily_trends
from datetime import datetime, timedelta

# Alias for clarity
trends_collection = daily_trends

# Generate 5 days data
base_date = datetime.utcnow() - timedelta(days=5)

days = ["Mon", "Tue", "Wed", "Thu", "Fri"]

data = []
for i in range(5):
    date = base_date + timedelta(days=i)
    data.append({
        "date": date,
        "day": days[i],
        "risk_score": round(75 + i * 2.5, 1),  # increasing
        "incidents": 15 - i * 2,              # decreasing
        "compliance_percent": round(85 + i * 0.5, 1)
    })

# Clear old and insert new
trends_collection.delete_many({})
trends_collection.insert_many(data)

print("5-day trends seeded!")