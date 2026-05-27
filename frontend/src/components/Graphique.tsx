import { useApp } from "../context/AppContext";

export default function Graphique() {
  const { history } = useApp();

  // Données par heure (dernières 8 analyses regroupées visuellement)
  const last8 = history.slice(0, 8).reverse();

  // Radar-like scores
  const spamAvg = history.filter(h => h.label === "spam").length
    ? Math.round(history.filter(h => h.label === "spam").reduce((a, h) => a + h.score, 0) / history.filter(h => h.label === "spam").length)
    : 0;
  const hamAvg = history.filter(h => h.label === "ham").length
    ? Math.round(history.filter(h => h.label === "ham").reduce((a, h) => a + h.score, 0) / history.filter(h => h.label === "ham").length)
    : 0;

  if (!history.length) {
    return (
      <div className="graphique-empty">
        <span className="ge-icon">◻</span>
        <p>Analysez des messages pour voir les graphiques</p>
      </div>
    );
  }

  return (
    <div className="graphique-wrap">
      {/* Barchart des dernières analyses */}
      <div className="gchart-section">
        <p className="gchart-title">Dernières analyses</p>
        <div className="gchart-bars">
          {last8.map((h, i) => (
            <div key={h.id} className="gchart-col">
              <div className="gchart-bar-wrap">
                <div
                  className={`gchart-bar ${h.label}`}
                  style={{
                    height: `${h.score}%`,
                    animationDelay: `${i * 60}ms`,
                  }}
                  title={`${h.label.toUpperCase()} — ${h.score}%`}
                />
              </div>
              <span className="gchart-lbl">{h.label === "spam" ? "S" : "H"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Moyenne scores */}
      <div className="gavg-section">
        <div className="gavg-item">
          <div className="gavg-ring spam-ring" style={{ "--pct": `${spamAvg}` } as React.CSSProperties}>
            <span className="gavg-val">{spamAvg}%</span>
          </div>
          <p className="gavg-lbl">Score moyen spam</p>
        </div>
        <div className="gavg-item">
          <div className="gavg-ring ham-ring" style={{ "--pct": `${hamAvg}` } as React.CSSProperties}>
            <span className="gavg-val">{hamAvg}%</span>
          </div>
          <p className="gavg-lbl">Score moyen ham</p>
        </div>
      </div>
    </div>
  );
}
