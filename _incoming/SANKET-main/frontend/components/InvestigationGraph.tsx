"use client";
import { useEffect, useRef, useState } from "react";
import { useSanketStore } from "@/lib/store";
import type { Graph } from "@/lib/types";
import { ZoomIn, ZoomOut, Maximize2, Search } from "lucide-react";

// ─── Legend ────────────────────────────────────────────────────────────────────
const LEGEND = [
  { label: "Victim (L0)", color: "#c0392b" },
  { label: "Layer 1",     color: "#d4793a" },
  { label: "Layer 2",     color: "#7c5a3a" },
  { label: "Layer 3",     color: "#6b5c7a" },
];

interface InvestigationGraphProps {
  graph: Graph;
}

export default function InvestigationGraph({ graph }: InvestigationGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef        = useRef<any>(null);
  const [searchNode, setSearchNode] = useState("");
  const [isLoaded,   setIsLoaded]   = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsLoaded(false);

    const initCy = async () => {
      // Dynamic import keeps Cytoscape out of the SSR bundle
      const cytoscape = (await import("cytoscape")).default;

      // Bail out if unmounted before dynamic import completed
      if (isCancelled || !containerRef.current) return;

      const elements = [
        ...graph.nodes.map(n => ({
          data: {
            id:                n.id,
            label:             n.label || n.id,
            layer:             n.layer,
            risk_score:        n.risk_score,
            risk_level:        n.risk_level,
            bank:              n.bank,
            transaction_count: n.transaction_count,
            total_volume:      n.total_volume,
          },
          classes: `layer-${n.layer}`,
        })),
        ...graph.edges.map(e => ({
          data: {
            id:                e.id,
            source:            e.source,
            target:            e.target,
            transaction_count: e.transaction_count,
            total_amount:      e.total_amount,
          },
        })),
      ];

      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          // ── Base node style ──
          {
            selector: "node",
            style: {
              "background-color": "#8c6e4e",
              "border-color":     "#5c3d1e",
              "border-width":     2,
              "width":            30,
              "height":           30,
              "label":            (ele: any) => (ele.data("label") || ele.data("id")),
              "text-valign":      "bottom",
              "text-halign":      "center",
              "font-size":        9,
              "color":            "#2c1810",
              "text-margin-y":    4,
              "text-wrap":        "wrap",
              "text-max-width":   "80px",
              "overlay-opacity":  0,
            },
          },
          // ── Layer classes ──
          {
            selector: "node.layer-L0",
            style: {
              "background-color": "#c0392b",
              "border-color":     "#8c1c13",
              "border-width":     3,
              "width":            55,
              "height":           55,
            },
          },
          {
            selector: "node.layer-L1",
            style: {
              "background-color": "#d4793a",
              "border-color":     "#a85a22",
              "border-width":     2,
              "width":            42,
              "height":           42,
            },
          },
          {
            selector: "node.layer-L2",
            style: {
              "background-color": "#7c5a3a",
              "border-color":     "#5a3d22",
              "border-width":     2,
              "width":            36,
              "height":           36,
            },
          },
          {
            selector: "node.layer-L3",
            style: {
              "background-color": "#6b5c7a",
              "border-color":     "#4a3d5a",
              "border-width":     2,
              "width":            30,
              "height":           30,
            },
          },
          // ── Interaction states ──
          {
            selector: "node:selected",
            style: {
              "border-color":    "#c17f3a",
              "border-width":    3,
              "background-opacity": 1,
              "overlay-color":   "#c17f3a",
              "overlay-padding": 6,
              "overlay-opacity": 0.1,
            },
          },
          {
            selector: "node.highlighted",
            style: {
              "border-color":  "#c17f3a",
              "border-width":  2.5,
              "opacity":       1,
            },
          },
          {
            selector: "node.dimmed",
            style: { "opacity": 0.25 },
          },
          // ── Edges ──
          {
            selector: "edge",
            style: {
              "width":               (ele: any) => Math.min(1.5 + (ele.data("transaction_count") || 1) * 0.3, 4),
              "line-color":          "#c4a882",
              "target-arrow-color":  "#c4a882",
              "target-arrow-shape":  "triangle",
              "curve-style":         "bezier",
              "opacity":             0.7,
              "overlay-opacity":     0,
            },
          },
          {
            selector: "edge:selected",
            style: {
              "line-color":         "#c17f3a",
              "target-arrow-color": "#c17f3a",
              "width":              3,
              "opacity":            1,
            },
          },
          {
            selector: "edge.highlighted",
            style: {
              "line-color": "#c17f3a",
              "opacity":    1,
            },
          },
          {
            selector: "edge.dimmed",
            style: { "opacity": 0.1 },
          },
        ],
        layout: {
          name:             "cose",
          idealEdgeLength:  120,
          nodeOverlap:      20,
          refresh:          20,
          fit:              true,
          padding:          30,
          randomize:        false,
          componentSpacing: 100,
          nodeRepulsion:    800000,
          edgeElasticity:   100,
          nestingFactor:    5,
          gravity:          80,
          numIter:          1000,
          initialTemp:      200,
          coolingFactor:    0.95,
          minTemp:          1,
          animate:          false,
        },
        userZoomingEnabled:  true,
        userPanningEnabled:  true,
        boxSelectionEnabled: false,
        autounselectify:     false,
        minZoom: 0.2,
        maxZoom: 3,
      });

      // Bail if unmounted during synchronous setup
      if (isCancelled) {
        try { cy.destroy(); } catch {}
        return;
      }

      // ── Robust defensive lifecycle wrapper on Cytoscape instance ──────────
      // Prevents internal Cytoscape "Cannot read properties of null (reading 'notify')"
      // or "reading 'isHeadless'" errors if any deferred event fires during unmount/destruction
      const cyAny = cy as any;
      const origEndBatch = cyAny.endBatch.bind(cyAny);
      cyAny.endBatch = function () {
        if (cyAny.destroyed() || !cyAny.renderer?.()) {
          if (cyAny._private) {
            cyAny._private.batchCount = 0;
            cyAny._private.batchNotifications = {};
          }
          return cyAny;
        }
        return origEndBatch();
      };

      const origNotify = cyAny.notify?.bind(cyAny);
      if (origNotify) {
        cyAny.notify = function (event: any, eles: any) {
          if (cyAny.destroyed() || !cyAny.renderer?.()) {
            return cyAny;
          }
          return origNotify(event, eles);
        };
      }

      const origHeadless = cyAny.headless?.bind(cyAny);
      if (origHeadless) {
        cyAny.headless = function () {
          if (cyAny.destroyed() || !cyAny._private?.renderer) {
            return true;
          }
          return origHeadless();
        };
      }

      cyRef.current = cy;
      setIsLoaded(true);

      // ── Node click ────────────────────────────────────────────────────────
      cy.on("tap", "node", (evt: any) => {
        if (isCancelled || cy.destroyed()) return;
        const nodeId = evt.target.id();
        useSanketStore.getState().setSelectedNode(nodeId);
        cy.elements().addClass("dimmed");
        evt.target.neighborhood().removeClass("dimmed").addClass("highlighted");
        evt.target.removeClass("dimmed").addClass("highlighted");
      });

      // ── Edge click ────────────────────────────────────────────────────────
      cy.on("tap", "edge", (evt: any) => {
        if (isCancelled || cy.destroyed()) return;
        useSanketStore.getState().setSelectedEdge(evt.target.id());
        cy.elements().removeClass("dimmed highlighted");
        evt.target.addClass("highlighted");
        evt.target.source().addClass("highlighted");
        evt.target.target().addClass("highlighted");
      });

      // ── Background tap — deselect ─────────────────────────────────────────
      cy.on("tap", (evt: any) => {
        if (isCancelled || cy.destroyed()) return;
        if (evt.target === cy) {
          cy.elements().removeClass("dimmed highlighted");
          useSanketStore.getState().setSelectedNode(null);
          useSanketStore.getState().setSelectedEdge(null);
        }
      });

      // ── Hover — border-width only ─────────────────────────────────────────
      cy.on("mouseover", "node", (evt: any) => {
        if (isCancelled || cy.destroyed()) return;
        evt.target.style("border-width", 4);
      });
      cy.on("mouseout", "node", (evt: any) => {
        if (isCancelled || cy.destroyed()) return;
        const layer = evt.target.data("layer");
        evt.target.style("border-width", layer === "L0" ? 3 : 2);
      });
    };

    initCy();

    return () => {
      isCancelled = true;
      if (cyRef.current) {
        const cy = cyRef.current;
        cyRef.current = null;
        try {
          if (cy._private) {
            cy._private.batchCount = 0;
            cy._private.batchNotifications = {};
          }
          cy.stop();
          cy.removeAllListeners();
          cy.destroy();
        } catch {}
      }
      setIsLoaded(false);
    };
  }, [graph]);

  // ─── Node search ───────────────────────────────────────────────────────────
  const handleSearchNode = () => {
    if (!cyRef.current || !searchNode.trim()) return;
    const node = cyRef.current.getElementById(searchNode.trim());
    if (node.length > 0) {
      cyRef.current.animate({ center: { eles: node }, zoom: 1.8 }, { duration: 400 });
      node.select();
      useSanketStore.getState().setSelectedNode(searchNode.trim());
    }
  };

  // ─── Zoom / fit controls ───────────────────────────────────────────────────
  const zoomIn  = () => {
    if (!cyRef.current) return;
    const w = containerRef.current?.clientWidth  ?? 0;
    const h = containerRef.current?.clientHeight ?? 0;
    cyRef.current.zoom({ level: cyRef.current.zoom() * 1.25, renderedPosition: { x: w / 2, y: h / 2 } });
  };
  const zoomOut = () => {
    if (!cyRef.current) return;
    const w = containerRef.current?.clientWidth  ?? 0;
    const h = containerRef.current?.clientHeight ?? 0;
    cyRef.current.zoom({ level: cyRef.current.zoom() * 0.8,  renderedPosition: { x: w / 2, y: h / 2 } });
  };
  const fitView = () => cyRef.current?.fit(undefined, 30);

  return (
    <div className="flex flex-col h-full bg-[#faf6f1]">
      {/* ─── Toolbar ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e8d8c4] bg-[#fdf8f3] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#2c1810]">Investigation Graph</span>
          <div className="flex items-center gap-3 ml-3">
            {LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-[#8c6e4e]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-[#e8d8c4] rounded-lg px-2 py-1">
            <Search size={12} className="text-[#8c6e4e]" />
            <input
              value={searchNode}
              onChange={e => setSearchNode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearchNode()}
              placeholder="Search node..."
              className="text-xs w-28 border-none outline-none bg-transparent text-[#2c1810] placeholder:text-[#b0977a]"
            />
          </div>
          <button onClick={fitView} className="p-1.5 rounded-lg border border-[#e8d8c4] text-[#5c3d1e] hover:bg-[#ede5d8] transition-colors" title="Fit to screen">
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* ─── Graph area ──────────────────────────────── */}
      <div className="flex-1 relative min-h-0">
        <div ref={containerRef} className="w-full h-full cytoscape-container" />

        {/* Zoom controls */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <button onClick={zoomIn}  className="w-7 h-7 bg-white border border-[#e8d8c4] rounded-lg text-[#5c3d1e] hover:bg-[#ede5d8] flex items-center justify-center shadow-sm transition-colors">
            <ZoomIn  size={13} />
          </button>
          <button onClick={zoomOut} className="w-7 h-7 bg-white border border-[#e8d8c4] rounded-lg text-[#5c3d1e] hover:bg-[#ede5d8] flex items-center justify-center shadow-sm transition-colors">
            <ZoomOut size={13} />
          </button>
        </div>

        {/* Loading overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#faf6f1] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#c4a882] border-t-[#5c3d1e] rounded-full animate-spin" />
              <span className="text-sm text-[#8c6e4e]">Building graph...</span>
            </div>
          </div>
        )}

        {/* Node/edge count badge */}
        {isLoaded && (
          <div className="absolute bottom-3 left-3 bg-white/90 border border-[#e8d8c4] rounded-lg px-2.5 py-1 text-xs text-[#8c6e4e] shadow-sm">
            {graph.nodes.length} nodes · {graph.edges.length} edges
          </div>
        )}
      </div>
    </div>
  );
}
