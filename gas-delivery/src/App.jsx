import { useState, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import ZoneSelector from './components/ZoneSelector';
import CheckoutForm from './components/CheckoutForm';
import Summary from './components/Summary';
import AdminPanel from './components/AdminPanel';
import Rastreo from './components/Rastreo';
import ProgressBar from './components/ProgressBar';
import { SkeletonCard } from './components/Skeleton';

import { OrderProvider, useOrder } from './context/OrderContext';

import { ToastProvider } from './components/Toast';
import { getAgenciaBySlug } from './services/api.js';

function TiendaAgenciaContent() {
  const { agencia, pedidoConfirmado, setPedidoConfirmado, datosUsuario, currentStep } = useOrder();

  return (
    <div className="page" style={{ '--primary': agencia.tema?.primary || '#2563eb' }}>
      <Header />
      {!pedidoConfirmado ? (
        <>
          <ProgressBar currentStep={currentStep} />
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
        </>
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
      <div className="page" style={{ margin: '0 auto', padding: '20px' }}>
        <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderBottom: '0.5px solid var(--border)', marginBottom: '.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="skeleton-line" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton-line" style={{ width: '150px', height: '18px' }} />
          </div>
          <div className="skeleton-line" style={{ width: '100px', height: '12px', marginLeft: '52px' }} />
          <div className="skeleton-line" style={{ width: '180px', height: '12px', marginLeft: '52px', marginTop: '8px' }} />
        </div>
        <SkeletonCard lines={3} />
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
    <ToastProvider>
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
      <Route path="/rastreo/:codigo" element={<Rastreo />} />
      <Route path="/:agenciaSlug" element={<AgenciaRouter />} />
      <Route path="/:agenciaSlug/admin" element={<AdminPanel />} />
    </Routes>
    </ToastProvider>
  );
}