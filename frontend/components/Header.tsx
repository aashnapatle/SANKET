"use client";
import { useState, useRef, useEffect } from "react";
import { useSanketStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu, Bell, Scale, LogOut, User } from "lucide-react";

export default function Header() {
  const {
    toggleSidebar, isJudgeMode, toggleJudgeMode, investigatorName, logout,
  } = useSanketStore();

  const [showProfile, setShowProfile] = useState(false);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-profile-area]")) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-5 bg-[#fdfaf6] border-b border-[#ebdccb]/80 flex-shrink-0 z-20 sticky top-0">
      {/* ─── Left: Sidebar Toggle ───────────────────── */}
      <button
        onClick={toggleSidebar}
        className="text-[#5c3d1e] hover:bg-[#ede5d8] rounded-lg p-1.5 transition-colors flex-shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      {/* ─── Right Controls ─────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Judge Mode Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-[#e2d5c3] rounded-lg flex-shrink-0 shadow-2xs">
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

        {/* Notifications */}
        <button
          className="relative p-2 text-[#5c3d1e] hover:bg-[#ede5d8] rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c0392b]" />
        </button>

        {/* Profile */}
        <div className="relative" data-profile-area>
          <button
            onClick={() => setShowProfile(v => !v)}
            className="w-8 h-8 rounded-full bg-[#2c1810] text-[#f5ebd9] text-xs font-bold flex items-center justify-center border border-[#c49756]/40 hover:bg-[#4a3018] transition-colors shadow-2xs"
            title={investigatorName}
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
      </div>
    </header>
  );
}
