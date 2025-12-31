from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---- ROUTERS ----
# Ensure these files exist in your 'routes' folder
from routers.assets import router as assets_router
from routers.assets_import import router as assets_import_router
from routers.assets_jobs import router as assets_jobs_router
from routers.asset_relationships import router as asset_relationships_router

app = FastAPI(
    title="CRV360 Backend",
    version="1.0.0"
)

# ---- CORS (THE FIX) ----
# We are using ["*"] to allow ALL origins. This fixes the blockage.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 This allows localhost:3000, 127.0.0.1, etc.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- ROUTER REGISTRATION ----
app.include_router(assets_router)
app.include_router(assets_import_router)
app.include_router(assets_jobs_router)
app.include_router(asset_relationships_router)

# ---- ROOT CHECK ----
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "CRV360 Backend",
        "version": "1.0.0"
    }

# ---- HEALTH CHECK ----
@app.get("/health")
async def health():
    return {"status": "healthy"}