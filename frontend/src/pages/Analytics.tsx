import { useApp } from "../context/AppContext";
import Graphique from "../components/Graphique";

export default function Analytics() {
  const { history, stats } = useApp();

  const spamRate = stats.total > 0
    ? Math.round((stats.spam / stats.total) * 100)
    : 0;

  // Distribution des scores par tranche
  const buckets = [
    { label: "0–20%",  count: history.filter(h => h.score <= 20).length },
    { label: "21–40%", count: history.filter(h => h.score > 20 && h.score <= 40).length },
    { label: "41–60%", count: history.filter(h => h.score > 40 && h.score <= 60).length },
    { label: "61–80%", count: history.filter(h => h.score > 60 && h.score <= 80).length },
    { label: "81–100%",count: history.filter(h => h.score > 80).length },
  ];
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  // Top keywords spam
  const allKw = history
    .filter(h => h.label === "spam")
    .flatMap(() => [] as string[]); // placeholder — on n'a pas les kw dans history
  void allKw;

  return (
    <div className="page analytics-page">
      <h2 className="page-title">Analytics</h2>
      <p className="page-sub">Statistiques détaillées de votre session</p>

      {history.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◻</span>
          <p>Analysez des messages pour voir les statistiques</p>
        </div>
      ) : (
        <>
          {/* Taux spam */}
          <div className="analytics-hero">
            <div className="ah-ring-wrap">
              <svg viewBox="0 0 120 120" className="ah-ring-svg">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="var(--spam-r)" strokeWidth="10"
                  strokeDasharray={`${spamRate * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray .8s ease" }}
                />
              </svg>
              <div className="ah-ring-label">
                <span className="ah-pct spam-col">{spamRate}%</span>
                <span className="ah-sub">taux spam</span>
              </div>
            </div>

            <div className="ah-stats">
              <div className="ah-stat">
                <p className="ah-stat-val">{stats.total}</p>
                <p className="ah-stat-lbl">Messages analysés</p>
              </div>
              <div className="ah-stat">
                <p className="ah-stat-val spam-col">{stats.spam}</p>
                <p className="ah-stat-lbl">Spam détectés</p>
              </div>
              <div className="ah-stat">
                <p className="ah-stat-val ham-col">{stats.ham}</p>
                <p className="ah-stat-lbl">Messages légitimes</p>
              </div>
              <div className="ah-stat">
                <p className="ah-stat-val">{stats.avgScore}%</p>
                <p className="ah-stat-lbl">Score moyen</p>
              </div>
            </div>
          </div>

          {/* Distribution des scores */}
          <div className="analytics-card">
            <p className="card-section-title">Distribution des scores de confiance</p>
            <div className="dist-bars">
              {buckets.map((b, i) => (
                <div key={i} className="dist-col">
                  <div className="dist-bar-wrap">
                    <div
                      className="dist-bar"
                      style={{ height: `${(b.count / maxBucket) * 100}%` }}
                    />
                  </div>
                  <span className="dist-count">{b.count}</span>
                  <span className="dist-label">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Graphique activité */}
          <div className="analytics-card">
            <p className="card-section-title">Historique des analyses</p>
            <Graphique />
          </div>

          {/* Précision modèle */}
          <div className="analytics-card model-perf">
            <p className="card-section-title">Performance du modèle SVM</p>
            <div className="perf-grid">
              {[
                { label: "Accuracy",  val: "96%",   color: "var(--accent)" },
                { label: "Précision", val: "95%",   color: "var(--spam-r)" },
                { label: "Rappel",    val: "97%",   color: "var(--ham-g)" },
                { label: "F1-Score",  val: "96%",   color: "var(--warn)" },
                { label: "AUC-ROC",   val: "0.99",  color: "var(--accent)" },
                { label: "Kernel",    val: "Linéaire", color: "var(--muted)" },
              ].map((p, i) => (
                <div key={i} className="perf-item">
                  <span className="perf-val" style={{ color: p.color }}>{p.val}</span>
                  <span className="perf-lbl">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
