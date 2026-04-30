import { useOrder } from '../context/OrderContext';

export default function Summary() {
  const { producto, cantidad, calcularTotal, hacerPedido, esFormularioValido } = useOrder();
  const totales = calcularTotal();
  const valido = esFormularioValido();

  return (
    <>
      <div className="resumen">
        <div className="res-row">
          <span>
            {producto ? `Cilindro ${producto.name} × ${cantidad}` : '⚠️ Elige un cilindro arriba'}
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

      <button 
        className="btn-pedir" 
        onClick={hacerPedido}
        disabled={!valido}
      >
        {valido ? 'Confirmar pedido' : 'Completa tus datos'}
      </button>
      
      <p className="nota-pie">
        Entregas de lunes a domingo · 7:00 am a 7:00 pm<br/>
        Envío gratis en pedidos de $30 o más
      </p>
    </>
  );
}