[← Volver al índice](README.md)

# 10. Días No Laborales

Este calendario aplica a **toda la empresa** (no existe la posibilidad de asignar un día no laboral a un proyecto específico).

## Ver lista de días no laborales

**Rol(es):** Todos. Administrador ve además los controles de crear/eliminar; el resto ve la pantalla en modo **"Solo lectura"**.
**Ubicación:** `Ruta: /dias-no-laborales` — menú "Días No Laborales". Título: "Días Oficiales No Laborales".

### Pasos
1. Ir a "Días No Laborales" en el menú lateral.
2. Usar las flechas `<` / `>` para navegar entre meses.
3. Los días registrados aparecen resaltados en rojo en el calendario, con un punto indicador; pasar el cursor sobre el día muestra la descripción.
4. Revisar la tabla inferior: Fecha, Descripción, Tipo, Estado ("Pasado" o "Próximo", calculado automáticamente).

### Capturas de pantalla sugeridas
- Vista de calendario mensual con varios días no laborales resaltados.
- Tabla de días no laborales con las columnas Fecha, Descripción, Tipo, Estado.

### Resultado esperado
Se visualizan los días festivos, de vacaciones o descanso configurados para el mes elegido.

---

## Crear un nuevo día no laboral

**Rol(es):** Administrador.
**Ubicación:** Botón **"Agregar Día"** (visible solo para administrador) → modal **"Registrar Día No Laboral"**.

### Pasos
1. Presionar **"Agregar Día"**.
2. Completar el formulario.
3. Confirmar para guardar.

### Campos del formulario
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| Fecha | Fecha | Sí | |
| Descripción | Texto | Sí | Placeholder: "Ej. Día de la Independencia" |
| Tipo | Selección | Sí | Festivo, Vacaciones, Descanso (por defecto: Festivo) |

### Capturas de pantalla sugeridas
- Modal "Registrar Día No Laboral" con los 3 campos completos.

### Resultado esperado
El día queda registrado y visible en el calendario y en la tabla, afectando los cálculos de asistencia (Control Horario / Reporte de Horas) para esa fecha.

### Posibles errores
- **"Selecciona una fecha"** — el campo Fecha quedó vacío.
- **"Ingresa una descripción"** — el campo Descripción quedó vacío.

---

## Eliminar un día no laboral

**Rol(es):** Administrador.
**Ubicación:** Ícono de basurero en la fila correspondiente de la tabla.

### Pasos
1. Presionar el ícono de basurero en la fila del día a eliminar.
2. Confirmar en el diálogo **"Eliminar registro"** ("¿Estás seguro de eliminar este día no laboral?"), presionando **"Eliminar"**.

### Capturas de pantalla sugeridas
- Diálogo de confirmación "Eliminar registro".

### Resultado esperado
El día no laboral se elimina y desaparece del calendario y la tabla.
