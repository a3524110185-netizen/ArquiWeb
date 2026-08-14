[← Volver al índice](README.md)

# 0. Introducción

## ¿Qué es SIGO?

SIGO (Sistema Integral de Gestión de Obras) es la plataforma que utiliza la empresa para administrar sus proyectos de construcción de principio a fin: seguimiento de avance físico, incidencias en obra, asistencia del personal, control de materiales, ventas y gastos. Cuenta con tres plataformas complementarias:

- **Web** (este manual): administración, monitoreo, validación y reportes — pensada para oficina/gerencia.
- **Móvil**: captura en campo (reportes diarios con fotos, creación de incidencias).
- **Escritorio**: fuera del alcance de este manual.

## Roles del sistema

SIGO reconoce 5 roles. El rol de cada usuario determina qué módulos ve en el menú lateral y qué acciones puede ejecutar:

| Rol | Enfoque | Redirección al iniciar sesión |
|---|---|---|
| **Administrador** | Control total de su empresa. | `/dashboard` |
| **Gerente** | Igual que administrador, salvo gestión de usuarios; aprueba reportes diarios e incidencias. | `/dashboard` |
| **Supervisor** | Trabajo de campo, seguimiento de sus proyectos. | `/asistencia` |
| **Ingeniero** | Trabajo de campo, atiende incidencias asignadas. | `/asistencia` |
| **Superadmin** | Administra todas las empresas registradas en SIGO (multiempresa). | `/dashboard-superadmin` |

## Acceso a la plataforma

**Rol(es):** Todos.
**Ubicación:** `Ruta: /login`

### Pasos

1. Abrir la URL de la plataforma web de SIGO en el navegador. El sistema redirige automáticamente a la pantalla de inicio de sesión si no hay una sesión activa.
2. Completar el campo **"Correo electrónico"** con el correo registrado.
3. Completar el campo **"Contraseña"**. Puede usarse el ícono de ojo para mostrar/ocultar el texto ingresado.
4. Presionar el botón **"Iniciar Sesión"**.
5. El sistema valida las credenciales y redirige automáticamente según el rol del usuario (ver tabla anterior).

### Capturas de pantalla sugeridas
- Pantalla de login vacía (campos "Correo electrónico" y "Contraseña", botón "Iniciar Sesión").
- Pantalla de login con mensaje de error visible.
- Pantalla inmediatamente después de iniciar sesión (dashboard correspondiente al rol).

### Campos del formulario
| Campo | Tipo | Requerido |
|---|---|---|
| Correo electrónico | Texto/email | Sí |
| Contraseña | Contraseña (con mostrar/ocultar) | Sí |

### Resultado esperado
El usuario accede a la plataforma y es dirigido automáticamente a la pantalla inicial que le corresponde según su rol.

### Posibles errores
- **"Por favor ingresa tu correo y contraseña."** — Alguno de los dos campos quedó vacío. Completar ambos campos.
- Credenciales incorrectas — el sistema muestra un mensaje de error; verificar correo y contraseña, o contactar al administrador para restablecerlas.
- **Rol sin acceso a la web**: si el rol del usuario no tiene permitido el acceso a la aplicación web, se redirige a `/no-autorizado` con el mensaje: *"Lo sentimos, tu rol no tiene permisos para acceder a la aplicación web. Por favor, utiliza la aplicación móvil o contacta al administrador."* En ese caso solo está disponible el botón **"Cerrar Sesión"**.

## Cerrar sesión

**Rol(es):** Todos.
**Ubicación:** Botón "Cerrar Sesión" en el menú lateral (Sidebar) o ícono de salida en la barra superior (Header).

### Pasos
1. Presionar **"Cerrar Sesión"**.
2. El sistema termina la sesión y redirige a `/login`.

### Resultado esperado
La sesión se cierra y el usuario debe volver a iniciar sesión para acceder a la plataforma.
