"use client";
import { useSanketStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Search, LayoutDashboard, GitBranch, Clock, List, Shield, FileText,
  Snowflake, FileSearch, BarChart3, Lock, ChevronLeft, ChevronRight,
  Settings, LogOut, User
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
  const { isSidebarCollapsed, toggleSidebar, activeNav, setActiveNav, investigatorName, logout } = useSanketStore();

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#2c1810] text-[#d4b896] transition-all duration-300 ease-in-out flex-shrink-0 relative",
        "border-r border-[#3d2518]",
        isSidebarCollapsed ? "w-14" : "w-56"
      )}
    >
      {/* ─── Branding ────────────────────────────────────── */}
      <div className={cn(
        "flex items-center py-5 px-4 border-b border-[#3d2518] flex-shrink-0",
        isSidebarCollapsed ? "justify-center" : "gap-3"
      )}>
        {/* Logo mark */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#c17f3a] flex items-center justify-center font-bold text-white text-sm">
          S
        </div>
        {!isSidebarCollapsed && (
          <div>
            <div className="text-[#f0e0c8] font-bold text-base tracking-wide leading-none">SANKET</div>
            <div className="text-[#8c6e4e] text-[10px] mt-0.5 leading-tight">Financial Investigation<br />Console</div>
          </div>
        )}
      </div>

      {/* ─── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {/* Main items */}
        {NAV_ITEMS.filter(n => n.section === "main").map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeNav === item.id}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveNav(item.id as any)}
          />
        ))}

        {/* Tools divider */}
        {!isSidebarCollapsed && (
          <div className="pt-4 pb-1 px-2">
            <span className="text-[10px] text-[#5c3d2a] uppercase tracking-widest font-medium">
              Investigative Tools
            </span>
          </div>
        )}
        {isSidebarCollapsed && <div className="border-t border-[#3d2518] my-2 mx-1" />}

        {/* Tool items */}
        {NAV_ITEMS.filter(n => n.section === "tools").map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeNav === item.id}
            collapsed={isSidebarCollapsed}
            onClick={() => setActiveNav(item.id as any)}
          />
        ))}
      </nav>

      {/* ─── Brand tagline (collapsed: hidden) ───────────── */}
      {!isSidebarCollapsed && (
        <div className="px-4 py-3 border-t border-b border-[#3d2518]">
          <div className="text-[9px] text-[#5c3d2a] uppercase tracking-widest leading-relaxed space-y-0.5">
            <div>TRACE · ANALYSE</div>
            <div>DISRUPT · PROTECT</div>
          </div>
        </div>
      )}

      {/* ─── Investigator Profile ─────────────────────────── */}
      <div className={cn(
        "flex items-center gap-2 p-3 border-t border-[#3d2518]",
        isSidebarCollapsed && "justify-center"
      )}>
        <div className="w-7 h-7 rounded-full bg-[#c17f3a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {investigatorName.charAt(0).toUpperCase()}
        </div>
        {!isSidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[#d4b896] text-xs font-medium truncate">{investigatorName}</div>
            <div className="text-[#5c3d2a] text-[10px]">Investigator</div>
          </div>
        )}
        {!isSidebarCollapsed && (
          <div className="flex gap-1">
            <button className="text-[#5c3d2a] hover:text-[#d4b896] transition-colors p-1 rounded">
              <Settings size={12} />
            </button>
            <button onClick={logout} className="text-[#5c3d2a] hover:text-[#c0392b] transition-colors p-1 rounded" title="Logout">
              <LogOut size={12} />
            </button>
          </div>
        )}
      </div>

      {/* ─── Collapse Toggle ─────────────────────────────── */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#2c1810] border border-[#3d2518] text-[#8c6e4e] hover:text-[#d4b896] flex items-center justify-center transition-colors shadow-md z-10"
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
        "w-full flex items-center rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none",
        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "bg-[#5c3d1e] text-[#f0e0c8] shadow-sm"
          : "text-[#8c6e4e] hover:bg-[#3d2518] hover:text-[#d4b896]"
      )}
    >
      <span className={cn("flex-shrink-0 transition-transform", active && "scale-110")}>
        {item.icon}
      </span>
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}
