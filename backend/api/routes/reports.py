"""
reports.py — Report generation endpoint

STATUS: IMPLEMENTED
"""
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from backend.api.routes.investigate import investigate as _investigate
from backend.services.report_generator import generate_pdf_report

router = APIRouter(prefix="/api", tags=["reports"])


@router.post("/reports/{account_id}")
def generate_report(account_id: str):
    """
    Generate a PDF investigation report.
    Returns the PDF file as a download.
    """
    result = _investigate(account_id)
    output_path = generate_pdf_report(result)
    return FileResponse(
        str(output_path),
        media_type="application/pdf",
        filename=f"investigation_{account_id}.pdf",
    )


@router.get("/notice/{account_id}")
def get_freeze_notice(account_id: str):
    """
    Generate Section 91 CrPC / PMLA freeze notice for an account
    using real investigation results.
    """
    from src.notice_generator import generate_freeze_notice
    result = _investigate(account_id)
    acc_info = {
        "account": result.account.account_id,
        "layer": result.account.layer,
        "mule_risk_score": result.risk.score,
        "flags": [r.detail for r in result.risk.reasons],
        "total_in": result.account.total_received,
        "total_out": result.account.total_sent,
    }
    return generate_freeze_notice(acc_info, case_id=f"CASE/2026/SANKET-{account_id[:8]}")


@router.get("/reports/export/{account_id}")
def export_report_json(account_id: str):
    """
    Export court-ready investigation summary JSON using Gunjan's report exporter.
    """
    from src.report_exporter import export_investigation_report
    from src.notice_generator import generate_freeze_notice

    result = _investigate(account_id)
    evaluated_nodes = [
        {
            "account": node.id,
            "hop": 0 if node.id == account_id else 1,
            "mule_risk_score": node.risk_score or 0.0,
            "layer": node.layer,
            "total_in": result.account.total_received if node.id == account_id else (node.tainted_amount or 0.0),
            "total_out": result.account.total_sent if node.id == account_id else 0.0,
            "flags": [r.code for r in result.risk.reasons] if node.id == account_id else [],
            "recommended_freeze": (node.risk_score or 0) >= 60
        }
        for node in result.graph.nodes
    ]
    freeze_notices = [
        generate_freeze_notice({
            "account": cand.account_id,
            "layer": cand.layer or "L1",
            "mule_risk_score": cand.risk_score or 50.0,
            "flags": [cand.reason],
            "total_in": cand.tainted_amount_held,
            "total_out": cand.estimated_blocked_amount
        }, case_id=f"CASE/2026/SANKET-{account_id[:8]}")
        for cand in result.freeze_plan.freeze_candidates
    ]

    return export_investigation_report(
        case_id=f"CASE/2026/SANKET-{account_id[:8]}",
        seed_account=account_id,
        evaluated_nodes=evaluated_nodes,
        freeze_notices=freeze_notices
    )
