// SANKET — API Service Layer
// All backend calls go through this file ONLY.
// Currently uses mock data. Replace BASE_URL when FastAPI is running.

import type { InvestigationResponse, BenchmarkData } from "./types";
import { getMockInvestigation, MOCK_BENCHMARK } from "./mockData";

// ─── Configuration ─────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Investigate an account: returns the complete investigation payload.
 * Backend: GET /api/investigate/{account_id}
 *
 * Expected FastAPI response shape:
 * {
 *   "account": { account_id, layer, risk_score, risk_level, ... },
 *   "risk": { score, level, signals: [...] },
 *   "graph": { nodes: [...], edges: [...], victim_id },
 *   "timeline": [...],
 *   "transactions": [...],
 *   "evidence": [...]
 * }
 */
export async function investigateAccount(accountId: string): Promise<InvestigationResponse> {
  if (USE_MOCK) {
    return getMockInvestigation(accountId);
  }

  const response = await fetch(`${BASE_URL}/api/investigate/${encodeURIComponent(accountId)}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }
    throw new Error(`Investigation failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Get benchmark data.
 * Backend: GET /api/benchmark
 */
export async function getBenchmarkData(): Promise<BenchmarkData> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    return MOCK_BENCHMARK;
  }

  const response = await fetch(`${BASE_URL}/api/benchmark`);
  if (!response.ok) throw new Error("Benchmark data unavailable");
  return response.json();
}

/**
 * Generate investigator report.
 * Backend: POST /api/reports/investigator
 * Returns: { download_url, preview_url } or blob
 */
export async function generateReport(accountId: string, reportType: "investigator" | "institution" | "evidence"): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 1200));
    return { success: true, message: `${reportType} report generated (mock). Connect FastAPI for real reports.` };
  }

  const response = await fetch(`${BASE_URL}/api/reports/${reportType}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_id: accountId }),
  });
  if (!response.ok) throw new Error("Report generation failed");
  return response.json();
}

/**
 * Health check.
 * Backend: GET /api/health
 */
export async function checkHealth(): Promise<boolean> {
  if (USE_MOCK) return true;
  try {
    const response = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}
