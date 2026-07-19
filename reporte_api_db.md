# ⚙️ ArquiWeb - Estructura de Base de Datos y Endpoints API Propuestos

Este documento detalla la estructura propuesta para migrar de Mock Data a una Base de Datos real (PostgreSQL recomendada) y la arquitectura de API REST/GraphQL.

## 1. Esquema de Base de Datos (Relacional)

### Tablas Principales (Core)

- **Empresa**
  - `id` (UUID, PK)
  - `nombre` (VARCHAR)
  - `rfc` (VARCHAR)
  - `plan` (ENUM)
  - `estado` (ENUM)

- **Usuario**
  - `id` (UUID, PK)
  - `empresa_id` (UUID, FK -> Empresa)
  - `email` (VARCHAR, UNIQUE)
  - `password_hash` (VARCHAR)
  - `rol` (ENUM: SuperAdmin, Gerente, Arquitecto, Supervisor, Capturista)

- **Proyecto**
  - `id` (UUID, PK)
  - `empresa_id` (UUID, FK -> Empresa)
  - `nombre` (VARCHAR)
  - `presupuesto` (DECIMAL)
  - `avance_fisico` (FLOAT)
  - `estado` (ENUM)

### Tablas Operativas

- **Incidencia**
  - `id` (UUID, PK)
  - `proyecto_id` (UUID, FK -> Proyecto)
  - `responsable_id` (UUID, FK -> Usuario)
  - `severidad` (ENUM)

- **ReporteDiario**
  - `id` (UUID, PK)
  - `proyecto_id` (UUID, FK -> Proyecto)
  - `supervisor_id` (UUID, FK -> Usuario)

- **Gasto**
  - `id` (UUID, PK)
  - `proyecto_id` (UUID, FK -> Proyecto)
  - `monto` (DECIMAL)

### Tablas Comerciales

- **Cotizacion** -> **PedidoVenta** -> **Venta**
  - Relación lineal. Una Cotización se convierte en Pedido, y un Pedido genera una Venta o Factura.

---

## 2. Endpoints API REST (Propuesta)

La API debe ser construida bajo un modelo multitenant, donde cada petición debe incluir el `empresa_id` validado a través del token JWT en el middleware (excepto para SuperAdmin).

### Autenticación
- `POST /api/auth/login` - Retorna JWT.
- `POST /api/auth/refresh` - Renueva token de sesión.

### Super Admin
- `GET /api/sa/empresas` - Lista todas las empresas (Solo SuperAdmin).
- `POST /api/sa/empresas` - Crea un nuevo tenant.

### Operativa (Tenant Aislado)
- `GET /api/proyectos` - Lista los proyectos de la empresa del usuario.
- `POST /api/proyectos/:id/incidencias` - Reporta una nueva incidencia en un proyecto.
- `PUT /api/incidencias/:id/estado` - Cambia el estado de una incidencia.

### Comercial
- `POST /api/comercial/cotizaciones/:id/convertir` - Transforma cotización a pedido de venta.
- `GET /api/comercial/ventas/kpi` - Retorna métricas agrupadas para los gráficos de ventas.
