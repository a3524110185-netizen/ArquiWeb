[← Volver al índice](README.md)

# Anexo B — Estado de los Procesos Documentados

Comparación entre el esquema de 16 secciones solicitado originalmente y lo efectivamente documentado, tras verificar el comportamiento real de la aplicación web.

**Leyenda:**
- ✅ **Documentado tal cual** — el proceso existe en la web exactamente como se esperaba.
- ✏️ **Documentado con corrección de alcance** — el proceso existe, pero su comportamiento real difiere del descrito en el esquema original; se documentó la realidad.
- ⚠️ **Documentado con nota** — el proceso no existe en la web (es exclusivo de la app móvil) o existe pero está incompleto/en desarrollo; se documentó junto con una nota aclaratoria.

| Módulo | Proceso | Estado | Detalle |
|---|---|:---:|---|
| 0. Introducción | ¿Qué es SIGO? | ✅ | — |
| | Roles del sistema | ✅ | 5 roles reales: administrador, gerente, supervisor, ingeniero, superadmin |
| | Acceso a la plataforma (login) | ✅ | — |
| 1. Navegación | Sidebar según rol | ✅ | — |
| | Selector de empresa | ✅ | — |
| | Perfil de usuario y cerrar sesión | ✏️ | No existe pantalla de "editar perfil"; solo se puede cerrar sesión. Edición de datos de usuario solo vía módulo Usuarios (admin). |
| 2. Proyectos | Ver lista | ✅ | — |
| | Crear proyecto | ✅ | — |
| | Editar proyecto | ✅ | — |
| | Asignar personal (Gestionar Equipo) | ✅ | Enlace visible solo para administrador |
| | Ver detalle (KPIs, reportes, incidencias) | ✏️ | El detalle no incluye pestaña de incidencias; se accede desde el módulo Incidencias filtrando por proyecto |
| 3. Incidencias | Ver lista con filtros | ✅ | — |
| | Crear nueva incidencia | ⚠️ | No disponible en web — se crea desde la app móvil |
| | Asignar responsable | ✅ | Solo admin/gerente |
| | Cambiar estado | ✅ | — |
| | Agregar comentarios | ✅ | No disponible para rol supervisor |
| | Cerrar incidencia | ✅ | Se realiza vía el mismo selector de Estado, sin botón dedicado |
| 4. Reportes diarios | Ver lista | ✅ | — |
| | Crear reporte diario | ⚠️ | No disponible en web — se crea desde la app móvil |
| | Subir fotos | ⚠️ | No disponible en web — se sube desde la app móvil |
| | Validar reporte (aprobar/rechazar) | ✅ | Solo admin/gerente |
| | Ver detalle con fotos | ✅ | — |
| 5. Galería de evidencias | Ver todas las fotos | ✅ | — |
| | Filtrar por proyecto | ✅ | Único filtro disponible |
| | Ver detalle de cada foto | ✅ | — |
| 6. Asistencia | Registrar entrada/comida/salida | ✅ | Sin geolocalización ni foto |
| | Ver historial de asistencia | ✏️ | La misma pantalla solo muestra el día actual; el historial completo está en Control Horario / Reporte de Horas |
| 7. Usuarios | Ver lista | ✅ | Solo administrador |
| | Crear usuario | ✅ | — |
| | Editar usuario | ✅ | — |
| | Activar/Desactivar | ✅ | — |
| 8. Horarios | Configurar horario por día de la semana | ✅ | Solo administrador edita |
| | Configurar horario de comida | ⚠️ | No existe como campo configurable en el sistema |
| | Ver "Control Horario" (asignación por usuario) | ✏️ | No es una pantalla de asignación; es un reporte/consulta de asistencia con filtros y exportación |
| 9. Reporte de horas | Ver resumen por usuario | ✅ | — |
| | Ver detalles por día (expandir fila) | ✅ | — |
| | Exportar (Excel) | ⚠️ | Botón presente pero no funcional ("En desarrollo") |
| 10. Días no laborales | Ver lista | ✅ | — |
| | Crear | ✅ | A nivel empresa, sin alcance por proyecto |
| | Eliminar | ✅ | — |
| 11. Catálogos | Materiales (crear/editar/desactivar) | ✅ | — |
| | Proveedores (crear/editar/desactivar) | ✅ | — |
| | Clientes (crear/editar/desactivar) | ✅ | — |
| | Categorías (bonus, no en esquema original) | ✅ | Agregado por relevancia con Gastos de Obra |
| 12. Comercial | Inventario (stock y movimientos) | ✅ | — |
| | Cotizaciones (crear/ver/convertir/exportar PDF) | ✅ | "Convertir a Venta" solo administrador |
| | Ventas (lista/detalle/venta directa) | ✅ | Venta directa solo administrador |
| | Pedidos (crear/ver/cambiar estado) | ✅ | Solo admin/gerente |
| 13. Gastos de obra | Ver lista con filtros | ✅ | — |
| | Crear con comprobante | ✅ | Solo admin/gerente |
| | Editar | ✅ | Solo admin/gerente |
| | Ver gráficas por categoría/proyecto | ✅ | — |
| 14. Dashboard ejecutivo | KPIs globales | ✅ | Solo admin/gerente |
| | Gráficas de ventas por mes | ✅ | — |
| | Distribución de proyectos por estado | ✅ | — |
| | Actividad reciente | ✅ | — |
| 15. Dashboard superadmin | Estadísticas globales | ✅ | Solo superadmin |
| | Gestionar empresas (CRUD) | ✅ | — |
| | Gestionar usuarios de todas las empresas | ✏️ | Solo permite cambiar rol y activar/desactivar; no hay flujo de "crear usuario" cross-empresa en esta pantalla |

## Resumen

- **Procesos documentados tal cual:** 38
- **Procesos documentados con corrección de alcance:** 6
- **Procesos documentados con nota (móvil / en desarrollo):** 4
- **Total de procesos cubiertos:** 48
