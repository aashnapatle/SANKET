"use client";
import { useSanketStore } from "@/lib/store";
import { MetricCard, Card, RiskBadge, LayerBadge, LoadingDots, EmptyState, ErrorState, Button, Tabs } from "@/components/ui";
import { formatCurrency, formatCurrencyFull, getRiskColor, cn } from "@/lib/utils";
import InvestigationGraph from "@/components/InvestigationGraph";
import AccountDetailsPanel from "@/components/AccountDetailsPanel";
import TimelineView from "@/components/TimelineView";
import TransactionsView from "@/components/TransactionsView";
import EvidenceView from "@/components/EvidenceView";
import ReportsView from "@/components/ReportsView";
import FreezePlanView from "@/components/FreezePlanView";
import NoticePreviewView from "@/components/NoticePreviewView";
import BenchmarkView from "@/components/BenchmarkView";
import PromptDefenseView from "@/components/PromptDefenseView";
import { Landmark, TrendingUp, TrendingDown, Users, AlertTriangle, Scale } from "lucide-react";

const WORKSPACE_TABS = [
  { id: "graph", label: "Graph", icon: "⬡" },
  { id: "timeline", label: "Timeline", icon: "⏱" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "evidence", label: "Evidence", icon: "🛡" },
  { id: "reports", label: "Reports", icon: "📋" },
];

const LOADING_STAGES = [
  "Finding account...",
  "Loading transactions...",
  "Building relationship graph...",
  "Analysing movement patterns...",
  "Calculating risk signals...",
  "Preparing evidence...",
  "Finalising investigation...",
];

export default function InvestigationConsole() {
  const {
    investigation, isInvestigating, investigationError, investigationStage,
    activeTab, setActiveTab,
    selectedNodeId, selectedEdgeId, setSelectedNode, setSelectedEdge,
    activeNav, isJudgeMode, searchQuery,
  } = useSanketStore();

  // ─── Tool views ─────────────────────────────────────────────────────────────
  if (activeNav === "freeze") return <FreezePlanView investigation={investigation} />;
  if (activeNav === "notice") return <NoticePreviewView investigation={investigation} />;
  if (activeNav === "benchmark") return <BenchmarkView />;
  if (activeNav === "prompt-defense") return <PromptDefenseView />;

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (isInvestigating) {
    return <InvestigationLoading stage={investigationStage} />;
  }

  // ─── Error state ────────────────────────────────────────────────────────────
  if (investigationError) {
    return (
      <div className="flex items-center justify-center h-full">
        <ErrorState
          title="Investigation Failed"
          description={investigationError}
          action={
            <Button variant="secondary" onClick={() => useSanketStore.getState().clearInvestigation()}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // ─── Welcome state ──────────────────────────────────────────────────────────
  if (!investigation) {
    return <WelcomeState />;
  }

  const { account, risk } = investigation;
  const judgeMode = isJudgeMode;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── Summary Strip ──────────────────────────────────────────────────── */}
      <div className={cn(
        "flex items-stretch gap-3 px-4 py-3 border-b border-[#e8d8c4] bg-[#fdf8f3] flex-shrink-0",
        "overflow-x-auto"
      )}>
        {/* Account card */}
        <div className="flex items-center gap-3 bg-white border border-[#e8d8c4] rounded-xl px-4 py-3 min-w-48">
          <div className="w-9 h-9 rounded-lg bg-[#f0e8dc] flex items-center justify-center text-[#5c3d1e]">
            <Landmark size={16} />
          </div>
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide">Account</div>
            <div className="text-sm font-bold text-[#2c1810] font-mono">{account.account_id}</div>
            {account.bank && <div className="text-[10px] text-[#8c6e4e]">{account.bank}</div>}
          </div>
        </div>

        {/* Risk Score */}
        <div className="flex items-center gap-3 bg-white border border-[#e8d8c4] rounded-xl px-4 py-3 min-w-36">
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide">Risk Score</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: getRiskColor(risk.level) }}>
                {risk.score} <span className="text-sm font-normal text-[#8c6e4e]">/ 100</span>
              </span>
            </div>
            <RiskBadge level={risk.level} pulse={risk.level === "High"} />
          </div>
          {/* Mini donut */}
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90 flex-shrink-0">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#f0e8dc" strokeWidth="4" />
            <circle cx="18" cy="18" r="14" fill="none"
              stroke={getRiskColor(risk.level)}
              strokeWidth="4"
              strokeDasharray={`${(risk.score / 100) * 87.96} 87.96`}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Layer */}
        <div className="flex items-center gap-3 bg-white border border-[#e8d8c4] rounded-xl px-4 py-3 min-w-36">
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide">Layer</div>
            <LayerBadge layer={account.layer} />
          </div>
        </div>

        {/* Incoming */}
        <div className="flex items-center gap-3 bg-white border border-[#e8d8c4] rounded-xl px-4 py-3 min-w-44">
          <TrendingUp size={16} className="text-[#27ae60] flex-shrink-0" />
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide">Incoming</div>
            <div className="text-sm font-bold text-[#2c1810]">{formatCurrencyFull(account.total_incoming_amount)}</div>
            <div className="text-[10px] text-[#8c6e4e]">{account.incoming_transaction_count} transactions</div>
          </div>
        </div>

        {/* Outgoing */}
        <div className="flex items-center gap-3 bg-white border border-[#e8d8c4] rounded-xl px-4 py-3 min-w-44">
          <TrendingDown size={16} className="text-[#c0392b] flex-shrink-0" />
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide">Outgoing</div>
            <div className="text-sm font-bold text-[#2c1810]">{formatCurrencyFull(account.total_outgoing_amount)}</div>
            <div className="text-[10px] text-[#8c6e4e]">{account.outgoing_transaction_count} transactions</div>
          </div>
        </div>

        {/* Connected */}
        <div className="flex items-center gap-3 bg-white border border-[#e8d8c4] rounded-xl px-4 py-3 min-w-40">
          <Users size={16} className="text-[#5c3d1e] flex-shrink-0" />
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide">Connected Accounts</div>
            <div className="text-lg font-bold text-[#2c1810]">{account.connected_accounts}</div>
            <div className="text-[10px] text-[#8c6e4e]">Across {investigation.graph.nodes.filter(n => n.layer !== "L0").length} nodes</div>
          </div>
        </div>

        {/* Risk signals quick summary */}
        {!judgeMode && risk.signals.length > 0 && (
          <div className="flex items-center gap-2 bg-[#fdf0ef] border border-[#f1b4b0] rounded-xl px-4 py-3 min-w-64">
            <AlertTriangle size={14} className="text-[#c0392b] flex-shrink-0" />
            <div>
              <div className="text-[10px] text-[#8c6e4e] font-medium uppercase tracking-wide mb-1">Risk Signals</div>
              <div className="flex flex-wrap gap-1">
                {risk.signals.map(sig => (
                  <span key={sig.id} className="text-[10px] bg-white border border-[#f1b4b0] text-[#c0392b] px-1.5 py-0.5 rounded-full font-medium">
                    {sig.name} +{sig.score}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Workspace Tabs ──────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#e8d8c4] bg-[#fdf8f3] flex-shrink-0 px-2">
        {WORKSPACE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "relative flex items-center gap-1.5 px-5 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none",
              activeTab === tab.id
                ? "text-[#5c3d1e]"
                : "text-[#8c6e4e] hover:text-[#5c3d1e]"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5c3d1e] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Main Workspace ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ─── Graph View ─────────────────────────────────────────────────── */}
        {activeTab === "graph" && (
          <>
            <div className="flex-1 min-w-0 overflow-hidden">
              <InvestigationGraph graph={investigation.graph} />
            </div>
            {/* Account Details Panel */}
            {selectedNodeId && (
              <AccountDetailsPanel
                investigation={investigation}
                nodeId={selectedNodeId}
                onClose={() => setSelectedNode(null)}
              />
            )}
            {/* Edge panel when no node selected */}
            {selectedEdgeId && !selectedNodeId && (
              <EdgeDetailsPanel
                investigation={investigation}
                edgeId={selectedEdgeId}
                onClose={() => setSelectedEdge(null)}
              />
            )}
          </>
        )}

        {activeTab === "timeline" && (
          <div className="flex-1 overflow-hidden">
            <TimelineView investigation={investigation} />
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="flex-1 overflow-hidden">
            <TransactionsView transactions={investigation.transactions} />
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="flex-1 overflow-hidden">
            <EvidenceView investigation={investigation} />
          </div>
        )}

        {activeTab === "reports" && (
          <div className="flex-1 overflow-hidden">
            <ReportsView accountId={account.account_id} />
          </div>
        )}
      </div>

      {/* ─── Judge Mode Banner ───────────────────────────────────────────────── */}
      {judgeMode && (
        <div className="flex-shrink-0 bg-[#5c3d1e] text-[#f5f0eb] px-4 py-2 flex items-center gap-2 text-xs">
          <Scale size={13} />
          <span className="font-semibold">JUDGE MODE ACTIVE</span>
          <span className="text-[#c4a882]">— Technical details hidden. Showing: Victim → Risk → Evidence chain</span>
        </div>
      )}
    </div>
  );
}

// ─── Edge Details Panel ────────────────────────────────────────────────────────
function EdgeDetailsPanel({ investigation, edgeId, onClose }: { investigation: any; edgeId: string; onClose: () => void }) {
  const edge = investigation.graph.edges.find((e: any) => e.id === edgeId);
  if (!edge) return null;

  return (
    <div className="w-72 flex-shrink-0 bg-[#fdf8f3] border-l border-[#e8d8c4] slide-in-right p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-[#2c1810] uppercase tracking-wide">Transaction Link</div>
        <button onClick={onClose} className="text-[#8c6e4e] hover:text-[#2c1810] transition-colors">✕</button>
      </div>
      <div className="space-y-3 text-sm">
        <div><span className="text-[#8c6e4e] text-xs">From:</span> <span className="font-medium text-[#2c1810]">{edge.source}</span></div>
        <div><span className="text-[#8c6e4e] text-xs">To:</span> <span className="font-medium text-[#2c1810]">{edge.target}</span></div>
        <div><span className="text-[#8c6e4e] text-xs">Transactions:</span> <span className="font-medium">{edge.transaction_count}</span></div>
        <div><span className="text-[#8c6e4e] text-xs">Total Amount:</span> <span className="font-semibold text-[#2c1810]">{formatCurrencyFull(edge.total_amount)}</span></div>
        {edge.payment_modes && (
          <div><span className="text-[#8c6e4e] text-xs">Payment Modes:</span> <span>{edge.payment_modes.join(", ")}</span></div>
        )}
      </div>
    </div>
  );
}

// ─── Investigation Loading ────────────────────────────────────────────────────
function InvestigationLoading({ stage }: { stage: string }) {
  return (
    <div className="flex items-center justify-center h-full bg-[#f5f0eb]">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center px-6">
        {/* Animated logo */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#c4a882] animate-spin border-t-[#5c3d1e]" />
          <div className="absolute inset-2 rounded-full border border-[#e8d8c4]" />
          <div className="absolute inset-0 flex items-center justify-center text-[#5c3d1e] font-bold text-lg">S</div>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#2c1810] mb-1">Investigating Account</h3>
          <p className="text-sm text-[#8c6e4e]">Please wait while SANKET builds the investigation...</p>
        </div>

        {/* Stage indicator */}
        <div className="bg-white border border-[#e8d8c4] rounded-xl px-5 py-3 w-full shadow-sm">
          <div className="flex items-center gap-2 justify-center">
            <LoadingDots />
            <span className="text-sm text-[#5c3d1e] font-medium">{stage || "Initialising..."}</span>
          </div>
        </div>

        {/* Progress stages */}
        <div className="w-full space-y-1.5 text-left">
          {[
            "Finding account",
            "Loading transactions",
            "Building relationship graph",
            "Analysing movement",
            "Preparing evidence",
          ].map((s, i) => {
            const currentIndex = LOADING_STAGES.findIndex(ls => ls.includes(stage?.split("...")[0] || ""));
            const isDone = currentIndex > i;
            const isActive = currentIndex === i;
            return (
              <div key={s} className={cn("flex items-center gap-2 text-xs", isDone ? "text-[#27ae60]" : isActive ? "text-[#5c3d1e]" : "text-[#c4a882]")}>
                <span>{isDone ? "✓" : isActive ? "▶" : "○"}</span>
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Welcome State ────────────────────────────────────────────────────────────
function WelcomeState() {
  const { recentSearches, setSearchQuery } = useSanketStore();

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-b from-[#f5f0eb] to-[#fdf8f3]">
      <div className="max-w-lg text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#2c1810] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg">
          S
        </div>
        <h2 className="text-xl font-bold text-[#2c1810] mb-2">SANKET</h2>
        <p className="text-sm text-[#8c6e4e] mb-2">Financial Investigation Console</p>
        <p className="text-xs text-[#b0977a] italic mb-8 leading-relaxed">
          "Trace money movement. Understand hidden relationships. Build defensible evidence."
        </p>

        <div className="bg-white border border-[#e8d8c4] rounded-xl p-6 text-left shadow-sm">
          <div className="text-xs font-semibold text-[#8c6e4e] uppercase tracking-wide mb-3">Enter an account to investigate</div>
          <p className="text-sm text-[#5c3d1e] mb-4">
            Type an account number, UPI ID, or phone number in the search bar above and click <strong>INVESTIGATE →</strong>
          </p>

          {recentSearches.length > 0 && (
            <>
              <div className="text-xs text-[#8c6e4e] mb-2">Quick start — recent searches:</div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map(s => (
                  <button
                    key={s}
                    onClick={() => setSearchQuery(s)}
                    className="text-xs bg-[#f5f0eb] border border-[#e8d8c4] text-[#5c3d1e] px-3 py-1.5 rounded-lg hover:bg-[#ede5d8] transition-colors font-mono"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-[#8c6e4e]">
          {[
            { icon: "⬡", label: "Transaction Graph", desc: "L0→L3 relationship map" },
            { icon: "⏱", label: "Timeline", desc: "Chronological money flow" },
            { icon: "🛡", label: "Evidence", desc: "Court-ready evidence chain" },
          ].map(f => (
            <div key={f.label} className="bg-white border border-[#e8d8c4] rounded-lg p-3">
              <div className="text-base mb-1">{f.icon}</div>
              <div className="font-medium text-[#2c1810]">{f.label}</div>
              <div className="text-[10px] mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
