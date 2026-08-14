[← Volver al índice](README.md)

# 7. Gestión de Usuarios

## Ver lista de usuarios

**Rol(es):** Administrador.
**Ubicación:** `Ruta: /usuarios` — menú "Usuarios" (grupo "Gestión", solo visible para administrador).

### Pasos
1. Ir a "Usuarios" en el menú lateral.
2. Usar el buscador **"Buscar por nombre o email..."**.
3. Filtrar por **rol** ("Todos los roles" o uno específico) y por **estado** ("Todos los estados" / "Solo activos" / "Solo inactivos").
4. Revisar la tabla: Usuario, Rol, Departamento, Email, Teléfono, Estado, Registrado.

### Capturas de pantalla sugeridas
- Lista de usuarios con los filtros de rol y estado.

### Resultado esperado
Se muestra el listado de usuarios de la empresa activa, paginado (6 por página).

---

## Crear un nuevo usuario

**Rol(es):** Administrador.
**Ubicación:** Botón **"Nuevo Usuario"** en la lista de usuarios → modal **"Nuevo Usuario"**.

### Pasos
1. En "Usuarios", presionar **"Nuevo Usuario"**.
2. Completar el formulario del modal.
3. Presionar **"Crear Usuario"**.

### Campos del formulario
| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| Nombre completo | Texto | Sí | Placeholder: "Ej. Juan Pérez" |
| Email | Correo | Sí | Debe incluir "@" |
| Contraseña | Contraseña | Sí | Mínimo 6 caracteres |
| Teléfono | Texto | No | Placeholder: "555-0100" |
| Rol | Selección | Sí | administrador, gerente, supervisor, ingeniero |
| Departamento | Selección | No | Incluye opción "Sin departamento" |

### Capturas de pantalla sugeridas
- Modal "Nuevo Usuario" con todos los campos visibles.

### Resultado esperado
El usuario se crea, aparece en la lista con estado "Activo" y puede iniciar sesión con las credenciales indicadas.

### Posibles errores
- **"El nombre es requerido"** — falta el nombre completo.
- **"Email inválido"** — el correo no contiene "@".
- Contraseña menor a 6 caracteres — se debe ingresar una contraseña más larga.

---

## Editar un usuario (cambiar rol, departamento, estado)

**Rol(es):** Administrador.
**Ubicación:** Ícono de edición (lápiz) en la fila del usuario → modal **"Editar Usuario"**.

### Pasos
1. En la lista de usuarios, presionar el ícono de edición en la fila deseada.
2. Modificar los campos necesarios: nombre, email, teléfono, rol, departamento.
3. Para cambiar la contraseña, completar **"Nueva contraseña (opcional)"** (mínimo 6 caracteres si se llena; si se deja vacío, la contraseña actual no cambia).
4. Presionar **"Guardar Cambios"**.

### Capturas de pantalla sugeridas
- Modal "Editar Usuario" con el campo "Nueva contraseña (opcional)" resaltado.

### Resultado esperado
Los datos del usuario se actualizan; si se cambió el rol, el usuario verá un menú lateral distinto la próxima vez que inicie sesión.

---

## Activar/Desactivar un usuario

**Rol(es):** Administrador.
**Ubicación:** Íconos de acción en la fila del usuario, dentro de la lista.

### Pasos para desactivar
1. En la fila de un usuario activo, presionar el ícono de basurero.
2. Confirmar en el diálogo **"Desactivar usuario"** ("¿Estás seguro de que deseas desactivar este usuario? Podrás reactivarlo más tarde."), presionando **"Desactivar"**.

### Pasos para reactivar
1. En la fila de un usuario inactivo, presionar el ícono de reactivar (flecha circular), con título "Activar usuario".

### Capturas de pantalla sugeridas
- Diálogo de confirmación "Desactivar usuario".
- Fila de un usuario inactivo mostrando el ícono de reactivar.

### Resultado esperado
- Al desactivar: el usuario pasa a estado "Inactivo" y no puede iniciar sesión, pero sus datos y su historial se conservan (baja lógica, no se elimina el registro).
- Al reactivar: el usuario vuelve a estado "Activo" y puede iniciar sesión nuevamente.
