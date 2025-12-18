# Auditoría de Entidades y Permisos - Mateatletas

**Fecha:** 2025-12-17
**Versión:** 1.0

---

## 1. ENTIDADES DEL SISTEMA (Schema Prisma)

### 1.1 Modelos Principales

| Modelo                 | Descripción                                        | Relaciones Clave                                        |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| **Tutor**              | Padre/representante de estudiantes                 | → Estudiantes, InscripcionesMensuales, Pagos            |
| **Estudiante**         | Usuario estudiantil                                | → Tutor, Casa, Inscripciones, Asistencias, Gamificacion |
| **Docente**            | Profesor/instructor                                | → ClaseGrupos, Clases, RutasEspecialidad                |
| **AdminUser**          | Usuario administrador                              | Solo autenticación                                      |
| **Clase**              | Instancia de clase individual                      | → Docente, Inscripciones                                |
| **ClaseGrupo**         | Grupo recurrente de clases                         | → Docente, Estudiantes, Asistencias                     |
| **Sector**             | Área temática (Matemática, etc.)                   | → RutasEspecialidad                                     |
| **RutaEspecialidad**   | Currículo/track de aprendizaje                     | → Sector, Docentes                                      |
| **Casa**               | Sistema de gamificación (Quantum, Nexus, Forge)    | → Estudiantes                                           |
| **Mundo**              | Áreas STEAM (Science, Math, Tech)                  | → Inscripciones2026                                     |
| **Tier**               | Nivel de suscripción                               | → Inscripciones2026                                     |
| **InscripcionMensual** | Inscripción mensual de pago                        | → Estudiante, Tutor, Producto                           |
| **Inscripcion2026**    | Inscripción anual 2026                             | → Tutor, Estudiantes, Mundos, Tier                      |
| **Pago**               | Registro de pago                                   | → InscripcionMensual                                    |
| **Membresia**          | Membresía del tutor                                | → Tutor                                                 |
| **Asistencia**         | Registro de asistencia                             | → Estudiante, Clase                                     |
| **Producto**           | Curso/producto comercial                           | → Modulos, Lecciones                                    |
| **Modulo**             | Módulo de curso                                    | → Producto, Lecciones                                   |
| **Leccion**            | Lección individual                                 | → Modulo, Progreso                                      |
| **Evento**             | Eventos del calendario (Tarea, Recordatorio, Nota) | → Docente                                               |
| **Logro**              | Logro de gamificación                              | → EstudianteLogro                                       |
| **AccionPuntuable**    | Acción que otorga puntos                           | → HistorialPuntos                                       |
| **ItemTienda**         | Item de la tienda virtual                          | → ItemObtenido                                          |
| **CategoriaItem**      | Categoría de items                                 | → Items                                                 |
| **Notificacion**       | Notificación del sistema                           | → Docente                                               |
| **Alerta**             | Alerta administrativa                              | → Estudiante, Clase                                     |

---

## 2. ROLES DEL SISTEMA

```typescript
enum Role {
  ADMIN = 'admin',
  DOCENTE = 'docente',
  TUTOR = 'tutor',
  ESTUDIANTE = 'estudiante',
}
```

### Jerarquía de Permisos:

1. **ADMIN** - Acceso total, gestión del sistema
2. **DOCENTE** - Gestión de clases, asistencia, gamificación
3. **TUTOR** - Gestión de sus estudiantes, pagos
4. **ESTUDIANTE** - Acceso limitado a su propia información

---

## 3. MATRIZ DE PERMISOS POR CONTROLADOR

### 3.1 AuthController

| Endpoint            | Público | Admin | Docente | Tutor | Estudiante |
| ------------------- | ------- | ----- | ------- | ----- | ---------- |
| POST /auth/login    | ✅      | -     | -       | -     | -          |
| POST /auth/register | ✅      | -     | -       | -     | -          |
| POST /auth/refresh  | ✅      | -     | -       | -     | -          |
| GET /auth/me        | -       | ✅    | ✅      | ✅    | ✅         |

### 3.2 AdminController

| Endpoint                                 | Admin | Docente | Tutor | Estudiante |
| ---------------------------------------- | ----- | ------- | ----- | ---------- |
| GET /admin/dashboard                     | ✅    | ❌      | ❌    | ❌         |
| GET /admin/estadisticas                  | ✅    | ❌      | ❌    | ❌         |
| GET /admin/alertas                       | ✅    | ❌      | ❌    | ❌         |
| PATCH /admin/alertas/:id/resolver        | ✅    | ❌      | ❌    | ❌         |
| GET /admin/usuarios                      | ✅    | ❌      | ❌    | ❌         |
| GET /admin/estudiantes                   | ✅    | ❌      | ❌    | ❌         |
| POST /admin/estudiantes                  | ✅    | ❌      | ❌    | ❌         |
| GET /admin/credenciales                  | ✅    | ❌      | ❌    | ❌         |
| POST /admin/credenciales/:id/reset       | ✅    | ❌      | ❌    | ❌         |
| POST /admin/credenciales/reset-masivo    | ✅    | ❌      | ❌    | ❌         |
| POST /admin/usuarios/:id/role            | ✅    | ❌      | ❌    | ❌         |
| PUT /admin/usuarios/:id/roles            | ✅    | ❌      | ❌    | ❌         |
| DELETE /admin/usuarios/:id               | ✅    | ❌      | ❌    | ❌         |
| GET /admin/sectores                      | ✅    | ❌      | ❌    | ❌         |
| POST /admin/sectores                     | ✅    | ❌      | ❌    | ❌         |
| PUT /admin/sectores/:id                  | ✅    | ❌      | ❌    | ❌         |
| DELETE /admin/sectores/:id               | ✅    | ❌      | ❌    | ❌         |
| GET /admin/rutas-especialidad            | ✅    | ❌      | ❌    | ❌         |
| POST /admin/rutas-especialidad           | ✅    | ❌      | ❌    | ❌         |
| PUT /admin/rutas-especialidad/:id        | ✅    | ❌      | ❌    | ❌         |
| DELETE /admin/rutas-especialidad/:id     | ✅    | ❌      | ❌    | ❌         |
| GET /admin/docentes/:id/rutas            | ✅    | ❌      | ❌    | ❌         |
| PUT /admin/docentes/:id/rutas            | ✅    | ❌      | ❌    | ❌         |
| GET /admin/clase-grupos                  | ✅    | ❌      | ❌    | ❌         |
| POST /admin/clase-grupos                 | ✅    | ❌      | ❌    | ❌         |
| PUT /admin/clase-grupos/:id              | ✅    | ❌      | ❌    | ❌         |
| DELETE /admin/clase-grupos/:id           | ✅    | ❌      | ❌    | ❌         |
| POST /admin/clase-grupos/:id/asistencias | ✅    | ❌      | ❌    | ❌         |
| GET /admin/circuit-metrics               | ✅    | ❌      | ❌    | ❌         |

### 3.3 EstudiantesController

| Endpoint                                | Admin | Docente | Tutor  | Estudiante |
| --------------------------------------- | ----- | ------- | ------ | ---------- |
| POST /estudiantes                       | -     | -       | ✅\*   | -          |
| GET /estudiantes                        | -     | -       | ✅\*   | -          |
| GET /estudiantes/admin/all              | ✅    | ❌      | ❌     | ❌         |
| GET /estudiantes/count                  | -     | -       | ✅\*   | -          |
| GET /estudiantes/estadisticas           | -     | -       | ✅\*   | -          |
| GET /estudiantes/mi-proxima-clase       | ❌    | ❌      | ❌     | ✅         |
| GET /estudiantes/mis-companeros         | ❌    | ❌      | ❌     | ✅         |
| GET /estudiantes/mis-sectores           | ❌    | ❌      | ❌     | ✅         |
| GET /estudiantes/:id/detalle-completo   | -     | -       | ✅\*\* | -          |
| GET /estudiantes/:id                    | -     | -       | ✅\*\* | -          |
| PATCH /estudiantes/:id                  | -     | -       | ✅\*\* | -          |
| PATCH /estudiantes/:id/avatar           | -     | -       | ✅\*\* | -          |
| DELETE /estudiantes/:id                 | -     | -       | ✅\*\* | -          |
| POST /estudiantes/crear-con-tutor       | ✅    | ❌      | ❌     | ❌         |
| PATCH /estudiantes/:id/copiar-a-sector  | ✅    | ❌      | ❌     | ❌         |
| POST /estudiantes/copiar-por-email      | ✅    | ❌      | ❌     | ❌         |
| POST /estudiantes/:id/asignar-clases    | ✅    | ❌      | ❌     | ❌         |
| GET /estudiantes/:id/clases-disponibles | ✅    | ❌      | ❌     | ❌         |

\*Solo sus propios estudiantes (JWT)
\*\*Ownership Guard - Solo el tutor dueño

### 3.4 DocentesController

| Endpoint                                | Admin | Docente | Tutor | Estudiante |
| --------------------------------------- | ----- | ------- | ----- | ---------- |
| POST /docentes                          | ✅    | ❌      | ❌    | ❌         |
| GET /docentes                           | ✅    | ❌      | ❌    | ❌         |
| GET /docentes/me                        | ❌    | ✅      | ❌    | ❌         |
| GET /docentes/me/dashboard              | ❌    | ✅      | ❌    | ❌         |
| GET /docentes/me/estadisticas-completas | ❌    | ✅      | ❌    | ❌         |
| PATCH /docentes/me                      | ❌    | ✅      | ❌    | ❌         |
| GET /docentes/:id                       | ✅    | ❌      | ❌    | ❌         |
| PATCH /docentes/:id                     | ✅    | ❌      | ❌    | ❌         |
| POST /docentes/:id/reasignar-clases     | ✅    | ❌      | ❌    | ❌         |
| DELETE /docentes/:id                    | ✅    | ❌      | ❌    | ❌         |

### 3.5 TutorController

| Endpoint                     | Admin | Docente | Tutor | Estudiante |
| ---------------------------- | ----- | ------- | ----- | ---------- |
| GET /tutor/mis-inscripciones | ❌    | ❌      | ✅    | ❌         |
| GET /tutor/dashboard-resumen | ❌    | ❌      | ✅    | ❌         |
| GET /tutor/proximas-clases   | ❌    | ❌      | ✅    | ❌         |
| GET /tutor/alertas           | ❌    | ❌      | ✅    | ❌         |

### 3.6 ClasesController

| Endpoint                             | Admin | Docente | Tutor | Estudiante |
| ------------------------------------ | ----- | ------- | ----- | ---------- |
| POST /clases                         | ✅    | ❌      | ❌    | ❌         |
| GET /clases/admin/todas              | ✅    | ❌      | ❌    | ❌         |
| PATCH /clases/:id/cancelar           | ✅    | ✅\*    | ❌    | ❌         |
| DELETE /clases/:id                   | ✅    | ❌      | ❌    | ❌         |
| POST /clases/:id/asignar-estudiantes | ✅    | ❌      | ❌    | ❌         |
| GET /clases                          | ❌    | ❌      | ✅    | ❌         |
| GET /clases/mis-reservas             | ❌    | ❌      | ✅    | ❌         |
| GET /clases/calendario               | ❌    | ❌      | ✅    | ❌         |
| POST /clases/:id/reservar            | ❌    | ❌      | ✅    | ❌         |
| DELETE /clases/reservas/:id          | ❌    | ❌      | ✅    | ❌         |
| GET /clases/docente/mis-clases       | ❌    | ✅      | ❌    | ❌         |
| POST /clases/:id/asistencia          | ❌    | ✅      | ❌    | ❌         |
| GET /clases/:id/estudiantes          | ✅    | ❌      | ❌    | ❌         |
| GET /clases/:id                      | ✅    | ✅      | ✅    | ❌         |

\*Solo el docente titular de la clase

### 3.7 ClaseGrupoController

| Endpoint                               | Admin | Docente | Tutor | Estudiante |
| -------------------------------------- | ----- | ------- | ----- | ---------- |
| GET /clase-grupos/:id/detalle-completo | ✅    | ✅\*    | ❌    | ❌         |

\*Solo el docente titular del grupo

### 3.8 AsistenciaController

| Endpoint                                         | Admin | Docente | Tutor | Estudiante |
| ------------------------------------------------ | ----- | ------- | ----- | ---------- |
| POST /asistencia/clases/:claseId/estudiantes/:id | ❌    | ✅      | ❌    | ❌         |
| GET /asistencia/clases/:claseId                  | ✅    | ✅\*    | ❌    | ❌         |
| GET /asistencia/clases/:claseId/estadisticas     | ✅    | ✅      | ❌    | ❌         |
| GET /asistencia/estudiantes/:estudianteId        | ✅    | ✅      | ✅    | ❌         |
| GET /asistencia/docente/resumen                  | ❌    | ✅      | ❌    | ❌         |
| GET /asistencia/docente/observaciones            | ❌    | ✅      | ❌    | ❌         |
| GET /asistencia/docente/reportes                 | ❌    | ✅      | ❌    | ❌         |
| POST /asistencia                                 | ❌    | ❌      | ❌    | ✅         |
| POST /asistencia/clase-grupo/batch               | ❌    | ✅      | ❌    | ❌         |

\*Si es docente, debe ser el titular

### 3.9 PagosController

| Endpoint                               | Admin | Docente | Tutor | Estudiante |
| -------------------------------------- | ----- | ------- | ----- | ---------- |
| POST /pagos/suscripcion                | ❌    | ❌      | ✅    | ❌         |
| POST /pagos/curso                      | ❌    | ❌      | ✅    | ❌         |
| GET /pagos/membresia                   | ❌    | ❌      | ✅    | ❌         |
| GET /pagos/membresia/:id/estado        | ❌    | ❌      | ✅    | ❌         |
| POST /pagos/mock/activar-membresia/:id | ✅    | ❌      | ✅    | ❌         |
| GET /pagos/inscripciones               | ❌    | ❌      | ✅    | ❌         |
| POST /pagos/calcular-precio            | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| POST /pagos/configuracion/actualizar   | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| POST /pagos/inscripciones/crear        | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| GET /pagos/dashboard/metricas          | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| GET /pagos/configuracion               | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| GET /pagos/historial-cambios           | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| GET /pagos/inscripciones/pendientes    | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| GET /pagos/estudiantes-descuentos      | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| POST /pagos/webhook                    | 🌐    | -       | -     | -          |
| GET /pagos/morosidad/tutor/:tutorId    | ✅    | ❌      | ✅\*  | ❌         |
| GET /pagos/morosidad/estudiantes       | ✅    | ❌      | ❌    | ❌         |
| GET /pagos/morosidad/estudiante/:id    | ✅    | ❌      | ✅    | ❌         |
| POST /pagos/registrar-pago-manual/:id  | ✅    | ❌      | ✅    | ❌         |

⚠️ **SIN PROTECCIÓN DE ROLES** - Solo JWT
🌐 Público (webhook externo)
\*Solo su propia información

### 3.10 GamificacionController

| Endpoint                                       | Admin | Docente | Tutor | Estudiante |
| ---------------------------------------------- | ----- | ------- | ----- | ---------- |
| GET /gamificacion/dashboard/:estudianteId      | ✅    | ✅      | ✅    | ✅\*       |
| GET /gamificacion/logros/:estudianteId         | ✅    | ✅      | ✅    | ✅         |
| GET /gamificacion/puntos/:estudianteId         | ✅    | ✅      | ✅    | ✅         |
| GET /gamificacion/ranking/:estudianteId        | ✅    | ✅      | ✅    | ✅         |
| GET /gamificacion/progreso/:estudianteId       | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| GET /gamificacion/acciones                     | ✅    | ✅      | ❌    | ❌         |
| GET /gamificacion/historial/:estudianteId      | ⚠️    | ⚠️      | ⚠️    | ⚠️         |
| POST /gamificacion/puntos                      | ✅    | ✅      | ❌    | ❌         |
| POST /gamificacion/logros/:logroId/desbloquear | ⚠️    | ⚠️      | ⚠️    | ⚠️         |

\*Solo su propio dashboard

### 3.11 CursosController

| Endpoint                                     | Admin | Docente | Tutor | Estudiante |
| -------------------------------------------- | ----- | ------- | ----- | ---------- |
| POST /cursos/productos/:id/modulos           | ✅    | ❌      | ❌    | ❌         |
| GET /cursos/productos/:id/modulos            | 🌐    | 🌐      | 🌐    | 🌐         |
| GET /cursos/modulos/:id                      | 🌐    | 🌐      | 🌐    | 🌐         |
| PATCH /cursos/modulos/:id                    | ✅    | ❌      | ❌    | ❌         |
| DELETE /cursos/modulos/:id                   | ✅    | ❌      | ❌    | ❌         |
| POST /cursos/productos/:id/modulos/reordenar | ✅    | ❌      | ❌    | ❌         |
| POST /cursos/modulos/:id/lecciones           | ✅    | ❌      | ❌    | ❌         |
| GET /cursos/modulos/:id/lecciones            | 🌐    | 🌐      | 🌐    | 🌐         |
| GET /cursos/lecciones/:id                    | JWT   | JWT     | JWT   | JWT        |
| PATCH /cursos/lecciones/:id                  | ✅    | ❌      | ❌    | ❌         |
| DELETE /cursos/lecciones/:id                 | ✅    | ❌      | ❌    | ❌         |
| POST /cursos/modulos/:id/lecciones/reordenar | ✅    | ❌      | ❌    | ❌         |
| POST /cursos/lecciones/:id/completar         | JWT   | JWT     | JWT   | JWT        |
| GET /cursos/productos/:id/progreso           | JWT   | JWT     | JWT   | JWT        |
| GET /cursos/productos/:id/siguiente-leccion  | JWT   | JWT     | JWT   | JWT        |

🌐 Público (sin auth)
JWT = Solo requiere autenticación, sin verificación de rol

### 3.12 EventosController (Solo Docente)

| Endpoint                        | Admin | Docente | Tutor | Estudiante |
| ------------------------------- | ----- | ------- | ----- | ---------- |
| Todos los endpoints /eventos/\* | ❌    | ✅      | ❌    | ❌         |

### 3.13 TiendaController

| Endpoint                                   | Admin | Docente | Tutor | Estudiante |
| ------------------------------------------ | ----- | ------- | ----- | ---------- |
| GET /tienda/categorias                     | ✅    | ✅      | ✅    | ✅         |
| POST /tienda/categorias                    | ✅    | ❌      | ❌    | ❌         |
| PUT /tienda/categorias/:id                 | ✅    | ❌      | ❌    | ❌         |
| GET /tienda/items                          | ✅    | ✅      | ✅    | ✅         |
| GET /tienda/items/:id                      | ✅    | ✅      | ✅    | ✅         |
| POST /tienda/items                         | ✅    | ❌      | ❌    | ❌         |
| PUT /tienda/items/:id                      | ✅    | ❌      | ❌    | ❌         |
| GET /tienda/inventario/:estudianteId       | ✅    | ✅      | ✅    | ✅         |
| PUT /tienda/inventario/:id/equipar/:itemId | ❌    | ❌      | ❌    | ✅         |
| POST /tienda/comprar                       | ❌    | ❌      | ❌    | ✅         |
| GET /tienda/compras/:estudianteId          | ✅    | ✅      | ✅    | ✅         |

### 3.14 NotificacionesController (Solo Docente)

| Endpoint                               | Admin | Docente | Tutor | Estudiante |
| -------------------------------------- | ----- | ------- | ----- | ---------- |
| Todos los endpoints /notificaciones/\* | ❌    | ✅      | ❌    | ❌         |

### 3.15 CasasController

| Endpoint                      | Admin | Docente | Tutor | Estudiante |
| ----------------------------- | ----- | ------- | ----- | ---------- |
| Todos los endpoints /casas/\* | JWT   | JWT     | JWT   | JWT        |

(Solo requiere autenticación, no roles específicos)

### 3.16 MundosController

| Endpoint                       | Admin | Docente | Tutor | Estudiante |
| ------------------------------ | ----- | ------- | ----- | ---------- |
| Todos los endpoints /mundos/\* | JWT   | JWT     | JWT   | JWT        |

### 3.17 TiersController

| Endpoint                      | Admin | Docente | Tutor | Estudiante |
| ----------------------------- | ----- | ------- | ----- | ---------- |
| Todos los endpoints /tiers/\* | 🌐    | 🌐      | 🌐    | 🌐         |

(Públicos)

### 3.18 OnboardingController

| Endpoint                           | Admin | Docente | Tutor | Estudiante |
| ---------------------------------- | ----- | ------- | ----- | ---------- |
| Todos los endpoints /onboarding/\* | JWT   | JWT     | JWT   | JWT        |

(Solo requiere autenticación)

### 3.19 ColoniaController

| Endpoint                  | Admin | Docente | Tutor | Estudiante |
| ------------------------- | ----- | ------- | ----- | ---------- |
| POST /colonia/inscripcion | 🌐    | -       | -     | -          |
| POST /colonia/webhook     | 🌐\*  | -       | -     | -          |

🌐\* Público pero con validación HMAC

### 3.20 Inscripciones2026Controller

| Endpoint                                  | Admin   | Docente | Tutor   | Estudiante |
| ----------------------------------------- | ------- | ------- | ------- | ---------- |
| POST /inscripciones-2026                  | 🌐      | -       | -       | -          |
| GET /inscripciones-2026/:id               | JWT\*\* | -       | JWT\*\* | -          |
| GET /inscripciones-2026/tutor/:tutorId    | JWT     | JWT     | JWT     | JWT        |
| GET /inscripciones-2026/mis-inscripciones | JWT     | JWT     | JWT     | JWT        |
| PATCH /inscripciones-2026/:id/estado      | ✅      | ❌      | ❌      | ❌         |
| POST /inscripciones-2026/webhook          | 🌐\*    | -       | -       | -          |

\*_Ownership Guard - Solo el tutor dueño o admin
🌐_ Con Rate Limiting y validación HMAC

---

## 4. GAPS E INCONSISTENCIAS DETECTADOS

### 4.1 CRÍTICO - Endpoints sin protección de roles

| Controller                 | Endpoint                                  | Problema       | Riesgo                                               |
| -------------------------- | ----------------------------------------- | -------------- | ---------------------------------------------------- |
| **PagosController**        | POST /pagos/calcular-precio               | Sin RolesGuard | Cualquier usuario autenticado puede calcular precios |
| **PagosController**        | POST /pagos/configuracion/actualizar      | Sin RolesGuard | **CRÍTICO**: Cualquier usuario puede cambiar precios |
| **PagosController**        | POST /pagos/inscripciones/crear           | Sin RolesGuard | Cualquier usuario puede crear inscripciones          |
| **PagosController**        | GET /pagos/dashboard/metricas             | Sin RolesGuard | Exposición de métricas financieras                   |
| **PagosController**        | GET /pagos/configuracion                  | Sin RolesGuard | Exposición de configuración                          |
| **PagosController**        | GET /pagos/historial-cambios              | Sin RolesGuard | Exposición de historial de cambios                   |
| **PagosController**        | GET /pagos/inscripciones/pendientes       | Sin RolesGuard | Exposición de inscripciones                          |
| **PagosController**        | GET /pagos/estudiantes-descuentos         | Sin RolesGuard | Exposición de descuentos                             |
| **GamificacionController** | GET /gamificacion/progreso/:id            | Sin RolesGuard | Exposición de progreso                               |
| **GamificacionController** | GET /gamificacion/historial/:id           | Sin RolesGuard | Exposición de historial                              |
| **GamificacionController** | POST /gamificacion/logros/:id/desbloquear | Sin RolesGuard | Cualquier usuario puede desbloquear logros           |

### 4.2 ALTO - Falta de Ownership Guards

| Controller                 | Endpoint                                  | Problema                             |
| -------------------------- | ----------------------------------------- | ------------------------------------ |
| **GamificacionController** | GET /gamificacion/logros/:estudianteId    | No valida ownership del estudiante   |
| **GamificacionController** | GET /gamificacion/puntos/:estudianteId    | No valida ownership del estudiante   |
| **GamificacionController** | GET /gamificacion/ranking/:estudianteId   | No valida ownership del estudiante   |
| **TiendaController**       | GET /tienda/inventario/:estudianteId      | No valida ownership del estudiante   |
| **TiendaController**       | GET /tienda/compras/:estudianteId         | No valida ownership del estudiante   |
| **AsistenciaController**   | GET /asistencia/estudiantes/:estudianteId | Tutor puede ver cualquier estudiante |

### 4.3 MEDIO - Entidades sin Controlador (No expuestas)

| Entidad                     | Estado                   | Notas                                     |
| --------------------------- | ------------------------ | ----------------------------------------- |
| **ConfiguracionPrecio**     | Sin CRUD público         | Solo acceso interno vía PagosService      |
| **HistorialPrecio**         | Sin CRUD público         | Solo lectura vía endpoint sin protección  |
| **ProgresoLeccion**         | Sin endpoints directos   | Gestionado internamente por CursosService |
| **EstudianteLogro**         | Sin endpoints directos   | Gestionado por GamificacionService        |
| **DocenteRutaEspecialidad** | Sin endpoints directos   | CRUD vía AdminController                  |
| **Colonia2026Inscription**  | Sin endpoints de lectura | Solo creación y webhook                   |
| **InscripcionGrupo**        | Sin endpoints directos   | Relación intermedia                       |

### 4.4 BAJO - Inconsistencias de Diseño

| Área                 | Problema                                 | Recomendación                              |
| -------------------- | ---------------------------------------- | ------------------------------------------ |
| CursosController     | Algunos endpoints públicos sin @Public() | Usar @Public() explícito                   |
| CasasController      | Solo JWT sin roles                       | Considerar si debe ser público o con roles |
| MundosController     | Solo JWT sin roles                       | Considerar si debe ser público o con roles |
| OnboardingController | Solo JWT sin roles                       | Agregar validación de ownership            |

---

## 5. RECOMENDACIONES

### 5.1 Prioridad CRÍTICA (Implementar YA)

1. **PagosController - Agregar RolesGuard:**

   ```typescript
   @Post('configuracion/actualizar')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(Role.ADMIN) // AGREGAR
   async actualizarConfiguracion(...)
   ```

2. **Proteger todos los endpoints de Pagos sensibles:**
   - `calcular-precio` → ADMIN o TUTOR
   - `configuracion/*` → ADMIN
   - `inscripciones/crear` → ADMIN
   - `dashboard/metricas` → ADMIN
   - `estudiantes-descuentos` → ADMIN

### 5.2 Prioridad ALTA

1. **GamificacionController - Agregar Ownership Guard:**

   ```typescript
   @Get('progreso/:estudianteId')
   @UseGuards(EstudianteOwnershipGuard) // AGREGAR
   async getProgreso(...)
   ```

2. **TiendaController - Validar ownership en inventario/compras**

### 5.3 Prioridad MEDIA

1. Revisar endpoints de CursosController públicos
2. Documentar explícitamente qué endpoints deben ser públicos
3. Agregar @Public() decorador donde corresponda

### 5.4 Prioridad BAJA

1. Considerar agregar endpoint de lectura para Colonia2026
2. Agregar métricas/dashboard para Tutores de sus propios datos

---

## 6. RESUMEN EJECUTIVO

| Categoría                | Cantidad |
| ------------------------ | -------- |
| Entidades en Schema      | 35+      |
| Controladores analizados | 20       |
| Endpoints totales        | ~150     |
| Gaps CRÍTICOS            | 11       |
| Gaps ALTOS               | 6        |
| Gaps MEDIOS              | 7        |
| Gaps BAJOS               | 4        |

### Estado General: ⚠️ REQUIERE ATENCIÓN

El sistema tiene buena cobertura de entidades con controladores, pero existen **vulnerabilidades críticas** en el módulo de Pagos donde endpoints sensibles no tienen protección de roles adecuada.

**Acción Inmediata Requerida:** Proteger endpoints de PagosController con RolesGuard.

---

_Documento generado automáticamente - Auditoría de Seguridad Mateatletas 2025_
