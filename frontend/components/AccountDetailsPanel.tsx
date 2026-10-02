"use client";
import { useState } from "react";
import { useSanketStore } from "@/lib/store";
import { Card, RiskBadge, LayerBadge, Button, Tabs, EmptyState } from "@/components/ui";
import { formatCurrency, formatCurrencyFull, formatTimestamp, getRiskColor, cn } from "@/lib/utils";
import type { InvestigationResponse, RiskSignal, GraphNode, GraphEdge, Transaction } from "@/lib/types";
import { X, Copy, ExternalLink, TrendingUp, TrendingDown, Users, AlertTriangle, Landmark, Shield, FileText, ArrowRight } from "lucide-react";

type PanelTab = "overview" | "risk" | "transactions" | "connected" | "evidence";

interface AccountDetailsPanelProps {
  investigation: InvestigationResponse;
  nodeId: string;
  onClose: () => void;
}

export default function AccountDetailsPanel({ investigation, nodeId, onClose }: AccountDetailsPanelProps) {
  const [tab, setTab] = useState<PanelTab>("overview");
  const { setActiveSignalId } = useSanketStore();

  const node = investigation.graph.nodes.find(n => n.id === nodeId);
  const account = nodeId === investigation.account.account_id ? investigation.account : null;

  // Transactions involving this node
  const nodeTxns = investigation.transactions.filter(
    t => t.sender_account === nodeId || t.receiver_account === nodeId
  );

  // Connected edges
  const connectedEdges = investigation.graph.edges.filter(
    e => e.source === nodeId || e.target === nodeId
  );

  // Evidence involving this node
  const nodeEvidence = investigation.evidence.filter(ev =>
    ev.transactions.some(txId =>
      nodeTxns.some(t => t.transaction_id === txId)
    )
  );

  if (!node) return null;

  const isVictim = nodeId === investigation.account.account_id;
  const displayAccount = account || {
    account_id: node.id,
    layer: node.layer,
    risk_score: node.risk_score,
    risk_level: node.risk_level,
    account_type: node.account_type,
    bank: node.bank,
    total_incoming_amount: 0,
    total_outgoing_amount: 0,
    incoming_transaction_count: 0,
    outgoing_transaction_count: 0,
    connected_accounts: connectedEdges.length,
  };

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "risk", label: "Risk Signals" },
    { id: "transactions", label: "Transactions" },
    { id: "connected", label: "Connected" },
    { id: "evidence", label: "Evidence" },
  ];

  return (
    <div className="w-88 flex-shrink-0 flex flex-col bg-white border-l border-[#e2d5c3] slide-in-right overflow-hidden shadow-xl z-20 select-none">
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 border-b border-[#e2d5c3] bg-[#fbf7f0]/80">
        <div className="flex-1 min-w-0 pr-2">
          <div className="text-[10px] text-[#8c6e4e] mb-1 font-bold uppercase tracking-wider">Account Telemetry</div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] flex-shrink-0 shadow-2xs">
              <Landmark size={15} />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#231207] truncate font-mono">{node.id}</div>
              {node.bank && <div className="text-[11px] text-[#8c6e4e] truncate font-medium">{node.bank}</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Risk Score Gauge */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f0e8dc" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke={getRiskColor(node.risk_level)}
                strokeWidth="3.5"
                strokeDasharray={`${(node.risk_score / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: getRiskColor(node.risk_level) }}>
              {node.risk_score}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#8c6e4e] hover:text-[#231207] hover:bg-[#ede5d8] p-1.5 rounded-lg transition-colors ml-1"
            title="Close panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────── */}
      <div className="flex border-b border-[#e2d5c3] bg-[#fdfaf6] flex-shrink-0 overflow-x-auto px-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as PanelTab)}
            className={cn(
              "flex-shrink-0 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap",
              tab === t.id ? "text-[#231207]" : "text-[#8c6e4e] hover:text-[#231207]"
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c49756] rounded-t shadow-xs" />}
          </button>
        ))}
      </div>

      {/* ─── Content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fdfaf6]">
        {tab === "overview" && (
          <OverviewTab account={displayAccount} node={node} isVictim={isVictim} investigation={investigation} />
        )}
        {tab === "risk" && isVictim && (
          <RiskTab signals={investigation.risk.signals} onSignalClick={setActiveSignalId} />
        )}
        {tab === "risk" && !isVictim && (
          <NodeRiskTab node={node} />
        )}
        {tab === "transactions" && (
          <TransactionsTab transactions={nodeTxns} />
        )}
        {tab === "connected" && (
          <ConnectedTab edges={connectedEdges} nodeId={nodeId} nodes={investigation.graph.nodes} />
        )}
        {tab === "evidence" && (
          <EvidenceTab evidence={nodeEvidence} />
        )}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ account, node, isVictim, investigation }: any) {
  const rows = [
    { label: "Layer", value: <LayerBadge layer={node.layer} /> },
    { label: "Account Type", value: account.account_type || node.account_type },
    { label: "Bank / Branch", value: account.ifsc ? `${account.bank} · ${account.ifsc}` : account.bank },
    { label: "Linked UPI ID", value: account.upi_id },
    { label: "Total Inflow", value: account.total_incoming_amount > 0 ? formatCurrencyFull(account.total_incoming_amount) + ` (${account.incoming_transaction_count})` : null },
    { label: "Total Outflow", value: account.total_outgoing_amount > 0 ? formatCurrencyFull(account.total_outgoing_amount) + ` (${account.outgoing_transaction_count})` : null },
    { label: "Connected Nodes", value: `${account.connected_accounts} accounts` },
  ];

  const riskSignals = isVictim ? investigation.risk.signals : [];

  return (
    <div className="space-y-4">
      {/* Key metrics list */}
      <div className="bg-white border border-[#dfd2be] rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
        {rows.filter(r => r.value).map(r => (
          <div key={r.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[#8c6e4e] font-medium flex-shrink-0">{r.label}</span>
            <span className="font-semibold text-[#231207] text-right truncate font-mono">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Risk signals quick view */}
      {riskSignals.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-[#8c6e4e] uppercase tracking-wider mb-2">Detected Risk Signals</div>
          <div className="space-y-2">
            {riskSignals.map((sig: RiskSignal) => (
              <div key={sig.id} className="flex items-center justify-between bg-white border border-[#dfd2be] rounded-xl px-3 py-2 shadow-2xs">
                <span className="text-xs font-semibold text-[#231207]">{sig.name}</span>
                <span className="text-xs font-bold text-[#b91c1c]">+{sig.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Risk Tab ─────────────────────────────────────────────────────────────────
function RiskTab({ signals, onSignalClick }: { signals: RiskSignal[]; onSignalClick: (id: string) => void }) {
  return (
    <div className="space-y-2.5">
      <div className="text-xs text-[#8c6e4e] font-medium mb-1">Click a signal to highlight supporting transactions:</div>
      {signals.map(sig => (
        <button
          key={sig.id}
          onClick={() => onSignalClick(sig.id)}
          className="w-full text-left bg-white border border-[#dfd2be] hover:border-[#c49756] hover:bg-[#faf4ec] rounded-2xl p-3.5 transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-[#231207]">{sig.name}</span>
            <span className="text-xs font-extrabold text-[#b91c1c]">+{sig.score}</span>
          </div>
          <p className="text-xs text-[#8c6e4e] leading-relaxed">{sig.description}</p>
          <div className="text-[10px] text-[#c17f3a] font-semibold mt-1.5 group-hover:underline flex items-center gap-1">
            <span>{sig.supporting_transactions.length} supporting transaction{sig.supporting_transactions.length !== 1 ? "s" : ""}</span>
            <ArrowRight size={10} />
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Node Risk Tab ────────────────────────────────────────────────────────────
function NodeRiskTab({ node }: { node: GraphNode }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-[#8c6e4e] font-medium leading-relaxed">
        Risk telemetry for this connected counterparty calculated via transaction layer propagation:
      </div>
      <div className="bg-white border border-[#dfd2be] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#8c6e4e] uppercase tracking-wider">Risk Score</span>
          <span className="text-xl font-black" style={{ color: getRiskColor(node.risk_level) }}>
            {node.risk_score} / 100
          </span>
        </div>
        <div className="mt-2.5">
          <RiskBadge level={node.risk_level} />
        </div>
      </div>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return <EmptyState title="No transactions" description="No transfers found for this node in the investigation subgraph." />;
  }
  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div key={tx.transaction_id} className="bg-white border border-[#dfd2be] rounded-xl p-3 text-xs shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[#8c6e4e] text-[10px]">{tx.transaction_id}</span>
            <RiskBadge level={tx.risk_level || "Low"} size="sm" />
          </div>
          <div className="font-bold text-sm text-[#231207]">{formatCurrencyFull(tx.amount)}</div>
          <div className="text-[#8c6e4e] font-mono text-[11px] mt-1 truncate">{tx.sender_account} → {tx.receiver_account}</div>
          <div className="text-[10px] text-[#8c6e4e] mt-1 font-medium flex items-center justify-between">
            <span className="px-1.5 py-0.5 bg-[#f5ecde] rounded font-bold text-[#5c3d1e]">{tx.payment_mode}</span>
            <span>{new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Connected Tab ────────────────────────────────────────────────────────────
function ConnectedTab({ edges, nodeId, nodes }: { edges: GraphEdge[]; nodeId: string; nodes: GraphNode[] }) {
  if (!edges.length) {
    return <EmptyState title="No connections" description="No linked counterparties found in this subgraph." />;
  }

  const getNodeInfo = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="space-y-2">
      {edges.map(edge => {
        const otherId = edge.source === nodeId ? edge.target : edge.source;
        const direction = edge.source === nodeId ? "Outflow →" : "Inflow ←";
        const otherNode = getNodeInfo(otherId);
        return (
          <div key={edge.id} className="bg-white border border-[#dfd2be] rounded-xl p-3 text-xs shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-[10px] text-[#8c6e4e]">{direction}</span>
              {otherNode && <LayerBadge layer={otherNode.layer} />}
            </div>
            <div className="font-mono font-bold text-[#231207]">{otherId}</div>
            <div className="text-[11px] text-[#8c6e4e] font-medium mt-1">
              {edge.transaction_count} txn{edge.transaction_count !== 1 ? "s" : ""} · {formatCurrency(edge.total_amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Evidence Tab ─────────────────────────────────────────────────────────────
function EvidenceTab({ evidence }: { evidence: any[] }) {
  if (!evidence.length) {
    return <EmptyState title="No evidence" description="No evidence items directly attached to this counterparty." />;
  }
  return (
    <div className="space-y-2.5">
      {evidence.map(ev => (
        <div key={ev.id} className="bg-white border border-[#dfd2be] rounded-2xl p-3 text-xs shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[#8c6e4e] text-[10px] font-bold">{ev.id}</span>
            <RiskBadge level={ev.risk_level} size="sm" />
          </div>
          <div className="font-bold text-[#231207]">{ev.signal}</div>
          <p className="text-[#8c6e4e] mt-1 leading-relaxed text-[11px]">{ev.description}</p>
        </div>
      ))}
    </div>
  );
}
