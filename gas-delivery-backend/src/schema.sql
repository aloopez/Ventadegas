-- ============================================================
-- VENTADEGAS - Esquema de Base de Datos MySQL
-- Plataforma SaaS de distribución de gas a domicilio
-- ============================================================

-- Tabla de agencias (cada agencia es un "tenant" del SaaS)
CREATE TABLE IF NOT EXISTS agencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  color_primario VARCHAR(20) DEFAULT '#e85d04',
  hora_apertura TIME DEFAULT '07:00:00',
  hora_cierre TIME DEFAULT '19:00:00',
  costo_envio DECIMAL(6,2) DEFAULT 3.00,
  envio_gratis_desde DECIMAL(6,2) DEFAULT 30.00,
  pausado TINYINT(1) DEFAULT 0,
  banco_nombre VARCHAR(100),
  cuenta_bancaria VARCHAR(30),
  cuenta_titular VARCHAR(100),
  logo VARCHAR(10),
  slogan VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_agencias_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de zonas de entrega por agencia
CREATE TABLE IF NOT EXISTS zonas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agencia_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE,
  INDEX idx_zonas_agencia (agencia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos (cilindros de gas) por agencia
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agencia_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  peso VARCHAR(20),
  uso VARCHAR(200),
  precio DECIMAL(6,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE,
  INDEX idx_productos_agencia (agencia_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clientes
-- NOTA: Los clientes son globales (un mismo DUI puede pedir de múltiples agencias)
-- Si se necesita aislamiento estricto por agencia, agregar agencia_id aquí.
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dui VARCHAR(10) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_dui (dui),
  INDEX idx_clientes_dui (dui)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo_pedido VARCHAR(20) NOT NULL,
  agencia_id INT NOT NULL,
  cliente_id INT NOT NULL,
  direccion_entrega TEXT NOT NULL,
  total DECIMAL(8,2) NOT NULL,
  detalles TEXT,
  estado ENUM('Pendiente', 'Confirmado', 'En camino', 'Entregado', 'Cancelado') DEFAULT 'Pendiente',
  latitud DECIMAL(10,7),
  longitud DECIMAL(10,7),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE RESTRICT,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_codigo (codigo_pedido),
  INDEX idx_pedidos_agencia (agencia_id),
  INDEX idx_pedidos_cliente (cliente_id),
  INDEX idx_pedidos_estado (estado),
  INDEX idx_pedidos_fecha (fecha_creacion),
  INDEX idx_pedidos_agencia_estado (agencia_id, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS usuarios_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agencia_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('dueño', 'admin', 'cajero') DEFAULT 'cajero',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agencia_id) REFERENCES agencias(id) ON DELETE CASCADE,
  INDEX idx_usuarios_agencia (agencia_id),
  INDEX idx_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
