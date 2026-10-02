"use client";
import { useState, useMemo, Fragment } from "react";
import { RiskBadge, EmptyState, Input, Button } from "@/components/ui";
import { formatCurrencyFull, formatTimestamp, getPaymentModeColor, cn } from "@/lib/utils";
import type { Transaction, RiskLevel, PaymentMode } from "@/lib/types";
import { Search, ChevronUp, ChevronDown, X, ArrowUpDown } from "lucide-react";

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
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

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
    return <EmptyState title="No transactions" description="No transactions available in this investigation." />;
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={11} className="opacity-40" />;
    return sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ─── Filters ───────────────────────────────────── */}
      <div className="px-4 py-2.5 border-b border-[#e8d8c4] bg-[#fdf8f3] flex items-center gap-3 flex-shrink-0 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c6e4e]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search transactions..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#e8d8c4] rounded-lg bg-white text-[#2c1810] placeholder:text-[#b0977a] focus:outline-none focus:ring-1 focus:ring-[#c4a882]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8c6e4e]">Risk:</span>
          {(["All", "High", "Medium", "Low"] as const).map(r => (
            <button
              key={r}
              onClick={() => { setRiskFilter(r); setPage(0); }}
              className={cn(
                "px-2 py-1 text-xs rounded-md border transition-colors",
                riskFilter === r
                  ? "bg-[#5c3d1e] text-white border-[#5c3d1e]"
                  : "bg-white text-[#8c6e4e] border-[#e8d8c4] hover:border-[#c4a882]"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8c6e4e]">Mode:</span>
          {(["All", "UPI", "IMPS", "NEFT", "RTGS"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setModeFilter(m); setPage(0); }}
              className={cn(
                "px-2 py-1 text-xs rounded-md border transition-colors",
                modeFilter === m
                  ? "bg-[#5c3d1e] text-white border-[#5c3d1e]"
                  : "bg-white text-[#8c6e4e] border-[#e8d8c4] hover:border-[#c4a882]"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#8c6e4e] ml-auto flex-shrink-0">
          {filtered.length} transactions
        </span>
      </div>

      {/* ─── Table ────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f5f0eb] border-b border-[#e8d8c4]">
              <th className="text-left px-4 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">
                <button onClick={() => handleSort("timestamp")} className="flex items-center gap-1 hover:text-[#2c1810] transition-colors">
                  Time <SortIcon k="timestamp" />
                </button>
              </th>
              <th className="text-left px-3 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">Transaction ID</th>
              <th className="text-left px-3 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">From</th>
              <th className="text-left px-3 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">To</th>
              <th className="text-right px-3 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">
                <button onClick={() => handleSort("amount")} className="flex items-center gap-1 ml-auto hover:text-[#2c1810] transition-colors">
                  Amount <SortIcon k="amount" />
                </button>
              </th>
              <th className="text-center px-3 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">Mode</th>
              <th className="text-center px-3 py-2.5 text-[#8c6e4e] font-semibold uppercase tracking-wide">
                <button onClick={() => handleSort("risk_level")} className="flex items-center gap-1 mx-auto hover:text-[#2c1810] transition-colors">
                  Risk <SortIcon k="risk_level" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx, i) => {
              const isSelected = selectedId === tx.transaction_id;
              return (
                <Fragment key={tx.transaction_id}>
                  <tr
                    onClick={() => setSelectedId(isSelected ? null : tx.transaction_id)}
                    className={cn(
                      "border-b border-[#f0e8dc] cursor-pointer transition-colors",
                      isSelected ? "bg-[#f5f0eb]" : i % 2 === 0 ? "bg-white hover:bg-[#faf6f1]" : "bg-[#fdf8f3] hover:bg-[#f5f0eb]"
                    )}
                  >
                    <td className="px-4 py-2.5 font-medium text-[#2c1810]">
                      {new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[#8c6e4e]">{tx.transaction_id}</td>
                    <td className="px-3 py-2.5 text-[#2c1810]">{tx.sender_account}</td>
                    <td className="px-3 py-2.5 text-[#2c1810]">{tx.receiver_account}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-[#2c1810]">
                      {formatCurrencyFull(tx.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
                        style={{ backgroundColor: getPaymentModeColor(tx.payment_mode) }}
                      >
                        {tx.payment_mode}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <RiskBadge level={tx.risk_level || "Low"} size="sm" />
                    </td>
                  </tr>

                  {/* ─── Expanded row ──────────────────────────── */}
                  {isSelected && (
                    <tr className="bg-[#f5f0eb]">
                      <td colSpan={7} className="px-4 py-3 border-b border-[#e8d8c4]">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs fade-in">
                          {tx.sender_ifsc && <div><span className="text-[#8c6e4e]">Sender IFSC: </span><span className="font-mono">{tx.sender_ifsc}</span></div>}
                          {tx.receiver_ifsc && <div><span className="text-[#8c6e4e]">Receiver IFSC: </span><span className="font-mono">{tx.receiver_ifsc}</span></div>}
                          {tx.ip_address && <div><span className="text-[#8c6e4e]">IP: </span><span className="font-mono">{tx.ip_address}</span></div>}
                          {tx.device_type && <div><span className="text-[#8c6e4e]">Device: </span><span className={cn("font-medium", (tx.device_type === "WEB_EMULATOR" || tx.device_type === "LINUX_SCRIPT") ? "text-[#c0392b]" : "text-[#2c1810]")}>{tx.device_type}</span></div>}
                          {tx.narration && <div className="col-span-2"><span className="text-[#8c6e4e]">Narration: </span>{tx.narration}</div>}
                          {tx.flags && tx.flags.length > 0 && (
                            <div className="col-span-2">
                              <span className="text-[#8c6e4e]">Flags: </span>
                              {tx.flags.map(f => <span key={f} className="mr-1 text-[#c0392b]">{f}</span>)}
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
          <EmptyState title="No matching transactions" description="Try adjusting your filters." />
        )}
      </div>

      {/* ─── Pagination ────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e8d8c4] bg-[#fdf8f3] flex-shrink-0">
          <span className="text-xs text-[#8c6e4e]">
            Page {page + 1} of {totalPages} ({filtered.length} transactions)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs border border-[#e8d8c4] rounded-lg disabled:opacity-40 hover:bg-[#f5f0eb] transition-colors text-[#5c3d1e]"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs border border-[#e8d8c4] rounded-lg disabled:opacity-40 hover:bg-[#f5f0eb] transition-colors text-[#5c3d1e]"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
