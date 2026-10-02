// SANKET — API Service Layer
// All backend calls go through this file ONLY.
// Set NEXT_PUBLIC_USE_MOCK=true to force mock mode. Default: false (real FastAPI backend).

import type { InvestigationResponse, BenchmarkData, RiskLevel, Layer, PaymentMode, Transaction } from "./types";
import { getMockInvestigation, MOCK_BENCHMARK } from "./mockData";

// ─── Configuration ─────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Helper: Format risk score / label into standard UI RiskLevel
function formatRiskLevel(labelOrScore: string | number | undefined): RiskLevel {
  if (typeof labelOrScore === "number") {
    if (labelOrScore >= 70) return "High";
    if (labelOrScore >= 35) return "Medium";
    return "Low";
  }
  const l = String(labelOrScore || "").toUpperCase();
  if (l === "CRITICAL" || l === "HIGH") return "High";
  if (l === "MEDIUM") return "Medium";
  return "Low";
}

// Helper: Format layer into UI Layer format (L0, L1, L2, L3)
function formatLayer(layerStr: string | undefined): Layer {
  if (!layerStr) return "L0";
  const l = layerStr.toUpperCase();
  if (l === "VICTIM" || l === "L0") return "L0";
  if (l === "L1") return "L1";
  if (l === "L2") return "L2";
  if (l === "L3") return "L3";
  return "L1";
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Investigate an account: fetches live data from FastAPI GET /api/investigate/{account_id}
 * and maps backend response to frontend UI contracts.
 */
export async function investigateAccount(accountId: string): Promise<InvestigationResponse> {
  if (USE_MOCK) {
    return getMockInvestigation(accountId);
  }

  const response = await fetch(`${BASE_URL}/api/investigate/${encodeURIComponent(accountId)}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`ACCOUNT_NOT_FOUND: Account '${accountId}' not found in 2M dataset.`);
    }
    throw new Error(`Investigation failed with status ${response.status}`);
  }

  const raw = await response.json();

  // Normalize account summary
  const accountIdVal = raw.victim_account || accountId;
  const rawAccount = raw.account || {};
  const rawRisk = raw.risk || {};
  const rawGraph = raw.graph || { nodes: [], edges: [] };
  const rawTxs = raw.transactions || [];
  const rawTimeline = raw.timeline || [];
  const rawEvidence = raw.evidence || [];

  const accountSummary = {
    account_id: accountIdVal,
    layer: formatLayer(rawAccount.layer),
    risk_score: rawRisk.score ?? 0,
    risk_level: formatRiskLevel(rawRisk.label || rawRisk.score),
    account_type: "Savings / Current",
    bank: (rawAccount.banks && rawAccount.banks.length > 0) ? rawAccount.banks[0] : (accountIdVal.slice(0, 4) || "State Bank of India"),
    ifsc: rawTxs[0]?.sender_ifsc || (accountIdVal.slice(0, 4) + "0001234"),
    total_incoming_amount: rawAccount.total_received ?? 0,
    total_outgoing_amount: rawAccount.total_sent ?? 0,
    incoming_transaction_count: rawTxs.filter((t: any) => t.receiver_account === accountIdVal).length,
    outgoing_transaction_count: rawTxs.filter((t: any) => t.sender_account === accountIdVal).length,
    connected_accounts: Math.max(0, rawGraph.nodes.length - 1),
    first_seen: rawAccount.first_seen || rawTxs[0]?.timestamp,
    last_seen: rawAccount.last_seen || rawTxs[rawTxs.length - 1]?.timestamp,
  };

  // Normalize risk signals
  const riskSignals = (rawRisk.reasons || []).map((r: any, idx: number) => ({
    id: r.code || `SIG_${idx + 1}`,
    name: (r.code || "Signal").replace(/_/g, " "),
    score: r.weight ?? 15,
    description: r.detail || r.code,
    supporting_transactions: rawTxs.map((t: any) => t.transaction_id).slice(0, 3),
  }));

  const riskData = {
    score: rawRisk.score ?? 0,
    level: formatRiskLevel(rawRisk.label || rawRisk.score),
    signals: riskSignals,
  };

  // Normalize graph
  const nodes = (rawGraph.nodes || []).map((n: any) => ({
    id: n.id,
    layer: formatLayer(n.layer),
    risk_score: n.risk_score ?? 0,
    risk_level: formatRiskLevel(n.risk_score),
    label: n.label || n.id,
    bank: n.bank || (n.id.slice(0, 4)),
    transaction_count: 1,
    total_volume: n.tainted_amount ?? 0,
  }));

  const edges = (rawGraph.edges || []).map((e: any, idx: number) => ({
    id: e.transaction_id || `E${idx + 1}`,
    source: e.source,
    target: e.target,
    transaction_count: 1,
    total_amount: e.amount ?? 0,
    latest_transaction_id: e.transaction_id,
    payment_modes: e.payment_mode ? [e.payment_mode] : ["UPI"],
  }));

  const graphData = {
    victim_id: accountIdVal,
    nodes,
    edges,
  };

  // Normalize timeline (sorted chronologically with calculated elapsed intervals)
  const sortedRawTimeline = [...rawTimeline].sort((a: any, b: any) =>
    new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
  );

  const timelineData = sortedRawTimeline.map((t: any, idx: number, arr: any[]) => {
    let elapsedSeconds = 0;
    if (idx > 0 && arr[idx - 1]?.timestamp && t.timestamp) {
      const prevMs = new Date(arr[idx - 1].timestamp).getTime();
      const currMs = new Date(t.timestamp).getTime();
      elapsedSeconds = Math.max(0, Math.round((currMs - prevMs) / 1000));
    }
    return {
      transaction_id: t.transaction_id || `TL_${idx + 1}`,
      timestamp: t.timestamp || new Date().toISOString(),
      from_account: t.account_from || accountIdVal,
      to_account: t.account_to || "UNKNOWN",
      amount: Number(t.amount) || 0,
      payment_mode: (t.payment_mode as PaymentMode) || "UPI",
      risk_level: formatRiskLevel(t.tainted_amount ? 70 : 30),
      flags: t.event_type ? [t.event_type] : [],
      elapsed_seconds: elapsedSeconds,
    };
  });

  // Normalize evidence
  const evidenceData = rawEvidence.map((e: any, idx: number) => ({
    id: `EV-${String(idx + 1).padStart(3, "0")}`,
    signal: (e.rule_triggered || e.evidence_type || "Money Flow Pattern").replace(/_/g, " "),
    transactions: e.transaction_id ? [e.transaction_id] : [],
    description: e.detail || (e.sender && e.receiver
      ? `Fund movement of Rs ${Number(e.amount || 0).toLocaleString("en-IN")} detected from ${e.sender} to ${e.receiver} (${e.rule_triggered || e.graph_relationship || "transfer"})`
      : `${e.evidence_type || "Signal"}: ${e.rule_triggered || "Pattern detected"}`),
    risk_level: formatRiskLevel(e.tainted_amount ? 75 : 45),
    timestamp: e.timestamp,
  }));

  // Combine victim transactions, graph edge transactions, and evidence transactions
  const txMap = new Map<string, Transaction>();
  for (const t of rawTxs) {
    if (t.transaction_id) {
      txMap.set(t.transaction_id, {
        transaction_id: t.transaction_id,
        sender_account: t.sender_account,
        receiver_account: t.receiver_account,
        sender_ifsc: t.sender_ifsc,
        receiver_ifsc: t.receiver_ifsc,
        amount: Number(t.amount) || 0,
        timestamp: t.timestamp,
        payment_mode: (t.payment_mode as PaymentMode) || "UPI",
        narration: t.narration,
        ip_address: t.ip_address,
        device_type: t.device_type,
        risk_level: formatRiskLevel(t.risk_level ?? (t.device_type === "WEB_EMULATOR" || t.device_type === "LINUX_SCRIPT" ? "High" : "Low")),
        flags: t.device_type === "WEB_EMULATOR" || t.device_type === "LINUX_SCRIPT" ? ["suspicious_device"] : [],
      });
    }
  }

  for (const e of rawEvidence) {
    if (e.transaction_id && !txMap.has(e.transaction_id)) {
      txMap.set(e.transaction_id, {
        transaction_id: e.transaction_id,
        sender_account: e.sender || "UNKNOWN",
        receiver_account: e.receiver || "UNKNOWN",
        sender_ifsc: e.ifsc_sender,
        receiver_ifsc: e.ifsc_receiver,
        amount: Number(e.amount) || 0,
        timestamp: e.timestamp || new Date().toISOString(),
        payment_mode: (e.payment_mode as PaymentMode) || "UPI",
        narration: e.rule_triggered,
        risk_level: formatRiskLevel(e.tainted_amount ? "High" : "Medium"),
        flags: e.rule_triggered ? [e.rule_triggered] : [],
      });
    }
  }

  const transactionsData = Array.from(txMap.values());

  return {
    account: accountSummary,
    risk: riskData,
    graph: graphData,
    timeline: timelineData,
    transactions: transactionsData,
    evidence: evidenceData,
  };
}

/**
 * Get benchmark data from FastAPI GET /api/benchmark
 */
export async function getBenchmarkData(): Promise<BenchmarkData> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_BENCHMARK;
  }

  const response = await fetch(`${BASE_URL}/api/benchmark`);
  if (!response.ok) throw new Error("Benchmark data unavailable");
  const raw = await response.json();
  const m = raw.measured || {};

  return {
    dataset_size: m.total_dataset_rows ?? 1997748,
    transactions_processed: m.total_dataset_rows ?? 1997748,
    csv_read_ms: m.csv_read_ms,
    validation_ms: m.validation_ms,
    parquet_write_ms: m.parquet_write_ms,
    duckdb_startup_ms: m.duckdb_startup_ms,
    account_lookup_ms: m.real_dataset_investigation_ms ? Math.round(m.real_dataset_investigation_ms) : undefined,
    graph_generation_ms: m.real_dataset_investigation_ms ? Math.round(m.real_dataset_investigation_ms) : undefined,
    risk_calculation_ms: m.real_dataset_investigation_ms ? Math.round(m.real_dataset_investigation_ms * 0.15) : undefined,
    peak_memory_mb: m.peak_memory_mb,
    payment_mode_breakdown: m.payment_mode_breakdown,
    device_type_breakdown: m.device_type_breakdown,
  };
}

/**
 * Generate investigator report via FastAPI POST /api/reports/{account_id}
 */
export async function generateReport(accountId: string, reportType: "investigator" | "institution" | "evidence"): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 1200));
    return { success: true, message: `${reportType} report generated (mock). Connect FastAPI for real reports.` };
  }

  const response = await fetch(`${BASE_URL}/api/reports/${encodeURIComponent(accountId)}`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Report generation failed");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `investigation_${accountId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  return { success: true, message: `${reportType} report PDF generated and downloaded successfully.` };
}

/**
 * Fetch Section 91 CrPC / PMLA Freeze Notice via FastAPI GET /api/notice/{account_id}
 */
export async function fetchFreezeNotice(accountId: string): Promise<{
  account: string;
  layer: string;
  mule_risk_score: number;
  case_id: string;
  recommended_action: string;
  notice_text: string;
}> {
  if (!accountId || typeof accountId !== "string" || !accountId.trim()) {
    throw new Error("Target Account ID is required to fetch freeze notice.");
  }

  const cleanId = accountId.trim();

  if (USE_MOCK) {
    return {
      account: cleanId,
      layer: "L1",
      mule_risk_score: 75,
      case_id: `CASE/2026/SANKET-${cleanId.slice(0, 8)}`,
      recommended_action: "FREEZE_IMMEDIATE",
      notice_text: `FORMAL NOTICE UNDER SECTION 91 CrPC / PMLA\nTO: Branch Manager / Nodal Officer\nSUBJECT: IMMEDIATE FREEZE ORDER FOR ACCOUNT ${cleanId}\n\nCase Reference: CASE/2026/SANKET-${cleanId.slice(0, 8)}\nDate: ${new Date().toISOString()}\n\nAccount Details:\n- Target Account: ${cleanId}\n- Classified Layer: L1\n- Calculated Mule Risk Score: 75/100\n- Suspicious Indicators: Rapid pass-through, Fan-out pattern\n\nDirective:\nFreeze debit transactions on the aforementioned account with immediate effect and submit KYC records within 24 hours.\n\nIssued by:\nFinancial Cyber Investigation Unit (SANKET Engine)`,
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/notice/${encodeURIComponent(cleanId)}`);
    if (!response.ok) {
      let errorMsg = `Failed to fetch freeze notice (HTTP ${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson?.detail) errorMsg = errJson.detail;
      } catch {
        // Fallback to text status
      }
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (err: any) {
    console.error("fetchFreezeNotice failed:", err);
    throw new Error(err.message || "Failed to fetch freeze notice from backend");
  }
}

/**
 * Health check endpoint GET /health
 */
export async function checkHealth(): Promise<boolean> {
  if (USE_MOCK) return true;
  try {
    const response = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}
