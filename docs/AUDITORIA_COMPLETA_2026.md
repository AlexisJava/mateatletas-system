# AUDITORÍA COMPLETA - REFACTOR MATEATLETAS 2026

**Fecha:** 2025-11-26
**Branch:** `feature/planificaciones-v2`
**Objetivo:** Mapear TODO el proyecto para construir el modelo de negocio 2026

---

## CONTEXTO DEL MODELO 2026

El nuevo sistema tiene:
- **3 Tiers:** ARCADE ($30k), ARCADE+ ($60k), PRO ($75k)
- **3 Mundos:** Matemática, Programación, Ciencias
- **Sistema de planificaciones:** 22 actividades por mes (1 por día de semana)
- **Arena Diaria:** cápsulas de curiosidades rotativas
- **Arena Multijugador:** juegos en tiempo real con Quick Chat (sin voz)
- **4 Casas:** Phoenix, Dragon, Tiger, Eagle
- **Onboarding:** Test de ubicación + Quiz de casa + Avatar
- **Clases PRO** con telemetría en tiempo real
- **Reportes automáticos** semanales para padres

---

## PARTE 1: SCHEMA PRISMA

### 1.1 Modelos de Usuarios y Autenticación

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `Tutor` | ✅ SIRVE | Agregar campos | Agregar: `tier` (ARCADE/ARCADE+/PRO), `fecha_inicio_suscripcion`, `fecha_fin_suscripcion` |
| `Estudiante` | ⚠️ MODIFICAR | Agregar campos | Agregar: `casa_id` (FK a Casa), `onboarding_completado`, `test_ubicacion_id`, `nivel_ubicacion` |
| `Docente` | ✅ SIRVE | Mantener | Funciona bien, tiene roles multi-rol |
| `Admin` | ✅ SIRVE | Mantener | Incluye MFA, bien implementado |

### 1.2 Modelos de Gamificación

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `Equipo` | ⚠️ RENOMBRAR | Migrar a `Casa` | Renombrar a "Casa" (Phoenix, Dragon, Tiger, Eagle). Agregar: `emblema_url`, `lema`, `stats_temporada` |
| `Logro` | ✅ SIRVE | Mantener | Sistema V2 bien diseñado con 67 logros |
| `LogroEstudiante` | ✅ SIRVE | Mantener | Tracking de desbloqueos OK |
| `RachaEstudiante` | ✅ SIRVE | Mantener | Rachas de asistencia OK |
| `RecursosEstudiante` | ✅ SIRVE | Mantener | XP + Monedas (2 monedas) |
| `TransaccionRecurso` | ✅ SIRVE | Mantener | Historial transaccional OK |
| `LogroCurso` | ❌ ELIMINAR | Deprecado | Usar `Logro` en su lugar |
| `LogroDesbloqueado` | ❌ ELIMINAR | Deprecado | Usar `LogroEstudiante` en su lugar |
| `NivelConfig` | ✅ SIRVE | Agregar niveles | Agregar más niveles (1-50) |
| `PuntosPadre` | ✅ SIRVE | Mantener | Sistema de puntos para padres OK |

### 1.3 Modelos de Planificaciones

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `PlanificacionMensual` | ⚠️ MODIFICAR | Expandir | Agregar: `mundo` (enum: MATEMATICA, PROGRAMACION, CIENCIAS), cambiar de 4 semanas a 22 actividades/mes |
| `ActividadSemanal` | ⚠️ RENOMBRAR | Migrar a `ActividadDiaria` | Cambiar modelo a 22 actividades por mes (1 por día de semana) |
| `AsignacionDocente` | ✅ SIRVE | Mantener | Asignación de planificaciones a grupos OK |
| `AsignacionActividadEstudiante` | ✅ SIRVE | Mantener | Control de asignaciones OK |
| `ProgresoEstudianteActividad` | ✅ SIRVE | Mantener | Tracking de progreso OK |

### 1.4 Modelos de Clases y Grupos

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `Grupo` | ✅ SIRVE | Mantener | Grupos pedagógicos (B1, B2, B3, etc.) |
| `ClaseGrupo` | ✅ SIRVE | Agregar campo | Agregar: `tier_requerido` para clases PRO |
| `Clase` | ✅ SIRVE | Mantener | Clases programadas individuales |
| `InscripcionClaseGrupo` | ✅ SIRVE | Mantener | Inscripciones a grupos |
| `InscripcionClase` | ✅ SIRVE | Mantener | Reservas de clases |
| `AsistenciaClaseGrupo` | ✅ SIRVE | Mantener | Asistencia por sesión |
| `Asistencia` | ✅ SIRVE | Mantener | Asistencia legacy |

### 1.5 Modelos de Pagos

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `Membresia` | ⚠️ MODIFICAR | Agregar `tier` | Agregar: `tier` (ARCADE, ARCADE_PLUS, PRO), `mundos_activos[]` |
| `InscripcionMensual` | ✅ SIRVE | Mantener | Facturación mensual OK |
| `ConfiguracionPrecios` | ⚠️ MODIFICAR | Agregar tiers | Agregar precios para: `precio_arcade`, `precio_arcade_plus`, `precio_pro` |
| `Producto` | ✅ SIRVE | Mantener | Catálogo de productos |
| `Beca` | ✅ SIRVE | Mantener | Sistema de becas OK |

### 1.6 Modelos de Tienda

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `CategoriaItem` | ✅ SIRVE | Mantener | Categorías de tienda OK |
| `ItemTienda` | ✅ SIRVE | Mantener | Items comprables OK |
| `ItemObtenido` | ✅ SIRVE | Mantener | Inventario de estudiante OK |
| `CompraItem` | ✅ SIRVE | Mantener | Historial de compras OK |
| `CursoCatalogo` | ✅ SIRVE | Mantener | Cursos canjeables OK |
| `SolicitudCanje` | ✅ SIRVE | Mantener | Canjes pendientes OK |
| `CursoEstudiante` | ✅ SIRVE | Mantener | Cursos habilitados OK |

### 1.7 Modelos de Contenido Educativo

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `Modulo` | ✅ SIRVE | Mantener | Módulos de cursos OK |
| `Leccion` | ✅ SIRVE | Mantener | Lecciones microlearning OK |
| `ProgresoLeccion` | ✅ SIRVE | Mantener | Progreso de lecciones OK |
| `Sector` | ⚠️ RENOMBRAR | Migrar a `Mundo` | Renombrar a "Mundo" (Matemática, Programación, Ciencias) |
| `RutaEspecialidad` | ✅ SIRVE | Mantener | Subrutas dentro de mundos |
| `RutaCurricular` | ✅ SIRVE | Mantener | Temas de clases |

### 1.8 Modelos de Eventos y Calendario

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `Evento` | ✅ SIRVE | Mantener | Eventos de calendario docente |
| `Tarea` | ✅ SIRVE | Mantener | Tareas administrativas |
| `Recordatorio` | ✅ SIRVE | Mantener | Recordatorios simples |
| `Nota` | ✅ SIRVE | Mantener | Notas del docente |
| `Notificacion` | ✅ SIRVE | Mantener | Notificaciones sistema |

### 1.9 Modelos de Colonia/Inscripciones 2026

| Modelo | Estado | Acción | Detalles |
|--------|--------|--------|----------|
| `ColoniaInscripcion` | ✅ SIRVE | Mantener | Colonia de verano |
| `ColoniaEstudiante` | ✅ SIRVE | Mantener | Estudiantes en colonia |
| `ColoniaEstudianteCurso` | ✅ SIRVE | Mantener | Cursos seleccionados |
| `ColoniaPago` | ✅ SIRVE | Mantener | Pagos colonia |
| `Inscripcion2026` | ✅ SIRVE | Mantener | Inscripciones unificadas |

### 1.10 MODELOS NUEVOS A CREAR

| Modelo | Prioridad | Estructura Propuesta |
|--------|-----------|---------------------|
| `Casa` | 🔴 CRÍTICO | `id`, `nombre` (Phoenix/Dragon/Tiger/Eagle), `color_primario`, `color_secundario`, `emblema_url`, `lema`, `puntos_temporada`, `ranking_actual` |
| `TestUbicacion` | 🔴 CRÍTICO | `id`, `estudiante_id`, `preguntas_respondidas`, `nivel_asignado`, `fecha_completado`, `resultados_json` |
| `ArenaDiaria` | 🟡 MEDIO | `id`, `fecha`, `tipo` (curiosidad/trivia/dato), `mundo`, `contenido`, `imagen_url`, `fuente` |
| `PartidaMultijugador` | 🟡 MEDIO | `id`, `tipo_juego`, `jugadores[]`, `estado`, `ganador_id`, `puntos_otorgados`, `fecha_inicio`, `fecha_fin` |
| `QuickChatMensaje` | 🟡 MEDIO | `id`, `partida_id`, `emisor_id`, `mensaje_predefinido_id`, `timestamp` |
| `TelemetriaClase` | 🟢 BAJO | `id`, `clase_grupo_id`, `estudiante_id`, `eventos_json`, `metricas_json`, `fecha` |
| `ReporteSemanal` | 🟢 BAJO | `id`, `estudiante_id`, `tutor_id`, `semana`, `anio`, `contenido_json`, `fecha_generado`, `fecha_enviado` |
| `Tier` | 🔴 CRÍTICO | Enum: `ARCADE`, `ARCADE_PLUS`, `PRO` (agregar a Membresia y Tutor) |
| `Mundo` | 🔴 CRÍTICO | Enum: `MATEMATICA`, `PROGRAMACION`, `CIENCIAS` |

---

## PARTE 2: SERVICIOS BACKEND

### 2.1 Servicios que Funcionan y se Mantienen ✅

| Servicio | Ubicación | Descripción |
|----------|-----------|-------------|
| `AuthService` | `/auth/auth.service.ts` | Login multi-rol, JWT, MFA |
| `MfaService` | `/auth/mfa/mfa.service.ts` | TOTP + backup codes |
| `LoginAttemptService` | `/auth/services/login-attempt.service.ts` | Brute-force protection |
| `PrismaService` | `/core/database/prisma.service.ts` | Conexión BD |
| `AuditLogService` | `/audit/audit-log.service.ts` | Auditoría completa |
| `MercadoPagoService` | `/pagos/mercadopago.service.ts` | Integración pagos |
| `PaymentWebhookService` | `/pagos/services/payment-webhook.service.ts` | Webhooks MP |
| `FraudDetectionService` | `/security/fraud-detection.service.ts` | Anti-fraude |
| `VerificadorLogrosService` | `/gamificacion/services/verificador-logros.service.ts` | Logros automáticos |
| `RachaService` | `/gamificacion/services/racha.service.ts` | Rachas de asistencia |

### 2.2 Servicios que Requieren Refactorización ⚠️

| Servicio | Ubicación | Problema | Acción |
|----------|-----------|----------|--------|
| `DocenteStatsService` | `/docentes/services/docente-stats.service.ts` | Línea 635 usa modelo `progresoEstudiantePlanificacion` que NO EXISTE | Corregir referencia |
| `LogrosService` | `/gamificacion/logros.service.ts` | DEPRECATED - duplicado | Eliminar, usar V2 |
| `EquiposService` | `/equipos/equipos.service.ts` | Renombrar a CasasService | Refactorizar |
| `GamificacionService` | `/gamificacion/gamificacion.service.ts` | Agregar integración con Casas | Expandir |
| `RecursosService` (tienda) | `/tienda/recursos.service.ts` | Duplicado con gamificacion | Unificar |

### 2.3 Servicios Nuevos a Crear 🆕

| Servicio | Módulo | Métodos Principales | Prioridad |
|----------|--------|---------------------|-----------|
| `CasasService` | `/casas/` | `asignarCasa()`, `obtenerRanking()`, `actualizarPuntos()`, `obtenerMiembros()` | 🔴 CRÍTICO |
| `TiersService` | `/tiers/` | `obtenerTier()`, `actualizarTier()`, `verificarAcceso()`, `getMundosActivos()` | 🔴 CRÍTICO |
| `TestUbicacionService` | `/onboarding/` | `iniciarTest()`, `guardarRespuesta()`, `calcularNivel()`, `completarTest()` | 🔴 CRÍTICO |
| `PlanificacionesService` | `/planificaciones/` | CRUD completo + asignaciones | 🔴 CRÍTICO |
| `ArenaDiariaService` | `/arena-diaria/` | `obtenerCapsulaHoy()`, `marcarVista()`, `obtenerHistorial()` | 🟡 MEDIO |
| `MultijugadorService` | `/multijugador/` | `crearPartida()`, `unirsePartida()`, `registrarAccion()`, `finalizarPartida()` | 🟡 MEDIO |
| `QuickChatService` | `/multijugador/` | `enviarMensaje()`, `obtenerMensajesPredefinidos()` | 🟡 MEDIO |
| `TelemetriaService` | `/telemetria/` | `registrarEvento()`, `obtenerMetricas()`, `exportarDatos()` | 🟢 BAJO |
| `ReportesAutomaticosService` | `/reportes/` | `generarReporteSemanal()`, `enviarATutor()`, `programarEnvio()` | 🟢 BAJO |

---

## PARTE 3: CONTROLLERS Y ENDPOINTS

### 3.1 Controllers Existentes (28 total)

| Controller | Ruta Base | Endpoints | Estado |
|------------|-----------|-----------|--------|
| `AppController` | `/` | 1 | ✅ OK |
| `HealthController` | `/health` | 3 | ✅ OK |
| `AuthController` | `/auth` | 7 | ✅ OK |
| `MfaController` | `/auth/mfa` | 4 | ✅ OK |
| `AdminController` | `/admin` | 48 | ✅ OK |
| `DocentesController` | `/docentes` | 10 | ✅ OK |
| `EstudiantesController` | `/estudiantes` | 21 | ✅ OK |
| `CursosController` | `/cursos` | 15 | ✅ OK |
| `ClasesController` | `/clases` | 16 | ✅ OK |
| `TutorController` | `/tutor` | 4 | ✅ OK |
| `GamificacionController` | `/gamificacion` | 9 | ✅ OK |
| `LogrosController` | `/gamificacion/logros` | 6 | ✅ OK |
| `RecursosController` (tienda) | `/recursos` | 3 | ✅ OK |
| `TiendaController` (gami) | `/gamificacion/tienda` | 10 | ✅ OK |
| `PagosController` | `/pagos` | 19 | ✅ OK |
| `EventosController` | `/eventos` | 13 | ✅ OK |
| `ColoniaController` | `/colonia` | 2 | ✅ OK |
| `AsistenciaController` | `/asistencia` | 9 | ✅ OK |
| `NotificacionesController` | `/notificaciones` | 5 | ✅ OK |
| `TiendaController` | `/tienda` | 11 | ✅ OK |
| `ProductosController` | `/productos` | 7 | ✅ OK |
| `Inscripciones2026Controller` | `/inscripciones-2026` | 6 | ✅ OK |
| `EquiposController` | `/equipos` | 7 | ⚠️ Renombrar |

### 3.2 Endpoints que NO EXISTEN (Frontend los espera)

| Método | Ruta | Frontend que lo usa | Prioridad |
|--------|------|---------------------|-----------|
| GET | `/planificaciones` | `planificaciones.api.ts` | 🔴 CRÍTICO |
| GET | `/planificaciones/:id` | `planificaciones.api.ts` | 🔴 CRÍTICO |
| POST | `/planificaciones` | `planificaciones.api.ts` | 🔴 CRÍTICO |
| PATCH | `/planificaciones/:id` | `planificaciones.api.ts` | 🔴 CRÍTICO |
| DELETE | `/planificaciones/:id` | `planificaciones.api.ts` | 🔴 CRÍTICO |
| POST | `/planificaciones/:id/actividades` | `planificaciones.api.ts` | 🔴 CRÍTICO |
| GET | `/planificaciones/mis-planificaciones` | Vista estudiante | 🔴 CRÍTICO |
| GET | `/planificaciones/mis-asignaciones` | Vista docente | 🔴 CRÍTICO |
| PUT | `/planificaciones/:codigo/progreso` | Vista estudiante | 🔴 CRÍTICO |

### 3.3 Controllers Nuevos a Crear

| Controller | Ruta Base | Endpoints Necesarios | Prioridad |
|------------|-----------|---------------------|-----------|
| `PlanificacionesController` | `/planificaciones` | CRUD + asignaciones + progreso | 🔴 CRÍTICO |
| `CasasController` | `/casas` | CRUD + ranking + asignación | 🔴 CRÍTICO |
| `TiersController` | `/tiers` | Obtener/actualizar tier | 🔴 CRÍTICO |
| `OnboardingController` | `/onboarding` | Test ubicación + Quiz casa | 🔴 CRÍTICO |
| `ArenaDiariaController` | `/arena-diaria` | Cápsulas del día | 🟡 MEDIO |
| `MultijugadorController` | `/multijugador` | Partidas + Quick Chat | 🟡 MEDIO |
| `TelemetriaController` | `/telemetria` | Eventos en tiempo real | 🟢 BAJO |
| `ReportesController` | `/reportes` | Reportes semanales | 🟢 BAJO |

---

## PARTE 4: MÓDULOS NESTJS

### 4.1 Módulos Existentes (22 total)

| Módulo | Estado | Acción |
|--------|--------|--------|
| `CoreModule` | ✅ MANTENER | Config + Database |
| `SecurityModule` | ✅ MANTENER | Guards + Rate Limiting |
| `ObservabilityModule` | ✅ MANTENER | Logging |
| `InfrastructureModule` | ✅ MANTENER | Cache + Events |
| `AuthModule` | ✅ MANTENER | Autenticación |
| `EstudiantesModule` | ✅ MANTENER | Estudiantes |
| `EquiposModule` | ⚠️ RENOMBRAR | Renombrar a CasasModule |
| `DocentesModule` | ✅ MANTENER | Docentes |
| `CatalogoModule` | ✅ MANTENER | Productos |
| `PagosModule` | ✅ MANTENER | MercadoPago |
| `TutorModule` | ✅ MANTENER | Tutores |
| `ClasesModule` | ✅ MANTENER | Clases |
| `AsistenciaModule` | ✅ MANTENER | Asistencia |
| `AdminModule` | ✅ MANTENER | Administración |
| `GamificacionModule` | ⚠️ EXPANDIR | Agregar Casas |
| `CursosModule` | ✅ MANTENER | Cursos |
| `EventosModule` | ✅ MANTENER | Calendario |
| `TiendaModule` | ✅ MANTENER | Tienda |
| `ColoniaModule` | ✅ MANTENER | Colonia 2026 |
| `Inscripciones2026Module` | ✅ MANTENER | Inscripciones |
| `AuditModule` | ✅ MANTENER | Auditoría |
| `HealthModule` | ✅ MANTENER | Health checks |

### 4.2 Módulos Nuevos a Crear

| Módulo | Prioridad | Descripción |
|--------|-----------|-------------|
| `PlanificacionesModule` | 🔴 CRÍTICO | Sistema de planificaciones mensuales |
| `CasasModule` | 🔴 CRÍTICO | 4 Casas de gamificación |
| `TiersModule` | 🔴 CRÍTICO | Sistema de tiers |
| `OnboardingModule` | 🔴 CRÍTICO | Test ubicación + Quiz casa |
| `ArenaDiariaModule` | 🟡 MEDIO | Cápsulas diarias |
| `MultijugadorModule` | 🟡 MEDIO | Juegos en tiempo real |
| `TelemetriaModule` | 🟢 BAJO | Tracking PRO |
| `ReportesAutomaticosModule` | 🟢 BAJO | Reportes semanales |

---

## PARTE 5: FRONTEND - PÁGINAS

### 5.1 Páginas Admin (13 páginas)

| Ruta | Estado | Acción |
|------|--------|--------|
| `/admin/dashboard` | ✅ COMPLETA | Mantener |
| `/admin/clases` | ✅ COMPLETA | Mantener |
| `/admin/clases/[id]` | ✅ COMPLETA | Mantener |
| `/admin/credenciales` | ✅ COMPLETA | Mantener |
| `/admin/estudiantes` | ✅ COMPLETA | Mantener |
| `/admin/pagos` | ⚠️ PARCIAL | Completar métricas |
| `/admin/planificaciones` | ⚠️ SIN BACKEND | Conectar API |
| `/admin/planificaciones-simples` | ❌ ELIMINAR | Unificar con planificaciones |
| `/admin/reportes` | ⚠️ PARCIAL | Expandir |
| `/admin/usuarios` | ✅ COMPLETA | Mantener |
| `/admin/sectores-rutas` | ⚠️ PARCIAL | Renombrar a Mundos |

### 5.2 Páginas Docente (9 páginas)

| Ruta | Estado | Acción |
|------|--------|--------|
| `/docente/dashboard` | ✅ COMPLETA | Mantener |
| `/docente/observaciones` | ✅ COMPLETA | Mantener |
| `/docente/calendario` | ⚠️ PARCIAL | Completar |
| `/docente/grupos/[id]` | ⚠️ PARCIAL | Completar |
| `/docente/clase/[id]/sala` | ⚠️ PARCIAL | Agregar telemetría PRO |
| `/docente/clases/[id]/asistencia` | ⚠️ PARCIAL | Completar |
| `/docente/planificaciones` | ⚠️ SIN BACKEND | Conectar API |
| `/docente/perfil` | ⚠️ PARCIAL | Completar |

### 5.3 Páginas Estudiante (8 páginas)

| Ruta | Estado | Acción |
|------|--------|--------|
| `/estudiante/gamificacion` | ✅ COMPLETA | Agregar Casas |
| `/estudiante/gamificacion/logros` | ⚠️ PARCIAL | Completar |
| `/estudiante/tienda` | ✅ COMPLETA | Mantener |
| `/estudiante/perfil` | ✅ COMPLETA | Agregar Casa |
| `/estudiante/crear-avatar` | ⚠️ PARCIAL | Completar |
| `/estudiante/gimnasio` | ⚠️ MOCK | Conectar a planificaciones reales |
| `/estudiante/planificaciones/[codigo]` | ⚠️ SIN BACKEND | Conectar API |

### 5.4 Páginas Tutor/Protegidas (10 páginas)

| Ruta | Estado | Acción |
|------|--------|--------|
| `/(protected)/dashboard` | ✅ COMPLETA | Agregar info de tier |
| `/(protected)/clases` | ✅ COMPLETA | Filtrar por tier |
| `/(protected)/catalogo` | ⚠️ PARCIAL | Mostrar tiers |
| `/(protected)/equipos` | ⚠️ PARCIAL | Renombrar a Casas |
| `/(protected)/estudiantes` | ⚠️ PARCIAL | Completar |
| `/(protected)/membresia/planes` | ⚠️ MODIFICAR | Mostrar 3 tiers |
| `/(protected)/planificaciones` | ⚠️ SIN BACKEND | Conectar API |

### 5.5 Páginas Nuevas a Crear

| Ruta | Rol | Prioridad | Descripción |
|------|-----|-----------|-------------|
| `/estudiante/onboarding` | Estudiante | 🔴 CRÍTICO | Test ubicación + Quiz casa + Avatar |
| `/estudiante/arena-diaria` | Estudiante | 🟡 MEDIO | Cápsula del día |
| `/estudiante/multijugador` | Estudiante | 🟡 MEDIO | Lobby de juegos |
| `/estudiante/multijugador/[partidaId]` | Estudiante | 🟡 MEDIO | Sala de juego |
| `/estudiante/mi-casa` | Estudiante | 🔴 CRÍTICO | Info de su casa |
| `/admin/casas` | Admin | 🔴 CRÍTICO | Gestión de casas |
| `/admin/tiers` | Admin | 🔴 CRÍTICO | Configuración de tiers |
| `/admin/arena-diaria` | Admin | 🟡 MEDIO | Gestión de cápsulas |
| `/tutor/reportes` | Tutor | 🟢 BAJO | Ver reportes semanales |
| `/docente/telemetria` | Docente | 🟢 BAJO | Ver métricas PRO |

---

## PARTE 6: COMPONENTES CRÍTICOS

### 6.1 Componentes de Gamificación

| Componente | Ubicación | Estado | Acción |
|------------|-----------|--------|--------|
| `RecursosBar` | `components/gamificacion/` | ✅ OK | Mantener |
| `ListaLogros` | `components/gamificacion/` | ✅ OK | Mantener |
| `RachaIndicator` | `components/gamificacion/` | ✅ OK | Mantener |
| `CasaCard` | - | 🆕 CREAR | Info de casa del estudiante |
| `RankingCasas` | - | 🆕 CREAR | Ranking entre las 4 casas |

### 6.2 Componentes de Planificaciones

| Componente | Ubicación | Estado | Acción |
|------------|-----------|--------|--------|
| `PlanificacionesTable` | `/admin/planificaciones/components/` | ✅ OK | Mantener |
| `CreatePlanificacionModal` | `/admin/planificaciones/components/` | ✅ OK | Expandir |
| `PlanificacionFilters` | `/admin/planificaciones/components/` | ✅ OK | Mantener |
| `ActividadCard` | `/estudiante/gimnasio/components/` | ⚠️ MOCK | Conectar API |
| `SemanaCard` | `/estudiante/gimnasio/components/` | ⚠️ MOCK | Cambiar a DiarioCard |

### 6.3 Componentes de Gimnasio/Ejercicios

| Componente | Ubicación | Estado | Acción |
|------------|-----------|--------|--------|
| `MultipleChoiceQuestion` | `/estudiante/gimnasio/components/ejercicios/` | ✅ OK | Mantener |
| `VerdaderoFalsoQuestion` | `/estudiante/gimnasio/components/ejercicios/` | ✅ OK | Mantener |
| `FillBlankQuestion` | `/estudiante/gimnasio/components/ejercicios/` | ✅ OK | Mantener |
| `VideoPlayer` | `/estudiante/gimnasio/components/ejercicios/` | ✅ OK | Mantener |
| `ResultsView` | `/estudiante/gimnasio/components/results/` | ✅ OK | Mantener |

### 6.4 Componentes Nuevos a Crear

| Componente | Prioridad | Descripción |
|------------|-----------|-------------|
| `TestUbicacionWizard` | 🔴 CRÍTICO | Wizard de test de ubicación |
| `QuizCasaSelector` | 🔴 CRÍTICO | Quiz para elegir casa |
| `AvatarCreator` | 🔴 CRÍTICO | Creador de avatar (Ready Player Me) |
| `TierBadge` | 🔴 CRÍTICO | Badge visual del tier |
| `TierComparison` | 🔴 CRÍTICO | Comparativa de tiers |
| `ArenaDiariaCard` | 🟡 MEDIO | Cápsula del día |
| `MultiplayerLobby` | 🟡 MEDIO | Lobby de partidas |
| `MultiplayerGame` | 🟡 MEDIO | Interfaz de juego |
| `QuickChatPanel` | 🟡 MEDIO | Chat predefinido |
| `TelemetriaPanel` | 🟢 BAJO | Métricas en tiempo real |
| `ReporteSemanalCard` | 🟢 BAJO | Vista de reporte |

---

## PARTE 7: STORES Y API CLIENTS

### 7.1 Stores Existentes (15 total)

| Store | Estado | Acción |
|-------|--------|--------|
| `auth.store.ts` | ✅ OK | Agregar `tier` al user |
| `estudiantes.store.ts` | ✅ OK | Agregar `casa` |
| `planificaciones.store.ts` | ⚠️ SIN BACKEND | Conectar API |
| `gamificacion.store.ts` | ⚠️ EXPANDIR | Agregar casas |
| `equipos.store.ts` | ⚠️ RENOMBRAR | Migrar a `casas.store.ts` |
| `clases.store.ts` | ✅ OK | Filtrar por tier |
| `cursos.store.ts` | ✅ OK | Mantener |
| `pagos.store.ts` | ✅ OK | Agregar tier info |
| `calendario.store.ts` | ✅ OK | Mantener |
| `notificaciones.store.ts` | ✅ OK | Mantener |
| `docente.store.ts` | ✅ OK | Mantener |
| `admin.store.ts` | ✅ OK | Mantener |
| `asistencia.store.ts` | ✅ OK | Mantener |
| `sectores.store.ts` | ⚠️ RENOMBRAR | Migrar a `mundos.store.ts` |
| `catalogo.store.ts` | ✅ OK | Mantener |

### 7.2 API Clients Existentes (22 total)

| API Client | Estado | Acción |
|------------|--------|--------|
| `planificaciones.api.ts` | ⚠️ SIN BACKEND | Backend no existe |
| `planificaciones-simples.api.ts` | ❌ ELIMINAR | Unificar |
| `auth.api.ts` | ✅ OK | Mantener |
| `estudiantes.api.ts` | ✅ OK | Agregar casa |
| `gamificacion.api.ts` | ⚠️ EXPANDIR | Agregar casas |
| `equipos.api.ts` | ⚠️ RENOMBRAR | Migrar a `casas.api.ts` |
| Resto... | ✅ OK | Mantener |

### 7.3 Stores y API Clients Nuevos

| Archivo | Tipo | Prioridad |
|---------|------|-----------|
| `casas.store.ts` | Store | 🔴 CRÍTICO |
| `casas.api.ts` | API Client | 🔴 CRÍTICO |
| `tiers.store.ts` | Store | 🔴 CRÍTICO |
| `tiers.api.ts` | API Client | 🔴 CRÍTICO |
| `onboarding.store.ts` | Store | 🔴 CRÍTICO |
| `onboarding.api.ts` | API Client | 🔴 CRÍTICO |
| `arena-diaria.store.ts` | Store | 🟡 MEDIO |
| `arena-diaria.api.ts` | API Client | 🟡 MEDIO |
| `multijugador.store.ts` | Store | 🟡 MEDIO |
| `multijugador.api.ts` | API Client | 🟡 MEDIO |

---

## PARTE 8: FEATURES NUEVAS A CREAR

### 8.1 Backend - Crítico 🔴

- [ ] **Módulo `PlanificacionesModule`** - CRUD completo + asignaciones
- [ ] **Módulo `CasasModule`** - 4 Casas con ranking
- [ ] **Módulo `TiersModule`** - ARCADE/ARCADE+/PRO
- [ ] **Módulo `OnboardingModule`** - Test ubicación + Quiz casa
- [ ] **Enum `Tier`** en schema Prisma
- [ ] **Enum `Mundo`** en schema Prisma (reemplaza Sector)
- [ ] **Modelo `Casa`** en schema Prisma
- [ ] **Modelo `TestUbicacion`** en schema Prisma
- [ ] **Migración** para renombrar Equipo → Casa
- [ ] **Migración** para agregar tier a Membresia y Tutor

### 8.2 Backend - Medio 🟡

- [ ] **Módulo `ArenaDiariaModule`** - Cápsulas de curiosidades
- [ ] **Módulo `MultijugadorModule`** - Juegos en tiempo real
- [ ] **WebSocket Gateway** para multijugador
- [ ] **Modelo `ArenaDiaria`** en schema Prisma
- [ ] **Modelo `PartidaMultijugador`** en schema Prisma
- [ ] **Modelo `QuickChatMensaje`** en schema Prisma

### 8.3 Backend - Bajo 🟢

- [ ] **Módulo `TelemetriaModule`** - Métricas PRO
- [ ] **Módulo `ReportesAutomaticosModule`** - Reportes semanales
- [ ] **Modelo `TelemetriaClase`** en schema Prisma
- [ ] **Modelo `ReporteSemanal`** en schema Prisma
- [ ] **Cron Job** para generar reportes semanales

### 8.4 Frontend - Crítico 🔴

- [ ] **Página `/estudiante/onboarding`** - Wizard completo
- [ ] **Página `/estudiante/mi-casa`** - Info de casa
- [ ] **Página `/admin/casas`** - Gestión de casas
- [ ] **Página `/admin/tiers`** - Configuración de tiers
- [ ] **Componente `TestUbicacionWizard`**
- [ ] **Componente `QuizCasaSelector`**
- [ ] **Componente `TierBadge`**
- [ ] **Componente `TierComparison`**
- [ ] **Store `casas.store.ts`**
- [ ] **Store `tiers.store.ts`**
- [ ] **Store `onboarding.store.ts`**

### 8.5 Frontend - Medio 🟡

- [ ] **Página `/estudiante/arena-diaria`**
- [ ] **Página `/estudiante/multijugador`**
- [ ] **Página `/estudiante/multijugador/[partidaId]`**
- [ ] **Componente `ArenaDiariaCard`**
- [ ] **Componente `MultiplayerLobby`**
- [ ] **Componente `MultiplayerGame`**
- [ ] **Componente `QuickChatPanel`**
- [ ] **Store `arena-diaria.store.ts`**
- [ ] **Store `multijugador.store.ts`**

### 8.6 Frontend - Bajo 🟢

- [ ] **Página `/tutor/reportes`**
- [ ] **Página `/docente/telemetria`**
- [ ] **Componente `TelemetriaPanel`**
- [ ] **Componente `ReporteSemanalCard`**

---

## PARTE 9: DEPENDENCIAS ENTRE TAREAS

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FASE 1: FUNDAMENTOS                              │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │ Schema Prisma│───►│ Migraciones  │───►│ Servicios    │           │
│  │ (Modelos)    │    │ BD           │    │ Core         │           │
│  └──────────────┘    └──────────────┘    └──────────────┘           │
│         │                   │                   │                    │
│         ▼                   ▼                   ▼                    │
│  ┌──────────────────────────────────────────────────────┐           │
│  │           Sistema de Tiers (ARCADE/+/PRO)            │           │
│  └──────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASE 2: GAMIFICACIÓN                             │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │ Casas        │───►│ Onboarding   │───►│ Test         │           │
│  │ (4 casas)    │    │ Flow         │    │ Ubicación    │           │
│  └──────────────┘    └──────────────┘    └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASE 3: PLANIFICACIONES                          │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │ Backend      │───►│ Frontend     │───►│ Conexión     │           │
│  │ Planif.      │    │ Admin        │    │ Estudiante   │           │
│  └──────────────┘    └──────────────┘    └──────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASE 4: ARENA                                    │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐                               │
│  │ Arena        │───►│ Arena        │                               │
│  │ Diaria       │    │ Multijugador │                               │
│  └──────────────┘    └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FASE 5: PRO FEATURES                             │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐                               │
│  │ Telemetría   │───►│ Reportes     │                               │
│  │ Tiempo Real  │    │ Automáticos  │                               │
│  └──────────────┘    └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PARTE 10: RIESGOS Y DEUDA TÉCNICA

### 10.1 Código con `any` o sin tipos

| Archivo | Problema | Severidad |
|---------|----------|-----------|
| Varios servicios | Uso de `Json` en Prisma sin tipado | 🟡 Media |
| `componente_props` en ActividadSemanal | JSON sin schema | 🟡 Media |
| `metadata` en varios modelos | JSON sin tipado | 🟡 Media |

### 10.2 Anti-patterns detectados

| Problema | Ubicación | Severidad |
|----------|-----------|-----------|
| Servicios duplicados | `LogrosService` vs `LogrosServiceV2` | 🔴 Alta |
| Servicios duplicados | `RecursosService` en tienda y gamificacion | 🟡 Media |
| Modelos deprecados sin eliminar | `LogroCurso`, `LogroDesbloqueado` | 🟡 Media |
| Referencia a modelo inexistente | `DocenteStatsService:635` usa `progresoEstudiantePlanificacion` | 🔴 Alta |

### 10.3 Archivos muy grandes (>300 líneas)

| Archivo | Líneas | Acción |
|---------|--------|--------|
| `schema.prisma` | ~2700 | Dividir en archivos parciales |
| `admin.controller.ts` | ~500 | OK (muchos endpoints) |

### 10.4 Tests faltantes

| Módulo | Tests Existentes | Tests Faltantes |
|--------|-----------------|-----------------|
| Auth | ✅ Parcial | Login multi-rol |
| Gamificación | ❌ No | Todo |
| Planificaciones | ❌ No | Todo |
| Pagos | ✅ Parcial | Webhooks |

### 10.5 Código duplicado

| Patrón | Ubicación 1 | Ubicación 2 |
|--------|-------------|-------------|
| Cálculo de precios | `PricingCalculatorService` | `PagosService` |
| Validación de ownership | Múltiples guards | Centralizar |

---

## PARTE 11: ARCHIVOS A NO TOCAR

### 11.1 Sistema de Pagos - CRÍTICO ⛔

| Archivo | Razón |
|---------|-------|
| `apps/api/src/pagos/mercadopago.service.ts` | Integración MercadoPago probada |
| `apps/api/src/pagos/services/payment-webhook.service.ts` | Webhooks funcionando |
| `apps/api/src/pagos/services/mercadopago-ip-whitelist.service.ts` | Seguridad |
| `apps/api/src/pagos/services/webhook-idempotency.service.ts` | Prevención duplicados |
| `apps/api/src/pagos/services/payment-amount-validator.service.ts` | Anti-fraude |

### 11.2 Sistema de Autenticación - CRÍTICO ⛔

| Archivo | Razón |
|---------|-------|
| `apps/api/src/auth/auth.service.ts` | Multi-rol funcionando |
| `apps/api/src/auth/mfa/mfa.service.ts` | MFA implementado |
| `apps/api/src/auth/services/login-attempt.service.ts` | Brute-force protection |
| `apps/api/src/auth/strategies/` | Estrategias JWT |
| `apps/api/src/auth/guards/` | Guards de autorización |

### 11.3 Sistema de Seguridad - CRÍTICO ⛔

| Archivo | Razón |
|---------|-------|
| `apps/api/src/security/fraud-detection.service.ts` | Detección de fraude |
| `apps/api/src/security/security-monitoring.service.ts` | Monitoreo |
| `apps/api/src/audit/audit-log.service.ts` | Auditoría completa |

### 11.4 Infraestructura - CRÍTICO ⛔

| Archivo | Razón |
|---------|-------|
| `apps/api/src/core/database/prisma.service.ts` | Conexión BD |
| `apps/api/src/core/redis/redis.service.ts` | Cache/sesiones |
| `apps/api/src/health/health.controller.ts` | Health checks |

---

## RESUMEN EJECUTIVO

### Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Modelos Prisma** | 65 |
| **Servicios Backend** | 84 |
| **Controllers** | 28 |
| **Endpoints** | 328 |
| **Páginas Frontend** | 41 |
| **Stores Zustand** | 15 |
| **API Clients** | 22 |

### Trabajo Estimado por Fase

| Fase | Complejidad | Prioridad |
|------|-------------|-----------|
| **1. Tiers + Schema** | Media | 🔴 CRÍTICO |
| **2. Casas + Onboarding** | Alta | 🔴 CRÍTICO |
| **3. Planificaciones Backend** | Alta | 🔴 CRÍTICO |
| **4. Arena Diaria** | Media | 🟡 MEDIO |
| **5. Arena Multijugador** | Alta | 🟡 MEDIO |
| **6. Telemetría PRO** | Media | 🟢 BAJO |
| **7. Reportes Automáticos** | Baja | 🟢 BAJO |

### Próximos Pasos Inmediatos

1. ✅ **Completar auditoría** - Este documento
2. 🔲 **Crear migraciones Prisma** - Tiers, Casas, renombrar Sectores
3. 🔲 **Crear módulo Planificaciones** - Backend completo
4. 🔲 **Conectar frontend existente** - Planificaciones admin/docente/estudiante
5. 🔲 **Implementar Casas** - Reemplazar Equipos
6. 🔲 **Crear onboarding flow** - Test + Quiz + Avatar

---

*Generado automáticamente - Branch: feature/planificaciones-v2*
*Fecha: 2025-11-26*
