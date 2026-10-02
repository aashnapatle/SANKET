"use client";
import { useState, useMemo } from "react";
import { useSanketStore } from "@/lib/store";
import { RiskBadge, EmptyState } from "@/components/ui";
import { formatCurrencyFull, formatTime, formatDate, formatElapsed, cn } from "@/lib/utils";
import type { InvestigationResponse, TimelineEvent } from "@/lib/types";
import { Calendar, Play, Pause, Clock } from "lucide-react";

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

  const firstTs = new Date(sortedEvents[0].timestamp).getTime();
  const lastTs = new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime();
  const timeRange = lastTs - firstTs || 1;

  // Filter by slider
  const visibleCount = Math.max(1, Math.ceil((sliderValue / 100) * sortedEvents.length));
  const visibleEvents = sortedEvents.slice(0, visibleCount);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ─── Toolbar ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e8d8c4] bg-[#fdf8f3] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Clock size={14} className="text-[#5c3d1e]" />
          <span className="text-sm font-semibold text-[#2c1810]">Transaction Timeline</span>
          <span className="text-xs text-[#8c6e4e]">
            {formatDate(sortedEvents[0].timestamp)} – {formatDate(sortedEvents[sortedEvents.length - 1].timestamp)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-[#8c6e4e]" />
          <span className="text-xs text-[#8c6e4e]">
            {sortedEvents[0].timestamp.slice(0, 10)} – {sortedEvents[sortedEvents.length - 1].timestamp.slice(0, 10)}
          </span>
        </div>
      </div>

      {/* ─── Time Slider ──────────────────────────────── */}
      <div className="px-4 py-3 border-b border-[#e8d8c4] bg-[#fdf8f3] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(v => !v)}
            className="w-7 h-7 rounded-full bg-[#5c3d1e] text-white flex items-center justify-center hover:bg-[#4a3018] transition-colors flex-shrink-0"
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={1}
              max={100}
              value={sliderValue}
              onChange={e => setSliderValue(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #5c3d1e ${sliderValue}%, #e8d8c4 ${sliderValue}%)` }}
            />
          </div>
          <span className="text-xs text-[#8c6e4e] w-16 text-right flex-shrink-0">
            {visibleCount}/{sortedEvents.length} events
          </span>
        </div>
      </div>

      {/* ─── Timeline Events ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#e8d8c4]" />

          <div className="space-y-0">
            {visibleEvents.map((event, i) => {
              const isSelected = selectedEventId === event.transaction_id;
              const isHighRisk = event.risk_level === "High";
              const hasElapsed = event.elapsed_seconds && event.elapsed_seconds > 0;

              return (
                <div key={event.transaction_id}>
                  {/* Elapsed time indicator */}
                  {hasElapsed && i > 0 && (
                    <div className="flex items-center ml-8 py-1">
                      <div className="h-4 border-l-2 border-dashed border-[#c4a882] ml-[-4px]" />
                      <span className="text-[10px] text-[#8c6e4e] ml-3 bg-[#f5f0eb] px-1.5 py-0.5 rounded-full">
                        +{formatElapsed(event.elapsed_seconds)} elapsed
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedEventId(isSelected ? null : event.transaction_id)}
                    className={cn(
                      "w-full flex items-start gap-3 py-2 text-left group transition-colors rounded-lg px-1",
                      isSelected ? "bg-[#f5f0eb]" : "hover:bg-[#faf6f1]"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "relative flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center z-10 mt-0.5",
                      isHighRisk ? "bg-[#c0392b]" : "bg-[#c4a882]"
                    )}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#2c1810]">
                          {formatTime(event.timestamp)}
                        </span>
                        <RiskBadge level={event.risk_level} size="sm" />
                      </div>
                      <div className="text-xs text-[#5c3d1e] font-medium mt-0.5 truncate">
                        {event.from_account} → {event.to_account}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-[#2c1810]">
                          {formatCurrencyFull(event.amount)}
                        </span>
                        <span className="text-xs text-[#8c6e4e]">{event.payment_mode}</span>
                        {event.flags?.map(f => (
                          <span key={f} className="text-[10px] bg-[#fef3ee] text-[#d4793a] border border-[#f5d5b8] px-1.5 py-0.5 rounded-full">
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>

                      {/* Expanded details */}
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-[#e8d8c4] text-xs text-[#8c6e4e] fade-in">
                          <div>TX: <span className="font-mono text-[#2c1810]">{event.transaction_id}</span></div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
