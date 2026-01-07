from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
# ✅ Safe Imports
from database import assets_collection, asset_relationships_collection
from core.org_context import get_current_org

router = APIRouter(prefix="/api/assets", tags=["Asset Relationships"])

# Aliases
assets_col = assets_collection
relations_col = asset_relationships_collection

class AssetRelationshipCreate(BaseModel):
    source_asset_id: str
    target_asset_id: str
    relationship_type: str

@router.post("/relationships")
async def create_relationship(payload: AssetRelationshipCreate):
    source = assets_col.find_one({"asset_id": payload.source_asset_id})
    target = assets_col.find_one({"asset_id": payload.target_asset_id})

    if not source or not target:
        raise HTTPException(status_code=404, detail="Asset not found")

    relationship = {
        "org_id": source["org_id"],
        "source_asset_id": payload.source_asset_id,
        "target_asset_id": payload.target_asset_id,
        "relationship_type": payload.relationship_type,
        "direction": "OUTBOUND",
        "confidence": "high",
        "discovered_by": "manual",
        "created_at": datetime.utcnow()
    }
    relations_col.insert_one(relationship)
    return {"status": "success", "message": "Relationship created"}

@router.get("/{asset_id}/relationships")
async def get_asset_relationships(asset_id: str):
    pipeline = [
        {"$match": {"source_asset_id": asset_id}},
        {"$lookup": {"from": "assets", "localField": "target_asset_id", "foreignField": "asset_id", "as": "target_asset"}},
        {"$unwind": "$target_asset"},
        {"$project": {"_id": 0, "target_asset_name": "$target_asset.asset_name", "relationship_type": 1, "risk_score": "$target_asset.risk_score", "exposure_level": "$target_asset.exposure_level"}}
    ]
    return list(relations_col.aggregate(pipeline))

@router.get("/{asset_id}/blast-radius")
async def get_blast_radius(asset_id: str, depth: int = 2):
    visited = set()
    impacted_assets = []

    def traverse(current_asset_id: str, level: int):
        if level > depth or current_asset_id in visited: return
        visited.add(current_asset_id)
        
        relations = relations_col.find({"source_asset_id": current_asset_id})
        for rel in relations:
            target = assets_col.find_one({"asset_id": rel["target_asset_id"]}, {"_id": 0})
            if target:
                impacted_assets.append({
                    "asset_id": target["asset_id"],
                    "asset_name": target["asset_name"],
                    "risk_score": target.get("risk_score", 0),
                    "exposure_level": target.get("exposure_level", "Unknown"),
                    "impact_level": level
                })
                traverse(target["asset_id"], level + 1)

    traverse(asset_id, 1)
    return {"root_asset_id": asset_id, "affected_assets": impacted_assets}