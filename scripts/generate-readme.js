#!/usr/bin/env node
// scripts/generate-readme.js
// Generates README.md automatically from the current project state.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── helpers ────────────────────────────────────────────────────────────────
const readJSON = (rel) => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
const readText = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// ── read project metadata ──────────────────────────────────────────────────
const frontendPkg  = readJSON('gas-delivery/package.json');
const backendPkg   = readJSON('gas-delivery-backend/package.json');
const backendIndex = readText('gas-delivery-backend/index.js');

// ── extract API endpoints from index.js ───────────────────────────────────
const endpointRegex = /app\.(get|post|patch|put|delete)\(['"`](\/[^'"`]+)['"`]/gi;
const endpoints = [];
let match;
while ((match = endpointRegex.exec(backendIndex)) !== null) {
  endpoints.push({ method: match[1].toUpperCase(), path: match[2] });
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

// ── current date/time ──────────────────────────────────────────────────────
const now = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

// ── assemble README ────────────────────────────────────────────────────────
const readme = `# Ventadegas

Plataforma web **multitenant** (modelo tipo **suscripción**) para que distintos negocios puedan **gestionar sus ventas**, **administrar pedidos** y **analizar datos** desde una sola aplicación.

> 📄 Este README se genera automáticamente en cada push.  
> Última actualización: \`${now}\`

---

## Estructura del proyecto

\`\`\`
Ventadegas/
├── gas-delivery/           # Frontend – Vite + React (puerto 5173)
└── gas-delivery-backend/   # Backend  – Node.js + Express (puerto 3000)
\`\`\`

---

## Requisitos

- Node.js (recomendado: LTS)
- npm
- MySQL (recomendado: 8.x)
- MySQL Workbench (opcional)

---

## Instalación (clonar)

\`\`\`bash
git clone https://github.com/aloopez/Ventadegas.git
cd Ventadegas
\`\`\`

---

## Backend (Node.js + Express + MySQL)

Carpeta: \`gas-delivery-backend/\`

### 1) Instalar dependencias

\`\`\`bash
cd gas-delivery-backend
npm install
\`\`\`

### 2) Variables de entorno (.env)

Crea \`gas-delivery-backend/.env\`:

\`\`\`env
PORT=3000

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASS=tu_password
DB_PORT=3306
DB_NAME=tu_base_de_datos
\`\`\`

### 3) Base de datos

La base de datos se crea/gestiona manualmente (por ejemplo desde **MySQL Workbench**).

Asegúrate de:
- Crear la BD (\`DB_NAME\`)
- Tener usuario/clave correctos
- Tener las tablas necesarias según el modelo del proyecto

### 4) Levantar backend

\`\`\`bash
node index.js
\`\`\`

Backend en: \`http://localhost:3000\`

### Dependencias de producción

${backendDeps}

### Dependencias de desarrollo

${backendDevDeps}

---

## Endpoints del Backend (API)

Detectados automáticamente en \`gas-delivery-backend/index.js\`:

| Método | Ruta |
|--------|------|
${endpointTable}

---

## Frontend (Vite + React)

Carpeta: \`gas-delivery/\`

### 1) Instalar dependencias

\`\`\`bash
cd gas-delivery
npm install
\`\`\`

### 2) Levantar frontend

\`\`\`bash
npm run dev
\`\`\`

Frontend en: \`http://localhost:5173\`

### Dependencias de producción

${frontendDeps}

### Dependencias de desarrollo

${frontendDevDeps}

---

## Conexión Frontend ↔ Backend (sin proxy)

El frontend apunta directo al backend:

- Frontend: \`http://localhost:5173\`
- Backend: \`http://localhost:3000\`

El backend habilita CORS usando \`cors()\` para permitir requests desde el frontend durante desarrollo.

---

## Multitenancy

El producto es **multitenant** (suscripción para negocios).  
Los negocios/tenants se identifican por un \`slug\`:

- \`/api/agencias/:slug\`
- \`/api/agencias/:slug/productos\`
- \`/api/agencias/:slug/pedidos\`

---

## Licencia

Sin licencia declarada por el momento (uso reservado por el autor).
`;

writeFileSync(join(ROOT, 'README.md'), readme, 'utf8');
console.log('✅  README.md generado correctamente.');
