"use client";
import { useState } from "react";
import { useSanketStore } from "@/lib/store";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Scale, Shield, Landmark, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useSanketStore();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !password.trim()) {
      setError("Please enter your official ID and password.");
      return;
    }
    setLoading(true);
    setError("");

    const success = await login(id.trim(), password);
    if (!success) {
      setError("Invalid credentials. Try demo: 'investigator' / 'sanket123'");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#180e07] flex flex-col lg:flex-row select-none">
      {/* ─── Left Panel: Branding & Mission Statement ─────────────────────── */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#1c0f08] via-[#160c06] to-[#0f0703] border-b lg:border-b-0 lg:border-r border-[#2d180d]">
        {/* Subtle Warm Amber / Gold Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-[#c49756] blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#8c5621] blur-[140px]" />
        </div>

        {/* Brand Top Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c49756] to-[#8c5621] border border-[#d49952]/40 flex items-center justify-center text-white font-black text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="text-[#f7ebd7] font-black text-xl tracking-wider leading-none">SANKET</div>
              <div className="text-[#967756] text-[10px] mt-1 tracking-widest uppercase font-bold">
                Financial Investigation Console
              </div>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2a170d] border border-[#422515] text-[11px] font-semibold text-[#c49756]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c49756] animate-pulse" />
              <span>Operation Abhedya-Chakra · VoidHacks 8.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#fdfaf6] leading-[1.15] tracking-tight">
              Trace money movement.<br />
              <span className="text-[#c49756]">Understand</span> hidden<br />
              relationships.
            </h1>

            <p className="text-[#a88a6d] text-sm leading-relaxed max-w-md font-medium">
              Build defensible evidence. SANKET is an offline-first transaction intelligence platform engineered for police and cybercrime investigators.
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 pt-10 space-y-3.5">
          {[
            { label: "L0 → L3 Relationship Graph Topology", desc: "Multi-hop flow & layering detection" },
            { label: "Deterministic Risk Signal Engine", desc: "Empirical scores without black-box drift" },
            { label: "High-Resolution Chronological Timeline", desc: "Sub-second ledger playback" },
            { label: "Section 65B Indian Evidence Act Compliance", desc: "Court-ready cryptographic dossiers" },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3 text-xs">
              <div className="w-5 h-5 rounded-md bg-[#2a170d] border border-[#422515] flex items-center justify-center text-[#c49756] flex-shrink-0 mt-0.5">
                <CheckCircle2 size={12} />
              </div>
              <div>
                <span className="font-bold text-[#f5ecd9]">{f.label}</span>
                <span className="text-[#8c6e4e] block text-[11px] mt-0.5">{f.desc}</span>
              </div>
            </div>
          ))}

          <div className="pt-6 text-[11px] text-[#6e5038] font-mono border-t border-[#2d180d]">
            AIR-GAPPED READY · IN-MEMORY DUCKDB & POLARS CORE
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Official Login Form ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#f7f2ea] relative">
        <div className="w-full max-w-md">
          {/* Official Form Card */}
          <div className="bg-white rounded-3xl border border-[#e2d5c3] shadow-md p-8 sm:p-10 relative">
            {/* Top Seal Badge */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#f0e8dc]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c6e4e] bg-[#f5ecde] px-2.5 py-0.5 rounded-full border border-[#ebdccb] inline-flex">
                  <Shield size={11} className="text-[#5c3d1e]" />
                  <span>Authorized Personnel Only</span>
                </div>
                <h2 className="text-xl font-black text-[#231207] tracking-tight mt-2">
                  Investigator Sign In
                </h2>
                <p className="text-xs text-[#8c6e4e] mt-0.5">
                  Enter your assigned credentials to access active case dockets
                </p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs flex-shrink-0">
                <Lock size={18} />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* ID field */}
              <div>
                <label className="block text-[11px] font-bold text-[#5c3d1e] uppercase tracking-wider mb-1.5">
                  Official ID / Email
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  placeholder="investigator"
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf8] border border-[#dfd2be] rounded-xl text-xs font-semibold text-[#231207] placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c49756] focus:border-transparent transition-all"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[11px] font-bold text-[#5c3d1e] uppercase tracking-wider mb-1.5">
                  Security Passphrase
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#fdfbf8] border border-[#dfd2be] rounded-xl text-xs font-semibold text-[#231207] placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c49756] focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c6e4e] hover:text-[#231207] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#8c6e4e]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#5c3d1e] rounded"
                  />
                  <span>Remember session token</span>
                </label>
                <span className="text-[11px] text-[#8c6e4e] hover:text-[#5c3d1e] cursor-pointer">
                  Help / Recovery
                </span>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="text-xs text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2.5 font-medium">
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <Button
                type="submit"
                loading={loading}
                className="w-full justify-center text-xs font-bold py-3 mt-2 tracking-wider uppercase gap-2"
              >
                <span>Authenticate & Enter Console</span>
                <ArrowRight size={13} />
              </Button>

            </form>

            {/* Quick Demo Credentials Footer */}
            <div className="mt-6 pt-4 border-t border-[#f0e8dc] text-center text-[11px] text-[#8c6e4e]">
              <span>Quick Demo: ID </span>
              <button
                type="button"
                onClick={() => { setId("investigator"); setPassword("sanket123"); }}
                className="font-mono font-bold text-[#5c3d1e] bg-[#f5ecde] px-1.5 py-0.5 rounded border border-[#ebdccb] hover:border-[#c49756] ml-1 mr-2"
              >
                investigator
              </button>
              <span>Password </span>
              <button
                type="button"
                onClick={() => { setId("investigator"); setPassword("sanket123"); }}
                className="font-mono font-bold text-[#5c3d1e] bg-[#f5ecde] px-1.5 py-0.5 rounded border border-[#ebdccb] hover:border-[#c49756] ml-1"
              >
                sanket123
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
