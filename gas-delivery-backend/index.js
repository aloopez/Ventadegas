import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './src/db.js';
import { verificarToken, verificarApiKey, ESTADOS_VALIDOS } from './src/middleware/auth.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN JWT ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no está definido en las variables de entorno.');
  process.exit(1);
}

// --- MIDDLEWARES GLOBALES ---
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));
app.use(express.json({ limit: '10kb' }));

// --- HELPERS ---
const generarCodigo = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts.slice(-4)}${rand}`;
};

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

// 1. Obtener datos de una agencia por slug
app.get('/api/agencias/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const [agenciaRows] = await pool.query('SELECT * FROM agencias WHERE slug = ?', [slug]);
    if (agenciaRows.length === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }

    const a = agenciaRows[0];
    const [zonaRows] = await pool.query('SELECT nombre FROM zonas WHERE agencia_id = ?', [a.id]);

    res.json({
      id: a.id,
      nombre: a.nombre,
      slug: a.slug,
      telefono: a.telefono,
      zonas: zonaRows.map(z => z.nombre),
      color_primario: a.color_primario,
      hora_apertura: a.hora_apertura,
      hora_cierre: a.hora_cierre,
      costo_envio: a.costo_envio,
      envio_gratis_desde: a.envio_gratis_desde,
      pausado: a.pausado === 1,
      banco_nombre: a.banco_nombre,
      cuenta_bancaria: a.cuenta_bancaria,
      cuenta_titular: a.cuenta_titular,
      logo: a.logo,
      slogan: a.slogan,
      tema: { primary: a.color_primario || '#2563eb' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la agencia' });
  }
});

// 2. Obtener productos de una agencia
app.get('/api/agencias/:slug/productos', async (req, res) => {
  const { slug } = req.params;
  try {
    const [productos] = await pool.query(
      `SELECT p.* FROM productos p JOIN agencias a ON p.agencia_id = a.id WHERE a.slug = ?`,
      [slug]
    );
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 3. Crear un pedido (público)
app.post('/api/pedidos', async (req, res) => {
  const { agencia_id, dui, cliente_nombre, cliente_telefono, direccion_entrega, total, detalles, cantidad, latitud, longitud } = req.body;

  if (!agencia_id || !dui || !cliente_nombre || !cliente_telefono || !direccion_entrega || !total) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para crear el pedido.' });
  }

  // Verificar que la agencia exista y no esté pausada
  const [agenciaRows] = await pool.query('SELECT id, pausado FROM agencias WHERE id = ?', [agencia_id]);
  if (agenciaRows.length === 0) {
    return res.status(404).json({ error: 'La agencia especificada no existe.' });
  }
  if (agenciaRows[0].pausado === 1) {
    return res.status(400).json({ error: 'La tienda está pausada temporalmente. Intenta más tarde.' });
  }

  // Validación de teléfono
  const telefonoLimpio = cliente_telefono.replace(/\D/g, '');
  if (!/^[267]\d{7}$/.test(telefonoLimpio)) {
    return res.status(400).json({ error: 'Número de teléfono inválido. Debe iniciar con 2, 6 o 7 y tener 8 dígitos.' });
  }

  // Validación de cantidad
  if (!cantidad || cantidad < 1 || cantidad > 10) {
    return res.status(400).json({ error: 'La cantidad de cilindros debe estar entre 1 y 10.' });
  }

  const codigo = generarCodigo();

  try {
    // Buscar o crear cliente
    const [clienteExistente] = await pool.query('SELECT id FROM clientes WHERE dui = ?', [dui]);
    let cliente_id;

    if (clienteExistente.length > 0) {
      cliente_id = clienteExistente[0].id;
      await pool.query('UPDATE clientes SET nombre = ?, telefono = ? WHERE id = ?', [cliente_nombre, cliente_telefono, cliente_id]);
    } else {
      const [nuevoCliente] = await pool.query(
        'INSERT INTO clientes (dui, nombre, telefono) VALUES (?, ?, ?)',
        [dui, cliente_nombre, cliente_telefono]
      );
      cliente_id = nuevoCliente.insertId;
    }

    // Rate limiting: máximo 3 pedidos por hora por cliente
    const [recentOrders] = await pool.query(
      `SELECT COUNT(*) as count FROM pedidos WHERE cliente_id = ? AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [cliente_id]
    );
    if (recentOrders[0].count >= 3) {
      return res.status(429).json({
        error: 'Has alcanzado el límite de 3 pedidos por hora por seguridad. Si es una emergencia, escríbenos al WhatsApp.'
      });
    }

    // Insertar pedido
    const [result] = await pool.query(
      `INSERT INTO pedidos (codigo_pedido, agencia_id, cliente_id, direccion_entrega, total, detalles, latitud, longitud)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo, agencia_id, cliente_id, direccion_entrega, total, detalles, latitud || null, longitud || null]
    );

    res.status(201).json({ id: result.insertId, codigo });
  } catch (err) {
    console.error("Error al crear pedido:", err);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
});

// 4. Rastreo público de pedidos
app.get('/api/rastreo/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const [pedido] = await pool.query(
      `SELECT p.codigo_pedido, p.estado, p.fecha_creacion, p.total, p.direccion_entrega,
              a.nombre as agencia_nombre, a.telefono as agencia_telefono
       FROM pedidos p JOIN agencias a ON p.agencia_id = a.id
       WHERE p.codigo_pedido = ?`,
      [codigo]
    );
    if (pedido.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar el pedido' });
  }
});

// ============================================================
// RUTAS DE ADMIN (requieren token)
// ============================================================

// 5. Login admin
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios_admin WHERE email = ? AND activo = TRUE',
      [email]
    );
    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const payload = {
      usuario_id: usuario.id,
      agencia_id: usuario.agencia_id,
      rol: usuario.rol
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, usuario: { nombre: usuario.nombre, rol: usuario.rol } });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 6. Registro de usuario (protegido con API key)
app.post('/api/admin/registro', verificarApiKey, async (req, res) => {
  const { agencia_id, nombre, email, password, rol } = req.body;

  if (!agencia_id || !nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const [existente] = await pool.query('SELECT id FROM usuarios_admin WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Este correo ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios_admin (agencia_id, nombre, email, password_hash, rol) VALUES (?, ?, ?, ?, ?)',
      [agencia_id, nombre, email, passwordHash, rol || 'dueño']
    );

    res.status(201).json({ success: true, mensaje: 'Usuario creado exitosamente', usuario_id: result.insertId });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 7. Obtener pedidos de una agencia (admin)
app.get('/api/agencias/:slug/pedidos', verificarToken, async (req, res) => {
  const { slug } = req.params;
  const adminAgenciaId = req.admin.agencia_id;
  try {
    const [pedidos] = await pool.query(
      `SELECT p.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, c.dui
       FROM pedidos p
       JOIN agencias a ON p.agencia_id = a.id
       JOIN clientes c ON p.cliente_id = c.id
       WHERE a.slug = ? AND p.agencia_id = ?
       ORDER BY p.fecha_creacion DESC`,
      [slug, adminAgenciaId]
    );
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// 8. Obtener métricas del dashboard (admin)
app.get('/api/agencias/:slug/metricas', verificarToken, async (req, res) => {
  const { slug } = req.params;
  const adminAgenciaId = req.admin.agencia_id;
  try {
    const [hoy] = await pool.query(
      `SELECT COUNT(p.id) as total_pedidos, COALESCE(SUM(p.total), 0) as ingresos
       FROM pedidos p JOIN agencias a ON p.agencia_id = a.id
       WHERE a.slug = ? AND p.agencia_id = ? AND p.estado = 'Entregado'
         AND DATE(DATE_SUB(p.fecha_creacion, INTERVAL 6 HOUR)) = DATE(DATE_SUB(NOW(), INTERVAL 6 HOUR))`,
      [slug, adminAgenciaId]
    );

    const [pendientes] = await pool.query(
      `SELECT COUNT(p.id) as pendientes
       FROM pedidos p JOIN agencias a ON p.agencia_id = a.id
       WHERE a.slug = ? AND p.agencia_id = ? AND p.estado IN ('Pendiente', 'Confirmado', 'En camino')`,
      [slug, adminAgenciaId]
    );

    const [semana] = await pool.query(
      `SELECT DATE(DATE_SUB(p.fecha_creacion, INTERVAL 6 HOUR)) as fecha,
              COUNT(p.id) as cantidad, COALESCE(SUM(p.total), 0) as ingresos
       FROM pedidos p JOIN agencias a ON p.agencia_id = a.id
       WHERE a.slug = ? AND p.agencia_id = ? AND p.estado = 'Entregado'
         AND DATE_SUB(p.fecha_creacion, INTERVAL 6 HOUR) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY fecha ORDER BY fecha ASC`,
      [slug, adminAgenciaId]
    );

    res.json({ hoy: hoy[0], pendientes: pendientes[0].pendientes, semana });
  } catch (error) {
    console.error("Error al cargar métricas:", error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// 9. Actualizar estado de pedido (admin)
app.patch('/api/pedidos/:id/estado', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const adminAgenciaId = req.admin.agencia_id;

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ? AND agencia_id = ?',
      [estado, id, adminAgenciaId]
    );
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este pedido' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

// 10. Pausar/reanudar tienda (admin)
app.put('/api/agencias/:id/pausar', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { pausado } = req.body;

  if (parseInt(id) !== req.admin.agencia_id) {
    return res.status(403).json({ error: 'Acceso denegado a esta sucursal' });
  }

  try {
    await pool.query('UPDATE agencias SET pausado = ? WHERE id = ?', [pausado, id]);
    res.json({ success: true, pausado });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado de la tienda' });
  }
});

// 11. Actualizar precio de producto (admin)
app.put('/api/productos/:id/precio', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;
  const adminAgenciaId = req.admin.agencia_id;

  if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número mayor a 0' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE productos SET precio = ? WHERE id = ? AND agencia_id = ?',
      [precio, id, adminAgenciaId]
    );
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }
    res.json({ success: true, precio });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el precio' });
  }
});

// 12. Obtener productos por ID de agencia (utilidad admin)
app.get('/api/agencias/:id/productos', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT * FROM productos WHERE agencia_id = ?', [req.params.id]);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ============================================================
// ERROR HANDLER GLOBAL
// ============================================================
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
