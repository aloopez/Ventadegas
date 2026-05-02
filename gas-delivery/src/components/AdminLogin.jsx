import { useState } from 'react';
import { loginAdmin } from '../services/api';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      // Intentamos iniciar sesión enviando la contraseña al backend
      const data = await loginAdmin(password);
      
      // Si funciona, guardamos el token que nos dio el backend
      localStorage.setItem('adminToken', data.token);
      
      // Le avisamos a la pantalla de AdminPanel que ya puede mostrar los pedidos
      onLogin(true);
    } catch (err) {
      console.error(err);
      setError(true); // Contraseña incorrecta
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Acceso Administrativo</h2>
        <p>Ingresa la contraseña para ver los pedidos.</p>
        
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoFocus
        />
        
        {error && <div className="error-msg">Contraseña incorrecta. Intenta de nuevo.</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}