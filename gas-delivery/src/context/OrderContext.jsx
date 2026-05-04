import { createContext, useContext, useState, useEffect } from 'react';
import { crearPedido } from '../services/api'

const OrderContext = createContext();

export function OrderProvider({ children, agencia }) {
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState(agencia?.zonas?.[0] || 'Local'); 
  const [hora, setHora] = useState('Lo antes posible');
  
  // MAGIA ONE-CLICK: Memoria del cliente
  const [datosUsuario, setDatosUsuario] = useState(() => {
    const datosGuardados = localStorage.getItem('ventadegas_cliente');
    const valoresPorDefecto = { 
      dui: '', nombre: '', tel: '', dir: '', ref: '', pago: 'Efectivo', nota: '', latitud: null, longitud: null, billete: '' 
    };
    
    if (datosGuardados) {
      try {
        const clienteRecordado = JSON.parse(datosGuardados);
        return { ...valoresPorDefecto, ...clienteRecordado, pago: 'Efectivo', nota: '', billete: '' };
      } catch (error) {
        return valoresPorDefecto;
      }
    }
    return valoresPorDefecto;
  });

  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  useEffect(() => {
    if (agencia?.zonas) {
      setZona(agencia.zonas[0]);
    }
  }, [agencia]);

  const cambiarCantidad = (delta) => setCantidad(prev => Math.max(1, Math.min(10, prev + delta)));

  // MAGIA MULTI-AGENCIA: Precios dinámicos
  const calcularTotal = () => {
    const precioRaw = producto?.precio || producto?.price || 0;
    const precioValido = isNaN(parseFloat(precioRaw)) ? 0 : parseFloat(precioRaw);
    const sub = precioValido * (Number(cantidad) || 1);

    const costoEnvioFijo = parseFloat(agencia?.costo_envio) || 3.00;
    const umbralEnvioGratis = parseFloat(agencia?.envio_gratis_desde) || 30.00;
    
    const envio = sub >= umbralEnvioGratis ? 0 : costoEnvioFijo;

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
      Forma de pago: ${datosUsuario.pago} ${datosUsuario.pago === 'Efectivo' && datosUsuario.billete ? `(Cambio de $${datosUsuario.billete})` : ''}
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
      // 1. Usamos tu función centralizada en lugar del fetch manual
      const data = await crearPedido(payload);
      
      // 2. Verificamos si el backend nos devolvió un error
      if (data.error) {
        alert(`Error al procesar el pedido: ${data.error}`);
        return;
      }

      // 3. Si todo sale bien, procesamos la confirmación
      setPedidoConfirmado(true);
      
      localStorage.setItem('ventadegas_cliente', JSON.stringify({
        dui: datosUsuario.dui,
        nombre: datosUsuario.nombre,
        tel: datosUsuario.tel,
        dir: datosUsuario.dir,
        ref: datosUsuario.ref
      }));

      const numeroLimpio = agencia?.telefono ? agencia.telefono.replace(/\D/g, '') : '';
      const numeroDistribuidora = `503${numeroLimpio}`;
      const codigoPedido = data.codigo;
      
      let mensaje = `¡Hola! Acabo de realizar el pedido *${codigoPedido}*.\n\n`;
      if (datosUsuario.pago === 'Transferencia') {
        mensaje += `Aquí envío el comprobante de mi transferencia.`;
      } else {
        mensaje += `Mi método de pago es: ${datosUsuario.pago}. Quedo atento a la entrega.`;
      }
      
      const urlWhatsApp = `https://wa.me/${numeroDistribuidora}?text=${encodeURIComponent(mensaje)}`;
      window.location.href = urlWhatsApp;

    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. Por favor, revisa tu conexión a internet.");
    }
  };

  const esFormularioValido = () => {
    const telefono = datosUsuario.tel || '';
    const dui = datosUsuario.dui || '';
    const nombre = datosUsuario.nombre || '';
    const direccion = datosUsuario.dir || '';

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
