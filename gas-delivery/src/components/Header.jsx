// src/components/Header.jsx
export default function Header() {
  return (
    <div className="header">
      <div className="header-top">
        <div className="logo-box">🔥</div>
        <span className="site-name">Gas a domicilio</span>
      </div>
      <div className="tagline">Entrega rápida en todo El Salvador</div>
      <div className="avail">
        <span className="dot"></span>
        Disponible ahora — lunes a domingo, 7am a 7pm
      </div>
    </div>
  );
}