"use client";
import { cn } from "@/lib/utils";
import { RiskLevel, Layer } from "@/lib/types";
import { getRiskBgColor, getRiskBorderColor, getRiskColor, getLayerColor, getLayerBgColor } from "@/lib/utils";

// ─── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary: "bg-gradient-to-r from-[#3a1d0b] to-[#261105] text-[#fcf8f2] border border-[#c49756]/60 hover:from-[#2a1306] hover:to-[#1a0a03] hover:border-[#c49756] hover:shadow-md hover:shadow-[#c49756]/20 focus:ring-[#c49756] active:scale-[0.98] shadow-2xs",
    secondary: "bg-white text-[#4d321c] border border-[#dfd2be] hover:bg-[#faf4ec] hover:border-[#c49756] hover:text-[#231207] focus:ring-[#c4a882] active:scale-[0.98] shadow-2xs",
    ghost: "text-[#5c3d1e] hover:bg-[#ede5d8]/70 hover:text-[#2c1810] focus:ring-[#c4a882] active:scale-[0.98]",
    danger: "bg-[#c0392b] text-white hover:bg-[#a93226] border border-[#a93226] focus:ring-[#c0392b] shadow-2xs active:scale-[0.98]",
    gold: "bg-gradient-to-r from-[#b88a44] to-[#8c5621] text-white border border-[#e5c48b]/60 hover:from-[#a07435] hover:to-[#784618] hover:shadow-md hover:shadow-[#b88a44]/25 focus:ring-[#c49756] active:scale-[0.98] shadow-2xs",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-base gap-2.5",
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
        "bg-white/95 rounded-2xl border border-[#e2d5c3] shadow-xs transition-all duration-200",
        hover && "hover:border-[#c49756]/50 hover:shadow-md hover:shadow-[#381e0d]/5 hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]",
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
    sm: "px-1.5 py-0.5 text-[10px] rounded-md font-semibold",
    md: "px-2.5 py-1 text-xs rounded-lg font-bold",
    lg: "px-3 py-1.5 text-sm rounded-lg font-bold",
  };

  return (
    <span
      className={cn(sizeClasses[size], pulse && "risk-pulse", "inline-flex items-center gap-1 uppercase tracking-wide")}
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
    <Card className={cn("p-4 flex items-start gap-3 min-w-0 hover:border-[#c49756]/40", className)}>
      {icon && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] shadow-2xs">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-[#8c6e4e] font-semibold uppercase tracking-wider">{label}</p>
        <p className={cn("text-lg font-black mt-0.5 truncate tracking-tight", highlight ? "text-[#c0392b]" : "text-[#231207]")}>{value}</p>
        {sub && <p className="text-xs text-[#8c6e4e] mt-0.5 font-medium">{sub}</p>}
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
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#7d5e42] mb-3 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-[#231207] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#8c6e4e] max-w-sm leading-relaxed">{description}</p>}
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
      <div className="w-12 h-12 rounded-2xl bg-[#fdf0ef] border border-[#f5b8b4] flex items-center justify-center text-[#c0392b] mb-3 text-xl font-bold shadow-2xs">
        ⚠
      </div>
      <h3 className="text-sm font-bold text-[#c0392b] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#8c6e4e] max-w-sm mt-1 leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Layer Badge ──────────────────────────────────────────────────────────────
interface LayerBadgeProps { layer: Layer }

export function LayerBadge({ layer }: LayerBadgeProps) {
  const labels: Record<Layer, string> = {
    L0: "L0 (Victim)", L1: "Layer 1", L2: "Layer 2", L3: "Layer 3"
  };
  return (
    <span
      className="px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider"
      style={{ backgroundColor: getLayerBgColor(layer), color: getLayerColor(layer), border: `1px solid ${getLayerColor(layer)}40` }}
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
    <div className="flex border-b border-[#e2d5c3] bg-[#fdfaf6] px-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none",
            activeTab === tab.id
              ? "text-[#361a0b]"
              : "text-[#8c6e4e] hover:text-[#361a0b]"
          )}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c49756] rounded-t shadow-xs" />
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
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <span className={cn("absolute z-50 hidden group-hover:block whitespace-nowrap px-2.5 py-1 text-xs bg-[#1c0f08] text-[#f7ebd7] border border-[#c49756]/40 rounded-lg shadow-lg font-medium", posClasses[position])}>
        {content}
      </span>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="border-t border-[#e2d5c3] my-2" />;
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 border-t border-[#e2d5c3]" />
      <span className="text-[10px] text-[#8c6e4e] font-bold uppercase tracking-widest">{label}</span>
      <div className="flex-1 border-t border-[#e2d5c3]" />
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
          "w-full rounded-xl border border-[#dfd2be] bg-white text-[#231207] text-sm font-medium",
          "placeholder:text-[#a58e76] focus:outline-none focus:ring-2 focus:ring-[#c49756]/30 focus:border-[#c49756]",
          "transition-all duration-200 shadow-2xs",
          icon ? "pl-9 pr-3 py-2" : "px-3 py-2",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, badge, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between pb-4 border-b border-[#e2d5c3] flex-shrink-0 gap-4", className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-extrabold text-[#231207] tracking-tight">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-[#8c6e4e] mt-0.5 leading-relaxed font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
