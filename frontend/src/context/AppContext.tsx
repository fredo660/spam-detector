import { createContext, useContext, useState, useEffect, useCallback } from "react";

import type { ReactNode } from "react";
import { supabase } from "../lib/Supabase";

export type Label = "spam" | "ham";

export type Result = {
  label: Label;
  spam_score: number;
  ham_score: number;
  keywords: string[];
  clean_text: string;
};

export type HistoryItem = {
  id: number;
  label: Label;
  msg: string;           // champ local (message original)
  message?: string;      // champ Supabase
  score: number;
  spam_score?: number;
  ham_score?: number;
  keywords?: string[];
  timestamp: Date;
  created_at?: string;   // champ Supabase
};

export type Settings = {
  threshold: number;
  apiUrl: string;
  language: string;
  notifications: boolean;
};

export type RemoteStats = {
  total: number;
  spam: number;
  ham: number;
  avg_score: number;
};

type AppContextType = {
  theme: "light" | "dark";
  toggleTheme: () => void;
  page: string;
  setPage: (p: string) => void;
  msg: string;
  setMsg: (m: string) => void;
  result: Result | null;
  setResult: (r: Result | null) => void;
  history: HistoryItem[];
  setHistory: (h: HistoryItem[]) => void;
  loading: boolean;
  loadingHistory: boolean;
  settings: Settings;
  setSettings: (s: Settings) => void;
  analyze: () => Promise<void>;
  clearAll: () => void;
  resetHistory: () => void;
  fetchHistory: (label?: string, search?: string) => Promise<void>;
  remoteStats: RemoteStats;
  fetchStats: () => Promise<void>;
  stats: { spam: number; ham: number; total: number; avgScore: number };
  user: any;
};

const AppContext = createContext<AppContextType | null>(null);

// ── Helpers localStorage (thème + settings uniquement) ───────
function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function saveLS<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function AppProvider({ children }: { children: ReactNode }) {

  // ── États ────────────────────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark">(
    () => loadLS("spam_theme", "dark")
  );
  const [settings, setSettingsState] = useState<Settings>(
    () => loadLS("spam_settings", {
      threshold: 50,
      apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
      language: "fr",
      notifications: true,
    })
  );
  const [user, setUser] = useState<any>(null);
  const [page, setPage]       = useState("dashboard");
  const [msg, setMsg]         = useState("");
  const [result, setResult]   = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [remoteStats, setRemoteStats] = useState<RemoteStats>({
    total: 0, spam: 0, ham: 0, avg_score: 0,
  });
  

  // ── Sync localStorage (thème + settings) ─────────────
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    saveLS("spam_theme", theme);
  }, [theme]);

  useEffect(() => {
    saveLS("spam_settings", settings);
  }, [settings]);

  // ── Chargement initial depuis Supabase ────────────────
  useEffect(() => {
    fetchHistory();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.apiUrl]);

  // ── Fetch historique depuis Flask/Supabase ────────────
  const fetchHistory = useCallback(async (label?: string, search?: string) => {
    setLoadingHistory(true);
  
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
  
      let url = `${settings.apiUrl}/history?limit=50`;
      if (label) url += `&label=${label}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
  
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();

      // Normaliser le format Supabase → format local
      const items: HistoryItem[] = (data.data || []).map((h: HistoryItem) => ({
        id:        h.id,
        label:     h.label,
        msg:       h.message || "",
        score:     h.label === "spam" ? (h.spam_score ?? 0) : (h.ham_score ?? 0),
        keywords:  h.keywords || [],
        timestamp: new Date(h.created_at || Date.now()),
      }));

      setHistory(items);
    } catch (e) {
      console.error("Erreur fetchHistory :", e);
    } finally {
      setLoadingHistory(false);
    }
  }, [settings.apiUrl]);

  // ── Fetch stats depuis Flask/Supabase ─────────────────
  const fetchStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
  
      const res = await fetch(`${settings.apiUrl}/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      setRemoteStats({
        total:     data.total     ?? 0,
        spam:      data.spam      ?? 0,
        ham:       data.ham       ?? 0,
        avg_score: data.avg_score ?? 0,
      });
    } catch (e) {
      console.error("Erreur fetchStats :", e);
    }
  }, [settings.apiUrl]);

  // ── Analyser ──────────────────────────────────────────
  const analyze = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    const text = msg.trim();
    if (!text) return;
    setLoading(true);
    try {
      const res = await fetch(`${settings.apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });
      const data: Result = await res.json();
      setResult(data);

      // Rafraîchir historique + stats depuis Supabase
      await Promise.all([fetchHistory(), fetchStats()]);

    } catch {
      alert("Erreur de connexion avec le serveur Flask.");
    } finally {
      setLoading(false);
    }
  };

  // ── Effacer l'historique (Supabase + local) ───────────
  const resetHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
  
      await fetch(`${settings.apiUrl}/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setHistory([]);
      setRemoteStats({ total: 0, spam: 0, ham: 0, avg_score: 0 });
  
    } catch (e) {
      console.error("Erreur resetHistory :", e);
    }
  };

  const clearAll    = () => { setMsg(""); setResult(null); };
  const toggleTheme = () => setTheme(p => p === "dark" ? "light" : "dark");
  const setSettings = (s: Settings) => setSettingsState(s);

  // ── Stats locales (session en cours) ─────────────────
  const stats = {
    spam:     remoteStats.spam,
    ham:      remoteStats.ham,
    total:    remoteStats.total,
    avgScore: remoteStats.avg_score,
  };
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
  
      if (error) {
        console.error("Erreur auth user :", error.message);
        setUser(null);
        return;
      }
  
      setUser(data.user ?? null);
    };
  
    getUser();
  
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
  
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return (
    <AppContext.Provider value={{
      theme, toggleTheme, page, setPage, msg, setMsg,
      result, setResult, history, setHistory,
      loading, loadingHistory,
      settings, setSettings,
      analyze, clearAll, resetHistory,
      fetchHistory, remoteStats, fetchStats, stats,
      user,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}