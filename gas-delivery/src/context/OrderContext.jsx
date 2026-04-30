import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children, agencia }) {
  // 1. CAMBIO AQUÍ: Iniciamos el producto como null para obligar al usuario a elegir
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState(agencia?.zonas?.[0] || 'Local'); 
  const [hora, setHora] = useState('Lo antes posible');
  const [datosUsuario, setDatosUsuario] = useState({ 
    nombre: '', tel: '', dir: '', ref: '', pago: 'Efectivo', nota: '' 
  });
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  useEffect(() => {
    if (agencia?.zonas) {
      setZona(agencia.zonas[0]);
    }
  }, [agencia]);

  const cambiarCantidad = (delta) => setCantidad(prev => Math.max(1, Math.min(10, prev + delta)));

  const calcularTotal = () => {
    const sub = (producto?.price || 0) * cantidad;
    const envio = sub >= 30 ? 0 : 3.00;
    return { sub, envio, total: sub + envio };
  };

  const hacerPedido = async () => {
    if (!esFormularioValido()) {
      alert('Por favor completa tu nombre, teléfono y dirección correctamente.');
      return;
    }

    const totales = calcularTotal();

    const textoDetalles = `
      Producto: ${cantidad}x Cilindro ${producto.name}
      Zona: ${zona}
      Hora de entrega: ${hora}
      Referencia: ${datosUsuario.ref || 'N/A'}
      Forma de pago: ${datosUsuario.pago}
      Nota: ${datosUsuario.nota || 'Ninguna'}
    `.trim();

    const payload = {
      agencia_id: agencia?.id, 
      cliente_nombre: datosUsuario.nombre,
      cliente_telefono: datosUsuario.tel,
      direccion_entrega: `${datosUsuario.dir} (${zona})`,
      total: totales.total,
      detalles: textoDetalles
    };

    try {
      const response = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const mensajeWpp = `*Nuevo Pedido (${data.codigo})*
Cliente: ${datosUsuario.nombre}
Teléfono: ${datosUsuario.tel}
Dirección: ${datosUsuario.dir}, ${zona}
Referencia: ${datosUsuario.ref || 'N/A'}
Producto: ${cantidad}x Cilindro ${producto.name}
Total a pagar: $${totales.total.toFixed(2)}
Pago: ${datosUsuario.pago}
Hora de entrega: ${hora}
Notas: ${datosUsuario.nota || 'Ninguna'}`;

        const telefonoAgencia = agencia.telefonoWhatsApp || agencia.telefono;
        const numeroLimpio = telefonoAgencia.replace(/\D/g, '');
        const numeroWhatsApp = `503${numeroLimpio}`;

        window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeWpp)}`, '_blank');
        setPedidoConfirmado(true);
      } else {
        alert(`Error al procesar el pedido: ${data.error}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. Por favor, revisa tu conexión a internet.");
    }
  };

  const esFormularioValido = () => {
    const numerosTel = datosUsuario.tel.replace(/\D/g, '');
    // 2. CAMBIO AQUÍ: Agregamos "producto !== null" a la validación
    return (
      producto !== null && 
      numerosTel.length === 8 && 
      datosUsuario.nombre.trim().length > 2 && 
      datosUsuario.dir.trim().length > 5
    );
  };

  return (
    <OrderContext.Provider value={{
      agencia, producto, setProducto, cantidad, cambiarCantidad,
      zona, setZona, hora, setHora, datosUsuario, setDatosUsuario,
      pedidoConfirmado, setPedidoConfirmado, calcularTotal, hacerPedido, esFormularioValido
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder debe usarse dentro de un OrderProvider');
  }
  return context;
};