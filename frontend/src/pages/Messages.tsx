import { useApp } from "../context/AppContext";

const EXAMPLES_SPAM = [
  "FÉLICITATIONS ! Vous avez gagné 2500€ ! Appelez le 0678234512 MAINTENANT !",
  "URGENT : votre compte sera suspendu. Cliquez ici : http://promo-123.fr",
  "Crédit immédiat 50000€ sans justificatif, appelez maintenant !",
  "Votre colis est bloqué. Payez 4,90€ de frais : http://promo-447.fr",
];
const EXAMPLES_HAM = [
  "Bonjour, on se retrouve à 12h demain pour le déjeuner ?",
  "N'oublie pas la réunion de demain à 9h en salle B3",
  "Merci pour ton aide hier, c'était vraiment sympa !",
  "Tu peux m'appeler quand tu es disponible stp ?",
];

export default function Messages() {
  const { msg, setMsg, result, loading, analyze, clearAll } = useApp();

  const spamWidth = result?.spam_score ?? 0;
  const hamWidth  = result?.ham_score  ?? 0;

  return (
    <div className="page messages-page">
      <h2 className="page-title">Analyser un message</h2>
      <p className="page-sub">Collez un SMS ou email pour détecter s'il s'agit d'un spam</p>

      <div className="msg-layout">
        {/* Left — input */}
        <div className="msg-input-col">
          <div className="input-card">
            <p className="field-label">Message à analyser</p>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Collez ici votre SMS ou email à analyser..."
              rows={6}
            />
            <div className="char-count">{msg.length} caractères</div>

            <div className="btn-row">
              <button className="analyze" onClick={analyze} disabled={loading || !msg.trim()}>
                {loading ? (
                  <span className="spinner-inline" />
                ) : "⬡ Analyser"}
              </button>
              <button className="clear-btn" onClick={clearAll}>✕</button>
            </div>
            <p className="hint-text">Raccourci : Ctrl + Entrée</p>
          </div>

          {/* Examples */}
          <div className="examples-card">
            <p className="field-label">Exemples spam</p>
            <div className="examples-list">
              {EXAMPLES_SPAM.map((ex, i) => (
                <button key={i} className="ex-row spam-ex" onClick={() => setMsg(ex)}>
                  <span className="ex-dot spam-dot" />
                  <span>{ex.slice(0, 50)}…</span>
                </button>
              ))}
            </div>

            <p className="field-label" style={{ marginTop: "1rem" }}>Exemples légitimes</p>
            <div className="examples-list">
              {EXAMPLES_HAM.map((ex, i) => (
                <button key={i} className="ex-row ham-ex" onClick={() => setMsg(ex)}>
                  <span className="ex-dot ham-dot" />
                  <span>{ex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — result */}
        <div className="msg-result-col">
          {!result ? (
            <div className="result-placeholder">
              <span className="rp-icon">◈</span>
              <p>Le résultat de l'analyse apparaîtra ici</p>
            </div>
          ) : (
            <div className="result-card show">
              {/* Verdict */}
              <div className={`verdict ${result.label}`}>
                <span className="verdict-icon">{result.label === "spam" ? "🚨" : "✅"}</span>
                <div>
                  <div className="verdict-label">
                    {result.label === "spam" ? "SPAM DÉTECTÉ" : "MESSAGE LÉGITIME"}
                  </div>
                  <div className="verdict-sub">
                    {result.label === "spam"
                      ? `Confiance spam : ${result.spam_score}% — Ce message présente des caractéristiques de spam.`
                      : `Confiance ham : ${result.ham_score}% — Ce message semble authentique.`}
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="scores">
                <div className="score-block">
                  <div className="score-top">
                    <span className="score-name">SPAM</span>
                    <span className="score-pct spam">{result.spam_score}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill spam" style={{ width: `${spamWidth}%` }} />
                  </div>
                </div>
                <div className="score-block">
                  <div className="score-top">
                    <span className="score-name">HAM (légitime)</span>
                    <span className="score-pct ham">{result.ham_score}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill ham" style={{ width: `${hamWidth}%` }} />
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="kw-section">
                <p className="kw-title">Mots indicateurs détectés</p>
                <div className="kw-pills">
                  {result.keywords?.length > 0
                    ? result.keywords.map((k, i) => <span key={i} className="kw-pill">{k}</span>)
                    : <span className="kw-empty">Aucun mot indicateur fort détecté</span>}
                </div>
              </div>

              {/* Clean text */}
              <div className="clean-section">
                <p className="kw-title">Texte après nettoyage NLP</p>
                <p className="clean-text">{result.clean_text || "—"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
