# Ventadegas

Plataforma web **multitenant** (modelo tipo **suscripción / SaaS**) para que distintos negocios o distribuidoras de gas puedan **gestionar sus ventas**, **administrar pedidos**, **rastrear envíos** y **analizar métricas** desde una sola aplicación.

> 📄 Este README se genera automáticamente en cada push.  
> Última actualización: `2026-07-10 03:50:31 UTC`

---

## Estructura del proyecto

```
Ventadegas/
├── gas-delivery/                       # Frontend – Vite + React 19 (PWA) – puerto 5173
│   └── src/
│       ├── components/                 # UI: ProductSelector, ZoneSelector, CheckoutForm,
│       │                               #     Summary, AdminPanel, AdminLogin, Rastreo, Header,
│       │                               #     Toast, Skeleton, ProgressBar
│       ├── context/OrderContext.jsx    # Estado global del pedido (incluye currentStep)
│       └── services/api.js             # Cliente HTTP centralizado
└── gas-delivery-backend/               # Backend – Node.js + Express 5 + MySQL (Aiven)
    ├── index.js                        # Servidor Express, rutas, manejo de errores
    ├── src/
    │   ├── db.js                       # Pool de conexiones MySQL2
    │   ├── middleware/auth.js          # verificarToken, verificarApiKey, ESTADOS_VALIDOS
    │   └── schema.sql                  # Esquema SQL + índices (CREATE TABLE IF NOT EXISTS)
    └── .env.example                    # Plantilla de variables de entorno
```

---

## Requisitos

- Node.js (recomendado: LTS)
- npm
- MySQL 8.x (configurado con Aiven en producción)
- MySQL Workbench u otro cliente SQL (opcional)

---

## Instalación (clonar)

```bash
git clone https://github.com/aloopez/Ventadegas.git
cd Ventadegas
```

---

## Backend (Node.js + Express 5 + MySQL)

Carpeta: `gas-delivery-backend/`

### 1) Instalar dependencias

```bash
cd gas-delivery-backend
npm install
```

### 2) Variables de entorno (.env)

Copia la plantilla y completa tus valores:

```bash
cp .env.example .env
```

Contenido de `gas-delivery-backend/.env` (basado en `.env.example`):

```env
PORT=3000
DB_HOST=tu-host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=tu_password_aqui
DB_NAME=ventadegas
DB_PORT=25060
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
SUPER_ADMIN_SECRET=tu_super_admin_secret_aqui
CORS_ORIGIN=https://tu-dominio.com,http://localhost:5173
```

> ⚠️ El backend **falla al arrancar** si `JWT_SECRET` o `SUPER_ADMIN_SECRET` no están definidos (ya no hay fallback hardcoded inseguro).

### 3) Base de datos

El esquema está versionado en `gas-delivery-backend/src/schema.sql` e incluye tablas, claves foráneas, `UNIQUE` constraints e **índices** de rendimiento (`agencia_id`, `estado`, `codigo_pedido`, `dui`, etc.).

Ejecútalo una vez contra tu base de datos:

```bash
# Desde consola MySQL
mysql -h TU_HOST -u TU_USUARIO -p TU_BASE_DE_DATOS < gas-delivery-backend/src/schema.sql
```

O pégalo en tu cliente GUI (DBeaver, Workbench, consola web de Aiven). Usa `CREATE TABLE IF NOT EXISTS`, por lo que es idempotente.

### 4) Levantar backend

```bash
node index.js        # producción
npm run dev          # desarrollo con nodemon
```

Backend en: `http://localhost:3000`

### Dependencias de producción

- `bcrypt` ^6.0.0
- `cors` ^2.8.6
- `dotenv` ^17.4.2
- `express` ^5.2.1
- `jsonwebtoken` ^9.0.3
- `mysql2` ^3.22.3

### Dependencias de desarrollo

- `nodemon` ^3.1.14

---

## Endpoints del Backend (API)

Definidos en `gas-delivery-backend/index.js`. Todas las consultas usan `mysql2` con parámetros (`?`), por lo que **no son vulnerables a SQL injection**.

| Método | Ruta |
|--------|------|
| `GET` | `/api/agencias/:slug` |
| `GET` | `/api/agencias/:slug/productos` |
| `POST` | `/api/pedidos` |
| `GET` | `/api/rastreo/:codigo` |
| `POST` | `/api/admin/login` |
| `POST` | `/api/admin/registro` |
| `GET` | `/api/agencias/:slug/pedidos` |
| `GET` | `/api/agencias/:slug/metricas` |
| `PATCH` | `/api/pedidos/:id/estado` |
| `PUT` | `/api/agencias/:id/pausar` |
| `PUT` | `/api/productos/:id/precio` |
| `GET` | `/api/agencias/:id/productos` |

---

## Frontend (Vite + React 19 + PWA)

Carpeta: `gas-delivery/`

### 1) Instalar dependencias

```bash
cd gas-delivery
npm install
```

> ✅ El proyecto pasó `npm audit fix`: **0 vulnerabilidades** conocidas.

### 2) Levantar frontend

```bash
npm run dev        # desarrollo en http://localhost:5173
npm run build      # build de producción (PWA)
npm run preview    # previsualizar build
```

Frontend en: `http://localhost:5173`

### Características de UI

- **Flujo de pedido en 4 pasos** con `ProgressBar` visual (Cilindro → Zona → Datos → Resumen).
- **Toasts** en vez de `alert()` para feedback de éxito/error.
- **Skeleton loaders** animados (shimmer) en cargas de productos, pedidos y tracking.
- **Modo oscuro** automático vía `prefers-color-scheme`.
- **PWA instalable** (service worker + manifest) desplegable en Vercel.
- **GPS / geolocalización** con reverse geocoding (OpenStreetMap) y mapa embebido.
- **Integración WhatsApp** para confirmación de pedido.

### Dependencias de producción

- `react` ^19.2.5
- `react-dom` ^19.2.5
- `react-router-dom` ^7.14.2

### Dependencias de desarrollo

- `@eslint/js` ^10.0.1
- `@types/react` ^19.2.14
- `@types/react-dom` ^19.2.3
- `@vitejs/plugin-legacy` ^8.0.1
- `@vitejs/plugin-react` ^6.0.1
- `eslint` ^10.2.1
- `eslint-plugin-react-hooks` ^7.1.1
- `eslint-plugin-react-refresh` ^0.5.2
- `globals` ^17.5.0
- `terser` ^5.46.2
- `vite` ^8.1.4
- `vite-plugin-pwa` ^1.2.0

---

## Conexión Frontend ↔ Backend

El frontend apunta directo a la URL del backend (definida en `src/services/api.js`, `API_BASE_URL`).

El backend usa CORS **restrictivo** (whitelist configurable vía `CORS_ORIGIN`). En desarrollo permite `localhost:5173`; en producción debes listar tu dominio.

---

## Seguridad y arquitectura (post-auditoría)

- **Multi-tenant**: aislamiento de datos por `agencia_id` en `pedidos` y `productos`. Los pedidos solo son visibles/editables por la agencia dueña del token (blindaje en cada query).
- **Autenticación**: JWT firmado con `JWT_SECRET` obligatorio; contraseñas hasheadas con `bcrypt`.
- **Registro admin**: protegido con `SUPER_ADMIN_SECRET` (header `x-api-key`).
- **SQL injection**: todas las queries usan parámetros `?` de `mysql2`.
- **Rate limiting**: máximo 3 pedidos/hora por cliente (DUI).
- **Manejo de errores**: middleware global + handlers de `unhandledRejection` / `uncaughtException`.
- **Límites**: body JSON limitado a 10kb para mitigar DoS.

---

## Multitenancy

El producto es **multitenant** (suscripción para negocios). Los tenants (agencias) se identifican por `slug` en la URL pública y por `agencia_id` en el token JWT para rutas protegidas:

- `/api/agencias/:slug`
- `/api/agencias/:slug/productos`
- `/api/agencias/:slug/pedidos` (protegido, aislado por token)

---

## Licencia

Sin licencia declarada por el momento (uso reservado por el autor).
