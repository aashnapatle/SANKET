// SANKET — Mock Investigation Data
// Realistic mock that mirrors the exact FastAPI response structure.
// Replace with real API calls once FastAPI backend is running.

import type { InvestigationResponse, BenchmarkData } from "./types";

const MOCK_INVESTIGATIONS: Record<string, InvestigationResponse> = {
  "ACC001235": {
    account: {
      account_id: "ACC001235",
      layer: "L0",
      risk_score: 82,
      risk_level: "High",
      account_type: "Savings",
      bank: "State Bank of India",
      ifsc: "SBIN0001234",
      upi_id: "victim@okicici",
      total_incoming_amount: 1245000,
      total_outgoing_amount: 1210000,
      incoming_transaction_count: 38,
      outgoing_transaction_count: 42,
      connected_accounts: 24,
      first_seen: "2026-09-15T10:00:00",
      last_seen: "2026-09-29T18:30:00",
    },
    risk: {
      score: 82,
      level: "High",
      signals: [
        {
          id: "fan_in",
          name: "Fan-in",
          score: 15,
          description: "Large number of accounts sending to victim in short window",
          supporting_transactions: ["TX1003", "TX1004", "TX1005"],
        },
        {
          id: "fan_out",
          name: "Fan-out",
          score: 15,
          description: "Victim funds dispersed to many accounts simultaneously",
          supporting_transactions: ["TX1001", "TX1002"],
        },
        {
          id: "rapid_multihop",
          name: "Rapid Multi-hop",
          score: 15,
          description: "Funds move through 3+ accounts within minutes",
          supporting_transactions: ["TX1001", "TX1002", "TX1006"],
        },
        {
          id: "velocity",
          name: "Velocity",
          score: 25,
          description: "₹50,000 moved in under 8 minutes across 5 accounts",
          supporting_transactions: ["TX1001", "TX1002", "TX1003", "TX1004"],
        },
        {
          id: "cycle",
          name: "Cycle Transaction",
          score: 10,
          description: "Funds returned to near-origin account after layering",
          supporting_transactions: ["TX1006", "TX1007"],
        },
      ],
    },
    graph: {
      victim_id: "ACC001235",
      nodes: [
        { id: "ACC001235", layer: "L0", risk_score: 82, risk_level: "High", label: "ACC001235\n(Victim)", account_type: "Savings", bank: "SBI", transaction_count: 80, total_volume: 2455000 },
        { id: "ACC778899", layer: "L1", risk_score: 71, risk_level: "High", label: "ACC778899", account_type: "Current", bank: "ICICI", transaction_count: 12, total_volume: 450000 },
        { id: "ACC665544", layer: "L1", risk_score: 45, risk_level: "Medium", label: "ACC665544", account_type: "Savings", bank: "HDFC", transaction_count: 8, total_volume: 180000 },
        { id: "ACC332211", layer: "L1", risk_score: 38, risk_level: "Medium", label: "ACC332211", account_type: "Savings", bank: "Axis", transaction_count: 5, total_volume: 90000 },
        { id: "ACC998877", layer: "L1", risk_score: 22, risk_level: "Low", label: "ACC998877", account_type: "Savings", bank: "PNB", transaction_count: 4, total_volume: 60000 },
        { id: "ACC112233", layer: "L2", risk_score: 66, risk_level: "High", label: "ACC112233", bank: "Kotak", transaction_count: 6, total_volume: 230000 },
        { id: "ACC445566", layer: "L2", risk_score: 55, risk_level: "Medium", label: "ACC445566", bank: "Yes Bank", transaction_count: 4, total_volume: 140000 },
        { id: "ACC789012", layer: "L2", risk_score: 48, risk_level: "Medium", label: "ACC789012", bank: "BOB", transaction_count: 3, total_volume: 95000 },
        { id: "ACC234567", layer: "L2", risk_score: 31, risk_level: "Low", label: "ACC234567", bank: "Canara", transaction_count: 2, total_volume: 45000 },
        { id: "ACC890123", layer: "L3", risk_score: 72, risk_level: "High", label: "ACC890123", bank: "Union", transaction_count: 5, total_volume: 185000 },
        { id: "ACC345678", layer: "L3", risk_score: 44, risk_level: "Medium", label: "ACC345678", bank: "IOB", transaction_count: 3, total_volume: 75000 },
        { id: "ACC901234", layer: "L3", risk_score: 29, risk_level: "Low", label: "ACC901234", bank: "Central", transaction_count: 2, total_volume: 35000 },
      ],
      edges: [
        { id: "E001", source: "ACC001235", target: "ACC778899", transaction_count: 3, total_amount: 140000, payment_modes: ["NEFT"] },
        { id: "E002", source: "ACC001235", target: "ACC665544", transaction_count: 2, total_amount: 48000, payment_modes: ["UPI"] },
        { id: "E003", source: "ACC001235", target: "ACC332211", transaction_count: 2, total_amount: 35000, payment_modes: ["UPI"] },
        { id: "E004", source: "ACC001235", target: "ACC998877", transaction_count: 1, total_amount: 22000, payment_modes: ["IMPS"] },
        { id: "E005", source: "ACC778899", target: "ACC112233", transaction_count: 2, total_amount: 95000, payment_modes: ["NEFT"] },
        { id: "E006", source: "ACC778899", target: "ACC445566", transaction_count: 2, total_amount: 65000, payment_modes: ["UPI"] },
        { id: "E007", source: "ACC665544", target: "ACC789012", transaction_count: 1, total_amount: 43000, payment_modes: ["IMPS"] },
        { id: "E008", source: "ACC665544", target: "ACC234567", transaction_count: 1, total_amount: 22000, payment_modes: ["UPI"] },
        { id: "E009", source: "ACC112233", target: "ACC890123", transaction_count: 3, total_amount: 125000, payment_modes: ["NEFT", "RTGS"] },
        { id: "E010", source: "ACC445566", target: "ACC345678", transaction_count: 2, total_amount: 55000, payment_modes: ["UPI"] },
        { id: "E011", source: "ACC789012", target: "ACC901234", transaction_count: 1, total_amount: 35000, payment_modes: ["IMPS"] },
      ],
    },
    timeline: [
      { transaction_id: "TX1001", timestamp: "2026-09-22T10:01:00", from_account: "ACC001235", to_account: "ACC778899", amount: 50000, payment_mode: "NEFT", risk_level: "High", flags: ["high_value", "rapid_transfer"] },
      { transaction_id: "TX1002", timestamp: "2026-09-22T10:04:00", from_account: "ACC778899", to_account: "ACC665544", amount: 45000, payment_mode: "IMPS", risk_level: "High", flags: ["rapid_transfer"], elapsed_seconds: 180 },
      { transaction_id: "TX1003", timestamp: "2026-09-22T10:06:00", from_account: "ACC778899", to_account: "ACC332211", amount: 3000, payment_mode: "UPI", risk_level: "Medium", flags: ["split_transaction"], elapsed_seconds: 120 },
      { transaction_id: "TX1004", timestamp: "2026-09-22T10:08:00", from_account: "ACC778899", to_account: "ACC998877", amount: 2000, payment_mode: "UPI", risk_level: "Medium", flags: ["split_transaction"], elapsed_seconds: 120 },
      { transaction_id: "TX1005", timestamp: "2026-09-22T10:12:00", from_account: "ACC665544", to_account: "ACC112233", amount: 40000, payment_mode: "NEFT", risk_level: "High", elapsed_seconds: 240 },
      { transaction_id: "TX1006", timestamp: "2026-09-22T10:15:00", from_account: "ACC332211", to_account: "ACC445566", amount: 3000, payment_mode: "UPI", risk_level: "Low", elapsed_seconds: 180 },
      { transaction_id: "TX1007", timestamp: "2026-09-22T10:19:00", from_account: "ACC112233", to_account: "ACC890123", amount: 38000, payment_mode: "RTGS", risk_level: "High", elapsed_seconds: 240 },
    ],
    transactions: [
      { transaction_id: "TX1001", sender_account: "ACC001235", receiver_account: "ACC778899", sender_ifsc: "SBIN0001234", receiver_ifsc: "ICIC0001001", amount: 50000, timestamp: "2026-09-22T10:01:00", payment_mode: "NEFT", narration: "Transfer", ip_address: "192.168.1.10", device_type: "ANDROID", risk_level: "High", flags: ["high_value"] },
      { transaction_id: "TX1002", sender_account: "ACC778899", receiver_account: "ACC665544", sender_ifsc: "ICIC0001001", receiver_ifsc: "HDFC0001234", amount: 45000, timestamp: "2026-09-22T10:04:00", payment_mode: "IMPS", narration: "Settlement", ip_address: "10.0.0.5", device_type: "WEB_EMULATOR", risk_level: "High", flags: ["suspicious_device"] },
      { transaction_id: "TX1003", sender_account: "ACC778899", receiver_account: "ACC332211", sender_ifsc: "ICIC0001001", receiver_ifsc: "UTIB0001234", amount: 3000, timestamp: "2026-09-22T10:06:00", payment_mode: "UPI", narration: "Payment", ip_address: "10.0.0.5", device_type: "WEB_EMULATOR", risk_level: "Medium" },
      { transaction_id: "TX1004", sender_account: "ACC778899", receiver_account: "ACC998877", sender_ifsc: "ICIC0001001", receiver_ifsc: "PUNB0001234", amount: 2000, timestamp: "2026-09-22T10:08:00", payment_mode: "UPI", narration: "Payment", ip_address: "10.0.0.5", device_type: "LINUX_SCRIPT", risk_level: "Medium", flags: ["suspicious_device"] },
      { transaction_id: "TX1005", sender_account: "ACC665544", receiver_account: "ACC112233", sender_ifsc: "HDFC0001234", receiver_ifsc: "KKBK0001234", amount: 40000, timestamp: "2026-09-22T10:12:00", payment_mode: "NEFT", narration: "Business", ip_address: "172.16.0.1", device_type: "WINDOWS_BROWSER", risk_level: "High" },
      { transaction_id: "TX1006", sender_account: "ACC332211", receiver_account: "ACC445566", sender_ifsc: "UTIB0001234", receiver_ifsc: "YESB0001234", amount: 3000, timestamp: "2026-09-22T10:15:00", payment_mode: "UPI", narration: "Transfer", ip_address: "172.16.0.2", device_type: "IOS", risk_level: "Low" },
      { transaction_id: "TX1007", sender_account: "ACC112233", receiver_account: "ACC890123", sender_ifsc: "KKBK0001234", receiver_ifsc: "UBIN0001234", amount: 38000, timestamp: "2026-09-22T10:19:00", payment_mode: "RTGS", narration: "Settlement", ip_address: "192.168.1.20", device_type: "ANDROID", risk_level: "High" },
    ],
    evidence: [
      { id: "EV-001", signal: "Rapid downstream transfer", transactions: ["TX1001", "TX1002"], description: "₹50,000 transferred from victim to ACC778899, then ₹45,000 moved to ACC665544 within 3 minutes — classic layering pattern.", risk_level: "High", timestamp: "2026-09-22T10:04:00" },
      { id: "EV-002", signal: "Round amount transaction", transactions: ["TX1003"], description: "₹3,000 round-amount transaction to ACC332211 via UPI — consistent with structured layering.", risk_level: "Medium" },
      { id: "EV-003", signal: "Multiple beneficiary split", transactions: ["TX1004", "TX1005"], description: "Funds from ACC778899 dispersed to multiple accounts (ACC998877, ACC332211) simultaneously — fan-out pattern.", risk_level: "High" },
      { id: "EV-004", signal: "Layering through L2", transactions: ["TX1006"], description: "ACC112233 (L2) received ₹40,000 and routed ₹38,000 to ACC890123 (L3) within 7 minutes.", risk_level: "High" },
      { id: "EV-005", signal: "Suspicious device/IP", transactions: ["TX1002", "TX1004"], description: "Transactions from WEB_EMULATOR and LINUX_SCRIPT devices — automated transaction patterns detected.", risk_level: "Medium" },
    ],
  },

  "KKBK10000000": {
    account: {
      account_id: "KKBK10000000",
      layer: "L0",
      risk_score: 74,
      risk_level: "High",
      account_type: "Current",
      bank: "Kotak Mahindra Bank",
      ifsc: "KKBK0001000",
      total_incoming_amount: 875000,
      total_outgoing_amount: 820000,
      incoming_transaction_count: 22,
      outgoing_transaction_count: 28,
      connected_accounts: 15,
      first_seen: "2026-09-18T09:00:00",
      last_seen: "2026-09-28T20:15:00",
    },
    risk: {
      score: 74,
      level: "High",
      signals: [
        { id: "fan_out", name: "Fan-out", score: 20, description: "Rapid dispersal of funds to 8 accounts within 15 minutes", supporting_transactions: ["TX2001", "TX2002", "TX2003"] },
        { id: "velocity", name: "Velocity", score: 25, description: "High transaction velocity detected — ₹1.2L moved in 20 minutes", supporting_transactions: ["TX2001", "TX2002"] },
        { id: "rapid_multihop", name: "Rapid Multi-hop", score: 15, description: "3-hop chain detected within 30 minutes", supporting_transactions: ["TX2003", "TX2004"] },
        { id: "suspicious_device", name: "Suspicious Device", score: 14, description: "Multiple WEB_EMULATOR transactions detected", supporting_transactions: ["TX2002"] },
      ],
    },
    graph: {
      victim_id: "KKBK10000000",
      nodes: [
        { id: "KKBK10000000", layer: "L0", risk_score: 74, risk_level: "High", label: "KKBK10000000\n(Victim)", account_type: "Current", bank: "Kotak", transaction_count: 50, total_volume: 1695000 },
        { id: "ICIC10000335", layer: "L1", risk_score: 60, risk_level: "High", label: "ICIC10000335", bank: "ICICI", transaction_count: 8, total_volume: 320000 },
        { id: "HDFC20000110", layer: "L1", risk_score: 42, risk_level: "Medium", label: "HDFC20000110", bank: "HDFC", transaction_count: 5, total_volume: 180000 },
        { id: "SBIN30000220", layer: "L2", risk_score: 55, risk_level: "Medium", label: "SBIN30000220", bank: "SBI", transaction_count: 4, total_volume: 140000 },
        { id: "AXIS40000330", layer: "L3", risk_score: 68, risk_level: "High", label: "AXIS40000330", bank: "Axis", transaction_count: 3, total_volume: 95000 },
      ],
      edges: [
        { id: "E001", source: "KKBK10000000", target: "ICIC10000335", transaction_count: 4, total_amount: 220000, payment_modes: ["NEFT", "RTGS"] },
        { id: "E002", source: "KKBK10000000", target: "HDFC20000110", transaction_count: 3, total_amount: 130000, payment_modes: ["UPI"] },
        { id: "E003", source: "ICIC10000335", target: "SBIN30000220", transaction_count: 2, total_amount: 105000, payment_modes: ["IMPS"] },
        { id: "E004", source: "SBIN30000220", target: "AXIS40000330", transaction_count: 2, total_amount: 85000, payment_modes: ["NEFT"] },
      ],
    },
    timeline: [
      { transaction_id: "TX2001", timestamp: "2026-09-22T09:30:00", from_account: "KKBK10000000", to_account: "ICIC10000335", amount: 120000, payment_mode: "RTGS", risk_level: "High" },
      { transaction_id: "TX2002", timestamp: "2026-09-22T09:35:00", from_account: "KKBK10000000", to_account: "HDFC20000110", amount: 80000, payment_mode: "NEFT", risk_level: "High", elapsed_seconds: 300 },
      { transaction_id: "TX2003", timestamp: "2026-09-22T09:45:00", from_account: "ICIC10000335", to_account: "SBIN30000220", amount: 100000, payment_mode: "IMPS", risk_level: "Medium", elapsed_seconds: 600 },
      { transaction_id: "TX2004", timestamp: "2026-09-22T09:55:00", from_account: "SBIN30000220", to_account: "AXIS40000330", amount: 85000, payment_mode: "NEFT", risk_level: "High", elapsed_seconds: 600 },
    ],
    transactions: [
      { transaction_id: "TX2001", sender_account: "KKBK10000000", receiver_account: "ICIC10000335", amount: 120000, timestamp: "2026-09-22T09:30:00", payment_mode: "RTGS", ip_address: "192.168.10.5", device_type: "ANDROID", risk_level: "High" },
      { transaction_id: "TX2002", sender_account: "KKBK10000000", receiver_account: "HDFC20000110", amount: 80000, timestamp: "2026-09-22T09:35:00", payment_mode: "NEFT", ip_address: "10.0.0.12", device_type: "WEB_EMULATOR", risk_level: "High", flags: ["suspicious_device"] },
      { transaction_id: "TX2003", sender_account: "ICIC10000335", receiver_account: "SBIN30000220", amount: 100000, timestamp: "2026-09-22T09:45:00", payment_mode: "IMPS", ip_address: "172.16.1.1", device_type: "IOS", risk_level: "Medium" },
      { transaction_id: "TX2004", sender_account: "SBIN30000220", receiver_account: "AXIS40000330", amount: 85000, timestamp: "2026-09-22T09:55:00", payment_mode: "NEFT", ip_address: "10.0.0.15", device_type: "LINUX_SCRIPT", risk_level: "High", flags: ["suspicious_device"] },
    ],
    evidence: [
      { id: "EV-001", signal: "High-value rapid transfer", transactions: ["TX2001", "TX2002"], description: "₹2L moved in 5 minutes across 2 banks — indicates coordinated movement.", risk_level: "High" },
      { id: "EV-002", signal: "Automated script transactions", transactions: ["TX2002", "TX2004"], description: "WEB_EMULATOR and LINUX_SCRIPT devices used — non-human transaction patterns.", risk_level: "High" },
    ],
  },
};

// Fallback for unknown accounts
function generateMockForAccount(accountId: string): InvestigationResponse {
  const shortId = accountId.slice(-4);
  return {
    account: {
      account_id: accountId,
      layer: "L0",
      risk_score: Math.floor(Math.random() * 40) + 30,
      risk_level: "Medium",
      account_type: "Savings",
      bank: "Unknown Bank",
      total_incoming_amount: 250000,
      total_outgoing_amount: 240000,
      incoming_transaction_count: 10,
      outgoing_transaction_count: 12,
      connected_accounts: 5,
    },
    risk: {
      score: 45,
      level: "Medium",
      signals: [
        { id: "fan_out", name: "Fan-out", score: 15, description: "Moderate fan-out pattern detected", supporting_transactions: [`TX${shortId}01`] },
        { id: "velocity", name: "Velocity", score: 15, description: "Elevated transaction velocity", supporting_transactions: [`TX${shortId}02`] },
      ],
    },
    graph: {
      victim_id: accountId,
      nodes: [
        { id: accountId, layer: "L0", risk_score: 45, risk_level: "Medium", label: `${accountId}\n(Victim)` },
        { id: `L1_${shortId}A`, layer: "L1", risk_score: 35, risk_level: "Medium", label: `L1_${shortId}A` },
        { id: `L1_${shortId}B`, layer: "L1", risk_score: 28, risk_level: "Low", label: `L1_${shortId}B` },
        { id: `L2_${shortId}C`, layer: "L2", risk_score: 50, risk_level: "Medium", label: `L2_${shortId}C` },
      ],
      edges: [
        { id: "E001", source: accountId, target: `L1_${shortId}A`, transaction_count: 3, total_amount: 90000, payment_modes: ["UPI"] },
        { id: "E002", source: accountId, target: `L1_${shortId}B`, transaction_count: 2, total_amount: 60000, payment_modes: ["IMPS"] },
        { id: "E003", source: `L1_${shortId}A`, target: `L2_${shortId}C`, transaction_count: 2, total_amount: 75000, payment_modes: ["NEFT"] },
      ],
    },
    timeline: [
      { transaction_id: `TX${shortId}01`, timestamp: "2026-09-22T11:00:00", from_account: accountId, to_account: `L1_${shortId}A`, amount: 50000, payment_mode: "UPI", risk_level: "Medium" },
      { transaction_id: `TX${shortId}02`, timestamp: "2026-09-22T11:10:00", from_account: `L1_${shortId}A`, to_account: `L2_${shortId}C`, amount: 45000, payment_mode: "NEFT", risk_level: "Medium", elapsed_seconds: 600 },
    ],
    transactions: [
      { transaction_id: `TX${shortId}01`, sender_account: accountId, receiver_account: `L1_${shortId}A`, amount: 50000, timestamp: "2026-09-22T11:00:00", payment_mode: "UPI", risk_level: "Medium" },
      { transaction_id: `TX${shortId}02`, sender_account: `L1_${shortId}A`, receiver_account: `L2_${shortId}C`, amount: 45000, timestamp: "2026-09-22T11:10:00", payment_mode: "NEFT", risk_level: "Medium" },
    ],
    evidence: [
      { id: "EV-001", signal: "Fund dispersal", transactions: [`TX${shortId}01`, `TX${shortId}02`], description: "Funds moved through 2 hops within 10 minutes.", risk_level: "Medium" },
    ],
  };
}

export const MOCK_BENCHMARK: BenchmarkData = {
  dataset_size: 2000000,
  transactions_processed: 1997750,
  csv_read_ms: 4820,
  validation_ms: 1340,
  parquet_write_ms: 2100,
  duckdb_startup_ms: 380,
  account_lookup_ms: 12,
  counterparty_query_ms: 28,
  time_range_query_ms: 45,
  graph_generation_ms: 156,
  risk_calculation_ms: 89,
  peak_memory_mb: 412,
  payment_mode_breakdown: { UPI: 1300000, IMPS: 440000, NEFT: 200000, RTGS: 60000 },
  device_type_breakdown: { ANDROID: 900000, IOS: 600000, WINDOWS_BROWSER: 497096, WEB_EMULATOR: 1327, LINUX_SCRIPT: 1327 },
};

export async function getMockInvestigation(accountId: string): Promise<InvestigationResponse> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 1800 + Math.random() * 800));
  return MOCK_INVESTIGATIONS[accountId] ?? generateMockForAccount(accountId);
}

export { MOCK_INVESTIGATIONS };
