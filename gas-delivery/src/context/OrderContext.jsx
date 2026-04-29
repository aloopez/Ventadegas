import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children, agencia }) {
  const [producto, setProducto] = useState({ id: '10', price: 8.50, name: '10 lbs' });
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState(agencia.zonas[0] || 'Local'); 
  const [hora, setHora] = useState('Lo antes posible');
  const [datosUsuario, setDatosUsuario] = useState({ 
    nombre: '', tel: '', dir: '', ref: '', pago: 'Efectivo', nota: '' 
  });
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  // Actualiza la zona si se cambia de agencia en la URL
  useEffect(() => {
    setZona(agencia.zonas[0] || 'Local');
  }, [agencia]);

  const cambiarCantidad = (delta) => setCantidad(prev => Math.max(1, Math.min(10, prev + delta)));

  const calcularTotal = () => {
    const sub = producto.price * cantidad;
    const envio = sub >= 30 ? 0 : 3.00;
    return { sub, envio, total: sub + envio };
  };

  const hacerPedido = () => {
    if (!datosUsuario.nombre || !datosUsuario.tel || !datosUsuario.dir) {
      alert('Por favor completa tu nombre, teléfono y dirección.');
      return;
    }

    const totales = calcularTotal();
    
    // Aquí está tu lógica de WhatsApp ya integrada
    const mensaje = `*Nuevo Pedido para ${agencia.nombre}* 📦
    
*Detalle del pedido:*
• ${cantidad}x Cilindro de ${producto.name}
• Subtotal: $${totales.sub.toFixed(2)}
• Envío: $${totales.envio.toFixed(2)}
*TOTAL: $${totales.total.toFixed(2)}*

*Datos del cliente:*
• Nombre: ${datosUsuario.nombre}
• Teléfono: ${datosUsuario.tel}
• Zona: ${zona}
• Dirección: ${datosUsuario.dir}
${datosUsuario.ref ? `• Referencia: ${datosUsuario.ref}` : ''}

*Entrega y Pago:*
• Hora preferida: ${hora}
• Método de pago: ${datosUsuario.pago}
${datosUsuario.nota ? `• Notas: ${datosUsuario.nota}` : ''}`;

    const urlWhatsApp = `https://wa.me/${agencia.telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
    
    setPedidoConfirmado(true);
    window.scrollTo(0, 0);
  };

  const esFormularioValido = () => {
    const numerosTel = datosUsuario.tel.replace(/\D/g, '');
    const telefonoOk = numerosTel.length === 8 && /^[267]/.test(numerosTel);
    const nombreOk = datosUsuario.nombre.trim().length > 2;
    const direccionOk = datosUsuario.dir.trim().length > 5;
    return telefonoOk && nombreOk && direccionOk;
  };

  return (
    <OrderContext.Provider value={{
      agencia, 
      producto, setProducto, 
      cantidad, cambiarCantidad,
      zona, setZona, 
      hora, setHora,
      datosUsuario, setDatosUsuario,
      pedidoConfirmado, setPedidoConfirmado,
      calcularTotal, hacerPedido, esFormularioValido
    }}>
      {children}
    </OrderContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export const useOrder = () => useContext(OrderContext);