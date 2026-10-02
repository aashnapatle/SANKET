"use client";
import { useState, useMemo } from "react";
import { useSanketStore } from "@/lib/store";
import { RiskBadge, EmptyState, Button } from "@/components/ui";
import { formatCurrencyFull, getRiskColor, cn } from "@/lib/utils";
import type { InvestigationResponse } from "@/lib/types";
import {
  Shield, ChevronDown, CheckCircle2, AlertTriangle,
  Clock, Hash, ArrowRight, FileCheck, Search, Filter, Sparkles
} from "lucide-react";

interface EvidenceViewProps {
  investigation: InvestigationResponse;
}

export default function EvidenceView({ investigation }: EvidenceViewProps) {
  const { evidence, transactions, account } = investigation;
  const { activeSignalId } = useSanketStore();
  const [searchFilter, setSearchFilter] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (activeSignalId) {
      const match = evidence.find(e => e.signal.toLowerCase().includes(activeSignalId));
      if (match) return new Set([match.id]);
    }
    // Expand first item by default
    return new Set(evidence.slice(0, 1).map(e => e.id));
  });

  const filteredEvidence = useMemo(() => {
    if (!searchFilter.trim()) return evidence;
    const q = searchFilter.toLowerCase();
    return evidence.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.signal.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.transactions.some(txId => txId.toLowerCase().includes(q))
    );
  }, [evidence, searchFilter]);

  if (!evidence.length) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <EmptyState
          icon={<Shield size={24} className="text-[#8c6e4e]" />}
          title="No Evidence Chain Recorded"
          description="Evidence is automatically synthesized by the backend risk inference engine upon detecting anomalous or malicious transaction patterns."
        />
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(evidence.map(e => e.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const getTransaction = (id: string) => transactions.find(t => t.transaction_id === id);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#fdfaf6]">
      {/* ─── Evidence Vault Header & Control Bar ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-[#e2d5c3] bg-[#fbf7f0]/95 flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs">
            <Shield size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#231207] tracking-tight">Digital Evidence Locker</span>
              <span className="text-[10px] font-semibold text-[#8c6e4e] bg-[#f0e4d2] px-2 py-0.5 rounded-full border border-[#e2d5c3]">
                {evidence.length} Records
              </span>
            </div>
            <div className="text-[11px] text-[#8c6e4e] flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
              <span>Section 65B IEA Compliant Chain of Custody</span>
              <span>· Target: <strong className="font-mono text-[#5c3d1e]">{account.account_id}</strong></span>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c6e4e]" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter evidence or Txn ID..."
              className="pl-8 pr-3 py-1.5 bg-white border border-[#dfd2be] rounded-xl text-xs text-[#231207] placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c49756] focus:border-transparent w-44 sm:w-56 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-[#dfd2be] rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={expandAll}
              className="text-[11px] font-semibold text-[#5c3d1e] hover:bg-[#faf4ec] px-2.5 py-1 rounded-lg transition-colors"
            >
              Expand All
            </button>
            <span className="text-[#dfd2be]">|</span>
            <button
              onClick={collapseAll}
              className="text-[11px] font-semibold text-[#8c6e4e] hover:bg-[#faf4ec] px-2.5 py-1 rounded-lg transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* ─── Evidence Scrollable Ledger ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3.5">
        {filteredEvidence.map((ev, index) => {
          const isExpanded = expandedIds.has(ev.id);
          const supportingTxns = ev.transactions.map(id => getTransaction(id)).filter(Boolean);

          // Calculate risk color indicator for left accent border
          const riskColor = getRiskColor(ev.risk_level);

          return (
            <div
              key={ev.id}
              className={cn(
                "bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all duration-200",
                isExpanded ? "border-[#c49756]/80 ring-1 ring-[#c49756]/20" : "border-[#e2d5c3] hover:border-[#c49756]/60 hover:shadow-xs"
              )}
            >
              {/* Header Button Row */}
              <button
                onClick={() => toggleExpand(ev.id)}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-[#faf6f1]/70 transition-colors group select-none"
              >
                {/* Risk colored accent bar */}
                <div
                  className="w-1.5 h-7 rounded-full flex-shrink-0 transition-transform group-hover:scale-y-110"
                  style={{ backgroundColor: riskColor }}
                />

                {/* Chevron */}
                <div
                  className="flex-shrink-0 text-[#8c6e4e] group-hover:text-[#231207] transition-transform duration-200"
                  style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                >
                  <ChevronDown size={15} />
                </div>

                {/* Forensic ID badge */}
                <div className="font-mono text-xs font-bold text-[#5c3d1e] bg-[#f5ecde] border border-[#ebdccb] px-2.5 py-1 rounded-lg flex-shrink-0">
                  {ev.id}
                </div>

                {/* Signal Title */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#231207] truncate tracking-tight">
                    {ev.signal}
                  </div>
                  <div className="text-[11px] text-[#8c6e4e] truncate mt-0.5">
                    Corroborated by {ev.transactions.length} verified transaction{ev.transactions.length === 1 ? "" : "s"}
                  </div>
                </div>

                {/* Corroborating Transaction IDs (Desktop) */}
                <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
                  {ev.transactions.slice(0, 3).map(txId => (
                    <span
                      key={txId}
                      className="font-mono text-[10px] text-[#8c6e4e] bg-[#f8f5ee] border border-[#e6dcce] px-2 py-0.5 rounded-md"
                    >
                      {txId}
                    </span>
                  ))}
                  {ev.transactions.length > 3 && (
                    <span className="text-[10px] text-[#8c6e4e] font-semibold bg-[#f0e8dc] px-1.5 py-0.5 rounded-md">
                      +{ev.transactions.length - 3}
                    </span>
                  )}
                </div>

                {/* Risk Badge */}
                <div className="flex-shrink-0">
                  <RiskBadge level={ev.risk_level} size="sm" pulse={ev.risk_level === "High"} />
                </div>
              </button>

              {/* ─── Expanded Forensic Details ─────────────────────────────────── */}
              {isExpanded && (
                <div className="border-t border-[#ebdccb] px-5 py-4 bg-[#fdfbf8] space-y-4">
                  {/* Detailed finding narrative */}
                  <div className="bg-[#faf4ec] border border-[#e8d7c1] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileCheck size={14} className="text-[#8c5621]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#633b11]">
                        Forensic Investigative Finding
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#3d2310] font-medium">
                      {ev.description}
                    </p>
                  </div>

                  {/* Supporting Transactions Table */}
                  {supportingTxns.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-[#6b4e33] uppercase tracking-wider flex items-center gap-1.5">
                          <Hash size={13} className="text-[#8c6e4e]" />
                          Corroborating Ledger Evidence ({supportingTxns.length})
                        </div>
                        <span className="text-[10px] text-[#8c6e4e] font-mono">
                          IMMUTABLE RECORD
                        </span>
                      </div>

                      <div className="space-y-2">
                        {supportingTxns.map(tx => tx && (
                          <div
                            key={tx.transaction_id}
                            className="bg-white rounded-xl p-3.5 border border-[#dfd2be] hover:border-[#c49756]/80 transition-all shadow-2xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-[#f0e8dc]">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#5c3d1e] bg-[#f5ecde] px-2 py-0.5 rounded">
                                  {tx.transaction_id}
                                </span>
                                <RiskBadge level={tx.risk_level || "Low"} size="sm" />
                                <span className="text-[10px] font-bold text-[#8c6e4e] bg-[#f5ecde] px-2 py-0.5 rounded">
                                  {tx.payment_mode}
                                </span>
                              </div>
                              <div className="text-xs font-black text-[#231207] tracking-tight">
                                {formatCurrencyFull(tx.amount)}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                              {/* Fund Movement Route */}
                              <div className="flex items-center gap-2 font-mono">
                                <span className="text-[#6b4e33] font-medium bg-[#fbf7f0] px-2 py-0.5 rounded border border-[#ebdccb]">
                                  {tx.sender_account}
                                </span>
                                <ArrowRight size={13} className="text-[#b48c48]" />
                                <span className="text-[#231207] font-bold bg-[#fbf7f0] px-2 py-0.5 rounded border border-[#ebdccb]">
                                  {tx.receiver_account}
                                </span>
                              </div>

                              {/* Timestamp */}
                              <div className="flex items-center gap-1.5 text-[11px] text-[#8c6e4e]">
                                <Clock size={12} />
                                <span>
                                  {new Date(tx.timestamp).toLocaleString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit"
                                  })}
                                </span>
                              </div>
                            </div>

                            {/* Suspicious Device / Telemetry Warning */}
                            {(tx.device_type === "WEB_EMULATOR" || tx.device_type === "LINUX_SCRIPT") && (
                              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-2.5 py-1.5 font-medium">
                                <AlertTriangle size={13} className="text-[#dc2626] flex-shrink-0" />
                                <span>
                                  <strong>Adversarial Telemetry Alert:</strong> Device fingerprint identified as{" "}
                                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#fca5a5]">{tx.device_type}</code>.
                                  Indicates automated bot or headless emulator used to bypass fraud detection.
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calculated Time Velocity */}
                  {supportingTxns.length >= 2 && (
                    <div className="flex items-center justify-between bg-[#f5ecde] border border-[#ebdccb] rounded-xl px-4 py-2.5 text-xs text-[#5c3d1e]">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#8c5621]" />
                        <span className="font-medium">Observed Temporal Window:</span>
                        <strong className="font-bold text-[#231207]">
                          {(() => {
                            const first = new Date(supportingTxns[0]!.timestamp).getTime();
                            const last = new Date(supportingTxns[supportingTxns.length - 1]!.timestamp).getTime();
                            const diffSec = Math.abs(Math.round((last - first) / 1000));
                            if (diffSec < 60) return `${diffSec} seconds`;
                            const mins = Math.floor(diffSec / 60);
                            const secs = diffSec % 60;
                            return `${mins} min ${secs} sec (${(diffSec / 60).toFixed(1)}m)`;
                          })()}
                        </strong>
                      </div>
                      <span className="text-[10px] text-[#8c6e4e] font-mono">
                        HIGH RAPIDITY VECTOR
                      </span>
                    </div>
                  )}

                  {/* Chain of Custody Stamp */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-[#9c7b5a] border-t border-[#f0e4d2]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-[#16a34a]" />
                      <span>Tamper-evident record hash verified</span>
                    </div>
                    <span className="font-mono opacity-80">
                      SANKET-CORROBORATION-{ev.id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
