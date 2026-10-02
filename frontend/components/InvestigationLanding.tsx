"use client";
import { useState, useRef, useCallback } from "react";
import { useSanketStore } from "@/lib/store";
import { investigateAccount } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Search, ArrowRight, GitBranch, Clock, ShieldCheck,
  Landmark, UserCheck, Zap, CreditCard, Phone, Network,
  Shield, CheckCircle2
} from "lucide-react";

const INVESTIGATION_STAGES = [
  "Finding account...",
  "Loading transactions...",
  "Building relationship graph...",
  "Analysing movement patterns...",
  "Calculating risk signals...",
  "Preparing evidence...",
  "Finalising investigation...",
];

// ─── Ambient Decorative Network Nodes ─────────────────────────────────────────
interface AmbientDot {
  id: string;
  x: number;
  y: number;
  r: number;
}

const AMBIENT_DOTS: AmbientDot[] = [
  { id: "d1",  x: 125, y: 135, r: 4 },
  { id: "d2",  x: 230, y: 170, r: 3.2 },
  { id: "d3",  x: 340, y: 150, r: 4 },
  { id: "d4",  x: 480, y: 165, r: 4.5 },
  { id: "d5",  x: 620, y: 135, r: 4 },
  { id: "d6",  x: 740, y: 195, r: 4.2 },
  { id: "d7",  x: 885, y: 185, r: 3.8 },
  { id: "d8",  x: 170, y: 280, r: 3.6 },
  { id: "d9",  x: 260, y: 350, r: 3.2 },
  { id: "d10", x: 860, y: 110, r: 3.8 },
  { id: "d11", x: 925, y: 240, r: 4 },
  { id: "d12", x: 835, y: 360, r: 3.6 },
  { id: "d13", x: 380, y: 95,  r: 3.2 },
  { id: "d14", x: 670, y: 85,  r: 3.4 },
];

export default function InvestigationLanding() {
  const {
    searchQuery, setSearchQuery, recentSearches, addRecentSearch,
    setInvestigation, setInvestigating, setInvestigationError, setInvestigationStage,
    isInvestigating, setActiveTab, setActiveNav, investigation
  } = useSanketStore();

  const [inputVal, setInputVal] = useState(searchQuery || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [sheenKey, setSheenKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTyping = inputVal.trim().length > 0;
  const hasActiveCase = Boolean(investigation);

  const handleFocus = () => {
    setIsFocused(true);
    setSheenKey((k) => k + 1);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Subtle Mouse Tracking for Ambient Background Nodes (Zero Popups/Tooltips)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    // Map to SVG coordinates (1000 x 600)
    setMousePos({ x: relX * 1000, y: relY * 600 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  const executeInvestigation = async (accountId: string) => {
    const target = accountId.trim();
    if (!target || isInvestigating) return;

    setInvestigating(true);
    setInvestigationError(null);
    setSearchQuery(target);
    addRecentSearch(target);

    // Progressive stage animations
    let stageIndex = 0;
    setInvestigationStage(INVESTIGATION_STAGES[0]);
    const stageInterval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, INVESTIGATION_STAGES.length - 1);
      setInvestigationStage(INVESTIGATION_STAGES[stageIndex]);
    }, 320);

    try {
      const data = await investigateAccount(target);
      clearInterval(stageInterval);
      setInvestigation(data);
      setActiveNav("graph");
      setActiveTab("graph");
    } catch (err: any) {
      clearInterval(stageInterval);
      if (err.message === "ACCOUNT_NOT_FOUND") {
        setInvestigationError("Account not found. Please verify the account number and try again.");
      } else {
        setInvestigationError("Investigation failed. Please check backend connectivity.");
      }
    } finally {
      setInvestigating(false);
      setInvestigationStage("");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = inputVal.trim();
    if (!target || isInvestigating) return;
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 300);
    executeInvestigation(target);
  };

  const handleChipClick = (acc: string) => {
    setInputVal(acc);
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 300);
    executeInvestigation(acc);
  };

  const handleCardClick = (tab: "graph" | "timeline" | "evidence") => {
    if (investigation) {
      setActiveNav(tab);
      setActiveTab(tab);
    } else {
      // Query real ground-truth account SBIN10012624
      setInputVal("SBIN10012624");
      executeInvestigation("SBIN10012624");
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full min-h-full flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#fdfaf5] via-[#f8f3ea] to-[#eee4d6] text-[#2c1810] px-4 py-6 md:px-8 select-none"
    >
      {/* ─── 1. SUBTLE PREMIUM GOLDEN BACKGROUND & NETWORK GRAPHICS ───────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Warm-Gold Central Radial Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] pointer-events-none rounded-full blur-3xl opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(245, 218, 168, 0.45) 0%, rgba(235, 205, 150, 0.22) 40%, transparent 75%)",
          }}
        />

        {/* ─── Classical Indian Judicial Courthouse Colonnade Watermark ──── */}
        <svg
          className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 w-[720px] sm:w-[860px] h-[480px] sm:h-[540px] pointer-events-none opacity-[0.11] text-[#784419]"
          viewBox="0 0 700 450"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Triangular Pediment */}
          <polygon points="350,60 160,140 540,140" fill="currentColor" />
          <polygon points="350,75 185,135 515,135" fill="none" stroke="currentColor" strokeWidth="2.5" />
          {/* Central Pediment Ashoka / Justice Emblem */}
          <circle cx="350" cy="112" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="350" cy="112" r="6" fill="currentColor" />
          {/* Entablature frieze */}
          <rect x="150" y="140" width="400" height="18" rx="2" fill="currentColor" />
          <rect x="140" y="158" width="420" height="10" rx="1.5" fill="currentColor" />
          {/* Neoclassic Courthouse Columns (8 Fluted Columns) */}
          {[175, 222, 270, 317, 365, 412, 460, 507].map((colX) => (
            <g key={colX}>
              {/* Capital */}
              <rect x={colX - 8} y="168" width="28" height="8" rx="1.5" fill="currentColor" />
              {/* Shaft */}
              <rect x={colX - 4} y="176" width="20" height="155" fill="currentColor" />
              {/* Flute highlights */}
              <line x1={colX} y1="180" x2={colX} y2="326" stroke="#fdfaf5" strokeWidth="1.2" opacity="0.4" />
              <line x1={colX + 6} y1="180" x2={colX + 6} y2="326" stroke="#fdfaf5" strokeWidth="1.2" opacity="0.4" />
              <line x1={colX + 12} y1="180" x2={colX + 12} y2="326" stroke="#fdfaf5" strokeWidth="1.2" opacity="0.4" />
              {/* Plinth */}
              <rect x={colX - 8} y="331" width="28" height="10" rx="1.5" fill="currentColor" />
            </g>
          ))}
          {/* Stepped Stylobate Foundation */}
          <rect x="130" y="341" width="440" height="14" rx="2" fill="currentColor" />
          <rect x="110" y="355" width="480" height="16" rx="2.5" fill="currentColor" />
          <rect x="90" y="371" width="520" height="18" rx="3" fill="currentColor" />
        </svg>

        {/* ─── Delicate Golden Silk / Financial Flow Contours ───────────── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d49952" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#e5be85" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c17f3a" stopOpacity="0.10" />
            </linearGradient>

            <linearGradient id="goldFlowGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#c49756" stopOpacity="0.05" />
              <stop offset="35%" stopColor="#e5be85" stopOpacity="0.32" />
              <stop offset="70%" stopColor="#c17f3a" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#c49756" stopOpacity="0.05" />
            </linearGradient>

            <filter id="ambientGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
            </filter>
          </defs>

          {/* Sweeping Financial Currency & Network Flow Contours */}
          <path
            d="M -50,220 C 220,120 400,290 700,210 C 850,170 940,240 1050,190"
            fill="none"
            stroke="url(#goldCurveGrad)"
            strokeWidth="1.2"
          />
          <path
            d="M -50,235 C 240,135 420,305 720,225 C 870,185 960,255 1050,205"
            fill="none"
            stroke="url(#goldCurveGrad)"
            strokeWidth="0.8"
            strokeDasharray="6 6"
          />
          <path
            d="M -20,440 C 260,380 480,480 780,390 C 900,350 980,410 1060,370"
            fill="none"
            stroke="url(#goldCurveGrad)"
            strokeWidth="1.1"
            strokeDasharray="4 4"
          />
          <path
            d="M 60,60 C 260,180 540,80 820,160 C 940,200 980,140 1060,170"
            fill="none"
            stroke="url(#goldCurveGrad)"
            strokeWidth="0.9"
          />

          {/* Connected relationship lines linking decorative nodes */}
          <path
            d="M 125,135 Q 230,170 340,150 T 480,165 T 620,135 T 740,195 T 885,185"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="1.2"
          />
          <path
            d="M 170,280 Q 230,220 340,150"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="0.9"
            strokeDasharray="5 4"
          />
          <path
            d="M 260,350 Q 210,310 170,280"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="0.8"
          />
          <path
            d="M 860,110 Q 800,150 740,195"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="0.9"
            strokeDasharray="4 5"
          />
          <path
            d="M 925,240 Q 905,210 885,185"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="0.8"
          />
          <path
            d="M 835,360 Q 880,300 925,240"
            fill="none"
            stroke="url(#goldFlowGrad)"
            strokeWidth="0.9"
            strokeDasharray="6 4"
          />

          {/* ─── Interactive Background Nodes (Soft Illumination on Mouse Move, No Popups) ── */}
          {AMBIENT_DOTS.map((dot) => {
            const dist = mousePos ? Math.hypot(dot.x - mousePos.x, dot.y - mousePos.y) : 999;
            const isNear = dist < 135;

            return (
              <g key={dot.id}>
                {/* Glow ring if cursor is nearby */}
                {isNear && (
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.r * 2.2}
                    fill="#f59e0b"
                    opacity={0.35}
                    filter="url(#ambientGoldGlow)"
                  />
                )}
                {/* Core node */}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={isNear ? dot.r * 1.3 : dot.r}
                  fill={isNear ? "#f59e0b" : "#c17f3a"}
                  opacity={isNear ? 0.95 : 0.65}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}
        </svg>

        {/* ─── 2. FLOATING CATEGORY PILL CHIPS ──────────────────────────── */}
        {/* Top-Left: BANK */}
        <div className="absolute top-[15%] left-[9%] hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#dfd2be] shadow-xs hover:border-[#c49756] hover:shadow-[0_4px_16px_rgba(212,153,82,0.18)] transition-all drift-1 text-[#664b33]">
          <Landmark size={13} className="text-[#b45309]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Bank</span>
        </div>

        {/* Mid-Left: ACCOUNT */}
        <div className="absolute top-[37%] left-[5%] hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#dfd2be] shadow-xs hover:border-[#c49756] hover:shadow-[0_4px_16px_rgba(212,153,82,0.18)] transition-all drift-2 text-[#664b33]">
          <UserCheck size={13} className="text-[#b45309]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Account</span>
        </div>

        {/* Lower-Left: UPI */}
        <div className="absolute top-[57%] left-[8%] hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#dfd2be] shadow-xs hover:border-[#c49756] hover:shadow-[0_4px_16px_rgba(212,153,82,0.18)] transition-all drift-3 text-[#664b33]">
          <Zap size={13} className="text-[#d97706]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">UPI</span>
        </div>

        {/* Top-Right: MERCHANT */}
        <div className="absolute top-[15%] right-[9%] hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#dfd2be] shadow-xs hover:border-[#c49756] hover:shadow-[0_4px_16px_rgba(212,153,82,0.18)] transition-all drift-4 text-[#664b33]">
          <CreditCard size={13} className="text-[#b45309]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Merchant</span>
        </div>

        {/* Mid-Right: PHONE */}
        <div className="absolute top-[38%] right-[5%] hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#dfd2be] shadow-xs hover:border-[#c49756] hover:shadow-[0_4px_16px_rgba(212,153,82,0.18)] transition-all drift-5 text-[#664b33]">
          <Phone size={13} className="text-[#b45309]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Phone</span>
        </div>

        {/* Lower-Right: NETWORK */}
        <div className="absolute top-[59%] right-[9%] hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#dfd2be] shadow-xs hover:border-[#c49756] hover:shadow-[0_4px_16px_rgba(212,153,82,0.18)] transition-all drift-6 text-[#664b33]">
          <Network size={13} className="text-[#b45309]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Network</span>
        </div>
      </div>

      {/* ─── 3. CENTRAL HERO & SEARCH SECTION ──────────────────────────── */}
      <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center text-center mt-3 md:mt-7">
        {/* Central SANKET Branding with continuous subtle floating animation & soft gold glow */}
        <div className="flex flex-col items-center">
          <img
            src="/sanket-logo.png"
            alt="SANKET Emblem"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-2 filter drop-shadow-[0_4px_20px_rgba(212,153,82,0.35)]"
          />
          <h1
            className="sanket-brand-float text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#2a1408] via-[#1a0a03] to-[#3d2010] select-none"
            style={{
              filter: "drop-shadow(0 4px 28px rgba(212, 153, 82, 0.28))",
            }}
          >
            SANKET
          </h1>

          <div className="text-[11px] sm:text-xs font-bold tracking-[0.28em] text-[#8c6742] uppercase mt-2">
            Financial Investigation Console
          </div>

          <p className="text-xs sm:text-sm text-[#73573e] italic font-serif mt-1.5 max-w-lg leading-relaxed">
            &ldquo;Trace money movement. Understand hidden relationships. Build defensible evidence.&rdquo;
          </p>

          {/* Warm Burnished Gold Accent Bar */}
          <div className="w-14 h-1 rounded-full bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#b45309] mt-3 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
        </div>

        {/* Main Central Investigation Search Box (Capsule Pill with Interactive Micro-Animations) */}
        <div className="w-full max-w-2xl mt-7">
          <form
            onSubmit={handleFormSubmit}
            className={cn(
              "relative w-full bg-white/95 rounded-full border p-1.5 sm:p-2 flex items-center gap-2",
              "transition-all duration-200 ease-out will-change-transform transform-gpu",
              "hover:-translate-y-[6px] hover:scale-[1.018]",
              "hover:border-[#c49756] hover:shadow-[0_18px_45px_-6px_rgba(68,36,14,0.18),0_0_28px_rgba(212,153,82,0.25)]",
              "overflow-hidden group/search",
              isSubmitting
                ? "animate-submit-confirm border-[#f59e0b]"
                : isFocused
                  ? "border-[#c49756] ring-2 ring-[#c49756]/25 shadow-[0_14px_42px_-4px_rgba(68,36,14,0.14),0_0_30px_rgba(212,153,82,0.28)]"
                  : hasActiveCase
                    ? "border-[#c49756]/70 shadow-[0_10px_35px_-5px_rgba(68,36,14,0.08),0_0_24px_rgba(212,153,82,0.18)]"
                    : "search-bar-idle"
            )}
          >
            {/* Subtle Light Sweep Sheen on Focus */}
            {isFocused && (
              <div
                key={sheenKey}
                className="pointer-events-none absolute inset-0 rounded-full overflow-hidden z-0"
              >
                <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#c49756]/20 to-transparent transform -skew-x-12 animate-search-sheen" />
              </div>
            )}

            {/* Search Icon with Interactive States & Micro Radar Indicator */}
            <div className="pl-3.5 relative flex items-center flex-shrink-0 z-10">
              <span
                className={cn(
                  "flex items-center justify-center transition-all duration-200 ease-out",
                  isSubmitting
                    ? "animate-icon-submit text-[#f59e0b]"
                    : isFocused
                      ? "animate-icon-pulse text-[#b45309] drop-shadow-[0_0_8px_rgba(212,153,82,0.45)]"
                      : isTyping
                        ? "text-[#c49756] drop-shadow-[0_0_6px_rgba(196,151,86,0.4)]"
                        : "text-[#8a6a4c] group-hover/search:text-[#b47836]"
                )}
              >
                <Search size={18} />
              </span>

              {/* Tiny micro radar/query indicator dot while typing */}
              {isTyping && !isInvestigating && (
                <span className="absolute -top-0.5 -right-1 flex h-2 w-2" title="Investigation query ready">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d97706]" />
                </span>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Enter Account Number / UPI ID / Phone Number"
              className="flex-1 bg-transparent px-2 py-2 text-sm text-[#231207] placeholder:text-[#a58e76] outline-none font-medium min-w-0 relative z-10"
              disabled={isInvestigating}
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isInvestigating}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide text-[#fcf8f2] transition-all duration-200 flex-shrink-0 select-none z-10",
                "bg-gradient-to-r from-[#44230e] via-[#351a0b] to-[#251207] border border-[#d49952]/80",
                "shadow-[0_4px_18px_rgba(212,153,82,0.32)] hover:shadow-[0_6px_24px_rgba(212,153,82,0.48)] hover:border-[#f59e0b]",
                "hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
              )}
            >
              {isInvestigating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  <span>INVESTIGATING...</span>
                </>
              ) : (
                <>
                  <span>INVESTIGATE</span>
                  <ArrowRight size={14} className="text-[#f59e0b] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Start / Recent Searches Chips with Hover Elevation */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[#876a4f] text-[11px] font-medium">Quick start — recent searches:</span>
            {recentSearches.map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => handleChipClick(acc)}
                className="bg-white/95 border border-[#dfd2bd] hover:border-[#c49756] hover:bg-[#faf4ec] text-[#4d321c] px-3 py-1 rounded-full text-xs font-mono shadow-2xs hover:shadow-[0_3px_12px_rgba(196,151,86,0.22)] hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title={`Investigate ${acc}`}
              >
                <span>{acc}</span>
              </button>
            ))}
          </div>

          {/* Active investigation banner shortcut if user has an ongoing session */}
          {investigation && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#f4ece0] border border-[#d8c5ab] px-3.5 py-1.5 rounded-full text-xs text-[#523720] shadow-2xs">
              <CheckCircle2 size={13} className="text-[#27ae60]" />
              <span>Active case: <strong>{investigation.account.account_id}</strong> ({investigation.risk.level} Risk)</span>
              <button
                type="button"
                onClick={() => { setActiveNav("graph"); setActiveTab("graph"); }}
                className="ml-1 underline font-semibold text-[#8c5621] hover:text-[#523720]"
              >
                View Dashboard &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. THREE BOTTOM FEATURE CARDS ──────────────────────────────── */}
      <div className="relative z-10 max-w-4xl w-full mx-auto mt-8 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Transaction Graph */}
          <div
            onClick={() => handleCardClick("graph")}
            className="group relative bg-[#fdfbf7] hover:bg-white rounded-2xl border border-[#e5d8c6] hover:border-[#d4a86a] p-4.5 sm:p-5 shadow-xs hover:shadow-[0_12px_32px_rgba(58,29,11,0.09),0_0_18px_rgba(212,153,82,0.12)] transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle background motif */}
            <div className="absolute top-2 right-2 opacity-[0.06] pointer-events-none">
              <GitBranch size={90} className="text-[#b45309]" />
            </div>

            <div className="flex items-start justify-between">
              {/* Icon badge */}
              <div className="w-10 h-10 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#b45309] shadow-2xs">
                <GitBranch size={19} />
              </div>

              {/* Action circle button */}
              <div className="w-8 h-8 rounded-full bg-[#78350f] group-hover:bg-[#582509] text-white flex items-center justify-center transition-colors shadow-2xs">
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-bold text-sm text-[#231207] tracking-tight">Transaction Graph</h3>
              <p className="text-xs text-[#826950] mt-0.5">L0 — L3 relationship map</p>

              {/* Accent bar */}
              <div className="w-8 h-1 rounded-full bg-[#d97706] mt-3 group-hover:w-12 transition-all duration-300 shadow-[0_0_8px_rgba(217,119,6,0.3)]" />
            </div>
          </div>

          {/* Card 2: Timeline */}
          <div
            onClick={() => handleCardClick("timeline")}
            className="group relative bg-[#f9fbfe] hover:bg-white rounded-2xl border border-[#dce6f2] hover:border-[#7dd3fc] p-4.5 sm:p-5 shadow-xs hover:shadow-[0_12px_32px_rgba(3,105,161,0.09),0_0_18px_rgba(125,211,252,0.15)] transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-2 right-2 opacity-[0.06] pointer-events-none">
              <Clock size={90} className="text-[#0284c7]" />
            </div>

            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] border border-[#bae6fd] flex items-center justify-center text-[#0284c7] shadow-2xs">
                <Clock size={19} />
              </div>

              <div className="w-8 h-8 rounded-full bg-[#0c4a6e] group-hover:bg-[#073047] text-white flex items-center justify-center transition-colors shadow-2xs">
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-bold text-sm text-[#231207] tracking-tight">Timeline</h3>
              <p className="text-xs text-[#826950] mt-0.5">Chronological money flow</p>

              <div className="w-8 h-1 rounded-full bg-[#0284c7] mt-3 group-hover:w-12 transition-all duration-300 shadow-[0_0_8px_rgba(2,132,199,0.3)]" />
            </div>
          </div>

          {/* Card 3: Evidence */}
          <div
            onClick={() => handleCardClick("evidence")}
            className="group relative bg-[#f8fcf9] hover:bg-white rounded-2xl border border-[#d8ebd9] hover:border-[#86efac] p-4.5 sm:p-5 shadow-xs hover:shadow-[0_12px_32px_rgba(21,128,61,0.09),0_0_18px_rgba(134,239,172,0.15)] transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-2 right-2 opacity-[0.06] pointer-events-none">
              <ShieldCheck size={90} className="text-[#16a34a]" />
            </div>

            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#dcfce7] border border-[#bbf7d0] flex items-center justify-center text-[#16a34a] shadow-2xs">
                <ShieldCheck size={19} />
              </div>

              <div className="w-8 h-8 rounded-full bg-[#14532d] group-hover:bg-[#0d381e] text-white flex items-center justify-center transition-colors shadow-2xs">
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="font-bold text-sm text-[#231207] tracking-tight">Evidence</h3>
              <p className="text-xs text-[#826950] mt-0.5">Court-ready evidence chain</p>

              <div className="w-8 h-1 rounded-full bg-[#16a34a] mt-3 group-hover:w-12 transition-all duration-300 shadow-[0_0_8px_rgba(22,163,74,0.3)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. BOTTOM AUTHORITY BADGE ─────────────────────────────────── */}
      <div className="relative z-10 w-full flex items-center justify-end px-2 pt-2 pb-1 text-[#967961]">
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] tracking-widest uppercase font-semibold">
          <span>INDIA</span>
          <span className="opacity-40">|</span>
          <span>FINANCIAL INTELLIGENCE</span>
          <span className="opacity-40">|</span>
          <span>SECURE</span>
          <span className="opacity-40">|</span>
          <span>ACCOUNTABLE</span>
          <Shield size={11} className="ml-0.5 opacity-80 text-[#856547]" />
        </div>
      </div>
    </div>
  );
}
