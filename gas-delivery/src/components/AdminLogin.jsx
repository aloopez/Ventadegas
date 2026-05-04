import { useState } from 'react';
import { loginAdmin } from '../services/api';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Necesitamos actualizar api.js para que reciba email y password
      const data = await loginAdmin(email, password);
      
      localStorage.setItem('adminToken', data.token);
      onLogin(true);
    } catch (err) {
      console.error(err);
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Acceso Administrativo</h2>
        <p>Ingresa tus credenciales para continuar.</p>
        
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          required
          autoFocus
        />
        
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        
        {error && <div className="error-text" style={{color: 'var(--error)'}}>{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}