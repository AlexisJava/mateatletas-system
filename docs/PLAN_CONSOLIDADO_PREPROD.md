# Plan Consolidado Pre-Producción 2026

> **Estado**: CASI COMPLETO (~95%)
> **Fecha**: 2026-01-27 (actualizado)
> **Basado en**: AUDITORIA_PREPROD_2026.md + PLAN_IMPLEMENTACION_CROSS_PORTAL.md
> **Branch sugerido**: `feat/preprod-fixes`

---

## Resumen Ejecutivo

Este documento consolida TODOS los items pendientes de las auditorías individuales y cross-portal en un solo plan de acción ordenado estratégicamente.

### Estadísticas Globales (Actualizado 2026-01-27)

| Portal/Sistema       | Funcional | Parcial | Pendiente | Total |
| -------------------- | --------- | ------- | --------- | ----- |
| Portal Estudiante    | ~90%      | -       | ~10%      | ~30   |
| Portal Tutor         | **100%**  | -       | **0%**    | 29    |
| Portal Docente       | **100%**  | -       | **0%**    | 66    |
| Portal Admin         | **100%**  | -       | **0%**    | 152   |
| Notificaciones       | **100%**  | -       | **0%**    | 48    |
| MercadoPago 2026     | **100%**  | -       | **0%**    | 112   |
| Sistema de Contenido | **100%**  | -       | **0%**    | 114   |
| Cross-Portal         | ~95%      | -       | ~5%       | 70    |
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

### ~~5.5 Flujo de compra de eventos/cursos temporales~~ ⏸️ DIFERIDO

| Campo            | Valor                                             |
| ---------------- | ------------------------------------------------- |
| **Prioridad**    | P2 MEDIO → ⏸️ DIFERIDO                            |
| **Complejidad**  | 🔴 DIFÍCIL                                        |
| **Dependencias** | 🔓 Ninguna pero es complejo                       |
| **Archivos**     | Múltiples archivos nuevos                         |
| **Descripción**  | Modelo existe pero no hay flujo completo          |
| **Estado**       | ⏸️ **DIFERIDO** - Implementación post-lanzamiento |

> **NOTA (2026-01-26)**: Esta funcionalidad se difiere para post-lanzamiento.
> El modelo de datos ya existe (Producto.tipo = 'Evento' | 'Curso'), pero el flujo
> completo de compra/inscripción requiere diseño adicional y no es crítico para MVP.
> No se cuenta en el porcentaje de completitud de FASE 5.

**Pasos** (para implementación futura):

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

### FASE 3: Portal Admin ✅ COMPLETADA

- [x] 3.1 CRUD de ClaseGrupos ✅ (2026-01-20)
- [x] 3.2 UI pausar/cancelar Suscripciones ✅ (2026-01-20)
- [x] 3.3 UI cambiar tier de inscripción ✅ (2026-01-20)
- [x] 3.4 Dashboard de Monitoring (DLQ) ✅ (2026-01-24)
- [x] 3.5 Dashboard de Audit Logs ✅ (2026-01-24)
- [x] 3.6 UI para configurar MFA ✅ (2026-01-24)
- [x] 3.7 Dashboard refactor: 5 tabs con glassmorphism ✅ (2026-01-20)
- [x] 3.8 Dashboard: tiempoPromedioMinutos endpoint ✅ (2026-01-20)
- [x] 3.9 Dashboard: crecimientoMensual calculado real ✅ (2026-01-20)

### FASE 4: Portal Docente

- [x] 4.1 Recuperación de contraseña ✅ (2026-01-20) - Compartido con Tutor
- [x] 4.2 Compartir pantalla ✅ (Ya implementado en ControlBar.tsx)
- [x] 4.3 Historial detallado de asistencia ✅
- [x] 4.4 Reportes gráficos de asistencia ✅
- [x] 4.5 Historial de puntos otorgados ✅
- [x] ~~4.6 Endpoint para calificar tareas~~ ❌ ELIMINADO (2026-01-20) - Todo debe ser autocorregible, ver 9.4
- [x] 4.7 Notificaciones UI Docente ✅ (2026-01-26) - Dropdown + página completa + polling 60s
- [x] 4.8 Auditoría de tipos P0-P3 ✅ (2026-01-26) - Type safety completo, cero `any`/`!`/casts
- [x] 4.9 Tests integración asistencia ✅ (2026-01-26) - 99 tests passing + ownership checks

### FASE 5: Portal Tutor ✅ COMPLETADA

- [x] 5.1 Recuperación de contraseña ✅ (2026-01-20) - Compartido con Docente
- [x] 5.2 Editar datos de estudiante ✅ (2026-01-26) - Modal edición en HijoDetalleModal + endpoint PATCH /estudiantes/:id
- [x] 5.3 Pausar suscripción ✅ (2026-01-20) - Endpoints y UI para pausar/reactivar inscripciones individuales y suscripción completa
- [x] 5.4 UI cambiar horario de inscripción ✅ (2026-01-26) - UI completa: sección "Tus actividades con horario" + modal de selección + endpoint horarios-disponibles + API cambiarHorario
- [ ] ~~5.5 Flujo de eventos/cursos temporales~~ ⏸️ DIFERIDO - Implementación post-lanzamiento

### FASE 6: Portal Estudiante

- [x] 6.1 Recuperación de contraseña ✅ (2026-01-20) - Mensaje: "Contactá a tu tutor"
- [x] 6.2 Restricción por tier (MODELO 2026) ✅ (Ya implementado) - Backend AccesoEstudianteService + Frontend lock visual
- [ ] 6.3 Animación de logro desbloqueado
- [ ] 6.4 Intent de juegos Phaser

### FASE 7: Mensajería ✅ COMPLETADA

- [x] 7.1 Sistema de Anuncios Docente → Grupo ✅ (2026-01-27) - `fd87ad28` Sprint C (Anuncios) - Módulo completo `apps/api/src/anuncios/`
- [x] 7.2 Alertas Admin ✅ (2026-01-27) - `fd87ad28` Sprint D (AlertasAdmin) - `alerta-sistema.service.ts` + `alerta-sistema.controller.ts`
- [ ] ~~7.3 Mensajería Tutor ↔ Docente~~ ⏸️ DIFERIDO - Sistema de chat directo post-lanzamiento

### FASE 8: MercadoPago ✅ COMPLETADA

- [x] 8.1 Cancelación con arrepentimiento 24hs ✅ (2026-01-26) - `f16624b7` - `cancelacion-pendiente-cron.service.ts` + estado PENDIENTE_CANCELACION
- [x] 8.2 Emails Grace Period (3 días) ✅ (2026-01-26) - `f16624b7` - `grace-period-email-cron.service.ts` + `grace-period-expired-cron.service.ts`
- [x] 8.3 UI baja inscripciones tutor ✅ (2026-01-26) - Ya implementado en `/tutor/suscripcion/gestionar`

### FASE 9: Contenido Educativo ✅ COMPLETADA

- [x] 9.1 Lista de contenidos con filtros ✅ (Ya existía en Sandbox)
- [x] 9.2 Progreso automático de estudiantes ✅ (2026-01-27) - `6e19de23` - LessonContext + useProgressSync + ProgressBar
- [x] 9.3 Drag & drop para reordenar nodos ✅ (2026-01-27) - `f2d9854e` - useSortableTree + tree.utils + SandboxSidebar
- [x] 9.4 Contenido autocorregible ✅ (2026-01-27) - `b9c8f739` - 4 nuevos intents: ShortAnswer, Checklist, Rubric, CodeValidator
- [x] Tests de integración ✅ (2026-01-27) - `4b38f329` - 79 tests (39 LessonContext + 40 tree.utils)

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
| 2026-01-24 | ✅ FASE 3 COMPLETADA: 3.4 Monitoring DLQ, 3.5 Audit Logs, 3.6 MFA Settings UI                                 | Claude |
| 2026-01-26 | ✅ FASE 5 COMPLETADA: 5.2 Editar estudiante, 5.4 Cambiar horario (API), ⏸️ 5.5 DIFERIDO                       | Claude |
| 2026-01-26 | 📋 AUDITORÍA COMPLETA: Flujos de comunicación inter-portal (Admin/Docente/Tutor)                              | Claude |

---

## AUDITORÍA: FLUJOS DE COMUNICACIÓN INTER-PORTAL

> **Fecha**: 2026-01-26
> **Objetivo**: Mapear TODOS los flujos de comunicación entre portales Admin, Docente y Tutor para el lanzamiento del 2 de febrero.

---

### DEPENDENCY MAP (Diagrama de Comunicación)

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  PORTAL ADMIN                        │
                    │  (Gestión completa - 152 endpoints)                  │
                    └─────────────────────────────────────────────────────┘
                           │                           │
                           │ ✅ 2 flujos con notif     │ ⚠️ 4/13 con notif
                           │ ❌ 6 sin notificación     │ ❌ 9 sin notificación
                           ▼                           ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │    PORTAL DOCENTE       │         │     PORTAL TUTOR        │
        │  (66 endpoints)         │         │   (29 endpoints)        │
        └─────────────────────────┘         └─────────────────────────┘
                           │                           │
                           │ ❌ 0 flujos directos      │ ❌ 0 flujos directos
                           │ (TODO: mensajería)        │ (TODO: mensajería)
                           ▼                           ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              ❌ SIN COMUNICACIÓN DIRECTA              │
                    │   Docente ↔ Tutor: NO HAY ENDPOINTS NI MENSAJERÍA   │
                    └─────────────────────────────────────────────────────┘

        ┌─────────────────────────────────────────────────────────────────┐
        │                      EVENTOS BIDIRECCIONALES                     │
        │                                                                  │
        │  ✅ 4 eventos con WebSocket (tiempo real):                       │
        │     - estudiante.nivel-up → Estudiante                          │
        │     - logro.desbloqueado → Estudiante + Tutor                   │
        │     - puntos.otorgados.envivo → Estudiante + Casa               │
        │     - casa.puntos.actualizado → Broadcast a Casa                │
        │                                                                  │
        │  ✅ 6 eventos de suscripción → Tutor + Admin (DB)               │
        │  ✅ 5 eventos de lección → Estudiante + Docente + Tutor (Feed)  │
        └─────────────────────────────────────────────────────────────────┘
```

---

### PARTE 1: FLUJOS ADMIN → DOCENTE

| #   | Acción Admin                  | Endpoint                                   | DTO                       | Notifica Docente?                | Test? |
| --- | ----------------------------- | ------------------------------------------ | ------------------------- | -------------------------------- | ----- |
| 1   | Crear ClaseGrupo con docente  | `POST /admin/clase-grupos`                 | `CrearClaseGrupoDto`      | ✅ SÍ (`DOCENTE_CLASE_ASIGNADA`) | ✅    |
| 2   | Cambiar docente de ClaseGrupo | `PUT /admin/clase-grupos/:id`              | `ActualizarClaseGrupoDto` | ✅ SÍ (si cambia docenteId)      | ✅    |
| 3   | Eliminar ClaseGrupo           | `DELETE /admin/clase-grupos/:id`           | -                         | ❌ NO                            | ✅    |
| 4   | Crear Comisión con docente    | `POST /admin/comisiones`                   | `CreateComisionDto`       | ❌ NO                            | ✅    |
| 5   | Cambiar docente de Comisión   | `PUT /admin/comisiones/:id`                | `UpdateComisionDto`       | ❌ NO                            | ✅    |
| 6   | Publicar Planificación        | `POST /admin/planificaciones/:id/publicar` | -                         | ❌ NO                            | ✅    |
| 7   | Asignar Casa a Docente        | `POST /admin/docentes/:id/casas`           | `AsignarCasaDto`          | ❌ NO                            | ❌    |
| 8   | Asignar Mundo a Docente       | `POST /admin/docentes/:id/mundos`          | `AsignarMundoDto`         | ❌ NO                            | ❌    |

**GAPS IDENTIFICADOS (Admin → Docente):**

- ❌ Comisiones NO notifican al docente cuando se asignan
- ❌ Casa/Mundo NO notifican al docente
- ❌ Publicación de planificación NO notifica

---

### PARTE 2: FLUJOS ADMIN → TUTOR

| #   | Acción Admin                     | Endpoint                                                     | DTO                              | Notifica Tutor?                  | Test? |
| --- | -------------------------------- | ------------------------------------------------------------ | -------------------------------- | -------------------------------- | ----- |
| 1   | Registrar pago manual            | `POST /admin/pagos/registrar`                                | `{ inscripcionId, monto, ... }`  | ❌ NO                            | ❌    |
| 2   | Anular inscripciones vencidas    | `POST /admin/pagos/anular-vencidas`                          | -                                | ✅ SÍ (evento cancelación)       | ❌    |
| 3   | Crear estudiante                 | `POST /admin/estudiantes`                                    | `CrearEstudianteDto`             | ❌ NO (crea tutor sin notificar) | ❌    |
| 4   | Asignar plan/beca a estudiante   | `PATCH /admin/estudiantes/:id/plan`                          | `AsignarPlanDto`                 | ❌ NO                            | ❌    |
| 5   | Resetear contraseña tutor        | `POST /admin/credenciales/:id/reset`                         | `{ tipoUsuario: "tutor" }`       | ❌ NO (admin envía manualmente)  | ❌    |
| 6   | Pausar suscripción (Admin)       | `POST /suscripciones/familiar/admin/:id/pausar`              | `AdminPausarSuscripcionDto`      | ⚠️ PARCIAL (evento genérico)     | ✅    |
| 7   | Reactivar suscripción (Admin)    | `POST /suscripciones/familiar/admin/:id/reactivar`           | `AdminReactivarSuscripcionDto`   | ⚠️ PARCIAL (evento genérico)     | ✅    |
| 8   | Cancelar suscripción (Admin)     | `POST /suscripciones/familiar/admin/:id/cancelar`            | `AdminCancelarSuscripcionDto`    | ✅ SÍ (ALTA prioridad)           | ✅    |
| 9   | Cambiar tier inscripción (Admin) | `PATCH /suscripciones/familiar/admin/inscripciones/:id/tier` | `AdminCambiarTierInscripcionDto` | ⚠️ PARCIAL (sin notif explícita) | ✅    |

**Estadísticas:** 4/13 flujos con notificación (31%)

**GAPS IDENTIFICADOS (Admin → Tutor):**

- ❌ Pago manual NO notifica al tutor
- ❌ Creación de estudiante NO notifica
- ❌ Asignación de beca NO notifica
- ❌ Pausar/Reactivar NO tienen notificación EXPLÍCITA (solo eventos genéricos)
- ❌ Cambio de tier NO notifica el cambio de precio

---

### PARTE 3: FLUJOS DOCENTE → TUTOR

| #   | Acción Docente                      | Endpoint                                             | DTO                      | Notifica Tutor?                    | Test? |
| --- | ----------------------------------- | ---------------------------------------------------- | ------------------------ | ---------------------------------- | ----- |
| 1   | Registrar asistencia                | `POST /clases/:id/asistencia`                        | `RegistrarAsistenciaDto` | ⚠️ PARCIAL (solo si 2+ faltas)     | ✅    |
| 2   | Crear observación                   | `POST /observaciones`                                | `CreateObservacionDto`   | ❌ NO (solo admin/pedagogía)       | ✅    |
| 3   | Otorgar puntos/XP                   | `POST /gamificacion/puntos`                          | `OtorgarPuntosDto`       | ❌ NO                              | ✅    |
| 4   | Asignar tarea                       | `POST /docentes/asignaciones/:id/tareas/.../asignar` | `AsignarTareaDto`        | ⚠️ DISPONIBLE pero NO implementado | ✅    |
| 5   | Cancelar clase                      | `PATCH /clases/:id/cancelar`                         | -                        | ❌ NO (solo notifica docente)      | ✅    |
| 6   | Activar contenido (teoría/práctica) | `POST /docentes/asignaciones/.../activar`            | -                        | ❌ NO                              | ✅    |

**Estadísticas:** 0/6 flujos con notificación completa al tutor

**GAPS CRÍTICOS (Docente → Tutor):**

- ❌ **NO HAY SISTEMA DE MENSAJERÍA** Docente → Tutor
- ❌ Observaciones urgentes NO notifican al tutor
- ❌ Tareas asignadas NO notifican al tutor
- ❌ Cancelación de clase NO notifica al tutor (padre)
- ❌ Puntos/logros NO notifican al tutor (excepto por logro.desbloqueado event)

---

### PARTE 4: FLUJOS TUTOR → ADMIN

| #   | Acción Tutor                              | Endpoint                                               | Notifica Admin?        | Dashboard Admin?                  | Test? |
| --- | ----------------------------------------- | ------------------------------------------------------ | ---------------------- | --------------------------------- | ----- |
| 1   | Crear suscripción                         | `POST /suscripciones/familiar`                         | ❌ NO                  | ✅ `GET /familiar/admin`          | ✅    |
| 2   | Agregar inscripciones                     | `POST /suscripciones/familiar/inscripciones`           | ❌ NO                  | ✅ Visible en detalle             | ✅    |
| 3   | Dar de baja inscripción                   | `DELETE /suscripciones/familiar/inscripciones`         | ❌ NO                  | ✅ Estado actualizado             | ✅    |
| 4   | Cambiar horario                           | `PATCH /suscripciones/familiar/inscripciones/horario`  | ❌ NO                  | ✅ Visible                        | ✅    |
| 5   | Cambiar tier                              | `PATCH /suscripciones/familiar/inscripciones/:id/tier` | ❌ NO                  | ✅ Visible                        | ✅    |
| 6   | Pausar suscripción                        | `POST /suscripciones/familiar/pausar`                  | ❌ NO                  | ✅ Estado PAUSED                  | ✅    |
| 7   | Cancelar suscripción                      | `POST /suscripciones/familiar/cancelar`                | ❌ NO (evento interno) | ✅ Estado CANCELLED               | ✅    |
| 8   | Decidir verano (COLONIA/CONTINUIDAD/BAJA) | `POST /tutor/verano/decidir`                           | ❌ NO                  | ✅ `GET /admin/verano/decisiones` | ✅    |

**Arquitectura:** El admin CONSULTA dashboards. NO hay notificaciones push al admin.

**GAPS IDENTIFICADOS (Tutor → Admin):**

- ❌ NO hay sistema de "solicitudes pendientes" donde el admin vea cola de trabajo
- ❌ Admin debe revisar dashboards activamente (modelo PULL, no PUSH)

---

### PARTE 5: FLUJOS TUTOR → DOCENTE

| #   | Acción Tutor             | Endpoint | Notifica Docente? | Test? |
| --- | ------------------------ | -------- | ----------------- | ----- |
| -   | **NO EXISTEN ENDPOINTS** | -        | -                 | -     |

**GAPS CRÍTICOS:**

- ❌ **NO HAY SISTEMA DE MENSAJERÍA** Tutor → Docente
- ❌ NO puede justificar ausencias
- ❌ NO puede enviar mensajes al docente
- ❌ NO puede solicitar reuniones
- ❌ NO puede hacer consultas sobre el estudiante

---

### PARTE 6: EVENTOS BIDIRECCIONALES (Multi-Portal)

| Evento                     | Trigger                           | Afecta a                     | Notificaciones                    | WebSocket?   |
| -------------------------- | --------------------------------- | ---------------------------- | --------------------------------- | ------------ |
| `suscripcion.creada`       | Tutor crea suscripción            | Tutor + Admin                | ✅ Tutor                          | ❌           |
| `suscripcion.activada`     | Primer pago confirmado            | Tutor + Admin + Estudiantes  | ✅ Tutor + Acceso desbloqueado    | ❌           |
| `suscripcion.cancelada`    | Cancelación (tutor/admin/sistema) | Tutor + Admin + Estudiantes  | ✅ Tutor (ALTA) + Acceso revocado | ❌           |
| `suscripcion.en_gracia`    | Pago fallido                      | Tutor + Admin                | ✅ Tutor (ALTA)                   | ❌           |
| `suscripcion.morosa`       | Grace period expiró               | Tutor + Admin                | ✅ Tutor (CRÍTICA)                | ❌           |
| `pago_registrado`          | MercadoPago aprueba               | Tutor + Admin                | ✅ Tutor                          | ❌           |
| `estudiante.nivel-up`      | XP acumulado                      | Estudiante + Tutor           | ✅ Estudiante                     | ✅ WebSocket |
| `logro.desbloqueado`       | Criterio cumplido                 | Estudiante + Tutor + Docente | ✅ Estudiante + Feed              | ✅ WebSocket |
| `puntos.otorgados.envivo`  | Docente da puntos                 | Estudiante + Casa            | ✅ Estudiante (privado)           | ✅ WebSocket |
| `casa.puntos.actualizado`  | XP ganado en casa                 | Todos en casa                | ✅ Broadcast                      | ✅ WebSocket |
| `leccion.completada`       | Estudiante completa               | Estudiante + Docente + Tutor | ✅ XP + Feed                      | ❌           |
| `tarea.completada`         | Estudiante entrega                | Estudiante + Docente + Tutor | ✅ XP + Feed                      | ❌           |
| `clase.completada`         | Teoría + Práctica done            | Estudiante + Docente + Tutor | ✅ XP bonus 50 + Feed             | ❌           |
| `planificacion.completada` | Todas las clases done             | Estudiante + Docente + Tutor | ✅ XP bonus 200 + Badge           | ❌           |

---

### PARTE 7: GAPS CRÍTICOS PRIORIZADOS

#### **P0 - CRÍTICO PARA LANZAMIENTO**

| Gap                                               | Impacto                                      | Solución Propuesta                                  |
| ------------------------------------------------- | -------------------------------------------- | --------------------------------------------------- |
| **Sistema de Mensajería Tutor ↔ Docente**        | Padres no pueden comunicarse con profesores  | Crear modelo `Mensaje` + endpoints + UI             |
| **Notificación de tareas asignadas al tutor**     | Padres no saben qué tareas tienen sus hijos  | Emitir evento `TUTOR_TAREA_ASIGNADA_HIJO`           |
| **Notificación de cancelación de clase al tutor** | Padres no se enteran que la clase se canceló | Agregar notificación en `notificarClaseCancelada()` |

#### **P1 - ALTO**

| Gap                                     | Impacto                                   | Solución Propuesta                       |
| --------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| Pago manual NO notifica al tutor        | Tutor no sabe si pagó                     | Crear evento `PagoManualRegistradoEvent` |
| Comisiones NO notifican al docente      | Docente no sabe que le asignaron comisión | Crear `notificarComisionAsignada()`      |
| Pausar/Reactivar sin notificación clara | Tutor no sabe por qué cambió su estado    | Crear eventos específicos                |
| Cambio de tier sin notificación         | Tutor no sabe que cambió el precio        | Crear `InscripcionTierCambiadoEvent`     |

#### **P2 - MEDIO**

| Gap                                       | Impacto                             | Solución Propuesta                   |
| ----------------------------------------- | ----------------------------------- | ------------------------------------ |
| Admin no recibe notificaciones push       | Debe revisar dashboards manualmente | Crear alertas en-app para admin      |
| Observaciones urgentes no notifican tutor | Padre no sabe de incidentes         | Flag `notificarTutor` en observación |
| Sistema de Anuncios Docente → Grupo       | Docente no puede comunicar a todos  | Crear modelo `Anuncio`               |

---

### RESUMEN EJECUTIVO

| Flujo                    | Total Acciones | Con Notificación | Cobertura | Estado      |
| ------------------------ | -------------- | ---------------- | --------- | ----------- |
| Admin → Docente          | 8              | 2                | **25%**   | ⚠️ PARCIAL  |
| Admin → Tutor            | 13             | 4                | **31%**   | ⚠️ PARCIAL  |
| Docente → Tutor          | 6              | 0                | **0%**    | ❌ CRÍTICO  |
| Tutor → Admin            | 8              | 0 (pull)         | **0%**    | ⚠️ DISEÑO   |
| Tutor → Docente          | 0              | 0                | **N/A**   | ❌ CRÍTICO  |
| **Eventos Multi-Portal** | 14             | 14               | **100%**  | ✅ COMPLETO |

**Conclusión:**

- ✅ Los eventos de sistema (suscripciones, gamificación) están bien implementados
- ❌ La comunicación DIRECTA entre portales es prácticamente inexistente
- ❌ El flujo Docente ↔ Tutor es el GAP más crítico (0% implementado)
- ⚠️ Las notificaciones Admin → X están parcialmente implementadas

---

## PLAN DE ACCIÓN: AUTOPISTA INTER-PORTAL

> **Objetivo**: Que TODOS los flujos de comunicación funcionen al 100%
> **Deadline**: 2 de febrero 2026

---

### SPRINT A: NOTIFICACIONES FALTANTES (2 días)

Agregar notificaciones a flujos que YA existen pero no notifican.

#### A.1 Admin → Docente (Comisiones + Casa/Mundo)

**Archivos a modificar:**

- `apps/api/src/admin/comisiones.service.ts`
- `apps/api/src/admin/services/docente-asignaciones.service.ts`

**Tareas:**

```typescript
// 1. En comisiones.service.ts - método crear() y actualizar()
// Después de guardar, si hay docenteId:
await this.notificacionesService.notificarComisionAsignada(
  docenteId,
  comision.id,
  comision.nombre,
  comision.horario,
);

// 2. En docente-asignaciones.service.ts - asignarCasa() y asignarMundo()
await this.notificacionesService.notificarAsignacionEstrategica(
  docenteId,
  'CASA', // o 'MUNDO'
  casaTipo, // o mundoTipo
);
```

**Nuevos métodos en NotificacionesService:**

```typescript
// apps/api/src/notificaciones/notificaciones.service.ts
async notificarComisionAsignada(docenteId, comisionId, nombre, horario)
async notificarAsignacionEstrategica(docenteId, tipo, valor)
```

---

#### A.2 Admin → Tutor (Pagos + Becas + Tier)

**Archivos a modificar:**

- `apps/api/src/admin/services/admin-pagos.service.ts`
- `apps/api/src/admin/services/admin-estudiantes.service.ts`
- `apps/api/src/suscripciones/services/suscripcion-familiar-command.service.ts`

**Tareas:**

```typescript
// 1. En admin-pagos.service.ts - registrarPagoManual()
await this.notificacionesService.notificarPagoManualRegistrado(
  tutorId,
  estudianteNombre,
  monto,
  metodoPago,
);

// 2. En admin-estudiantes.service.ts - asignarPlan()
if (estadoAcceso === 'BECA') {
  await this.notificacionesService.notificarBecaAsignada(tutorId, estudianteNombre, planNombre);
}

// 3. En suscripcion-familiar-command.service.ts - cambiarTierInscripcion() (admin)
await this.notificacionesService.notificarCambioTier(
  tutorId,
  estudianteNombre,
  tierAnterior,
  nuevoTier,
  diferenciaPrecio,
);

// 4. Eventos específicos para pausar/reactivar
// Crear SuscripcionPausadaEvent y SuscripcionReactivadaEvent
// Agregar handlers en suscripcion-notificaciones.listener.ts
```

**Nuevos métodos en NotificacionesService:**

```typescript
async notificarPagoManualRegistrado(tutorId, estudianteNombre, monto, metodoPago)
async notificarBecaAsignada(tutorId, estudianteNombre, planNombre)
async notificarCambioTier(tutorId, estudianteNombre, tierAnterior, nuevoTier, diferencia)
async notificarSuscripcionPausada(tutorId, motivo, fechaReactivacion?)
async notificarSuscripcionReactivada(tutorId)
```

---

#### A.3 Docente → Tutor (Tareas + Clases + Observaciones)

**Archivos a modificar:**

- `apps/api/src/docentes/services/docente-tareas.service.ts`
- `apps/api/src/clases/services/clases.service.ts`
- `apps/api/src/observaciones/observaciones.service.ts`

**Tareas:**

```typescript
// 1. En docente-tareas.service.ts - asignarTarea()
// Obtener todos los estudiantes de la comisión
for (const estudiante of estudiantesComision) {
  const tutor = await this.getTutorDeEstudiante(estudiante.id);
  await this.notificacionesService.notificarTareaAsignada(
    tutor.id,
    estudiante.nombre,
    tarea.titulo,
    tarea.fechaLimite,
  );
}

// 2. En clases.service.ts - cancelarClase()
// Además de notificar al docente, notificar a tutores
const estudiantes = await this.getEstudiantesDeClase(claseId);
const tutoresNotificados = new Set<string>();
for (const est of estudiantes) {
  if (!tutoresNotificados.has(est.tutorId)) {
    await this.notificacionesService.notificarClaseCanceladaATutor(
      est.tutorId,
      est.nombre,
      clase.titulo,
      motivo,
    );
    tutoresNotificados.add(est.tutorId);
  }
}

// 3. En observaciones.service.ts - crear()
// Agregar flag notificarTutor al DTO
if (dto.tipo === 'Incidente' || dto.prioridad === 'Urgente' || dto.notificarTutor) {
  for (const estudianteId of dto.estudianteIds) {
    const tutor = await this.getTutor(estudianteId);
    await this.notificacionesService.notificarObservacionUrgente(
      tutor.id,
      estudianteNombre,
      dto.tipo,
      dto.contenido.substring(0, 100),
    );
  }
}
```

**Nuevos métodos en NotificacionesService:**

```typescript
async notificarTareaAsignada(tutorId, estudianteNombre, tareaTitulo, fechaLimite)
async notificarClaseCanceladaATutor(tutorId, estudianteNombre, claseTitulo, motivo?)
async notificarObservacionUrgente(tutorId, estudianteNombre, tipo, resumen)
```

**Modificar DTO:**

```typescript
// apps/api/src/observaciones/dto/create-observacion.dto.ts
notificarTutor?: boolean; // default: true si tipo='Incidente' o prioridad='Urgente'
```

---

### SPRINT B: SISTEMA DE MENSAJERÍA (3 días)

#### B.1 Modelo de Datos

**Nuevo archivo:** `apps/api/prisma/migrations/YYYYMMDD_create_mensajes/migration.sql`

```prisma
// En schema.prisma
model Mensaje {
  id              String   @id @default(cuid())

  // Participantes (uno de cada par)
  tutorId         String?  @map("tutor_id")
  docenteId       String?  @map("docente_id")

  // Contexto (opcional - sobre qué estudiante hablan)
  estudianteId    String?  @map("estudiante_id")

  // Quién envía
  enviadoPor      TipoRemitente  // TUTOR | DOCENTE

  // Contenido
  asunto          String   @db.VarChar(200)
  contenido       String   @db.Text

  // Estado
  leido           Boolean  @default(false)
  fechaLeido      DateTime? @map("fecha_leido")

  // Timestamps
  createdAt       DateTime @default(now()) @map("created_at")

  // Relaciones
  tutor           Tutor?    @relation(fields: [tutorId], references: [id])
  docente         Docente?  @relation(fields: [docenteId], references: [id])
  estudiante      Estudiante? @relation(fields: [estudianteId], references: [id])

  // Para threading (respuestas)
  mensajePadreId  String?  @map("mensaje_padre_id")
  mensajePadre    Mensaje? @relation("Respuestas", fields: [mensajePadreId], references: [id])
  respuestas      Mensaje[] @relation("Respuestas")

  @@map("mensajes")
  @@index([tutorId, docenteId])
  @@index([docenteId])
  @@index([tutorId])
}

enum TipoRemitente {
  TUTOR
  DOCENTE
}
```

---

#### B.2 Backend - Endpoints

**Nuevos archivos:**

- `apps/api/src/mensajes/mensajes.module.ts`
- `apps/api/src/mensajes/mensajes.controller.ts`
- `apps/api/src/mensajes/mensajes.service.ts`
- `apps/api/src/mensajes/dto/`

**Endpoints para TUTOR:**

```typescript
@Controller('tutor/mensajes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.TUTOR)
export class TutorMensajesController {
  // Listar conversaciones (agrupadas por docente)
  @Get('conversaciones')
  async getConversaciones(@GetUser() tutor) {
    // Retorna lista de docentes con último mensaje y count no leídos
  }

  // Obtener mensajes con un docente específico
  @Get('conversacion/:docenteId')
  async getConversacion(
    @GetUser() tutor,
    @Param('docenteId') docenteId: string,
    @Query('estudianteId') estudianteId?: string,
  ) {
    // Retorna todos los mensajes entre tutor y docente
    // Opcionalmente filtrado por estudiante
  }

  // Enviar mensaje
  @Post()
  async enviarMensaje(@GetUser() tutor, @Body() dto: EnviarMensajeDto) {
    // dto: { docenteId, estudianteId?, asunto, contenido, mensajePadreId? }
  }

  // Marcar como leído
  @Patch(':id/leer')
  async marcarLeido(@GetUser() tutor, @Param('id') id: string) {}

  // Contar no leídos
  @Get('count')
  async countNoLeidos(@GetUser() tutor) {}
}
```

**Endpoints para DOCENTE:**

```typescript
@Controller('docentes/mensajes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.DOCENTE)
export class DocenteMensajesController {
  // Listar conversaciones (agrupadas por tutor)
  @Get('conversaciones')
  async getConversaciones(@GetUser() docente) {}

  // Obtener mensajes con un tutor específico
  @Get('conversacion/:tutorId')
  async getConversacion(@GetUser() docente, @Param('tutorId') tutorId: string) {}

  // Enviar mensaje
  @Post()
  async enviarMensaje(@GetUser() docente, @Body() dto: EnviarMensajeDto) {
    // dto: { tutorId, estudianteId?, asunto, contenido, mensajePadreId? }
  }

  // Marcar como leído
  @Patch(':id/leer')
  async marcarLeido(@GetUser() docente, @Param('id') id: string) {}

  // Contar no leídos
  @Get('count')
  async countNoLeidos(@GetUser() docente) {}

  // EXTRA: Enviar mensaje masivo a todos los tutores de una comisión
  @Post('comision/:comisionId')
  async enviarMensajeComision(
    @GetUser() docente,
    @Param('comisionId') comisionId: string,
    @Body() dto: { asunto: string; contenido: string },
  ) {}
}
```

---

#### B.3 Frontend - UI Tutor

**Nuevos archivos:**

- `apps/web/src/app/tutor/mensajes/page.tsx` - Lista de conversaciones
- `apps/web/src/app/tutor/mensajes/[docenteId]/page.tsx` - Chat con docente
- `apps/web/src/components/tutor/MensajesDropdown.tsx` - Dropdown en header
- `apps/web/src/hooks/useTutorMensajes.ts`
- `apps/web/src/lib/api/tutor-mensajes.api.ts`

**Diseño UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  📬 Mensajes                                    [+ Nuevo]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👩‍🏫 Prof. María García           hace 2h  ●         │   │
│  │    Re: Consulta sobre Juan                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👨‍🏫 Prof. Carlos López           ayer               │   │
│  │    Excelente progreso de Sofía                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Chat individual:**

```
┌─────────────────────────────────────────────────────────────┐
│  ← Prof. María García                         📋 Juan      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │ Hola, quería consultar sobre...     │  Yo - 10:30      │
│  └─────────────────────────────────────┘                   │
│                                                             │
│                   ┌─────────────────────────────────────┐   │
│    Prof - 11:45   │ Hola! Juan está progresando muy...  │   │
│                   └─────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Escribe tu mensaje...                              ] 📤  │
└─────────────────────────────────────────────────────────────┘
```

---

#### B.4 Frontend - UI Docente

**Nuevos archivos:**

- `apps/web/src/app/docente/mensajes/page.tsx`
- `apps/web/src/app/docente/mensajes/[tutorId]/page.tsx`
- `apps/web/src/components/docente/MensajesDropdown.tsx`
- `apps/web/src/hooks/useDocenteMensajes.ts`

**Agregar en sidebar docente:**

- Icono de mensajes con badge de no leídos
- Link a `/docente/mensajes`

---

#### B.5 Notificaciones de Mensajes

**Cuando se envía un mensaje:**

```typescript
// En mensajes.service.ts - enviarMensaje()
if (dto.enviadoPor === 'TUTOR') {
  await this.notificacionesService.createParaDocente(docenteId, {
    tipo: TipoNotificacion.DOCENTE_MENSAJE_TUTOR,
    titulo: `Mensaje de ${tutorNombre}`,
    mensaje: `Nuevo mensaje sobre ${estudianteNombre || 'consulta general'}`,
    metadata: { mensajeId, tutorId, estudianteId },
  });
} else {
  await this.notificacionesService.createParaTutor(tutorId, {
    tipo: TipoNotificacion.TUTOR_MENSAJE_DOCENTE,
    titulo: `Mensaje de ${docenteNombre}`,
    mensaje: `Nuevo mensaje sobre ${estudianteNombre || 'consulta general'}`,
    metadata: { mensajeId, docenteId, estudianteId },
  });
}
```

---

### SPRINT C: SISTEMA DE ANUNCIOS (1 día)

#### C.1 Modelo Anuncio

```prisma
model Anuncio {
  id              String   @id @default(cuid())
  docenteId       String   @map("docente_id")
  comisionId      String?  @map("comision_id")  // null = todas las comisiones del docente

  titulo          String   @db.VarChar(200)
  contenido       String   @db.Text
  tipo            TipoAnuncio  // INFORMATIVO | IMPORTANTE | URGENTE

  fechaExpiracion DateTime? @map("fecha_expiracion")
  activo          Boolean  @default(true)

  createdAt       DateTime @default(now()) @map("created_at")

  docente         Docente  @relation(fields: [docenteId], references: [id])
  comision        Comision? @relation(fields: [comisionId], references: [id])

  @@map("anuncios")
}

enum TipoAnuncio {
  INFORMATIVO
  IMPORTANTE
  URGENTE
}
```

#### C.2 Endpoints

```typescript
// Para DOCENTE
@Post('anuncios')           // Crear anuncio
@Get('anuncios')            // Mis anuncios
@Patch('anuncios/:id')      // Editar
@Delete('anuncios/:id')     // Eliminar

// Para TUTOR (lectura)
@Get('tutor/anuncios')      // Anuncios de docentes de mis hijos

// Para ESTUDIANTE (lectura)
@Get('estudiantes/anuncios') // Anuncios de mis comisiones
```

#### C.3 Notificaciones

Al crear anuncio IMPORTANTE o URGENTE:

- Notificar a todos los tutores de la comisión
- Notificar a todos los estudiantes de la comisión

---

### SPRINT D: ALERTAS ADMIN (1 día)

#### D.1 Sistema de Alertas Push para Admin

Crear notificaciones para el admin cuando:

- Nueva suscripción creada
- Suscripción cancelada
- Pago fallido
- Estudiante inactivo X días

**Nuevo modelo:**

```prisma
model AlertaAdmin {
  id          String   @id @default(cuid())
  tipo        TipoAlertaAdmin
  titulo      String
  mensaje     String
  prioridad   PrioridadNotificacion @default(MEDIA)
  resuelta    Boolean  @default(false)
  resueltaPor String?  @map("resuelta_por")
  fechaResolucion DateTime? @map("fecha_resolucion")
  metadata    Json?
  createdAt   DateTime @default(now())

  @@map("alertas_admin")
}

enum TipoAlertaAdmin {
  NUEVA_SUSCRIPCION
  SUSCRIPCION_CANCELADA
  PAGO_FALLIDO
  ESTUDIANTE_INACTIVO
  FRAUDE_DETECTADO
  WEBHOOK_FALLIDO
  SISTEMA
}
```

**Listeners:**

```typescript
@OnEvent(SuscripcionCreadaEvent.EVENT_NAME)
async handleNuevaSuscripcion(event) {
  await this.alertaAdminService.crear({
    tipo: 'NUEVA_SUSCRIPCION',
    titulo: 'Nueva suscripción',
    mensaje: `${event.tutorNombre} creó una suscripción por $${event.monto}`,
    prioridad: 'BAJA'
  });
}

@OnEvent(SuscripcionCanceladaEvent.EVENT_NAME)
async handleCancelacion(event) {
  await this.alertaAdminService.crear({
    tipo: 'SUSCRIPCION_CANCELADA',
    titulo: 'Suscripción cancelada',
    mensaje: `${event.tutorNombre} canceló su suscripción. Motivo: ${event.motivo}`,
    prioridad: 'MEDIA'
  });
}
```

**UI Admin:**

- Badge en header con count de alertas no resueltas
- Dropdown con últimas alertas
- Página `/admin/alertas` con lista completa y filtros

---

### CHECKLIST DE IMPLEMENTACIÓN

#### Sprint A: Notificaciones (2 días)

- [ ] A.1.1 Crear `notificarComisionAsignada()` en NotificacionesService
- [ ] A.1.2 Llamar desde `comisiones.service.ts`
- [ ] A.1.3 Crear `notificarAsignacionEstrategica()` en NotificacionesService
- [ ] A.1.4 Llamar desde `docente-asignaciones.service.ts`
- [ ] A.2.1 Crear `notificarPagoManualRegistrado()` en NotificacionesService
- [ ] A.2.2 Llamar desde `admin-pagos.service.ts`
- [ ] A.2.3 Crear `notificarBecaAsignada()` en NotificacionesService
- [ ] A.2.4 Llamar desde `admin-estudiantes.service.ts`
- [ ] A.2.5 Crear `notificarCambioTier()` en NotificacionesService
- [ ] A.2.6 Llamar desde `suscripcion-familiar-command.service.ts`
- [ ] A.2.7 Crear eventos `SuscripcionPausadaEvent` y `SuscripcionReactivadaEvent`
- [ ] A.2.8 Agregar handlers en listener
- [ ] A.3.1 Crear `notificarTareaAsignada()` en NotificacionesService
- [ ] A.3.2 Llamar desde `docente-tareas.service.ts`
- [ ] A.3.3 Crear `notificarClaseCanceladaATutor()` en NotificacionesService
- [ ] A.3.4 Modificar `clases.service.ts` para notificar tutores
- [ ] A.3.5 Agregar `notificarTutor` flag al DTO de observaciones
- [ ] A.3.6 Crear `notificarObservacionUrgente()` en NotificacionesService
- [ ] A.3.7 Llamar desde `observaciones.service.ts`

#### Sprint B: Mensajería (3 días)

- [ ] B.1.1 Crear migración para modelo Mensaje
- [ ] B.1.2 Actualizar schema.prisma
- [ ] B.1.3 Generar cliente Prisma
- [ ] B.2.1 Crear MensajesModule
- [ ] B.2.2 Crear MensajesService
- [ ] B.2.3 Crear TutorMensajesController
- [ ] B.2.4 Crear DocenteMensajesController
- [ ] B.2.5 Crear DTOs (EnviarMensajeDto, etc.)
- [ ] B.3.1 Crear página `/tutor/mensajes`
- [ ] B.3.2 Crear página `/tutor/mensajes/[docenteId]`
- [ ] B.3.3 Crear MensajesDropdown para tutor
- [ ] B.3.4 Crear hook `useTutorMensajes`
- [ ] B.3.5 Agregar link en sidebar tutor
- [ ] B.4.1 Crear página `/docente/mensajes`
- [ ] B.4.2 Crear página `/docente/mensajes/[tutorId]`
- [ ] B.4.3 Crear MensajesDropdown para docente
- [ ] B.4.4 Crear hook `useDocenteMensajes`
- [ ] B.4.5 Agregar link en sidebar docente
- [ ] B.5.1 Agregar notificación al enviar mensaje

#### Sprint C: Anuncios (1 día)

- [ ] C.1.1 Crear migración para modelo Anuncio
- [ ] C.1.2 Actualizar schema.prisma
- [ ] C.2.1 Crear AnunciosController (docente)
- [ ] C.2.2 Crear endpoints de lectura (tutor, estudiante)
- [ ] C.3.1 Notificar al crear anuncio importante/urgente
- [ ] C.4.1 UI para crear anuncios (docente)
- [ ] C.4.2 UI para ver anuncios (tutor)
- [ ] C.4.3 UI para ver anuncios (estudiante)

#### Sprint D: Alertas Admin (1 día)

- [ ] D.1.1 Crear migración para modelo AlertaAdmin
- [ ] D.1.2 Crear AlertaAdminService
- [ ] D.1.3 Crear listeners para eventos
- [ ] D.2.1 Crear endpoints CRUD alertas
- [ ] D.3.1 Badge en header admin
- [ ] D.3.2 Dropdown de alertas
- [ ] D.3.3 Página `/admin/alertas`

---

### RESULTADO ESPERADO

Después de implementar todo:

| Flujo                | Cobertura Actual | Cobertura Final |
| -------------------- | ---------------- | --------------- |
| Admin → Docente      | 25%              | **100%**        |
| Admin → Tutor        | 31%              | **100%**        |
| Docente → Tutor      | 0%               | **100%**        |
| Tutor → Admin        | 0%               | **100%**        |
| Tutor → Docente      | N/A              | **100%**        |
| Eventos Multi-Portal | 100%             | **100%**        |

**Timeline:**

- Sprint A: Día 1-2
- Sprint B: Día 3-5
- Sprint C: Día 6
- Sprint D: Día 7
- Testing + Fixes: Día 8

**Total: 8 días de trabajo = 1 semana antes del lanzamiento**
