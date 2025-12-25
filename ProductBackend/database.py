
from pymongo import MongoClient

# 1. Connect to MongoDB
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)

# 2. Select the Database (Using "product" as you confirmed earlier)
db = client["product"]

# 3. Export Collections (So routers can import them)
users_collection = db["users"]
assets_collection = db["assets"]
vulnerabilities_collection = db["vulnerabilities"]
alerts_collection = db["alerts"]

print("✅ DATABASE: Connection initialized.")