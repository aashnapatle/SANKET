"use client";
import { useState, useEffect } from "react";
import { useSanketStore } from "@/lib/store";
import LoginPage from "@/components/LoginPage";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import InvestigationConsole from "@/components/InvestigationConsole";
import SubtleNetworkBackground from "@/components/SubtleNetworkBackground";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { isAuthenticated, isJudgeMode } = useSanketStore();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("sanket_token");
    if (token) {
      setHasToken(true);
      useSanketStore.setState({ isAuthenticated: true });
    }
  }, []);

  if (!mounted) return null;

  // Agar token ya authenticated dono me se koi bhi true hai toh dashboard dikhao
  if (!isAuthenticated && !hasToken) {
    return <LoginPage />;
  }

  return (
    <div className={cn("flex h-screen overflow-hidden bg-[#120804] text-[#f7ebd7]", isJudgeMode && "judge-theme")}>
      <SubtleNetworkBackground />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <InvestigationConsole />
        </main>
      </div>
    </div>
  );
}
