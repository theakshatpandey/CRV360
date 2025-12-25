from fastapi import APIRouter, HTTPException, Query
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["product"]

# Create router
router = APIRouter()

# ============================================
# REQUEST & RESPONSE MODELS
# ============================================

class ComplianceFramework:
    """Model for compliance framework data"""
    pass

class ComplianceViolation:
    """Model for compliance violation data"""
    pass

class ComplianceAction:
    """Model for compliance action data"""
    pass

# ============================================
# COMPLIANCE FRAMEWORKS APIs
# ============================================

@router.get("/frameworks")
async def get_all_frameworks():
    """
    GET /api/compliance/frameworks
    
    Fetches all compliance frameworks (ISO, NIST, GDPR, SOX, PCI DSS)
    
    Returns:
        List of frameworks with compliance scores, status, and review dates
    """
    try:
        frameworks = list(db["compliance_frameworks"].find({}, {"_id": 0}))
        return {
            "status": "success",
            "data": frameworks,
            "count": len(frameworks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/frameworks/{framework_id}")
async def get_framework_details(framework_id: str):
    """
    GET /api/compliance/frameworks/{framework_id}
    
    Fetches detailed information about a specific framework
    
    Args:
        framework_id: Framework identifier (iso27001, nist, gdpr, sox, pci)
    
    Returns:
        Detailed framework data with compliance breakdown
    """
    try:
        framework = db["compliance_frameworks"].find_one(
            {"framework_id": framework_id},
            {"_id": 0}
        )
        if not framework:
            raise HTTPException(status_code=404, detail="Framework not found")
        return {
            "status": "success",
            "data": framework
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# COMPLIANCE VIOLATIONS APIs
# ============================================

@router.get("/violations")
async def get_all_violations(severity: str = Query(None)):
    """
    GET /api/compliance/violations
    
    Fetches all compliance violations. Can filter by severity.
    
    Query Parameters:
        severity (optional): Filter by severity (Critical, High, Medium, Low)
    
    Returns:
        List of violations with details and remediation steps
    """
    try:
        query = {}
        if severity:
            query["severity"] = severity
        
        violations = list(db["compliance_violations"].find(query, {"_id": 0}))
        return {
            "status": "success",
            "data": violations,
            "count": len(violations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/violations/{violation_id}")
async def get_violation_details(violation_id: int):
    """
    GET /api/compliance/violations/{violation_id}
    
    Fetches detailed information about a specific violation.
    This API is called when "View Details" button is clicked.
    
    Args:
        violation_id: Violation identifier
    
    Returns:
        Complete violation data with remediation steps and owner info
    """
    try:
        violation = db["compliance_violations"].find_one(
            {"violation_id": violation_id},
            {"_id": 0}
        )
        if not violation:
            raise HTTPException(status_code=404, detail="Violation not found")
        return {
            "status": "success",
            "data": violation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/violations/{violation_id}/status")
async def update_violation_status(violation_id: int, new_status: str):
    """
    POST /api/compliance/violations/{violation_id}/status
    
    Updates the status of a violation (In Progress, Not Started, Remediated)
    
    Args:
        violation_id: Violation identifier
        new_status: New status value
    
    Returns:
        Updated violation data
    """
    try:
        allowed_statuses = ["Not Started", "In Progress", "Remediated"]
        if new_status not in allowed_statuses:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = db["compliance_violations"].update_one(
            {"violation_id": violation_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Violation not found")
        
        violation = db["compliance_violations"].find_one(
            {"violation_id": violation_id},
            {"_id": 0}
        )
        
        return {
            "status": "success",
            "data": violation,
            "message": f"Violation {violation_id} status updated to {new_status}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# COMPLIANCE ACTIONS APIs
# ============================================

@router.get("/actions")
async def get_all_actions(priority: str = Query(None)):
    """
    GET /api/compliance/actions
    
    Fetches all CISO recommended actions. Can filter by priority.
    
    Query Parameters:
        priority (optional): Filter by priority (Critical, High, Medium, Low)
    
    Returns:
        List of recommended actions with timeline and effort
    """
    try:
        query = {}
        if priority:
            query["priority"] = priority
        
        actions = list(db["compliance_actions"].find(query, {"_id": 0}))
        return {
            "status": "success",
            "data": actions,
            "count": len(actions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/actions/{action_id}/take-action")
async def take_action(action_id: int, assigned_to: str = None):
    """
    POST /api/compliance/actions/{action_id}/take-action
    
    Records that a CISO recommended action has been taken.
    This API is called when "Take Action" button is clicked.
    
    Args:
        action_id: Action identifier
        assigned_to (optional): User ID who is taking the action
    
    Returns:
        Updated action data with timestamp
    """
    try:
        result = db["compliance_actions"].update_one(
            {"action_id": action_id},
            {
                "$set": {
                    "status": "In Progress",
                    "assigned_to": assigned_to,
                    "taken_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Action not found")
        
        action = db["compliance_actions"].find_one(
            {"action_id": action_id},
            {"_id": 0}
        )
        
        return {
            "status": "success",
            "data": action,
            "message": f"Action {action_id} has been taken and assigned"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/actions/{action_id}/complete")
async def complete_action(action_id: int):
    """
    POST /api/compliance/actions/{action_id}/complete
    
    Marks a compliance action as completed
    
    Args:
        action_id: Action identifier
    
    Returns:
        Updated action data
    """
    try:
        result = db["compliance_actions"].update_one(
            {"action_id": action_id},
            {
                "$set": {
                    "status": "Completed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Action not found")
        
        action = db["compliance_actions"].find_one(
            {"action_id": action_id},
            {"_id": 0}
        )
        
        return {
            "status": "success",
            "data": action,
            "message": f"Action {action_id} marked as completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# EVIDENCE INTELLIGENCE APIs
# ============================================

@router.get("/evidence")
async def get_evidence_intelligence():
    """
    GET /api/compliance/evidence
    
    Fetches evidence intelligence data (documents, screenshots, configurations)
    
    Returns:
        Evidence data with coverage metrics and gap counts
    """
    try:
        evidence = list(db["evidence_intelligence"].find({}, {"_id": 0}))
        
        # Calculate overall metrics
        overall_coverage = sum([e["coverage_quality"] for e in evidence]) / len(evidence) if evidence else 0
        total_gaps = sum([e["gap_count"] for e in evidence])
        
        return {
            "status": "success",
            "data": evidence,
            "overall_coverage": round(overall_coverage, 1),
            "total_gaps": total_gaps,
            "count": len(evidence)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evidence/generate-gap-report")
async def generate_gap_report():
    """
    POST /api/compliance/evidence/generate-gap-report
    
    Generates a gap report for compliance evidence.
    This API is called when "Generate Gap Report" button is clicked.
    
    Returns:
        Gap report data with identified gaps and recommendations
    """
    try:
        # Fetch all evidence intelligence records
        evidence = list(db["evidence_intelligence"].find({}, {"_id": 0}))
        
        # Create gap report
        gap_report = {
            "report_id": f"gap_report_{datetime.utcnow().timestamp()}",
            "generated_at": datetime.utcnow(),
            "evidence_data": evidence,
            "total_gaps_identified": sum([e["gap_count"] for e in evidence]),
            "summary": {
                "documents": next((e for e in evidence if e["evidence_type"] == "documents"), {}),
                "screenshots": next((e for e in evidence if e["evidence_type"] == "screenshots"), {}),
                "configurations": next((e for e in evidence if e["evidence_type"] == "configurations"), {})
            },
            "recommendations": [
                "Update outdated documents to reflect current system configuration",
                "Capture screenshots of recent security configurations",
                "Document configuration changes in compliance tracking system"
            ]
        }
        
        # Store report in MongoDB
        db["evidence_gap_reports"].insert_one(gap_report)
        
        # Update last_gap_report_generated timestamp
        db["evidence_intelligence"].update_many(
            {},
            {"$set": {"last_gap_report_generated": datetime.utcnow()}}
        )
        
        return {
            "status": "success",
            "data": gap_report,
            "message": "Gap report generated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/evidence/gap-reports")
async def get_gap_reports():
    """
    GET /api/compliance/evidence/gap-reports
    
    Fetches all generated gap reports
    
    Returns:
        List of gap reports with details
    """
    try:
        reports = list(db["evidence_gap_reports"].find({}, {"_id": 0}))
        return {
            "status": "success",
            "data": reports,
            "count": len(reports)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# CONTROL MATURITY APIs
# ============================================

@router.get("/controls")
async def get_all_controls():
    """
    GET /api/compliance/controls
    
    Fetches all compliance controls with maturity scores
    
    Returns:
        List of controls with effectiveness and test data
    """
    try:
        # Hardcoded controls data (can be moved to database if needed)
        controls = [
            {
                "id": 1,
                "name": "Access Control",
                "framework": "Multiple",
                "maturity_score": 4.2,
                "max_score": 5.0,
                "effectiveness": 84,
                "tested": 45,
                "total": 52,
                "status": "Mature",
                "last_test": "2 weeks ago"
            },
            {
                "id": 2,
                "name": "Encryption & Cryptography",
                "framework": "GDPR, PCI DSS",
                "maturity_score": 3.1,
                "max_score": 5.0,
                "effectiveness": 62,
                "tested": 18,
                "total": 23,
                "status": "Developing",
                "last_test": "1 month ago"
            },
            {
                "id": 3,
                "name": "Incident Response",
                "framework": "ISO 27001, NIST",
                "maturity_score": 4.5,
                "max_score": 5.0,
                "effectiveness": 90,
                "tested": 12,
                "total": 12,
                "status": "Optimized",
                "last_test": "1 week ago"
            },
            {
                "id": 4,
                "name": "Change Management",
                "framework": "SOX, ISO 27001",
                "maturity_score": 3.8,
                "max_score": 5.0,
                "effectiveness": 76,
                "tested": 28,
                "total": 34,
                "status": "Defined",
                "last_test": "3 weeks ago"
            },
            {
                "id": 5,
                "name": "Vulnerability Management",
                "framework": "PCI DSS, NIST",
                "maturity_score": 4.0,
                "max_score": 5.0,
                "effectiveness": 80,
                "tested": 34,
                "total": 38,
                "status": "Managed",
                "last_test": "1 week ago"
            }
        ]
        
        return {
            "status": "success",
            "data": controls,
            "count": len(controls)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# EXECUTIVE KPIs API
# ============================================

@router.get("/executive-kpis")
async def get_executive_kpis():
    """
    GET /api/compliance/executive-kpis
    
    Fetches executive KPI summary for compliance dashboard
    
    Returns:
        Overall compliance, violations, controls, and audit readiness metrics
    """
    try:
        # Get frameworks for overall compliance calculation
        frameworks = list(db["compliance_frameworks"].find({}, {"_id": 0}))
        overall_compliance = sum([f["compliance_percentage"] for f in frameworks]) / len(frameworks) if frameworks else 0
        
        # Get violations
        violations = list(db["compliance_violations"].find({}, {"_id": 0}))
        critical_violations = len([v for v in violations if v["severity"] == "Critical"])
        
        # Get controls
        controls_data = [
            {"tested": 45, "total": 52},
            {"tested": 18, "total": 23},
            {"tested": 12, "total": 12},
            {"tested": 28, "total": 34},
            {"tested": 34, "total": 38}
        ]
        total_tested = sum([c["tested"] for c in controls_data])
        total_controls = sum([c["total"] for c in controls_data])
        
        kpis = {
            "overall_compliance": {
                "value": round(overall_compliance, 1),
                "trend": 3.2,
                "target": 85,
                "status": "improving"
            },
            "violations": {
                "value": len(violations),
                "trend": -5,
                "critical": critical_violations,
                "status": "improving"
            },
            "controls_tested": {
                "value": total_tested,
                "total": total_controls,
                "percentage": round((total_tested / total_controls * 100), 0),
                "trend": 12,
                "status": "strong"
            },
            "audit_readiness": {
                "value": 82,
                "trend": 5,
                "days_to_audit": 38,
                "status": "ready"
            }
        }
        
        return {
            "status": "success",
            "data": kpis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
