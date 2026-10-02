// SANKET — Zustand Global Store
"use client";

import { create } from "zustand";
import type { InvestigationResponse } from "./types";

type Tab = "graph" | "timeline" | "transactions" | "evidence" | "reports";
type NavSection = "investigation" | "graph" | "timeline" | "transactions" | "evidence" | "reports" | "freeze" | "notice" | "benchmark" | "prompt-defense";

interface SanketStore {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  isAuthenticated: boolean;
  investigatorName: string;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;

  // ─── Judge Mode ───────────────────────────────────────────────────────────
  isJudgeMode: boolean;
  toggleJudgeMode: () => void;

  // ─── Sidebar ──────────────────────────────────────────────────────────────
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeNav: NavSection;
  setActiveNav: (nav: NavSection) => void;

  // ─── Search ───────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;

  // ─── Investigation ────────────────────────────────────────────────────────
  investigation: InvestigationResponse | null;
  isInvestigating: boolean;
  investigationError: string | null;
  investigationStage: string;
  setInvestigation: (data: InvestigationResponse) => void;
  setInvestigating: (v: boolean) => void;
  setInvestigationError: (e: string | null) => void;
  setInvestigationStage: (s: string) => void;
  clearInvestigation: () => void;

  // ─── Active Tab ───────────────────────────────────────────────────────────
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;

  // ─── Graph ────────────────────────────────────────────────────────────────
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;

  // ─── Timeline ────────────────────────────────────────────────────────────
  timelineFilter: { start: string; end: string } | null;
  setTimelineFilter: (f: { start: string; end: string } | null) => void;

  // ─── Selected Evidence Signal ─────────────────────────────────────────────
  activeSignalId: string | null;
  setActiveSignalId: (id: string | null) => void;

  // ─── Selected Transaction ─────────────────────────────────────────────────
  selectedTransactionId: string | null;
  setSelectedTransaction: (id: string | null) => void;
}

const INVESTIGATOR_CREDENTIALS = [
  { id: "shreya@sanket", name: "Shreya", password: "sanket123" },
  { id: "investigator", name: "Investigator", password: "sanket123" },
  { id: "judge", name: "Judge", password: "judge2024" },
];

export const useSanketStore = create<SanketStore>((set, get) => ({
  // Auth
  isAuthenticated: false,
  investigatorName: "Investigator",
  login: async (id, password) => {
    await new Promise(r => setTimeout(r, 800));
    const cred = INVESTIGATOR_CREDENTIALS.find(
      c => (c.id === id || c.id.startsWith(id.split("@")[0])) && c.password === password
    );
    if (cred) {
      set({ isAuthenticated: true, investigatorName: cred.name });
      return true;
    }
    // For demo: any non-empty credentials work
    if (id.trim() && password.trim()) {
      set({ isAuthenticated: true, investigatorName: id.split("@")[0] || "Investigator" });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false, investigation: null }),

  // Judge Mode
  isJudgeMode: false,
  toggleJudgeMode: () => set(s => ({ isJudgeMode: !s.isJudgeMode })),

  // Sidebar
  isSidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  activeNav: "investigation",
  setActiveNav: (nav) => set({ activeNav: nav }),

  // Search
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  recentSearches: ["ACC001235", "KKBK10000000", "ACC009988"],
  addRecentSearch: (q) => {
    const current = get().recentSearches;
    const updated = [q, ...current.filter(s => s !== q)].slice(0, 5);
    set({ recentSearches: updated });
  },

  // Investigation
  investigation: null,
  isInvestigating: false,
  investigationError: null,
  investigationStage: "",
  setInvestigation: (data) => set({ investigation: data, investigationError: null }),
  setInvestigating: (v) => set({ isInvestigating: v }),
  setInvestigationError: (e) => set({ investigationError: e, isInvestigating: false }),
  setInvestigationStage: (s) => set({ investigationStage: s }),
  clearInvestigation: () => set({ investigation: null, investigationError: null, selectedNodeId: null, selectedEdgeId: null }),

  // Tab
  activeTab: "graph",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Graph
  selectedNodeId: null,
  selectedEdgeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  // Timeline
  timelineFilter: null,
  setTimelineFilter: (f) => set({ timelineFilter: f }),

  // Evidence signal
  activeSignalId: null,
  setActiveSignalId: (id) => set({ activeSignalId: id }),

  // Transaction
  selectedTransactionId: null,
  setSelectedTransaction: (id) => set({ selectedTransactionId: id }),
}));
