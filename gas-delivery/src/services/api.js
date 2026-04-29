// src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

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

// 3. Obtener pedidos para el Panel Admin
export const getPedidosByAgencia = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/agencias/${slug}/pedidos`);
  if (!response.ok) throw new Error('Error al obtener pedidos');
  return await response.json();
};

// 4. Actualizar estado de un pedido
export const updateEstadoPedido = async (id, nuevoEstado) => {
  const response = await fetch(`${API_BASE_URL}/pedidos/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
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

// 6. FUNCIÓN QUE FALTABA: Simular pedido enviándolo al backend real
export const simularNuevoPedido = async (agenciaSlug) => {
  // Primero necesitamos el ID de la agencia (puedes ajustarlo si el ID es distinto)
  // Para este ejemplo asumimos que trabajamos con la agencia ID: 1
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