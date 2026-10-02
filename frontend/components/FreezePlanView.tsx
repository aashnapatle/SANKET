"use client";
import { useState } from "react";
import { Card, Button, RiskBadge, LayerBadge, EmptyState } from "@/components/ui";
import {
  Snowflake, AlertTriangle, Eye, FileText, Landmark,
  ShieldAlert, CheckCircle2, ArrowRight, Scale, Info
} from "lucide-react";
import type { InvestigationResponse } from "@/lib/types";
import { getRiskColor, formatCurrencyFull, cn } from "@/lib/utils";

interface FreezePlanViewProps {
  investigation?: InvestigationResponse | null;
}

export default function FreezePlanView({ investigation }: FreezePlanViewProps) {
  const [preparedNoticeId, setPreparedNoticeId] = useState<string | null>(null);

  const accounts = investigation?.graph.nodes ?? [];

  const freezeCandidates = accounts
    .filter(n => n.risk_score >= 50)
    .sort((a, b) => b.risk_score - a.risk_score);

  const highRiskCount = freezeCandidates.filter(c => c.risk_level === "High").length;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-[#fdfaf6]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Header & Statutory Authority ─────────────────────────────────── */}
        <div className="bg-white border border-[#e2d5c3] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c6e4e] bg-[#f5ecde] px-2.5 py-0.5 rounded-full border border-[#ebdccb]">
                Section 102 CrPC Protocol
              </span>
              <span className="text-[10px] font-mono text-[#b45309] bg-[#fef3c7] border border-[#fde68a] px-2 py-0.5 rounded-full font-bold">
                STATUTORY FREEZE MATRIX
              </span>
            </div>
            <h2 className="text-xl font-black text-[#231207] tracking-tight">
              Emergency Debit Freeze Prioritization
            </h2>
            <p className="text-xs text-[#8c6e4e] mt-1">
              Prioritized requisition schedule for bank accounts suspected of warehousing or laundering proceeds of cyber fraud.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="bg-[#fbf7f0] border border-[#e8d7c1] rounded-xl px-4 py-2 text-xs">
              <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">Flagged Targets</div>
              <div className="font-mono font-bold text-[#b91c1c] text-base">{freezeCandidates.length} Accounts</div>
            </div>
          </div>
        </div>

        {/* ─── Statutory Warning Banner ─────────────────────────────────────── */}
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#d97706] flex-shrink-0 mt-0.5">
            <Scale size={16} />
          </div>
          <div className="text-xs text-[#92400e] leading-relaxed">
            <div className="font-bold text-[#78350f] mb-0.5 flex items-center gap-2">
              <span>Judicial & Statutory Requisition Notice</span>
              <span className="text-[10px] font-normal opacity-80">(Section 102 Code of Criminal Procedure, 1973)</span>
            </div>
            Freezing of bank accounts or UPI VPA handles is a statutory power vested in designated Police Officers.
            SANKET generates prioritized forensic evidence dossiers to support lawful Section 102 CrPC notices to bank nodal officers.
            Review each node's evidentiary score before generating official seizure orders.
          </div>
        </div>

        {/* ─── Freeze Candidate Cards ───────────────────────────────────────── */}
        {freezeCandidates.length === 0 ? (
          <Card className="p-12 text-center border-[#e2d5c3] bg-white">
            <Snowflake size={32} className="text-[#8c6e4e] mx-auto mb-3 opacity-60" />
            <div className="text-sm font-bold text-[#231207]">No Accounts Flagged for Freeze</div>
            <div className="text-xs text-[#8c6e4e] max-w-sm mx-auto mt-1 leading-relaxed">
              {!investigation
                ? "Initiate an investigation on an account to calculate multi-hop risk scores and generate freeze recommendations."
                : "None of the investigated nodes exceed the critical risk threshold (score ≥ 50) requiring urgent debit freeze."}
            </div>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {freezeCandidates.map(acc => {
              const isVictim = acc.layer === "L0";
              const riskColor = getRiskColor(acc.risk_level);
              const isNoticePrepared = preparedNoticeId === acc.id;

              return (
                <Card
                  key={acc.id}
                  className={cn(
                    "p-5 border transition-all duration-200 shadow-2xs hover:shadow-xs",
                    acc.risk_level === "High" ? "border-[#fca5a5]/80 bg-white" : "border-[#e2d5c3] bg-white"
                  )}
                >
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    {/* Bank / Layer Icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] flex-shrink-0 shadow-2xs">
                      <Landmark size={20} />
                    </div>

                    {/* Account Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono font-bold text-sm text-[#231207] bg-[#fbf7f0] px-2 py-0.5 rounded border border-[#e2d5c3]">
                          {acc.id}
                        </span>
                        <RiskBadge level={acc.risk_level} score={acc.risk_score} />
                        <LayerBadge layer={acc.layer} />
                        {isVictim && (
                          <span className="text-[10px] font-bold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] rounded-full px-2 py-0.5">
                            ORIGIN / VICTIM
                          </span>
                        )}
                        {acc.bank && (
                          <span className="text-xs text-[#8c6e4e] font-medium">
                            · {acc.bank}
                          </span>
                        )}
                      </div>

                      {/* Risk progress indicator */}
                      <div className="space-y-1 mb-2.5 max-w-md">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#8c6e4e] font-medium">Dissipation & Mule Risk Index</span>
                          <span className="font-bold font-mono" style={{ color: riskColor }}>
                            {acc.risk_score} / 100
                          </span>
                        </div>
                        <div className="h-2 bg-[#f0e4d2] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${acc.risk_score}%`, backgroundColor: riskColor }}
                          />
                        </div>
                      </div>

                      {/* Forensic Justification */}
                      <div className="text-xs text-[#6b4e33] bg-[#faf6f0] p-2.5 rounded-xl border border-[#ebdccb]">
                        <span className="font-bold text-[#3d2310]">Evidentiary Rationale: </span>
                        {acc.risk_level === "High"
                          ? "High risk index indicating high velocity fund funneling. Recommended immediate debit freeze to prevent dissipation to external crypto/ATM cash-out channels."
                          : "Intermediary layering node with strong directional fund passthrough. Retain for immediate monitor and Section 91 information order."}
                      </div>

                      {isNoticePrepared && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 rounded-lg">
                          <CheckCircle2 size={13} className="text-[#16a34a]" />
                          <span>Draft Notice SANKET/102/{acc.id} prepared for SP review.</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0 pt-2 md:pt-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 justify-center"
                        onClick={() => {
                          const tabBtn = document.querySelector('[data-tab="transactions"]') as HTMLElement;
                          if (tabBtn) tabBtn.click();
                        }}
                      >
                        <Eye size={12} /> Review Ledger
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5 justify-center"
                        onClick={() => setPreparedNoticeId(acc.id)}
                      >
                        <FileText size={12} /> Draft Sec 102 Notice
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── Technical Endpoint Note ───────────────────────────────────────── */}
        <div className="bg-[#fbf7f0] border border-[#e8d7c1] rounded-2xl p-4.5 text-xs text-[#6b4e33] shadow-2xs">
          <div className="font-bold text-[#3d2310] mb-1 flex items-center gap-2">
            <Info size={14} className="text-[#b48c48]" />
            <span>FastAPI Backend Freeze Plan Integration</span>
          </div>
          <p className="leading-relaxed">
            In live law enforcement deployments, freeze orders are dynamically synchronized with state cybercrime police nodal hubs via <code className="bg-white border border-[#dfd2be] px-1.5 py-0.5 rounded font-mono text-[#5c3d1e]">GET /api/freeze-plan/{"{account_id}"}</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
