# Ventadegas

Plataforma web **multitenant** (modelo tipo **suscripción**) para que distintos negocios puedan **gestionar sus ventas**, **administrar pedidos** y **analizar datos** desde una sola aplicación.

> 📄 Este README se genera automáticamente en cada push.  
> Última actualización: `2026-05-03 03:29:08 UTC`

---

## Estructura del proyecto

```
Ventadegas/
├── gas-delivery/           # Frontend – Vite + React (puerto 5173)
└── gas-delivery-backend/   # Backend  – Node.js + Express (puerto 3000)
```

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

Backend en: `http://localhost:3000`

### Dependencias de producción

- `cors` ^2.8.6
- `dotenv` ^17.4.2
- `express` ^5.2.1
- `jsonwebtoken` ^9.0.3
- `mysql2` ^3.22.3

### Dependencias de desarrollo

- `nodemon` ^3.1.14

---

## Endpoints del Backend (API)

Detectados automáticamente en `gas-delivery-backend/index.js`:

| Método | Ruta |
|--------|------|
| `GET` | `/api/agencias/:slug` |
| `GET` | `/api/agencias/:slug/productos` |
| `POST` | `/api/pedidos` |
| `GET` | `/api/agencias/:slug/pedidos` |
| `PATCH` | `/api/pedidos/:id/estado` |
| `POST` | `/api/admin/login` |

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

Frontend en: `http://localhost:5173`

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
- `vite` ^8.0.10

---

## Conexión Frontend ↔ Backend (sin proxy)

El frontend apunta directo al backend:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

El backend habilita CORS usando `cors()` para permitir requests desde el frontend durante desarrollo.

---

## Multitenancy

El producto es **multitenant** (suscripción para negocios).  
Los negocios/tenants se identifican por un `slug`:

- `/api/agencias/:slug`
- `/api/agencias/:slug/productos`
- `/api/agencias/:slug/pedidos`

---

## Licencia

Sin licencia declarada por el momento (uso reservado por el autor).
