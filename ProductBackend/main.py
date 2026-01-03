from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# -----------------------------------
# FORCE DATABASE INITIALIZATION
# -----------------------------------
# IMPORTANT:
# This ensures MongoDB connects ONCE at startup
# and prevents localhost / multiple-client bugs
import database  # noqa: F401


# -----------------------------------
# ROUTERS
# -----------------------------------
from routers.assets import router as assets_router
from routers.assets_import import router as assets_import_router
from routers.assets_jobs import router as assets_jobs_router
from routers.asset_relationships import router as asset_relationships_router


# -----------------------------------
# FASTAPI APP
# -----------------------------------
app = FastAPI(
    title="CRV360 Backend",
    version="1.0.0",
)


# -----------------------------------
# CORS CONFIG (INTENTIONAL OPEN)
# -----------------------------------
# Safe for now (API-only backend)
# Can be locked later when frontend domain stabilizes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------
# ROUTER REGISTRATION
# -----------------------------------
app.include_router(assets_router)
app.include_router(assets_import_router)
app.include_router(assets_jobs_router)
app.include_router(asset_relationships_router)


# -----------------------------------
# STARTUP EVENT
# -----------------------------------
@app.on_event("startup")
async def startup_event():
    # If database.py failed, app would never reach here
    print("✅ CRV360 Backend started successfully")


# -----------------------------------
# ROOT
# -----------------------------------
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "CRV360 Backend",
        "version": "1.0.0",
    }


# -----------------------------------
# HEALTH CHECK (NO DB TOUCH)
# -----------------------------------
@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
