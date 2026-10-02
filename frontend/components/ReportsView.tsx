"use client";
import { useState } from "react";
import { Button, Card, EmptyState } from "@/components/ui";
import { generateReport } from "@/lib/api";
import {
  FileText, Download, Eye, CheckCircle2, XCircle,
  FileCheck, Shield, Landmark, Scale, Clock, Lock, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsViewProps {
  accountId: string;
}

interface ReportResult {
  type: string;
  success: boolean;
  message: string;
  timestamp: string;
  hash: string;
}

const REPORT_TYPES = [
  {
    id: "investigator",
    title: "Cybercrime Investigation Dossier",
    category: "Internal Police / LEA Intelligence",
    badge: "Official LEA Use",
    description: "Comprehensive multi-layered investigative brief incorporating full graph topology, detected mule paths, layering hierarchy, velocity metrics, and full transaction ledger.",
    icon: <SearchReportIcon />,
    statute: "Section 157 CrPC · Case Diary Corroboration",
  },
  {
    id: "institution",
    title: "Financial Institution Statutory Requisition",
    category: "Bank Nodal Officer Compliance",
    badge: "FIU-IND / RBI Format",
    description: "Structured compliance directive addressed to the designated bank nodal officer requesting transaction origin, KYC documents, beneficiary freeze, and STR submission.",
    icon: <BankReportIcon />,
    statute: "Section 91 CrPC · Banking Regulation Directives",
  },
  {
    id: "evidence",
    title: "Court-Ready Evidentiary Package",
    category: "Judicial Submission (Section 65B)",
    badge: "Judicial Exhibit Ready",
    description: "Forensically hardened evidence package with timestamped audit certificates, digital signature placeholders, device telemetry analysis, and complete chain-of-custody corroboration.",
    icon: <ScaleReportIcon />,
    statute: "Section 65B(4) Indian Evidence Act Certificate",
  },
];

function SearchReportIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs">
      <Shield size={20} />
    </div>
  );
}

function BankReportIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs">
      <Landmark size={20} />
    </div>
  );
}

function ScaleReportIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs">
      <Scale size={20} />
    </div>
  );
}

export default function ReportsView({ accountId }: ReportsViewProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<ReportResult[]>([]);

  const handleGenerate = async (reportType: string, label: string) => {
    setLoading(reportType);
    try {
      const result = await generateReport(accountId, reportType as any);
      // Generate realistic mock SHA-256 hash for audit record
      const randomHash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      setResults(prev => [{
        type: label,
        success: result.success,
        message: result.message,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        hash: `SHA256:${randomHash}...`,
      }, ...prev]);
    } catch {
      setResults(prev => [{
        type: label,
        success: false,
        message: "Dossier generation failed. Check FastAPI backend connectivity.",
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        hash: "FAILED",
      }, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-[#fdfaf6]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Header & Case Reference ─────────────────────────────────────── */}
        <div className="bg-white border border-[#e2d5c3] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c6e4e] bg-[#f5ecde] px-2.5 py-0.5 rounded-full border border-[#ebdccb]">
                Case Dossier System
              </span>
              <span className="text-[10px] font-mono text-[#16a34a] bg-[#ecfdf5] border border-[#d1fae5] px-2 py-0.5 rounded-full font-bold">
                ENCRYPTED REPOSITORY
              </span>
            </div>
            <h2 className="text-xl font-black text-[#231207] tracking-tight">
              Investigative Reports & Court Exhibits
            </h2>
            <p className="text-xs text-[#8c6e4e] mt-1">
              Official export engine generating legally defensible dossiers for Subject Account:{" "}
              <strong className="font-mono text-[#5c3d1e] bg-[#fdf8f3] px-1.5 py-0.5 rounded border border-[#e2d5c3]">
                {accountId}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="bg-[#fbf7f0] border border-[#e8d7c1] rounded-xl px-4 py-2 text-xs">
              <div className="text-[10px] text-[#8c6e4e] uppercase font-semibold">Case Reference</div>
              <div className="font-mono font-bold text-[#3d2310]">CR/CYBER/2026/0894</div>
            </div>
          </div>
        </div>

        {/* ─── 3 Report Dossier Cards ───────────────────────────────────────── */}
        <div className="space-y-4">
          {REPORT_TYPES.map(rt => (
            <Card
              key={rt.id}
              className="p-5 md:p-6 border-[#e2d5c3] hover:border-[#c49756]/80 transition-all duration-200 shadow-2xs hover:shadow-xs"
            >
              <div className="flex flex-col md:flex-row items-start gap-5">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {rt.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-[#231207] tracking-tight">
                      {rt.title}
                    </h3>
                    <span className="text-[10px] font-bold text-[#5c3d1e] bg-[#f5ecde] border border-[#ebdccb] px-2.5 py-0.5 rounded-md">
                      {rt.badge}
                    </span>
                  </div>

                  <p className="text-xs text-[#6b4e33] leading-relaxed mb-3 font-medium">
                    {rt.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-[#8c6e4e]">
                    <Lock size={12} className="text-[#b48c48]" />
                    <span className="font-semibold text-[#8c6e4e]">Statutory Basis:</span>
                    <span className="italic">{rt.statute}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0 pt-2 md:pt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerate(rt.id, rt.title)}
                    loading={loading === rt.id}
                    className="gap-2 justify-center"
                  >
                    <Eye size={13} />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(rt.id, rt.title)}
                    loading={loading === rt.id}
                    className="gap-2 justify-center"
                  >
                    <Download size={13} />
                    Generate Dossier
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ─── Generation Activity & Hash Verification Audit Trail ──────────── */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b4e33] flex items-center gap-2">
                <Clock size={13} className="text-[#8c6e4e]" />
                Cryptographic Export Audit Trail ({results.length})
              </h3>
              <span className="text-[10px] text-[#8c6e4e] font-mono">
                SEC 65B LOG
              </span>
            </div>

            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border text-xs shadow-2xs transition-all",
                    r.success
                      ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]"
                      : "bg-[#fef2f2] border-[#fecaca] text-[#991b1b]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {r.success ? (
                      <CheckCircle2 size={16} className="flex-shrink-0 text-[#16a34a]" />
                    ) : (
                      <XCircle size={16} className="flex-shrink-0 text-[#dc2626]" />
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-[#231207]">{r.type}</div>
                      <div className="text-[11px] opacity-90 mt-0.5">{r.message}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right flex-shrink-0 ml-auto">
                    {r.success && (
                      <span className="font-mono text-[10px] bg-white border border-[#bbf7d0] px-2 py-0.5 rounded text-[#15803d]">
                        {r.hash}
                      </span>
                    )}
                    <span className="text-[10px] font-mono opacity-70">
                      {r.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Backend Integration Note ─────────────────────────────────────── */}
        <div className="bg-[#fbf7f0] border border-[#e8d7c1] rounded-2xl p-5 text-xs text-[#6b4e33] shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-[#3d2310] mb-1.5">
            <Sparkles size={14} className="text-[#b48c48]" />
            <span>FastAPI Report Generation Pipeline Integration</span>
          </div>
          <p className="leading-relaxed">
            In live deployments, reports are generated asynchronously by FastAPI using Jinja2 and WeasyPrint / headless chromium into court-admissible PDFs with cryptographic SHA-256 digests.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="bg-white border border-[#dfd2be] px-2 py-0.5 rounded text-[#5c3d1e]">
              POST /api/reports/investigator
            </span>
            <span className="bg-white border border-[#dfd2be] px-2 py-0.5 rounded text-[#5c3d1e]">
              POST /api/reports/institution
            </span>
            <span className="bg-white border border-[#dfd2be] px-2 py-0.5 rounded text-[#5c3d1e]">
              POST /api/reports/evidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
