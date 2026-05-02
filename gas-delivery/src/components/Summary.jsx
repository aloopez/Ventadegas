import { useOrder } from '../context/OrderContext';
import { useState, useEffect } from 'react';

export default function Summary() {
  // 1. Agregamos datosUsuario a lo que extraemos del contexto
  const { producto, cantidad, calcularTotal, hacerPedido, esFormularioValido, datosUsuario } = useOrder();
  const [tiendaAbierta, setTiendaAbierta] = useState(true);

  const totales = calcularTotal();
  const valido = esFormularioValido();

  useEffect(() => {
    const svTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/El_Salvador" }));
    const hora = svTime.getHours();
    
    // COMENTADO PARA TESTING
    // if (hora < 7 || hora >= 19) {
    //   setTiendaAbierta(false);
    // }
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

      {/* --- NUEVO: CAJA DE TRANSFERENCIA CONDICIONAL --- */}
      {datosUsuario.pago === 'Transferencia' && (
        <div style={{ 
          backgroundColor: 'var(--primary-light)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '20px', 
          border: '2px solid var(--primary)', 
          color: 'var(--text-main)' 
        }}>
          <h4 style={{ marginBottom: '12px', fontSize: '15px', color: 'var(--primary)', fontWeight: '700' }}>
            Cuentas habilitadas:
          </h4>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Banco Agrícola</strong> (Ahorro)</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>0000-0000-00</span>
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span><strong>Cuscatlán</strong> (Corriente)</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>1111-2222-33</span>
          </div>
          <p style={{ fontSize: '13px', marginTop: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            * Al presionar "Confirmar pedido", envía el comprobante al WhatsApp que se abrirá a continuación.
          </p>
        </div>
      )}
      {/* ------------------------------------------------ */}

      {!tiendaAbierta && (
        <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '14px', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '20px', fontWeight: '600', border: '1px solid var(--error-border)' }}>
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