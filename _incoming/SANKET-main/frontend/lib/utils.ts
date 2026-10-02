// SANKET — Utility Functions
import type { RiskLevel, Layer } from "./types";

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCurrencyFull(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

export function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatElapsed(seconds?: number): string {
  if (!seconds) return "";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "High": return "#c0392b";
    case "Medium": return "#e67e22";
    case "Low": return "#27ae60";
    default: return "#8c6e4e";
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case "High": return "#fdf0ef";
    case "Medium": return "#fef9f0";
    case "Low": return "#f0fdf4";
    default: return "#f5f0eb";
  }
}

export function getRiskBorderColor(level: RiskLevel): string {
  switch (level) {
    case "High": return "#f1b4b0";
    case "Medium": return "#f9d8a8";
    case "Low": return "#a8e6c0";
    default: return "#e8d8c4";
  }
}

export function getLayerColor(layer: Layer): string {
  switch (layer) {
    case "L0": return "#c0392b"; // Victim — red
    case "L1": return "#d4793a"; // Layer 1 — orange
    case "L2": return "#7c5a3a"; // Layer 2 — brown
    case "L3": return "#6b5c7a"; // Layer 3 — purple/gray
    default: return "#8c8c8c";
  }
}

export function getLayerBgColor(layer: Layer): string {
  switch (layer) {
    case "L0": return "#fdf0ef";
    case "L1": return "#fef3ee";
    case "L2": return "#f5f0eb";
    case "L3": return "#f3f0f8";
    default: return "#f5f5f5";
  }
}

export function getPaymentModeColor(mode: string): string {
  switch (mode) {
    case "UPI": return "#2980b9";
    case "IMPS": return "#8e44ad";
    case "NEFT": return "#16a085";
    case "RTGS": return "#d35400";
    default: return "#7f8c8d";
  }
}

export function truncateId(id: string, length = 10): string {
  if (id.length <= length) return id;
  return `${id.slice(0, length)}…`;
}

export function getRiskScoreGrade(score: number): RiskLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
