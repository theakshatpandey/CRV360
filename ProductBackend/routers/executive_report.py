from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io
from database import db  # ✅ centralized import
from core.org_context import get_current_org


router = APIRouter(prefix="/executive-report", tags=["executive-report"])

@router.get("/latest")
async def get_latest_report():
    try:
        report = db["executive_reports"].find_one({}, {"_id": 0}, sort=[("generated_at", -1)])
        if not report:
            raise HTTPException(status_code=404, detail="No report found")
        return {"status": "success", "data": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export-pdf")
async def export_pdf():
    try:
        report = db["executive_reports"].find_one({}, {"_id": 0}, sort=[("generated_at", -1)])
        if not report:
            raise HTTPException(status_code=404, detail="No report found")

        # Create PDF in memory
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Header
        p.setFont("Helvetica-Bold", 18)
        p.drawString(50, height - 50, "Executive Security Report")
        p.setFont("Helvetica", 12)
        p.drawString(50, height - 70, f"Period: {report.get('reporting_period', 'N/A')}")

        # Score
        p.setFont("Helvetica-Bold", 24)
        p.drawString(50, height - 120, f"Security Score: {report.get('overall_score', 'N/A')}/10")
        
        # Summary
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, height - 160, "Executive Summary")
        p.setFont("Helvetica", 10)
        
        # Simple text wrapping logic for summary
        text = report.get("summary", "")
        text_lines = [text[i:i+90] for i in range(0, len(text), 90)]
        y_pos = height - 180
        for line in text_lines:
            p.drawString(50, y_pos, line)
            y_pos -= 15

        # Recommendations
        y_pos -= 30
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y_pos, "Strategic Recommendations")
        y_pos -= 20
        
        p.setFont("Helvetica", 10)
        for rec in report.get("strategic_recommendations", []):
            p.drawString(50, y_pos, f"- {rec.get('title')} ({rec.get('priority')})")
            y_pos -= 15
            p.drawString(70, y_pos, f"Cost: {rec.get('cost')} | Impact: {rec.get('impact_description')}")
            y_pos -= 25

        p.showPage()
        p.save()

        buffer.seek(0)
        return StreamingResponse(
            buffer, 
            media_type="application/pdf", 
            headers={"Content-Disposition": "attachment; filename=Executive_Report.pdf"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))