// SANKET — Core TypeScript Types
// These mirror the FastAPI backend response structure.

export type RiskLevel = "High" | "Medium" | "Low";
export type Layer = "L0" | "L1" | "L2" | "L3";
export type PaymentMode = "UPI" | "IMPS" | "NEFT" | "RTGS";
export type DeviceType = "ANDROID" | "IOS" | "WINDOWS_BROWSER" | "WEB_EMULATOR" | "LINUX_SCRIPT";

// ─── Account ──────────────────────────────────────────────────────────────────
export interface Account {
  account_id: string;
  layer: Layer;
  risk_score: number;
  risk_level: RiskLevel;
  account_type?: string;
  bank?: string;
  ifsc?: string;
  upi_id?: string;
  total_incoming_amount: number;
  total_outgoing_amount: number;
  incoming_transaction_count: number;
  outgoing_transaction_count: number;
  connected_accounts: number;
  first_seen?: string;
  last_seen?: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
  transaction_id: string;
  sender_account: string;
  receiver_account: string;
  sender_ifsc?: string;
  receiver_ifsc?: string;
  amount: number;
  timestamp: string;
  payment_mode: PaymentMode;
  narration?: string;
  ip_address?: string;
  device_type?: DeviceType;
  risk_level?: RiskLevel;
  flags?: string[];
}

// ─── Risk ─────────────────────────────────────────────────────────────────────
export interface RiskSignal {
  id: string;
  name: string;
  score: number;
  description: string;
  supporting_transactions: string[]; // transaction_ids
}

export interface Risk {
  score: number;
  level: RiskLevel;
  signals: RiskSignal[];
}

// ─── Graph ────────────────────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  layer: Layer;
  risk_score: number;
  risk_level: RiskLevel;
  label?: string;
  account_type?: string;
  bank?: string;
  transaction_count?: number;
  total_volume?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  transaction_count: number;
  total_amount: number;
  latest_transaction_id?: string;
  payment_modes?: PaymentMode[];
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  victim_id: string;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
export interface TimelineEvent {
  transaction_id: string;
  timestamp: string;
  from_account: string;
  to_account: string;
  amount: number;
  payment_mode: PaymentMode;
  risk_level: RiskLevel;
  flags?: string[];
  elapsed_seconds?: number; // seconds since previous event
}

// ─── Evidence ─────────────────────────────────────────────────────────────────
export interface EvidenceItem {
  id: string;
  signal: string;
  transactions: string[]; // transaction_ids
  description: string;
  risk_level: RiskLevel;
  timestamp?: string;
}

// ─── Investigation Response ───────────────────────────────────────────────────
export interface InvestigationResponse {
  account: Account;
  risk: Risk;
  graph: Graph;
  timeline: TimelineEvent[];
  transactions: Transaction[];
  evidence: EvidenceItem[];
}

// ─── Benchmark ────────────────────────────────────────────────────────────────
export interface BenchmarkData {
  dataset_size: number;
  transactions_processed: number;
  csv_read_ms?: number;
  validation_ms?: number;
  parquet_write_ms?: number;
  duckdb_startup_ms?: number;
  account_lookup_ms?: number;
  counterparty_query_ms?: number;
  time_range_query_ms?: number;
  graph_generation_ms?: number;
  risk_calculation_ms?: number;
  peak_memory_mb?: number;
  payment_mode_breakdown?: Record<string, number>;
  device_type_breakdown?: Record<string, number>;
}
