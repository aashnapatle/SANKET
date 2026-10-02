"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useSanketStore } from "@/lib/store";
import { RiskBadge, EmptyState } from "@/components/ui";
import { formatCurrencyFull, formatTime, formatDate, formatElapsed, cn } from "@/lib/utils";
import type { InvestigationResponse, TimelineEvent } from "@/lib/types";
import { Calendar, Play, Pause, RotateCcw, Clock, ArrowRight, ShieldAlert } from "lucide-react";

interface TimelineViewProps {
  investigation: InvestigationResponse;
}

type PlaybackSpeed = 0.5 | 1 | 2 | 4;

export default function TimelineView({ investigation }: TimelineViewProps) {
  const { timelineFilter, setTimelineFilter } = useSanketStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [currentEventIndex, setCurrentEventIndex] = useState<number | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  const timeline = investigation.timeline;

  const sortedEvents = useMemo(() => {
    if (!timeline || !timeline.length) return [];
    return [...timeline].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [timeline]);

  // Clean up timer, animation and state if investigation changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentEventIndex(null);
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, [investigation.account?.account_id]);

  // Playback timer interval
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round(850 / speed);

    timerRef.current = setInterval(() => {
      setCurrentEventIndex(prev => {
        const nextIdx = (prev === null ? 0 : prev) + 1;
        if (nextIdx >= sortedEvents.length - 1) {
          setIsPlaying(false);
          return sortedEvents.length - 1;
        }
        return nextIdx;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, sortedEvents.length]);

  // Cancel running scroll animation if user manually scrolls with wheel or touch
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cancelAnim = () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
    container.addEventListener("wheel", cancelAnim, { passive: true });
    container.addEventListener("touchmove", cancelAnim, { passive: true });
    return () => {
      cancelAnim();
      container.removeEventListener("wheel", cancelAnim);
      container.removeEventListener("touchmove", cancelAnim);
    };
  }, []);

  // Fast, responsive & silky smooth auto-scroll keeping active event in view
  useEffect(() => {
    if (currentEventIndex === null) return;
    const activeEvent = sortedEvents[currentEventIndex];
    if (!activeEvent) return;

    const el = document.getElementById(`timeline-card-${activeEvent.transaction_id}`);
    const container = scrollContainerRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Position top of active card at ~36% of container height for ideal investigator view
    const idealTopOffset = Math.max(48, containerRect.height * 0.36);
    const delta = (elRect.top - containerRect.top) - idealTopOffset;
    const targetTop = container.scrollTop + delta;
    const clampedTarget = Math.max(0, Math.min(targetTop, container.scrollHeight - container.clientHeight));

    // If already positioned within 4px, skip
    if (Math.abs(clampedTarget - container.scrollTop) < 4) return;

    // Fast, responsive duration scaled to speed (1x: 180ms, 2x: 110ms, 4x: 65ms)
    const duration = Math.max(65, Math.round(180 / speed));
    const startTop = container.scrollTop;
    const distance = clampedTarget - startTop;
    const startTime = performance.now();

    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic: instantaneous start with smooth deceleration into place
      const ease = 1 - Math.pow(1 - progress, 3);
      container.scrollTop = startTop + distance * ease;

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [currentEventIndex, sortedEvents, speed]);

  if (!timeline || !timeline.length) {
    return <EmptyState title="No timeline data" description="No timeline events available for this investigation." />;
  }

  const currentDisplayIndex = currentEventIndex !== null ? currentEventIndex + 1 : sortedEvents.length;
  const progressPercent = Math.round((currentDisplayIndex / sortedEvents.length) * 100);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentEventIndex === null || currentEventIndex >= sortedEvents.length - 1) {
        setCurrentEventIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    setIsPlaying(false);
    setCurrentEventIndex(0);
  };

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

      {/* ─── Playback & Replay Controls ───────────────── */}
      <div className="px-5 py-3 border-b border-[#e2d5c3] bg-white flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          {/* Play / Pause Button */}
          <button
            onClick={handlePlayPause}
            className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#3a1d0b] to-[#261105] text-[#fcf8f2] border border-[#c49756]/60 flex items-center justify-center hover:from-[#2a1306] hover:to-[#1a0a03] transition-all shadow-xs active:scale-95 flex-shrink-0"
            title={isPlaying ? "Pause playback" : "Play timeline replay"}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>

          {/* Replay / Reset Button */}
          <button
            onClick={handleReplay}
            className="w-8 h-8 rounded-xl bg-[#fbf7f0] text-[#5c3d1e] border border-[#e2d5c3] flex items-center justify-center hover:bg-[#f5ecde] hover:text-[#231207] hover:border-[#c49756]/60 transition-all shadow-2xs active:scale-95 flex-shrink-0"
            title="Reset and replay from Event 1"
          >
            <RotateCcw size={12} />
          </button>

          {/* Speed Selector Pills */}
          <div className="flex items-center bg-[#f7f2ea] border border-[#e2d5c3] rounded-lg p-0.5 flex-shrink-0">
            {([0.5, 1, 2, 4] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-mono font-bold rounded-md transition-all",
                  speed === s
                    ? "bg-[#3a1d0b] text-[#fcf8f2] shadow-2xs"
                    : "text-[#8c6e4e] hover:text-[#231207] hover:bg-[#ebdccb]/40"
                )}
                title={`Playback speed ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Progress Slider */}
          <div className="flex-1 relative">
            <input
              type="range"
              min={1}
              max={sortedEvents.length}
              value={currentDisplayIndex}
              onChange={e => {
                const val = Number(e.target.value) - 1;
                setCurrentEventIndex(val);
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#c49756] bg-[#ebdccb]"
              style={{ background: `linear-gradient(to right, #3a1d0b ${progressPercent}%, #e2d5c3 ${progressPercent}%)` }}
            />
          </div>

          {/* Dynamic Counter */}
          <span className="text-xs font-mono font-bold text-[#5c3d1e] min-w-24 text-right flex-shrink-0">
            {currentDisplayIndex} / {sortedEvents.length} events
          </span>
        </div>
      </div>

      {/* ─── Timeline Events Rail ──────────────────────── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        <div className="max-w-3xl mx-auto relative pl-6 sm:pl-8">
          {/* Vertical railway track */}
          <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-[#dfd2be]" />

          <div className="space-y-3">
            {sortedEvents.map((event, i) => {
              const isSelected = selectedEventId === event.transaction_id;
              const isHighRisk = event.risk_level === "High";
              const hasElapsed = event.elapsed_seconds && event.elapsed_seconds > 0;
              const isActive = currentEventIndex !== null && i === currentEventIndex;
              const isFuture = currentEventIndex !== null && i > currentEventIndex;

              return (
                <div
                  key={event.transaction_id}
                  id={`timeline-card-${event.transaction_id}`}
                  className={cn(
                    "relative transition-opacity duration-300",
                    isFuture ? "opacity-45" : "opacity-100"
                  )}
                >
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
                      "absolute -left-6 sm:-left-7 top-3.5 w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-xs border-2 transition-all duration-300",
                      isActive
                        ? isHighRisk
                          ? "bg-[#c0392b] border-white ring-4 ring-[#c0392b]/40 scale-125 shadow-md"
                          : "bg-[#c49756] border-white ring-4 ring-[#c49756]/40 scale-125 shadow-md"
                        : isHighRisk
                        ? "bg-[#c0392b] border-white shadow-[#c0392b]/30"
                        : "bg-[#c49756] border-white shadow-[#c49756]/20"
                    )}>
                      <div className={cn(
                        "rounded-full bg-white transition-all",
                        isActive ? "w-2 h-2 animate-pulse" : "w-1.5 h-1.5"
                      )} />
                    </div>

                    {/* Event Card */}
                    <button
                      onClick={() => {
                        setSelectedEventId(isSelected ? null : event.transaction_id);
                        setCurrentEventIndex(i);
                      }}
                      className={cn(
                        "flex-1 text-left bg-white border rounded-2xl p-4 transition-all duration-300 shadow-xs group",
                        isActive
                          ? "border-[#c49756] ring-2 ring-[#c49756]/40 bg-[#fdf9f2] shadow-md -translate-y-0.5"
                          : isSelected
                          ? "border-[#c49756] shadow-md ring-1 ring-[#c49756]/30 bg-[#faf6f0]"
                          : "border-[#e2d5c3] hover:border-[#c49756]/60 hover:shadow-md hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-bold font-mono transition-colors",
                            isActive ? "text-[#5c3d1e]" : "text-[#231207]"
                          )}>
                            {formatTime(event.timestamp)}
                          </span>
                          <span className="text-[10px] text-[#8c6e4e] font-mono">{event.timestamp.slice(0, 10)}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-[#c49756]/20 text-[#5c3d1e] border border-[#c49756]/30 animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        <RiskBadge level={event.risk_level} size="sm" pulse={isHighRisk || isActive} />
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
