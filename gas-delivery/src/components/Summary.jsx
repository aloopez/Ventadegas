import { useOrder } from '../context/OrderContext';
import { useState, useEffect } from 'react';

export default function Summary() {
  // 1. Agregamos datosUsuario a lo que extraemos del contexto
  const {agencia, producto, cantidad, calcularTotal, hacerPedido, esFormularioValido, datosUsuario } = useOrder();
  const [tiendaAbierta, setTiendaAbierta] = useState(true);

  const totales = calcularTotal();
  const valido = esFormularioValido();

  useEffect(() => {
    if (!agencia) return;

    // Hora actual en El Salvador
    const svTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/El_Salvador" }));
    const currentHour = svTime.getHours();
    const currentMinute = svTime.getMinutes();
    const tiempoActual = currentHour + (currentMinute / 60); // Ejemplo: 7:30 PM = 19.5

    // Extraemos los horarios de la agencia (por defecto 7am a 7pm si no existen)
    let horaApertura = 7;
    let horaCierre = 19;

    if (agencia.hora_apertura) {
      const [h, m] = agencia.hora_apertura.split(':');
      horaApertura = parseInt(h, 10) + (parseInt(m, 10) / 60);
    }
    
    if (agencia.hora_cierre) {
      const [h, m] = agencia.hora_cierre.split(':');
      horaCierre = parseInt(h, 10) + (parseInt(m, 10) / 60);
    }

    // Comparamos el tiempo actual con las reglas de la base de datos
    if (tiempoActual < horaApertura || tiempoActual >= horaCierre) {
      setTiendaAbierta(false);
    } else {
      setTiendaAbierta(true);
    }
  }, [agencia]);

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
      {/* ------------------------------------------------ */}

      {!tiendaAbierta && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '20px', fontWeight: '600', border: '1px solid var(--error-border)' }}>
          Cerrado. Abrimos a las {agencia?.hora_apertura?.slice(0, 5) || '07:00'}.
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
        Entregas de lunes a domingo · {agencia?.hora_apertura?.slice(0, 5) || '07:00'} a {agencia?.hora_cierre?.slice(0, 5) || '19:00'}<br/>
        Envío gratis en pedidos de {agencia?.envio_gratis_desde || 0} o más. Para pedidos menores, el costo de envío es de {agencia?.costo_envio || 0}.
      </p>
    </>
  );
}