# Manual de Usuario — SIGO (Plataforma Web)

Este manual documenta, paso a paso, todos los procesos que un usuario puede realizar en la **aplicación web de SIGO** (Sistema Integral de Gestión de Obras). Está pensado para usuarios sin conocimientos técnicos: personal administrativo, gerencia, supervisores e ingenieros de obra.

> SIGO cuenta con 3 plataformas: **web** (este manual), **móvil** y **escritorio**. Algunas acciones de campo (crear incidencias, subir reportes diarios con fotos) se realizan desde la **app móvil**; en cada caso donde esto aplica, este manual lo indica con una nota ⚠️.

## Cómo usar este manual

Cada proceso documentado incluye:

1. **Rol(es) que pueden realizarlo**
2. **Ubicación** en la plataforma (ruta y menú)
3. **Pasos detallados**
4. **Capturas de pantalla sugeridas**
5. **Campos del formulario** (si aplica)
6. **Resultado esperado**
7. **Posibles errores** y cómo resolverlos

## Roles del sistema

| Rol | Descripción general | Acceso |
|---|---|---|
| `administrador` | Control total de la empresa: usuarios, catálogos, horarios, comercial, finanzas, configuración. | Todos los módulos de su empresa. |
| `gerente` | Igual que administrador, salvo gestión de usuarios. Aprueba reportes diarios e incidencias. | Todos los módulos excepto "Usuarios". |
| `supervisor` | Trabajo de campo: seguimiento de sus proyectos, incidencias, evidencias, asistencia. | Proyectos, Incidencias, Reportes Diarios, Galería, Asistencia, Reporte de Horas. |
| `ingeniero` | Similar a supervisor, atiende incidencias asignadas. | Proyectos, Incidencias, Galería, Asistencia, Reporte de Horas. |
| `superadmin` | Administración global de la plataforma (todas las empresas/tenants). | Dashboard Superadmin, Empresas, Usuarios Globales únicamente. |

## Índice de contenidos

| # | Módulo | Archivo |
|---|---|---|
| 0 | Introducción y acceso | [00-introduccion.md](00-introduccion.md) |
| 1 | Navegación general | [01-navegacion-general.md](01-navegacion-general.md) |
| 2 | Gestión de Proyectos (Obras) | [02-proyectos.md](02-proyectos.md) |
| 3 | Gestión de Incidencias | [03-incidencias.md](03-incidencias.md) |
| 4 | Reportes Diarios de Obra | [04-reportes-diarios.md](04-reportes-diarios.md) |
| 5 | Galería de Evidencias | [05-galeria-evidencias.md](05-galeria-evidencias.md) |
| 6 | Asistencia (Checador) | [06-asistencia.md](06-asistencia.md) |
| 7 | Gestión de Usuarios | [07-usuarios.md](07-usuarios.md) |
| 8 | Horarios y Control Horario | [08-horarios-y-control-horario.md](08-horarios-y-control-horario.md) |
| 9 | Reporte de Horas | [09-reporte-horas.md](09-reporte-horas.md) |
| 10 | Días No Laborales | [10-dias-no-laborales.md](10-dias-no-laborales.md) |
| 11 | Catálogos (Materiales, Proveedores, Clientes) | [11-catalogos.md](11-catalogos.md) |
| 12 | Módulo Comercial (Inventario, Cotizaciones, Ventas, Pedidos) | [12-comercial.md](12-comercial.md) |
| 13 | Gastos de Obra | [13-gastos-obra.md](13-gastos-obra.md) |
| 14 | Dashboard Ejecutivo | [14-dashboard-ejecutivo.md](14-dashboard-ejecutivo.md) |
| 15 | Dashboard Superadmin | [15-dashboard-superadmin.md](15-dashboard-superadmin.md) |
| A | Anexo A — Capturas de pantalla recomendadas | [ANEXO-A-capturas-recomendadas.md](ANEXO-A-capturas-recomendadas.md) |
| B | Anexo B — Estado de procesos documentados | [ANEXO-B-estado-procesos.md](ANEXO-B-estado-procesos.md) |

## Convenciones usadas en este manual

- `Ruta: /ejemplo` indica la URL dentro de la plataforma web.
- Los nombres de botones y campos se citan **exactamente** como aparecen en pantalla (p. ej. "Guardar Cambios").
- Un campo marcado con `*` es obligatorio.
- Notas de alcance:

  > ⚠️ **Nota:** Esta acción no está disponible en la plataforma web — se realiza desde la app móvil.

  > ⚠️ **Nota:** Esta funcionalidad está en desarrollo. Actualmente muestra un mensaje "En desarrollo".
