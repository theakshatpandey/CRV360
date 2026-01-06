from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database  # force DB init

from routers.assets import router as assets_router
from routers.assets_import import router as assets_import_router
from routers.assets_jobs import router as assets_jobs_router
from routers.asset_relationships import router as asset_relationships_router

app = FastAPI(title="CRV360 Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets_router)
app.include_router(assets_import_router)
app.include_router(assets_jobs_router)
app.include_router(asset_relationships_router)

@app.get("/")
def root():
    return {"message": "CRV360 Unified Backend Running 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy"}
