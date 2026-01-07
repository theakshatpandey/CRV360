from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
# ✅ Safe Imports
from database import (
    compliance_frameworks,
    compliance_violations,
    compliance_actions,
    evidence_intelligence,
    evidence_gap_reports
)
from core.org_context import get_current_org

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

# ============================================
# COMPLIANCE FRAMEWORKS APIs
# ============================================

@router.get("/frameworks")
async def get_all_frameworks():
    try:
        data = list(compliance_frameworks.find({}, {"_id": 0}))
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frameworks/{framework_id}")
async def get_framework_details(framework_id: str):
    try:
        data = compliance_frameworks.find_one({"framework_id": framework_id}, {"_id": 0})
        if not data:
            raise HTTPException(status_code=404, detail="Framework not found")
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# COMPLIANCE VIOLATIONS APIs
# ============================================

@router.get("/violations")
async def get_all_violations(severity: str = Query(None)):
    try:
        query = {"severity": severity} if severity else {}
        data = list(compliance_violations.find(query, {"_id": 0}))
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/violations/{violation_id}")
async def get_violation_details(violation_id: int):
    try:
        data = compliance_violations.find_one({"violation_id": violation_id}, {"_id": 0})
        if not data:
            raise HTTPException(status_code=404, detail="Violation not found")
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/violations/{violation_id}/status")
async def update_violation_status(violation_id: int, new_status: str):
    try:
        allowed = ["Not Started", "In Progress", "Remediated"]
        if new_status not in allowed:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = compliance_violations.update_one(
            {"violation_id": violation_id},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Violation not found")
        
        data = compliance_violations.find_one({"violation_id": violation_id}, {"_id": 0})
        return {"status": "success", "data": data, "message": f"Updated to {new_status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# COMPLIANCE ACTIONS APIs
# ============================================

@router.get("/actions")
async def get_all_actions(priority: str = Query(None)):
    try:
        query = {"priority": priority} if priority else {}
        data = list(compliance_actions.find(query, {"_id": 0}))
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/actions/{action_id}/take-action")
async def take_action(action_id: int, assigned_to: str = None):
    try:
        result = compliance_actions.update_one(
            {"action_id": action_id},
            {"$set": {"status": "In Progress", "assigned_to": assigned_to, "taken_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Action not found")
        
        data = compliance_actions.find_one({"action_id": action_id}, {"_id": 0})
        return {"status": "success", "data": data, "message": f"Action {action_id} taken"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/actions/{action_id}/complete")
async def complete_action(action_id: int):
    try:
        result = compliance_actions.update_one(
            {"action_id": action_id},
            {"$set": {"status": "Completed", "updated_at": datetime.utcnow()}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Action not found")
        
        data = compliance_actions.find_one({"action_id": action_id}, {"_id": 0})
        return {"status": "success", "data": data, "message": f"Action {action_id} completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# EVIDENCE INTELLIGENCE APIs
# ============================================

@router.get("/evidence")
async def get_evidence_intelligence():
    try:
        data = list(evidence_intelligence.find({}, {"_id": 0}))
        coverage = sum([e["coverage_quality"] for e in data]) / len(data) if data else 0
        gaps = sum([e["gap_count"] for e in data])
        return {"status": "success", "data": data, "overall_coverage": round(coverage, 1), "total_gaps": gaps, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evidence/generate-gap-report")
async def generate_gap_report():
    try:
        evidence = list(evidence_intelligence.find({}, {"_id": 0}))
        report = {
            "report_id": f"gap_report_{datetime.utcnow().timestamp()}",
            "generated_at": datetime.utcnow(),
            "evidence_data": evidence,
            "total_gaps_identified": sum([e["gap_count"] for e in evidence]),
            "summary": {
                "documents": next((e for e in evidence if e["evidence_type"] == "documents"), {}),
                "screenshots": next((e for e in evidence if e["evidence_type"] == "screenshots"), {}),
                "configurations": next((e for e in evidence if e["evidence_type"] == "configurations"), {})
            },
            "recommendations": ["Update documents", "Capture screenshots", "Document configs"]
        }
        evidence_gap_reports.insert_one(report)
        evidence_intelligence.update_many({}, {"$set": {"last_gap_report_generated": datetime.utcnow()}})
        return {"status": "success", "data": report, "message": "Report generated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evidence/gap-reports")
async def get_gap_reports():
    try:
        data = list(evidence_gap_reports.find({}, {"_id": 0}))
        return {"status": "success", "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# EXECUTIVE KPIs API
# ============================================

@router.get("/executive-kpis")
async def get_executive_kpis():
    try:
        frameworks = list(compliance_frameworks.find({}, {"_id": 0}))
        overall = sum([f["compliance_percentage"] for f in frameworks]) / len(frameworks) if frameworks else 0
        
        violations = list(compliance_violations.find({}, {"_id": 0}))
        critical = len([v for v in violations if v["severity"] == "Critical"])
        
        # Hardcoded control stats for demo
        controls_data = [{"tested": 45, "total": 52}, {"tested": 18, "total": 23}, {"tested": 12, "total": 12}, {"tested": 28, "total": 34}, {"tested": 34, "total": 38}]
        tested = sum([c["tested"] for c in controls_data])
        total = sum([c["total"] for c in controls_data])
        
        kpis = {
            "overall_compliance": {"value": round(overall, 1), "trend": 3.2, "target": 85, "status": "improving"},
            "violations": {"value": len(violations), "trend": -5, "critical": critical, "status": "improving"},
            "controls_tested": {"value": tested, "total": total, "percentage": round((tested/total*100), 0), "trend": 12, "status": "strong"},
            "audit_readiness": {"value": 82, "trend": 5, "days_to_audit": 38, "status": "ready"}
        }
        return {"status": "success", "data": kpis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))