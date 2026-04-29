// src/components/ProductSelector.jsx
export default function ProductSelector({ productos, productoActivo, setProducto, cantidad, cambiarCantidad }) {
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