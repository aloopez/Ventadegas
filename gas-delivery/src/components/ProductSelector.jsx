import { useEffect, useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { getProductosByAgencia } from '../services/api';

// --- NUEVO: Componente SVG del Cilindro de Gas ---
function TamboIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" /* Hereda el color gris o naranja del CSS */
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Cuerpo del cilindro */}
      <rect x="5" y="10" width="14" height="12" rx="3" />
      {/* Base inferior */}
      <path d="M7 22h10" />
      {/* Asas protectoras (cuello) */}
      <path d="M8 10V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
      {/* Válvula central */}
      <path d="M12 4v2" />
      <path d="M10 6h4" />
    </svg>
  );
}
// --------------------------------------------------

export default function ProductSelector() {
  const { agencia, producto: productoActivo, setProducto, cantidad, cambiarCantidad } = useOrder();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargamos los productos desde el backend real
    getProductosByAgencia(agencia.slug)
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, [agencia.slug]);

  if (loading) return <div className="section">Cargando productos...</div>;

  return (
    <div className="section">
      <div className="step-label">Paso 1 – Elige tu cilindro</div>
      
      <div className="prod-list">
        {productos.map((p) => (
          <div 
            key={p.id}
            className={`prod-row ${productoActivo?.id === p.id ? 'sel' : ''}`} 
            onClick={() => setProducto(p)}
          >
            <div className="prod-left">
              {/* AQUÍ INYECTAMOS EL SVG MÁGICO */}
              <div className="prod-icon">
                <TamboIcon />
              </div>
              <div>
                <div className="prod-name">Cilindro de {p.peso || p.nombre}</div>
                <div className="prod-use">{p.uso || 'Uso doméstico'}</div>
              </div>
            </div>
            <div className="prod-price">${parseFloat(p.price || p.precio).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="qty-wrap">
        <span className="qty-label">Cantidad:</span>
        <div className="qty-control">
          <button className="qty-btn" onClick={() => cambiarCantidad(-1)}>–</button>
          <div className="qty-num">{cantidad}</div>
          <button className="qty-btn" onClick={() => cambiarCantidad(1)}>+</button>
        </div>
        <span className="qty-label">{cantidad === 1 ? 'cilindro' : 'cilindros'}</span>
      </div>
    </div>
  );
}