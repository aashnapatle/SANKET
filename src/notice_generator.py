from datetime import datetime
from typing import Dict, Any, List

def generate_freeze_notice(account_info: Dict[str, Any], case_id: str = "CASE/2026/SANKET-01") -> Dict[str, Any]:
    acc = account_info.get("account", "UNKNOWN")
    layer = account_info.get("layer", "Normal")
    score = account_info.get("mule_risk_score", 0)
    flags = account_info.get("flags", [])
    total_in = account_info.get("total_in", 0.0)
    total_out = account_info.get("total_out", 0.0)
    
    notice_text = f"""FORMAL NOTICE UNDER SECTION 91 CrPC / PMLA
TO: Branch Manager / Nodal Officer
SUBJECT: IMMEDIATE FREEZE ORDER FOR ACCOUNT {acc}

Case Reference: {case_id}
Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

Account Details:
- Target Account: {acc}
- Classified Layer: {layer}
- Calculated Mule Risk Score: {score}/100
- Inflow Monitored: INR {total_in:,.2f}
- Outflow Monitored: INR {total_out:,.2f}
- Suspicious Indicators: {', '.join(flags) if flags else 'Anomalous multi-hop layering'}

Directive:
Freeze debit transactions on the aforementioned account with immediate effect and submit KYC records within 24 hours.

Issued by:
Financial Cyber Investigation Unit (SANKET Engine)
"""
    return {
        "account": acc,
        "layer": layer,
        "mule_risk_score": score,
        "case_id": case_id,
        "recommended_action": "FREEZE_IMMEDIATE" if score >= 60 else "MONITOR",
        "notice_text": notice_text.strip()
    }
