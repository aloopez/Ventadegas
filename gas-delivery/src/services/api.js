// src/services/api.js
const API_BASE_URL = 'https://ventadegas.onrender.com/api'; // Cambia esto si tu backend tiene otra URL

// 1. Obtener datos de la agencia
export const getAgenciaBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/agencias/${slug}`);
  if (!response.ok) throw new Error('Agencia no encontrada');
  return await response.json();
};

// 2. Obtener productos de la base de datos
export const getProductosByAgencia = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/agencias/${slug}/productos`);
  if (!response.ok) throw new Error('Error al cargar productos');
  return await response.json();
};

// --- NUEVO: FUNCIÓN PARA LOGIN ---
export const loginAdmin = async (password) => {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!response.ok) throw new Error('Contraseña incorrecta');
  return await response.json();
};

// 3. Obtener pedidos para el Panel Admin (ACTUALIZADO CON JWT)
export const getPedidosByAgencia = async (slug) => {
  const token = localStorage.getItem('adminToken'); // Buscamos la llave digital en el navegador
  const response = await fetch(`${API_BASE_URL}/agencias/${slug}/pedidos`, {
    headers: {
      'Authorization': `Bearer ${token}` // Entregamos la llave al backend
    }
  });
  if (!response.ok) throw new Error('Error al obtener pedidos');
  return await response.json();
};

// 4. Actualizar estado de un pedido (ACTUALIZADO CON JWT)
export const updateEstadoPedido = async (id, nuevoEstado) => {
  const token = localStorage.getItem('adminToken'); // Buscamos la llave digital en el navegador
  const response = await fetch(`${API_BASE_URL}/pedidos/${id}/estado`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Entregamos la llave al backend
    },
    body: JSON.stringify({ estado: nuevoEstado }),
  });
  return await response.json();
};

// 5. Crear un pedido (usado por el cliente)
export const crearPedido = async (datosPedido) => {
  const response = await fetch(`${API_BASE_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosPedido),
  });
  return await response.json();
};

// 6. Simular pedido enviándolo al backend real
export const simularNuevoPedido = async (agenciaSlug) => {
  const datosSimulados = {
    agencia_id: 1, 
    cliente_nombre: "Cliente Simulado",
    cliente_telefono: "7000-0000",
    direccion_entrega: "Dirección de prueba MySQL",
    total: 15.50,
    detalles: "1x Cilindro 25lbs (Simulado)"
  };
  return await crearPedido(datosSimulados);
};

export const getProductosByAgenciaId = async (id) => {
  const res = await fetch(`https://ventadegas.onrender.com/api/agencias/${id}/productos`);
  return res.json();
};

export const togglePausarTienda = async (id, pausado) => {
  const res = await fetch(`https://ventadegas.onrender.com/api/agencias/${id}/pausar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pausado })
  });
  return res.json();
};

export const updatePrecioProducto = async (productoId, nuevoPrecio) => {
  const res = await fetch(`https://ventadegas.onrender.com/api/productos/${productoId}/precio`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ precio: nuevoPrecio })
  });
  return res.json();
};