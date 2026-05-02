import { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export function OrderProvider({ children, agencia }) {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState(agencia?.zonas?.[0] || 'Local'); 
  const [hora, setHora] = useState('Lo antes posible');
  const [datosUsuario, setDatosUsuario] = useState({ 
    dui: '', nombre: '', tel: '', dir: '', ref: '', pago: 'Efectivo', nota: '', latitud: null, longitud: null 
  });
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  useEffect(() => {
    if (agencia?.zonas) {
      setZona(agencia.zonas[0]);
    }
  }, [agencia]);

  const cambiarCantidad = (delta) => setCantidad(prev => Math.max(1, Math.min(10, prev + delta)));

 const calcularTotal = () => {
    // 1. Extraemos el precio de forma segura (soportando p.precio o p.price)
    const precioRaw = producto?.precio || producto?.price || 0;
    
    // 2. Forzamos a que sea un número (por si MySQL lo mandó como texto)
    const precioNumber = parseFloat(precioRaw);
    const precioValido = isNaN(precioNumber) ? 0 : precioNumber;

    // 3. Calculamos asegurando que la cantidad también sea un número válido
    const sub = precioValido * (Number(cantidad) || 1);
    const envio = sub >= 30 ? 0 : 3.00;

    return { 
      sub: sub, 
      envio: envio, 
      total: sub + envio 
    };
  };

  const hacerPedido = async () => {
    if (!esFormularioValido()) {
      alert('Por favor completa tu nombre, teléfono y dirección correctamente.');
      return;
    }

    const totales = calcularTotal();

    const textoDetalles = `
      Producto: ${cantidad}x Cilindro ${producto.peso} 
      Zona: ${zona}
      Hora de entrega: ${hora}
      Referencia: ${datosUsuario.ref || 'N/A'}
      Forma de pago: ${datosUsuario.pago}
      Nota: ${datosUsuario.nota || 'Ninguna'}
    `.trim();

    const payload = {
      agencia_id: agencia?.id, 
      dui: datosUsuario.dui,
      cliente_nombre: datosUsuario.nombre,
      cliente_telefono: datosUsuario.tel,
      direccion_entrega: `${datosUsuario.dir} (${zona})`,
      total: totales.total,
      detalles: textoDetalles,
      cantidad: cantidad,
      latitud: datosUsuario.latitud,
      longitud: datosUsuario.longitud
    };

    try {
      const response = await fetch('https://ventadegas.onrender.com/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
      
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
    // 1. Asignamos strings vacíos por defecto para evitar que .replace() o .trim() 
    // tiren un error fatal si el dato viene como 'undefined'
    const telefono = datosUsuario.tel || '';
    const dui = datosUsuario.dui || '';
    const nombre = datosUsuario.nombre || '';
    const direccion = datosUsuario.dir || '';

    // 2. Validaciones limpias
    const numerosTel = telefono.replace(/\D/g, '');
    const duiValido = /^\d{8}-\d$/.test(dui);

    return (
      producto !== null && 
      numerosTel.length === 8 && 
      duiValido &&
      nombre.trim().length > 2 && 
      direccion.trim().length > 5
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