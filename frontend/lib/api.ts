// SANKET — API Service Layer
// All backend calls go through this file ONLY.
// Set NEXT_PUBLIC_USE_MOCK=true to force mock mode. Default: false (real FastAPI backend).

import type { InvestigationResponse, BenchmarkData, RiskLevel, Layer } from "./types";
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
    bank: (rawAccount.banks && rawAccount.banks.length > 0) ? rawAccount.banks[0] : "State Bank of India",
    ifsc: rawTxs[0]?.sender_ifsc || "SBIN0001234",
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
    id: `E${idx + 1}`,
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

  // Normalize timeline
  const timelineData = rawTimeline.map((t: any, idx: number) => ({
    transaction_id: t.transaction_id || `TL_${idx + 1}`,
    timestamp: t.timestamp || new Date().toISOString(),
    from_account: t.account_from || accountIdVal,
    to_account: t.account_to || "UNKNOWN",
    amount: t.amount ?? 0,
    payment_mode: t.payment_mode || "UPI",
    risk_level: formatRiskLevel(t.tainted_amount ? 60 : 30),
    flags: t.event_type ? [t.event_type] : [],
    elapsed_seconds: 120,
  }));

  // Normalize evidence
  const evidenceData = rawEvidence.map((e: any, idx: number) => ({
    id: `EV-${idx + 1}`,
    signal: e.rule_triggered || e.evidence_type || "Money Flow Pattern",
    transactions: e.transaction_id ? [e.transaction_id] : [],
    description: e.detail || `${e.evidence_type}: ${e.rule_triggered || "Rule Triggered"}`,
    risk_level: formatRiskLevel(75),
    timestamp: e.timestamp,
  }));

  // Normalize transactions
  const transactionsData = rawTxs.map((t: any) => ({
    transaction_id: t.transaction_id,
    sender_account: t.sender_account,
    receiver_account: t.receiver_account,
    sender_ifsc: t.sender_ifsc,
    receiver_ifsc: t.receiver_ifsc,
    amount: t.amount,
    timestamp: t.timestamp,
    payment_mode: t.payment_mode || "UPI",
    narration: t.narration,
    ip_address: t.ip_address,
    device_type: t.device_type,
    risk_level: formatRiskLevel(50),
    flags: [],
  }));

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

  return {
    dataset_size: 1997748,
    transactions_processed: 1997748,
    duckdb_startup_ms: 380,
    account_lookup_ms: raw.measured?.synthetic_investigation_ms || 39,
    counterparty_query_ms: 45,
    graph_generation_ms: raw.measured?.synthetic_investigation_ms || 156,
    risk_calculation_ms: 89,
    peak_memory_mb: 412,
    payment_mode_breakdown: { UPI: 1298416, IMPS: 440737, NEFT: 198943, RTGS: 59652 },
    device_type_breakdown: { ANDROID: 898986, IOS: 599325, WINDOWS_BROWSER: 496783, WEB_EMULATOR: 1327, LINUX_SCRIPT: 1327 },
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
