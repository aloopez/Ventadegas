#!/usr/bin/env node
// scripts/generate-readme.js
// Generates README.md automatically from the current project state.
//
// Extrae dinámicamente: endpoints del backend, dependencias de ambos package.json
// y variables de entorno desde .env.example. Las secciones narrativas (seguridad,
// UI, multitenancy) se mantienen manualmente para reflejar el estado del proyecto.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── helpers ────────────────────────────────────────────────────────────────
const readJSON = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const readText = (rel) => existsSync(join(ROOT, rel)) ? readFileSync(join(ROOT, rel), 'utf8') : '';

// ── read project metadata ──────────────────────────────────────────────────
const frontendPkg  = readJSON('gas-delivery/package.json');
const backendPkg   = readJSON('gas-delivery-backend/package.json');
const backendIndex = readText('gas-delivery-backend/index.js');
const envExample   = readText('gas-delivery-backend/.env.example');

// ── extract API endpoints from index.js ───────────────────────────────────
const endpointRegex = /app\.(get|post|patch|put|delete)\(['"`](\/[^'"`]+)['"`]/gi;
const endpoints = [];
const seen = new Set();
let match;
while ((match = endpointRegex.exec(backendIndex)) !== null) {
  const entry = `${match[1].toUpperCase()} ${match[2]}`;
  // dedup: the same route+method can appear once (avoid duplicate unprotected copies)
  if (!seen.has(entry)) {
    seen.add(entry);
    endpoints.push({ method: match[1].toUpperCase(), path: match[2] });
  }
}

const endpointTable = endpoints
  .map(({ method, path }) => `| \`${method}\` | \`${path}\` |`)
  .join('\n');

// ── build dependency lists ─────────────────────────────────────────────────
const fmtDeps = (deps = {}) => {
  const entries = Object.entries(deps);
  if (entries.length === 0) return '_Ninguna_';
  return entries.map(([name, version]) => `- \`${name}\` ${version}`).join('\n');
};

const frontendDeps    = fmtDeps(frontendPkg.dependencies);
const frontendDevDeps = fmtDeps(frontendPkg.devDependencies);
const backendDeps     = fmtDeps(backendPkg.dependencies);
const backendDevDeps  = fmtDeps(backendPkg.devDependencies);

// ── .env.example block (only actual variables, skip pure comments) ────────
const envBlock = envExample
  .split('\n')
  .filter((line) => {
    const t = line.trim();
    if (t === '' || t.startsWith('#')) return false; // skip comments and blanks
    return true;
  })
  .join('\n')
  .trim() || '# PORT=3000\n# DB_HOST=...\n# JWT_SECRET=...';

// ── current date/time ──────────────────────────────────────────────────────
const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

// ── assemble README ────────────────────────────────────────────────────────
const readme = `# Ventadegas

Plataforma web **multitenant** (modelo tipo **suscripción / SaaS**) para que distintos negocios o distribuidoras de gas puedan **gestionar sus ventas**, **administrar pedidos**, **rastrear envíos** y **analizar métricas** desde una sola aplicación.

> 📄 Este README se genera automáticamente en cada push.  
> Última actualización: \`${now}\`

---

## Estructura del proyecto

\`\`\`
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
\`\`\`

---

## Requisitos

- Node.js (recomendado: LTS)
- npm
- MySQL 8.x (configurado con Aiven en producción)
- MySQL Workbench u otro cliente SQL (opcional)

---

## Instalación (clonar)

\`\`\`bash
git clone https://github.com/aloopez/Ventadegas.git
cd Ventadegas
\`\`\`

---

## Backend (Node.js + Express 5 + MySQL)

Carpeta: \`gas-delivery-backend/\`

### 1) Instalar dependencias

\`\`\`bash
cd gas-delivery-backend
npm install
\`\`\`

### 2) Variables de entorno (.env)

Copia la plantilla y completa tus valores:

\`\`\`bash
cp .env.example .env
\`\`\`

Contenido de \`gas-delivery-backend/.env\` (basado en \`.env.example\`):

\`\`\`env
${envBlock}
\`\`\`

> ⚠️ El backend **falla al arrancar** si \`JWT_SECRET\` o \`SUPER_ADMIN_SECRET\` no están definidos (ya no hay fallback hardcoded inseguro).

### 3) Base de datos

El esquema está versionado en \`gas-delivery-backend/src/schema.sql\` e incluye tablas, claves foráneas, \`UNIQUE\` constraints e **índices** de rendimiento (\`agencia_id\`, \`estado\`, \`codigo_pedido\`, \`dui\`, etc.).

Ejecútalo una vez contra tu base de datos:

\`\`\`bash
# Desde consola MySQL
mysql -h TU_HOST -u TU_USUARIO -p TU_BASE_DE_DATOS < gas-delivery-backend/src/schema.sql
\`\`\`

O pégalo en tu cliente GUI (DBeaver, Workbench, consola web de Aiven). Usa \`CREATE TABLE IF NOT EXISTS\`, por lo que es idempotente.

### 4) Levantar backend

\`\`\`bash
node index.js        # producción
npm run dev          # desarrollo con nodemon
\`\`\`

Backend en: \`http://localhost:3000\`

### Dependencias de producción

${backendDeps}

### Dependencias de desarrollo

${backendDevDeps}

---

## Endpoints del Backend (API)

Definidos en \`gas-delivery-backend/index.js\`. Todas las consultas usan \`mysql2\` con parámetros (\`?\`), por lo que **no son vulnerables a SQL injection**.

| Método | Ruta |
|--------|------|
${endpointTable}

---

## Frontend (Vite + React 19 + PWA)

Carpeta: \`gas-delivery/\`

### 1) Instalar dependencias

\`\`\`bash
cd gas-delivery
npm install
\`\`\`

> ✅ El proyecto pasó \`npm audit fix\`: **0 vulnerabilidades** conocidas.

### 2) Levantar frontend

\`\`\`bash
npm run dev        # desarrollo en http://localhost:5173
npm run build      # build de producción (PWA)
npm run preview    # previsualizar build
\`\`\`

Frontend en: \`http://localhost:5173\`

### Características de UI

- **Flujo de pedido en 4 pasos** con \`ProgressBar\` visual (Cilindro → Zona → Datos → Resumen).
- **Toasts** en vez de \`alert()\` para feedback de éxito/error.
- **Skeleton loaders** animados (shimmer) en cargas de productos, pedidos y tracking.
- **Modo oscuro** automático vía \`prefers-color-scheme\`.
- **PWA instalable** (service worker + manifest) desplegable en Vercel.
- **GPS / geolocalización** con reverse geocoding (OpenStreetMap) y mapa embebido.
- **Integración WhatsApp** para confirmación de pedido.

### Dependencias de producción

${frontendDeps}

### Dependencias de desarrollo

${frontendDevDeps}

---

## Conexión Frontend ↔ Backend

El frontend apunta directo a la URL del backend (definida en \`src/services/api.js\`, \`API_BASE_URL\`).

El backend usa CORS **restrictivo** (whitelist configurable vía \`CORS_ORIGIN\`). En desarrollo permite \`localhost:5173\`; en producción debes listar tu dominio.

---

## Seguridad y arquitectura (post-auditoría)

- **Multi-tenant**: aislamiento de datos por \`agencia_id\` en \`pedidos\` y \`productos\`. Los pedidos solo son visibles/editables por la agencia dueña del token (blindaje en cada query).
- **Autenticación**: JWT firmado con \`JWT_SECRET\` obligatorio; contraseñas hasheadas con \`bcrypt\`.
- **Registro admin**: protegido con \`SUPER_ADMIN_SECRET\` (header \`x-api-key\`).
- **SQL injection**: todas las queries usan parámetros \`?\` de \`mysql2\`.
- **Rate limiting**: máximo 3 pedidos/hora por cliente (DUI).
- **Manejo de errores**: middleware global + handlers de \`unhandledRejection\` / \`uncaughtException\`.
- **Límites**: body JSON limitado a 10kb para mitigar DoS.

---

## Multitenancy

El producto es **multitenant** (suscripción para negocios). Los tenants (agencias) se identifican por \`slug\` en la URL pública y por \`agencia_id\` en el token JWT para rutas protegidas:

- \`/api/agencias/:slug\`
- \`/api/agencias/:slug/productos\`
- \`/api/agencias/:slug/pedidos\` (protegido, aislado por token)

---

## Licencia

Sin licencia declarada por el momento (uso reservado por el autor).
`;

writeFileSync(join(ROOT, 'README.md'), readme, 'utf8');
console.log('✅  README.md generado correctamente.');
