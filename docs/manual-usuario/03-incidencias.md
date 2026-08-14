[← Volver al índice](README.md)

# 3. Gestión de Incidencias

## Ver lista de incidencias

**Rol(es):** Todos (el contenido varía por rol).
**Ubicación:** `Ruta: /incidencias` — menú "Incidencias".

- **Administrador / Gerente**: título "Incidencias Globales", ven todas las incidencias de la empresa.
- **Ingeniero**: ve únicamente las incidencias que tiene asignadas.
- **Supervisor**: ve las incidencias de los proyectos en los que participa.

### Pasos
1. Ir a "Incidencias" en el menú lateral.
2. Filtrar por pestaña de estado: **Todas, Abiertas, En Progreso, Resueltas**.
3. Usar el buscador **"Buscar por título, proyecto o reportante..."**.
4. Filtrar por **Severidad**: Todas las Severidades, Baja, Media, Alta, Crítica.
5. Filtrar por **Proyecto**: "Todos los Proyectos" o uno específico.
6. Hacer clic en una tarjeta de incidencia para ver el detalle.

### Capturas de pantalla sugeridas
- Lista de incidencias con las pestañas de estado y los filtros de severidad/proyecto.
- Vista "Mis Incidencias" (rol ingeniero) contrastada con "Incidencias Globales" (rol gerente).

### Resultado esperado
Se muestra el listado de incidencias filtrado, cada una con severidad, estado, proyecto, quién la reportó y el tiempo transcurrido.

---

## Crear una nueva incidencia

> ⚠️ **Nota:** Esta acción no está disponible en la plataforma web — se realiza desde la app móvil. La plataforma web permite dar seguimiento a las incidencias ya creadas: asignar responsable, cambiar estado, comentar y cerrar.

---

## Asignar responsable a una incidencia

**Rol(es):** Administrador y Gerente.
**Ubicación:** Detalle de la incidencia (`/incidencias/[id]`) → tarjeta "Acciones".

### Pasos
1. Abrir el detalle de la incidencia.
2. En la tarjeta "Acciones", usar el selector **"Responsable"** (se listan usuarios con rol Ingeniero disponibles en el proyecto de la incidencia).
3. Presionar **"Guardar Cambios"**.

### Capturas de pantalla sugeridas
- Tarjeta "Acciones" con el selector "Responsable" desplegado.

### Resultado esperado
La incidencia queda asignada al ingeniero seleccionado, quien podrá verla en su lista de "Mis Incidencias".

---

## Cambiar estado de una incidencia (abierta → en_progreso → resuelta → cerrada)

**Rol(es):** Ingeniero (avance limitado) y Administrador/Gerente (control total). Supervisor: solo lectura, no puede cambiar el estado.
**Ubicación:** Detalle de la incidencia → tarjeta "Acciones".

### Como Ingeniero
1. Abrir la incidencia asignada.
2. Si el estado es **Abierta**, presionar **"Iniciar Atención"** (pasa a "En Progreso").
3. Si el estado es "Abierta" o "En Progreso", presionar **"Marcar como Resuelta"**. El sistema solicita obligatoriamente un comentario de resolución antes de confirmar.

### Como Administrador / Gerente
1. Abrir la incidencia.
2. En la tarjeta "Acciones", usar el selector **"Estado"**: Abierta, En Progreso, Resuelta, Cerrada.
3. Al elegir **Resuelta** o **Cerrada**, el sistema solicita obligatoriamente un comentario antes de guardar.
4. Presionar **"Guardar Cambios"**.

### Capturas de pantalla sugeridas
- Botones "Iniciar Atención" y "Marcar como Resuelta" (vista de ingeniero).
- Selector de "Estado" con las 4 opciones (vista de gerente/administrador).
- Cuadro de diálogo solicitando el comentario obligatorio al resolver/cerrar.

### Resultado esperado
El estado de la incidencia se actualiza y queda reflejado en la lista y en el detalle.

### Posibles errores
- Si se intenta resolver o cerrar sin escribir un comentario, el sistema no permite continuar hasta ingresar el texto.

---

## Agregar comentarios a una incidencia

**Rol(es):** Ingeniero, Gerente, Administrador. (Supervisor no tiene disponible el cuadro de comentarios — solo lectura.)
**Ubicación:** Detalle de la incidencia → sección "Comentarios (N)".

### Pasos
1. Abrir el detalle de la incidencia.
2. Escribir el comentario en el cuadro de texto de la sección "Comentarios".
3. Enviar el comentario.

### Capturas de pantalla sugeridas
- Sección "Comentarios" con varios comentarios previos y el cuadro de texto para uno nuevo.

### Resultado esperado
El comentario se agrega al historial de seguimiento de la incidencia, visible para todos los que la consulten.

---

## Cerrar una incidencia

**Rol(es):** Administrador y Gerente.
**Ubicación:** Detalle de la incidencia → tarjeta "Acciones".

No existe un botón independiente de "Cerrar". El cierre se realiza seleccionando el estado **Cerrada** en el mismo selector de "Estado" descrito arriba.

### Pasos
1. Abrir la incidencia a cerrar.
2. En "Acciones", seleccionar **Estado: Cerrada**.
3. Ingresar el comentario obligatorio de cierre.
4. Presionar **"Guardar Cambios"**.

### Resultado esperado
La incidencia pasa a estado "Cerrado" y deja de contarse como incidencia activa en los KPIs del proyecto y del dashboard ejecutivo.
