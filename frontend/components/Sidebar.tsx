"use client";
import { useSanketStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Search, GitBranch, Clock, List, Shield, FileText,
  Snowflake, FileSearch, BarChart3, Lock, ChevronLeft, ChevronRight,
  Settings, LogOut
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  section?: "main" | "tools";
};

const NAV_ITEMS: NavItem[] = [
  { id: "investigation", label: "Investigation", icon: <Search size={16} />, section: "main" },
  { id: "graph", label: "Graph", icon: <GitBranch size={16} />, section: "main" },
  { id: "timeline", label: "Timeline", icon: <Clock size={16} />, section: "main" },
  { id: "transactions", label: "Transactions", icon: <List size={16} />, section: "main" },
  { id: "evidence", label: "Evidence", icon: <Shield size={16} />, section: "main" },
  { id: "reports", label: "Reports", icon: <FileText size={16} />, section: "main" },
  { id: "freeze", label: "Freeze Plan", icon: <Snowflake size={16} />, section: "tools" },
  { id: "notice", label: "Notice Preview", icon: <FileSearch size={16} />, section: "tools" },
  { id: "benchmark", label: "Benchmark", icon: <BarChart3 size={16} />, section: "tools" },
  { id: "prompt-defense", label: "Prompt Defense", icon: <Lock size={16} />, section: "tools" },
];

export default function Sidebar() {
  const {
    isSidebarCollapsed, toggleSidebar, activeNav, setActiveNav,
    investigatorName, logout, investigation, setActiveTab
  } = useSanketStore();

  const handleNavClick = (id: string) => {
    setActiveNav(id as any);
    // If user clicks a tab like graph/timeline and an investigation exists, set active tab too
    if (["graph", "timeline", "transactions", "evidence", "reports"].includes(id)) {
      setActiveTab(id as any);
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#1c0f08] text-[#d4b896] transition-all duration-300 ease-in-out flex-shrink-0 relative",
        "border-r border-[#311b10] select-none",
        isSidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* ─── Branding ────────────────────────────────────── */}
      <div className={cn(
        "flex items-center py-5 px-4 border-b border-[#2b170c] flex-shrink-0",
        isSidebarCollapsed ? "justify-center" : "gap-3"
      )}>
        {/* Logo mark */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#c17f3a] to-[#8c5621] border border-[#d49952]/40 flex items-center justify-center font-bold text-white text-sm shadow-sm">
          S
        </div>
        {!isSidebarCollapsed && (
          <div>
            <div className="text-[#f7ebd7] font-bold text-base tracking-wide leading-none">SANKET</div>
            <div className="text-[#967756] text-[10px] mt-1 leading-tight font-medium">Financial Investigation<br />Console</div>
          </div>
        )}
      </div>

      {/* ─── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {/* Main items */}
        {NAV_ITEMS.filter(n => n.section === "main").map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeNav === item.id}
            collapsed={isSidebarCollapsed}
            onClick={() => handleNavClick(item.id)}
          />
        ))}

        {/* Tools divider */}
        {!isSidebarCollapsed && (
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[10px] text-[#9c7b5a] uppercase tracking-widest font-semibold">
              Investigative Tools
            </span>
          </div>
        )}
        {isSidebarCollapsed && <div className="border-t border-[#2b170c] my-2 mx-1" />}

        {/* Tool items */}
        {NAV_ITEMS.filter(n => n.section === "tools").map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeNav === item.id}
            collapsed={isSidebarCollapsed}
            onClick={() => handleNavClick(item.id)}
          />
        ))}
      </nav>

      {/* ─── Brand tagline (collapsed: hidden) ───────────── */}
      {!isSidebarCollapsed && (
        <div className="px-4 py-3 border-t border-[#2b170c]">
          <div className="text-[9px] text-[#6e5138] uppercase tracking-widest leading-relaxed space-y-0.5 font-medium">
            <div>TRACE · ANALYSE</div>
            <div>DISRUPT · PROTECT</div>
          </div>
        </div>
      )}

      {/* ─── Investigator Profile ─────────────────────────── */}
      <div className={cn(
        "flex items-center gap-2.5 p-3 border-t border-[#2b170c] bg-[#170c06]/60",
        isSidebarCollapsed && "justify-center"
      )}>
        <div className="w-8 h-8 rounded-full bg-[#311b10] border border-[#c49756]/50 flex items-center justify-center text-[#f2e2ce] text-xs font-bold flex-shrink-0 shadow-xs">
          {investigatorName.charAt(0).toUpperCase()}
        </div>
        {!isSidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[#e8d2b8] text-xs font-medium truncate">{investigatorName.toLowerCase().replace(/\s+/g, "")}</div>
            <div className="text-[#876a4e] text-[10px]">Investigator</div>
          </div>
        )}
        {!isSidebarCollapsed && (
          <div className="flex gap-0.5">
            <button className="text-[#7a5c3e] hover:text-[#d4b896] transition-colors p-1 rounded" title="Settings">
              <Settings size={13} />
            </button>
            <button onClick={logout} className="text-[#7a5c3e] hover:text-[#c0392b] transition-colors p-1 rounded" title="Sign Out">
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Collapse Toggle ─────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#23140b] border border-[#3d2415] text-[#9c7a57] hover:text-[#f0dfc8] flex items-center justify-center transition-colors shadow-md z-10"
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

// ─── NavButton ────────────────────────────────────────────────────────────────
function NavButton({
  item, active, collapsed, onClick
}: { item: NavItem; active: boolean; collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "w-full flex items-center rounded-xl transition-all duration-200 text-xs font-medium focus:outline-none relative",
        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "bg-gradient-to-r from-[#442612] to-[#30190b] text-[#faf3ea] border border-[#c49756]/50 shadow-md shadow-black/20"
          : "text-[#8c6e4e] hover:bg-[#28150c] hover:text-[#d4b896]"
      )}
    >
      <span className={cn(
        "flex-shrink-0 transition-transform",
        active ? "text-[#e5be85] scale-105" : "text-[#8c6e4e]"
      )}>
        {item.icon}
      </span>
      {!collapsed && <span className={cn(active && "font-semibold text-[#fcf6ee]")}>{item.label}</span>}
    </button>
  );
}
