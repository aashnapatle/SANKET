"""
ai_narrative.py — AI narrative & structured analysis generation endpoints

SECURITY: raw narration is never forwarded to the LLM.
Validation is applied to AI output before returning.
Full offline local Ollama pipeline with deterministic mathematical verification.

STATUS: IMPLEMENTED
"""
import asyncio
from fastapi import APIRouter, HTTPException
from backend.api.routes.investigate import investigate as _investigate
from backend.services.ai_service import generate_narrative
from backend.services.ai_validator import validate_narrative, build_validator_sets
from backend.services.ollama_engine import run_offline_ai_analysis
from backend.models.schemas import AIStructuredAnalysisResponse
from backend.config import AI_MAX_RETRIES

router = APIRouter(prefix="/api", tags=["ai"])


@router.get("/ai/narrative/{account_id}")
@router.post("/ai/narrative/{account_id}")
async def ai_narrative(account_id: str):
    """
    Generate an AI narrative for an investigation.
    Validates output against ground-truth facts before returning.
    Returns: {narrative, validated, issues, injection_test}
    """
    result = _investigate(account_id)

    # Build validator sets from verified data
    known_accounts, known_amounts, known_txn_ids = build_validator_sets(result)

    narrative = ""
    validated = False
    issues = []

    for attempt in range(AI_MAX_RETRIES + 1):
        narrative = await generate_narrative(result, from_validator=(attempt > 0))
        is_valid, issues = validate_narrative(
            narrative, known_accounts, known_amounts, known_txn_ids
        )
        if is_valid:
            validated = True
            break

    # Import injection test for demo
    from backend.services.ai_validator import test_injection_resistance
    injection_test = test_injection_resistance()

    return {
        "account_id": account_id,
        "narrative": narrative,
        "validated": validated,
        "validation_issues": issues if not validated else [],
        "attempts": attempt + 1,
        "injection_resistance_demo": injection_test,
    }


@router.get("/ai/analysis/{account_id}", response_model=AIStructuredAnalysisResponse)
@router.post("/ai/analysis/{account_id}", response_model=AIStructuredAnalysisResponse)
async def ai_structured_analysis(account_id: str):
    """
    Generate a strict structured AI analysis using local Ollama.
    Features:
    - 100% Offline execution
    - Deterministic verification layer to cross-check LLM math against DuckDB ground truth
    - Pydantic schema validation
    - Infallible fallback if Ollama service is unreachable
    """
    result = _investigate(account_id)
    structured_response = await run_offline_ai_analysis(result)
    return structured_response
