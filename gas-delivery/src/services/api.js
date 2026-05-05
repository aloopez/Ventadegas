// src/services/api.js
const API_BASE_URL = 'https://ventadegas.onrender.com/api'; // Cambia esto si tu backend tiene otra URL

// =========================================================
// HELPER: INTERCEPTOR DE PETICIONES PROTEGIDAS
// =========================================================
const fetchProtegido = async (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, { ...options, headers });

  // Si el backend nos rechaza (Token expirado o sin permisos)
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminAuth');
    window.location.reload(); // Expulsa al usuario al login inmediatamente
    throw new Error('Sesión expirada o inválida');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en la petición');
  }

  return await response.json();
};

// 9. Obtener métricas del Dashboard
export const getMetricasAgencia = async (slug) => {
  return await fetchProtegido(`${API_BASE_URL}/agencias/${slug}/metricas`);
};

// =========================================================
// RUTAS PÚBLICAS (No necesitan Token)
// =========================================================

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

export const loginAdmin = async (email, password) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'Credenciales inválidas');
  }

  if (!data.token) {
    throw new Error('El servidor no devolvió un token válido.');
  }

  return data;  // { token, usuario: { nombre, rol } }
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


// =========================================================
// RUTAS PROTEGIDAS (Usan fetchProtegido)
// =========================================================

// 3. Obtener pedidos para el Panel Admin
export const getPedidosByAgencia = async (slug) => {
  return await fetchProtegido(`${API_BASE_URL}/agencias/${slug}/pedidos`);
};

// 4. Actualizar estado de un pedido
export const updateEstadoPedido = async (id, nuevoEstado) => {
  return await fetchProtegido(`${API_BASE_URL}/pedidos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: nuevoEstado }),
  });
};

// 7. Apagar o encender la tienda
export const togglePausarTienda = async (id, pausado) => {
  return await fetchProtegido(`${API_BASE_URL}/agencias/${id}/pausar`, {
    method: 'PUT',
    body: JSON.stringify({ pausado })
  });
};

// 8. Actualizar el precio
export const updatePrecioProducto = async (productoId, nuevoPrecio) => {
  return await fetchProtegido(`${API_BASE_URL}/productos/${productoId}/precio`, {
    method: 'PUT',
    body: JSON.stringify({ precio: nuevoPrecio })
  });
};