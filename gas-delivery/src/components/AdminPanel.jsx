import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// 1. IMPORTAMOS LA NUEVA FUNCIÓN AQUÍ
import { getAgenciaBySlug, getPedidosByAgencia, updateEstadoPedido, simularNuevoPedido } from '../services/api';
import AdminLogin from './AdminLogin';

export default function AdminPanel() {
  const { agenciaSlug } = useParams();
  const [agencia, setAgencia] = useState(null);
  
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false); // Estado para el botón de simular
  
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('adminAuth') === 'true');

  const cargarPedidos = () => {
    getPedidosByAgencia(agenciaSlug).then(data => {
      setPedidos(data);
      setLoadingPedidos(false);
    });
  };

  useEffect(() => {
    getAgenciaBySlug(agenciaSlug).then(setAgencia).catch(console.error);
    
    if (isAuthenticated) {
      setLoadingPedidos(true);
      cargarPedidos();
    }
  }, [agenciaSlug, isAuthenticated]);

  const cambiarEstado = (id, nuevoEstado) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    updateEstadoPedido(id, nuevoEstado).catch(console.error);
  };

  // 2. NUEVA FUNCIÓN PARA EL BOTÓN
  const handleSimularPedido = () => {
    setIsSimulating(true);
    simularNuevoPedido(agenciaSlug).then(() => {
      // Cuando se crea el pedido, volvemos a cargar la lista para que aparezca
      cargarPedidos();
      setIsSimulating(false);
    });
  };

  const handleLogin = () => {
    sessionStorage.setItem('adminAuth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!agencia) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando panel... ⏳</div>;

  if (!isAuthenticated) return <AdminLogin agencia={agencia} onLogin={handleLogin} />;

  return (
    <div className="page" style={{ '--primary': agencia.tema?.primary || '#e85d04', maxWidth: '600px', margin: '20px auto' }}>
      
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)' }}>Panel de Pedidos</h2>
          <span className="tagline" style={{ marginLeft: 0 }}>{agencia.nombre}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
            Cerrar sesión
          </button>
          <Link to={`/${agenciaSlug}`} style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
            Ver Tienda ↗
          </Link>
        </div>
      </div>

      <div className="main" style={{ padding: '20px', background: 'var(--bg-body)' }}>
        
        {/* 3. BOTÓN PARA SIMULAR EL PEDIDO */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          <button 
            onClick={handleSimularPedido} 
            disabled={isSimulating}
            style={{
              background: 'var(--text-main)',
              color: 'var(--bg-body)',
              border: 'none',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
              opacity: isSimulating ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {isSimulating ? 'Generando...' : '✨ Simular nuevo pedido'}
          </button>
        </div>

        {loadingPedidos ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Obteniendo pedidos recientes... 🔄</div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No hay pedidos en este momento.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Aquí va el código del mapeo de pedidos que ya tenías */}
            {pedidos.map(pedido => (
              <div key={pedido.id} style={{ border: `1.5px solid ${pedido.estado === 'Entregado' ? 'var(--success-border)' : 'var(--border-color)'}`, padding: '15px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
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
                    style={{ padding: '6px 12px', width: 'auto', flex: 1, backgroundColor: pedido.estado === 'Entregado' ? 'var(--success-bg)' : 'var(--bg-element)', color: pedido.estado === 'Entregado' ? 'var(--success)' : 'var(--text-main)', borderColor: pedido.estado === 'Entregado' ? 'var(--success-border)' : 'var(--border-color)' }}
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
        )}
      </div>
    </div>
  );
}