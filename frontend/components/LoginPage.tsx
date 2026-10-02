"use client";
import { useState, useEffect } from "react";
import { useSanketStore } from "@/lib/store";
import { Button } from "@/components/ui";
import { Eye, EyeOff, UserPlus, LogIn, KeyRound, Shield, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

const MASTER_STATION_KEY = "SANKET-2026";

const DEFAULT_OFFICERS: Record<string, { pass: string; name: string; badge: string }> = {
  "investigator": { pass: "sanket123", name: "Lead Investigator", badge: "MH-CYBER-09" },
  "gunjanbhangre27@gmail.com": { pass: "sanket123", name: "Gunjan Bhangre", badge: "MP-CYBER-01" },
  "officer@sanket.gov.in": { pass: "admin123", name: "Senior Forensic Analyst", badge: "GOI-CYBER-88" }
};

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [station, setStation] = useState("");
  const [stationKey, setStationKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const completeLogin = (officerName: string, badge: string, role: string, cleanId: string) => {
    localStorage.setItem("sanket_token", "OFFLINE_AUTHORIZED_" + Date.now());
    localStorage.setItem("officer_name", officerName);
    localStorage.setItem("officer_badge", badge);
    localStorage.setItem("officer_id", cleanId);

    useSanketStore.setState({
      isAuthenticated: true,
      officer: { id: cleanId, name: officerName, role: role, badge: badge }
    } as any);

    window.location.href = "/";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanId = id.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setError("Official ID and Password are required.");
      return;
    }

    const localUsers = JSON.parse(localStorage.getItem("sanket_registered_officers") || "{}");

    if (isRegister) {
      if (!name.trim()) {
        setError("Full name is required for registration.");
        return;
      }
      if (!stationKey.trim()) {
        setError("Station Security Key is required for clearance.");
        return;
      }
      if (stationKey.trim() !== MASTER_STATION_KEY) {
        setError("Invalid Station Security Key. Unauthorized registration rejected.");
        return;
      }
      if (DEFAULT_OFFICERS[cleanId] || localUsers[cleanId]) {
        setError("This Officer ID is already registered.");
        return;
      }

      localUsers[cleanId] = {
        name: name.trim(),
        station: station.trim() || "Cyber Crime Cell",
        badge: "OFFICER-" + Math.floor(1000 + Math.random() * 9000),
        pass: cleanPass
      };
      localStorage.setItem("sanket_registered_officers", JSON.stringify(localUsers));

      setSuccess("Officer verified and registered! Please Sign In.");
      setIsRegister(false);
      setPassword("");
      setStationKey("");
      return;
    }

    const officer = DEFAULT_OFFICERS[cleanId] || localUsers[cleanId];
    if (!officer) {
      setError("Officer ID does not exist. Please check your ID or register first.");
      return;
    }
    if (officer.pass !== cleanPass) {
      setError("Incorrect Password / Station Key.");
      return;
    }

    setLoading(true);
    completeLogin(officer.name, officer.badge, "investigator", cleanId);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#180e07] flex flex-col lg:flex-row select-none">
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative overflow-hidden bg-gradient-to-br from-[#1c0f08] via-[#160c06] to-[#0f0703] border-b lg:border-b-0 lg:border-r border-[#2d180d]">
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
          </div>
        </div>

        <div className="relative z-10 pt-10 space-y-3.5">
          {[
            { label: "L0 → L3 Relationship Graph Topology", desc: "Multi-hop flow & layering detection" },
            { label: "Deterministic Risk Signal Engine", desc: "Empirical scores without black-box drift" },
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
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#f7f2ea] relative">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-[#e2d5c3] shadow-md p-8 sm:p-10 relative">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#f0e8dc]">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8c6e4e] bg-[#f5ecde] px-2.5 py-0.5 rounded-full border border-[#ebdccb] inline-flex">
                  <Shield size={11} className="text-[#5c3d1e]" />
                  <span>Authorized Personnel Only</span>
                </div>
                <h2 className="text-xl font-black text-[#231207] tracking-tight mt-2">
                  {isRegister ? "Register Officer" : "Investigator Sign In"}
                </h2>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs flex-shrink-0">
                <Lock size={18} />
              </div>
            </div>

            {error && (
              <div className="mb-4 text-xs text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2.5 font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-xs text-green-800 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5c3d1e] uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Officer Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#fdfbf8] border border-[#dfd2be] rounded-xl text-xs font-semibold text-[#231207]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#c49756] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <KeyRound size={12} /> Station Security Key
                    </label>
                    <input
                      type="password"
                      value={stationKey}
                      onChange={e => setStationKey(e.target.value)}
                      placeholder="Enter SANKET-2026"
                      className="w-full px-3.5 py-2.5 bg-[#fffaf5] border border-[#c49756] rounded-xl text-xs font-semibold text-[#231207]"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#5c3d1e] uppercase tracking-wider mb-1.5">Official ID / Email</label>
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  placeholder="e.g. investigator"
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf8] border border-[#dfd2be] rounded-xl text-xs font-semibold text-[#231207]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5c3d1e] uppercase tracking-wider mb-1.5">Security Passphrase</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#fdfbf8] border border-[#dfd2be] rounded-xl text-xs font-semibold text-[#231207]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c6e4e] hover:text-[#231207]">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full justify-center text-xs font-bold py-3 mt-2 tracking-wider uppercase gap-2">
                <span>{isRegister ? "Verify & Register Officer" : "Authenticate & Enter Console"}</span>
                <ArrowRight size={13} />
              </Button>

              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
                className="w-full text-center text-xs text-[#c49756] font-semibold hover:underline mt-2 flex items-center justify-center gap-1">
                {isRegister ? <><LogIn size={13} /> Already registered? Sign in</> : <><UserPlus size={13} /> New officer? Register here</>}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#f0e8dc] text-center text-[11px] text-[#8c6e4e]">
              <span>Quick Demo: ID </span>
              <button
                type="button"
                onClick={() => { setId("investigator"); setPassword("sanket123"); }}
                className="font-mono font-bold text-[#5c3d1e] bg-[#f5ecde] px-1.5 py-0.5 rounded border border-[#ebdccb] ml-1 mr-2">
                investigator
              </button>
              <span>Password </span>
              <button
                type="button"
                onClick={() => { setId("investigator"); setPassword("sanket123"); }}
                className="font-mono font-bold text-[#5c3d1e] bg-[#f5ecde] px-1.5 py-0.5 rounded border border-[#ebdccb] ml-1">
                sanket123
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
