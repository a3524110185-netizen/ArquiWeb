[← Volver al índice](README.md)

# 13. Gastos de Obra

## Ver lista de gastos

**Rol(es):** Consulta: todos los roles con acceso a la web. Crear/editar/eliminar: Administrador y Gerente.
**Ubicación:** `Ruta: /gastos-obra` — menú "Gastos de Obra".

### Pasos
1. Ir a "Gastos de Obra" en el menú lateral.
2. Filtrar con el buscador de texto, el selector **"Todos los proyectos"**, el selector **"Todas las categorías"** y el rango de fechas **Desde** / **Hasta**.
3. Revisar la tabla: Proyecto, Categoría, Monto, Fecha, Descripción, Comprobante (ícono de clip si tiene archivo adjunto), Capturista.
4. Revisar el total general mostrado en el encabezado.

### Capturas de pantalla sugeridas
- Lista de gastos con los filtros de proyecto, categoría y fechas aplicados.

### Resultado esperado
Se muestra el listado de gastos filtrado, junto con el total acumulado.

---

## Crear un nuevo gasto (con comprobante)

**Rol(es):** Administrador y Gerente.
**Ubicación:** Botón **"Nuevo Gasto"** → `Ruta: /gastos-obra/nuevo`.

### Pasos
1. Presionar **"Nuevo Gasto"**.
2. Completar el formulario.
3. Adjuntar el comprobante (opcional) haciendo clic o arrastrando el archivo al recuadro "Comprobante (opcional)".
4. Presionar **"Guardar Gasto"**.

### Campos del formulario
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| Proyecto | Selección | Sí | |
| Categoría | Selección | Sí | |
| Proveedor | Selección | No | |
| Monto ($) | Numérico (≥ 0) | Sí | |
| Fecha | Fecha | Sí | Por defecto, hoy |
| Descripción | Texto largo | No | Placeholder: "¿Qué se compró o pagó?" |
| Comprobante | Archivo (PDF o imagen) | No | Máximo 5 MB |

### Capturas de pantalla sugeridas
- Formulario "Nuevo Gasto" completo, con un archivo de comprobante ya cargado.

### Resultado esperado
El gasto se registra y aparece en la lista, con su comprobante disponible para consulta posterior.

### Posibles errores
- **"Archivo no válido"** — el comprobante no es PDF, JPG o PNG.
- **"Archivo muy grande"** — el comprobante supera los 5 MB.
- Campos obligatorios vacíos (proyecto, categoría, monto o fecha) impiden guardar.

---

## Editar un gasto

**Rol(es):** Administrador y Gerente.
**Ubicación:** `Ruta: /gastos-obra/[id]/editar`, desde el detalle del gasto → botón **"Editar"**.

### Pasos
1. Abrir el detalle del gasto y presionar **"Editar"**.
2. Modificar los campos necesarios.
3. Si ya existe un comprobante, se puede consultar con **"Ver comprobante actual"** o sustituirlo con **"Reemplazar"**.
4. Presionar **"Guardar Cambios"**.

### Capturas de pantalla sugeridas
- Formulario de edición con la opción "Ver comprobante actual" / "Reemplazar" visible.

### Resultado esperado
Los cambios se guardan y se reflejan en la lista y el detalle del gasto.

---

## Eliminar un gasto

**Rol(es):** Administrador y Gerente.
**Ubicación:** Ícono de basurero en la fila del gasto, dentro de la lista.

### Pasos
1. Presionar el ícono de basurero.
2. Confirmar en el diálogo **"Eliminar gasto"**.

### Resultado esperado
El gasto se elimina de la lista y de los totales/gráficas.

---

## Ver gráficas por categoría y proyecto

**Ubicación:** Parte superior de la lista de "Gastos de Obra" (se actualizan según los filtros aplicados).

### Contenido
- **"Gastos por Categoría"**: gráfica de pastel/dona con el total por categoría.
- **"Gastos por Proyecto"**: gráfica de barras horizontales con el total por proyecto.

### Capturas de pantalla sugeridas
- Ambas gráficas visibles simultáneamente con datos de varios proyectos y categorías.

### Resultado esperado
Se obtiene una vista rápida de en qué se está gastando y en qué proyectos, útil para control presupuestal.
