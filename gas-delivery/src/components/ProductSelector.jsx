import { useOrder } from '../context/OrderContext';

export default function ProductSelector() {
  const { producto: productoActivo, setProducto, cantidad, cambiarCantidad } = useOrder();

  const productos = [
    { id: '10', price: 8.50, name: '10 lbs', uso: 'Uso diario, cocina familiar' },
    { id: '25', price: 18.00, name: '25 lbs', uso: 'Familia grande' },
    { id: '35', price: 24.50, name: '35 lbs', uso: 'Negocio pequeño' },
    { id: '100', price: 60.00, name: '100 lbs', uso: 'Uso industrial' }
  ];

  return (
    <div className="section">
      <div className="step-label">Paso 1 — Elige tu cilindro</div>
      
      <div className="prod-list">
        {productos.map(p => (
          <div 
            key={p.id}
            className={`prod-row ${productoActivo.id === p.id ? 'sel' : ''}`} 
            onClick={() => setProducto(p)}
          >
            <div className="prod-left">
              <div className="prod-icon">🔥</div>
              <div>
                <div className="prod-name">Cilindro de {p.name}</div>
                <div className="prod-use">{p.uso}</div>
              </div>
            </div>
            <div className="prod-price">${p.price.toFixed(2)}</div>
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