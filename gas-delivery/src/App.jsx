// src/App.jsx
import { useState } from 'react';
import './App.css';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import ZoneSelector from './components/ZoneSelector';
import CheckoutForm from './components/CheckoutForm';
import Summary from './components/Summary';

function App() {
  const [producto, setProducto] = useState({ id: '10', price: 8.50, name: '10 lbs' });
  const [cantidad, setCantidad] = useState(1);
  const [zona, setZona] = useState('San Salvador');
  const [hora, setHora] = useState('Lo antes posible');
  
  // Agrupamos los datos del usuario en un solo estado
  const [datosUsuario, setDatosUsuario] = useState({ 
    nombre: '', tel: '', dir: '', ref: '', pago: 'Efectivo', nota: '' 
  });
  
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  const productos = [
    { id: '10', price: 8.50, name: '10 lbs', uso: 'Uso diario, cocina familiar' },
    { id: '25', price: 18.00, name: '25 lbs', uso: 'Familia grande' },
    { id: '35', price: 24.50, name: '35 lbs', uso: 'Negocio pequeño' },
    { id: '100', price: 60.00, name: '100 lbs', uso: 'Uso industrial' }
  ];

  const cambiarCantidad = (delta) => setCantidad(prev => Math.max(1, Math.min(10, prev + delta)));

  const calcularTotal = () => {
    const sub = producto.price * cantidad;
    const envio = sub >= 30 ? 0 : 3.00;
    return { sub, envio, total: sub + envio };
  };

  const hacerPedido = () => {
    // Validamos que los campos obligatorios tengan algo escrito
    if (!datosUsuario.nombre || !datosUsuario.tel || !datosUsuario.dir) {
      alert('Por favor completa tu nombre, teléfono y dirección.');
      return;
    }
    setPedidoConfirmado(true);
    window.scrollTo(0, 0); // Sube la pantalla arriba al confirmar
  };

  // Lógica de validación
  const esFormularioValido = () => {
    const numerosTel = datosUsuario.tel.replace(/\D/g, '');
    const telefonoOk = numerosTel.length === 8 && /^[267]/.test(numerosTel);
    const nombreOk = datosUsuario.nombre.trim().length > 2;
    const direccionOk = datosUsuario.dir.trim().length > 5;
    
    return telefonoOk && nombreOk && direccionOk;
  };

  return (
    <div className="page">
      <Header />

      {!pedidoConfirmado ? (
        <div className="main">
          <div className="content">
            <ProductSelector 
              productos={productos} productoActivo={producto}
              setProducto={setProducto} cantidad={cantidad} cambiarCantidad={cambiarCantidad}
            />
            <hr className="divider" />
            
            {/* NUEVOS COMPONENTES AQUI */}
            <ZoneSelector 
              zonaActiva={zona} setZonaActiva={setZona} 
              datos={datosUsuario} setDatos={setDatosUsuario} 
            />
            <hr className="divider" />
            
            <CheckoutForm 
              datos={datosUsuario} setDatos={setDatosUsuario} 
              horaActiva={hora} setHoraActiva={setHora} 
            />
            <hr className="divider" />

            <Summary 
              producto={producto} cantidad={cantidad} 
              totales={calcularTotal()} hacerPedido={hacerPedido}
              formularioValido={esFormularioValido()}
            />
          </div>
        </div>
      ) : (
        <div className="success show">
          <div className="check-circle">✓</div>
          <div className="order-id">¡Pedido Confirmado!</div>
          <div className="order-sub">Pronto te contactaremos al {datosUsuario.tel}.</div>
          <button className="reset-btn" onClick={() => setPedidoConfirmado(false)}>
            Hacer otro pedido
          </button>
        </div>
      )}
    </div>
  );
}

export default App;