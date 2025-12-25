from database import users_collection
from security import get_password_hash
from datetime import datetime

demo_users = [
    {"email": "admin@crv360.dsecure", "name": "Admin User", "role": "Admin"},
    {"email": "ciso@crv360.dsecure", "name": "CISO User", "role": "CISO"},
    {"email": "analyst@crv360.dsecure", "name": "Analyst User", "role": "Analyst"},
]

for u in demo_users:
    users_collection.update_one(
        {"email": u["email"]},
        {"$set": {
            "email": u["email"],
            "name": u["name"],
            "role": u["role"],
            "password": get_password_hash("admin@123"),
            "is_active": True,
            "created_at": datetime.utcnow()
        }},
        upsert=True
    )
    print(f"Added: {u['email']} - Role: {u['role']}")

print("\nAll 3 demo users added to 'product' database! Password: admin@123 🎉")