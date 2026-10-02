"use client";
import { useSanketStore } from "@/lib/store";
import LoginPage from "@/components/LoginPage";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import InvestigationConsole from "@/components/InvestigationConsole";
import SubtleNetworkBackground from "@/components/SubtleNetworkBackground";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { isAuthenticated, isJudgeMode } = useSanketStore();

  // ─── Not authenticated → Login ────────────────────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ─── Main Application Shell ───────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f2ea]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        {/* Top Header */}
        <Header />

        {/* Global subtle intelligence network background */}
        <SubtleNetworkBackground />

        {/* Investigation Workspace */}
        <main className={cn(
          "flex-1 overflow-hidden relative z-10",
          isJudgeMode && "ring-2 ring-[#c49756] ring-inset"
        )}>
          <InvestigationConsole />
        </main>
      </div>
    </div>
  );
}
