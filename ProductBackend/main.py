from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---- ROUTERS ----
from routes.assets import router as assets_router
from routes.assets_import import router as assets_import_router
from routes.assets_jobs import router as assets_jobs_router
from routes.asset_relationships import router as asset_relationships_router

# (optional – only if these exist)
# from routes.metrics import router as metrics_router
# from routes.health import router as health_router

app = FastAPI(
    title="CRV360 Backend",
    version="1.0.0"
)

# ---- CORS (MANDATORY FOR VERCEL) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://crv360dsecure.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- ROUTER REGISTRATION (ORDER MATTERS) ----
app.include_router(assets_router)
app.include_router(assets_import_router)
app.include_router(assets_jobs_router)
app.include_router(asset_relationships_router)

# app.include_router(metrics_router)
# app.include_router(health_router)

# ---- ROOT CHECK ----
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "CRV360 Backend",
        "version": "1.0.0"
    }

# ---- HEALTH CHECK (Cloud Run) ----
@app.get("/health")
async def health():
    return {"status": "healthy"}
