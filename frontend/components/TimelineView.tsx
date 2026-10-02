"use client";
import { useState, useMemo } from "react";
import { useSanketStore } from "@/lib/store";
import { RiskBadge, EmptyState } from "@/components/ui";
import { formatCurrencyFull, formatTime, formatDate, formatElapsed, cn } from "@/lib/utils";
import type { InvestigationResponse, TimelineEvent } from "@/lib/types";
import { Calendar, Play, Pause, Clock, ArrowRight, ShieldAlert } from "lucide-react";

interface TimelineViewProps {
  investigation: InvestigationResponse;
}

export default function TimelineView({ investigation }: TimelineViewProps) {
  const { timelineFilter, setTimelineFilter } = useSanketStore();
  const [sliderValue, setSliderValue] = useState(100);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const timeline = investigation.timeline;
  if (!timeline.length) {
    return <EmptyState title="No timeline data" description="No timeline events available for this investigation." />;
  }

  const sortedEvents = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Filter by slider
  const visibleCount = Math.max(1, Math.ceil((sliderValue / 100) * sortedEvents.length));
  const visibleEvents = sortedEvents.slice(0, visibleCount);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#fdfaf6] select-none">
      {/* ─── Toolbar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#e2d5c3] bg-[#fbf7f0] flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <Clock size={15} className="text-[#5c3d1e]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#231207]">Forensic Money Flow Timeline</span>
          <span className="text-xs text-[#8c6e4e] font-medium hidden sm:inline">
            ({formatDate(sortedEvents[0].timestamp)} – {formatDate(sortedEvents[sortedEvents.length - 1].timestamp)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={13} className="text-[#8c6e4e]" />
          <span className="text-xs font-mono font-semibold text-[#8c6e4e]">
            {sortedEvents[0].timestamp.slice(0, 10)}
          </span>
        </div>
      </div>

      {/* ─── Time Slider ──────────────────────────────── */}
      <div className="px-5 py-3 border-b border-[#e2d5c3] bg-white flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3.5 max-w-4xl mx-auto">
          <button
            onClick={() => setIsPlaying(v => !v)}
            className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#3a1d0b] to-[#261105] text-[#fcf8f2] border border-[#c49756]/60 flex items-center justify-center hover:from-[#2a1306] hover:to-[#1a0a03] transition-all shadow-xs active:scale-95 flex-shrink-0"
            title={isPlaying ? "Pause playback" : "Play timeline"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
          <div className="flex-1 relative">
            <input
              type="range"
              min={1}
              max={100}
              value={sliderValue}
              onChange={e => setSliderValue(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#c49756] bg-[#ebdccb]"
              style={{ background: `linear-gradient(to right, #3a1d0b ${sliderValue}%, #e2d5c3 ${sliderValue}%)` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-[#5c3d1e] w-24 text-right flex-shrink-0">
            {visibleCount} / {sortedEvents.length} events
          </span>
        </div>
      </div>

      {/* ─── Timeline Events Rail ──────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        <div className="max-w-3xl mx-auto relative pl-6 sm:pl-8">
          {/* Vertical railway track */}
          <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-[#dfd2be]" />

          <div className="space-y-3">
            {visibleEvents.map((event, i) => {
              const isSelected = selectedEventId === event.transaction_id;
              const isHighRisk = event.risk_level === "High";
              const hasElapsed = event.elapsed_seconds && event.elapsed_seconds > 0;

              return (
                <div key={event.transaction_id} className="relative fade-in">
                  {/* Elapsed time pill */}
                  {hasElapsed && i > 0 && (
                    <div className="flex items-center -ml-5 sm:-ml-6 py-1">
                      <div className="w-2.5 h-0.5 bg-[#c49756]" />
                      <span className="text-[10px] text-[#8c6e4e] font-mono ml-2 bg-[#f5ecde] border border-[#ebdccb] px-2 py-0.5 rounded-full font-bold shadow-2xs">
                        +{formatElapsed(event.elapsed_seconds)} elapsed
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Node Dot on rail */}
                    <div className={cn(
                      "absolute -left-6 sm:-left-7 top-3.5 w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-xs border-2 transition-all",
                      isHighRisk
                        ? "bg-[#c0392b] border-white shadow-[#c0392b]/30"
                        : "bg-[#c49756] border-white shadow-[#c49756]/20"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>

                    {/* Event Card */}
                    <button
                      onClick={() => setSelectedEventId(isSelected ? null : event.transaction_id)}
                      className={cn(
                        "flex-1 text-left bg-white border rounded-2xl p-4 transition-all duration-200 shadow-xs group",
                        isSelected
                          ? "border-[#c49756] shadow-md ring-1 ring-[#c49756]/30 bg-[#faf6f0]"
                          : "border-[#e2d5c3] hover:border-[#c49756]/60 hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#231207] font-mono">
                            {formatTime(event.timestamp)}
                          </span>
                          <span className="text-[10px] text-[#8c6e4e] font-mono">{event.timestamp.slice(0, 10)}</span>
                        </div>
                        <RiskBadge level={event.risk_level} size="sm" pulse={isHighRisk} />
                      </div>

                      {/* Transfer path */}
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#3a1d0b] truncate my-1">
                        <span>{event.from_account}</span>
                        <ArrowRight size={12} className="text-[#c49756] flex-shrink-0" />
                        <span>{event.to_account}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-[#f0e8dc]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#231207]">
                            {formatCurrencyFull(event.amount)}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#f5ecde] text-[#5c3d1e] text-[10px] font-bold uppercase">
                            {event.payment_mode}
                          </span>
                        </div>

                        {event.flags && event.flags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.flags.map(f => (
                              <span key={f} className="text-[10px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] px-2 py-0.5 rounded-full font-bold">
                                {f.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expanded Forensic Detail */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[#ebdccb] text-xs text-[#664b33] space-y-1 fade-in font-mono">
                          <div>Transaction ID: <span className="font-bold text-[#231207]">{event.transaction_id}</span></div>
                          <div className="text-[11px] text-[#8c6e4e]">Audited via DuckDB memory engine · Verified cryptographic trail</div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
