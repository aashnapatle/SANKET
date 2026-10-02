"use client";
import { useState } from "react";
import { Card, Button, RiskBadge } from "@/components/ui";
import type { InvestigationResponse } from "@/lib/types";
import { formatCurrencyFull, getRiskColor, cn } from "@/lib/utils";
import {
  FileSearch, Printer, Download, Eye, EyeOff,
  Copy, Check, Landmark, Shield, Scale, FileText
} from "lucide-react";

interface NoticePreviewViewProps {
  investigation?: InvestigationResponse | null;
}

export default function NoticePreviewView({ investigation }: NoticePreviewViewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const account = investigation?.account;
  const risk = investigation?.risk;

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `SANKET/CYBER/SEC91/${new Date().getFullYear()}/${account ? account.account_id.slice(-4) : "0894"}`;

  const handleCopyText = () => {
    if (!account) return;
    const text = `
NOTICE UNDER SECTION 91 OF THE CODE OF CRIMINAL PROCEDURE, 1973
Reference No: ${refNo}
Date: ${today}

TO:
The Nodal Officer (Law Enforcement / Fraud Risk Management),
${account.bank || "Designated Financial Institution"},
IFSC / Branch: ${account.ifsc || "N/A"}

SUBJECT: URGENT REQUISITION OF TRANSACTION RECORDS & KYC DETAILS REGARDING ACCOUNT NO. ${account.account_id}

Sir/Madam,
Whereas it is made to appear to this Cyber Crime Investigation Unit that the bank account bearing number ${account.account_id} held with your institution is suspected of having been utilised in a cyber-financial fraud involving multi-hop layering.

The automated forensic risk assessment system (SANKET) has flagged this account with Risk Score ${account.risk_score}/100 (${account.risk_level} Risk).

Pursuant to powers conferred under Section 91 of the Code of Criminal Procedure, 1973, you are hereby directed to provide within 24 hours:
1. Certified account statement from inception to date (Section 65B IEA compliant).
2. Complete KYC dossier including Aadhaar/PAN, photographs, and contact numbers.
3. IP access logs, Device IDs, and IMEI numbers associated with net-banking/mobile banking.
4. Immediate debit freeze on available balance under Section 102 CrPC pending inquiry.

Failure to comply with this statutory direction may attract penal consequences under Section 175 of the Indian Penal Code.

Yours faithfully,
Investigating Officer,
Cyber Crime Police Station.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-[#fdfaf6]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e2d5c3] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c6e4e] bg-[#f5ecde] px-2.5 py-0.5 rounded-full border border-[#ebdccb]">
                Section 91 CrPC Generator
              </span>
              <span className="text-[10px] font-mono text-[#16a34a] bg-[#ecfdf5] border border-[#d1fae5] px-2 py-0.5 rounded-full font-bold">
                STATUTORY COMPLIANCE
              </span>
            </div>
            <h2 className="text-xl font-black text-[#231207] tracking-tight">
              Statutory Bank Requisition Notice
            </h2>
            <p className="text-xs text-[#8c6e4e] mt-1">
              Official legal summons served on bank nodal officers for frozen funds, KYC disclosures, and transaction logs.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="bg-[#fbf7f0] border border-[#e8d7c1] rounded-xl px-4 py-2 text-xs">
              <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">Statutory Reference</div>
              <div className="font-mono font-bold text-[#3d2310]">{refNo}</div>
            </div>
          </div>
        </div>

        {/* ─── Notice Metadata & Actions ───────────────────────────────────── */}
        {account ? (
          <Card className="p-5 border-[#e2d5c3] bg-white shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f0e8dc]">
              <div className="flex items-center gap-2">
                <Landmark size={15} className="text-[#5c3d1e]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#231207]">
                  Requisition Parameters
                </span>
              </div>
              <RiskBadge level={account.risk_level} score={account.risk_score} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">Recipient Bank</div>
                <div className="font-bold text-[#231207] mt-0.5">{account.bank || "Financial Institution"}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">Subject Account</div>
                <div className="font-mono font-bold text-[#5c3d1e] mt-0.5">{account.account_id}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">IFSC Code</div>
                <div className="font-mono font-bold text-[#231207] mt-0.5">{account.ifsc || "ALL BRANCHES"}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">Service Date</div>
                <div className="font-medium text-[#231207] mt-0.5">{today}</div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-[#f0e8dc]">
              <Button
                size="sm"
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="gap-2"
              >
                {isPreviewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
                {isPreviewOpen ? "Hide Preview" : "View Official Document"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyText}
                className="gap-2"
              >
                {copied ? <Check size={13} className="text-[#16a34a]" /> : <Copy size={13} />}
                {copied ? "Copied to Clipboard" : "Copy Statutory Text"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                className="gap-2"
              >
                <Printer size={13} /> Print Notice
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={handleCopyText}
              >
                <Download size={13} /> Export PDF
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-10 text-center border-[#e2d5c3] bg-white">
            <FileSearch size={28} className="text-[#8c6e4e] mx-auto mb-2 opacity-60" />
            <div className="text-sm font-bold text-[#231207]">No Target Account Selected</div>
            <div className="text-xs text-[#8c6e4e] mt-1">
              Investigate a bank account or UPI ID to populate statutory Section 91 requisition fields.
            </div>
          </Card>
        )}

        {/* ─── Legal Document Paper / Parchment Container ───────────────────── */}
        {isPreviewOpen && account && (
          <div className="bg-[#fffdf9] border-2 border-[#d9c7af] rounded-2xl p-8 md:p-12 shadow-sm font-serif text-[#1e140d] space-y-6 relative overflow-hidden">
            {/* Subtle Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-8xl font-black font-sans tracking-widest text-[#2c1810]">
                SANKET
              </span>
            </div>

            {/* Document Header */}
            <div className="text-center border-b-2 border-[#d9c7af] pb-5 relative z-10">
              <div className="text-xs font-sans font-bold uppercase tracking-widest text-[#8c6e4e] mb-1">
                CYBER CRIME POLICE DIVISION · STATE POLICE HEADQUARTERS
              </div>
              <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-[#231207]">
                NOTICE UNDER SECTION 91 OF THE CODE OF CRIMINAL PROCEDURE, 1973
              </h1>
              <div className="text-xs font-sans text-[#6b4e33] mt-2 flex flex-wrap justify-between items-center max-w-lg mx-auto border-t border-[#ebdccb] pt-2">
                <span>Ref: <strong className="font-mono text-[#231207]">{refNo}</strong></span>
                <span>Date of Issue: <strong>{today}</strong></span>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="text-xs sm:text-sm space-y-1 relative z-10 font-sans">
              <div className="font-bold text-[#231207]">TO,</div>
              <div className="font-semibold">The Nodal Officer (Law Enforcement Cell / Fraud Risk),</div>
              <div className="text-[#3d2310] font-bold">{account.bank || "Designated Financial Institution"}</div>
              {account.ifsc && <div className="text-xs text-[#8c6e4e] font-mono">IFSC Code: {account.ifsc}</div>}
            </div>

            {/* Subject Line */}
            <div className="bg-[#faf4ec] border border-[#e8d7c1] p-3 rounded-xl relative z-10 text-xs sm:text-sm font-sans font-bold text-[#231207]">
              SUBJECT: URGENT REQUISITION FOR TRANSACTION LOGS, CERTIFIED STATEMENTS & KYC RECORDS FOR ACCOUNT NO.{" "}
              <span className="font-mono underline text-[#5c3d1e]">{account.account_id}</span>
            </div>

            {/* Statutory Body */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#2c1810] relative z-10">
              <p>
                Whereas an active cyber-fraud investigation has been instituted under the Information Technology Act, 2000
                and the Indian Penal Code, 1860, concerning unauthorised financial debits and structured money laundering.
              </p>

              <p>
                During the forensic money-flow mapping conducted via SANKET (Offline-First Financial Intelligence Platform),
                account number <strong className="font-mono">{account.account_id}</strong> was identified in the transaction graph
                with an aggregate risk rating of <strong className="font-mono">{account.risk_score}/100</strong> ({account.risk_level} Risk).
                Suspicious movement indicators detected include:
              </p>

              <ul className="list-disc list-inside space-y-1 pl-2 text-xs font-sans bg-[#fbf7f0] p-3.5 rounded-xl border border-[#ebdccb]">
                {risk?.signals.map(sig => (
                  <li key={sig.id} className="text-[#3d2310]">
                    <strong>{sig.name}:</strong> {sig.description}
                  </li>
                )) ?? (
                  <>
                    <li>Rapid downstream fund dissipation within minutes of receipt.</li>
                    <li>Structuring / Fan-out transfers to multiple non-KYC verified beneficiary accounts.</li>
                    <li>Anomalous automated device telemetry detected during fund dispatch.</li>
                  </>
                )}
              </ul>

              <p>
                Now therefore, in exercise of the powers conferred upon the undersigned under <strong>Section 91 of the Code of Criminal Procedure, 1973</strong>,
                you are hereby required to furnish the following certified electronic records within <strong>24 hours</strong> of receipt of this notice:
              </p>

              <ol className="list-decimal list-inside space-y-1.5 pl-2 text-xs font-sans">
                <li>Complete account ledger statement from inception to date in digital format along with Certificate under Section 65B(4) of the Indian Evidence Act, 1872.</li>
                <li>Authenticated Customer Identification Dossier (KYC) including Aadhaar number, PAN card, registered mobile number, and correspondence address.</li>
                <li>Comprehensive IP access logs, Device IDs, IMEI numbers, and browser fingerprints captured during all internet banking and mobile UPI transactions.</li>
                <li>Immediate lien / debit freeze on current available ledger balance under Section 102 CrPC.</li>
              </ol>

              <p className="text-[11px] text-[#78350f] font-sans bg-[#fef3c7] border border-[#fde68a] p-3 rounded-xl">
                <strong>Statutory Warning:</strong> Failure to attend to this notice or deliberate omission to produce documents is punishable under Section 175 of the Indian Penal Code.
              </p>
            </div>

            {/* Official Signature Block */}
            <div className="border-t-2 border-[#d9c7af] pt-6 flex flex-wrap justify-between items-end text-xs font-sans relative z-10 gap-4">
              <div>
                <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">System Verification</div>
                <div className="font-mono text-[11px] text-[#16a34a] font-bold">SHA-256 DIGEST: VERIFIED BY SANKET</div>
                <div className="text-[10px] text-[#8c6e4e] mt-0.5">Operation Abhedya-Chakra · VoidHacks 8.0</div>
              </div>

              <div className="text-right space-y-1">
                <div className="w-32 h-10 border-b border-dashed border-[#8c6e4e] ml-auto" />
                <div className="font-bold text-[#231207] uppercase">Investigating Officer</div>
                <div className="text-[11px] text-[#8c6e4e]">Cyber Crime Police Station</div>
                <div className="text-[10px] text-[#8c6e4e]">State Police Headquarters</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
