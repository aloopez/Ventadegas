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

  const hacerPedido = () => {
    if (!datosUsuario.nombre || !datosUsuario.tel || !datosUsuario.dir) {
      alert('Por favor completa tu nombre, teléfono y dirección.');
      return;
    }
    const totales = calcularTotal();
    const mensaje = `*Nuevo Pedido*...`; // (Tu lógica de WhatsApp se mantiene igual)
    window.open(`https://wa.me/${agencia.telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`, '_blank');
    setPedidoConfirmado(true);
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