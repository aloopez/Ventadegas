import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children, agencia }) {
  // 1. Usamos encadenamiento opcional (?.) para evitar que la app "explote"
  // si el backend aún no ha mandado las zonas.
  const [producto, setProducto] = useState({ id: '10', price: 8.50, name: '10 lbs' });
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState(agencia?.zonas?.[0] || 'Local'); 
  const [hora, setHora] = useState('Lo antes posible');
  const [datosUsuario, setDatosUsuario] = useState({ 
    nombre: '', tel: '', dir: '', ref: '', pago: 'Efectivo', nota: '' 
  });
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  // 2. Actualizamos la zona cuando cambia la agencia, protegiendo el código.
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
    // 1. Usamos tu función de validación existente
    if (!esFormularioValido()) {
      alert('Por favor completa tu nombre, teléfono y dirección correctamente.');
      return;
    }

    const totales = calcularTotal();

    // 2. Armamos los detalles para la columna "detalles" de la BD
    const textoDetalles = `
      Producto: ${cantidad}x Cilindro ${producto.name}
      Zona: ${zona}
      Hora de entrega: ${hora}
      Referencia: ${datosUsuario.ref || 'N/A'}
      Forma de pago: ${datosUsuario.pago}
      Nota: ${datosUsuario.nota || 'Ninguna'}
    `.trim();

    // 3. Construimos el payload exacto para tu ruta POST /api/pedidos
    const payload = {
      agencia_id: agencia?.id, 
      cliente_nombre: datosUsuario.nombre,
      cliente_telefono: datosUsuario.tel,
      direccion_entrega: `${datosUsuario.dir} (${zona})`, // Unificamos dirección y zona
      total: totales.total,
      detalles: textoDetalles
    };

    try {
      // 4. Hacemos la petición al backend
     const response = await fetch('http://localhost:3000/api/pedidos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

      const data = await response.json();

      if (response.ok) {
        // 5. Si la base de datos guardó el pedido, mandamos el WhatsApp
        // Incluimos el código generado (data.codigo) para que la agencia pueda rastrearlo
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

       // 1. Tomamos el teléfono (ya sea el de WhatsApp o el normal)
const telefonoAgencia = agencia.telefonoWhatsApp || agencia.telefono;

// 2. Le quitamos los guiones o cualquier cosa que no sea número usando RegEx
const numeroLimpio = telefonoAgencia.replace(/\D/g, '');

// 3. Le agregamos el código de El Salvador (503)
const numeroWhatsApp = `503${numeroLimpio}`;

// 4. Ahora sí, abrimos la ventana con el número correcto
window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeWpp)}`, '_blank');
        // Confirmamos el pedido en el estado de React
        setPedidoConfirmado(true);
      } else {
        // Si el backend devuelve un error (ej. 400 o 500)
        alert(`Error al procesar el pedido: ${data.error}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. Por favor, revisa tu conexión a internet.");
    }
  };

  const esFormularioValido = () => {
    const numerosTel = datosUsuario.tel.replace(/\D/g, '');
    return numerosTel.length === 8 && datosUsuario.nombre.trim().length > 2 && datosUsuario.dir.trim().length > 5;
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

// Exportar el hook por separado a veces ayuda a Vite con el Fast Refresh
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder debe usarse dentro de un OrderProvider');
  }
  return context;
};