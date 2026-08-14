[← Volver al índice](README.md)

# 8. Horarios y Control Horario

Este módulo agrupa dos pantallas distintas del menú "Finanzas y RH":

- **Horarios** (`/horarios`): configuración única, a nivel de toda la empresa, de los días y horas laborales.
- **Control Horario** (`/control-horario`): un **reporte de asistencia** por trabajador y fecha (no es una pantalla de asignación de horario por usuario).

## Configurar horarios por día de la semana (lunes a domingo)

**Rol(es):** Solo Administrador puede editar. Gerente, Supervisor e Ingeniero ven la pantalla en modo **"Solo lectura"** (con ícono de candado).
**Ubicación:** `Ruta: /horarios` — menú "Horarios". Título: "Configuración de Horario Laboral".

### Pasos
1. Ir a "Horarios" en el menú lateral.
2. Para cada día (Lunes a Domingo), activar o desactivar el interruptor **"Es laboral"**.
3. Definir **"Hora inicio"** y **"Hora fin"** para los días laborales.
4. Presionar **"Guardar Todo"** para guardar los 7 días a la vez (también existe un botón "Guardar" por fila).

### Campos del formulario
| Campo | Tipo | Notas |
|---|---|---|
| Es laboral | Interruptor (sí/no) | Por día de la semana |
| Hora inicio | Hora | Solo aplica si "Es laboral" está activo |
| Hora fin | Hora | Solo aplica si "Es laboral" está activo |

> ⚠️ **Nota:** Esta pantalla no incluye configuración de "horario de comida" (inicio/fin). El horario de comida no es un valor configurable en el sistema; solo se registra en el checador el momento real en que cada trabajador inicia y termina su comida (ver [Asistencia](06-asistencia.md)).

### Capturas de pantalla sugeridas
- Tabla de "Configuración de Horario Laboral" con los 7 días, en sesión de administrador.
- La misma pantalla en modo "Solo lectura" (sesión de gerente o supervisor).

### Resultado esperado
El horario laboral configurado se usa como referencia para calcular si un registro de asistencia está "Completo", "Incompleto" o representa una "Falta" en los reportes de Control Horario y Reporte de Horas.

---

## Ver Control Horario (consulta de asistencia por trabajador)

**Rol(es):** Todos, con alcance distinto:
- **Administrador / Gerente**: pueden elegir cualquier usuario y exportar.
- **Supervisor / Ingeniero**: la pantalla se limita automáticamente a su propio historial; no ven el selector de usuario ni los botones de exportación.

**Ubicación:** `Ruta: /control-horario` — menú "Control Horario". Título: "Control Horario — Consulta de entradas, salidas y estado de asistencia por trabajador".

### Pasos
1. Ir a "Control Horario" en el menú lateral.
2. (Solo admin/gerente) Elegir un **Usuario** específico o dejarlo sin filtrar.
3. Filtrar por **Proyecto**.
4. Filtrar por **Estado**: Todos los estados, Completo, Incompleto, Falta.
5. Definir el rango de fechas **Desde** / **Hasta** (por defecto: del primer día del mes actual a hoy).
6. Revisar la tabla: Usuario, Fecha, Entrada, Salida, Inicio comida, Fin comida, Horas, Estado.
7. (Solo admin/gerente) Exportar con **"Exportar Excel"** o **"Exportar PDF"**.

### Capturas de pantalla sugeridas
- Pantalla de Control Horario con todos los filtros visibles (sesión de administrador).
- La misma pantalla en sesión de supervisor/ingeniero, sin el filtro de Usuario ni los botones de exportar.
- Tabla de resultados con distintos estados (Completo/Incompleto/Falta) resaltados por color.

### Resultado esperado
Se obtiene un listado de los registros de asistencia del período y usuario(s) seleccionados, exportable a Excel (CSV) o PDF con nombre de archivo `Control_Horario_{desde}_a_{hasta}`.

### Posibles errores
- Si el rango de fechas es muy amplio, la tabla puede tardar en cargar; se recomienda acotar el rango.
