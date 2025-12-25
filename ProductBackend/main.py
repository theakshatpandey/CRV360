from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, metrics, assets, vulnerabilities, risk, compliance, events, phishing, phishing_simulation, incident_response, executive_report, settings

app = FastAPI(title="CRV360 Backend - Fresh Start")

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your frontend URL, e.g. "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(metrics.router, prefix="/api", tags=["metrics"])
app.include_router(assets.router, prefix="/api", tags=["assets"])
app.include_router(vulnerabilities.router, prefix="/api", tags=["vulnerabilities"])
app.include_router(risk.router, prefix="/api", tags=["risk"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["compliance"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(phishing.router, prefix="/api", tags=["phishing"])
app.include_router(phishing_simulation.router, prefix="/api", tags=["phishing-simulation"])
app.include_router(incident_response.router, prefix="/api", tags=["incident-response"])
app.include_router(executive_report.router, prefix="/api", tags=["executive-report"])
app.include_router(settings.router, prefix="/api", tags=["settings"])




@app.get("/")
def home():
    return {"message": "Fresh CRV360 Backend with 'product' database ready! 🚀"}