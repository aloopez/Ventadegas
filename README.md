# Ventadegas

Plataforma web **multitenant** para que distintos negocios de venta de gas puedan contratar el servicio y ofrecer **venta online + gestión de pedidos**, mientras que **el delivery y la logística la realizan los propios negocios**.

Este repositorio actualmente contiene **solo el frontend** (React). El objetivo es avanzar hacia un producto completo con un **backend sólido** y una primera **alpha funcional**.

---

## Concepto del producto (para entender rápido)

- **Multi-negocio (multitenant)**: una sola app sirve a muchos negocios.
- **Cada negocio** configura catálogo, precios, zonas de entrega y gestiona pedidos.
- **Los clientes** compran gas por internet.
- **El negocio** se encarga de preparar y entregar el pedido (delivery propio).

---

## Multitenancy por rutas (path-based)

Actualmente los tenants se identifican por **ruta**, por ejemplo:

- `https://tudominio.com/ventas-de-gas-martinez`
- `https://tudominio.com/ventas-de-gas-martinez/checkout`
- `https://tudominio.com/ventas-de-gas-martinez/admin`

Convención recomendada:

- `tenantSlug` = identificador único del negocio (string “slug”).
- Patrón base: `/:tenantSlug/*`

Esto permite desplegar con un solo dominio y validar rápido la alpha, dejando abierto a soportar subdominios en el futuro si hiciera falta.

---

## Estado actual

- Frontend en **React**
- Levanta en desarrollo con `npm run dev`

---

## Roadmap (hacia una Alpha)

Este listado es la guía de funcionalidades objetivo. Si vas a contribuir (humano o IA), lo ideal es tomar un ítem y hacer un PR pequeño.

### Base multitenant
- [ ] Resolver tenant desde `tenantSlug` (ruta) y cargar su configuración.
- [ ] Manejo de “tenant no existe” (404/landing).
- [ ] Branding por tenant (logo/colores/nombre).

### Catálogo y precios
- [ ] Productos (garrafas/tamaños, accesorios).
- [ ] Precios por tenant.
- [ ] (Opcional) Stock.

### Carrito y checkout
- [ ] Carrito persistente por tenant.
- [ ] Checkout (datos cliente + dirección).
- [ ] Confirmación de pedido.

### Pedidos
- [ ] Estados del pedido: pendiente, confirmado, en camino, entregado, cancelado.
- [ ] Historial/seguimiento para el cliente.
- [ ] Panel del negocio para ver/gestionar pedidos.

### Delivery (lo gestiona el negocio)
- [ ] Zonas de entrega por tenant.
- [ ] Costo de envío por zona / reglas.
- [ ] Horarios de entrega.

### Usuarios y autenticación
- [ ] Login/registro de clientes (opcional para alpha, pero deseable).
- [ ] Roles del negocio: admin/operador.
- [ ] Acceso a `/admin` protegido.

### Backend (prioridad alta)
Sugerencias abiertas (se puede cambiar):

- API REST (o GraphQL).
- Persistencia multi-tenant basada en `tenant_id` (en todas las tablas).
- Autenticación (JWT o sesiones).
- Validación + logging + manejo de errores.
- Tests (unit + integración) y CI.

---

## Requisitos

- Node.js (recomendado: LTS)
- npm

---

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrí la URL que indique la consola (típicamente `http://localhost:5173`).

> Nota: para probar multitenancy por ruta en local, la idea es navegar a algo como:
> `http://localhost:5173/ventas-de-gas-martinez`

---

## Guía para contribuir (especialmente útil para una IA)

Cuando implementes algo, intentá incluir:

1. **Qué tenant afecta** y si es genérico para todos.
2. Cambios en rutas: confirmar que siguen el patrón `/:tenantSlug/...`
3. Si agregás backend:
   - endpoints,
   - modelo de datos,
   - variables de entorno,
   - migraciones (si aplica),
   - ejemplos de requests.

### Primeras tareas recomendadas
- Definir y documentar el contrato mínimo de tenant (qué campos tiene `Tenant`: `slug`, `name`, `logoUrl`, `primaryColor`, `deliveryZones`, etc.).
- Implementar routing base con `tenantSlug` y un “TenantProvider” (contexto) que cargue datos del tenant.
- Proponer diseño inicial del backend (módulos/entidades): `Tenant`, `Product`, `Customer`, `Order`, `OrderItem`, `DeliveryZone`.

---

## Licencia

Sin licencia declarada por el momento (uso reservado por el autor).
