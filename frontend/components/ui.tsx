"use client";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/lib/types";
import { getRiskBgColor, getRiskBorderColor, getRiskColor } from "@/lib/utils";

// ─── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#5c3d1e] text-[#f5f0eb] hover:bg-[#4a3018] focus:ring-[#5c3d1e] shadow-sm hover:shadow-md active:scale-[0.98]",
    secondary: "bg-[#f5f0eb] text-[#5c3d1e] border border-[#e8d8c4] hover:bg-[#ede5d8] focus:ring-[#c4a882] active:scale-[0.98]",
    ghost: "text-[#5c3d1e] hover:bg-[#ede5d8] focus:ring-[#c4a882]",
    danger: "bg-[#c0392b] text-white hover:bg-[#a93226] focus:ring-[#c0392b] shadow-sm active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Card ──────────────────────────────────────────────────────────────────────
interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ className, children, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#fdf8f3] rounded-xl border border-[#e8d8c4] shadow-sm",
        hover && "card-hover cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── Risk Badge ────────────────────────────────────────────────────────────────
interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

export function RiskBadge({ level, score, size = "md", pulse }: RiskBadgeProps) {
  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg font-medium",
    lg: "px-3 py-1.5 text-sm rounded-lg font-semibold",
  };

  return (
    <span
      className={cn(sizeClasses[size], pulse && "risk-pulse")}
      style={{
        backgroundColor: getRiskBgColor(level),
        color: getRiskColor(level),
        border: `1px solid ${getRiskBorderColor(level)}`,
      }}
    >
      {score !== undefined ? `${level} (${score})` : level}
    </span>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  className?: string;
}

export function MetricCard({ icon, label, value, sub, highlight, className }: MetricCardProps) {
  return (
    <Card className={cn("p-4 flex items-start gap-3 min-w-0", className)}>
      {icon && (
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#f0e8dc] flex items-center justify-center text-[#5c3d1e]">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-[#8c6e4e] font-medium uppercase tracking-wide">{label}</p>
        <p className={cn("text-lg font-bold mt-0.5 truncate", highlight ? "text-[#c0392b]" : "text-[#2c1810]")}>{value}</p>
        {sub && <p className="text-xs text-[#8c6e4e] mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

// ─── Loading Dots ─────────────────────────────────────────────────────────────
export function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#5c3d1e]" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#5c3d1e]" />
      <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#5c3d1e]" />
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && <div className="w-12 h-12 rounded-full bg-[#f0e8dc] flex items-center justify-center text-[#8c6e4e] mb-4">{icon}</div>}
      <h3 className="text-sm font-semibold text-[#2c1810] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#8c6e4e] max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
interface ErrorStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-[#fdf0ef] flex items-center justify-center text-[#c0392b] mb-4 text-xl">⚠</div>
      <h3 className="text-sm font-semibold text-[#c0392b] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#8c6e4e] max-w-xs mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Layer Badge ──────────────────────────────────────────────────────────────
import { getLayerColor, getLayerBgColor } from "@/lib/utils";
import { Layer } from "@/lib/types";

interface LayerBadgeProps { layer: Layer }

export function LayerBadge({ layer }: LayerBadgeProps) {
  const labels: Record<Layer, string> = {
    L0: "L0 (Victim)", L1: "Layer 1", L2: "Layer 2", L3: "Layer 3"
  };
  return (
    <span
      className="px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ backgroundColor: getLayerBgColor(layer), color: getLayerColor(layer), border: `1px solid ${getLayerColor(layer)}33` }}
    >
      {labels[layer]}
    </span>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-[#e8d8c4] bg-[#fdf8f3]">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none",
            activeTab === tab.id
              ? "text-[#5c3d1e]"
              : "text-[#8c6e4e] hover:text-[#5c3d1e]"
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
          {activeTab === tab.id && (
            <span className="tab-active-indicator" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const posClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
    left: "right-full top-1/2 -translate-y-1/2 mr-1",
    right: "left-full top-1/2 -translate-y-1/2 ml-1",
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <span className={cn("absolute z-50 hidden group-hover:block whitespace-nowrap px-2 py-1 text-xs bg-[#2c1810] text-[#f5f0eb] rounded shadow-lg", posClasses[position])}>
        {content}
      </span>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="border-t border-[#e8d8c4] my-2" />;
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 border-t border-[#e8d8c4]" />
      <span className="text-xs text-[#8c6e4e] font-medium uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-[#e8d8c4]" />
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c6e4e] w-4 h-4">
          {icon}
        </div>
      )}
      <input
        className={cn(
          "w-full rounded-lg border border-[#e8d8c4] bg-white text-[#2c1810] text-sm",
          "placeholder:text-[#b0977a] focus:outline-none focus:ring-2 focus:ring-[#c4a882] focus:border-transparent",
          "transition-all duration-200",
          icon ? "pl-9 pr-3 py-2" : "px-3 py-2",
          className
        )}
        {...props}
      />
    </div>
  );
}
