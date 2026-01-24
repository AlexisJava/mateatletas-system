# Plan Consolidado Pre-Producción 2026

> **Estado**: EN PROGRESO
> **Fecha**: 2026-01-23
> **Basado en**: AUDITORIA_PREPROD_2026.md + PLAN_IMPLEMENTACION_CROSS_PORTAL.md
> **Branch sugerido**: `feat/preprod-fixes`

---

## Resumen Ejecutivo

Este documento consolida TODOS los items pendientes de las auditorías individuales y cross-portal en un solo plan de acción ordenado estratégicamente.

### Estadísticas Globales (Actualizado 2026-01-23)

| Portal/Sistema       | Funcional | Parcial | Pendiente | Total |
| -------------------- | --------- | ------- | --------- | ----- |
| Portal Estudiante    | ~65%      | -       | ~35%      | ~30   |
| Portal Tutor         | ~70%      | -       | ~30%      | 29    |
| Portal Docente       | ~90%      | -       | ~10%      | 66    |
| Portal Admin         | ~80%      | -       | ~20%      | 152   |
| Notificaciones       | ~85%      | -       | ~15%      | 48    |
| MercadoPago 2026     | ~87%      | -       | ~13%      | 112   |
| Sistema de Contenido | ~65%      | -       | ~35%      | 114   |
| Cross-Portal         | ~75%      | -       | ~25%      | 70    |
| **Aula Viva WS**     | **100%**  | -       | **0%**    | 37    |

---

## Criterios de Priorización

### Por Impacto de Negocio

- **P0 CRÍTICO**: Bloquea funcionalidad core, usuarios no pueden operar
- **P1 ALTO**: Funcionalidad importante, afecta experiencia significativamente
- **P2 MEDIO**: Mejoras de UX, features secundarias
- **P3 BAJO**: Nice to have, optimizaciones

### Por Complejidad

- **🟢 FÁCIL**: <1 hora, 1-2 archivos, sin dependencias
- **🟡 MEDIO**: 1-4 horas, 2-5 archivos, dependencias menores
- **🔴 DIFÍCIL**: >4 horas, múltiples archivos, requiere diseño

### Por Dependencias

- **🔓 INDEPENDIENTE**: Puede hacerse en cualquier momento
- **🔗 TIENE DEPS**: Requiere que otros items se completen primero

---

## FASE 0: QUICK WINS (Sin dependencias, fácil implementación)

Empezamos con los items que dan resultados rápidos sin riesgo.

### 0.1 Mostrar casa real del estudiante

| Campo            | Valor                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| **Prioridad**    | P1                                                                        |
| **Complejidad**  | 🟢 FÁCIL                                                                  |
| **Dependencias** | 🔓 Ninguna                                                                |
| **Archivos**     | `apps/web/src/app/estudiante/page.tsx`                                    |
| **Descripción**  | Dashboard tiene hardcodeado "Casa Pulsar". Mostrar casa real del JWT/API. |

**Pasos**:

1. [ ] Obtener `casaId` del estudiante desde el store o endpoint `/estudiantes/me`
2. [ ] Reemplazar string hardcodeado por nombre/color de la casa real
3. [ ] Verificar en browser con estudiantes de distintas casas

---

### 0.2 Casa → Theme en Portal Estudiante

| Campo            | Valor                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| **Prioridad**    | P2                                                                            |
| **Complejidad**  | 🟢 FÁCIL                                                                      |
| **Dependencias** | 🔓 Ninguna (se puede hacer paralelo a 0.1)                                    |
| **Archivos**     | `layout.tsx`, nuevo CSS de temas                                              |
| **Descripción**  | Aplicar CSS variables según casa (QUANTUM=cyan, VERTEX=magenta, PULSAR=amber) |

**Pasos**:

1. [ ] Crear `apps/web/src/styles/casa-themes.css` con variables por casa
2. [ ] Crear hook `useEstudianteCasaTheme.ts` que retorne la casa
3. [ ] Aplicar `data-casa` attribute en layout estudiante
4. [ ] Verificar visualmente en cada casa

---

### 0.3 Componente UI Ranking por Casa

| Campo            | Valor                                                         |
| ---------------- | ------------------------------------------------------------- |
| **Prioridad**    | P2                                                            |
| **Complejidad**  | 🟢 FÁCIL                                                      |
| **Dependencias** | 🔓 Ninguna                                                    |
| **Archivos**     | Nuevos componentes en `components/estudiante/gamificacion/`   |
| **Descripción**  | Backend calcula ranking pero no hay UI. Crear RankingCasa.tsx |

**Pasos**:

1. [ ] Verificar endpoint `GET /gamificacion/ranking/:casa` funciona
2. [ ] Crear hook `useRankingCasa`
3. [ ] Implementar `RankingCasa.tsx` con glassmorphism
4. [ ] Integrar en dashboard estudiante

---

### 0.4 Marcar notificación como leída (Docente)

| Campo            | Valor                                                                |
| ---------------- | -------------------------------------------------------------------- |
| **Prioridad**    | P2                                                                   |
| **Complejidad**  | 🟢 FÁCIL                                                             |
| **Dependencias** | 🔓 Ninguna                                                           |
| **Archivos**     | `NotificationsDropdown.tsx`                                          |
| **Descripción**  | Endpoint existe `PATCH /notificaciones/:id/leer` pero UI no lo llama |

**Pasos**:

1. [ ] Agregar onClick al item de notificación que llame al endpoint
2. [ ] Actualizar estado visual (quitar badge de "nueva")
3. [ ] Agregar botón "Marcar todas como leídas"

---

### 0.5 Resolver alertas en Dashboard Admin

| Campo            | Valor                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Prioridad**    | P2                                                           |
| **Complejidad**  | 🟢 FÁCIL                                                     |
| **Dependencias** | 🔓 Ninguna                                                   |
| **Archivos**     | `AlertsPanel.tsx`                                            |
| **Descripción**  | Endpoint `PATCH /admin/alertas/:id` existe pero no hay botón |

**Pasos**:

1. [ ] Agregar botón "Resolver" en cada alerta
2. [ ] Llamar endpoint al click
3. [ ] Actualizar lista (invalidar query)

---

### 0.6 Exportar inscripciones CSV/PDF con filtros

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Prioridad**    | P2                                               |
| **Complejidad**  | 🟢 FÁCIL                                         |
| **Dependencias** | 🔓 Ninguna                                       |
| **Archivos**     | `ReportsPanel.tsx`                               |
| **Descripción**  | Endpoints soportan filtros pero UI no los expone |

**Pasos**:

1. [ ] Agregar selector de período (mes/año)
2. [ ] Agregar selector de estado
3. [ ] Pasar params a los endpoints de export

---

## FASE 1: BUGS CRÍTICOS (P0)

### 1.1 Fix: Docente no ve inscripciones de tutor

| Campo            | Valor                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| **Prioridad**    | P0 CRÍTICO                                                              |
| **Complejidad**  | 🟡 MEDIO                                                                |
| **Dependencias** | 🔓 Ninguna                                                              |
| **Archivos**     | `docente-comision-queries.service.ts`                                   |
| **Descripción**  | Servicio lee de `inscripciones_comision` en vez de usar vista unificada |

**Pasos**:

1. [ ] Auditar métodos que leen inscripciones
2. [ ] Reemplazar queries por `inscripciones_unificadas`
3. [ ] Agregar campo `fuente` para distinguir
4. [ ] Test de integración
5. [ ] Verificar en browser

---

### 1.2 Tracking de tiempo en contenidos

| Campo            | Valor                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Prioridad**    | P0 CRÍTICO                                                         |
| **Complejidad**  | 🟡 MEDIO                                                           |
| **Dependencias** | 🔓 Ninguna                                                         |
| **Archivos**     | `LeccionPage` o equivalente en portal estudiante                   |
| **Descripción**  | Backend acepta `tiempoAdicionalSegundos` pero frontend NO lo envía |

**Pasos**:

1. [ ] Implementar timer que cuenta segundos en lección
2. [ ] Pausar timer si pestaña pierde foco (Page Visibility API)
3. [ ] Enviar tiempo acumulado en `updateProgresoEstudiante()`
4. [ ] Verificar que se guarda en BD

---

## FASE 2: SISTEMA DE NOTIFICACIONES (P0-P1)

El sistema de notificaciones tiene solo 40% funcional y es crítico.

### 2.1 Extender NotificacionesService para Tutores

| Campo            | Valor                                                                |
| ---------------- | -------------------------------------------------------------------- |
| **Prioridad**    | P1 ALTO                                                              |
| **Complejidad**  | 🟡 MEDIO                                                             |
| **Dependencias** | 🔓 Ninguna                                                           |
| **Archivos**     | Schema Prisma, NotificacionesService, endpoints                      |
| **Descripción**  | Actualmente solo soporta docentes. Tutores no tienen notificaciones. |

**Pasos**:

1. [ ] Agregar `tutor_id` al modelo Notificacion
2. [ ] Crear migración
3. [ ] Modificar `NotificacionesService.crear()` para aceptar `tutor_id`
4. [ ] Crear endpoints en TutorController
5. [ ] Crear hook `useTutorNotificaciones`
6. [ ] Agregar badge en sidebar tutor

---

### 2.2 Crear endpoints de notificaciones para Estudiantes

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Prioridad**    | P1 ALTO                                          |
| **Complejidad**  | 🟡 MEDIO                                         |
| **Dependencias** | 🔗 Depende de 2.1 (patrón similar)               |
| **Archivos**     | Schema Prisma, endpoints estudiante              |
| **Descripción**  | Estudiantes no tienen endpoint de notificaciones |

**Pasos**:

1. [ ] Agregar `estudiante_id` al modelo Notificacion (o tabla separada)
2. [ ] Crear migración
3. [ ] Crear endpoints en EstudianteController
4. [ ] Crear hook y UI

---

### 2.3 Cron Job: Notificar Clase Próxima (24h)

| Campo            | Valor                                                          |
| ---------------- | -------------------------------------------------------------- |
| **Prioridad**    | P1 ALTO                                                        |
| **Complejidad**  | 🟡 MEDIO                                                       |
| **Dependencias** | 🔗 Depende de 2.1 y 2.2 (para notificar a tutores/estudiantes) |
| **Archivos**     | Nuevo job en `scheduler/jobs/`                                 |
| **Descripción**  | Método `notificarClaseProxima()` existe pero no hay cron       |

**Pasos**:

1. [ ] Crear `ClaseProximaNotificationJob`
2. [ ] Registrar en SchedulerModule
3. [ ] Query "clases en próximas 24h"
4. [ ] Notificar estudiantes, tutores y docente
5. [ ] Tests con fecha mockeada

---

### 2.4 Event Listeners para cambios de Suscripción

| Campo            | Valor                                             |
| ---------------- | ------------------------------------------------- |
| **Prioridad**    | P0 CRÍTICO                                        |
| **Complejidad**  | 🟡 MEDIO                                          |
| **Dependencias** | 🔗 Depende de 2.1 (para notificar tutores)        |
| **Archivos**     | Nuevos listeners en `suscripciones/listeners/`    |
| **Descripción**  | Eventos existen pero no se propagan a interesados |

**Pasos**:

1. [ ] Crear `suscripcion-tutor.listener.ts`
2. [ ] Crear `suscripcion-docente.listener.ts`
3. [ ] Escuchar eventos y crear notificaciones
4. [ ] Tests

---

## FASE 3: PORTAL ADMIN - UI FALTANTES (P1-P2)

### 3.1 CRUD de ClaseGrupos (Horarios de Clubs)

| Campo            | Valor                                                 |
| ---------------- | ----------------------------------------------------- |
| **Prioridad**    | P1 ALTO                                               |
| **Complejidad**  | 🟡 MEDIO                                              |
| **Dependencias** | 🔓 Ninguna                                            |
| **Archivos**     | `ClaseGruposSection.tsx` (actualmente solo lectura)   |
| **Descripción**  | Backend tiene CRUD completo, frontend es solo lectura |

**Pasos**:

1. [ ] Agregar modal `ClaseGrupoFormModal` para crear/editar
2. [ ] Conectar botones crear/editar/eliminar
3. [ ] Validar formulario (hora, día, docente)
4. [ ] Test funcional

---

### 3.2 UI Admin para pausar/cancelar Suscripciones

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **Prioridad**    | P1 ALTO                                       |
| **Complejidad**  | 🟢 FÁCIL                                      |
| **Dependencias** | 🔓 Ninguna                                    |
| **Archivos**     | `SuscripcionDetailModal.tsx`                  |
| **Descripción**  | Endpoints existen, no hay botones en UI admin |

**Pasos**:

1. [ ] Agregar botón "Pausar" con confirmación
2. [ ] Agregar botón "Cancelar" con confirmación
3. [ ] Agregar selector de motivo

---

### 3.3 UI Admin para cambiar tier de inscripción

| Campo            | Valor                                           |
| ---------------- | ----------------------------------------------- |
| **Prioridad**    | P1 ALTO                                         |
| **Complejidad**  | 🟢 FÁCIL                                        |
| **Dependencias** | 🔓 Ninguna                                      |
| **Archivos**     | `SuscripcionDetailModal.tsx`                    |
| **Descripción**  | Endpoint `PATCH /inscripciones/:id/tier` existe |

**Pasos**:

1. [ ] Agregar dropdown de tier en cada inscripción listada
2. [ ] Llamar endpoint al cambiar
3. [ ] Mostrar nuevo monto calculado

---

### 3.4 Dashboard de Monitoring (Webhooks/DLQ)

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| **Prioridad**    | P2 MEDIO                                     |
| **Complejidad**  | 🔴 DIFÍCIL                                   |
| **Dependencias** | 🔓 Ninguna                                   |
| **Archivos**     | Nueva página `/admin/monitoring/`            |
| **Descripción**  | Backend tiene sistema completo de DLQ sin UI |

**Pasos**:

1. [ ] Crear página `/admin/monitoring`
2. [ ] Componente `WebhookDLQTable` con lista de fallidos
3. [ ] Botones "Reprocesar" y "Resolver"
4. [ ] Stats de cola (healthy/degraded)
5. [ ] Métricas de jobs procesados

---

### 3.5 Dashboard de Audit Logs

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| **Prioridad**    | P2 MEDIO                                     |
| **Complejidad**  | 🔴 DIFÍCIL                                   |
| **Dependencias** | 🔓 Ninguna                                   |
| **Archivos**     | Nueva página `/admin/auditoria/`             |
| **Descripción**  | Logs se registran pero no hay UI para verlos |

**Pasos**:

1. [ ] Crear endpoints de lectura de audit logs
2. [ ] Crear página con tabla filtrable
3. [ ] Filtros por categoría, severidad, usuario, fecha
4. [ ] Detalle expandible con cambios (before/after)

---

### 3.6 UI para configurar MFA (Admin)

| Campo            | Valor                           |
| ---------------- | ------------------------------- |
| **Prioridad**    | P2 MEDIO                        |
| **Complejidad**  | 🟡 MEDIO                        |
| **Dependencias** | 🔓 Ninguna                      |
| **Archivos**     | Nueva sección en perfil admin   |
| **Descripción**  | Backend MFA completo, no hay UI |

**Pasos**:

1. [ ] Crear página/modal de configuración MFA
2. [ ] Mostrar QR code para app authenticator
3. [ ] Input para verificar código
4. [ ] Mostrar backup codes al habilitar
5. [ ] Botón para deshabilitar MFA

---

## FASE 4: PORTAL DOCENTE (P1-P2)

### 4.1 Recuperación de contraseña Docente

| Campo            | Valor                                        |
| ---------------- | -------------------------------------------- |
| **Prioridad**    | P0 CRÍTICO                                   |
| **Complejidad**  | 🟡 MEDIO                                     |
| **Dependencias** | 🔓 Ninguna                                   |
| **Archivos**     | Página `/forgot-password`, backend ya existe |
| **Descripción**  | No hay flujo de recuperación de contraseña   |

**Pasos**:

1. [ ] Crear página `/forgot-password`
2. [ ] Conectar con endpoint `POST /auth/forgot-password`
3. [ ] Crear página `/reset-password` con token
4. [ ] Estilizar emails

---

### 4.2 Compartir pantalla en clases en vivo

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **Prioridad**    | P2 MEDIO                                       |
| **Complejidad**  | 🟢 FÁCIL                                       |
| **Dependencias** | 🔓 Ninguna                                     |
| **Archivos**     | `ControlBar.tsx` en clase en vivo              |
| **Descripción**  | LiveKit soporta screen share pero no hay botón |

**Pasos**:

1. [ ] Agregar botón de screen share en ControlBar
2. [ ] Usar `localParticipant.setScreenShareEnabled(true)`
3. [ ] Mostrar indicador de compartiendo

---

### ~~4.3 Historial detallado de asistencia~~ ✅ COMPLETADO

| Campo            | Valor                                 |
| ---------------- | ------------------------------------- |
| **Prioridad**    | P2 MEDIO                              |
| **Complejidad**  | 🟡 MEDIO                              |
| **Dependencias** | 🔓 Ninguna                            |
| **Archivos**     | `StudentList.tsx` tab Asistencia      |
| **Descripción**  | Historial integrado en vista de grupo |

> **IMPLEMENTADO (2026-01-20)**: El historial de asistencia se integró dentro de la vista de detalle de grupo (Mis Grupos → seleccionar grupo → tab Asistencia → Ver Historial). Muestra asistencias agrupadas por fecha con indicadores visuales de presente/ausente/justificado.

---

### ~~4.4 Reportes gráficos de asistencia~~ ✅ COMPLETADO

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Prioridad**    | P2 MEDIO                                         |
| **Complejidad**  | 🟡 MEDIO                                         |
| **Dependencias** | 🔗 Depende de 4.3 (misma página)                 |
| **Archivos**     | `StudentList.tsx` tab Asistencia                 |
| **Descripción**  | Gráficos de tendencia en historial de asistencia |

> **IMPLEMENTADO (2026-01-20)**: El historial de asistencia incluye estadísticas por fecha con porcentaje de asistencia, indicadores visuales de presentes/ausentes, y un resumen numérico. Se accede desde Mis Grupos → grupo → tab Asistencia → Ver Historial.

---

### ~~4.5 Historial de puntos otorgados~~ ✅ COMPLETADO

| Campo            | Valor                                                |
| ---------------- | ---------------------------------------------------- |
| **Prioridad**    | P2 MEDIO                                             |
| **Complejidad**  | 🟢 FÁCIL                                             |
| **Dependencias** | 🔓 Ninguna                                           |
| **Archivos**     | `StudentList.tsx` nuevo tab Puntos, endpoint backend |
| **Descripción**  | Historial de XP otorgados por comisión               |

> **IMPLEMENTADO (2026-01-20)**: Se agregó un nuevo tab "Puntos" en la vista de detalle de grupo que muestra:
>
> - Total XP otorgados en la comisión
> - Gráfico de barras de XP por tipo de acción
> - Historial de los últimos 20 puntos otorgados con estudiante, tipo, contexto y fecha
> - Nuevo endpoint `GET /docentes/me/comisiones/:id/historial-puntos`

---

### ~~4.6 Endpoint para calificar tareas~~ ❌ ELIMINADO

> **DECISIÓN (2026-01-20)**: Todo el contenido debe ser autocorregible por software.
> Los docentes no deben calificar manualmente - eso no escala y genera costos adicionales.
> Ver FASE 9.4 para asegurar que todo el contenido sea autocorregible.

---

## FASE 5: PORTAL TUTOR (P1-P2)

### 5.1 Recuperación de contraseña Tutor

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **Prioridad**    | P0 CRÍTICO                             |
| **Complejidad**  | 🟡 MEDIO                               |
| **Dependencias** | 🔗 Puede compartir con 4.1             |
| **Archivos**     | Página `/forgot-password` (compartida) |
| **Descripción**  | Mismo problema que docente             |

---

### 5.2 Editar datos de estudiante desde portal tutor

| Campo            | Valor                                  |
| ---------------- | -------------------------------------- |
| **Prioridad**    | P2 MEDIO                               |
| **Complejidad**  | 🟢 FÁCIL                               |
| **Dependencias** | 🔓 Ninguna                             |
| **Archivos**     | `HijoDetalleModal.tsx`, nuevo endpoint |
| **Descripción**  | Solo admin puede editar estudiantes    |

**Pasos**:

1. [ ] Crear `PATCH /tutor/estudiantes/:id` (campos limitados)
2. [ ] Agregar botón "Editar" en HijoDetalleModal
3. [ ] Campos: nombre, apellido, fecha_nacimiento

---

### 5.3 Pausar suscripción desde portal tutor

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **Prioridad**    | P2 MEDIO                                |
| **Complejidad**  | 🟢 FÁCIL                                |
| **Dependencias** | 🔓 Ninguna                              |
| **Archivos**     | `/tutor/suscripcion/gestionar/page.tsx` |
| **Descripción**  | Modelo soporta PAUSED pero no hay UI    |

**Pasos**:

1. [ ] Agregar botón "Pausar suscripción"
2. [ ] Crear endpoint `POST /suscripciones/familiar/pausar`
3. [ ] Mostrar fecha de reactivación estimada

---

### 5.4 UI para cambiar horario de inscripción

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **Prioridad**    | P2 MEDIO                                |
| **Complejidad**  | 🟡 MEDIO                                |
| **Dependencias** | 🔓 Ninguna                              |
| **Archivos**     | `InscripcionCard.tsx`                   |
| **Descripción**  | Endpoint existe pero no hay UI amigable |

**Pasos**:

1. [ ] Agregar botón "Cambiar horario"
2. [ ] Modal con horarios disponibles del mismo producto
3. [ ] Indicar que aplica desde próximo mes

---

### 5.5 Flujo de compra de eventos/cursos temporales

| Campo            | Valor                                    |
| ---------------- | ---------------------------------------- |
| **Prioridad**    | P2 MEDIO                                 |
| **Complejidad**  | 🔴 DIFÍCIL                               |
| **Dependencias** | 🔓 Ninguna pero es complejo              |
| **Archivos**     | Múltiples archivos nuevos                |
| **Descripción**  | Modelo existe pero no hay flujo completo |

**Pasos**:

1. [ ] Crear vista `/tutor/cursos` con productos Evento/Curso
2. [ ] Wizard de inscripción (diferente a suscripción)
3. [ ] Integración con pasarela de pago (único o cuotas)
4. [ ] Vista "Mis cursos" con estado de cuotas

---

## FASE 6: PORTAL ESTUDIANTE (P1-P2)

### 6.1 Recuperación de contraseña Estudiante

| Campo            | Valor                                     |
| ---------------- | ----------------------------------------- |
| **Prioridad**    | P1 ALTO                                   |
| **Complejidad**  | 🟢 FÁCIL                                  |
| **Dependencias** | 🔓 Ninguna                                |
| **Archivos**     | Página específica o link a tutor          |
| **Descripción**  | Crear link que envíe al tutor a gestionar |

**Pasos**:

1. [ ] Agregar mensaje "¿Olvidaste tu contraseña? Contacta a tu tutor"
2. [ ] O crear flujo simplificado vía tutor

---

### 6.2 Restricción por tier (MODELO 2026)

| Campo            | Valor                                    |
| ---------------- | ---------------------------------------- |
| **Prioridad**    | P1 ALTO                                  |
| **Complejidad**  | 🔴 DIFÍCIL                               |
| **Dependencias** | 🔓 Ninguna                               |
| **Archivos**     | Múltiples en portal estudiante           |
| **Descripción**  | Todos ven todo, no se restringe por tier |

**Pasos**:

1. [ ] STEAM_LIBROS: Solo material descargable
2. [ ] STEAM_ASINCRONICO: Videos + material
3. [ ] STEAM_SINCRONICO: Todo + clases en vivo
4. [ ] Endpoint que valide tier antes de mostrar contenido
5. [ ] Frontend que oculte/deshabilite según tier

---

### 6.3 Animación de logro desbloqueado

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **Prioridad**    | P2 MEDIO                                |
| **Complejidad**  | 🟡 MEDIO                                |
| **Dependencias** | 🔗 Requiere WebSocket/SSE               |
| **Archivos**     | Nuevo sistema de eventos tiempo real    |
| **Descripción**  | Evento existe pero no hay toast animado |

**Pasos**:

1. [ ] Implementar WebSocket/SSE para eventos tiempo real
2. [ ] Toast/modal animado al desbloquear logro
3. [ ] Sonido de celebración (opcional)

---

### 6.4 Intent de juegos Phaser

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **Prioridad**    | P2 MEDIO                                   |
| **Complejidad**  | 🔴 DIFÍCIL                                 |
| **Dependencias** | 🔓 Ninguna                                 |
| **Archivos**     | lesson-engine + game-engine                |
| **Descripción**  | Intent `gamification:game` no implementado |

**Pasos**:

1. [ ] Crear intent `gamification:game`
2. [ ] Recibir config del juego
3. [ ] Renderizar GameRunner de game-engine
4. [ ] Capturar resultado como progreso

---

## FASE 7: SISTEMA DE MENSAJERÍA (P0)

### 7.1 Sistema de Mensajería Tutor ↔ Docente

| Campo            | Valor                                                            |
| ---------------- | ---------------------------------------------------------------- |
| **Prioridad**    | P0 CRÍTICO                                                       |
| **Complejidad**  | 🔴 DIFÍCIL                                                       |
| **Dependencias** | 🔓 Ninguna                                                       |
| **Archivos**     | Muchos archivos nuevos (ver PLAN_IMPLEMENTACION_CROSS_PORTAL.md) |
| **Descripción**  | No existe canal de comunicación entre tutores y docentes         |

**Pasos detallados en PLAN_IMPLEMENTACION_CROSS_PORTAL.md sección 1.2**

---

### 7.2 Sistema de Anuncios Docente → Grupo

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Prioridad**    | P1 ALTO                                          |
| **Complejidad**  | 🔴 DIFÍCIL                                       |
| **Dependencias** | 🔓 Ninguna                                       |
| **Archivos**     | Nuevos (ver PLAN_IMPLEMENTACION_CROSS_PORTAL.md) |
| **Descripción**  | Docente no puede publicar mensajes a su grupo    |

**Pasos detallados en PLAN_IMPLEMENTACION_CROSS_PORTAL.md sección 2.4**

---

## FASE 8: MERCADOPAGO (P1-P2)

### 8.1 Endpoint reactivar suscripción (Admin)

| Campo            | Valor                                           |
| ---------------- | ----------------------------------------------- |
| **Prioridad**    | P1 ALTO                                         |
| **Complejidad**  | 🟡 MEDIO                                        |
| **Dependencias** | 🔓 Ninguna                                      |
| **Archivos**     | Nuevo service + endpoint                        |
| **Descripción**  | No hay forma de reactivar suscripción cancelada |

**Nota**: MercadoPago PreApproval cancelado NO puede reactivarse. Se crea una NUEVA.

**Pasos detallados en PLAN_IMPLEMENTACION_CROSS_PORTAL.md sección 2.2**

---

### 8.2 Notificación de Grace Period

| Campo            | Valor                                                        |
| ---------------- | ------------------------------------------------------------ |
| **Prioridad**    | P1 ALTO                                                      |
| **Complejidad**  | 🟢 FÁCIL                                                     |
| **Dependencias** | 🔗 Depende de 2.1 (notificaciones tutor)                     |
| **Archivos**     | Listener de eventos, email service                           |
| **Descripción**  | Evento `SuscripcionEnGraciaEvent` existe pero no envía email |

**Pasos**:

1. [ ] Crear listener para `SuscripcionEnGraciaEvent`
2. [ ] Enviar email "Tienes 3 días para regularizar tu pago"
3. [ ] Crear notificación in-app

---

### 8.3 UI para baja de inscripciones desde tutor

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **Prioridad**    | P2 MEDIO                                   |
| **Complejidad**  | 🟢 FÁCIL                                   |
| **Dependencias** | 🔓 Ninguna                                 |
| **Archivos**     | `GestionarSuscripcionPage.tsx`             |
| **Descripción**  | Endpoint existe pero no hay botón amigable |

**Pasos**:

1. [ ] Agregar botón "Dar de baja" en cada inscripción
2. [ ] Modal de confirmación con motivo
3. [ ] Mostrar nuevo monto calculado antes de confirmar

---

## FASE 9: CONTENIDO EDUCATIVO (P2)

### 9.1 Lista de contenidos con filtros (Admin)

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Prioridad**    | P2 MEDIO                           |
| **Complejidad**  | 🟡 MEDIO                           |
| **Dependencias** | 🔓 Ninguna                         |
| **Archivos**     | Nuevos componentes en admin        |
| **Descripción**  | Solo Sandbox, no hay lista/filtros |

**Pasos**:

1. [ ] Crear página `/admin/contenidos/lista`
2. [ ] Tabla con filtros (casa, mundo, estado, tipo)
3. [ ] Botones de publicar/archivar inline

---

### 9.2 Progreso automático de estudiantes

| Campo            | Valor                                                      |
| ---------------- | ---------------------------------------------------------- |
| **Prioridad**    | P2 MEDIO                                                   |
| **Complejidad**  | 🟡 MEDIO                                                   |
| **Dependencias** | 🔗 Depende de 1.2 (tracking de tiempo)                     |
| **Archivos**     | Componentes de portal estudiante                           |
| **Descripción**  | Estudiantes no trackean tiempo/nodo actual automáticamente |

**Pasos**:

1. [ ] Al navegar slides, guardar `nodoActualId`
2. [ ] Al completar contenido, marcar `completado`
3. [ ] Mostrar barra de progreso visual

---

### 9.3 Drag & drop para reordenar nodos

| Campo            | Valor                                     |
| ---------------- | ----------------------------------------- |
| **Prioridad**    | P3 BAJO                                   |
| **Complejidad**  | 🟡 MEDIO                                  |
| **Dependencias** | 🔓 Ninguna                                |
| **Archivos**     | `TreePanel.tsx`                           |
| **Descripción**  | Endpoints existen pero no hay drag & drop |

**Pasos**:

1. [ ] Integrar librería de drag & drop (dnd-kit)
2. [ ] Llamar endpoint `reordenar()` al soltar
3. [ ] Llamar endpoint `moverNodo()` al cambiar padre

---

### 9.4 Asegurar TODO el contenido sea autocorregible

| Campo            | Valor                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **Prioridad**    | P1 ALTO                                                                      |
| **Complejidad**  | 🔴 DIFÍCIL                                                                   |
| **Dependencias** | 🔓 Ninguna                                                                   |
| **Archivos**     | `lesson-engine/intents/`, validadores, sandbox                               |
| **Descripción**  | Eliminar necesidad de calificación manual - todo debe validarse por software |

> **DECISIÓN DE NEGOCIO**: Los docentes NO califican. Todo se autocorrige.
> Si un profe tiene que corregir, cobra más. No escala.

**Tipos de contenido y cómo autocorregirlos**:

| Tipo de Contenido         | Intent Actual     | ¿Autocorregible? | Acción Necesaria                       |
| ------------------------- | ----------------- | ---------------- | -------------------------------------- |
| Quiz Multiple Choice      | `QuizMCIntent`    | ✅ SÍ            | Ninguna                                |
| Quiz Verdadero/Falso      | `QuizTFIntent`    | ✅ SÍ            | Ninguna                                |
| Emparejar (Matching)      | `MatchingIntent`  | ✅ SÍ            | Ninguna                                |
| Ordenar (Sorting)         | `SortingIntent`   | ✅ SÍ            | Ninguna                                |
| Drag & Drop               | `DragDropIntent`  | ✅ SÍ            | Ninguna                                |
| Completar espacios        | `FillBlankIntent` | ✅ SÍ            | Ninguna                                |
| Minijuegos Phaser         | `GameIntent`      | ✅ SÍ            | Score automático                       |
| **Respuesta corta/texto** | ❌ No existe      | ⚠️ PARCIAL       | Crear `ShortAnswerIntent` con keywords |
| **Proyectos creativos**   | ❌ No existe      | ⚠️ PARCIAL       | Crear `ChecklistIntent` con criterios  |
| **Código/Programación**   | ❌ No existe      | ⚠️ PARCIAL       | Crear `CodeValidatorIntent` con tests  |

**Pasos para contenido que HOY requiere calificación manual**:

1. [ ] **ShortAnswerIntent**: Respuestas cortas validadas por keywords/regex
   - Config: `{ keywords: ["variable", "almacenar"], minKeywords: 2 }`
   - Valida que la respuesta contenga las palabras clave
   - Tolerancia a typos con distancia Levenshtein

2. [ ] **ChecklistIntent**: Proyectos creativos con criterios objetivos
   - Config: `{ criterios: ["Tiene título", "Usa 3 colores", "Tiene animación"] }`
   - Estudiante marca checkboxes de lo que cumplió
   - Sistema valida mínimo de criterios cumplidos

3. [ ] **CodeValidatorIntent**: Código validado por tests automáticos
   - Config: `{ language: "scratch", tests: [...] }`
   - Ejecuta código en sandbox seguro
   - Valida output esperado vs output real

4. [ ] **PeerReviewIntent** (opcional): Revisión entre pares
   - Estudiantes califican trabajo de compañeros
   - Promedio de N reviews = calificación final
   - Docente NO interviene

5. [ ] **RubricIntent**: Rúbrica de autoevaluación
   - Estudiante se autoevalúa con criterios objetivos
   - Sistema asigna puntos según respuestas
   - Gamificación: bonus por honestidad si coincide con métricas

**Validación del Sandbox**:

6. [ ] Auditar TODOS los contenidos existentes en sandbox
7. [ ] Identificar cuáles requieren calificación manual
8. [ ] Migrar/convertir a intents autocorregibles
9. [ ] Eliminar campo `calificacion` manual del flujo de docente

---

## Checklist de Progreso General

### FASE 0: Quick Wins ✅ COMPLETADA

- [x] 0.1 Mostrar casa real del estudiante ✅ (2026-01-19)
- [x] 0.2 Casa → Theme en Portal Estudiante ✅ (2026-01-19)
- [x] 0.3 Componente UI Ranking por Casa ✅ (2026-01-19)
- [x] 0.4 Marcar notificación como leída (Docente) ✅ (2026-01-19)
- [x] 0.5 Resolver alertas en Dashboard Admin ✅ (2026-01-19)
- [x] 0.6 Exportar CSV/PDF con filtros ✅ (2026-01-19)

### FASE 1: Bugs Críticos

- [x] 1.1 Fix: Docente no ve inscripciones de tutor ✅ (2026-01-19)
- [x] 1.2 Tracking de tiempo en contenidos ✅ (2026-01-19)

### FASE 2: Sistema de Notificaciones ✅ COMPLETADA

- [x] 2.1 Extender NotificacionesService para Tutores ✅ (2026-01-19)
- [x] 2.2 Endpoints de notificaciones para Estudiantes ✅ (2026-01-19)
- [x] 2.3 Cron Job: Notificar Clase Próxima ✅ (2026-01-19)
- [x] 2.4 Event Listeners para cambios de Suscripción ✅ (2026-01-19)
- [x] Tests de integración (131 tests passing) ✅ (2026-01-19)

### FASE 3: Portal Admin

- [x] 3.1 CRUD de ClaseGrupos ✅ (2026-01-20)
- [x] 3.2 UI pausar/cancelar Suscripciones ✅ (2026-01-20)
- [x] 3.3 UI cambiar tier de inscripción ✅ (2026-01-20)
- [x] 3.7 Dashboard refactor: 5 tabs con glassmorphism ✅ (2026-01-20)
- [x] 3.8 Dashboard: tiempoPromedioMinutos endpoint ✅ (2026-01-20)
- [x] 3.9 Dashboard: crecimientoMensual calculado real ✅ (2026-01-20)
- [ ] 3.4 Dashboard de Monitoring (DLQ) ⏸️ DIFERIDO
- [ ] 3.5 Dashboard de Audit Logs ⏸️ DIFERIDO
- [ ] 3.6 UI para configurar MFA ⏸️ DIFERIDO

> **Nota**: Items 3.4-3.6 diferidos para priorizar fases de usuarios finales (4, 5, 6)

### FASE 4: Portal Docente

- [x] 4.1 Recuperación de contraseña ✅ (2026-01-20) - Compartido con Tutor
- [x] 4.2 Compartir pantalla ✅ (Ya implementado en ControlBar.tsx)
- [x] 4.3 Historial detallado de asistencia ✅
- [x] 4.4 Reportes gráficos de asistencia ✅
- [x] 4.5 Historial de puntos otorgados ✅
- [x] ~~4.6 Endpoint para calificar tareas~~ ❌ ELIMINADO (2026-01-20) - Todo debe ser autocorregible, ver 9.4

### FASE 5: Portal Tutor

- [x] 5.1 Recuperación de contraseña ✅ (2026-01-20) - Compartido con Docente
- [ ] 5.2 Editar datos de estudiante
- [x] 5.3 Pausar suscripción ✅ (2026-01-20) - Endpoints y UI para pausar/reactivar inscripciones individuales y suscripción completa
- [ ] 5.4 UI cambiar horario de inscripción
- [ ] 5.5 Flujo de eventos/cursos temporales

### FASE 6: Portal Estudiante

- [x] 6.1 Recuperación de contraseña ✅ (2026-01-20) - Mensaje: "Contactá a tu tutor"
- [x] 6.2 Restricción por tier (MODELO 2026) ✅ (Ya implementado) - Backend AccesoEstudianteService + Frontend lock visual
- [ ] 6.3 Animación de logro desbloqueado
- [ ] 6.4 Intent de juegos Phaser

### FASE 7: Mensajería

- [ ] 7.1 Sistema de Mensajería Tutor ↔ Docente
- [ ] 7.2 Sistema de Anuncios Docente → Grupo

### FASE 8: MercadoPago

- [ ] 8.1 Endpoint reactivar suscripción
- [ ] 8.2 Notificación de Grace Period
- [ ] 8.3 UI baja de inscripciones

### FASE 9: Contenido Educativo

- [ ] 9.1 Lista de contenidos con filtros
- [ ] 9.2 Progreso automático de estudiantes
- [ ] 9.3 Drag & drop para reordenar nodos
- [ ] 9.4 Asegurar TODO el contenido sea autocorregible (P1 ALTO)

### FASE 10: Aula Viva WebSocket ✅ COMPLETADA

> **37+ tests E2E passing** - Ver `docs/PREPROD_DOCENTE_ESTUDIANTE.md` para detalles

#### Sprint 1: Control de Clase ✅ (2026-01-21)

- [x] 10.1.1 Levantar la mano
- [x] 10.1.2 Control de moderación (mutear/expulsar)
- [x] 10.1.3 Indicador "está hablando"

#### Sprint 2: Interactividad ✅ (2026-01-21)

- [x] 10.2.1 Reacciones en tiempo real
- [x] 10.2.2 "¿Están siguiendo?" (pulso atención)
- [x] 10.2.3 Selector aleatorio de estudiante

#### Sprint 3: Gamificación Live ✅ (2026-01-22) - 20 E2E tests

- [x] 10.3.1 Quiz en vivo
- [x] 10.3.2 Contador compartido
- [x] 10.3.3 Notificación de puntos privada
- [x] 10.3.4 XP y logros en vivo
- [x] 10.3.5 Puntos de casa en vivo

#### Sprint 4: Contenido Sincronizado ✅ (2026-01-23) - 17 E2E tests

- [x] 10.4.1 Compartir Teoría (slides sincronizados)
- [x] 10.4.2 Práctica en Vivo (ejercicios sincronizados)
- [ ] ~~10.4.3 Analytics en Vivo~~ ⏸️ DIFERIDO

---

## Orden de Ejecución Recomendado

```
Día 1: FASE 0 (Quick Wins)
  └── 0.1, 0.3, 0.4, 0.5 (paralelo, independientes)
  └── 0.2 (después de 0.1)
  └── 0.6 (paralelo)

Día 2-3: FASE 1 + FASE 4.1/5.1 (Críticos)
  └── 1.1 Fix docente inscripciones
  └── 1.2 Tracking de tiempo
  └── 4.1/5.1 Recuperación de contraseña (compartido)

Día 4-6: FASE 2 (Notificaciones)
  └── 2.1 NotificacionesService tutores
  └── 2.2 Endpoints estudiantes
  └── 2.3 Cron clase próxima (después de 2.1+2.2)
  └── 2.4 Event listeners (después de 2.1)

Día 7-9: FASE 3 (Admin UI)
  └── 3.1 CRUD ClaseGrupos
  └── 3.2 + 3.3 (pausar/cancelar/tier)
  └── 3.4 + 3.5 (Dashboards, paralelo)

Día 10-12: FASE 4 + FASE 5 (Docente + Tutor)
  └── 4.2, 4.3, 4.4, 4.5, 4.6
  └── 5.2, 5.3, 5.4

Día 13-15: FASE 6 + FASE 8 (Estudiante + MercadoPago)
  └── 6.2 Restricción por tier
  └── 8.1, 8.2, 8.3

Semana 4+: FASE 7 + FASE 9 (Mensajería + Contenido)
  └── 7.1, 7.2 (sistemas complejos)
  └── 9.1, 9.2, 9.3
  └── 6.3, 6.4 (WebSocket, Phaser)
  └── 5.5 (Flujo cursos temporales)
```

---

## Bugs Resueltos (Portal Docente-Estudiante)

> Documentados en `docs/PREPROD_DOCENTE_ESTUDIANTE.md`

| Bug     | Descripción                                    | Fecha Resolución |
| ------- | ---------------------------------------------- | ---------------- |
| BUG-001 | Asignar Puntos: DTO mismatch frontend/backend  | 2026-01-21       |
| BUG-002 | Observaciones: endpoint no conectado           | 2026-01-21       |
| BUG-003 | Inconsistencia XP Otorgados vs Top Estudiantes | 2026-01-21       |

---

## Bugs Conocidos / A Investigar

### BUG-004: Inconsistencia de Tier en Estudiante Mateo Martínez

| Campo          | Valor                                |
| -------------- | ------------------------------------ |
| **Detectado**  | 2026-01-19                           |
| **Severidad**  | 🟡 MEDIA (no bloquea, pero confunde) |
| **Estudiante** | Mateo Martínez (Casa Vertex)         |
| **Estado**     | PENDIENTE DE INVESTIGACIÓN           |

**Síntomas observados**:

1. **Admin → Personas**: Muestra Vertex, **Asincrónico**, Activo ✅
2. **Portal Estudiante**: Acceso restringido (correcto para async) ✅
3. **Portal Tutor**: Muestra **Sincrónico** ❌ (debería ser Asincrónico)
4. **Admin → Suscripciones**: El estudiante **no aparece** en la lista ❌

**Posibles causas a investigar**:

- Discrepancia entre `inscripcionActividad.tier` y lo que se muestra en portal tutor
- Posible problema con la vista `inscripciones_unificadas` o cómo se consulta
- El estudiante podría tener múltiples inscripciones con tiers diferentes
- La suscripción familiar podría estar en estado que no se lista

**Archivos a revisar**:

- `apps/web/src/app/tutor/hijos/page.tsx` - donde muestra el tier
- `apps/api/src/tutor/services/tutor-hijos.service.ts` - lógica de query
- `apps/api/prisma/migrations/*inscripciones_unificadas*` - vista SQL
- Queries de suscripciones familiares en admin

**Notas**:

- Este bug se detectó durante la implementación de Quick Wins 0.1 + 0.2
- Puede resolverse naturalmente al implementar FASE 1.1 (unificar inscripciones)
- NO resolver ahora - priorizar otras tareas y revisitar después

---

## Historial de Cambios

| Fecha      | Cambio                                                                                                        | Autor  |
| ---------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| 2026-01-19 | Creación inicial del documento                                                                                | Claude |
| 2026-01-19 | ✅ Completados Quick Wins 0.1 + 0.2                                                                           | Claude |
| 2026-01-19 | 📝 Documentado BUG-004 (tier inconsistente - renumerado)                                                      | Claude |
| 2026-01-20 | ✅ FASE 3.1: CRUD completo de ClaseGrupos (crear, editar, soft delete, hard delete)                           | Claude |
| 2026-01-20 | ✅ Planificación override por Comisión (Evento/Taller)                                                        | Claude |
| 2026-01-20 | ✅ VentasSection para productos Físico/Digital                                                                | Claude |
| 2026-01-20 | ✅ FASE 3.2+3.3: Admin pausar/reactivar/cancelar suscripciones + cambiar tier                                 | Claude |
| 2026-01-20 | ✅ Tests de integración BBT (28 tests) para endpoints admin suscripciones                                     | Claude |
| 2026-01-20 | ✅ Dashboard Admin refactor: 5 tabs (Resumen, Estudiantes, Finanzas, Retención, Contenido) con glassmorphism  | Claude |
| 2026-01-20 | ✅ Eliminados TODOS los mocks del dashboard - datos reales del backend                                        | Claude |
| 2026-01-20 | ✅ Endpoint tiempoPromedioMinutos en admin-stats.service.ts                                                   | Claude |
| 2026-01-20 | ✅ crecimientoMensual calculado desde retention data (no hardcodeado)                                         | Claude |
| 2026-01-20 | ✅ FASE 4.1+5.1+6.1: Recuperación de contraseña - páginas /forgot-password y /reset-password                  | Claude |
| 2026-01-20 | ✅ FASE 5.3: Pausar suscripción - Endpoints y UI granular para pausar/reactivar inscripciones o suscripción   | Claude |
| 2026-01-23 | ✅ Fix: Tests E2E Sprint 3.2 Contador Compartido - CUIDs corregidos a 25 chars, validadores movidos a handler | Claude |
| 2026-01-23 | ✅ FASE 10: Aula Viva WebSocket completa - Sprint 1-4 con 37+ E2E tests                                       | Claude |
| 2026-01-23 | ✅ Sprint 4: Teoría Sincronizada y Práctica en Vivo (17 tests)                                                | Claude |
