import { useState } from "react";
import { useApp } from "../context/AppContext";

type Filter = "all" | "spam" | "ham";

export default function History() {
  const { history, resetHistory, setMsg, setPage } = useApp();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = history.filter((h) => {
    const matchFilter = filter === "all" || h.label === filter;
    const matchSearch = h.msg.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const formatTime = (d: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const analyzeAgain = (msg: string) => {
    setMsg(msg);
    setPage("messages");
  };

  return (
    <div className="page history-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Historique</h2>
          <p className="page-sub">{history.length} messages analysés au total</p>
        </div>
        {history.length > 0 && (
          <button className="btn-danger" onClick={resetHistory}>
            Effacer tout
          </button>
        )}
      </div>

      {/* Filters + Search */}
      {history.length > 0 && (
        <div className="history-controls">
          <div className="filter-tabs">
            {(["all", "spam", "ham"] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""} ${f !== "all" ? f : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? `Tous (${history.length})`
                  : f === "spam" ? `Spam (${history.filter(h => h.label === "spam").length})`
                  : `Ham (${history.filter(h => h.label === "ham").length})`}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            placeholder="Rechercher dans l'historique..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* List */}
      {history.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◷</span>
          <p>Aucune analyse effectuée</p>
          <button className="btn-primary" onClick={() => setPage("messages")}>
            Analyser un message
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◷</span>
          <p>Aucun résultat pour "{search}"</p>
        </div>
      ) : (
        <div className="history-table">
          <div className="ht-header">
            <span>Label</span>
            <span>Message</span>
            <span>Score</span>
            <span>Heure</span>
            <span></span>
          </div>
          {filtered.map((h) => (
            <div key={h.id} className="ht-row">
              <span className={`h-badge ${h.label}`}>{h.label.toUpperCase()}</span>
              <span className="ht-msg" title={h.msg}>{h.msg.slice(0, 60)}{h.msg.length > 60 ? "…" : ""}</span>
              <span className={`ht-score ${h.label}-col`}>{h.score}%</span>
              <span className="ht-time">{formatTime(h.timestamp)}</span>
              <button className="ht-action" onClick={() => analyzeAgain(h.msg)} title="Ré-analyser">↺</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
