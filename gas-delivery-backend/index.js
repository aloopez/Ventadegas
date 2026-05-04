import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './src/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Para manejar contraseñas de admin de forma segura

dotenv.config();

const app = express();
const PORT = process.env.DB_PORT || 3000;

app.use(cors());
app.use(express.json());

// --- HELPER: Generar código de pedido ---
const generarCodigo = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

// --- CONFIGURACIÓN JWT ---
// En producción, pondrás esto en tu .env. Por ahora usamos un valor por defecto.
const JWT_SECRET = process.env.JWT_SECRET || 'llave_super_secreta_ventadegas';

// Esta función revisará si la petición trae un token válido
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // El token suele venir como "Bearer eyJhbGci..."
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere un token.' });
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.admin = decodificado; // Guardamos los datos del admin en la petición
    next(); // El token es válido, dejamos pasar la petición
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

app.get('/api/agencias/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    // Buscamos la agencia
    console.log("Conectando a:", process.env.DB_HOST);
    const [agenciaRows] = await pool.query('SELECT * FROM agencias WHERE slug = ?', [slug]);
    
    if (agenciaRows.length === 0) {
      return res.status(404).json({ error: 'Agencia no encontrada' });
    }

    const a = agenciaRows[0];

    // Buscamos las zonas para esta agencia
    const [zonaRows] = await pool.query('SELECT nombre FROM zonas WHERE agencia_id = ?', [a.id]);
    const zonasArr = zonaRows.map(z => z.nombre);

    // Enviamos el objeto completo como lo espera el frontend
    res.json({
      id: a.id,
      nombre: a.nombre,
      slug: a.slug,
      telefono: a.telefono,
      zonas: zonasArr,
      // --- MAGIA MULTI-AGENCIA: Nuevos campos expuestos ---
      color_primario: a.color_primario,
      hora_apertura: a.hora_apertura,
      hora_cierre: a.hora_cierre,
      costo_envio: a.costo_envio,
      envio_gratis_desde: a.envio_gratis_desde,
      pausado: a.pausado === 1,
      // ----------------------------------------------------
      tema: {
        primary: a.color_primario || '#2563eb' // Lo dejamos por si tienes código viejo usándolo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. OBTENER PRODUCTOS DE UNA AGENCIA
app.get('/api/agencias/:slug/productos', async (req, res) => {
  const { slug } = req.params;
  try {
    const query = `
      SELECT p.* FROM productos p
      JOIN agencias a ON p.agencia_id = a.id
      WHERE a.slug = ?
    `;
    const [productos] = await pool.query(query, [slug]);
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 3. CREAR UN PEDIDO (Desde la Tienda)
app.post('/api/pedidos', async (req, res) => {
  // Extraemos 'cantidad' del body para validarla
  const { agencia_id, dui, cliente_nombre, cliente_telefono, direccion_entrega, total, detalles, cantidad, latitud, longitud } = req.body;
  
  // --- REGLA 1: HORARIOS DE OPERACIÓN ---
  /* COMENTADO PARA TESTING
  const svTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/El_Salvador" }));
  const horaActual = svTime.getHours();
  
  if (horaActual < 7 || horaActual >= 19) {
    return res.status(400).json({ error: 'Fuera de horario de servicio. Atendemos de 7:00 AM a 7:00 PM.' });
  }
  */

  // --- REGLA 2: VALIDACIÓN DE TELÉFONO ESTRICTA ---
  const telefonoLimpio = cliente_telefono.replace(/\D/g, '');
  if (!/^[267]\d{7}$/.test(telefonoLimpio)) {
    return res.status(400).json({ error: 'Número de teléfono inválido. Debe iniciar con 2, 6 o 7 y tener 8 dígitos.' });
  }

  // --- REGLA 3: LÍMITE DE TAMBOS ---
  if (!cantidad || cantidad < 1 || cantidad > 10) {
    return res.status(400).json({ error: 'La cantidad de cilindros debe estar entre 1 y 10.' });
  }

  const codigo = generarCodigo();

  try {
    // 1. Buscar si el cliente ya existe por su DUI
    const [clienteExistente] = await pool.query('SELECT id FROM clientes WHERE dui = ?', [dui]);
    
    let cliente_id;

    if (clienteExistente.length > 0) {
      // El cliente ya existe, tomamos su ID
      cliente_id = clienteExistente[0].id;
      
      // --- NUEVO: Actualizamos sus datos por si cambió de nombre o teléfono ---
      await pool.query(
        'UPDATE clientes SET nombre = ?, telefono = ? WHERE id = ?',
        [cliente_nombre, cliente_telefono, cliente_id]
      );
      // ----------------------------------------------------------------------
      
    } else {
      // El cliente es nuevo, lo insertamos en la BD
      const [nuevoCliente] = await pool.query(
        'INSERT INTO clientes (dui, nombre, telefono) VALUES (?, ?, ?)', 
        [dui, cliente_nombre, cliente_telefono]
      );
      cliente_id = nuevoCliente.insertId;
    }

    // 2. Insertar el pedido usando el cliente_id (ACTUALIZADO CON GPS)
    const queryPedido = `INSERT INTO pedidos (codigo_pedido, agencia_id, cliente_id, direccion_entrega, total, detalles, latitud, longitud)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                         
    // Si latitud o longitud no vienen, mandamos null para que MySQL no se queje
    const [result] = await pool.query(queryPedido, [
      codigo, 
      agencia_id, 
      cliente_id, 
      direccion_entrega, 
      total, 
      detalles, 
      latitud || null, 
      longitud || null
    ]);

    res.status(201).json({ id: result.insertId, codigo });

  } catch (err) {
    console.error("Error al crear pedido:", err);
    res.status(500).json({ error: 'Error al procesar el pedido o cliente' });
  }
});

// 4. OBTENER PEDIDOS DE UNA AGENCIA (Para el Admin)
app.get('/api/agencias/:slug/pedidos', verificarToken, async (req, res) => {
  const { slug } = req.params;
  const adminAgenciaId = req.admin.agencia_id; // <-- Extraemos la agencia del cajero logueado

  try {
    const query = `
      SELECT p.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, c.dui 
       FROM pedidos p 
       JOIN agencias a ON p.agencia_id = a.id 
       JOIN clientes c ON p.cliente_id = c.id
      WHERE a.slug = ? AND p.agencia_id = ? -- BLINDAJE: Verificamos que sea su agencia
       ORDER BY p.fecha_creacion DESC`;
       
    const [pedidos] = await pool.query(query, [slug, adminAgenciaId]);
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. ACTUALIZAR ESTADO DE PEDIDO (Desde el Admin)
app.patch('/api/pedidos/:id/estado', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const adminAgenciaId = req.admin.agencia_id;

  try {
    // BLINDAJE: Agregamos AND agencia_id = ?
    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ? AND agencia_id = ?', 
      [estado, id, adminAgenciaId]
    );

    // Si affectedRows es 0, significa que el pedido no existe o es de otra distribuidora
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este pedido' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscamos al usuario por su correo
    const [usuarios] = await pool.query(
      'SELECT * FROM usuarios_admin WHERE email = ? AND activo = TRUE', 
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];

    // 2. Comparamos la contraseña enviada con el hash de la BD
    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Generamos el JWT, pero ahora guardamos la agencia_id y el rol
    const payload = {
      usuario_id: usuario.id,
      agencia_id: usuario.agencia_id, // ¡Súper importante para multitenancy!
      rol: usuario.rol
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    
    // Devolvemos el token y datos extra si el frontend los necesita
    res.json({ 
      token, 
      usuario: { nombre: usuario.nombre, rol: usuario.rol } 
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
// 1. Obtener los productos específicos de una agencia
app.get('/api/agencias/:id/productos', async (req, res) => {
  try {
    const [productos] = await pool.query('SELECT * FROM productos WHERE agencia_id = ?', [req.params.id]);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apagar o encender la tienda (Botón de Emergencia)
app.put('/api/agencias/:id/pausar', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { pausado } = req.body;

  // BLINDAJE: ¿El ID de la URL es igual al de la agencia de este Admin?
  if (parseInt(id) !== req.admin.agencia_id) {
    return res.status(403).json({ error: 'Acceso denegado a esta sucursal' });
  }

  try {
    await pool.query('UPDATE agencias SET pausado = ? WHERE id = ?', [pausado, id]);
    res.json({ success: true, pausado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar el precio de un cilindro
app.put('/api/productos/:id/precio', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;
  const adminAgenciaId = req.admin.agencia_id;

  try {
    // BLINDAJE: Asegurarnos de que el producto que actualiza pertenezca a su agencia
    const [result] = await pool.query(
      'UPDATE productos SET precio = ? WHERE id = ? AND agencia_id = ?', 
      [precio, id, adminAgenciaId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    res.json({ success: true, precio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Actualizar el precio de un cilindro
app.put('/api/productos/:id/precio', async (req, res) => {
  const { precio } = req.body;
  try {
    await pool.query('UPDATE productos SET precio = ? WHERE id = ?', [precio, req.params.id]);
    res.json({ success: true, precio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));