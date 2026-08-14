[← Volver al índice](README.md)

# 9. Reporte de Horas

## Ver resumen de horas trabajadas por usuario

**Rol(es):** Todos, con alcance distinto:
- **Administrador / Gerente**: pueden elegir cualquier usuario.
- **Supervisor / Ingeniero**: la pantalla se limita automáticamente a su propio historial.

**Ubicación:** `Ruta: /reporte-horas` — menú "Reporte de Horas". Título: "Reporte de Horas — Resumen de horas trabajadas, extras y faltas por trabajador".

### Pasos
1. Ir a "Reporte de Horas" en el menú lateral.
2. (Solo admin/gerente) Elegir un **Usuario**.
3. Filtrar por **Proyecto**.
4. Definir el rango de fechas **Desde** / **Hasta** (por defecto: del primer día del mes actual a hoy).
5. Revisar las tarjetas KPI: **Total Horas**, **Horas Extra**, **Faltas** (sumadas sobre los resultados filtrados).
6. Revisar la tabla resumen: Usuario, Total Horas, Horas Extra, Faltas.

### Capturas de pantalla sugeridas
- Pantalla de "Reporte de Horas" con las 3 tarjetas KPI y la tabla resumen.

### Resultado esperado
Se muestra un resumen de horas trabajadas, horas extra y faltas por cada usuario, según los filtros aplicados.

---

## Ver detalles por día (expandir fila)

**Ubicación:** Tabla resumen de "Reporte de Horas", flecha/chevron al inicio de cada fila.

### Pasos
1. Presionar la flecha de una fila de usuario para expandirla.
2. Se despliega una tabla anidada con el desglose por día: Fecha, Entrada, Salida, Horas Trabajadas, Horas Extra, Estado.
3. Presionar nuevamente la flecha para colapsar la fila.

### Capturas de pantalla sugeridas
- Fila expandida mostrando el desglose diario de un usuario.

### Resultado esperado
Se visualiza el detalle día por día que compone el resumen mensual/periódico de ese usuario.

---

## Exportar reporte

> ⚠️ **Nota:** La exportación a Excel está en desarrollo. Actualmente el botón **"Exportar Excel"** muestra un mensaje "En desarrollo" y no genera ningún archivo. Para obtener un archivo exportable de asistencia, usar la exportación disponible en [Control Horario](08-horarios-y-control-horario.md#ver-control-horario-consulta-de-asistencia-por-trabajador).
