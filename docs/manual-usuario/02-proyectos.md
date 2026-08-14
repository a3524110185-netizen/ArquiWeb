[← Volver al índice](README.md)

# 2. Gestión de Proyectos (Obras)

## Ver lista de proyectos

**Rol(es):** Administrador, Gerente, Supervisor, Ingeniero (supervisores e ingenieros ven la misma pantalla, con el menú etiquetado "Mis Proyectos").
**Ubicación:** `Ruta: /proyectos` — menú "Proyectos" / "Mis Proyectos".

### Pasos
1. Ir a "Proyectos" en el menú lateral.
2. Usar el buscador **"Buscar por nombre, código o cliente..."** para filtrar por texto.
3. Usar los chips de estado para filtrar: **Todos, Planeado, A Tiempo, Retrasado, Crítico, Completado**.
4. Revisar la tabla: Código, Nombre, Cliente, Ubicación, Estado, Avance, Inicio/Fin.
5. Hacer clic en un proyecto para abrir su detalle.

### Capturas de pantalla sugeridas
- Lista de proyectos con los chips de estado y varios registros.
- Buscador con un término escrito y resultados filtrados.

### Resultado esperado
Se muestra la tabla de proyectos filtrada según los criterios seleccionados.

---

## Crear un nuevo proyecto

**Rol(es):** Administrador (el botón "Nuevo Proyecto" solo aparece para este rol en la lista).
**Ubicación:** `Ruta: /proyectos/nuevo` — botón **"Nuevo Proyecto"** en la lista de proyectos.

### Pasos
1. En la lista de proyectos, presionar **"Nuevo Proyecto"**.
2. Completar la sección "Datos Generales".
3. Usar el buscador de ubicación para localizar la dirección del proyecto en el mapa.
4. Opcionalmente, arrastrar o seleccionar una imagen de portada.
5. Presionar **"Crear Proyecto"**.

### Campos del formulario
| Campo | Tipo | Requerido |
|---|---|---|
| Nombre del Proyecto | Texto | Sí |
| Cliente | Selección (catálogo de clientes) | No |
| Descripción | Texto largo | No |
| Buscar Dirección o Ubicación | Buscador de mapa (genera ubicación, latitud, longitud) | Sí |
| Presupuesto ($ MXN) | Numérico | No |
| Fecha de Inicio | Fecha | Sí |
| Fecha Estimada de Fin | Fecha | Sí |
| Imagen de Portada | Archivo de imagen | No |

### Capturas de pantalla sugeridas
- Formulario "Crear Proyecto" completo, con el mapa de ubicación visible.
- Selector de imagen de portada con una imagen cargada.

### Resultado esperado
El proyecto se crea y aparece en la lista de proyectos con estado inicial.

### Posibles errores
- **"Campos incompletos"** — falta Nombre, Ubicación, Fecha de Inicio o Fecha de Fin. Completar los campos marcados como obligatorios.

---

## Editar un proyecto

**Rol(es):** Administrador y Gerente (botón "Editar Proyecto" visible para ambos en el detalle).
**Ubicación:** `Ruta: /proyectos/[id]/editar` — botón **"Editar Proyecto"** en el detalle del proyecto.

### Pasos
1. Abrir el detalle del proyecto deseado.
2. Presionar **"Editar Proyecto"**.
3. Modificar los campos necesarios (mismos que en creación, más el campo **Estado**).
4. Presionar **"Guardar Cambios"**.

### Campos adicionales respecto a creación
| Campo | Tipo | Opciones |
|---|---|---|
| Estado | Selección | Planeado, A Tiempo, Retrasado, Crítico, Completado |

### Capturas de pantalla sugeridas
- Formulario de edición con el selector de Estado visible.

### Resultado esperado
Los cambios se guardan y se reflejan en la lista y el detalle del proyecto.

---

## Asignar personal a un proyecto (Gestionar Equipo)

**Rol(es):** Administrador únicamente (el enlace "Gestionar Equipo" solo es visible para este rol en el detalle del proyecto).
**Ubicación:** Detalle del proyecto → enlace **"Gestionar Equipo"**, dentro de la tarjeta "Personal Asignado".

Existen dos formas de asignar personal:

### A) Desde el formulario de edición del proyecto
1. Ir a **"Editar Proyecto"**.
2. En la sección "Asignar Personal al Proyecto", elegir un usuario en **"Asignar Supervisor"** o **"Asignar Ingeniero"** y presionar **"Asignar"**.
3. Alternativamente, usar el enlace **"Asignar todos los N disponibles"** para asignar en bloque a todo el personal disponible de ese rol.
4. Para quitar a alguien, usar el ícono de basurero junto a su nombre en "Personal Asignado Actual" y confirmar.

### B) Desde el modal "Gestionar Equipo" (detalle del proyecto)
1. En el detalle del proyecto, presionar **"Gestionar Equipo"**.
2. Elegir el rol (**Supervisor** / **Ingeniero**) y el usuario en el selector **"Seleccionar usuario..."**.
3. Presionar **"Asignar"**, o usar **"Asignar todos (N)"** para asignación masiva (pide confirmación en el diálogo "Asignación masiva").
4. Para remover a un integrante, usar el ícono de basurero junto a su nombre en la lista "Personal Asignado (N)".

### Capturas de pantalla sugeridas
- Modal "Gestionar Equipo de Proyecto" con selectores de rol y usuario.
- Lista de "Personal Asignado" con varios integrantes y el ícono de eliminar.

### Resultado esperado
El usuario queda vinculado al proyecto y aparece en la tarjeta "Personal Asignado" del detalle. Los proyectos asignados son los que un supervisor/ingeniero ve en su propia vista de "Mis Proyectos".

### Posibles errores
- Al intentar remover a un integrante se solicita confirmación; si se cancela, no se realiza ningún cambio.

---

## Ver detalle de un proyecto

**Rol(es):** Todos los que tienen acceso al proyecto (administrador y gerente ven todos; supervisor/ingeniero solo los que tienen asignados).
**Ubicación:** `Ruta: /proyectos/[id]` — clic sobre un proyecto en la lista.

### Contenido de la pantalla
1. **Banner**: imagen de portada, código, estado, nombre, descripción, ubicación, cliente, fechas, y medidor de "Avance Físico".
2. **Tarjetas KPI**: Avance del Proyecto, Días Transcurridos, Incidencias Activas, Presupuesto Asignado.
3. **Historial de Avances**: tabla con Fecha, Usuario, %, Categoría, Descripción, Fotos. Gerente/Administrador ven una columna adicional **"Validación"** para aprobar o rechazar cada reporte (ver [Reportes Diarios](04-reportes-diarios.md)).
4. **Actividad Reciente**: línea de tiempo de eventos del proyecto.
5. **Personal Asignado (N)**: lista de personal con enlace **"Gestionar Equipo"** (solo administrador).

> ℹ️ Esta pantalla no incluye una pestaña dedicada de incidencias. Para ver las incidencias de un proyecto, ir al módulo [Incidencias](03-incidencias.md) y filtrar por ese proyecto.

### Capturas de pantalla sugeridas
- Vista completa del detalle de un proyecto con las 5 secciones visibles.
- Tabla "Historial de Avances" con los botones de Aprobar/Rechazar visibles (sesión de gerente).

### Resultado esperado
Se visualiza el estado integral del proyecto: avance, incidencias activas, presupuesto, historial de reportes y equipo asignado.
