import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import ProductSelector from './components/ProductSelector';
import ZoneSelector from './components/ZoneSelector';
import CheckoutForm from './components/CheckoutForm';
import Summary from './components/Summary';
import { agencias } from './data/agencias';

// Importamos el Proveedor y el Hook del Contexto
import { OrderProvider, useOrder } from './context/OrderContext';

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
  const agenciaData = agencias[agenciaSlug];

  if (!agenciaData) {
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
      <Route path="/" element={<Navigate to="/distribuidora-martinez" replace />} />
      <Route path="/:agenciaSlug" element={<AgenciaRouter />} />
    </Routes>
  );
}