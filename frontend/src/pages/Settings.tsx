import { useState } from "react";
import { useApp } from "../context/AppContext"

export default function Settings() {
  const { settings, setSettings, theme, toggleTheme, resetHistory, stats } = useApp();
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "ok" | "error">("idle");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestStatus("idle");
    try {
      const res = await fetch(`${settings.apiUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test connexion" }),
      });
      setTestStatus(res.ok ? "ok" : "error");
    } catch {
      setTestStatus("error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="page settings-page">
      <h2 className="page-title">Paramètres</h2>
      <p className="page-sub">Configuration du modèle et de l'interface</p>

      {/* API */}
      <div className="settings-section">
        <p className="settings-section-title">Connexion API Flask</p>
        <div className="settings-row">
          <label className="settings-label">URL du serveur</label>
          <div className="settings-input-row">
            <input
              className="settings-input"
              value={settings.apiUrl}
              onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
              placeholder="http://localhost:5000"
            />
            <button
              className={`btn-test ${testStatus === "ok" ? "ok" : testStatus === "error" ? "err" : ""}`}
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? "…" : testStatus === "ok" ? "✓ OK" : testStatus === "error" ? "✗ Erreur" : "Tester"}
            </button>
          </div>
          {testStatus === "ok" && <p className="settings-hint ok">Connexion réussie avec Flask !</p>}
          {testStatus === "error" && <p className="settings-hint err">Impossible de joindre le serveur. Vérifiez que Flask tourne.</p>}
        </div>
      </div>

      {/* Modèle */}
      <div className="settings-section">
        <p className="settings-section-title">Modèle SVM</p>
        <div className="settings-row">
          <label className="settings-label">
            Seuil de classification (%)
            <span className="settings-hint">En dessous de ce seuil → Ham. Au-dessus → Spam.</span>
          </label>
          <div className="slider-row">
            <input
              type="range" min={10} max={90} step={5}
              value={settings.threshold}
              onChange={(e) => setSettings({ ...settings, threshold: +e.target.value })}
              className="settings-slider"
            />
            <span className="slider-val spam-col">{settings.threshold}%</span>
          </div>
        </div>

        <div className="settings-row">
          <label className="settings-label">Langue des données</label>
          <select
            className="settings-select"
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </div>

      {/* Interface */}
      <div className="settings-section">
        <p className="settings-section-title">Interface</p>
        <div className="settings-row toggle-row">
          <div>
            <label className="settings-label">Thème</label>
            <p className="settings-hint">Actuellement : {theme === "dark" ? "Sombre" : "Clair"}</p>
          </div>
          <button className="toggle-btn" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Passer en clair" : "☽ Passer en sombre"}
          </button>
        </div>

        <div className="settings-row toggle-row">
          <div>
            <label className="settings-label">Notifications</label>
            <p className="settings-hint">Alertes visuelles lors d'un spam détecté</p>
          </div>
          <button
            className={`toggle-switch ${settings.notifications ? "on" : "off"}`}
            onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {/* Données */}
      <div className="settings-section">
        <p className="settings-section-title">Données</p>
        <div className="settings-row toggle-row">
          <div>
            <label className="settings-label">Historique</label>
            <p className="settings-hint">{stats.total} messages enregistrés en session</p>
          </div>
          <button className="btn-danger" onClick={resetHistory} disabled={stats.total === 0}>
            Effacer l'historique
          </button>
        </div>
      </div>

      {/* Save */}
      <button className={`btn-save ${saved ? "saved" : ""}`} onClick={handleSave}>
        {saved ? "✓ Paramètres sauvegardés !" : "Sauvegarder"}
      </button>
    </div>
  );
}
