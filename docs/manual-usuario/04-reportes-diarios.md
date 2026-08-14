[← Volver al índice](README.md)

# 4. Reportes Diarios de Obra

## Ver lista de reportes diarios

**Rol(es):** Todos con acceso al proyecto (etiquetado "Registrar Avance" en el menú de supervisor).
**Ubicación:** `Ruta: /reportes-diarios` — menú "Reportes Diarios" / "Registrar Avance".

### Pasos
1. Ir a "Reportes Diarios" en el menú lateral.
2. Seleccionar un proyecto en el desplegable **"— Seleccionar Proyecto —"** (se autoselecciona el primero disponible).
3. Revisar las tarjetas KPI: Total Filtro, % Aprobados, % Pendientes, Promedio Avance.
4. Filtrar por estado usando los chips: **Todos, Pendientes, Aprobados, Rechazados**.
5. Filtrar por rango de fechas.
6. Hacer clic en una fila para expandirla y ver la descripción completa y las fotos, o abrir el detalle completo.

### Capturas de pantalla sugeridas
- Lista de reportes diarios con el selector de proyecto y las tarjetas KPI.
- Fila expandida mostrando descripción y miniaturas de fotos.

### Resultado esperado
Se muestra la tabla de reportes diarios del proyecto seleccionado, filtrada por estado y fecha.

---

## Crear un nuevo reporte diario (avance de obra)

> ⚠️ **Nota:** Esta acción no está disponible en la plataforma web — se realiza desde la app móvil.

## Subir fotos en el reporte

> ⚠️ **Nota:** Esta acción no está disponible en la plataforma web — se realiza desde la app móvil. Las fotos capturadas en campo se pueden consultar posteriormente desde la web en el detalle del reporte y en la [Galería de Evidencias](05-galeria-evidencias.md).

---

## Validar un reporte

**Rol(es):** Administrador y Gerente.
**Ubicación:** Lista de "Reportes Diarios" (`/reportes-diarios`), columna "Acciones" (solo visible para estos roles) en las filas con estado **Pendiente**.

### Pasos para aprobar
1. En la lista de reportes, ubicar un reporte con estado **Pendiente**.
2. Presionar el ícono de aprobar (✓).
3. Confirmar en el cuadro de diálogo.

### Pasos para rechazar
1. Presionar el ícono de rechazar (✗) en la fila del reporte.
2. En el modal **"Rechazar Reporte"**, escribir el motivo en el campo **"Motivo de rechazo"** (obligatorio).
3. Confirmar el rechazo.

### Campos del formulario (rechazo)
| Campo | Tipo | Requerido |
|---|---|---|
| Motivo de rechazo | Texto largo | Sí |

### Capturas de pantalla sugeridas
- Fila de reporte "Pendiente" con los íconos de aprobar/rechazar visibles.
- Modal "Rechazar Reporte" con el campo de motivo.

### Resultado esperado
El reporte cambia a estado **Aprobado** o **Rechazado**; en este último caso, el motivo queda registrado y visible en el detalle del reporte.

### Posibles errores
- No se puede confirmar un rechazo sin ingresar el motivo.

---

## Ver detalle de un reporte (con fotos)

**Rol(es):** Todos con acceso al proyecto.
**Ubicación:** `Ruta: /reportes-diarios/[id]` — clic sobre un reporte en la lista.

### Contenido de la pantalla
- Encabezado: proyecto, fecha, turno, usuario que reportó, categoría, estado (Aprobado/Rechazado/Pendiente), porcentaje de avance.
- Aviso de validación/rechazo (si aplica), con el motivo indicado por quien lo validó.
- "Descripción de Actividades".
- "Evidencia Fotográfica (N)": cuadrícula de fotos.
- "Reportado por": nombre, correo, teléfono.
- "Validado por" (si ya fue validado).
- "Ubicación del proyecto".

Esta pantalla es de solo consulta; las acciones de aprobar/rechazar se realizan desde la lista, no desde el detalle.

### Capturas de pantalla sugeridas
- Detalle completo de un reporte aprobado, con fotos visibles.
- Detalle de un reporte rechazado, mostrando el motivo de rechazo.

### Resultado esperado
Se visualiza la información completa del reporte diario seleccionado.
