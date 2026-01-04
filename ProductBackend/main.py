from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
# CORS (OPEN FOR NOW)
# -----------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# ROUTERS
# -----------------------------------
app.include_router(assets_router)
app.include_router(assets_import_router)
app.include_router(assets_jobs_router)
app.include_router(asset_relationships_router)

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
# HEALTH (NO DB TOUCH)
# -----------------------------------
@app.get("/health")
async def health():
    return {"status": "healthy"}
