import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere un token.' });
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.admin = decodificado;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const verificarApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const superSecret = process.env.SUPER_ADMIN_SECRET;

  if (!superSecret) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  if (apiKey !== superSecret) {
    return res.status(403).json({ error: 'Acceso denegado: Llave maestra incorrecta o faltante' });
  }

  next();
};

export const ESTADOS_VALIDOS = ['Pendiente', 'Confirmado', 'En camino', 'Entregado', 'Cancelado'];
