"use client";
import { useEffect, useState } from "react";
import { Card, EmptyState, RiskBadge, Button } from "@/components/ui";
import { getBenchmarkData } from "@/lib/api";
import type { BenchmarkData } from "@/lib/types";
import { BarChart3, Clock, Database, Cpu, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function BenchmarkView() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBenchmarkData();
      setData(result);
    } catch {
      setError("Benchmark data unavailable. Connect the FastAPI backend to see real metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#c4a882] border-t-[#5c3d1e] rounded-full animate-spin" />
          <span className="text-sm text-[#8c6e4e]">Loading benchmark data...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState
          icon={<BarChart3 size={20} />}
          title="No benchmark data available"
          description={error ?? "Run the data pipeline first."}
          action={<Button onClick={fetchData} size="sm" variant="secondary"><RefreshCw size={13} /> Retry</Button>}
        />
      </div>
    );
  }

  const latencyData = [
    { name: "CSV Read", ms: data.csv_read_ms ?? 0, color: "#c17f3a" },
    { name: "Validation", ms: data.validation_ms ?? 0, color: "#5c3d1e" },
    { name: "Parquet Write", ms: data.parquet_write_ms ?? 0, color: "#d4793a" },
    { name: "DuckDB Start", ms: data.duckdb_startup_ms ?? 0, color: "#7c5a3a" },
    { name: "Account Lookup", ms: data.account_lookup_ms ?? 0, color: "#27ae60" },
    { name: "Graph Gen", ms: data.graph_generation_ms ?? 0, color: "#2980b9" },
    { name: "Risk Calc", ms: data.risk_calculation_ms ?? 0, color: "#8e44ad" },
  ].filter(d => d.ms > 0);

  const paymentData = data.payment_mode_breakdown
    ? Object.entries(data.payment_mode_breakdown).map(([k, v]) => ({ name: k, count: v }))
    : [];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Title ─────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#2c1810]">System Benchmark</h2>
            <p className="text-sm text-[#8c6e4e] mt-1">All values are measured from real pipeline execution — never invented</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchData}>
            <RefreshCw size={13} /> Refresh
          </Button>
        </div>

        {/* ─── Key Metrics ───────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Dataset Size", value: data.dataset_size.toLocaleString("en-IN"), icon: <Database size={14} />, unit: "transactions" },
            { label: "Processed", value: data.transactions_processed.toLocaleString("en-IN"), icon: <Cpu size={14} />, unit: "clean records" },
            { label: "Peak Memory", value: `${data.peak_memory_mb ?? "—"} MB`, icon: <BarChart3 size={14} /> },
            { label: "Account Lookup", value: `${data.account_lookup_ms ?? "—"} ms`, icon: <Clock size={14} />, unit: "latency" },
          ].map(m => (
            <Card key={m.label} className="p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-[#f0e8dc] flex items-center justify-center text-[#5c3d1e] mx-auto mb-2">
                {m.icon}
              </div>
              <div className="text-xl font-bold text-[#2c1810]">{m.value}</div>
              <div className="text-xs text-[#8c6e4e] font-medium mt-0.5">{m.label}</div>
              {m.unit && <div className="text-[10px] text-[#b0977a] mt-0.5">{m.unit}</div>}
            </Card>
          ))}
        </div>

        {/* ─── Latency Chart ─────────────────────────── */}
        {latencyData.length > 0 && (
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-[#2c1810] mb-4">Pipeline Latency (ms)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={latencyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8c6e4e" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8c6e4e" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fdf8f3", border: "1px solid #e8d8c4", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: any) => [`${v} ms`]}
                />
                <Bar dataKey="ms" radius={[4, 4, 0, 0]}>
                  {latencyData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ─── Payment Mode Breakdown ────────────────── */}
        {paymentData.length > 0 && (
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-[#2c1810] mb-4">Payment Mode Distribution</h3>
            <div className="space-y-3">
              {paymentData.map(d => {
                const total = paymentData.reduce((s, x) => s + x.count, 0);
                const pct = ((d.count / total) * 100).toFixed(1);
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#2c1810] w-12">{d.name}</span>
                    <div className="flex-1 h-2 bg-[#f0e8dc] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#5c3d1e] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#8c6e4e] w-20 text-right">
                      {d.count.toLocaleString("en-IN")} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ─── Detail Table ──────────────────────────── */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#2c1810] mb-3">All Metrics</h3>
          <table className="w-full text-sm">
            <tbody>
              {[
                ["Dataset size", `${data.dataset_size.toLocaleString("en-IN")} transactions`],
                ["Clean records processed", `${data.transactions_processed.toLocaleString("en-IN")}`],
                ["CSV read time", data.csv_read_ms ? `${data.csv_read_ms} ms` : "—"],
                ["Validation time", data.validation_ms ? `${data.validation_ms} ms` : "—"],
                ["Parquet write time", data.parquet_write_ms ? `${data.parquet_write_ms} ms` : "—"],
                ["DuckDB startup", data.duckdb_startup_ms ? `${data.duckdb_startup_ms} ms` : "—"],
                ["Account lookup latency", data.account_lookup_ms ? `${data.account_lookup_ms} ms` : "—"],
                ["Time-range query", data.time_range_query_ms ? `${data.time_range_query_ms} ms` : "—"],
                ["Graph generation", data.graph_generation_ms ? `${data.graph_generation_ms} ms` : "—"],
                ["Risk calculation", data.risk_calculation_ms ? `${data.risk_calculation_ms} ms` : "—"],
                ["Peak memory", data.peak_memory_mb ? `${data.peak_memory_mb} MB` : "—"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-[#f0e8dc] last:border-none">
                  <td className="py-2 pr-4 text-[#8c6e4e]">{k}</td>
                  <td className="py-2 font-medium text-[#2c1810]">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
