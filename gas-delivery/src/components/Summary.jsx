import { useOrder } from '../context/OrderContext';
import { useState, useEffect } from 'react';

export default function Summary() {
  const { producto, cantidad, calcularTotal, hacerPedido, esFormularioValido } = useOrder();
  const [tiendaAbierta, setTiendaAbierta] = useState(true);

  const totales = calcularTotal();
  const valido = esFormularioValido();

  // Validar si estamos en horario de operación (7 AM a 7 PM, hora El Salvador)
  useEffect(() => {
    const svTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/El_Salvador" }));
    const hora = svTime.getHours();
    
    // Si es antes de las 7:00 o después de las 18:59, cerramos la tienda
    if (hora < 7 || hora >= 19) {
      setTiendaAbierta(false);
    }
  }, []);

  return (
    <>
      <div className="resumen">
        <div className="res-row">
          <span>
            {producto ? `Cilindro ${producto.nombre} de ${producto.peso} × ${cantidad}` : '⚠️ Elige un cilindro arriba'}
          </span>
          <span>${totales.sub.toFixed(2)}</span>
        </div>
        <div className="res-row">
          <span>Envío</span>
          {totales.envio === 0 ? (
            <span className="gratis">GRATIS</span>
          ) : (
            <span>${totales.envio.toFixed(2)}</span>
          )}
        </div>
        <div className="res-row total">
          <span>Total a pagar</span>
          <span>${totales.total.toFixed(2)}</span>
        </div>
      </div>

      {!tiendaAbierta && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
          Cerrado. Abrimos mañana a las 7:00 AM.
        </div>
      )}

      <button 
        className="btn-pedir" 
        onClick={hacerPedido}
        disabled={!valido || !tiendaAbierta}
        style={{ opacity: (!valido || !tiendaAbierta) ? 0.6 : 1 }}
      >
        {!tiendaAbierta ? 'Tienda Cerrada' : (valido ? 'Confirmar pedido' : 'Completa tus datos')}
      </button>
      
      <p className="nota-pie">
        Entregas de lunes a domingo · 7:00 am a 7:00 pm<br/>
        Envío gratis en pedidos de $30 o más
      </p>
    </>
  );
}