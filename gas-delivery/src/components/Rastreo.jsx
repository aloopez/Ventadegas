import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRastreoPedido } from '../services/api';

export default function Rastreo() {
  const { codigo } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getRastreoPedido(codigo)
      .then(data => {
        setPedido(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [codigo]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Buscando pedido ⏳...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'var(--error)' }}>❌ Pedido no encontrado. Verifica el código.</div>;

  const estados = ['Pendiente', 'Confirmado', 'En camino', 'Entregado'];
  const estadoActualIndex = estados.indexOf(pedido.estado);
  const isCancelado = pedido.estado === 'Cancelado';

  return (
    <div className="page" style={{ padding: '20px', maxWidth: '500px' }}>
      <div style={{ background: 'var(--bg-app)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', margin: '0 0 5px 0' }}>Rastreo de Pedido</h2>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>{pedido.codigo_pedido}</div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
            {pedido.agencia_nombre} • {new Date(pedido.fecha_creacion).toLocaleDateString('es-ES')}
          </p>
        </div>

        {isCancelado ? (
          <div style={{ padding: '15px', background: 'var(--error-bg)', color: 'var(--error)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 'bold' }}>
            🚫 Este pedido fue cancelado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            {estados.map((estado, index) => {
              const completado = index <= estadoActualIndex;
              const activo = index === estadoActualIndex;
              
              return (
                <div key={estado} style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: completado ? 1 : 0.4 }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    background: activo ? 'var(--primary)' : completado ? 'var(--success)' : 'var(--border)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                  }}>
                    {completado ? '✓' : ''}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: activo ? 'bold' : 'normal', color: activo ? 'var(--primary)' : 'var(--text-main)' }}>
                    {estado}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '15px', borderTop: '1px dashed var(--border)', textAlign: 'center' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: 'var(--bg-element)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Actualizar estado
          </button>
        </div>
      </div>
    </div>
  );
}