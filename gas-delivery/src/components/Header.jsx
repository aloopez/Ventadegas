import { useOrder } from '../context/OrderContext';

export default function Header() {
  const { agencia } = useOrder(); // Obtenemos la agencia desde el estado global
  
  return (
    <div className="header">
      <div className="header-top">
        <div className="logo-box">{agencia.logo}</div>
        <span className="site-name">{agencia.nombre}</span>
      </div>
      <div className="tagline">{agencia.slogan}</div>
      <div className="avail">
        <span className="dot"></span>
        Disponible ahora — lunes a domingo, 7am a 7pm
      </div>
    </div>
  );
}