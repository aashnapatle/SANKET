"use client";
import { useState, useRef } from "react";
import { useSanketStore } from "@/lib/store";
import { investigateAccount } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Search, ArrowRight, GitBranch, Clock, ShieldCheck,
  Landmark, UserCheck, Zap, CreditCard, Phone, Network,
  Shield, CheckCircle2, ChevronRight
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

export default function InvestigationLanding() {
  const {
    searchQuery, setSearchQuery, recentSearches, addRecentSearch,
    setInvestigation, setInvestigating, setInvestigationError, setInvestigationStage,
    isInvestigating, setActiveTab, setActiveNav, investigation
  } = useSanketStore();

  const [inputVal, setInputVal] = useState(searchQuery || "");
  const inputRef = useRef<HTMLInputElement>(null);

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
    executeInvestigation(inputVal);
  };

  const handleChipClick = (acc: string) => {
    setInputVal(acc);
    executeInvestigation(acc);
  };

  const handleCardClick = (tab: "graph" | "timeline" | "evidence") => {
    if (investigation) {
      setActiveNav(tab);
      setActiveTab(tab);
    } else {
      // If no investigation active, use default demo account ACC001235
      setInputVal("ACC001235");
      executeInvestigation("ACC001235");
    }
  };

  return (
    <div className="relative w-full h-full min-h-full flex flex-col justify-between overflow-x-hidden overflow-y-auto bg-gradient-to-b from-[#fbf8f3] via-[#f7f2ea] to-[#eee5d8] text-[#2c1810] px-4 py-6 md:px-8 select-none">
      {/* ─── 1. BACKGROUND NETWORK & WATERMARK LAYER ────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle radial center glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-[#f8ecd9]/60 via-[#edd8be]/25 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Faint Indian Judicial / State Emblem & Colonnade Watermark */}
        <svg
          className="absolute top-8 left-1/2 -translate-x-1/2 w-[620px] h-[480px] opacity-[0.06] text-[#3d2010]"
          viewBox="0 0 400 400"
          fill="currentColor"
          aria-hidden="true"
        >
          {/* Faint stylized emblem pedestal, lions & dharma chakra motif */}
          <path d="M200,60 C215,60 225,72 225,88 C225,97 220,105 212,110 C228,116 240,132 240,150 C240,172 222,190 200,190 C178,190 160,172 160,150 C160,132 172,116 188,110 C180,105 175,97 175,88 C175,72 185,60 200,60 Z" />
          <path d="M140,210 L260,210 L250,230 L150,230 Z" />
          <circle cx="200" cy="220" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M120,240 L280,240 L275,255 L125,255 Z" />
          {/* Columns motif */}
          <rect x="135" y="260" width="10" height="70" rx="2" />
          <rect x="165" y="260" width="10" height="70" rx="2" />
          <rect x="195" y="260" width="10" height="70" rx="2" />
          <rect x="225" y="260" width="10" height="70" rx="2" />
          <rect x="255" y="260" width="10" height="70" rx="2" />
          <rect x="110" y="335" width="180" height="15" rx="3" />
        </svg>

        {/* Financial relationship lines and floating nodes */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.14]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c17f3a" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8c5621" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c17f3a" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Connected relationship paths */}
          <path d="M120,140 Q320,180 500,170 T880,190" fill="none" stroke="url(#netGrad)" strokeWidth="1.2" strokeDasharray="4 3" />
          <path d="M160,280 Q360,220 520,270 T920,240" fill="none" stroke="url(#netGrad)" strokeWidth="1" />
          <path d="M220,190 Q480,310 740,220" fill="none" stroke="url(#netGrad)" strokeWidth="0.8" strokeDasharray="3 3" />
          <path d="M80,380 Q400,340 760,390 T1100,340" fill="none" stroke="url(#netGrad)" strokeWidth="1" strokeDasharray="5 4" />
          <path d="M300,90 L420,170 L540,110 L680,160" fill="none" stroke="url(#netGrad)" strokeWidth="0.7" />

          {/* Relationship nodes with glowing pulse */}
          <circle cx="120" cy="140" r="3.5" fill="#c17f3a" className="network-node-pulse" />
          <circle cx="500" cy="170" r="4.5" fill="#c17f3a" />
          <circle cx="880" cy="190" r="3.5" fill="#c17f3a" className="network-node-pulse" />
          <circle cx="160" cy="280" r="4" fill="#8c5621" />
          <circle cx="520" cy="270" r="3.5" fill="#c17f3a" />
          <circle cx="920" cy="240" r="4.5" fill="#8c5621" className="network-node-pulse" />
          <circle cx="220" cy="190" r="3" fill="#c17f3a" />
          <circle cx="740" cy="220" r="4" fill="#c17f3a" />
          <circle cx="420" cy="170" r="3.5" fill="#c17f3a" />
          <circle cx="680" cy="160" r="3" fill="#8c5621" />
        </svg>

        {/* ─── 2. FLOATING NETWORK LABELS ──────────────────────────────── */}
        {/* Top-Left: BANK */}
        <div className="absolute top-[16%] left-[12%] hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[#dfd3c3] shadow-xs drift-1 text-[#664b33]">
          <Landmark size={13} className="text-[#966b3f]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Bank</span>
        </div>

        {/* Mid-Left: ACCOUNT */}
        <div className="absolute top-[38%] left-[7%] hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/85 border border-[#dfd3c3] shadow-xs drift-2 text-[#664b33]">
          <UserCheck size={13} className="text-[#966b3f]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Account</span>
        </div>

        {/* Lower-Left: UPI */}
        <div className="absolute top-[58%] left-[10%] hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-[#dfd3c3] shadow-xs drift-3 text-[#664b33]">
          <Zap size={13} className="text-[#b45309]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">UPI</span>
        </div>

        {/* Top-Right: MERCHANT */}
        <div className="absolute top-[17%] right-[11%] hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-[#dfd3c3] shadow-xs drift-4 text-[#664b33]">
          <CreditCard size={13} className="text-[#966b3f]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Merchant</span>
        </div>

        {/* Mid-Right: PHONE */}
        <div className="absolute top-[39%] right-[6%] hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 border border-[#dfd3c3] shadow-xs drift-5 text-[#664b33]">
          <Phone size={13} className="text-[#966b3f]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Phone</span>
        </div>

        {/* Lower-Right: NETWORK */}
        <div className="absolute top-[60%] right-[12%] hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-[#dfd3c3] shadow-xs drift-6 text-[#664b33]">
          <Network size={13} className="text-[#966b3f]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Network</span>
        </div>
      </div>

      {/* ─── 3. CENTRAL HERO & SEARCH SECTION ──────────────────────────── */}
      <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center text-center mt-4 md:mt-8">
        {/* Central SANKET Branding with continuous subtle floating animation */}
        <div className="flex flex-col items-center">
          <h1 className="sanket-brand-float text-6xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#1c0f08] drop-shadow-xs">
            SANKET
          </h1>

          <div className="text-[11px] sm:text-xs font-bold tracking-[0.28em] text-[#856547] uppercase mt-2">
            Financial Investigation Console
          </div>

          <p className="text-xs sm:text-sm text-[#73573e] italic font-serif mt-1.5 max-w-lg leading-relaxed">
            &ldquo;Trace money movement. Understand hidden relationships. Build defensible evidence.&rdquo;
          </p>
        </div>

        {/* Main Central Investigation Search Box */}
        <div className="w-full max-w-2xl mt-8">
          <form
            onSubmit={handleFormSubmit}
            className="w-full bg-white rounded-2xl border border-[#dfd2bd] shadow-md shadow-[#381e0d]/5 p-1.5 sm:p-2 flex items-center gap-2 transition-all focus-within:border-[#c49756] focus-within:ring-2 focus-within:ring-[#c49756]/20"
          >
            <div className="pl-3 text-[#8a6a4c] flex-shrink-0">
              <Search size={18} />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Account Number / UPI ID / Phone Number"
              className="flex-1 bg-transparent px-2 py-2 text-sm text-[#231207] placeholder:text-[#a58e76] outline-none font-medium min-w-0"
              disabled={isInvestigating}
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isInvestigating}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-[#fcf8f2] transition-all duration-200 flex-shrink-0 select-none shadow-xs",
                "bg-gradient-to-r from-[#3a1d0b] to-[#261105] border border-[#c49756]/60",
                "hover:from-[#2a1306] hover:to-[#1a0a03] hover:border-[#c49756] hover:shadow-md hover:shadow-[#c49756]/20",
                "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
              )}
            >
              {isInvestigating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  <span>INVESTIGATING...</span>
                </>
              ) : (
                <>
                  <span>INVESTIGATE</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Start / Recent Searches Chips */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[#876a4f] text-[11px] font-medium">Quick start — recent searches:</span>
            {recentSearches.map((acc) => (
              <button
                key={acc}
                type="button"
                onClick={() => handleChipClick(acc)}
                className="bg-white/90 border border-[#dfd2bd] hover:border-[#c49756] hover:bg-[#faf4ec] text-[#4d321c] px-2.5 py-1 rounded-lg text-xs font-mono shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
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
      <div className="relative z-10 max-w-4xl w-full mx-auto mt-10 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Transaction Graph */}
          <div
            onClick={() => handleCardClick("graph")}
            className="group relative bg-[#fdfbf7] hover:bg-white rounded-2xl border border-[#e5d8c6] hover:border-[#d4a86a] p-4 sm:p-5 shadow-xs hover:shadow-lg hover:shadow-[#381e0d]/8 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle card background illustration pattern */}
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
              <div className="w-8 h-1 rounded-full bg-[#d97706] mt-3 group-hover:w-12 transition-all duration-300" />
            </div>
          </div>

          {/* Card 2: Timeline */}
          <div
            onClick={() => handleCardClick("timeline")}
            className="group relative bg-[#f9fbfe] hover:bg-white rounded-2xl border border-[#dce6f2] hover:border-[#7dd3fc] p-4 sm:p-5 shadow-xs hover:shadow-lg hover:shadow-[#0369a1]/8 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
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

              <div className="w-8 h-1 rounded-full bg-[#0284c7] mt-3 group-hover:w-12 transition-all duration-300" />
            </div>
          </div>

          {/* Card 3: Evidence */}
          <div
            onClick={() => handleCardClick("evidence")}
            className="group relative bg-[#f8fcf9] hover:bg-white rounded-2xl border border-[#d8ebd9] hover:border-[#86efac] p-4 sm:p-5 shadow-xs hover:shadow-lg hover:shadow-[#15803d]/8 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer flex flex-col justify-between overflow-hidden"
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

              <div className="w-8 h-1 rounded-full bg-[#16a34a] mt-3 group-hover:w-12 transition-all duration-300" />
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
