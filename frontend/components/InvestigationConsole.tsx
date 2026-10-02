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
import InvestigationLanding from "@/components/InvestigationLanding";
import {
  Landmark, TrendingUp, TrendingDown, Users, AlertTriangle, Scale,
  Search, ArrowLeft, GitBranch, Clock, ArrowUpDown, Shield, FileText, CheckCircle2
} from "lucide-react";

const WORKSPACE_TABS = [
  { id: "graph", label: "Graph", icon: <GitBranch size={14} /> },
  { id: "timeline", label: "Timeline", icon: <Clock size={14} /> },
  { id: "transactions", label: "Transactions", icon: <ArrowUpDown size={14} /> },
  { id: "evidence", label: "Evidence", icon: <Shield size={14} /> },
  { id: "reports", label: "Reports", icon: <FileText size={14} /> },
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
    activeNav, setActiveNav, isJudgeMode, searchQuery,
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
      <div className="flex items-center justify-center h-full p-6">
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

  // ─── Investigation Landing / Search page ────────────────────────────────────
  if (activeNav === "investigation" || !investigation) {
    return <InvestigationLanding />;
  }

  const { account, risk } = investigation;
  const judgeMode = isJudgeMode;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fdfaf6]">
      {/* ─── Summary Strip ──────────────────────────────────────────────────── */}
      <div className={cn(
        "flex items-stretch gap-3 px-4 py-3 border-b border-[#e2d5c3] bg-[#fbf7f0]/95 flex-shrink-0",
        "overflow-x-auto select-none shadow-2xs"
      )}>
        {/* Quick Back to Search */}
        <button
          onClick={() => setActiveNav("investigation")}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#dfd2be] rounded-2xl hover:border-[#c49756] hover:bg-[#faf4ec] text-[#6b4e33] transition-all duration-200 text-xs font-semibold flex-shrink-0 shadow-2xs active:scale-95"
          title="Return to investigation search"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">New Search</span>
        </button>

        {/* Account card */}
        <div className="flex items-center gap-3 bg-white border border-[#dfd2be] rounded-2xl px-4 py-2.5 min-w-48 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs flex-shrink-0">
            <Landmark size={15} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider">Account</div>
            <div className="text-sm font-bold text-[#231207] font-mono truncate">{account.account_id}</div>
            {account.bank && <div className="text-[10px] text-[#8c6e4e] truncate font-medium">{account.bank}</div>}
          </div>
        </div>

        {/* Risk Score */}
        <div className="flex items-center gap-3 bg-white border border-[#dfd2be] rounded-2xl px-4 py-2.5 min-w-36 shadow-2xs">
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider">Risk Score</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-lg font-black tracking-tight" style={{ color: getRiskColor(risk.level) }}>
                {risk.score} <span className="text-xs font-medium text-[#8c6e4e]">/ 100</span>
              </span>
            </div>
            <div className="mt-0.5">
              <RiskBadge level={risk.level} size="sm" pulse={risk.level === "High"} />
            </div>
          </div>
          {/* Mini circular gauge */}
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90 flex-shrink-0">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#f0e8dc" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="14" fill="none"
              stroke={getRiskColor(risk.level)}
              strokeWidth="3.5"
              strokeDasharray={`${(risk.score / 100) * 87.96} 87.96`}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Layer */}
        <div className="flex items-center gap-3 bg-white border border-[#dfd2be] rounded-2xl px-4 py-2.5 min-w-32 shadow-2xs">
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider mb-1">Layer</div>
            <LayerBadge layer={account.layer} />
          </div>
        </div>

        {/* Incoming */}
        <div className="flex items-center gap-3 bg-white border border-[#dfd2be] rounded-2xl px-4 py-2.5 min-w-44 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] border border-[#d1fae5] flex items-center justify-center text-[#16a34a] flex-shrink-0 shadow-2xs">
            <TrendingUp size={15} />
          </div>
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider">Incoming</div>
            <div className="text-sm font-bold text-[#231207]">{formatCurrencyFull(account.total_incoming_amount)}</div>
            <div className="text-[10px] text-[#8c6e4e] font-medium">{account.incoming_transaction_count} txns</div>
          </div>
        </div>

        {/* Outgoing */}
        <div className="flex items-center gap-3 bg-white border border-[#dfd2be] rounded-2xl px-4 py-2.5 min-w-44 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#fef2f2] border border-[#fee2e2] flex items-center justify-center text-[#dc2626] flex-shrink-0 shadow-2xs">
            <TrendingDown size={15} />
          </div>
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider">Outgoing</div>
            <div className="text-sm font-bold text-[#231207]">{formatCurrencyFull(account.total_outgoing_amount)}</div>
            <div className="text-[10px] text-[#8c6e4e] font-medium">{account.outgoing_transaction_count} txns</div>
          </div>
        </div>

        {/* Connected */}
        <div className="flex items-center gap-3 bg-white border border-[#dfd2be] rounded-2xl px-4 py-2.5 min-w-36 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] flex-shrink-0 shadow-2xs">
            <Users size={15} />
          </div>
          <div>
            <div className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider">Connected</div>
            <div className="text-base font-bold text-[#231207]">{account.connected_accounts} accounts</div>
            <div className="text-[10px] text-[#8c6e4e] font-medium">{investigation.graph.nodes.filter(n => n.layer !== "L0").length} sub-nodes</div>
          </div>
        </div>

        {/* Risk signals quick summary */}
        {!judgeMode && risk.signals.length > 0 && (
          <div className="flex items-center gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-2xl px-4 py-2.5 min-w-64 shadow-2xs">
            <AlertTriangle size={15} className="text-[#dc2626] flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-[#991b1b] font-bold uppercase tracking-wider mb-1">Active Risk Signals</div>
              <div className="flex flex-wrap gap-1">
                {risk.signals.map(sig => (
                  <span key={sig.id} className="text-[10px] bg-white border border-[#fca5a5] text-[#b91c1c] px-2 py-0.5 rounded-full font-bold shadow-2xs">
                    {sig.name} +{sig.score}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Workspace Tabs ──────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#e2d5c3] bg-[#fbf8f3] flex-shrink-0 px-3 select-none">
        {WORKSPACE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "relative flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-200 focus:outline-none",
              activeTab === tab.id
                ? "text-[#231207]"
                : "text-[#8c6e4e] hover:text-[#231207]"
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c49756] rounded-t shadow-xs" />
            )}
          </button>
        ))}
      </div>

      {/* ─── Main Workspace ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
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
        <div className="flex-shrink-0 bg-[#231207] border-t border-[#c49756]/60 text-[#f5ebd9] px-4 py-2 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <Scale size={14} className="text-[#c49756]" />
            <span className="font-bold tracking-wide uppercase text-[#c49756]">Judge Mode Active</span>
            <span className="text-[#c2ab95] hidden sm:inline">— Technical telemetry suppressed. Showing verified judicial evidence chain.</span>
          </div>
          <span className="text-[10px] text-[#9c826b] font-mono">COURT COMPLIANT</span>
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
    <div className="w-72 flex-shrink-0 bg-white border-l border-[#e2d5c3] slide-in-right p-4 overflow-y-auto shadow-md">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e2d5c3]">
        <div className="text-xs font-bold text-[#231207] uppercase tracking-wider">Transaction Link</div>
        <button onClick={onClose} className="text-[#8c6e4e] hover:text-[#231207] p-1 transition-colors">✕</button>
      </div>
      <div className="space-y-3 text-xs">
        <div><span className="text-[#8c6e4e]">From:</span> <div className="font-mono font-bold text-[#231207] mt-0.5">{edge.source}</div></div>
        <div><span className="text-[#8c6e4e]">To:</span> <div className="font-mono font-bold text-[#231207] mt-0.5">{edge.target}</div></div>
        <div><span className="text-[#8c6e4e]">Total Volume:</span> <div className="font-bold text-sm text-[#231207] mt-0.5">{formatCurrencyFull(edge.total_amount)}</div></div>
        <div><span className="text-[#8c6e4e]">Transactions:</span> <div className="font-semibold text-[#231207] mt-0.5">{edge.transaction_count} transfers</div></div>
        {edge.payment_modes && (
          <div>
            <span className="text-[#8c6e4e]">Modes:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {edge.payment_modes.map((m: string) => (
                <span key={m} className="px-1.5 py-0.5 bg-[#f5ecde] border border-[#ebdccb] rounded text-[10px] font-bold text-[#5c3d1e]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Investigation Loading ────────────────────────────────────────────────────
function InvestigationLoading({ stage }: { stage: string }) {
  return (
    <div className="flex items-center justify-center h-full bg-[#fdfaf6] p-6">
      <div className="flex flex-col items-center gap-5 max-w-sm w-full text-center px-6 py-8 bg-white border border-[#dfd2be] rounded-3xl shadow-lg shadow-[#381e0d]/5">
        {/* Animated Brand Ring */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-[#dfd2be]" />
          <div className="absolute inset-0 rounded-full border-2 border-[#c49756] border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#3a1d0b] font-black text-xl">S</div>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-[#231207] tracking-tight">Investigating Account</h3>
          <p className="text-xs text-[#8c6e4e] mt-1 font-medium">Building relationship network & risk evidence...</p>
        </div>

        {/* Stage indicator */}
        <div className="bg-[#fcf8f2] border border-[#ebdccb] rounded-xl px-4 py-2.5 w-full shadow-2xs">
          <div className="flex items-center gap-2 justify-center">
            <LoadingDots />
            <span className="text-xs text-[#5c3d1e] font-bold">{stage || "Initialising telemetry..."}</span>
          </div>
        </div>

        {/* Progress stages */}
        <div className="w-full space-y-1.5 text-left text-xs">
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
              <div key={s} className={cn("flex items-center gap-2 transition-colors", isDone ? "text-[#16a34a] font-semibold" : isActive ? "text-[#c49756] font-bold" : "text-[#c2ab95]")}>
                <span>{isDone ? "✓" : isActive ? "▶" : "○"}</span>
                <span>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
