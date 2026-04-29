import { useState } from 'react';

export default function AdminLogin({ agencia, onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulación de validación en la base de datos (MVP)
    // Para probar, la contraseña será "admin123"
    if (password === 'admin123') {
      onLogin();
    } else {
      setError('Contraseña incorrecta. Pista: admin123');
    }
  };

  return (
    <div className="page" style={{ 
      '--primary': agencia?.tema?.primary || '#e85d04', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'var(--bg-body)'
    }}>
      <div style={{ 
        background: 'var(--bg-card)', 
        padding: '30px', 
        borderRadius: 'var(--radius-lg)', 
        boxShadow: 'var(--shadow-md)', 
        width: '90%', 
        maxWidth: '350px', 
        textAlign: 'center' 
      }}>
        <h2 style={{ color: 'var(--text-main)', margin: '0 0 5px 0' }}>Panel de Control</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px', marginTop: 0 }}>
          {agencia?.nombre}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="password"
            placeholder="Ingresa la contraseña"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(''); // Limpiamos el error al escribir
            }}
            style={{ 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)', 
              background: 'var(--bg-element)', 
              color: 'var(--text-main)',
              fontSize: '15px'
            }}
          />
          
          {error && (
            <span style={{ color: '#ef4444', fontSize: '13px', textAlign: 'left' }}>
              {error}
            </span>
          )}
          
          <button type="submit" style={{ 
            background: 'var(--primary)', 
            color: 'white', 
            padding: '12px', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            fontSize: '15px',
            marginTop: '5px'
          }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}