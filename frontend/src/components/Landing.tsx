import { useEffect, useState } from "react";
import "./Landing.css";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    label: "Sécurité",
  
    num: "01",
  },
  {
    src: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80",
    label: "Analyse NLP",
    num: "02",
  },
  {
    src: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80",
    label: "Modèle SVM",
    num: "03",
  },
  {
    src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80",
    label: "Détection IA",
    num: "04",
  },
];

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`landing ${mounted ? "mounted" : ""}`}>

      {/* ── Fond animé ── */}
      <div className="landing-bg">
        <div className="bg-grid" />
        <div className="bg-glow glow-1" />
        <div className="bg-glow glow-2" />
        <div className="bg-noise" />
      </div>

      {/* ── Écran dans l'air : grille 2×2 ── */}
      <div className="screen-wrap">
        <div className="screen-frame">

          {/* Grille 2×2 */}
          <div className="img-grid">
            {IMAGES.map((img, i) => (
              <div
                key={i}
                className={`img-cell ${hovered === i ? "hovered" : ""}`}
                style={{ "--ci": i } as React.CSSProperties}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="cell-img"
                  loading="lazy"
                />
                <div className="cell-overlay" />
                <div className="cell-label">
                  <span className="cell-num">{img.num}</span>
                  <span className="cell-text">{img.label}</span>
                </div>
                <div className="cell-shine" />
              </div>
            ))}

            {/* Croix centrale décorative */}
            <div className="grid-cross">
              <div className="cross-h" />
              <div className="cross-v" />
              <div className="cross-dot" />
            </div>
          </div>

          {/* Effets écran */}
          <div className="screen-vignette" />
          <div className="screen-glare" />
          <div className="screen-led" />
          <div className="screen-scanlines" />
        </div>
      </div>

      {/* ── Texte par-dessus à droite ── */}
      <div className="landing-inner">
        <div className="hero-col">

          <div className="hero-badge">
            <span className="badge-dot" />
            <span>Powered by SVM · NLP · Français</span>
          </div>

          <h1 className="hero-title">
  <span className="title-line line-1">
    Détecteur de Messages
  </span>

  <span className="title-line line-2">
    <span className="title-accent">Spam</span>
  </span>
</h1>

          <p className="hero-desc">
  Analysez instantanément vos SMS et emails grâce à une intelligence
  artificielle basée sur le NLP et le Machine Learning.
  Notre modèle SVM détecte les messages indésirables avec
  <strong> 96% de précision</strong>.
</p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-val">96%</span>
              <span className="stat-lbl">Précision</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-val">1K+</span>
              <span className="stat-lbl">Entraînés</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-val">FR</span>
              <span className="stat-lbl">Langue</span>
            </div>
          </div>

          <div className="hero-bottom">
  <div className="hero-features">
    {[
      { icon: "⬡", text: "Dashboard en temps réel" },
      { icon: "◈", text: "Analyse instantanée" },
      { icon: "◷", text: "Historique persistant" },
      { icon: "◎", text: "Espace personnel sécurisé" },
    ].map((f, i) => (
      <div
        key={i}
        className="feature-row"
        style={{ "--fi": i } as React.CSSProperties}
      >
        <span className="feature-icon">{f.icon}</span>
        <span className="feature-text">{f.text}</span>
      </div>
    ))}
  </div>

  <div className="hero-cta">
    <button className="btn-start" onClick={onStart}>
      <span className="btn-start-text">Commencer</span>
      <span className="btn-start-arrow">→</span>
      <div className="btn-start-bg" />
    </button>

    <p className="cta-sub">
      Inscription gratuite · Espace personnel
    </p>
  </div>
</div>
        </div>
      </div>

      <footer className="landing-footer">
        <span>SpamSVM © 2026</span>
        <span className="footer-sep">·</span>
        <span>SIGD · GP5</span>
        <span className="footer-sep">·</span>
        <span>Machine Learning · Français</span>
      </footer>
    </div>
  );
}