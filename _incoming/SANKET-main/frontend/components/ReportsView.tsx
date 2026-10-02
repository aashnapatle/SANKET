"use client";
import { useState } from "react";
import { Button, Card, EmptyState } from "@/components/ui";
import { generateReport } from "@/lib/api";
import { FileText, Download, Eye, Printer, CheckCircle, XCircle } from "lucide-react";

interface ReportsViewProps {
  accountId: string;
}

interface ReportResult {
  type: string;
  success: boolean;
  message: string;
  timestamp: string;
}

const REPORT_TYPES = [
  {
    id: "investigator",
    title: "Investigator Report",
    description: "Comprehensive investigation report with full graph analysis, risk signals, evidence chain, and transaction log. For internal cybercrime unit use.",
    icon: "🔍",
  },
  {
    id: "institution",
    title: "Financial Institution Report",
    description: "Summary report formatted for financial institution compliance teams. Includes account details, risk assessment, and recommended actions.",
    icon: "🏛",
  },
  {
    id: "evidence",
    title: "Evidence Package",
    description: "Court-ready evidence package with transaction records, device analysis, IP data, and risk justification narrative.",
    icon: "⚖",
  },
];

export default function ReportsView({ accountId }: ReportsViewProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<ReportResult[]>([]);

  const handleGenerate = async (reportType: string, label: string) => {
    setLoading(reportType);
    try {
      const result = await generateReport(accountId, reportType as any);
      setResults(prev => [{
        type: label,
        success: result.success,
        message: result.message,
        timestamp: new Date().toLocaleTimeString("en-IN"),
      }, ...prev]);
    } catch {
      setResults(prev => [{
        type: label,
        success: false,
        message: "Report generation failed. Check backend connection.",
        timestamp: new Date().toLocaleTimeString("en-IN"),
      }, ...prev]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ─── Title ─────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-bold text-[#2c1810]">Investigation Reports</h2>
          <p className="text-sm text-[#8c6e4e] mt-1">Account: <span className="font-mono font-semibold text-[#5c3d1e]">{accountId}</span></p>
        </div>

        {/* ─── Report Cards ──────────────────────────── */}
        <div className="space-y-4">
          {REPORT_TYPES.map(rt => (
            <Card key={rt.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#f0e8dc] flex items-center justify-center text-xl flex-shrink-0">
                  {rt.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2c1810] mb-1">{rt.title}</h3>
                  <p className="text-sm text-[#8c6e4e] leading-relaxed">{rt.description}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerate(rt.id, rt.title)}
                    loading={loading === rt.id}
                    className="gap-1.5"
                  >
                    <Eye size={12} />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(rt.id, rt.title)}
                    loading={loading === rt.id}
                    className="gap-1.5"
                  >
                    <Download size={12} />
                    Generate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ─── Generation Results ────────────────────── */}
        {results.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#2c1810] mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                    r.success
                      ? "bg-[#f0fdf4] border-[#a8e6c0] text-[#2c5f3a]"
                      : "bg-[#fdf0ef] border-[#f1b4b0] text-[#8c1c13]"
                  }`}
                >
                  {r.success ? <CheckCircle size={15} className="flex-shrink-0 mt-0.5 text-[#27ae60]" /> : <XCircle size={15} className="flex-shrink-0 mt-0.5 text-[#c0392b]" />}
                  <div>
                    <div className="font-medium">{r.type}</div>
                    <div className="text-xs opacity-80 mt-0.5">{r.message}</div>
                  </div>
                  <span className="ml-auto text-xs opacity-60 flex-shrink-0">{r.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Backend Integration Note ─────────────── */}
        <div className="bg-[#f5f0eb] border border-[#e8d8c4] rounded-xl p-4 text-sm text-[#8c6e4e]">
          <div className="font-semibold text-[#5c3d1e] mb-1">FastAPI Integration Note</div>
          <p>Reports are generated by the backend. Connect FastAPI at <code className="bg-white px-1 py-0.5 rounded text-xs font-mono">NEXT_PUBLIC_API_URL</code> for real report generation.</p>
          <p className="mt-1 text-xs">Required endpoints: <code className="font-mono">POST /api/reports/investigator</code>, <code className="font-mono">POST /api/reports/institution</code>, <code className="font-mono">POST /api/reports/evidence</code></p>
        </div>
      </div>
    </div>
  );
}
