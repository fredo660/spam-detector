import { useApp } from "../context/AppContext";
import { supabase } from "../lib/Supabase";

const logout = async () => {
  await supabase.auth.signOut();
};
const NAV = [
  { id: "dashboard", icon: "⬡", label: "Accueil" },
  { id: "messages",  icon: "◈", label: "Analyser" },
  { id: "history",   icon: "◷", label: "Historique" },
  { id: "analytics", icon: "◻", label: "Stats" },
  { id: "settings",  icon: "◎", label: "Réglages" },
];

export default function Menu({
  open, setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const { page, setPage, theme, toggleTheme, stats } = useApp();

  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <span className="logo-hex">⬡</span>
          {open && <span className="logo-text">SpamSVM</span>}
        </div>
        <button className="collapse-btn" onClick={() => setOpen(!open)}>
          {open ? "◀" : "▶"}
        </button>
      </div>

      {/* Status */}
      {open && (
        <div className="sidebar-status">
          <span className="status-dot active"></span>
          <span className="status-label">Modèle actif</span>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
            title={!open ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {open && <span className="nav-label">{item.label}</span>}
            {open && page === item.id && <span className="nav-active-bar" />}
          </button>
          
        ))}
      </nav>
   {/* Footer */}
<div className="sidebar-footer">
  {open && (
    <div className="sidebar-stats-mini">
      <div className="ssm-item">
        <span className="ssm-val spam-col">{stats.spam}</span>
        <span className="ssm-lbl">spam</span>
      </div>
      <div className="ssm-sep" />
      <div className="ssm-item">
        <span className="ssm-val ham-col">{stats.ham}</span>
        <span className="ssm-lbl">ham</span>
      </div>
    </div>
  )}

  {/* Theme button */}
  <button
    className="theme-btn"
    onClick={toggleTheme}
    title="Changer de thème"
  >
    {theme === "dark" ? "☀" : "☽"}
  </button>

  {/* Logout button */}
  <button
    className="theme-btn logout-btn"
    onClick={logout}
    title="Déconnexion"
  >
    ⎋
  </button>
</div>
    </aside>
  );
}
