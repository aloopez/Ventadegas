import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgenciaBySlug } from '../services/api';
import AdminLogin from './AdminLogin'; // <-- Importamos el nuevo componente

// Datos de prueba
const mockPedidos = [
  { id: 'ORD-001', cliente: 'Juan Pérez', tel: '7000-1111', dir: 'Colonia Flor Blanca, Casa 12', producto: '25 lbs', cantidad: 1, total: 18.00, estado: 'Pendiente', hora: '10:30 AM' },
  { id: 'ORD-002', cliente: 'María López', tel: '7222-3333', dir: 'Residencial Los Robles, Pol. B', producto: '35 lbs', cantidad: 2, total: 49.00, estado: 'En camino', hora: '09:15 AM' },
  { id: 'ORD-003', cliente: 'Carlos Ruiz', tel: '7999-8888', dir: 'Residencial San Antonio, Senda 3', producto: '10 lbs', cantidad: 1, total: 8.50, estado: 'Entregado', hora: '08:00 AM' }
];

export default function AdminPanel() {
  const { agenciaSlug } = useParams();
  const [agencia, setAgencia] = useState(null);
  const [pedidos, setPedidos] = useState(mockPedidos);
  
  // Leemos si ya había iniciado sesión previamente
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');

  useEffect(() => {
    getAgenciaBySlug(agenciaSlug).then(setAgencia).catch(console.error);
  }, [agenciaSlug]);

  const cambiarEstado = (id, nuevoEstado) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  };

  // Función para iniciar sesión
  const handleLogin = () => {
    sessionStorage.setItem('adminAuth', 'true');
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!agencia) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando panel... ⏳</div>;

  // Si no está autenticado, mostramos la pantalla de login
  if (!isAuthenticated) {
    return <AdminLogin agencia={agencia} onLogin={handleLogin} />;
  }

  // Si está autenticado, mostramos el panel
  return (
    <div className="page" style={{ '--primary': agencia.tema?.primary || '#e85d04', maxWidth: '600px', margin: '20px auto' }}>
      
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>Panel de Pedidos</h2>
          <span className="tagline" style={{ marginLeft: 0 }}>{agencia.nombre}</span>
        </div>
        
        {/* Agregamos el botón para cerrar sesión */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer', padding: 0 }}
          >
            Cerrar sesión
          </button>
          <Link to={`/${agenciaSlug}`} style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
            Ver Tienda ↗
          </Link>
        </div>
      </div>

      <div className="main" style={{ padding: '20px', background: 'var(--bg-body)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={{ 
              border: `1.5px solid ${pedido.estado === 'Entregado' ? 'var(--success-border)' : 'var(--border-color)'}`, 
              padding: '15px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ color: 'var(--text-main)' }}>#{pedido.id}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pedido.hora}</span>
              </div>
              
              <div style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '12px', lineHeight: '1.5' }}>
                <div>👤 <strong>{pedido.cliente}</strong> ({pedido.tel})</div>
                <div>📍 {pedido.dir}</div>
                <div>🔥 {pedido.cantidad}x Cilindro de {pedido.producto} — <strong>${pedido.total.toFixed(2)}</strong></div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
                <label style={{ margin: 0, fontSize: '13px', fontWeight: 'bold' }}>Estado:</label>
                <select 
                  value={pedido.estado} 
                  onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                  style={{ 
                    padding: '6px 12px', 
                    width: 'auto', 
                    flex: 1,
                    backgroundColor: pedido.estado === 'Entregado' ? 'var(--success-bg)' : 'var(--bg-element)',
                    color: pedido.estado === 'Entregado' ? 'var(--success)' : 'var(--text-main)',
                    borderColor: pedido.estado === 'Entregado' ? 'var(--success-border)' : 'var(--border-color)'
                  }}
                >
                  <option value="Pendiente">🟡 Pendiente</option>
                  <option value="Confirmado">🔵 Confirmado</option>
                  <option value="En camino">🚚 En camino</option>
                  <option value="Entregado">✅ Entregado</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}