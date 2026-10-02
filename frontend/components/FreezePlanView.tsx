"use client";
import { useState, useRef, useCallback } from "react";
import { Card, Button, RiskBadge, LayerBadge } from "@/components/ui";
import {
  Snowflake, AlertTriangle, Eye, FileText, Landmark,
  ShieldAlert, CheckCircle2, ArrowRight, Scale, Info,
  FileSearch, Shield, X, Copy, Download, Check, Loader2
} from "lucide-react";
import type { InvestigationResponse } from "@/lib/types";
import { getRiskColor, formatCurrencyFull, cn } from "@/lib/utils";
import { useSanketStore } from "@/lib/store";
import { fetchFreezeNotice, generateReport } from "@/lib/api";

interface FreezePlanViewProps {
  investigation?: InvestigationResponse | null;
}

// ─── Network Node Data Contract ──────────────────────────────────────────────
interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label: string;
  code: string;
  layer: string;
  bank: string;
  isSquare?: boolean;
  baseRadius: number;
}

interface NetworkEdge {
  from: string;
  to: string;
  curvature: number; // bezier offset
}

const NETWORK_NODES: NetworkNode[] = [
  { id: "N_VICTIM", x: 430, y: 175, label: "ORIGIN / VICTIM", code: "SBIN-ORIGIN", layer: "L0", bank: "SBI", isSquare: true, baseRadius: 10 },
  { id: "N_L1_A",   x: 540, y: 105, label: "MULE L1-A",      code: "AXIS-4091",   layer: "L1", bank: "AXIS", baseRadius: 6.5 },
  { id: "N_L1_B",   x: 565, y: 225, label: "MULE L1-B",      code: "HDFC-8821",   layer: "L1", bank: "HDFC", baseRadius: 7 },
  { id: "N_L2_A",   x: 685, y: 70,  label: "LAYER L2-A",     code: "ICIC-1049",   layer: "L2", bank: "ICICI", baseRadius: 6 },
  { id: "N_L2_B",   x: 720, y: 165, label: "DISPERSAL HUB",  code: "KKBK-9903",   layer: "L2", bank: "KOTAK", isSquare: true, baseRadius: 9 },
  { id: "N_L2_C",   x: 665, y: 260, label: "VPA AGGREGATOR", code: "IPOS-5512",   layer: "L2", bank: "IPPB", baseRadius: 5.5 },
  { id: "N_L3_A",   x: 845, y: 95,  label: "CASH-OUT L3",    code: "AIRP-3301",   layer: "L3", bank: "AIRTEL", baseRadius: 6.5 },
  { id: "N_L3_B",   x: 875, y: 220, label: "GATEWAY L3",     code: "PYTM-7719",   layer: "L3", bank: "PAYTM", baseRadius: 6.5 },
  { id: "N_L3_C",   x: 975, y: 145, label: "AGGREGATOR L3",  code: "PUNB-2219",   layer: "L3", bank: "PNB", baseRadius: 6.5 },
  { id: "N_TERM",   x: 1080, y: 170, label: "TERMINAL SINK", code: "BARB-0084",   layer: "L3", bank: "BOB", isSquare: true, baseRadius: 9 },
];

const NETWORK_EDGES: NetworkEdge[] = [
  { from: "N_VICTIM", to: "N_L1_A", curvature: -25 },
  { from: "N_VICTIM", to: "N_L1_B", curvature: 20 },
  { from: "N_L1_A",   to: "N_L2_A", curvature: -15 },
  { from: "N_L1_A",   to: "N_L2_B", curvature: 18 },
  { from: "N_L1_B",   to: "N_L2_B", curvature: -15 },
  { from: "N_L1_B",   to: "N_L2_C", curvature: 22 },
  { from: "N_L2_A",   to: "N_L3_A", curvature: -12 },
  { from: "N_L2_B",   to: "N_L3_A", curvature: -20 },
  { from: "N_L2_B",   to: "N_L3_B", curvature: 25 },
  { from: "N_L2_C",   to: "N_L3_B", curvature: -10 },
  { from: "N_L3_A",   to: "N_L3_C", curvature: 15 },
  { from: "N_L3_B",   to: "N_L3_C", curvature: -18 },
  { from: "N_L3_C",   to: "N_TERM", curvature: 12 },
];

// ─── Dynamic Interactive SVG Network ─────────────────────────────────────────
function InteractiveNetwork({
  hoveredNode,
  mousePos,
  onNodeHover,
}: {
  hoveredNode: string | null;
  mousePos: { x: number; y: number } | null;
  onNodeHover: (id: string | null) => void;
}) {
  // Connected nodes map for hover cascade
  const connectedNodeIds = new Set<string>();
  if (hoveredNode) {
    connectedNodeIds.add(hoveredNode);
    NETWORK_EDGES.forEach(e => {
      if (e.from === hoveredNode) connectedNodeIds.add(e.to);
      if (e.to === hoveredNode) connectedNodeIds.add(e.from);
    });
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 1180 310"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Amber / Bronze Node Glow Filter */}
        <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#b45309" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="centerMapGlow" cx="62%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c49756" stopOpacity="0.12" />
          <stop offset="70%" stopColor="#92400e" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#1a0c04" stopOpacity="0" />
        </radialGradient>

        {/* Technical Dotted Grid Pattern */}
        <pattern id="techGrid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.65" fill="#c49756" fillOpacity="0.18" />
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#c49756" strokeWidth="0.3" strokeOpacity="0.05" />
        </pattern>
      </defs>

      {/* Central Ambient Glow */}
      <rect x="0" y="0" width="1180" height="310" fill="url(#centerMapGlow)" />

      {/* Background Technical Grid */}
      <rect x="0" y="0" width="1180" height="310" fill="url(#techGrid)" />

      {/* ─── Geographic / Interstate Financial Lat-Long Markers ──────────────── */}
      <g opacity="0.32" stroke="#c49756" strokeWidth="0.4" strokeDasharray="3 7">
        <line x1="360" y1="60" x2="1140" y2="60" />
        <line x1="360" y1="150" x2="1140" y2="150" />
        <line x1="360" y1="240" x2="1140" y2="240" />
        <line x1="500" y1="20" x2="500" y2="290" />
        <line x1="720" y1="20" x2="720" y2="290" />
        <line x1="940" y1="20" x2="940" y2="290" />
        <line x1="1100" y1="20" x2="1100" y2="290" />
      </g>

      {/* Faint Indian Subcontinent Geo Coordinates HUD */}
      <g fill="#c49756" fontSize="6.5" fontFamily="monospace" opacity="0.45">
        <text x="370" y="55">GRID_REF: 28.61° N (DELHI)</text>
        <text x="370" y="145">GRID_REF: 19.07° N (MUMBAI)</text>
        <text x="370" y="235">GRID_REF: 12.97° N (BLR)</text>
        <text x="960" y="295">SYS_AUTH: MHA-14C · SEC-102 ACTIVE</text>
      </g>

      {/* ─── HUD Forensic Workflow Badges (Top Right Area) ────────────────── */}
      <g opacity="0.8">
        <g transform="translate(730, 24)">
          <rect x="0" y="0" width="88" height="13" rx="2.5" fill="#1f1106" stroke="#c49756" strokeWidth="0.6" strokeOpacity="0.45" />
          <text x="5" y="9.5" fill="#d97706" fontSize="6.8" fontFamily="monospace" fontWeight="bold">→ TRANSACTION FLOW</text>
        </g>
        <g transform="translate(830, 24)">
          <rect x="0" y="0" width="94" height="13" rx="2.5" fill="#1f1106" stroke="#c49756" strokeWidth="0.6" strokeOpacity="0.45" />
          <text x="5" y="9.5" fill="#d97706" fontSize="6.8" fontFamily="monospace" fontWeight="bold">✓ RISK IDENTIFICATION</text>
        </g>
        <g transform="translate(936, 24)">
          <rect x="0" y="0" width="84" height="13" rx="2.5" fill="#1f1106" stroke="#c49756" strokeWidth="0.6" strokeOpacity="0.45" />
          <text x="5" y="9.5" fill="#d97706" fontSize="6.8" fontFamily="monospace" fontWeight="bold">✓ NETWORK MAPPING</text>
        </g>
        <g transform="translate(1032, 24)">
          <rect x="0" y="0" width="102" height="13" rx="2.5" fill="#1f1106" stroke="#c49756" strokeWidth="0.6" strokeOpacity="0.45" />
          <text x="5" y="9.5" fill="#d97706" fontSize="6.8" fontFamily="monospace" fontWeight="bold">✓ INVESTIGATION SUPPORT</text>
        </g>
      </g>

      {/* ─── Network Edges (Curved Flow Paths) ──────────────────────────────── */}
      <g>
        {NETWORK_EDGES.map((edge, idx) => {
          const fromNode = NETWORK_NODES.find(n => n.id === edge.from);
          const toNode = NETWORK_NODES.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const isConnected =
            hoveredNode &&
            (edge.from === hoveredNode || edge.to === hoveredNode);

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2 + edge.curvature;
          const pathD = `M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`;

          return (
            <g key={`edge-${idx}`}>
              {/* Base edge path */}
              <path
                d={pathD}
                fill="none"
                stroke={isConnected ? "#fbbf24" : "#c49756"}
                strokeWidth={isConnected ? 2.2 : 0.95}
                strokeOpacity={isConnected ? 0.95 : 0.38}
                strokeDasharray={isConnected ? "6 4" : "4 5"}
                filter={isConnected ? "url(#amberGlow)" : undefined}
                className="transition-all duration-300"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-20"
                  dur={isConnected ? "1.8s" : "4.5s"}
                  repeatCount="indefinite"
                />
              </path>

              {/* Glowing signal particle moving along connection */}
              <circle r={isConnected ? 2.5 : 1.6} fill={isConnected ? "#ffffff" : "#f59e0b"}>
                <animateMotion
                  path={pathD}
                  dur={isConnected ? "2.2s" : "5s"}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </g>

      {/* ─── Network Nodes ─────────────────────────────────────────────────── */}
      <g>
        {NETWORK_NODES.map(node => {
          const isDirectlyHovered = hoveredNode === node.id;
          const isAdjacent = hoveredNode && connectedNodeIds.has(node.id);
          const isHighlighted = isDirectlyHovered || isAdjacent;

          const fillCol = isDirectlyHovered
            ? "#fef08a"
            : isAdjacent
            ? "#fcd34d"
            : node.layer === "L0"
            ? "#f59e0b"
            : node.layer === "L3"
            ? "#ef4444"
            : "#c49756";

          return (
            <g key={node.id} className="transition-all duration-300">
              {/* Ambient radial halo */}
              {(isHighlighted || node.isSquare) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.baseRadius * (isDirectlyHovered ? 2.6 : 1.9)}
                  fill="url(#haloGlow)"
                  filter="url(#amberGlow)"
                  opacity={isDirectlyHovered ? 1 : 0.65}
                />
              )}

              {/* Pulsing ring around victim or hovered nodes */}
              {(isDirectlyHovered || node.layer === "L0") && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.baseRadius + 5}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="0.8"
                  opacity="0.8"
                >
                  <animate
                    attributeName="r"
                    values={`${node.baseRadius + 2};${node.baseRadius + 14}`}
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.85;0"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Square (Anchor) vs Circle (Intermediary) Render */}
              {node.isSquare ? (
                <rect
                  x={node.x - (node.baseRadius + (isDirectlyHovered ? 2 : 0))}
                  y={node.y - (node.baseRadius + (isDirectlyHovered ? 2 : 0))}
                  width={(node.baseRadius + (isDirectlyHovered ? 2 : 0)) * 2}
                  height={(node.baseRadius + (isDirectlyHovered ? 2 : 0)) * 2}
                  rx="3.5"
                  fill="#1c0f05"
                  stroke={isHighlighted ? "#fbbf24" : "#c49756"}
                  strokeWidth={isDirectlyHovered ? 2.4 : 1.4}
                  filter={isHighlighted ? "url(#amberGlow)" : undefined}
                />
              ) : (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.baseRadius + (isDirectlyHovered ? 2.5 : 0)}
                  fill="#1c0f05"
                  stroke={isHighlighted ? "#fbbf24" : "#c49756"}
                  strokeWidth={isDirectlyHovered ? 2.2 : 1.3}
                  filter={isHighlighted ? "url(#amberGlow)" : undefined}
                />
              )}

              {/* Inner Core */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.baseRadius * 0.45}
                fill={fillCol}
              />

              {/* Node Technical Label (static faint background marking) */}
              <text
                x={node.x}
                y={node.y + node.baseRadius + 11}
                textAnchor="middle"
                fill="#8a6e4d"
                fontSize="6.8"
                fontFamily="monospace"
                opacity={0.55}
              >
                {node.code}
              </text>
            </g>
          );
        })}
      </g>

      {/* Subtle Star Diamond at Bottom Right */}
      <polygon
        points="1145,275 1152,267 1159,275 1152,283"
        fill="#c49756"
        opacity="0.45"
      >
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite" />
      </polygon>
    </svg>
  );
}

// ─── Main FreezePlanView Component ───────────────────────────────────────────
export default function FreezePlanView({ investigation }: FreezePlanViewProps) {
  const { setActiveNav, setActiveTab, setSelectedNode } = useSanketStore();

  const [preparedNoticeId, setPreparedNoticeId] = useState<string | null>(null);

  // Mouse hover state for interactive network banner
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Section 102 CrPC Modal state
  const [activeNoticeAccount, setActiveNoticeAccount] = useState<string | null>(null);
  const [noticeData, setNoticeData] = useState<{
    account: string;
    layer: string;
    mule_risk_score: number;
    case_id: string;
    recommended_action: string;
    notice_text: string;
  } | null>(null);
  const [loadingNotice, setLoadingNotice] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hero banner notice modal state (Section 91 CrPC / Section 94 BNSS)
  const [heroNoticeType, setHeroNoticeType] = useState<"crpc91" | "bnss94" | null>(null);
  const [heroNoticeData, setHeroNoticeData] = useState<{
    account: string;
    layer: string;
    mule_risk_score: number;
    case_id: string;
    recommended_action: string;
    notice_text: string;
  } | null>(null);
  const [loadingHeroNotice, setLoadingHeroNotice] = useState(false);
  const [downloadingHeroNotice, setDownloadingHeroNotice] = useState(false);
  const [heroCopied, setHeroCopied] = useState(false);

  const accounts = investigation?.graph.nodes ?? [];

  const freezeCandidates = accounts
    .filter(n => n.risk_score >= 50)
    .sort((a, b) => b.risk_score - a.risk_score);

  // Mouse move handler over panoramic banner
  const handleBannerMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    // Map to SVG coordinates (1180 x 310)
    const svgX = relX * 1180;
    const svgY = relY * 310;
    setMousePos({ x: svgX, y: svgY });

    // Find nearest node within distance threshold
    let nearestNodeId: string | null = null;
    let minDistance = 110; // detection radius

    for (const node of NETWORK_NODES) {
      const dist = Math.hypot(node.x - svgX, node.y - svgY);
      if (dist < minDistance) {
        minDistance = dist;
        nearestNodeId = node.id;
      }
    }

    setHoveredNodeId(nearestNodeId);
  }, []);

  const handleBannerMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    setMousePos(null);
  }, []);

  // ─── Button Handlers ──────────────────────────────────────────────────────
  const handleReviewLedger = (accId: string) => {
    setSelectedNode(accId);
    setActiveNav("investigation");
    setActiveTab("transactions");
  };

  const handleDraftNotice = async (accId: string) => {
    setPreparedNoticeId(accId);
    setActiveNoticeAccount(accId);
    setLoadingNotice(true);
    setNoticeData(null);
    try {
      const data = await fetchFreezeNotice(accId);
      setNoticeData(data);
    } catch (err) {
      console.error("Failed to fetch freeze notice:", err);
    } finally {
      setLoadingNotice(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeNoticeAccount) return;
    setDownloadingPdf(true);
    try {
      await generateReport(activeNoticeAccount, "investigator");
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyNoticeText = () => {
    if (noticeData?.notice_text) {
      navigator.clipboard.writeText(noticeData.notice_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Hero Banner Notice Handlers (Sec 91 CrPC / Sec 94 BNSS) ─────────────
  const handleOpenHeroNotice = async (type: "crpc91" | "bnss94") => {
    setHeroNoticeType(type);
    setLoadingHeroNotice(true);
    setHeroNoticeData(null);

    // Resolve target account ID from current investigation, freeze candidates, or graph accounts
    const targetAccountId =
      investigation?.account?.account_id ||
      (freezeCandidates.length > 0 ? freezeCandidates[0].id : "") ||
      (accounts.length > 0 ? accounts[0].id : "");

    if (!targetAccountId || !targetAccountId.trim()) {
      console.warn("No valid target account ID available for notice requisition.");
      setLoadingHeroNotice(false);
      return;
    }

    try {
      const data = await fetchFreezeNotice(targetAccountId);
      setHeroNoticeData(data);
    } catch (err) {
      console.error("Failed to fetch hero statutory notice:", err);
      setHeroNoticeData(null);
    } finally {
      setLoadingHeroNotice(false);
    }
  };

  const handleHeroCopyText = () => {
    if (heroNoticeData?.notice_text) {
      navigator.clipboard.writeText(heroNoticeData.notice_text);
      setHeroCopied(true);
      setTimeout(() => setHeroCopied(false), 2000);
    }
  };

  const handleHeroDownloadPdf = async () => {
    const targetAccountId =
      heroNoticeData?.account ||
      investigation?.account?.account_id ||
      (freezeCandidates.length > 0 ? freezeCandidates[0].id : "") ||
      (accounts.length > 0 ? accounts[0].id : "");

    if (!targetAccountId || !targetAccountId.trim()) return;
    setDownloadingHeroNotice(true);
    try {
      await generateReport(targetAccountId, "investigator");
    } catch (err) {
      console.error("Failed to download hero notice PDF:", err);
    } finally {
      setDownloadingHeroNotice(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-5 md:px-6 lg:px-8 bg-[#fdfaf6]">
      {/* ─── FULL-WIDTH CONTAINER — Spans Main Content Area ────────────────── */}
      <div className="w-full max-w-[1620px] mx-auto space-y-5">

        {/* ─── LARGE PANORAMIC RECTANGULAR HERO BANNER ──────────────────────── */}
        <div
          ref={bannerRef}
          onMouseMove={handleBannerMouseMove}
          onMouseLeave={handleBannerMouseLeave}
          className="group relative w-full rounded-2xl overflow-hidden border transition-all duration-300 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #130a04 0%, #201107 35%, #180c05 65%, #0e0602 100%)",
            borderColor: hoveredNodeId ? "rgba(217, 119, 6, 0.55)" : "rgba(180, 83, 9, 0.32)",
            boxShadow: hoveredNodeId
              ? "0 10px 30px -5px rgba(26, 12, 4, 0.6), 0 0 24px rgba(217, 119, 6, 0.12)"
              : "0 8px 24px -4px rgba(20, 10, 4, 0.45)",
            minHeight: "260px",
          }}
        >
          {/* Subtle Ambient Radial Glow & Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 18% 45%, rgba(196, 151, 86, 0.12) 0%, transparent 55%), radial-gradient(circle at 82% 50%, rgba(146, 64, 14, 0.15) 0%, transparent 60%)",
            }}
          />

          {/* Interactive Financial Transaction Network Visualization */}
          <InteractiveNetwork
            hoveredNode={hoveredNodeId}
            mousePos={mousePos}
            onNodeHover={setHoveredNodeId}
          />

          {/* Foreground Content Layer — Left Oriented, Allowing Network to Span Center/Right */}
          <div className="relative z-10 flex flex-col justify-center min-h-[260px] p-6 sm:p-8 lg:p-10">
            <div className="max-w-md lg:max-w-lg min-w-0">
              {/* Category / Investigation Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                <p
                  className="text-[11px] font-bold tracking-widest uppercase"
                  style={{ color: "#c49756", letterSpacing: "0.22em" }}
                >
                  Digital Investigations
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2c1507] text-[#e5d5be] border border-[#5c3112]">
                  FORENSIC OPS
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white mb-3">
                Suspect Account{" "}
                <span
                  style={{
                    color: "#f59e0b",
                    textShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  Freeze Plan
                </span>
              </h1>

              {/* Narrative description */}
              <p className="text-xs sm:text-sm text-[#d4be9f] mb-6 leading-relaxed max-w-md">
                Algorithmic fund-preservation protocol under Section 102 CrPC &amp; Section 94 BNSS. Automated multi-hop dissipation risk analysis across banking layers.
              </p>

              {/* Statutory Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenHeroNotice("crpc91")}
                  className="group/btn relative flex items-center gap-2 text-xs font-semibold rounded-xl px-4.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm"
                  style={{
                    background: "rgba(35, 18, 7, 0.92)",
                    border: "1px solid rgba(196, 151, 86, 0.55)",
                    color: "#fef3c7",
                  }}
                  title="Open Section 91 CrPC Statutory Notice preview"
                >
                  <FileSearch size={14} className="text-[#f59e0b] group-hover/btn:scale-110 transition-transform" />
                  <span>Section 91 CrPC</span>
                  <ArrowRight size={12} className="text-[#c49756] group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenHeroNotice("bnss94")}
                  className="group/btn relative flex items-center gap-2 text-xs font-semibold rounded-xl px-4.5 py-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-sm"
                  style={{
                    background: "rgba(35, 18, 7, 0.92)",
                    border: "1px solid rgba(196, 151, 86, 0.55)",
                    color: "#fef3c7",
                  }}
                  title="Bharatiya Nagarik Suraksha Sanhita (BNSS) Statutory Notice"
                >
                  <Shield size={14} className="text-[#f59e0b] group-hover/btn:scale-110 transition-transform" />
                  <span>Section 94 BNSS</span>
                  <ArrowRight size={12} className="text-[#c49756] group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── STATUTORY WARNING BANNER ─────────────────────────────────────── */}
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4.5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-[#fef3c7] border border-[#fde68a] flex items-center justify-center text-[#d97706] flex-shrink-0 mt-0.5">
            <Scale size={16} />
          </div>
          <div className="text-xs text-[#92400e] leading-relaxed">
            <div className="font-bold text-[#78350f] mb-0.5 flex items-center gap-2">
              <span>Judicial &amp; Statutory Requisition Notice</span>
              <span className="text-[10px] font-normal opacity-80">(Section 102 Code of Criminal Procedure, 1973)</span>
            </div>
            Freezing of bank accounts or UPI VPA handles is a statutory power vested in designated Police Officers.
            SANKET generates prioritized forensic evidence dossiers to support lawful Section 102 CrPC notices to bank nodal officers.
            Review each node's evidentiary score before generating official seizure orders.
          </div>
        </div>

        {/* ─── FREEZE CANDIDATE CARDS ───────────────────────────────────────── */}
        {freezeCandidates.length === 0 ? (
          <Card className="p-12 text-center border-[#e2d5c3] bg-white">
            <Snowflake size={32} className="text-[#8c6e4e] mx-auto mb-3 opacity-60" />
            <div className="text-sm font-bold text-[#231207]">No Accounts Flagged for Freeze</div>
            <div className="text-xs text-[#8c6e4e] max-w-sm mx-auto mt-1 leading-relaxed">
              {!investigation
                ? "Initiate an investigation on an account to calculate multi-hop risk scores and generate freeze recommendations."
                : "None of the investigated nodes exceed the critical risk threshold (score ≥ 50) requiring urgent debit freeze."}
            </div>
          </Card>
        ) : (
          <div className="space-y-3.5">
            {freezeCandidates.map(acc => {
              const isVictim = acc.layer === "L0";
              const riskColor = getRiskColor(acc.risk_level);
              const isNoticePrepared = preparedNoticeId === acc.id;

              return (
                <Card
                  key={acc.id}
                  className={cn(
                    "p-5 border transition-all duration-200 shadow-2xs hover:shadow-xs",
                    acc.risk_level === "High" ? "border-[#fca5a5]/80 bg-white" : "border-[#e2d5c3] bg-white"
                  )}
                >
                  <div className="flex flex-col md:flex-row items-start gap-4">
                    {/* Bank / Layer Icon */}
                    <div className="w-11 h-11 rounded-xl bg-[#f5ecde] border border-[#ebdccb] flex items-center justify-center text-[#5c3d1e] flex-shrink-0 shadow-2xs">
                      <Landmark size={20} />
                    </div>

                    {/* Account Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono font-bold text-sm text-[#231207] bg-[#fbf7f0] px-2 py-0.5 rounded border border-[#e2d5c3]">
                          {acc.id}
                        </span>
                        <RiskBadge level={acc.risk_level} score={acc.risk_score} />
                        <LayerBadge layer={acc.layer} />
                        {isVictim && (
                          <span className="text-[10px] font-bold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] rounded-full px-2 py-0.5">
                            ORIGIN / VICTIM
                          </span>
                        )}
                        {acc.bank && (
                          <span className="text-xs text-[#8c6e4e] font-medium">
                            · {acc.bank}
                          </span>
                        )}
                      </div>

                      {/* Risk progress indicator */}
                      <div className="space-y-1 mb-2.5 max-w-md">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#8c6e4e] font-medium">Dissipation &amp; Mule Risk Index</span>
                          <span className="font-bold font-mono" style={{ color: riskColor }}>
                            {acc.risk_score} / 100
                          </span>
                        </div>
                        <div className="h-2 bg-[#f0e4d2] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${acc.risk_score}%`, backgroundColor: riskColor }}
                          />
                        </div>
                      </div>

                      {/* Forensic Justification */}
                      <div className="text-xs text-[#6b4e33] bg-[#faf6f0] p-2.5 rounded-xl border border-[#ebdccb]">
                        <span className="font-bold text-[#3d2310]">Evidentiary Rationale: </span>
                        {acc.risk_level === "High"
                          ? "High risk index indicating high velocity fund funneling. Recommended immediate debit freeze to prevent dissipation to external crypto/ATM cash-out channels."
                          : "Intermediary layering node with strong directional fund passthrough. Retain for immediate monitor and Section 91 information order."}
                      </div>

                      {isNoticePrepared && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 rounded-lg">
                          <CheckCircle2 size={13} className="text-[#16a34a]" />
                          <span>Draft Notice SANKET/102/{acc.id} prepared for SP review.</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col flex-wrap gap-1.5 w-full sm:w-auto flex-shrink-0 pt-2 md:pt-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 justify-center cursor-pointer text-xs"
                        onClick={() => handleOpenHeroNotice("crpc91")}
                      >
                        <FileSearch size={12} className="text-[#d97706]" /> Sec 91 CrPC
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 justify-center cursor-pointer text-xs"
                        onClick={() => handleOpenHeroNotice("bnss94")}
                      >
                        <Shield size={12} className="text-[#d97706]" /> Sec 94 BNSS
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5 justify-center cursor-pointer text-xs"
                        onClick={() => handleDraftNotice(acc.id)}
                      >
                        <FileText size={12} /> Sec 102 Order
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ─── TECHNICAL ENDPOINT NOTE ───────────────────────────────────────── */}
        <div className="bg-[#fbf7f0] border border-[#e8d7c1] rounded-2xl p-4.5 text-xs text-[#6b4e33] shadow-2xs">
          <div className="font-bold text-[#3d2310] mb-1 flex items-center gap-2">
            <Info size={14} className="text-[#b48c48]" />
            <span>FastAPI Backend Freeze Plan Integration</span>
          </div>
          <p className="leading-relaxed">
            In live law enforcement deployments, freeze orders are dynamically synchronized with state cybercrime police nodal hubs via <code className="bg-white border border-[#dfd2be] px-1.5 py-0.5 rounded font-mono text-[#5c3d1e]">GET /api/freeze-plan/{"{account_id}"}</code> and <code className="bg-white border border-[#dfd2be] px-1.5 py-0.5 rounded font-mono text-[#5c3d1e]">GET /api/notice/{"{account_id}"}</code>.
          </p>
        </div>
      </div>

      {/* ─── Section 102 CrPC Seizure Notice Requisition Modal ───────────────────────── */}
      {activeNoticeAccount && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#fdfaf6] border-2 border-[#e2d5c3] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#231207] text-[#fdfaf6] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Scale size={18} className="text-[#d97706]" />
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#d97706]">Sec 102 CrPC Statutory Order</div>
                  <h3 className="font-bold text-base tracking-tight">Debit Freeze Requisition Notice</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveNoticeAccount(null)}
                className="text-[#a88d75] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingNotice ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-sm text-[#8c6e4e]">
                  <Loader2 size={24} className="animate-spin text-[#5c3d1e]" />
                  <span>Generating Section 102 CrPC Statutory Requisition from DuckDB backend...</span>
                </div>
              ) : noticeData ? (
                <>
                  <div className="bg-white border border-[#e2d5c3] rounded-xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#8c6e4e]">Target Account: </span>
                      <span className="font-mono font-bold text-[#231207]">{noticeData.account}</span>
                    </div>
                    <div>
                      <span className="text-[#8c6e4e]">Case Ref: </span>
                      <span className="font-mono font-semibold text-[#5c3d1e]">{noticeData.case_id}</span>
                    </div>
                    <div>
                      <span className="text-[#8c6e4e]">Action: </span>
                      <span className="font-bold text-[#b91c1c] bg-[#fef2f2] px-2 py-0.5 rounded border border-[#fecaca]">
                        {noticeData.recommended_action}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e2d5c3] rounded-xl p-5 shadow-inner font-mono text-xs text-[#231207] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {noticeData.notice_text}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-[#b91c1c]">
                  Failed to load notice text. Please ensure backend is active.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f5ecde] border-t border-[#e2d5c3] px-6 py-3.5 flex items-center justify-between gap-3">
              <div className="text-xs text-[#8c6e4e]">
                Issued by SANKET Cyber Crime Investigation Unit
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyNoticeText}
                  disabled={!noticeData}
                  className="gap-1.5 cursor-pointer"
                >
                  {copied ? <Check size={13} className="text-[#16a34a]" /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy Text"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadPdf}
                  loading={downloadingPdf}
                  disabled={!noticeData}
                  className="gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  Download PDF Order
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveNoticeAccount(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── HERO NOTICE MODAL (Sec 91 CrPC / Sec 94 BNSS) ──────────────── */}
      {heroNoticeType !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#fdfaf6] border-2 border-[#e2d5c3] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#231207] text-[#fdfaf6] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {heroNoticeType === "crpc91"
                  ? <FileSearch size={18} className="text-[#d97706]" />
                  : <Shield size={18} className="text-[#d97706]" />
                }
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#d97706]">
                    {heroNoticeType === "crpc91"
                      ? "Sec 91 Code of Criminal Procedure"
                      : "Sec 94 Bharatiya Nagarik Suraksha Sanhita"}
                  </div>
                  <h3 className="font-bold text-base tracking-tight">
                    {heroNoticeType === "crpc91"
                      ? "Section 91 CrPC — Notice to Produce Documents"
                      : "Section 94 BNSS — Search & Seizure Requisition"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => { setHeroNoticeType(null); setHeroNoticeData(null); }}
                className="text-[#a88d75] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {loadingHeroNotice ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-sm text-[#8c6e4e]">
                  <Loader2 size={24} className="animate-spin text-[#5c3d1e]" />
                  <span>
                    {heroNoticeType === "crpc91"
                      ? "Generating Section 91 CrPC Notice from backend..."
                      : "Generating Section 94 BNSS Notice from backend..."}
                  </span>
                </div>
              ) : heroNoticeData ? (
                <>
                  <div className="bg-white border border-[#e2d5c3] rounded-xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#8c6e4e]">Target Account: </span>
                      <span className="font-mono font-bold text-[#231207]">{heroNoticeData.account}</span>
                    </div>
                    <div>
                      <span className="text-[#8c6e4e]">Case Ref: </span>
                      <span className="font-mono font-semibold text-[#5c3d1e]">{heroNoticeData.case_id}</span>
                    </div>
                    <div>
                      <span className="text-[#8c6e4e]">Action: </span>
                      <span className="font-bold text-[#b91c1c] bg-[#fef2f2] px-2 py-0.5 rounded border border-[#fecaca]">
                        {heroNoticeData.recommended_action}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-[#e2d5c3] rounded-xl p-5 shadow-inner font-mono text-xs text-[#231207] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {heroNoticeData.notice_text}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm text-[#b91c1c]">
                  Failed to load notice. Please ensure the backend is active and an account has been investigated.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f5ecde] border-t border-[#e2d5c3] px-6 py-3.5 flex items-center justify-between gap-3">
              <div className="text-xs text-[#8c6e4e]">
                {heroNoticeType === "crpc91"
                  ? "Section 91 CrPC — Issued by SANKET Cyber Crime Investigation Unit"
                  : "Section 94 BNSS — Issued by SANKET Cyber Crime Investigation Unit"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleHeroCopyText}
                  disabled={!heroNoticeData}
                  className="gap-1.5 cursor-pointer"
                >
                  {heroCopied ? <Check size={13} className="text-[#16a34a]" /> : <Copy size={13} />}
                  {heroCopied ? "Copied!" : "Copy Text"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleHeroDownloadPdf}
                  loading={downloadingHeroNotice}
                  disabled={!heroNoticeData}
                  className="gap-1.5 cursor-pointer"
                >
                  <Download size={13} />
                  Download PDF
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setHeroNoticeType(null); setHeroNoticeData(null); }}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
