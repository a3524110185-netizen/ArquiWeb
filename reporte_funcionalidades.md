# 📋 ArquiWeb - Reporte de Funcionalidades

## 1. Módulos y Roles

El sistema está diseñado para manejar 5 tipos de roles, cada uno con acceso a diferentes módulos y vistas:

1. **Super Admin**: Control total del sistema (Multitenant). Acceso a métricas globales, empresas, usuarios globales, licencias y registro de auditoría.
2. **Gerente**: Acceso al panel principal, seguimiento de obra, catálogos (materiales, proveedores), comercial, finanzas y control de usuarios de su empresa.
3. **Arquitecto**: Acceso a dashboard ejecutivo, detalle de sus proyectos, actividad reciente, reportes diarios e incidencias.
4. **Capturista**: Acceso restringido exclusivamente a la captura de gastos y comprobantes (`/gastos/nuevo`).
5. **Supervisor**: Vista optimizada para trabajo en campo. Seguimiento de obra, reportes, control horario, incidencias y evidencias.

## 2. Autenticación y Seguridad (Simulada)

- Se implementó un flujo de login completo (`/login`).
- Validación de credenciales con redirección inteligente según el rol del usuario.
- **Middleware**: Protección de rutas privadas. Si no hay token de sesión (simulado con un JWT en cookies y localStorage), se redirige al login.
- **Guardias de Ruta**: Los usuarios sin rol de *SuperAdmin* no pueden acceder a `/super-admin`. El rol *Capturista* es forzado a `/gastos/nuevo`.

## 3. Arquitectura del Estado (Zustand)

El estado global gestiona toda la base de datos simulada en memoria. Contiene:
- **Empresas, Proyectos, Usuarios, Licencias, Auditoría** (Core Super Admin).
- **Materiales, Proveedores, Incidencias, Reportes Diarios, Horarios** (Core Operativo).
- **Cotizaciones, Pedidos, Ventas** (Core Comercial).
- Acciones CRUD completas para modificar, añadir o eliminar entidades.

## 4. UI/UX y Diseño

- **Componentes Base**: Creados con TailwindCSS, diseñados para ser responsivos, modernos (estilo glassmorphism en login, sombras suaves, bordes redondeados).
- **Temas**: Soporte completo para Modo Claro y Modo Oscuro, gestionado de manera central y guardado en `localStorage`.
- **Gráficos**: Integración de Recharts para visualización de ventas, horas extras y distribución de proyectos.
- **Navegación Dinámica**: Un Sidebar que cambia sus opciones dependiendo del rol del usuario activo.
