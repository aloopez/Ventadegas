import { useOrder } from '../context/OrderContext';

export default function Header() {
  const { agencia } = useOrder();

  return (
    <div className="header" style={{ '--primary': agencia.tema?.primary || '#e85d04' }}>
      <div className="header-top">
        <div className="logo-box">{agencia.logo}</div>
        <span className="site-name">{agencia.nombre}</span>
      </div>
      <div className="tagline">{agencia.slogan}</div>
      <div className="avail">
        <span className="dot"></span>
        Disponible ahora — lun a dom, 7am–7pm
      </div>
    </div>
  );
}