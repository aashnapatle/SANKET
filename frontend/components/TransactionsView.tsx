"use client";
import { useState, useMemo, Fragment } from "react";
import { RiskBadge, EmptyState, Input, Button } from "@/components/ui";
import { formatCurrencyFull, formatTimestamp, getPaymentModeColor, cn } from "@/lib/utils";
import type { Transaction, RiskLevel, PaymentMode } from "@/lib/types";
import { Search, ChevronUp, ChevronDown, X, ArrowUpDown, ChevronLeft, ChevronRight, ShieldAlert, Monitor, Globe } from "lucide-react";

interface TransactionsViewProps {
  transactions: Transaction[];
}

type SortKey = "timestamp" | "amount" | "risk_level";
type SortDir = "asc" | "desc";

export default function TransactionsView({ transactions }: TransactionsViewProps) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [modeFilter, setModeFilter] = useState<PaymentMode | "All">("All");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(t =>
        t.transaction_id.toLowerCase().includes(s) ||
        t.sender_account.toLowerCase().includes(s) ||
        t.receiver_account.toLowerCase().includes(s)
      );
    }
    if (riskFilter !== "All") result = result.filter(t => t.risk_level === riskFilter);
    if (modeFilter !== "All") result = result.filter(t => t.payment_mode === modeFilter);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "timestamp") cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else if (sortKey === "risk_level") {
        const order = { High: 3, Medium: 2, Low: 1 };
        cmp = (order[a.risk_level ?? "Low"] ?? 1) - (order[b.risk_level ?? "Low"] ?? 1);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [transactions, search, riskFilter, modeFilter, sortKey, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  if (!transactions.length) {
    return <EmptyState title="No transactions" description="No transfers found in this investigation dataset." />;
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={11} className="opacity-40" />;
    return sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#fdfaf6] select-none">
      {/* ─── Filter Bar ─────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-[#e2d5c3] bg-[#fbf7f0] flex items-center justify-between gap-3 flex-shrink-0 flex-wrap shadow-2xs">
        {/* Search */}
        <div className="w-72 max-w-full relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6e4e]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search transaction ID or account..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#dfd2be] rounded-xl bg-white text-[#231207] placeholder:text-[#a58e76] focus:outline-none focus:ring-1 focus:ring-[#c49756] shadow-2xs font-medium"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c6e4e] hover:text-[#231207]">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Risk Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6e4e]">Risk:</span>
            {(["All", "High", "Medium", "Low"] as const).map(r => (
              <button
                key={r}
                onClick={() => { setRiskFilter(r); setPage(0); }}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shadow-2xs",
                  riskFilter === r
                    ? "bg-[#3a1d0b] text-[#fcf8f2] border-[#c49756]/60 shadow-xs"
                    : "bg-white text-[#6b5038] border-[#dfd2be] hover:border-[#c49756]"
                )}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Payment Mode Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6e4e]">Mode:</span>
            {(["All", "UPI", "IMPS", "RTGS", "NEFT"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setModeFilter(m); setPage(0); }}
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all shadow-2xs",
                  modeFilter === m
                    ? "bg-[#3a1d0b] text-[#fcf8f2] border-[#c49756]/60 shadow-xs"
                    : "bg-white text-[#6b5038] border-[#dfd2be] hover:border-[#c49756]"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 shadow-2xs">
            <tr className="bg-[#f5ece0] border-b border-[#dfd2be] text-[#5c3d1e]">
              <th className="text-left px-5 py-3 font-bold uppercase tracking-wider">
                <button onClick={() => handleSort("timestamp")} className="flex items-center gap-1.5 hover:text-[#231207] transition-colors">
                  Timestamp <SortIcon k="timestamp" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Transaction ID</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Sender</th>
              <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Receiver</th>
              <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">
                <button onClick={() => handleSort("amount")} className="flex items-center gap-1.5 ml-auto hover:text-[#231207] transition-colors">
                  Amount <SortIcon k="amount" />
                </button>
              </th>
              <th className="text-center px-4 py-3 font-bold uppercase tracking-wider">Payment Mode</th>
              <th className="text-center px-5 py-3 font-bold uppercase tracking-wider">
                <button onClick={() => handleSort("risk_level")} className="flex items-center gap-1.5 mx-auto hover:text-[#231207] transition-colors">
                  Risk <SortIcon k="risk_level" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdccb]/60">
            {paginated.map((tx, i) => {
              const isSelected = selectedId === tx.transaction_id;
              return (
                <Fragment key={tx.transaction_id}>
                  <tr
                    onClick={() => setSelectedId(isSelected ? null : tx.transaction_id)}
                    className={cn(
                      "cursor-pointer transition-all duration-150 select-none",
                      isSelected
                        ? "bg-[#f5ecde] border-l-4 border-l-[#c49756]"
                        : i % 2 === 0
                          ? "bg-white hover:bg-[#faf4ec]"
                          : "bg-[#fdfbf7] hover:bg-[#faf4ec]"
                    )}
                  >
                    <td className="px-5 py-3 font-mono font-medium text-[#231207]">
                      {new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#8c6e4e]">{tx.transaction_id}</td>
                    <td className="px-4 py-3 font-mono text-[#231207] font-medium">{tx.sender_account}</td>
                    <td className="px-4 py-3 font-mono text-[#231207] font-medium">{tx.receiver_account}</td>
                    <td className="px-4 py-3 text-right font-black text-[#231207]">
                      {formatCurrencyFull(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                        style={{ backgroundColor: getPaymentModeColor(tx.payment_mode) }}
                      >
                        {tx.payment_mode}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <RiskBadge level={tx.risk_level || "Low"} size="sm" />
                    </td>
                  </tr>

                  {/* ─── Expanded Forensic Telemetry Row ──────── */}
                  {isSelected && (
                    <tr className="bg-[#f7efe4] border-b border-[#dfd2be]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono fade-in">
                          <div className="bg-white/80 border border-[#dfd2be] rounded-xl p-2.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-[#8c6e4e] uppercase">Sender IFSC</span>
                            <div className="font-bold text-[#231207] mt-0.5">{tx.sender_ifsc || "—"}</div>
                          </div>
                          <div className="bg-white/80 border border-[#dfd2be] rounded-xl p-2.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-[#8c6e4e] uppercase">Receiver IFSC</span>
                            <div className="font-bold text-[#231207] mt-0.5">{tx.receiver_ifsc || "—"}</div>
                          </div>
                          <div className="bg-white/80 border border-[#dfd2be] rounded-xl p-2.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-[#8c6e4e] uppercase">IP Address</span>
                            <div className="font-bold text-[#231207] mt-0.5 flex items-center gap-1">
                              <Globe size={11} className="text-[#8c6e4e]" />
                              <span>{tx.ip_address || "—"}</span>
                            </div>
                          </div>
                          <div className="bg-white/80 border border-[#dfd2be] rounded-xl p-2.5 shadow-2xs">
                            <span className="text-[10px] font-bold text-[#8c6e4e] uppercase">Device Signature</span>
                            <div className={cn("font-bold mt-0.5 flex items-center gap-1", (tx.device_type === "WEB_EMULATOR" || tx.device_type === "LINUX_SCRIPT") ? "text-[#dc2626]" : "text-[#231207]")}>
                              <Monitor size={11} />
                              <span>{tx.device_type || "MOBILE_ANDROID"}</span>
                            </div>
                          </div>

                          {tx.narration && (
                            <div className="col-span-2 md:col-span-4 bg-white/80 border border-[#dfd2be] rounded-xl p-2.5 shadow-2xs">
                              <span className="text-[10px] font-bold text-[#8c6e4e] uppercase">Banking Narration</span>
                              <div className="text-[#231207] font-sans font-medium mt-0.5">{tx.narration}</div>
                            </div>
                          )}

                          {tx.flags && tx.flags.length > 0 && (
                            <div className="col-span-2 md:col-span-4 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#8c6e4e] uppercase">Detected Flags:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {tx.flags.map(f => (
                                  <span key={f} className="px-2 py-0.5 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[10px] font-bold rounded-full">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {paginated.length === 0 && (
          <EmptyState title="No matching transactions" description="Try adjusting your search criteria or risk filters." />
        )}
      </div>

      {/* ─── Pagination Footer ─────────────────────────── */}
      <div className="px-5 py-2.5 border-t border-[#e2d5c3] bg-[#fbf7f0] flex items-center justify-between text-xs text-[#8c6e4e] flex-shrink-0 shadow-2xs font-medium">
        <div>
          Showing {paginated.length > 0 ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 rounded-lg border border-[#dfd2be] bg-white text-[#5c3d1e] hover:bg-[#faf4ec] disabled:opacity-40 transition-colors shadow-2xs"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="font-bold text-[#231207]">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 rounded-lg border border-[#dfd2be] bg-white text-[#5c3d1e] hover:bg-[#faf4ec] disabled:opacity-40 transition-colors shadow-2xs"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
