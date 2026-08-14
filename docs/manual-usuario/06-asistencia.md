[← Volver al índice](README.md)

# 6. Asistencia (Checador)

**Rol(es):** Todos los roles con acceso a la web.
**Ubicación:** `Ruta: /asistencia` — menú "Asistencia (Checador)". Es la pantalla a la que se redirige automáticamente a Supervisor e Ingeniero al iniciar sesión.

La pantalla "Registro de Asistencia" funciona como un reloj checador digital. Muestra la hora y fecha actuales, el estado actual de la jornada y cuatro botones de acción que se habilitan según la etapa en la que se encuentre el usuario:

```
sin_registrar → en_jornada → en_comida → en_jornada → finalizada
```

> ℹ️ El registro de asistencia **no utiliza geolocalización ni captura de foto** — cada botón simplemente registra la hora del servidor al presionarlo.

## Registrar entrada

**Ubicación:** Botón **"Entrada"** ("Iniciar jornada"), habilitado cuando el estado es "Sin registro hoy".

### Pasos
1. Ir a "Asistencia (Checador)".
2. Presionar el botón **"Entrada"**.
3. El estado cambia a **"En jornada laboral ✅"**.

### Resultado esperado
Queda registrada la hora de entrada del día; el paso "Entrada" del timeline de hoy se marca como completado.

## Registrar inicio de comida

**Ubicación:** Botón **"Inicio Comida"** ("Tomar descanso"), habilitado cuando el estado es "En jornada laboral".

### Pasos
1. Presionar **"Inicio Comida"**.
2. El estado cambia a **"En descanso de comida ☕"**.

### Resultado esperado
Queda registrada la hora de inicio del descanso de comida.

## Registrar fin de comida

**Ubicación:** Botón **"Fin Comida"** ("Regresar al trabajo"), habilitado cuando el estado es "En descanso de comida".

### Pasos
1. Presionar **"Fin Comida"**.
2. El estado regresa a **"En jornada laboral ✅"**.

### Resultado esperado
Queda registrada la hora de regreso del descanso de comida.

## Registrar salida

**Ubicación:** Botón **"Salida"** ("Finalizar jornada"), habilitado cuando el estado es "En jornada laboral".

### Pasos
1. Presionar **"Salida"**.
2. El estado cambia a **"Jornada finalizada 🏁"**.

### Resultado esperado
Queda registrada la hora de salida; el sistema calcula automáticamente las horas trabajadas del día.

## Ver historial de asistencia

**Ubicación:** Dentro de la misma pantalla, sección **"Timeline de hoy"** — muestra únicamente los 4 pasos del día en curso (Entrada, Inicio Comida, Fin Comida, Salida) con sus horas y una marca de verificación por cada uno ya registrado.

Para consultar el historial completo por fecha y por trabajador (no solo el día de hoy), usar el módulo [Control Horario](08-horarios-y-control-horario.md), disponible en el menú "Finanzas y RH" para administrador y gerente, y de forma acotada a su propio historial para supervisor e ingeniero mediante [Reporte de Horas](09-reporte-horas.md).

### Capturas de pantalla sugeridas
- Pantalla de Asistencia con el reloj en vivo y los 4 botones, en cada uno de los 4 estados posibles.
- Sección "Timeline de hoy" con los 4 pasos marcados como completados.

### Posibles errores
- Un botón deshabilitado (atenuado) indica que esa acción no corresponde al estado actual de la jornada; debe completarse el paso anterior primero (p. ej., no se puede registrar "Salida" sin haber registrado "Entrada").
