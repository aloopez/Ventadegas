// 3. CREAR UN PEDIDO (Desde la Tienda)
app.post('/api/pedidos', async (req, res) => {
  // Extraemos 'cantidad' del body para validarla
  const { agencia_id, dui, cliente_nombre, cliente_telefono, direccion_entrega, total, detalles, cantidad } = req.body;
  
  // --- REGLA 1: HORARIOS DE OPERACIÓN ---
  // Forzamos la zona horaria a El Salvador (GMT-6)
  const svTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/El_Salvador" }));
  const horaActual = svTime.getHours();
  
  if (horaActual < 7 || horaActual >= 19) {
    return res.status(400).json({ error: 'Fuera de horario de servicio. Atendemos de 7:00 AM a 7:00 PM.' });
  }

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
    } else {
      // El cliente es nuevo, lo insertamos en la BD
      const [nuevoCliente] = await pool.query(
        'INSERT INTO clientes (dui, nombre, telefono) VALUES (?, ?, ?)', 
        [dui, cliente_nombre, cliente_telefono]
      );
      cliente_id = nuevoCliente.insertId;
    }

    // 2. Insertar el pedido usando el cliente_id
    const queryPedido = `INSERT INTO pedidos (codigo_pedido, agencia_id, cliente_id, direccion_entrega, total, detalles)
                         VALUES (?, ?, ?, ?, ?, ?)`;
                         
    const [result] = await pool.query(queryPedido, [codigo, agencia_id, cliente_id, direccion_entrega, total, detalles]);
         
    res.status(201).json({ id: result.insertId, codigo });

  } catch (err) {
    console.error("Error al crear pedido:", err);
    res.status(500).json({ error: 'Error al procesar el pedido o cliente' });
  }
});

// 4. OBTENER PEDIDOS DE UNA AGENCIA (Para el Admin)
app.get('/api/agencias/:slug/pedidos', async (req, res) => {
  const { slug } = req.params;
  try {
    // CORRECCIÓN PROACTIVA: Unimos la tabla clientes para recuperar el nombre y teléfono
    const query = `
      SELECT p.*, c.nombre as cliente_nombre, c.telefono as cliente_telefono, c.dui 
      FROM pedidos p 
      JOIN agencias a ON p.agencia_id = a.id 
      JOIN clientes c ON p.cliente_id = c.id
      WHERE a.slug = ? 
      ORDER BY p.fecha_creacion DESC`;
    const [pedidos] = await pool.query(query, [slug]);
    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});