import { useApp } from "../context/AppContext";
import Graphique from "../components/Graphique";


export default function Dashboard() {
  const { stats, history, setPage } = useApp();

  const recentSpam = history.filter(h => h.label === "spam").slice(0, 3);
 

  return (
    <div className="page dashboard-page">
      {/* Hero */}
      <div className="dash-hero">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-sub">Vue d'ensemble de votre détecteur SVM</p>
        </div>
        <button className="btn-primary" onClick={() => setPage("messages")}>
          + Nouvelle analyse
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-total">
          <div className="kpi-icon">◈</div>
          <div>
            <p className="kpi-label">Total analysés</p>
            <p className="kpi-value">{stats.total}</p>
          </div>
          <div className="kpi-bar-bg">
            <div className="kpi-bar-fill accent-bar" style={{ width: "100%" }} />
          </div>
        </div>

        <div className="kpi-card kpi-spam">
          <div className="kpi-icon">🚨</div>
          <div>
            <p className="kpi-label">Spam détectés</p>
            <p className="kpi-value spam-col">{stats.spam}</p>
          </div>
          <div className="kpi-bar-bg">
            <div className="kpi-bar-fill spam-bar"
              style={{ width: stats.total ? `${(stats.spam / stats.total) * 100}%` : "0%" }} />
          </div>
        </div>

        <div className="kpi-card kpi-ham">
          <div className="kpi-icon">✅</div>
          <div>
            <p className="kpi-label">Messages légitimes</p>
            <p className="kpi-value ham-col">{stats.ham}</p>
          </div>
          <div className="kpi-bar-bg">
            <div className="kpi-bar-fill ham-bar"
              style={{ width: stats.total ? `${(stats.ham / stats.total) * 100}%` : "0%" }} />
          </div>
        </div>

        <div className="kpi-card kpi-avg">
          <div className="kpi-icon">◎</div>
          <div>
            <p className="kpi-label">Score moyen</p>
            <p className="kpi-value">{stats.avgScore}%</p>
          </div>
          <div className="kpi-bar-bg">
            <div className="kpi-bar-fill accent-bar" style={{ width: `${stats.avgScore}%` }} />
          </div>
        </div>
      </div>

      {/* Graph + Recent spam */}
      <div className="dash-bottom">
        <div className="dash-graph-card">
          <p className="card-section-title">Activité récente</p>
          <Graphique />
        </div>

        <div className="dash-recent-card">
          <p className="card-section-title">Derniers spams</p>
          {recentSpam.length === 0 ? (
            <p className="empty-msg">Aucun spam détecté pour l'instant</p>
          ) : (
            recentSpam.map((h) => (
              <div key={h.id} className="recent-item">
                <span className="h-badge spam">SPAM</span>
                <span className="recent-text">{h.msg.slice(0, 55)}…</span>
                <span className="recent-score spam-col">{h.score}%</span>
              </div>
            ))
          )}
          {stats.total > 0 && (
            <button className="btn-ghost mt-sm" onClick={() => setPage("history")}>
              Voir tout l'historique →
            </button>
          )}
        </div>
      </div>

      {/* Model info */}
      <div className="model-info-card">
        <div className="mi-row">
          <span className="mi-label">Modèle</span>
          <span className="mi-val">LinearSVC + TF-IDF</span>
        </div>
        <div className="mi-row">
          <span className="mi-label">Dataset</span>
          <span className="mi-val">1 000 messages synthétiques FR</span>
        </div>
        <div className="mi-row">
          <span className="mi-label">Kernel</span>
          <span className="mi-val">Linéaire</span>
        </div>
        <div className="mi-row">
          <span className="mi-label">Précision estimée</span>
          <span className="mi-val ham-col">~96%</span>
        </div>
      </div>
    </div>
  );
}
