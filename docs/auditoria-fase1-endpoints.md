# AUDITORÍA FASE 1: Extracción Completa de Endpoints y Capacidades

> **Generado:** 2026-01-27
> **Portales auditados:** Admin, Docente, Tutor (NO estudiante)

---

## 1. ENTIDADES PRISMA RELEVANTES

### 1.1 Modelos de Usuarios

| Modelo         | Campos Principales                                                                                                       | Relaciones                                             | Quién Crea       | Quién Lee                         | Quién Modifica     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------- | --------------------------------- | ------------------ |
| **Admin**      | id, nombre, email, passwordHash, mfaEnabled, mfaSecret, mfaBackupCodes, activo, superAdmin                               | N/A                                                    | SUPER_ADMIN      | ADMIN                             | ADMIN, SUPER_ADMIN |
| **Docente**    | id, nombre, apellido, email, passwordHash, telefono, especialidades, bio, activo, fechaContratacion, mustChangePassword  | comisiones, ClaseGrupo, createdByAdmin                 | ADMIN            | ADMIN, DOCENTE                    | ADMIN              |
| **Tutor**      | id, email, passwordHash, nombre, apellido, telefono, direccion, activo                                                   | estudiantes, suscripciones, SuscripcionFamiliar        | Registro público | TUTOR, ADMIN                      | TUTOR, ADMIN       |
| **Estudiante** | id, nombre, apellido, fechaNacimiento, grado, tutorId, casaId, avatarUrl, avatarGradient, username, passwordHash, activo | tutor, casa, inscripciones, recursos, logros, progreso | TUTOR, ADMIN     | TUTOR, DOCENTE, ADMIN, ESTUDIANTE | TUTOR, ADMIN       |

### 1.2 Modelos de Clases y Comisiones

| Modelo         | Campos Principales                                                                                       | Relaciones                                      | Quién Crea | Quién Lee             | Quién Modifica |
| -------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------- | --------------------- | -------------- |
| **ClaseGrupo** | id, nombre, diaSemana, horaInicio, horaFin, docenteId, sectorId, cupoMaximo, activo, productoId, urlMeet | docente, sector, inscripciones, planificaciones | ADMIN      | ADMIN, DOCENTE, TUTOR | ADMIN          |
| **Comision**   | id, nombre, descripcion, fechaInicio, fechaFin, docenteId, activo, tipo, fechasClase                     | docente, estudiantes                            | ADMIN      | ADMIN, DOCENTE        | ADMIN          |
| **Sector**     | id, nombre, descripcion, color, icono, activo                                                            | claseGrupos, productos                          | ADMIN      | TODOS                 | ADMIN          |
| **Producto**   | id, nombre, descripcion, precioBase, activo, sectorId, tipoProducto                                      | sector, inscripciones                           | ADMIN      | TODOS                 | ADMIN          |

### 1.3 Modelos de Inscripciones

| Modelo                           | Campos Principales                                                                                | Relaciones                                            | Quién Crea              | Quién Lee             | Quién Modifica |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- | --------------------- | -------------- |
| **InscripcionClaseGrupo**        | id, estudianteId, claseGrupoId, fechaInscripcion, estado, planSuscripcion, fuentePago             | estudiante, claseGrupo                                | ADMIN (manual)          | ADMIN, DOCENTE, TUTOR | ADMIN          |
| **InscripcionActividad**         | id, estudianteId, claseGrupoId, comisionId, suscripcionFamiliarId, tier, estado, fechaInscripcion | estudiante, claseGrupo, comision, suscripcionFamiliar | TUTOR (via suscripción) | ADMIN, DOCENTE, TUTOR | ADMIN, TUTOR   |
| **InscripcionUnificada** (VISTA) | Combina las dos fuentes anteriores                                                                | N/A                                                   | N/A                     | DOCENTE, ADMIN        | N/A (es vista) |

### 1.4 Modelos de Suscripciones y Pagos

| Modelo                   | Campos Principales                                                                                           | Relaciones                  | Quién Crea                    | Quién Lee    | Quién Modifica |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------- | ----------------------------- | ------------ | -------------- |
| **SuscripcionFamiliar**  | id, tutorId, tier, estado, montoMensual, mercadoPagoId, fechaProximoCobro, canceladaEl, cancelacionPendiente | tutor, inscripciones, pagos | TUTOR                         | TUTOR, ADMIN | TUTOR, ADMIN   |
| **Suscripcion** (legacy) | id, tutorId, planId, estado, fechaInicio, fechaProximoCobro                                                  | tutor, plan, pagos          | TUTOR                         | TUTOR, ADMIN | TUTOR, ADMIN   |
| **PagoMensual**          | id, suscripcionFamiliarId, monto, estado, fechaPago, metodoPago, mercadoPagoId                               | suscripcionFamiliar         | Sistema (MercadoPago webhook) | TUTOR, ADMIN | ADMIN          |
| **PlanSuscripcion**      | id, nombre, descripcion, precio, activo, caracteristicas                                                     | suscripciones               | ADMIN                         | TODOS        | ADMIN          |

### 1.5 Modelos de Gamificación

| Modelo                 | Campos Principales                                                               | Relaciones                   | Quién Crea       | Quién Lee                  | Quién Modifica |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------- | ---------------- | -------------------------- | -------------- |
| **Casa**               | id, nombre, colorPrimario, colorSecundario, icono, descripcion, puntosTotales    | estudiantes, historialPuntos | ADMIN            | TODOS                      | ADMIN          |
| **RecursosEstudiante** | id, estudianteId, xpTotal, nivelActual, vidas, monedas, rachaActual, rachaMaxima | estudiante                   | Sistema          | ESTUDIANTE, TUTOR, DOCENTE | Sistema        |
| **Logro**              | id, nombre, descripcion, icono, xpRecompensa, condiciones                        | logrosEstudiante             | ADMIN            | TODOS                      | ADMIN          |
| **LogroEstudiante**    | id, estudianteId, logroId, fechaDesbloqueo                                       | estudiante, logro            | Sistema          | ESTUDIANTE, TUTOR, DOCENTE | Sistema        |
| **HistorialPuntos**    | id, estudianteId, casaId, puntos, tipoAccion, contexto, docenteId                | estudiante, casa, docente    | DOCENTE, Sistema | ESTUDIANTE, TUTOR, DOCENTE | N/A            |

### 1.6 Modelos de Asistencia

| Modelo         | Campos Principales                                                              | Relaciones                              | Quién Crea | Quién Lee             | Quién Modifica |
| -------------- | ------------------------------------------------------------------------------- | --------------------------------------- | ---------- | --------------------- | -------------- |
| **Asistencia** | id, estudianteId, claseId, claseGrupoId, comisionId, fecha, estado, observacion | estudiante, clase, claseGrupo, comision | DOCENTE    | DOCENTE, TUTOR, ADMIN | DOCENTE        |

### 1.7 Modelos de Notificaciones y Comunicación

| Modelo           | Campos Principales                                                                                 | Relaciones                         | Quién Crea              | Quién Lee         | Quién Modifica              |
| ---------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------- | ----------------- | --------------------------- |
| **Notificacion** | id, tipo, titulo, mensaje, leida, fechaCreacion, destinatarioTipo, destinatarioId                  | N/A                                | Sistema, ADMIN, DOCENTE | Destinatario      | Destinatario (marcar leída) |
| **Anuncio**      | id, titulo, contenido, docenteId, claseGrupoId, comisionId, activo, fechaCreacion, fechaExpiracion | docente, claseGrupo, comision      | DOCENTE                 | ESTUDIANTE, TUTOR | DOCENTE                     |
| **Observacion**  | id, docenteId, tipo, prioridad, contenido, estado, requiereSeguimiento                             | docente, estudiantes, seguimientos | DOCENTE                 | DOCENTE, ADMIN    | DOCENTE, ADMIN              |

### 1.8 Modelos de Contenido y Planificación

| Modelo                      | Campos Principales                                                            | Relaciones                         | Quién Crea | Quién Lee                  | Quién Modifica |
| --------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- | ---------- | -------------------------- | -------------- |
| **Planificacion**           | id, nombre, descripcion, sectorId, activo, creadorId                          | sector, clases, asignaciones       | ADMIN      | ADMIN, DOCENTE             | ADMIN          |
| **ClasePlanificacion**      | id, planificacionId, orden, titulo, descripcion, teoriaUrl, practicaUrl       | planificacion, nodos               | ADMIN      | ADMIN, DOCENTE, ESTUDIANTE | ADMIN          |
| **AsignacionPlanificacion** | id, planificacionId, claseGrupoId, docenteId, clasesActivas                   | planificacion, claseGrupo, docente | DOCENTE    | DOCENTE, ESTUDIANTE        | DOCENTE        |
| **ProgresoClase**           | id, estudianteId, asignacionId, claseId, teoriaCompletada, practicaCompletada | estudiante, asignacion, clase      | Sistema    | ESTUDIANTE, DOCENTE        | Sistema        |

### 1.9 Modelos de Verano (FASE 8)

| Modelo             | Campos Principales                                                          | Relaciones                      | Quién Crea | Quién Lee    | Quién Modifica     |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- | ---------- | ------------ | ------------------ |
| **DecisionVerano** | id, estudianteId, suscripcionFamiliarId, opcion, fechaDecision              | estudiante, suscripcionFamiliar | TUTOR      | TUTOR, ADMIN | TUTOR (en período) |
| **ColoniaVerano**  | id, nombre, fechaInicio, fechaFin, cupoMaximo, precioMatricula, precioCuota | inscripciones                   | ADMIN      | TODOS        | ADMIN              |

### 1.10 Modelos de Auditoría y Seguridad

| Modelo            | Campos Principales                                                                               | Relaciones | Quién Crea      | Quién Lee      | Quién Modifica   |
| ----------------- | ------------------------------------------------------------------------------------------------ | ---------- | --------------- | -------------- | ---------------- |
| **AuditLog**      | id, userId, userEmail, userType, action, resourceType, resourceId, changes, ipAddress, userAgent | N/A        | Sistema         | ADMIN          | N/A              |
| **Session**       | id, jti, userId, userType, expiresAt, ipAddress, userAgent, revokedAt                            | N/A        | Sistema (login) | Usuario, ADMIN | Usuario (logout) |
| **AlertaSistema** | id, tipo, titulo, descripcion, severidad, resuelta, fechaCreacion                                | N/A        | Sistema, ADMIN  | ADMIN          | ADMIN            |

---

## 2. ENDPOINTS ADMIN

### 2.1 AdminController (`/admin`)

| Método | Ruta                                 | Entidad         | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------------------ | --------------- | ----- | ------------ | ----------------- |
| GET    | `/admin/dashboard`                   | Dashboard stats | ADMIN | No           | No                |
| GET    | `/admin/estudiantes`                 | Estudiante      | ADMIN | No           | No                |
| GET    | `/admin/docentes`                    | Docente         | ADMIN | No           | No                |
| POST   | `/admin/docentes`                    | Docente         | ADMIN | No           | No                |
| PATCH  | `/admin/docentes/:id`                | Docente         | ADMIN | No           | No                |
| DELETE | `/admin/docentes/:id`                | Docente         | ADMIN | No           | No                |
| POST   | `/admin/docentes/:id/reset-password` | Docente         | ADMIN | No           | Sí (email)        |
| GET    | `/admin/tutores`                     | Tutor           | ADMIN | No           | No                |
| GET    | `/admin/clases`                      | ClaseGrupo      | ADMIN | No           | No                |
| GET    | `/admin/sectores`                    | Sector          | ADMIN | No           | No                |
| GET    | `/admin/casas`                       | Casa            | ADMIN | No           | No                |
| GET    | `/admin/comisiones`                  | Comision        | ADMIN | No           | No                |

### 2.2 PlanificacionesAdminController (`/admin/planificaciones`)

| Método | Ruta                                             | Entidad            | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------------------------------ | ------------------ | ----- | ------------ | ----------------- |
| GET    | `/admin/planificaciones`                         | Planificacion      | ADMIN | No           | No                |
| POST   | `/admin/planificaciones`                         | Planificacion      | ADMIN | No           | No                |
| GET    | `/admin/planificaciones/:id`                     | Planificacion      | ADMIN | No           | No                |
| PATCH  | `/admin/planificaciones/:id`                     | Planificacion      | ADMIN | No           | No                |
| DELETE | `/admin/planificaciones/:id`                     | Planificacion      | ADMIN | No           | No                |
| POST   | `/admin/planificaciones/:id/clases`              | ClasePlanificacion | ADMIN | No           | No                |
| PATCH  | `/admin/planificaciones/:planId/clases/:claseId` | ClasePlanificacion | ADMIN | No           | No                |
| DELETE | `/admin/planificaciones/:planId/clases/:claseId` | ClasePlanificacion | ADMIN | No           | No                |
| POST   | `/admin/planificaciones/:id/duplicar`            | Planificacion      | ADMIN | No           | No                |

### 2.3 AdminDlqController (`/admin/dlq`)

| Método | Ruta                            | Entidad      | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------------- | ------------ | ----- | ------------ | ----------------- |
| GET    | `/admin/dlq/messages`           | DLQ Messages | ADMIN | No           | No                |
| POST   | `/admin/dlq/messages/:id/retry` | DLQ Message  | ADMIN | Sí (requeue) | No                |
| DELETE | `/admin/dlq/messages/:id`       | DLQ Message  | ADMIN | No           | No                |
| POST   | `/admin/dlq/retry-all`          | DLQ Messages | ADMIN | Sí (requeue) | No                |
| DELETE | `/admin/dlq/purge`              | DLQ Messages | ADMIN | No           | No                |

### 2.4 AdminVeranoController (`/admin/verano`)

| Método | Ruta                         | Entidad        | Guard | Emite Evento | Crea Notificación |
| ------ | ---------------------------- | -------------- | ----- | ------------ | ----------------- |
| GET    | `/admin/verano/estadisticas` | DecisionVerano | ADMIN | No           | No                |
| GET    | `/admin/verano/decisiones`   | DecisionVerano | ADMIN | No           | No                |
| POST   | `/admin/verano/colonias`     | ColoniaVerano  | ADMIN | No           | No                |
| GET    | `/admin/verano/colonias`     | ColoniaVerano  | ADMIN | No           | No                |
| PATCH  | `/admin/verano/colonias/:id` | ColoniaVerano  | ADMIN | No           | No                |

### 2.5 AdminAuditLogsController (`/admin/audit-logs`)

| Método | Ruta                             | Entidad  | Guard | Emite Evento | Crea Notificación |
| ------ | -------------------------------- | -------- | ----- | ------------ | ----------------- |
| GET    | `/admin/audit-logs`              | AuditLog | ADMIN | No           | No                |
| GET    | `/admin/audit-logs/:id`          | AuditLog | ADMIN | No           | No                |
| GET    | `/admin/audit-logs/user/:userId` | AuditLog | ADMIN | No           | No                |

### 2.6 AlertaSistemaController (`/admin/alertas`)

| Método | Ruta                          | Entidad       | Guard | Emite Evento | Crea Notificación |
| ------ | ----------------------------- | ------------- | ----- | ------------ | ----------------- |
| GET    | `/admin/alertas`              | AlertaSistema | ADMIN | No           | No                |
| PATCH  | `/admin/alertas/:id/resolver` | AlertaSistema | ADMIN | No           | No                |
| DELETE | `/admin/alertas/:id`          | AlertaSistema | ADMIN | No           | No                |

### 2.7 Endpoints Admin en SuscripcionesController (`/suscripciones/admin`)

| Método | Ruta                            | Entidad     | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------------- | ----------- | ----- | ------------ | ----------------- |
| GET    | `/suscripciones/admin`          | Suscripcion | ADMIN | No           | No                |
| GET    | `/suscripciones/admin/morosas`  | Suscripcion | ADMIN | No           | No                |
| GET    | `/suscripciones/admin/metricas` | Suscripcion | ADMIN | No           | No                |

### 2.8 Endpoints Admin en SuscripcionFamiliarController (`/suscripciones/familiar/admin`)

| Método | Ruta                                                   | Entidad              | Guard | Emite Evento     | Crea Notificación |
| ------ | ------------------------------------------------------ | -------------------- | ----- | ---------------- | ----------------- |
| GET    | `/suscripciones/familiar/admin`                        | SuscripcionFamiliar  | ADMIN | No               | No                |
| GET    | `/suscripciones/familiar/admin/:id`                    | SuscripcionFamiliar  | ADMIN | No               | No                |
| POST   | `/suscripciones/familiar/admin/:id/pausar`             | SuscripcionFamiliar  | ADMIN | Sí (MercadoPago) | Sí                |
| POST   | `/suscripciones/familiar/admin/:id/reactivar`          | SuscripcionFamiliar  | ADMIN | Sí (MercadoPago) | Sí                |
| POST   | `/suscripciones/familiar/admin/:id/cancelar`           | SuscripcionFamiliar  | ADMIN | Sí (MercadoPago) | Sí                |
| PATCH  | `/suscripciones/familiar/admin/inscripciones/:id/tier` | InscripcionActividad | ADMIN | No               | No                |

### 2.9 Endpoints Admin en EstudiantesController (`/estudiantes/admin`)

| Método | Ruta                                  | Entidad               | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------------------- | --------------------- | ----- | ------------ | ----------------- |
| GET    | `/estudiantes/admin/all`              | Estudiante            | ADMIN | No           | No                |
| POST   | `/estudiantes/crear-con-tutor`        | Estudiante, Tutor     | ADMIN | No           | No                |
| PATCH  | `/estudiantes/:id/copiar-a-sector`    | Estudiante            | ADMIN | No           | No                |
| POST   | `/estudiantes/copiar-por-email`       | Estudiante            | ADMIN | No           | No                |
| POST   | `/estudiantes/:id/asignar-clases`     | InscripcionClaseGrupo | ADMIN | No           | No                |
| GET    | `/estudiantes/:id/clases-disponibles` | ClaseGrupo            | ADMIN | No           | No                |

### 2.10 Endpoints Admin en ClasesController (`/clases`)

| Método | Ruta                              | Entidad     | Guard | Emite Evento | Crea Notificación |
| ------ | --------------------------------- | ----------- | ----- | ------------ | ----------------- |
| POST   | `/clases`                         | Clase       | ADMIN | No           | No                |
| GET    | `/clases/admin/todas`             | Clase       | ADMIN | No           | No                |
| DELETE | `/clases/:id`                     | Clase       | ADMIN | No           | No                |
| POST   | `/clases/:id/asignar-estudiantes` | Inscripcion | ADMIN | No           | No                |

### 2.11 Endpoints Admin en GamificacionController (`/gamificacion`)

| Método | Ruta                                        | Entidad         | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------------------------- | --------------- | ----- | ------------ | ----------------- |
| POST   | `/gamificacion/logros/:logroId/desbloquear` | LogroEstudiante | ADMIN | No           | Sí (interno)      |

---

## 3. ENDPOINTS DOCENTE

### 3.1 DocentesController (`/docentes`)

| Método | Ruta                                                          | Entidad                 | Guard   | Emite Evento | Crea Notificación |
| ------ | ------------------------------------------------------------- | ----------------------- | ------- | ------------ | ----------------- |
| GET    | `/docentes/me`                                                | Docente                 | DOCENTE | No           | No                |
| PATCH  | `/docentes/me`                                                | Docente                 | DOCENTE | No           | No                |
| GET    | `/docentes/me/clases`                                         | ClaseGrupo              | DOCENTE | No           | No                |
| GET    | `/docentes/me/comisiones`                                     | Comision                | DOCENTE | No           | No                |
| GET    | `/docentes/me/estudiantes`                                    | Estudiante              | DOCENTE | No           | No                |
| GET    | `/docentes/me/calendario`                                     | Clase, ClaseGrupo       | DOCENTE | No           | No                |
| GET    | `/docentes/me/dashboard`                                      | Dashboard stats         | DOCENTE | No           | No                |
| GET    | `/docentes/me/planificaciones`                                | AsignacionPlanificacion | DOCENTE | No           | No                |
| POST   | `/docentes/me/planificaciones/:asignacionId/activar-clase`    | AsignacionPlanificacion | DOCENTE | No           | No                |
| DELETE | `/docentes/me/planificaciones/:asignacionId/desactivar-clase` | AsignacionPlanificacion | DOCENTE | No           | No                |

### 3.2 NotificacionesController (`/notificaciones`) - Solo DOCENTE

| Método | Ruta                         | Entidad      | Guard   | Emite Evento | Crea Notificación |
| ------ | ---------------------------- | ------------ | ------- | ------------ | ----------------- |
| GET    | `/notificaciones`            | Notificacion | DOCENTE | No           | No                |
| GET    | `/notificaciones/count`      | Notificacion | DOCENTE | No           | No                |
| PATCH  | `/notificaciones/:id/leer`   | Notificacion | DOCENTE | No           | No                |
| PATCH  | `/notificaciones/leer-todas` | Notificacion | DOCENTE | No           | No                |

### 3.3 AnunciosDocenteController (`/docentes/me/anuncios`)

| Método | Ruta                        | Entidad | Guard   | Emite Evento | Crea Notificación          |
| ------ | --------------------------- | ------- | ------- | ------------ | -------------------------- |
| POST   | `/docentes/me/anuncios`     | Anuncio | DOCENTE | No           | Sí (a estudiantes/tutores) |
| GET    | `/docentes/me/anuncios`     | Anuncio | DOCENTE | No           | No                         |
| GET    | `/docentes/me/anuncios/:id` | Anuncio | DOCENTE | No           | No                         |
| PATCH  | `/docentes/me/anuncios/:id` | Anuncio | DOCENTE | No           | No                         |
| DELETE | `/docentes/me/anuncios/:id` | Anuncio | DOCENTE | No           | No                         |

### 3.4 AsistenciaController (`/asistencia`) - Endpoints DOCENTE

| Método | Ruta                                                    | Entidad    | Guard          | Emite Evento | Crea Notificación |
| ------ | ------------------------------------------------------- | ---------- | -------------- | ------------ | ----------------- |
| POST   | `/asistencia/clases/:claseId/estudiantes/:estudianteId` | Asistencia | DOCENTE        | No           | No                |
| GET    | `/asistencia/clases/:claseId`                           | Asistencia | DOCENTE, ADMIN | No           | No                |
| GET    | `/asistencia/clases/:claseId/estadisticas`              | Asistencia | DOCENTE, ADMIN | No           | No                |
| GET    | `/asistencia/docente/resumen`                           | Asistencia | DOCENTE        | No           | No                |
| GET    | `/asistencia/docente/observaciones`                     | Asistencia | DOCENTE        | No           | No                |
| GET    | `/asistencia/docente/reportes`                          | Asistencia | DOCENTE        | No           | No                |
| POST   | `/asistencia/clase-grupo/batch`                         | Asistencia | DOCENTE        | No           | No                |
| POST   | `/asistencia/comision/batch`                            | Asistencia | DOCENTE        | No           | No                |

### 3.5 ObservacionesController (`/observaciones`)

| Método | Ruta                                      | Entidad     | Guard          | Emite Evento | Crea Notificación            |
| ------ | ----------------------------------------- | ----------- | -------------- | ------------ | ---------------------------- |
| POST   | `/observaciones`                          | Observacion | DOCENTE        | No           | Sí (si requiere seguimiento) |
| GET    | `/observaciones`                          | Observacion | DOCENTE, ADMIN | No           | No                           |
| GET    | `/observaciones/pendientes`               | Observacion | DOCENTE, ADMIN | No           | No                           |
| GET    | `/observaciones/estudiante/:estudianteId` | Observacion | DOCENTE, ADMIN | No           | No                           |
| GET    | `/observaciones/:id`                      | Observacion | DOCENTE, ADMIN | No           | No                           |
| POST   | `/observaciones/:id/seguimientos`         | Seguimiento | DOCENTE, ADMIN | No           | No                           |
| PATCH  | `/observaciones/:id/estado`               | Observacion | DOCENTE, ADMIN | No           | No                           |

### 3.6 ClasesController (`/clases`) - Endpoints DOCENTE

| Método | Ruta                         | Entidad     | Guard          | Emite Evento | Crea Notificación |
| ------ | ---------------------------- | ----------- | -------------- | ------------ | ----------------- |
| GET    | `/clases/docente/mis-clases` | Clase       | DOCENTE        | No           | No                |
| POST   | `/clases/:id/asistencia`     | Asistencia  | DOCENTE        | No           | No                |
| PATCH  | `/clases/:id/cancelar`       | Clase       | DOCENTE, ADMIN | No           | Sí (a inscriptos) |
| GET    | `/clases/:id/estudiantes`    | Inscripcion | DOCENTE, ADMIN | No           | No                |

### 3.7 GamificacionController (`/gamificacion`) - Endpoints DOCENTE

| Método | Ruta                             | Entidad         | Guard                | Emite Evento          | Crea Notificación |
| ------ | -------------------------------- | --------------- | -------------------- | --------------------- | ----------------- |
| GET    | `/gamificacion/acciones`         | TiposAccion     | DOCENTE, ADMIN       | No                    | No                |
| POST   | `/gamificacion/puntos`           | HistorialPuntos | DOCENTE, ADMIN       | Sí (WebSocket a sala) | Sí (interno)      |
| POST   | `/gamificacion/asignar-insignia` | HistorialPuntos | DOCENTE (ExactRoles) | Sí (WebSocket a sala) | Sí (interno)      |

---

## 4. ENDPOINTS TUTOR

### 4.1 TutorController (`/tutor`)

| Método | Ruta                      | Entidad         | Guard | Emite Evento | Crea Notificación |
| ------ | ------------------------- | --------------- | ----- | ------------ | ----------------- |
| GET    | `/tutor/me`               | Tutor           | TUTOR | No           | No                |
| PATCH  | `/tutor/me`               | Tutor           | TUTOR | No           | No                |
| GET    | `/tutor/me/hijos`         | Estudiante      | TUTOR | No           | No                |
| GET    | `/tutor/me/suscripciones` | Suscripcion     | TUTOR | No           | No                |
| GET    | `/tutor/me/pagos`         | PagoMensual     | TUTOR | No           | No                |
| GET    | `/tutor/me/calendario`    | Clase           | TUTOR | No           | No                |
| GET    | `/tutor/me/dashboard`     | Dashboard stats | TUTOR | No           | No                |

### 4.2 TutorNotificacionesController (`/tutor/notificaciones`)

| Método | Ruta                               | Entidad      | Guard | Emite Evento | Crea Notificación |
| ------ | ---------------------------------- | ------------ | ----- | ------------ | ----------------- |
| GET    | `/tutor/notificaciones`            | Notificacion | TUTOR | No           | No                |
| GET    | `/tutor/notificaciones/count`      | Notificacion | TUTOR | No           | No                |
| PATCH  | `/tutor/notificaciones/:id/leer`   | Notificacion | TUTOR | No           | No                |
| PATCH  | `/tutor/notificaciones/leer-todas` | Notificacion | TUTOR | No           | No                |

### 4.3 TutorSuscripcionFamiliarController (dentro de `/suscripciones/familiar`)

| Método | Ruta                                                       | Entidad              | Guard              | Emite Evento     | Crea Notificación |
| ------ | ---------------------------------------------------------- | -------------------- | ------------------ | ---------------- | ----------------- |
| POST   | `/suscripciones/familiar`                                  | SuscripcionFamiliar  | TUTOR (ExactRoles) | Sí (MercadoPago) | Sí                |
| GET    | `/suscripciones/familiar`                                  | SuscripcionFamiliar  | TUTOR (ExactRoles) | No               | No                |
| GET    | `/suscripciones/familiar/horarios-disponibles/:productoId` | ClaseGrupo           | TUTOR (ExactRoles) | No               | No                |
| POST   | `/suscripciones/familiar/inscripciones`                    | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| DELETE | `/suscripciones/familiar/inscripciones`                    | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| PATCH  | `/suscripciones/familiar/inscripciones/horario`            | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| PATCH  | `/suscripciones/familiar/inscripciones/producto`           | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| PATCH  | `/suscripciones/familiar/inscripciones/:id/tier`           | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| PATCH  | `/suscripciones/familiar/inscripciones/:id/pausar`         | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| PATCH  | `/suscripciones/familiar/inscripciones/:id/reactivar`      | InscripcionActividad | TUTOR (ExactRoles) | No               | No                |
| PATCH  | `/suscripciones/familiar/tier`                             | SuscripcionFamiliar  | TUTOR (ExactRoles) | No               | No                |
| POST   | `/suscripciones/familiar/cancelar`                         | SuscripcionFamiliar  | TUTOR (ExactRoles) | Sí (MercadoPago) | Sí                |
| POST   | `/suscripciones/familiar/revertir-cancelacion`             | SuscripcionFamiliar  | TUTOR (ExactRoles) | No               | Sí                |
| POST   | `/suscripciones/familiar/pausar`                           | SuscripcionFamiliar  | TUTOR (ExactRoles) | Sí (MercadoPago) | Sí                |
| POST   | `/suscripciones/familiar/reactivar`                        | SuscripcionFamiliar  | TUTOR (ExactRoles) | Sí (MercadoPago) | Sí                |
| GET    | `/suscripciones/familiar/simular`                          | Simulación           | TUTOR (ExactRoles) | No               | No                |

### 4.4 TutorVeranoController (`/tutor/verano`)

| Método | Ruta                              | Entidad        | Guard | Emite Evento | Crea Notificación |
| ------ | --------------------------------- | -------------- | ----- | ------------ | ----------------- |
| GET    | `/tutor/verano/estado`            | DecisionVerano | TUTOR | No           | No                |
| POST   | `/tutor/verano/decidir`           | DecisionVerano | TUTOR | No           | Sí                |
| POST   | `/tutor/verano/solicitar-colonia` | DecisionVerano | TUTOR | No           | Sí                |
| POST   | `/tutor/verano/cancelar-colonia`  | DecisionVerano | TUTOR | No           | Sí                |

### 4.5 SuscripcionesController (`/suscripciones`) - Endpoints TUTOR

| Método | Ruta                               | Entidad     | Guard | Emite Evento     | Crea Notificación |
| ------ | ---------------------------------- | ----------- | ----- | ---------------- | ----------------- |
| POST   | `/suscripciones`                   | Suscripcion | TUTOR | Sí (MercadoPago) | Sí                |
| GET    | `/suscripciones/mis-suscripciones` | Suscripcion | TUTOR | No               | No                |
| GET    | `/suscripciones/:id`               | Suscripcion | TUTOR | No               | No                |
| POST   | `/suscripciones/:id/cancelar`      | Suscripcion | TUTOR | Sí (MercadoPago) | Sí                |
| GET    | `/suscripciones/:id/pagos`         | PagoMensual | TUTOR | No               | No                |

### 4.6 AnunciosTutorController (`/tutor/anuncios`)

| Método | Ruta              | Entidad | Guard | Emite Evento | Crea Notificación |
| ------ | ----------------- | ------- | ----- | ------------ | ----------------- |
| GET    | `/tutor/anuncios` | Anuncio | TUTOR | No           | No                |

### 4.7 ClasesController (`/clases`) - Endpoints TUTOR

| Método | Ruta                   | Entidad     | Guard                 | Emite Evento | Crea Notificación |
| ------ | ---------------------- | ----------- | --------------------- | ------------ | ----------------- |
| GET    | `/clases`              | Clase       | TUTOR                 | No           | No                |
| GET    | `/clases/mis-reservas` | Inscripcion | TUTOR                 | No           | No                |
| GET    | `/clases/calendario`   | Clase       | TUTOR                 | No           | No                |
| POST   | `/clases/:id/reservar` | Inscripcion | TUTOR                 | No           | No                |
| DELETE | `/clases/reservas/:id` | Inscripcion | TUTOR                 | No           | No                |
| GET    | `/clases/:id`          | Clase       | TUTOR, DOCENTE, ADMIN | No           | No                |

### 4.8 AsistenciaController (`/asistencia`) - Endpoints TUTOR

| Método | Ruta                                    | Entidad    | Guard                 | Emite Evento | Crea Notificación |
| ------ | --------------------------------------- | ---------- | --------------------- | ------------ | ----------------- |
| GET    | `/asistencia/estudiantes/:estudianteId` | Asistencia | TUTOR, DOCENTE, ADMIN | No           | No                |

### 4.9 EstudiantesController (`/estudiantes`) - Endpoints para TUTOR

| Método | Ruta                                | Entidad    | Guard                               | Emite Evento | Crea Notificación |
| ------ | ----------------------------------- | ---------- | ----------------------------------- | ------------ | ----------------- |
| POST   | `/estudiantes`                      | Estudiante | JWT (cualquier usuario autenticado) | No           | No                |
| GET    | `/estudiantes`                      | Estudiante | JWT (filtra por tutorId)            | No           | No                |
| GET    | `/estudiantes/count`                | Estudiante | JWT                                 | No           | No                |
| GET    | `/estudiantes/estadisticas`         | Estudiante | JWT                                 | No           | No                |
| GET    | `/estudiantes/:id/detalle-completo` | Estudiante | EstudianteOwnershipGuard            | No           | No                |
| GET    | `/estudiantes/:id`                  | Estudiante | EstudianteOwnershipGuard            | No           | No                |
| PATCH  | `/estudiantes/:id`                  | Estudiante | EstudianteOwnershipGuard            | No           | No                |
| PATCH  | `/estudiantes/:id/avatar`           | Estudiante | EstudianteOwnershipGuard            | No           | No                |
| DELETE | `/estudiantes/:id`                  | Estudiante | EstudianteOwnershipGuard            | No           | No                |

---

## 5. SISTEMA DE COMUNICACIÓN

### 5.1 Notificaciones

**Modelo:** `Notificacion`

**Tipos de notificaciones:**

- `PAGO_EXITOSO` - Cuando se confirma un pago
- `PAGO_FALLIDO` - Cuando falla un cobro
- `NUEVA_INSCRIPCION` - Estudiante inscripto en clase
- `CLASE_CANCELADA` - Clase cancelada por docente/admin
- `OBSERVACION_CREADA` - Docente creó observación
- `ANUNCIO_NUEVO` - Docente publicó anuncio
- `VERANO_DECISION_REQUERIDA` - Período de decisión de verano
- `CANCELACION_PENDIENTE` - Suscripción en período de arrepentimiento

**Creación de notificaciones:**

```typescript
// NotificacionesService.crear()
await this.prisma.notificacion.create({
  data: {
    tipo,
    titulo,
    mensaje,
    destinatarioTipo, // 'tutor' | 'docente' | 'estudiante' | 'admin'
    destinatarioId,
  },
});
```

**Lectura:**

- Cada portal tiene su propio endpoint de notificaciones
- Filtrado por `destinatarioTipo` y `destinatarioId`

### 5.2 WebSocket Gateway (Clase en Vivo)

**Archivo:** `apps/api/src/websocket/clase-vivo.gateway.ts`

**Eventos emitidos:**

- `puntos:otorgados` - Cuando docente otorga puntos a estudiante
- `insignia:asignada` - Cuando docente asigna insignia
- `clase:iniciada` - Cuando inicia clase en vivo
- `clase:finalizada` - Cuando termina clase en vivo

**Salas:**

- `clase:{claseGrupoId}` - Sala por grupo de clase
- `estudiante:{estudianteId}` - Notificaciones personales

### 5.3 EventEmitter (Eventos Internos)

**Eventos internos:**

- `pago.confirmado` - Trigger para crear acceso
- `suscripcion.cancelada` - Trigger para revocar acceso
- `verano.decision.tomada` - Trigger para procesar cambio
- `logro.desbloqueado` - Trigger para notificación

### 5.4 Anuncios

**Modelo:** `Anuncio`

**Flujo:**

1. DOCENTE crea anuncio para ClaseGrupo o Comisión
2. Sistema genera notificaciones para estudiantes inscriptos
3. Tutores pueden ver anuncios de sus hijos

---

## 6. ROLES Y PERMISOS

### 6.1 Roles Definidos

```typescript
enum Role {
  ESTUDIANTE = 'ESTUDIANTE', // Nivel 1
  TUTOR = 'TUTOR', // Nivel 2
  DOCENTE = 'DOCENTE', // Nivel 3
  ADMIN = 'ADMIN', // Nivel 4
  SUPER_ADMIN = 'SUPER_ADMIN', // Nivel 5
}
```

### 6.2 Jerarquía de Roles

```typescript
const ROLE_HIERARCHY: Record<Role, number> = {
  ESTUDIANTE: 1,
  TUTOR: 2,
  DOCENTE: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};
```

### 6.3 Decoradores de Roles

**`@Roles()` - Con jerarquía:**

```typescript
@Roles(Role.DOCENTE)  // Acceso: DOCENTE, ADMIN, SUPER_ADMIN
```

**`@ExactRoles()` - Sin jerarquía:**

```typescript
@ExactRoles(Role.TUTOR)  // Acceso: SOLO TUTOR
```

### 6.4 Guards

**`JwtAuthGuard`:**

- Valida token JWT
- Extrae usuario del payload
- Respeta `@Public()` decorator

**`RolesGuard`:**

- Verifica roles requeridos
- Aplica jerarquía o exactitud según decorator
- Trabaja con `@Roles()` y `@ExactRoles()`

**`EstudianteOwnershipGuard`:**

- Verifica que el tutor sea dueño del estudiante
- Usado en endpoints de estudiantes específicos

### 6.5 Permisos por Rol

**ESTUDIANTE:**

- `leer:clases_propias`
- `leer:cursos`
- `leer:tareas_propias`
- `crear:tarea_entrega`
- `leer:perfil_propio`
- `actualizar:perfil_propio`

**TUTOR:**

- `leer:clases_propias`
- `leer:cursos`
- `leer:estudiantes_propios`
- `leer:perfil_propio`
- `actualizar:perfil_propio`
- `crear:inscripcion_estudiante`

**DOCENTE:**

- `leer:clases_propias`
- `crear:clase`
- `actualizar:clase_propia`
- `eliminar:clase_propia`
- `leer:estudiantes`
- `crear:tarea`
- `actualizar:tarea`
- `eliminar:tarea`
- `leer:asistencias`
- `crear:asistencia`
- `actualizar:asistencia`
- `leer:calendario_propio`
- `crear:evento_calendario`
- `actualizar:evento_calendario`
- `eliminar:evento_calendario`

**ADMIN:**

- CRUD completo de todas las entidades
- Gestión de pagos
- Acceso a reportes

**SUPER_ADMIN:**

- `*` (todos los permisos)
- Gestión de otros admins

### 6.6 Flujo de Autenticación

```
1. POST /auth/login (email + password)
   └── Valida credenciales
   └── Genera JWT (access + refresh en cookies httpOnly)
   └── Si MFA habilitado → retorna mfa_token

2. POST /auth/complete-mfa-login (solo si MFA)
   └── Valida código TOTP o backup code
   └── Genera JWT final

3. Cada request protegido:
   └── JwtAuthGuard valida token
   └── RolesGuard verifica roles
   └── Guards específicos (ownership, etc.)

4. POST /auth/refresh
   └── Rota tokens (access + refresh)
   └── Blacklist token anterior

5. POST /auth/logout
   └── Blacklist tokens
   └── Limpia cookies
```

---

## 7. RESUMEN DE CAPACIDADES POR PORTAL

### 7.1 Portal ADMIN

| Categoría           | Capacidades                                     |
| ------------------- | ----------------------------------------------- |
| **Usuarios**        | CRUD completo de docentes, tutores, estudiantes |
| **Clases**          | Crear/editar/eliminar clases y ClaseGrupos      |
| **Planificaciones** | CRUD completo, duplicar, asignar a grupos       |
| **Suscripciones**   | Ver todas, gestionar morosos, pausar/cancelar   |
| **Pagos**           | Ver historial, métricas, reportes               |
| **Gamificación**    | Desbloquear logros manualmente                  |
| **Verano**          | Ver decisiones, gestionar colonias              |
| **Sistema**         | Audit logs, alertas, DLQ                        |

### 7.2 Portal DOCENTE

| Categoría           | Capacidades                              |
| ------------------- | ---------------------------------------- |
| **Perfil**          | Ver/editar perfil propio                 |
| **Clases**          | Ver mis clases, cancelar clases propias  |
| **Estudiantes**     | Ver estudiantes de mis clases            |
| **Asistencia**      | Tomar asistencia, ver estadísticas       |
| **Observaciones**   | CRUD de observaciones, seguimientos      |
| **Anuncios**        | CRUD de anuncios para mis grupos         |
| **Planificaciones** | Ver asignadas, activar/desactivar clases |
| **Gamificación**    | Otorgar puntos, asignar insignias        |
| **Notificaciones**  | Ver y marcar como leídas                 |

### 7.3 Portal TUTOR

| Categoría          | Capacidades                                 |
| ------------------ | ------------------------------------------- |
| **Perfil**         | Ver/editar perfil propio                    |
| **Hijos**          | CRUD de estudiantes propios                 |
| **Suscripciones**  | Crear, modificar tier, pausar, cancelar     |
| **Inscripciones**  | Agregar/quitar actividades, cambiar horario |
| **Pagos**          | Ver historial de pagos                      |
| **Clases**         | Ver calendario, reservar clases             |
| **Verano**         | Tomar decisión, solicitar colonia           |
| **Anuncios**       | Ver anuncios de docentes de mis hijos       |
| **Notificaciones** | Ver y marcar como leídas                    |

---

## 8. PRÓXIMOS PASOS (FASE 2)

Con esta auditoría como base, la Fase 2 debe verificar:

1. **Conexiones Frontend → Backend:**
   - ¿Cada pantalla del frontend llama a los endpoints correctos?
   - ¿Los DTOs coinciden entre frontend y backend?

2. **Flujos de Comunicación:**
   - ¿Las notificaciones se crean correctamente?
   - ¿Los WebSockets funcionan en clase en vivo?

3. **Permisos:**
   - ¿Los guards están aplicados correctamente?
   - ¿Hay endpoints sin protección?

4. **Datos Faltantes:**
   - ¿Hay entidades sin endpoints?
   - ¿Hay endpoints sin tests?

---

_Documento generado por auditoría automatizada - Fase 1_
