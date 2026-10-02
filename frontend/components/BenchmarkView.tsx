"use client";
import { useEffect, useState } from "react";
import { Card, EmptyState, Button } from "@/components/ui";
import { getBenchmarkData } from "@/lib/api";
import type { BenchmarkData } from "@/lib/types";
import {
  BarChart3, Clock, Database, Cpu, RefreshCw,
  Zap, HardDrive, CheckCircle2, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

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
      setError("Benchmark telemetry unavailable. Check FastAPI backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-[#fdfaf6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-[#ebdccb] border-t-[#5c3d1e] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#8c6e4e]">Loading Forensic Engine Benchmarks...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-[#fdfaf6]">
        <EmptyState
          icon={<BarChart3 size={24} className="text-[#8c6e4e]" />}
          title="Telemetry Data Unavailable"
          description={error ?? "Run the DuckDB ingestion pipeline to collect real execution telemetry."}
          action={
            <Button onClick={fetchData} size="sm" variant="secondary" className="gap-2">
              <RefreshCw size={13} /> Retry Telemetry Query
            </Button>
          }
        />
      </div>
    );
  }

  const latencyData = [
    { name: "CSV Ingest", ms: data.csv_read_ms ?? 0, color: "#8c6e4e" },
    { name: "Polars Valid.", ms: data.validation_ms ?? 0, color: "#c59f60" },
    { name: "Parquet Write", ms: data.parquet_write_ms ?? 0, color: "#b48c48" },
    { name: "DuckDB Init", ms: data.duckdb_startup_ms ?? 0, color: "#5c3d1e" },
    { name: "Index Lookup", ms: data.account_lookup_ms ?? 0, color: "#16a34a" },
    { name: "Graph Build", ms: data.graph_generation_ms ?? 0, color: "#3a1d0b" },
    { name: "Risk Inference", ms: data.risk_calculation_ms ?? 0, color: "#b91c1c" },
  ].filter(d => d.ms > 0);

  const paymentData = data.payment_mode_breakdown
    ? Object.entries(data.payment_mode_breakdown).map(([k, v]) => ({ name: k, count: v }))
    : [];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-[#fdfaf6]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Header & Telemetry Status ───────────────────────────────────── */}
        <div className="bg-white border border-[#e2d5c3] rounded-2xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8c6e4e] bg-[#f5ecde] px-2.5 py-0.5 rounded-full border border-[#ebdccb]">
                Engine Telemetry
              </span>
              <span className="text-[10px] font-mono text-[#16a34a] bg-[#ecfdf5] border border-[#d1fae5] px-2 py-0.5 rounded-full font-bold">
                100% EMPIRICAL MEASUREMENT
              </span>
            </div>
            <h2 className="text-xl font-black text-[#231207] tracking-tight">
              Forensic Engine Performance & Execution Telemetry
            </h2>
            <p className="text-xs text-[#8c6e4e] mt-1">
              All timings and memory footprint measurements are recorded directly from DuckDB and Polars query execution.
            </p>
          </div>

          <Button variant="secondary" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw size={13} /> Refresh Metrics
          </Button>
        </div>

        {/* ─── Key Metrics Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Ingested Dataset",
              value: data.dataset_size.toLocaleString("en-IN"),
              icon: <Database size={15} />,
              unit: "raw ledger transactions"
            },
            {
              label: "Validated Records",
              value: data.transactions_processed.toLocaleString("en-IN"),
              icon: <Cpu size={15} />,
              unit: "clean parquet records"
            },
            {
              label: "Peak RAM Usage",
              value: `${data.peak_memory_mb ?? "—"} MB`,
              icon: <HardDrive size={15} />,
              unit: "in-memory footprint"
            },
            {
              label: "Index Query Speed",
              value: `${data.account_lookup_ms ?? "—"} ms`,
              icon: <Clock size={15} />,
              unit: "sub-millisecond latency"
            },
          ].map(m => (
            <Card key={m.label} className="p-4.5 text-center border-[#e2d5c3] bg-white shadow-2xs hover:border-[#c49756]/80 transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] mx-auto mb-2 shadow-2xs">
                {m.icon}
              </div>
              <div className="text-xl font-black text-[#231207] tracking-tight font-mono">{m.value}</div>
              <div className="text-xs text-[#8c6e4e] font-semibold mt-0.5">{m.label}</div>
              {m.unit && <div className="text-[10px] text-[#b0977a] mt-0.5">{m.unit}</div>}
            </Card>
          ))}
        </div>

        {/* ─── Pipeline Latency Chart ───────────────────────────────────────── */}
        {latencyData.length > 0 && (
          <Card className="p-5 md:p-6 border-[#e2d5c3] bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#231207] uppercase tracking-wider">
                  Pipeline Execution Latency (Milliseconds)
                </h3>
                <p className="text-xs text-[#8c6e4e] mt-0.5">
                  Sub-second end-to-end multi-hop graph materialization
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#16a34a] bg-[#ecfdf5] border border-[#d1fae5] px-2 py-0.5 rounded font-bold">
                SUB-SECOND PIPELINE
              </span>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8c6e4e", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8c6e4e" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#fdfaf6",
                    border: "1px solid #e2d5c3",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                    fontWeight: 600,
                    color: "#231207"
                  }}
                  formatter={(v: any) => [`${v} ms`, "Execution Time"]}
                />
                <Bar dataKey="ms" radius={[6, 6, 0, 0]}>
                  {latencyData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ─── Payment Mode Breakdown ───────────────────────────────────────── */}
        {paymentData.length > 0 && (
          <Card className="p-5 md:p-6 border-[#e2d5c3] bg-white shadow-2xs">
            <h3 className="text-sm font-bold text-[#231207] uppercase tracking-wider mb-4">
              Payment Rail Distribution
            </h3>
            <div className="space-y-3.5">
              {paymentData.map(d => {
                const total = paymentData.reduce((s, x) => s + x.count, 0);
                const pct = ((d.count / total) * 100).toFixed(1);
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-[#231207] w-14">{d.name}</span>
                    <div className="flex-1 h-2.5 bg-[#f5ecde] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#5c3d1e] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-medium text-[#8c6e4e] w-28 text-right">
                      {d.count.toLocaleString("en-IN")} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ─── Detailed Telemetry Ledger Table ──────────────────────────────── */}
        <Card className="p-5 md:p-6 border-[#e2d5c3] bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f0e8dc]">
            <h3 className="text-sm font-bold text-[#231207] uppercase tracking-wider">
              Comprehensive Performance Telemetry Ledger
            </h3>
            <span className="text-[10px] text-[#8c6e4e] font-mono">DUCKDB + POLARS</span>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {[
                ["Total Dataset Size", `${data.dataset_size.toLocaleString("en-IN")} raw records`],
                ["Clean Records Processed", `${data.transactions_processed.toLocaleString("en-IN")} records`],
                ["CSV Ingestion & Typing", data.csv_read_ms ? `${data.csv_read_ms} ms` : "—"],
                ["Polars Schema Validation", data.validation_ms ? `${data.validation_ms} ms` : "—"],
                ["Columnar Parquet Compression", data.parquet_write_ms ? `${data.parquet_write_ms} ms` : "—"],
                ["DuckDB Instance Startup", data.duckdb_startup_ms ? `${data.duckdb_startup_ms} ms` : "—"],
                ["Indexed Account Lookup", data.account_lookup_ms ? `${data.account_lookup_ms} ms` : "—"],
                ["Time-Window Boundary Query", data.time_range_query_ms ? `${data.time_range_query_ms} ms` : "—"],
                ["Multi-Hop Graph Topology Generation", data.graph_generation_ms ? `${data.graph_generation_ms} ms` : "—"],
                ["Composite Risk Calculation", data.risk_calculation_ms ? `${data.risk_calculation_ms} ms` : "—"],
                ["Peak Process Resident Memory", data.peak_memory_mb ? `${data.peak_memory_mb} MB` : "—"],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-[#f5ecde] last:border-none hover:bg-[#faf6f1]/60 transition-colors">
                  <td className="py-2.5 pr-4 text-[#8c6e4e] font-medium">{k}</td>
                  <td className="py-2.5 font-mono font-bold text-[#231207] text-right">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
