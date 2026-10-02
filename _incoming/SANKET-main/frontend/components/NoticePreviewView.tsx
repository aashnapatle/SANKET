"use client";
import { useState } from "react";
import { Card, Button, RiskBadge } from "@/components/ui";
import type { InvestigationResponse } from "@/lib/types";
import { formatCurrencyFull } from "@/lib/utils";
import { FileSearch, Printer, Download, Eye } from "lucide-react";

interface NoticePreviewViewProps {
  investigation?: InvestigationResponse | null;
}

export default function NoticePreviewView({ investigation }: NoticePreviewViewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const account = investigation?.account;
  const risk = investigation?.risk;

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#2c1810]">Notice Preview</h2>
          <p className="text-sm text-[#8c6e4e] mt-1">
            Preview and download formal notice for financial institution or investigative authority.
          </p>
        </div>

        {/* ─── Notice Metadata ────────────────────────── */}
        {account && (
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#2c1810]">Notice Details</h3>
              <RiskBadge level={account.risk_level} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Recipient", account.bank || "Financial Institution"],
                ["Subject Account", account.account_id],
                ["IFSC", account.ifsc || "—"],
                ["Risk Score", `${account.risk_score} / 100`],
                ["Notice Date", today],
                ["Reference No", `SANKET/CY/${new Date().getFullYear()}/001`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs text-[#8c6e4e]">{k}</div>
                  <div className="font-medium text-[#2c1810]">{v}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── Actions ────────────────────────────────── */}
        <div className="flex gap-3">
          <Button
            size="md"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="gap-2"
          >
            <Eye size={14} /> {isPreviewOpen ? "Close Preview" : "Preview Notice"}
          </Button>
          <Button variant="secondary" size="md" className="gap-2">
            <Download size={14} /> Download PDF
          </Button>
          <Button variant="secondary" size="md" className="gap-2">
            <Printer size={14} /> Print
          </Button>
        </div>

        {/* ─── Notice Document ────────────────────────── */}
        {isPreviewOpen && (
          <Card className="p-8 border-2 border-[#e8d8c4] fade-in">
            <div className="space-y-6 text-sm text-[#2c1810] font-serif">
              {/* Header */}
              <div className="text-center border-b border-[#e8d8c4] pb-4">
                <div className="text-base font-bold uppercase tracking-wide">SANKET — Financial Investigation Console</div>
                <div className="text-xs text-[#8c6e4e] mt-1">Operation Abhedya-Chakra | Cybercrime Investigation Unit</div>
                <div className="text-xs text-[#8c6e4e]">Ref: SANKET/CY/{new Date().getFullYear()}/001 | Date: {today}</div>
              </div>

              {/* Recipient */}
              <div>
                <div className="font-semibold">To,</div>
                <div>The Nodal Officer (Financial Crimes),</div>
                <div>{account?.bank || "[Financial Institution]"}</div>
                {account?.ifsc && <div>IFSC Branch: {account.ifsc}</div>}
              </div>

              {/* Subject */}
              <div>
                <div className="font-semibold underline">
                  Subject: Notice Regarding Suspicious Financial Activity — Account {account?.account_id || "[Account ID]"}
                </div>
              </div>

              {/* Body */}
              <div className="space-y-3 leading-relaxed">
                <p>
                  This is to bring to your attention that the above-referenced account has been identified
                  during a structured financial investigation using SANKET, an offline-first financial
                  transaction intelligence platform.
                </p>

                <p>
                  The investigation, conducted on transaction data spanning the period of
                  {account?.first_seen ? ` ${new Date(account.first_seen).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}` : " the investigation window"},
                  has identified the following risk indicators:
                </p>

                <ul className="list-disc list-inside space-y-1 pl-4">
                  {risk?.signals.map(sig => (
                    <li key={sig.id}>{sig.name}: {sig.description}</li>
                  )) ?? (
                    <>
                      <li>Rapid downstream fund transfer patterns</li>
                      <li>Fan-out to multiple accounts within minutes</li>
                      <li>Suspected layering through intermediary accounts</li>
                    </>
                  )}
                </ul>

                <p>
                  The overall risk score assigned to this account is{" "}
                  <strong>{account?.risk_score ?? "—"}/100</strong>{" "}
                  ({account?.risk_level ?? "—"} Risk), based on backend risk analysis.
                </p>

                <p>
                  You are hereby requested to provide full transaction records, KYC details, and
                  account statements for the period under investigation, in accordance with Section 91
                  of the Code of Criminal Procedure, 1973.
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-[#e8d8c4] pt-4 flex justify-between text-xs text-[#8c6e4e]">
                <div>
                  <div className="font-semibold text-[#2c1810]">Investigating Officer</div>
                  <div>SANKET Investigation Console</div>
                  <div>Cybercrime Unit</div>
                </div>
                <div className="text-right">
                  <div className="italic text-[#c4a882]">Document generated by SANKET</div>
                  <div>This is a system-generated preview</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {!account && (
          <Card className="p-8 text-center">
            <FileSearch size={24} className="text-[#8c6e4e] mx-auto mb-3" />
            <div className="text-sm font-medium text-[#2c1810]">No active investigation</div>
            <div className="text-xs text-[#8c6e4e] mt-1">Investigate an account first to generate a notice.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
