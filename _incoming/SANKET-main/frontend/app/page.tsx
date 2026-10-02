"use client";
import { useSanketStore } from "@/lib/store";
import LoginPage from "@/components/LoginPage";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import InvestigationConsole from "@/components/InvestigationConsole";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { isAuthenticated, isJudgeMode } = useSanketStore();

  // ─── Not authenticated → Login ────────────────────────────────────────────
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ─── Main Application Shell ───────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f0eb]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <Header />

        {/* Investigation Workspace */}
        <main className={cn(
          "flex-1 overflow-hidden",
          isJudgeMode && "ring-2 ring-[#5c3d1e] ring-inset"
        )}>
          <InvestigationConsole />
        </main>
      </div>
    </div>
  );
}
