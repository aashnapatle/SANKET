"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSanketStore } from "@/lib/store";
import { investigateAccount } from "@/lib/api";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Menu, Search, Bell, Scale, ChevronDown, LogOut, User, X } from "lucide-react";

const INVESTIGATION_STAGES = [
  "Finding account...",
  "Loading transactions...",
  "Building relationship graph...",
  "Analysing movement patterns...",
  "Calculating risk signals...",
  "Preparing evidence...",
  "Finalising investigation...",
];

export default function Header() {
  const {
    toggleSidebar, searchQuery, setSearchQuery, recentSearches, addRecentSearch,
    setInvestigation, setInvestigating, setInvestigationError, setInvestigationStage,
    isInvestigating, isJudgeMode, toggleJudgeMode, investigatorName, logout,
    setActiveTab, setActiveNav,
  } = useSanketStore();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInvestigate = useCallback(async () => {
    const account = searchQuery.trim();
    if (!account || isInvestigating) return;

    setInvestigating(true);
    setInvestigationError(null);
    setActiveNav("investigation");
    setActiveTab("graph");
    addRecentSearch(account);
    setShowDropdown(false);

    // Cycle through stages
    let stageIndex = 0;
    setInvestigationStage(INVESTIGATION_STAGES[0]);
    const stageInterval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, INVESTIGATION_STAGES.length - 1);
      setInvestigationStage(INVESTIGATION_STAGES[stageIndex]);
    }, 350);

    try {
      const data = await investigateAccount(account);
      clearInterval(stageInterval);
      setInvestigation(data);
    } catch (err: any) {
      clearInterval(stageInterval);
      if (err.message === "ACCOUNT_NOT_FOUND") {
        setInvestigationError("Account not found. Please check the account number and try again.");
      } else {
        setInvestigationError("Investigation failed. Backend may be unavailable.");
      }
    } finally {
      setInvestigating(false);
      setInvestigationStage("");
    }
  }, [searchQuery, isInvestigating, setInvestigating, setInvestigation, setInvestigationError, setInvestigationStage, addRecentSearch, setActiveTab, setActiveNav]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleInvestigate();
    if (e.key === "Escape") setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-search-area]")) setShowDropdown(false);
      if (!target.closest("[data-profile-area]")) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-[#fdf8f3] border-b border-[#e8d8c4] flex-shrink-0 z-20 sticky top-0">
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        className="text-[#5c3d1e] hover:bg-[#ede5d8] rounded-lg p-1.5 transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* ─── Search ─────────────────────────────────── */}
      <div className="flex-1 flex items-center gap-2 max-w-2xl" data-search-area>
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6e4e]" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Enter Account Number / UPI ID / Phone Number"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e8d8c4] rounded-lg text-[#2c1810] placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c4a882] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c6e4e] hover:text-[#2c1810]"
            >
              <X size={13} />
            </button>
          )}

          {/* Recent searches dropdown */}
          {showDropdown && recentSearches.length > 0 && !searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#e8d8c4] shadow-lg z-50 py-1 fade-in">
              <div className="px-3 py-1.5 text-[10px] text-[#8c6e4e] uppercase tracking-wider font-medium">Recent Searches</div>
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => { setSearchQuery(s); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-[#2c1810] hover:bg-[#f5f0eb] transition-colors flex items-center gap-2"
                >
                  <Search size={12} className="text-[#8c6e4e]" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleInvestigate}
          loading={isInvestigating}
          disabled={!searchQuery.trim()}
          size="md"
          className="flex-shrink-0 font-semibold tracking-wide"
        >
          {isInvestigating ? "Investigating..." : "INVESTIGATE →"}
        </Button>
      </div>

      {/* ─── Spacer ─────────────────────────────────── */}
      <div className="flex-1" />

      {/* ─── Judge Mode Toggle ───────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e8d8c4] rounded-lg flex-shrink-0">
        <Scale size={13} className="text-[#5c3d1e]" />
        <span className="text-xs font-medium text-[#5c3d1e] hidden sm:block">Judge Mode</span>
        <button
          onClick={toggleJudgeMode}
          className={cn(
            "relative w-9 h-5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#c4a882] focus:ring-offset-1",
            isJudgeMode ? "bg-[#5c3d1e]" : "bg-[#d4c4b0]"
          )}
          aria-checked={isJudgeMode}
          role="switch"
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
              isJudgeMode && "translate-x-4"
            )}
          />
        </button>
      </div>

      {/* ─── Notifications ──────────────────────────── */}
      <button className="relative p-2 text-[#5c3d1e] hover:bg-[#ede5d8] rounded-lg transition-colors">
        <Bell size={17} />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c0392b]" />
      </button>

      {/* ─── Profile ────────────────────────────────── */}
      <div className="relative" data-profile-area>
        <button
          onClick={() => setShowProfile(v => !v)}
          className="w-8 h-8 rounded-full bg-[#5c3d1e] text-white text-sm font-bold flex items-center justify-center hover:bg-[#4a3018] transition-colors"
        >
          {investigatorName.charAt(0).toUpperCase()}
        </button>
        {showProfile && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#e8d8c4] shadow-lg z-50 py-1 fade-in">
            <div className="px-3 py-2 border-b border-[#e8d8c4]">
              <div className="text-sm font-semibold text-[#2c1810]">{investigatorName}</div>
              <div className="text-xs text-[#8c6e4e]">Investigator</div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm text-[#c0392b] hover:bg-[#fdf0ef] flex items-center gap-2 transition-colors"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
