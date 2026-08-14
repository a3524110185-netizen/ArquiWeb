[← Volver al índice](README.md)

# 15. Dashboard Superadmin

**Rol(es):** Solo `superadmin`. Este rol no gestiona una sola empresa: administra la plataforma completa (todas las empresas/tenants registrados en SIGO).

## Ver estadísticas globales (todas las empresas)

**Ubicación:** `Ruta: /dashboard-superadmin` — menú "Dashboard Superadmin". Encabezado: "Panel de Superadministración — Visión global de todas las empresas registradas en SIGO."

### Pasos
1. Iniciar sesión con un usuario de rol `superadmin` (redirige automáticamente aquí).
2. Revisar las 4 tarjetas KPI: **Total Empresas** (con subtexto de cuántas están activas), **Total Usuarios**, **Total Proyectos**, **Total Ventas** (acumulado global).
3. Revisar las gráficas: **"Empresas por Estado"** (pastel, activas en verde / inactivas en rojo) y **"Usuarios por Rol"** (barras).

### Capturas de pantalla sugeridas
- Vista completa del Dashboard Superadmin con las 4 tarjetas KPI y ambas gráficas.

### Resultado esperado
El superadmin obtiene una visión consolidada de toda la plataforma, sin necesidad de entrar empresa por empresa.

---

## Gestionar todas las empresas

**Ubicación:** `Ruta: /superadmin/empresas` — menú "Empresas". Título: "Gestión de Empresas".

### Ver lista
1. Ir a "Empresas".
2. Buscar por nombre (con debounce) y filtrar por estado ("Todos los estados" / "Solo activas" / "Solo inactivas").
3. Revisar la tabla: Empresa, RFC, Email, Estado, Registrada, acciones (ver, editar, activar/desactivar).

### Crear una empresa
**Ubicación:** Botón **"Nueva Empresa"** → `Ruta: /superadmin/empresas/nuevo`.

| Campo | Tipo | Requerido |
|---|---|---|
| Nombre | Texto | Sí |
| Razón Social | Texto | Sí |
| RFC | Texto | No |
| Dirección | Texto | No |
| Teléfono | Texto | No |
| Email | Correo | No (si se llena, debe contener "@") |

Pasos: completar el formulario y presionar **"Crear Empresa"**.

### Ver detalle de una empresa
**Ubicación:** `Ruta: /superadmin/empresas/[id]`.
Muestra RFC, email, teléfono, dirección, estado y fecha de registro; botones **"Editar"** y **"Activar/Desactivar"**; tabla **"Usuarios de la Empresa"** (Usuario, Email, Rol, Estado); botón **"Asignar Administrador"** (abre un modal para elegir, de entre los usuarios de esa empresa, quién será su administrador).

### Editar una empresa
**Ubicación:** `Ruta: /superadmin/empresas/[id]/editar`. Mismos campos que en creación (sin Razón Social).

### Activar / Desactivar una empresa
Ícono de encendido (Power) en la lista, o botón "Activar/Desactivar" en el detalle.

### Capturas de pantalla sugeridas
- Lista de empresas con el filtro de estado aplicado.
- Formulario "Nueva Empresa".
- Detalle de una empresa con la tabla de "Usuarios de la Empresa" y el botón "Asignar Administrador".

### Resultado esperado
La empresa creada/editada queda disponible en la plataforma; al desactivarla, sus usuarios dejan de poder operar en ella.

### Posibles errores
- Falta Nombre o Razón Social — campos obligatorios.
- Email con formato inválido (sin "@").

---

## Gestionar usuarios de todas las empresas

**Ubicación:** `Ruta: /superadmin/usuarios` — menú "Usuarios Globales".

### Pasos
1. Ir a "Usuarios Globales".
2. Buscar por nombre/email y filtrar por empresa ("Todas las empresas").
3. Revisar la tabla: Usuario, Email, Empresa, Rol, Estado.
4. Para cambiar el rol de un usuario: presionar el ícono **"Cambiar rol"**, elegir el nuevo rol en el modal **"Cambiar Rol de Usuario"** y confirmar.
5. Para activar/desactivar: presionar el ícono de encendido (Power) en la fila correspondiente.

> ℹ️ Esta pantalla no incluye un flujo de "crear usuario" — solo permite cambiar el rol y activar/desactivar usuarios ya existentes en cualquier empresa. La creación de usuarios se realiza desde [Gestión de Usuarios](07-usuarios.md) por el administrador de cada empresa.

### Capturas de pantalla sugeridas
- Lista de "Usuarios Globales" con el filtro por empresa aplicado.
- Modal "Cambiar Rol de Usuario".

### Resultado esperado
El rol o el estado del usuario se actualiza de forma inmediata, independientemente de a qué empresa pertenezca.
