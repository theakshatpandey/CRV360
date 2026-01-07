import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Force DB Init
import database

# -----------------------------------
# ROUTER IMPORTS
# -----------------------------------
# 1. Assets
from routers.assets import router as assets_router
from routers.assets_import import router as assets_import_router
from routers.assets_jobs import router as assets_jobs_router
from routers.asset_relationships import router as asset_relationships_router

# 2. Security Modules
from routers.auth import router as auth_router
from routers.compliance import router as compliance_router
from routers.events import router as events_router
from routers.incident_response import router as incident_response_router
from routers.metrics import router as metrics_router
from routers.phishing import router as phishing_router
from routers.phishing_simulation import router as phishing_sim_router
from routers.risk import router as risk_router
from routers.settings import router as settings_router
from routers.vulnerabilities import router as vulnerabilities_router
from routers.executive_report import router as executive_report_router

# -----------------------------------
# APP SETUP
# -----------------------------------
app = FastAPI(title="CRV360 Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# INCLUDE ROUTERS
# -----------------------------------
app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(assets_import_router)
app.include_router(assets_jobs_router)
app.include_router(asset_relationships_router)
app.include_router(compliance_router)
app.include_router(events_router)
app.include_router(incident_response_router)
app.include_router(metrics_router)
app.include_router(phishing_router)
app.include_router(phishing_sim_router)
app.include_router(risk_router)
app.include_router(settings_router)
app.include_router(vulnerabilities_router)
app.include_router(executive_report_router)

# -----------------------------------
# ROOT ENDPOINTS
# -----------------------------------
@app.get("/")
def root():
    return {"message": "CRV360 Unified Backend Running 🚀", "status": "active"}

@app.get("/health")
def health():
    return {"status": "healthy"}

# -----------------------------------
# CLOUD RUN ENTRY POINT
# -----------------------------------
if __name__ == "__main__":
    # Retrieve PORT env var (Cloud Run sets this to 8080)
    # Default to 8000 for local development
    port = int(os.environ.get("PORT", 8000))
    
    # Host must be 0.0.0.0 for container access
    uvicorn.run("main:app", host="0.0.0.0", port=port)