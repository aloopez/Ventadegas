# Ventadegas

Plataforma web **multitenant** (modelo tipo **suscripción**) para que distintos negocios puedan **gestionar sus ventas**, **administrar pedidos** y **analizar datos** desde una sola aplicación.

Este repositorio incluye:

- **Frontend**: Vite + React (puerto **5173**)
- **Backend**: Node.js + Express (puerto **3000**)
- **Base de datos**: MySQL

---

## Estructura del proyecto

- **Frontend:** `gas-delivery/`
- **Backend:** `gas-delivery-backend/`

---

## Requisitos

- Node.js (recomendado: LTS)
- npm
- MySQL (recomendado: 8.x)
- MySQL Workbench (opcional)

---

## Instalación (clonar)

```bash
git clone https://github.com/aloopez/Ventadegas.git
cd Ventadegas
```

---

## Backend (Node.js + Express + MySQL)

Carpeta: `gas-delivery-backend/`

### 1) Instalar dependencias

```bash
cd gas-delivery-backend
npm install
```

### 2) Variables de entorno (.env)

Crea `gas-delivery-backend/.env`:

```env
PORT=3000

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_password
DB_PORT=3306
DB_NAME=tu_base_de_datos
```

### 3) Base de datos

La base de datos se crea/gestiona manualmente (por ejemplo desde **MySQL Workbench**).

Asegúrate de:
- Crear la BD (`DB_NAME`)
- Tener usuario/clave correctos
- Tener las tablas necesarias según el modelo del proyecto

### 4) Levantar backend

```bash
node index.js
```

Backend en:
- `http://localhost:3000`

---

## Endpoints del Backend (API)

Definidos en: `gas-delivery-backend/index.js`

### Agencias
- `GET /api/agencias/:slug`  
  Obtiene la agencia por `slug` e incluye sus **zonas**.

- `GET /api/agencias/:slug/productos`  
  Obtiene los productos de una agencia por `slug`.

### Pedidos
- `POST /api/pedidos`  
  Crea un pedido (desde la tienda). Genera un `codigo_pedido` tipo `ORD-####`.

  Body esperado:
  - `agencia_id`
  - `cliente_nombre`
  - `cliente_telefono`
  - `direccion_entrega`
  - `total`
  - `detalles`

- `GET /api/agencias/:slug/pedidos`  
  Lista pedidos de la agencia (para admin), ordenados por `fecha_creacion` desc.

- `PATCH /api/pedidos/:id/estado`  
  Actualiza el estado de un pedido.

  Body:
  - `estado`

---

## Frontend (Vite + React)

Carpeta: `gas-delivery/`

### 1) Instalar dependencias

```bash
cd gas-delivery
npm install
```

### 2) Levantar frontend

```bash
npm run dev
```

Frontend en:
- `http://localhost:5173`

---

## Conexión Frontend ↔ Backend (sin proxy)

El frontend apunta directo al backend:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

El backend habilita CORS usando `cors()` para permitir requests desde el frontend durante desarrollo.

---

## Multitenancy

El producto es **multitenant** (suscripción para negocios).  
Los negocios/tenants se identifican por un `slug` (por ejemplo en la API):

- `/api/agencias/:slug`
- `/api/agencias/:slug/productos`
- `/api/agencias/:slug/pedidos`

---

## Licencia

Sin licencia declarada por el momento (uso reservado por el autor).
