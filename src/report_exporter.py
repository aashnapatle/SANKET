from datetime import datetime
from typing import Dict, Any, List

def export_investigation_report(case_id: str, seed_account: str, evaluated_nodes: List[Dict[str, Any]], freeze_notices: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {
        "metadata": {
            "case_id": case_id,
            "seed_account": seed_account,
            "generated_at": datetime.now().isoformat(),
            "engine": "Operation Abhedya-Chakra / SANKET Core v1.0",
            "jurisdiction": "Section 91 CrPC / PMLA Compliant"
        },
        "investigation_summary": {
            "total_accounts_monitored": len(evaluated_nodes),
            "critical_freeze_recommended": len(freeze_notices),
            "layers_identified": list(set(n.get("layer", "Normal") for n in evaluated_nodes))
        },
        "flagged_entities": evaluated_nodes,
        "court_ready_notices": freeze_notices
    }
