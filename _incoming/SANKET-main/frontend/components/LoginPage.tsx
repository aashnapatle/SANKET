"use client";
import { useState } from "react";
import { useSanketStore } from "@/lib/store";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Scale } from "lucide-react";

export default function LoginPage() {
  const { login } = useSanketStore();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isJudgeMode, setIsJudgeMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !password.trim()) { setError("Please enter your ID and password."); return; }
    setLoading(true);
    setError("");

    const success = await login(id.trim(), password);
    if (!success) {
      setError("Invalid credentials. Try: ID 'shreya@sanket', Password 'sanket123'");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2c1810] flex">
      {/* ─── Left panel ───────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#c17f3a] blur-3xl" style={{ transform: "translate(-30%, -30%)" }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#5c3d1e] blur-3xl" style={{ transform: "translate(20%, 20%)" }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#c17f3a] flex items-center justify-center text-white font-bold text-lg">S</div>
            <div>
              <div className="text-[#f0e0c8] font-bold text-xl tracking-wide">SANKET</div>
              <div className="text-[#8c6e4e] text-xs">Financial Investigation Console</div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#f0e0c8] leading-snug">
              Trace money movement.<br />
              <span className="text-[#c17f3a]">Understand</span> hidden<br />
              relationships.
            </h1>
            <p className="text-[#8c6e4e] text-sm leading-relaxed max-w-sm">
              Build defensible evidence. SANKET is the offline-first financial transaction investigation and money-flow intelligence platform.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: "⬡", label: "L0 → L3 Relationship Graph" },
            { icon: "🛡", label: "Risk Signal Analysis" },
            { icon: "⏱", label: "Chronological Timeline" },
            { icon: "⚖", label: "Court-ready Evidence Package" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 text-sm text-[#8c6e4e]">
              <span className="text-[#c17f3a]">{f.icon}</span>
              {f.label}
            </div>
          ))}
          <div className="pt-4 text-xs text-[#5c3d2a]">
            Operation Abhedya-Chakra · VoidHacks 8.0
          </div>
        </div>
      </div>

      {/* ─── Right panel — Login form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f0eb]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#5c3d1e] flex items-center justify-center text-white font-bold">S</div>
            <div>
              <div className="text-[#2c1810] font-bold text-lg">SANKET</div>
              <div className="text-[#8c6e4e] text-xs">Financial Investigation Console</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8d8c4] shadow-lg p-8 fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#2c1810]">Investigator Login</h2>
              <p className="text-sm text-[#8c6e4e] mt-1">Sign in with your official credentials</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* ID field */}
              <div>
                <label className="block text-xs font-semibold text-[#5c3d1e] uppercase tracking-wide mb-1.5">
                  Official ID / Email
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  placeholder="shreya@sanket"
                  className="w-full px-3 py-2.5 border border-[#e8d8c4] rounded-lg text-sm text-[#2c1810] placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c4a882] focus:border-transparent bg-white transition-all"
                />
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-[#5c3d1e] uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 border border-[#e8d8c4] rounded-lg text-sm text-[#2c1810] placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c4a882] focus:border-transparent bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c6e4e] hover:text-[#2c1810] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#5c3d1e] rounded"
                  />
                  <span className="text-xs text-[#8c6e4e]">Remember me</span>
                </label>
                <button type="button" className="text-xs text-[#5c3d1e] hover:underline">Forgot password</button>
              </div>

              {/* Error */}
              {error && (
                <div className="text-xs text-[#c0392b] bg-[#fdf0ef] border border-[#f1b4b0] rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Sign in */}
              <Button
                type="submit"
                loading={loading}
                className="w-full justify-center text-sm font-semibold py-3"
              >
                SIGN IN
              </Button>

              {/* Judge Mode */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e8d8c4]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-[#8c6e4e]">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  useSanketStore.getState().toggleJudgeMode();
                  login("judge", "judge2024");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#e8d8c4] rounded-lg text-sm font-medium text-[#5c3d1e] hover:bg-[#f5f0eb] transition-colors"
              >
                <Scale size={14} />
                ENTER JUDGE MODE
              </button>
            </form>
          </div>

          {/* Demo hint */}
          <div className="mt-4 text-center text-xs text-[#8c6e4e]">
            Demo: ID <span className="font-mono bg-[#f5f0eb] px-1 rounded">investigator</span> / Password <span className="font-mono bg-[#f5f0eb] px-1 rounded">sanket123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
