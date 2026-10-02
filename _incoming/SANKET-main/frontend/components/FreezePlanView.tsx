"use client";
import { Card, Button, RiskBadge } from "@/components/ui";
import { Snowflake, AlertTriangle, Eye, FileText } from "lucide-react";
import type { InvestigationResponse } from "@/lib/types";
import { getRiskColor } from "@/lib/utils";

interface FreezePlanViewProps {
  investigation?: InvestigationResponse | null;
}

export default function FreezePlanView({ investigation }: FreezePlanViewProps) {
  const accounts = investigation?.graph.nodes ?? [];

  const freezeCandidates = accounts
    .filter(n => n.risk_score >= 50)
    .sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#2c1810]">Freeze Plan</h2>
          <p className="text-sm text-[#8c6e4e] mt-1">
            Review accounts flagged for potential freeze. Actions must be authorised by designated authority.
            {!investigation && " Investigate an account first to see freeze candidates."}
          </p>
        </div>

        {/* ─── Warning ───────────────────────────────── */}
        <div className="bg-[#fef9f0] border border-[#f9d8a8] rounded-xl p-4 flex gap-3">
          <AlertTriangle size={16} className="text-[#e67e22] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#7d4e00]">
            <div className="font-semibold mb-0.5">Important</div>
            Account freeze actions are not executed by SANKET directly. This module displays recommended actions for investigator review. Final freeze must follow legal procedure.
          </div>
        </div>

        {/* ─── Table ─────────────────────────────────── */}
        {freezeCandidates.length === 0 ? (
          <Card className="p-8 text-center">
            <Snowflake size={24} className="text-[#8c6e4e] mx-auto mb-3" />
            <div className="text-sm font-medium text-[#2c1810]">No freeze candidates</div>
            <div className="text-xs text-[#8c6e4e] mt-1">Investigate an account to see freeze plan recommendations.</div>
          </Card>
        ) : (
          <div className="space-y-3">
            {freezeCandidates.map(acc => {
              const isVictim = acc.layer === "L0";
              return (
                <Card key={acc.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f0e8dc] flex items-center justify-center text-lg flex-shrink-0">🏛</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-sm text-[#2c1810]">{acc.id}</span>
                        <RiskBadge level={acc.risk_level} score={acc.risk_score} />
                        {isVictim && <span className="text-[10px] bg-[#fdf0ef] text-[#c0392b] border border-[#f1b4b0] rounded-full px-2 py-0.5">VICTIM ACCOUNT</span>}
                      </div>
                      <div className="text-xs text-[#8c6e4e] mb-2">
                        Layer: {acc.layer} {acc.bank && `· ${acc.bank}`}
                      </div>

                      {/* Risk bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#f0e8dc] rounded-full">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${acc.risk_score}%`, backgroundColor: getRiskColor(acc.risk_level) }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: getRiskColor(acc.risk_level) }}>
                          {acc.risk_score}
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="mt-2 text-xs text-[#5c3d1e]">
                        <span className="font-medium">Reason: </span>
                        {acc.risk_level === "High" ? "High risk score — potential mule account. Rapid fund movement detected." :
                         "Elevated risk — connected to high-risk accounts in transaction chain."}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <Eye size={11} /> Review
                      </Button>
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <FileText size={11} /> Prepare
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-xs text-[#8c6e4e] bg-[#f5f0eb] border border-[#e8d8c4] rounded-xl p-4">
          <div className="font-semibold text-[#5c3d1e] mb-1">FastAPI Integration Note</div>
          Freeze plan data should come from <code className="font-mono">GET /api/freeze-plan/{"{account_id}"}</code>. Currently derived from graph risk scores in mock mode.
        </div>
      </div>
    </div>
  );
}
