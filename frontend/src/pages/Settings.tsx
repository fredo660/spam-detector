import { useState } from "react";
import { useApp } from "../context/AppContext"
import emailjs from "@emailjs/browser";

export default function Settings() {
  const { settings, setSettings, theme, toggleTheme, resetHistory, stats, user } = useApp();
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "ok" | "error">("idle");

  const [comment, setComment] = useState("");
const [sending, setSending] = useState(false);
const [sent, setSent] = useState(false);

const sendComment = async () => {
  if (!comment.trim() || sending) return;

  setSending(true);

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        from_name:
          user?.user_metadata?.full_name ||
          user?.email?.split("@")[0] ||
          "Utilisateur inconnu",
        message: comment,
        to_email: "fredoaldamah@gmail.com",
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    setSent(true);
    setComment("");

    setTimeout(() => setSent(false), 3000);
  } catch (err) {
    console.error("EmailJS error:", err);
  } finally {
    setSending(false);
  }
};
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

{/* PROFIL UTILISATEUR */}
<div className="settings-section">
  <p className="settings-section-title">Profil utilisateur</p>

  {user ? (
    <div className="profile-card-modern">

      {/* Header profil */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="profile-info">
          <h3 className="profile-name">
            {user.user_metadata?.full_name || "Utilisateur"}
          </h3>
          <p className="profile-email">{user.email}</p>
        </div>

        <span className="profile-badge">Actif</span>
      </div>

      {/* Details */}
      <div className="profile-details">
        <div className="profile-row">
          <span className="label">User ID</span>
          <span className="value mono">{user.id}</span>
        </div>

        <div className="profile-row">
          <span className="label">Nom complet</span>
          <span className="value">
            {user.user_metadata?.full_name || "Non défini"}
          </span>
        </div>

        <div className="profile-row">
          <span className="label">Statut</span>
          <span className="value success">Connecté</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="profile-empty">
      <p>Aucun utilisateur connecté</p>
    </div>
  )}
</div>

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

       {/* COMMENTAIRE / FEEDBACK */}
<div className="settings-section">
  <p className="settings-section-title">Envoyer un commentaire</p>

  <textarea
    className="settings-textarea"
    placeholder="Écrivez votre message ou suggestion..."
    value={comment}
    onChange={(e) => setComment(e.target.value)}
  />

  <button
    className="btn-save"
    onClick={sendComment}
    disabled={sending}
  >
    {sending ? "Envoi..." : sent ? "✓ Envoyé !" : "Envoyer"}
  </button>

  <p className="settings-hint">
    Vos messages sont envoyés directement à l'administrateur.
  </p>
</div>

      {/* Save */}
      <button className={`btn-save ${saved ? "saved" : ""}`} onClick={handleSave}>
        {saved ? "✓ Paramètres sauvegardés !" : "Sauvegarder"}
      </button>

     
    </div>
    
  );
}
