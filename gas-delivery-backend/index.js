import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './src/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- HELPER: Generar código de pedido ---
const generarCodigo = () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

// 1. OBTENER AGENCIA (Incluye sus zonas)
app.get('/api/agencias/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    // Buscamos la agencia
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
      zonas: zonasArr, // <--- Esto arregla el error de "undefined (reading '0')"
      tema: {
        primary: a.color_primario || '#2563eb'
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
  const { agencia_id, cliente_nombre, cliente_telefono, direccion_entrega, total, detalles } = req.body;
  const codigo = generarCodigo();

  try {
    const query = `INSERT INTO pedidos (codigo_pedido, agencia_id, cliente_nombre, cliente_telefono, direccion_entrega, total, detalles) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(query, [codigo, agencia_id, cliente_nombre, cliente_telefono, direccion_entrega, total, detalles]);
    
    res.status(201).json({ id: result.insertId, codigo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
});

// 4. OBTENER PEDIDOS DE UNA AGENCIA (Para el Admin)
app.get('/api/agencias/:slug/pedidos', async (req, res) => {
  const { slug } = req.params;
  try {
    const query = `
      SELECT p.* FROM pedidos p 
      JOIN agencias a ON p.agencia_id = a.id 
      WHERE a.slug = ? 
      ORDER BY p.fecha_creacion DESC`;
    const [pedidos] = await pool.query(query, [slug]);
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. ACTUALIZAR ESTADO DE PEDIDO (Desde el Admin)
app.patch('/api/pedidos/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));