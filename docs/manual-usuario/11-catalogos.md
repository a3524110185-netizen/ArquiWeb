[← Volver al índice](README.md)

# 11. Catálogos

Los catálogos permiten mantener actualizada la información base que usan otros módulos (Comercial, Gastos de Obra, Proyectos). Solo **Administrador** puede crear, editar o desactivar registros; el resto de los roles con acceso a estas pantallas las ven en modo **"Solo lectura"**.

## Materiales

**Ubicación:** `Ruta: /catalogos/materiales` — menú "Catálogos › Materiales".

### Ver lista
1. Ir a "Materiales".
2. Buscar por nombre o código, o filtrar por proveedor ("Todos los proveedores").
3. Revisar la tabla: Código, Nombre, Unidad, Precio Compra, Precio Venta, Stock (con insignia "Bajo"/"Normal"), Proveedor, Estado.

### Crear un material
**Ubicación:** Botón **"Nuevo Material"** → `Ruta: /catalogos/materiales/nuevo`.

| Campo | Tipo | Requerido |
|---|---|---|
| Código | Texto | Sí (placeholder "MAT-001") |
| Nombre | Texto | Sí (placeholder "Ej. Cemento gris") |
| Descripción | Texto largo | No |
| Unidad de medida | Selección agrupada | Sí |
| Proveedor | Selección | Sí |
| Precio de compra | Numérico (≥ 0) | Sí |
| Precio de venta | Numérico (≥ 0) | Sí |
| Stock actual | Numérico (≥ 0) | Sí |
| Stock mínimo | Numérico (≥ 0) | Sí |

Pasos: completar el formulario y presionar **"Crear Material"**.

### Editar un material
**Ubicación:** `Ruta: /catalogos/materiales/[id]/editar`, desde el detalle del material. Mismos campos; botón **"Guardar Cambios"**.

### Desactivar un material
Ícono de basurero en la fila → diálogo **"Desactivar material"** → confirmar con **"Desactivar"**. No existe botón de reactivar visible para materiales inactivos en esta pantalla.

### Capturas de pantalla sugeridas
- Lista de materiales con insignias de stock "Bajo"/"Normal".
- Formulario "Nuevo Material" completo.

### Resultado esperado
El material queda disponible para usarse en Inventario, Cotizaciones, Ventas y Pedidos.

### Posibles errores
- Campos obligatorios vacíos (código, nombre, unidad, proveedor) o valores numéricos negativos bloquean el guardado.

---

## Proveedores

**Ubicación:** `Ruta: /catalogos/proveedores` — menú "Catálogos › Proveedores".

### Ver lista
Tabla con columnas: Nombre, Contacto, Teléfono, Email, Estado.

### Crear / Editar
**Ubicación:** Botón **"Nuevo Proveedor"** (crear) o clic en una fila (editar) → mismo modal, titulado **"Nuevo Proveedor"** / **"Editar Proveedor"** (o "Detalle de Proveedor" en modo solo lectura).

| Campo | Tipo | Requerido |
|---|---|---|
| Nombre | Texto | Sí (placeholder "Ej. Materiales del Norte S.A.") |
| Contacto | Texto | No |
| Teléfono | Texto | No |
| Email | Texto | No |
| Dirección | Texto | No |

### Desactivar
Ícono de basurero → diálogo **"Desactivar proveedor"** → confirmar.

### Capturas de pantalla sugeridas
- Modal "Nuevo Proveedor" con los campos visibles.

### Resultado esperado
El proveedor queda disponible para asociarlo a materiales y gastos de obra.

---

## Clientes

**Ubicación:** `Ruta: /catalogos/clientes` — menú "Catálogos › Clientes". Título: "Directorio de Clientes".

### Ver lista
Tabla con columnas: Nombre, RFC, Contacto, Teléfono, Email, Estado.

### Crear / Editar
Mismo patrón de modal que Proveedores.

| Campo | Tipo | Requerido |
|---|---|---|
| Nombre | Texto | Sí (placeholder "Ej. Grupo Constructor XYZ") |
| RFC | Texto | No |
| Contacto | Texto | No |
| Teléfono | Texto | No |
| Email | Texto | No |
| Dirección | Texto | No |

### Desactivar
Ícono de basurero → diálogo **"Desactivar cliente"** → confirmar.

### Capturas de pantalla sugeridas
- Directorio de clientes con la columna Estado visible.

### Resultado esperado
El cliente queda disponible para asociarlo a proyectos, cotizaciones, ventas y pedidos.

---

## Categorías (catálogo adicional, no incluido en el esquema original)

**Rol(es):** Administrador.
**Ubicación:** `Ruta: /configuracion/categorias` — menú "Configuración › Categorías" (solo visible para administrador).

Este catálogo administra las categorías utilizadas para clasificar los registros del módulo [Gastos de Obra](13-gastos-obra.md) (por ejemplo: Materiales, Mano de Obra, Transporte). Se documenta aquí porque, aunque no formaba parte del esquema original solicitado, es un catálogo administrable relevante para completar los flujos de Gastos de Obra.
