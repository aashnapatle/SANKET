"use client";
import { useState } from "react";
import { useSanketStore } from "@/lib/store";
import { Card, RiskBadge, LayerBadge, Button, Tabs, EmptyState } from "@/components/ui";
import { formatCurrency, formatCurrencyFull, formatTimestamp, getRiskColor, cn } from "@/lib/utils";
import type { InvestigationResponse, RiskSignal, GraphNode, GraphEdge, Transaction } from "@/lib/types";
import { X, Copy, ExternalLink, TrendingUp, TrendingDown, Users, AlertTriangle } from "lucide-react";

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
    <div className="w-80 flex-shrink-0 flex flex-col bg-[#fdf8f3] border-l border-[#e8d8c4] slide-in-right overflow-hidden">
      {/* ─── Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 border-b border-[#e8d8c4]">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[#8c6e4e] mb-1 font-medium uppercase tracking-wide">Account Details</div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0e8dc] flex items-center justify-center text-[#5c3d1e] flex-shrink-0">
              <span className="text-sm">🏛</span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-[#2c1810] truncate">{node.id}</div>
              {node.bank && <div className="text-xs text-[#8c6e4e]">{node.bank}</div>}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <RiskBadge level={node.risk_level} />
          {/* Risk Score circle */}
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e8d8c4" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={getRiskColor(node.risk_level)}
                strokeWidth="3"
                strokeDasharray={`${(node.risk_score / 100) * 94.2} 94.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: getRiskColor(node.risk_level) }}>
              {node.risk_score}
            </span>
          </div>
          <button onClick={onClose} className="text-[#8c6e4e] hover:text-[#2c1810] transition-colors p-0.5">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ─── Tabs ─────────────────────────────────────── */}
      <div className="flex border-b border-[#e8d8c4] flex-shrink-0 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as PanelTab)}
            className={cn(
              "flex-shrink-0 px-3 py-2.5 text-xs font-medium transition-colors relative whitespace-nowrap",
              tab === t.id ? "text-[#5c3d1e]" : "text-[#8c6e4e] hover:text-[#5c3d1e]"
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5c3d1e] rounded-t" />}
          </button>
        ))}
      </div>

      {/* ─── Content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
    { label: "Bank / IFSC", value: account.ifsc ? `${account.bank} · ${account.ifsc}` : account.bank },
    { label: "UPI (linked)", value: account.upi_id },
    { label: "Incoming", value: account.total_incoming_amount > 0 ? formatCurrencyFull(account.total_incoming_amount) + ` (${account.incoming_transaction_count})` : null },
    { label: "Outgoing", value: account.total_outgoing_amount > 0 ? formatCurrencyFull(account.total_outgoing_amount) + ` (${account.outgoing_transaction_count})` : null },
    { label: "Connected Accounts", value: account.connected_accounts },
  ];

  const riskSignals = isVictim ? investigation.risk.signals : [];

  return (
    <div className="space-y-4">
      {/* Key metrics */}
      <div className="space-y-2">
        {rows.filter(r => r.value).map(r => (
          <div key={r.label} className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8c6e4e] flex-shrink-0">{r.label}</span>
            <span className="text-xs font-medium text-[#2c1810] text-right">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Risk signals quick view */}
      {riskSignals.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#2c1810] mb-2">Risk Signals</div>
          <div className="space-y-1.5">
            {riskSignals.map((sig: RiskSignal) => (
              <div key={sig.id} className="flex items-center justify-between bg-[#f5f0eb] rounded-lg px-2.5 py-1.5">
                <span className="text-xs text-[#2c1810]">{sig.name}</span>
                <span className="text-xs font-bold text-[#c0392b]">+{sig.score}</span>
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
    <div className="space-y-2">
      <div className="text-xs text-[#8c6e4e] mb-3">Click a signal to view supporting transactions</div>
      {signals.map(sig => (
        <button
          key={sig.id}
          onClick={() => onSignalClick(sig.id)}
          className="w-full text-left bg-[#f5f0eb] hover:bg-[#ede5d8] rounded-lg p-3 transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#2c1810]">{sig.name}</span>
            <span className="text-sm font-bold text-[#c0392b]">+{sig.score}</span>
          </div>
          <p className="text-xs text-[#8c6e4e]">{sig.description}</p>
          <div className="text-[10px] text-[#c17f3a] mt-1 group-hover:underline">
            {sig.supporting_transactions.length} supporting transaction{sig.supporting_transactions.length !== 1 ? "s" : ""}
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
      <div className="text-xs text-[#8c6e4e]">Risk assessment for this node is provided by the backend.</div>
      <div className="bg-[#f5f0eb] rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#2c1810]">Risk Score</span>
          <span className="text-lg font-bold" style={{ color: getRiskColor(node.risk_level) }}>
            {node.risk_score} / 100
          </span>
        </div>
        <div className="mt-2">
          <RiskBadge level={node.risk_level} />
        </div>
      </div>
    </div>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return <EmptyState title="No transactions" description="No transactions found for this account in the investigation subgraph." />;
  }
  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div key={tx.transaction_id} className="bg-[#f5f0eb] rounded-lg p-2.5 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[#8c6e4e] text-[10px]">{tx.transaction_id}</span>
            <RiskBadge level={tx.risk_level || "Low"} size="sm" />
          </div>
          <div className="font-semibold text-[#2c1810]">{formatCurrencyFull(tx.amount)}</div>
          <div className="text-[#8c6e4e] mt-0.5">{tx.sender_account} → {tx.receiver_account}</div>
          <div className="text-[#8c6e4e]">{tx.payment_mode} · {new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Connected Tab ────────────────────────────────────────────────────────────
function ConnectedTab({ edges, nodeId, nodes }: { edges: GraphEdge[]; nodeId: string; nodes: GraphNode[] }) {
  if (!edges.length) {
    return <EmptyState title="No connections" description="No connected accounts in this investigation subgraph." />;
  }

  const getNodeInfo = (id: string) => nodes.find(n => n.id === id);

  return (
    <div className="space-y-2">
      {edges.map(edge => {
        const otherId = edge.source === nodeId ? edge.target : edge.source;
        const direction = edge.source === nodeId ? "→" : "←";
        const otherNode = getNodeInfo(otherId);
        return (
          <div key={edge.id} className="bg-[#f5f0eb] rounded-lg p-2.5 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#8c6e4e]">{direction}</span>
              <span className="font-medium text-[#2c1810]">{otherId}</span>
              {otherNode && <LayerBadge layer={otherNode.layer} />}
            </div>
            <div className="text-[#8c6e4e]">
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
    return <EmptyState title="No evidence" description="No evidence directly linked to this account in current investigation." />;
  }
  return (
    <div className="space-y-2">
      {evidence.map(ev => (
        <div key={ev.id} className="bg-[#f5f0eb] rounded-lg p-2.5 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[#8c6e4e] text-[10px]">{ev.id}</span>
            <RiskBadge level={ev.risk_level} size="sm" />
          </div>
          <div className="font-semibold text-[#2c1810]">{ev.signal}</div>
          <p className="text-[#8c6e4e] mt-1">{ev.description}</p>
        </div>
      ))}
    </div>
  );
}
