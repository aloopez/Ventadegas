import { useState, useEffect } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import ZoneSelector from './components/ZoneSelector';
import CheckoutForm from './components/CheckoutForm';
import Summary from './components/Summary';
import AdminPanel from './components/AdminPanel';

// Importamos el Proveedor y el Hook del Contexto
import { OrderProvider, useOrder } from './context/OrderContext';

// Importamos nuestra nueva Mock API (reemplaza la importación estática anterior)
import { getAgenciaBySlug } from './services/api.js';

function TiendaAgenciaContent() {
  const { agencia, pedidoConfirmado, setPedidoConfirmado, datosUsuario } = useOrder();

  return (
    <div className="page" style={{ '--primary': agencia.tema?.primary || '#2563eb' }}>
      <Header />

      {!pedidoConfirmado ? (
        <div className="main">
          <div className="content">
            <ProductSelector />
            <hr className="divider" />
            <ZoneSelector />
            <hr className="divider" />
            <CheckoutForm />
            <hr className="divider" />
            <Summary />
          </div>
        </div>
      ) : (
        <div className="success show">
          <div className="check-circle">✓</div>
          <div className="order-id">¡Pedido Confirmado!</div>
          <div className="order-sub">Pronto te contactarán desde {agencia.nombre} al {datosUsuario.tel}.</div>
          <button className="reset-btn" onClick={() => setPedidoConfirmado(false)}>
            Hacer otro pedido
          </button>
        </div>
      )}
    </div>
  );
}

// Envolvemos el contenido con el Proveedor del Estado
function TiendaAgencia({ agencia }) {
  return (
    <OrderProvider agencia={agencia}>
      <TiendaAgenciaContent />
    </OrderProvider>
  );
}

function AgenciaRouter() {
  const { agenciaSlug } = useParams();
  
  // Estados para manejar la carga de datos asíncronos
  const [agenciaData, setAgenciaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    // Llamada a la Mock API
    getAgenciaBySlug(agenciaSlug)
      .then((data) => {
        setAgenciaData(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [agenciaSlug]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Cargando tienda... ⏳</h2>
      </div>
    );
  }

  if (error || !agenciaData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-main)' }}>
        <h2>Agencia no encontrada 😕</h2>
        <p>Verifica que el enlace de la distribuidora sea correcto.</p>
      </div>
    );
  }

  return <TiendaAgencia agencia={agenciaData} />;
}

export default function App() {
  return (
    <Routes>
      {/* Nueva pantalla por defecto */}
      <Route 
        path="/" 
        element={
          <div style={{ 
            textAlign: 'center', 
            padding: '50px 20px', 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'var(--bg-body)'
          }}>
            <div style={{
              background: 'var(--bg-app)',
              padding: '40px',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}> </div>
              <h2 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em' }}>
                ¡Bienvenido a Ventadegas!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
                Por favor, accede al enlace específico proporcionado por tu agencia distribuidora para poder realizar tu pedido.
              </p>
            </div>
          </div>
        } 
      />
      <Route path="/:agenciaSlug" element={<AgenciaRouter />} />
      <Route path="/:agenciaSlug/admin" element={<AdminPanel />} />
    </Routes>
  );
}