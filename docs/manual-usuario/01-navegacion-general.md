[← Volver al índice](README.md)

# 1. Navegación General

## Barra lateral (Sidebar) y cómo cambia según el rol

**Rol(es):** Todos (contenido distinto por rol).
**Ubicación:** Menú lateral izquierdo, visible en todas las pantallas de la plataforma.

El Sidebar agrupa los módulos disponibles para el rol activo. Además muestra una insignia con el rol del usuario, un botón para colapsar el menú ("Colapsar") y el botón **"Cerrar Sesión"** en la parte inferior.

### Menú por rol

**Administrador**
- Grupo "Principal": Dashboard, Dashboard Ejecutivo, Proyectos, Incidencias, Reportes Diarios, Galería Evidencias.
- Grupo "Gestión": Usuarios.
- Grupo "Finanzas y RH": Horarios, Reporte de Horas, Control Horario, Días No Laborales, Gastos de Obra.
- Grupo "Comercial": Cotizaciones, Pedidos, Ventas, Inventario.
- Grupo "Catálogos": Materiales, Proveedores, Clientes.
- Grupo "Configuración": Categorías.
- Grupo "Universal": Asistencia (Checador).

**Gerente**
- Igual que Administrador, **salvo** el grupo "Gestión" (sin Usuarios) y el grupo "Configuración".

**Ingeniero**
- Grupo "Mi Trabajo": Mis Proyectos, Incidencias, Galería Evidencias.
- Grupo "Universal": Asistencia (Checador).

**Supervisor**
- Grupo "Mi Trabajo": Mis Proyectos, Registrar Avance (Reportes Diarios), Incidencias, Galería Evidencias.
- Grupo "Universal": Asistencia (Checador).

**Superadmin**
- Grupo "Superadmin": Dashboard Superadmin, Empresas, Usuarios Globales.

### Capturas de pantalla sugeridas
- Sidebar completo con sesión de administrador iniciada.
- Sidebar de un rol de campo (supervisor o ingeniero) para contrastar.
- Sidebar colapsado.

## Selector de empresa (multiempresa)

**Rol(es):** Solo `administrador`.
**Ubicación:** Barra superior (Header), junto al botón de cerrar sesión.

Un administrador puede tener acceso a más de una empresa (tenant) dentro de SIGO.

### Comportamiento
- Si el administrador tiene **más de una empresa asignada**, aparece un menú desplegable **"Cambiar de empresa"** en el Header.
- Si tiene **una sola empresa**, se muestra una insignia fija con el nombre de la empresa y un botón **"Nueva Empresa"**.
- Si **no tiene ninguna empresa asignada**, se muestra una advertencia **"Sin empresa"**.
- Si el administrador tiene más de una empresa y aún no ha seleccionado ninguna como activa, se despliega automáticamente el modal **"Seleccionar Empresa"**, con una tarjeta por empresa disponible y una tarjeta adicional **"Crear Empresa"**. Debe elegir una y presionar **"Continuar"**.

### Pasos para cambiar de empresa
1. En el Header, abrir el desplegable **"Cambiar de empresa"**.
2. Seleccionar la empresa deseada de la lista.
3. La plataforma recarga los datos (proyectos, usuarios, catálogos, etc.) correspondientes a la nueva empresa activa.

### Pasos para crear una nueva empresa
1. Presionar **"Nueva Empresa"** (en el selector) o **"Crear Empresa"** (dentro del modal "Seleccionar Empresa").
2. Completar el formulario de la empresa (ver detalle en la sección "Gestión de empresas" del [Dashboard Superadmin](15-dashboard-superadmin.md), ya que el formulario es equivalente).
3. Confirmar la creación.

### Capturas de pantalla sugeridas
- Header con el selector "Cambiar de empresa" desplegado.
- Modal "Seleccionar Empresa" con varias tarjetas de empresas.
- Estado "Sin empresa" en el Header.

### Resultado esperado
La sesión del administrador queda asociada a la empresa seleccionada; todos los módulos (proyectos, usuarios, catálogos, comercial) muestran únicamente datos de esa empresa.

## Perfil de usuario y cerrar sesión

**Rol(es):** Todos.
**Ubicación:** Barra superior (Header) y parte inferior del Sidebar.

- El Header muestra el avatar, nombre y rol del usuario activo.
- El Sidebar muestra una tarjeta de usuario equivalente (nombre, rol) y el botón **"Cerrar Sesión"**.
- La plataforma **no cuenta actualmente con una pantalla de "Editar Perfil"**; los datos del usuario (nombre, correo, contraseña) solo pueden modificarse desde [Gestión de Usuarios](07-usuarios.md) por un administrador.

### Pasos para cerrar sesión
1. Presionar el ícono de salida en el Header o el botón **"Cerrar Sesión"** en el Sidebar.
2. La sesión se cierra y se redirige a `/login`.
