[← Volver al índice](README.md)

# 12. Módulo Comercial

## Inventario

**Rol(es):** Consulta: todos los que acceden a "Comercial". Registrar movimiento: solo Administrador.
**Ubicación:** `Ruta: /comercial/inventario` — menú "Comercial › Inventario".

### Ver stock y movimientos
1. Ir a "Inventario".
2. Revisar la tabla **"Control de Inventario"**: Código, Nombre, Stock Actual, Stock Mínimo, Estado (insignia Bajo/Normal).
3. Activar la casilla **"Solo bajo stock"** para ver únicamente materiales con stock por debajo del mínimo.
4. Revisar la tabla **"Últimos Movimientos"** (últimos 10): Fecha, Material, Tipo, Cantidad, Usuario, Motivo.

### Registrar un movimiento (solo Administrador)
1. Presionar **"Registrar Movimiento"**.
2. Completar el formulario:

| Campo | Tipo | Requerido |
|---|---|---|
| Material | Selección | Sí |
| Tipo de movimiento | Selección: Entrada, Salida, Ajuste | Sí |
| Cantidad | Numérico (mínimo 1) | Sí |
| Motivo | Texto largo (placeholder "Ej. Compra a proveedor, uso en obra...") | No |

3. Confirmar el movimiento.

### Capturas de pantalla sugeridas
- Tabla "Control de Inventario" con la casilla "Solo bajo stock" activada.
- Modal "Registrar Movimiento" con los 4 campos.

### Resultado esperado
El stock del material se actualiza (suma en Entrada, resta en Salida, ajusta al valor indicado en Ajuste) y el movimiento queda registrado en el historial.

---

## Cotizaciones

**Ubicación:** `Ruta: /comercial/cotizaciones` — menú "Comercial › Cotizaciones".

### Ver lista
Tabla: Folio, Cliente, Fecha, Total, Estado (Borrador, Enviada, Aceptada, Rechazada, Convertida). Buscador por folio o cliente.

### Crear una cotización
**Ubicación:** Botón **"Nueva Cotización"** → `Ruta: /comercial/cotizaciones/nueva`.

1. Elegir **Cliente** (obligatorio).
2. Agregar renglones ("Partidas"): elegir **Material** (muestra código, nombre y precio), indicar **Cantidad**, presionar **"Agregar"**.
3. Ajustar, si es necesario, la **Cantidad** o el **Precio Unitario** de cada renglón ya agregado; eliminar con el ícono de basurero.
4. Opcionalmente, escribir **Notas**.
5. Revisar los totales calculados automáticamente: Subtotal, IVA (16%), Total.
6. Presionar **"Guardar Cotización"**.

| Campo | Tipo | Requerido |
|---|---|---|
| Cliente | Selección | Sí |
| Notas | Texto largo | No |
| Partidas (Material + Cantidad) | — | Al menos 1 |

### Ver detalle y exportar a PDF
**Ubicación:** `Ruta: /comercial/cotizaciones/[id]`.
1. Abrir la cotización desde la lista.
2. Presionar **"Exportar PDF"** (disponible para todos): se abre el diálogo de impresión del navegador con el formato listo para guardar como PDF.

### Convertir a venta
**Rol(es):** Solo Administrador, y únicamente si la cotización aún no fue convertida.
1. En el detalle de la cotización, presionar **"Convertir a Venta"**.
2. Confirmar en el cuadro de diálogo ("¿Convertir esta cotización en venta?").

### Capturas de pantalla sugeridas
- Formulario "Nueva Cotización" con varias partidas agregadas y los totales visibles.
- Detalle de cotización con el botón "Convertir a Venta" visible.
- Vista previa de impresión al exportar a PDF.

### Resultado esperado
Al convertir, se genera una nueva venta ligada a la cotización, y el estado de la cotización cambia a "Convertida" (ya no puede volver a convertirse).

### Posibles errores
- No se puede guardar una cotización sin cliente o sin al menos una partida.

---

## Ventas

**Ubicación:** `Ruta: /comercial/ventas` — menú "Comercial › Ventas".

### Ver lista
Filtros: Cliente, rango de fechas (Desde/Hasta). Tabla: Folio, Cliente, Fecha, Total, Estado (Pagada, Pendiente, Cancelada, Vencida).

### Ver detalle
**Ubicación:** `Ruta: /comercial/ventas/[id]`.
Muestra folio, estado, método de pago, fecha, cliente (nombre, RFC, teléfono, email), vendedor, renglones (Código, Material, Unidad, Cantidad, Precio Unitario, Subtotal) y, si la venta proviene de una cotización, un enlace a la cotización de origen. Botón **"Exportar PDF"** disponible (usa la impresión del navegador).

### Crear una venta directa
**Rol(es):** Solo Administrador.
**Ubicación:** Botón **"Nueva Venta Directa"** → `Ruta: /comercial/ventas/nueva`.

1. Buscar y seleccionar el **Cliente** en el campo "Buscar cliente".
2. Buscar un **Material** (mínimo 2 caracteres), elegirlo de los resultados, indicar **Cantidad** (no puede superar el stock actual) y presionar **"Agregar"**.
3. Repetir para cada material.
4. Elegir el **Método de pago**: Efectivo, Transferencia o Tarjeta.
5. Revisar Subtotal, IVA (16%) y Total.
6. Presionar **"Guardar Venta"** (se habilita solo cuando hay cliente, al menos un artículo y método de pago).

| Campo | Tipo | Requerido |
|---|---|---|
| Cliente | Buscador/autocompletar | Sí |
| Materiales + Cantidad | Buscador + numérico | Al menos 1 |
| Método de pago | Selección: Efectivo, Transferencia, Tarjeta | Sí |

### Capturas de pantalla sugeridas
- Lista de ventas con los filtros de cliente y fechas.
- Formulario "Nueva Venta Directa" con el buscador de materiales y la tabla de artículos agregados.
- Detalle de una venta generada desde una cotización, mostrando el enlace de origen.

### Resultado esperado
La venta se registra, se descuenta el stock de los materiales vendidos y queda disponible en la lista y en el detalle.

### Posibles errores
- **"Stock insuficiente"** — se intentó agregar una cantidad mayor al stock disponible del material.

---

## Pedidos de Venta

**Ubicación:** `Ruta: /comercial/pedidos` — menú "Comercial › Pedidos".
**Rol(es):** Consulta: todos con acceso a "Comercial". Crear / cambiar estado: Administrador y Gerente.

### Ver lista
Filtros: búsqueda por folio/cliente, Cliente, Estado (Pendiente, Aprobado, Rechazado, Entregado), rango de fechas. Tabla: Folio, Cliente, Fecha Pedido, Fecha Entrega, Total, Estado.

### Crear un pedido
**Ubicación:** Botón **"Nuevo Pedido"** → `Ruta: /comercial/pedidos/nuevo`.

1. Elegir **Cliente**.
2. Opcionalmente indicar **Fecha de entrega**.
3. Opcionalmente escribir **Observaciones**.
4. Agregar materiales igual que en Cotizaciones (Material + Cantidad, ajustables después de agregados).
5. Revisar Subtotal, IVA (16%), Total.
6. Presionar **"Guardar Pedido"**.

| Campo | Tipo | Requerido |
|---|---|---|
| Cliente | Selección | Sí |
| Fecha de entrega | Fecha | No |
| Observaciones | Texto largo | No |
| Materiales + Cantidad | — | Al menos 1 |

### Ver detalle y cambiar estado
**Ubicación:** `Ruta: /comercial/pedidos/[id]`.

1. Abrir el pedido desde la lista.
2. Presionar **"Cambiar Estado"**.
3. En el modal **"Cambiar estado del pedido"**, elegir el **Nuevo estado** (Pendiente, Aprobado, Rechazado, Entregado) y, opcionalmente, escribir **Observaciones** (motivo del cambio).
4. Confirmar.

El botón **"Editar"** solo está disponible mientras el pedido se encuentra en estado **Pendiente**.

### Capturas de pantalla sugeridas
- Formulario "Nuevo Pedido" con la tabla de materiales agregados.
- Modal "Cambiar estado del pedido" con el selector de nuevo estado.

### Resultado esperado
El pedido cambia de estado y queda reflejado en la lista; si el pedido ya no está "Pendiente", deja de poder editarse.
