import { useEffect, useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { getProductosByAgencia } from '../services/api';

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
        // Seleccionamos el primero automáticamente si no hay uno seleccionado
        if (data.length > 0 && !productoActivo?.id) {
          setProducto(data[0]);
        }
      })
      .catch(err => console.error("Error cargando productos:", err));
  }, [agencia.slug]);

  if (loading) return <div className="section">Cargando productos...</div>;

  return (
    <div className="section">
      <div className="step-label">Paso 1 — Elige tu cilindro</div>
      
      <div className="prod-list">
        {productos.map((p) => (
          <div 
            key={p.id}
            // Usamos las clases de tu App.css: .prod-row y .sel para el activo
            className={`prod-row ${productoActivo?.id === p.id ? 'sel' : ''}`} 
            onClick={() => setProducto(p)}
          >
            <div className="prod-left">
              <div className="prod-icon">🔥</div>
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
          <button className="qty-btn" onClick={() => cambiarCantidad(-1)}>−</button>
          <div className="qty-num">{cantidad}</div>
          <button className="qty-btn" onClick={() => cambiarCantidad(1)}>+</button>
        </div>
        <span className="qty-label">{cantidad === 1 ? 'cilindro' : 'cilindros'}</span>
      </div>
    </div>
  );
}