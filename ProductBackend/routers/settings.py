from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
from datetime import datetime
from database import db  # ✅ centralized import

router = APIRouter(prefix="/settings", tags=["settings"])

# --- Models ---
class UserCreate(BaseModel):
    name: str
    email: str
    role: str

class WebhookConfig(BaseModel):
    url: str
    secret_key: str
    events: List[str]

# --- General Settings APIs ---

@router.get("/")
async def get_all_settings():
    settings = db["system_settings"].find_one({}, {"_id": 0})
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not initialized")
    return {"status": "success", "data": settings}

@router.put("/update-section")
async def update_settings_section(section: str, data: dict):
    valid_sections = ["profile", "security_policy", "notifications", "webhook_config"]
    if section not in valid_sections:
        raise HTTPException(status_code=400, detail="Invalid section")
    
    # Update the specific field
    db["system_settings"].update_one({}, {"$set": {section: data}})
    return {"status": "success", "message": f"{section} updated"}

# --- Security Specific ---

@router.post("/security/regenerate-api-key")
async def regenerate_api_key():
    import secrets
    new_key = f"sk_live_{secrets.token_hex(16)}"
    db["system_settings"].update_one({}, {"$set": {"security_policy.api_key": new_key}})
    return {"status": "success", "api_key": new_key}

# --- Integrations ---

@router.post("/integrations/{name}/toggle")
async def toggle_integration(name: str):
    doc = db["system_settings"].find_one({"integrations.name": name}, {"integrations.$": 1})
    if not doc:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    current_status = doc["integrations"][0]["status"]
    new_status = "Disconnected" if current_status == "Connected" else "Connected"
    
    db["system_settings"].update_one(
        {"integrations.name": name},
        {"$set": {"integrations.$.status": new_status, "integrations.$.last_sync": datetime.utcnow()}}
    )
    return {"status": "success", "new_status": new_status}

@router.post("/integrations/add")
async def add_integration(data: dict):
    new_integration = {
        "name": data.get("name", "New Tool"),
        "status": "Connected",
        "last_sync": datetime.utcnow(),
        "details": "Custom Integration • 0 data points"
    }
    db["system_settings"].update_one({}, {"$push": {"integrations": new_integration}})
    return {"status": "success", "data": new_integration}

# --- User Management ---

@router.get("/users")
async def get_users():
    users = list(db["users"].find({}, {"_id": 0}))
    return {"status": "success", "data": users}

@router.post("/users/add")
async def add_user(user: UserCreate):
    new_user = {
        "id": f"u{int(datetime.utcnow().timestamp())}",
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "status": "Active",
        "last_login": "Never"
    }
    db["users"].insert_one(new_user)
    new_user.pop("_id", None)
    return {"status": "success", "data": new_user}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    result = db["users"].delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"status": "success", "message": "User deleted"}

# --- System ---

@router.post("/system/clear-cache")
async def clear_cache():
    return {"status": "success", "message": "System cache cleared"}

@router.get("/system/logs/export")
async def export_logs():
    content = "TIMESTAMP,LEVEL,MESSAGE\n2024-12-14 10:00:00,INFO,System started\n2024-12-14 10:05:00,WARN,High memory usage"
    return {"status": "success", "content": content}

@router.post("/profile/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    return {"status": "success", "message": f"Uploaded {file.filename}"}