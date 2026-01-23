# TODO PRE-LANZAMIENTO MATEATLETAS

**Última actualización:** 2026-01-23
**Estado:** 1/28 completados

---

## 🔴 CRÍTICOS (Bloquean lanzamiento)

- [ ] **[CRIT-001]** IDOR LogrosController
  - Archivo: `apps/api/src/gamificacion/controllers/logros.controller.ts:43-48`
  - Cualquier usuario autenticado puede acceder a los logros de cualquier estudiante
  - **Fix:** Agregar `EstudianteOwnershipGuard` para validar que el usuario tenga relación con el estudiante

- [ ] **[CRIT-002]** Endpoint desbloquear logros sin Admin
  - Archivo: `apps/api/src/gamificacion/controllers/logros.controller.ts:99-107`
  - El endpoint `/gamificacion/logros/desbloquear` permite a cualquier autenticado desbloquear logros
  - **Fix:** Cambiar `@Roles()` a solo `Role.ADMIN`

- [ ] **[CRIT-003]** Falta .env.example
  - Archivos: `.env.example`, `apps/api/.env.example`, `apps/web/.env.example`
  - Nuevos deploys pueden fallar por variables de entorno no documentadas
  - **Fix:** Crear archivos .env.example con todas las variables necesarias

- [ ] **[CRIT-004]** WebSocket URL hardcodeada
  - Archivo: `apps/web/src/hooks/useAulaViva.tsx:114`
  - Fallback a `localhost:3001` si no hay `NEXT_PUBLIC_API_URL`
  - **Fix:** Validar que la URL sea válida en producción, lanzar error si es localhost

- [ ] **[CRIT-005]** Cascade Tutor→Estudiante peligroso
  - Archivo: `apps/api/prisma/schema.prisma` (modelo Estudiante, línea ~101)
  - Borrar un tutor elimina TODOS sus estudiantes y sus datos asociados
  - **Fix:** Cambiar `onDelete: Cascade` a `onDelete: Restrict`

- [x] **[CRIT-006]** ~~Unique constraints faltantes~~ ✅ YA IMPLEMENTADO
  - Archivo: `apps/api/prisma/schema.prisma`
  - `InscripcionClaseGrupo` (línea ~1152): Ya tiene `@@unique([claseGrupoId, estudianteId])`
  - `InscripcionComision` (línea ~3244): Ya tiene `@@unique([comisionId, estudianteId])`
  - **Status:** No requiere acción

---

## 🟠 ALTOS (Primera semana post-lanzamiento)

- [ ] **[HIGH-001]** IDOR AsistenciaController
  - Archivo: `apps/api/src/asistencia/asistencia.controller.ts:85-95`
  - Un tutor puede ver historial de asistencia de cualquier estudiante
  - **Fix:** Validar que el tutor tenga ownership del estudiante antes de retornar datos

- [ ] **[HIGH-002]** CSRF login estudiante
  - Archivo: `apps/api/src/auth/auth.controller.ts:266-275`
  - El login de estudiantes no tiene protección CSRF (el de tutores sí: línea 169)
  - **Fix:** Agregar `@RequireCsrf()` igual que en login tutor

- [ ] **[HIGH-003]** Non-null assertions sin validación (15 ocurrencias)
  - Archivo: `apps/api/src/estudiantes/services/acceso-estudiante.service.ts:362` - `estudiante.plan!`
  - Archivo: `apps/api/src/auth/auth.service.ts:311` - `usuario!.passwordHash!`
  - Archivo: `apps/api/src/pagos/application/use-cases/calcular-precio.use-case.ts:180,193` - `Map.get()!`
  - Archivo: `apps/api/src/aula-viva/aula-viva.gateway.ts` - 10 ocurrencias
  - **Fix:** Reemplazar `!` por validación explícita con throw si es null

- [ ] **[HIGH-004]** ESLint/TypeScript ignorados en build
  - Archivo: `apps/web/next.config.js:5-10`
  - `ignoreDuringBuilds: true` y `ignoreBuildErrors: true` ocultan errores
  - **Fix:** Cambiar ambos a `false` y corregir errores que aparezcan

- [ ] **[HIGH-005]** Logs con datos sensibles
  - Archivo: `apps/api/src/pagos/guards/mercadopago-webhook.guard.ts:447-457`
  - Se loguean firmas, payloads y secrets de webhooks (incluso en producción)
  - **Fix:** Eliminar o sanitizar estos logs, usar solo en desarrollo

- [ ] **[HIGH-006]** Validación Zod faltante en gamificación API
  - Archivo: `apps/web/src/lib/api/gamificacion.api.ts:431,447,463,479`
  - Las respuestas del API no se validan con schemas Zod
  - **Fix:** Crear schemas en `@mateatletas/contracts` y validar respuestas

- [ ] **[HIGH-007]** Tracking de fraude incompleto
  - Archivo: `apps/api/src/security/fraud-detection.service.ts:97,173`
  - Falta implementar tracking de IP y mercadopagoPaymentId en InscripcionMensual
  - **Fix:** Agregar campos al modelo y poblarlos en flujos de pago

- [ ] **[HIGH-008]** Tests de Railway requieren Redis
  - Archivo: `apps/api/src/__tests__/railway-readiness.spec.ts:16`
  - Tests skippeados hasta configurar Redis en CI
  - **Fix:** Configurar Redis en CI o mockear para tests

---

## 🟡 MEDIOS (Primer mes)

- [ ] **[MED-001]** Schema Equipo deprecado sin migración
  - Archivo: `apps/api/prisma/schema.prisma`
  - El modelo `Equipo` está deprecado pero todavía existe
  - **Fix:** Crear migración para eliminar o consolidar con Casa

- [ ] **[MED-002]** Campo mustChangePassword no tipado correctamente
  - Archivo: `apps/api/src/auth/auth.controller.ts:226-229`
  - Se usa `as { mustChangePassword?: boolean }` en lugar de tipo explícito
  - **Fix:** Tipar correctamente el resultado del orchestrator

- [ ] **[MED-003]** Métricas Prometheus solo en pagos
  - Archivo: `apps/api/src/pagos/`
  - Solo el módulo de pagos tiene métricas Prometheus
  - **Fix:** Agregar métricas a módulos críticos (auth, gamificación, aula-viva)

- [ ] **[MED-004]** No hay APM (Sentry/DataDog)
  - Sin tracking centralizado de errores en producción
  - **Fix:** Integrar Sentry para captura de errores y trazas

- [ ] **[MED-005]** Rate limiting webhooks muy permisivo
  - Archivo: `apps/api/src/pagos/guards/mercadopago-webhook.guard.ts`
  - Configuración actual permite muchos requests
  - **Fix:** Ajustar límites según volumen esperado de pagos

- [ ] **[MED-006]** Soft delete ausente en entidades principales
  - Estudiante, Tutor, Docente usan hard delete
  - **Fix:** Implementar soft delete con campo `deletedAt`

- [ ] **[MED-007]** Progreso de contenidos incompleto
  - Archivo: `apps/api/src/contenidos/services/progreso.service.ts:44`
  - El cálculo de porcentaje basado en nodos visitados no está implementado
  - **Fix:** Implementar lógica de progreso real

- [ ] **[MED-008]** Vinculación suscripciones-estudiantes pendiente
  - Archivo: `apps/api/src/suscripciones/services/suscripcion-query.service.ts:289`
  - El campo `estudiantes` retorna array vacío
  - **Fix:** Implementar cuando se vincule modelo con estudiantes

---

## 🟢 BAJOS (Deuda técnica)

- [ ] **[LOW-001]** Stats de comisiones sin implementar
  - Archivo: `apps/api/src/docentes/__tests__/docente-comision-estudiantes.spec.ts:560-603`
  - Hay 9 TODOs para implementar estadísticas en getComisionDetalle
  - **Fix:** Implementar método de stats cuando sea prioritario

- [ ] **[LOW-002]** Productos: expandir tipos
  - Archivo: `apps/api/src/pagos/infrastructure/adapters/producto-repository.adapter.ts:68`
  - Solo hay tipos básicos de productos definidos
  - **Fix:** Expandir cuando se agreguen más tipos

- [ ] **[LOW-003]** OpenAI para alertas (futuro)
  - Archivo: `apps/api/src/admin/services/admin-alertas.service.ts:84,109`
  - Placeholder para sugerencias dinámicas con IA
  - **Fix:** Integrar cuando sea prioritario

- [ ] **[LOW-004]** Calendario docente: modal de clases
  - Archivo: `apps/web/src/app/docente/calendario/page.tsx:242,251`
  - Modal para mostrar clases del día no implementado
  - **Fix:** Implementar cuando mejoremos UX calendario

- [ ] **[LOW-005]** Canal comunicación: sistema forum
  - Archivo: `apps/web/src/app/estudiante/clases/components/CanalComunicacion.tsx:56`
  - Sistema de forum pospuesto para post-lanzamiento
  - **Fix:** Implementar en fase 2

- [ ] **[LOW-006]** Accesibilidad CreateDocenteForm
  - Archivo: `apps/web/src/components/admin/__tests__/CreateDocenteForm.improvements.spec.tsx:21`
  - Faltan atributos de accesibilidad
  - **Fix:** Agregar aria-labels y roles

---

## 📋 Checklist Pre-Lanzamiento

### Seguridad

- [ ] Todos los CRIT-\* resueltos
- [ ] Audit de IDOR completado (HIGH-001 resuelto)
- [ ] CSRF en todos los endpoints de login
- [ ] Logs sanitizados (sin datos sensibles)

### Estabilidad

- [ ] Build sin ignorar errores (HIGH-004)
- [ ] Non-null assertions validados (HIGH-003)
- [ ] .env.example documentados (CRIT-003)

### Datos

- [ ] Cascades revisados (CRIT-005)
- [x] Unique constraints agregados (CRIT-006) ✅

### Observabilidad

- [ ] Sentry/APM configurado
- [ ] Métricas en módulos críticos

---

## 📝 Notas

- Los issues CRÍTICOS deben resolverse ANTES del lanzamiento
- Los issues ALTOS deben tener tickets creados para primera semana
- Los issues MEDIOS pueden esperar al primer mes
- Los issues BAJOS son deuda técnica aceptable

**Referencia:** Ver `/docs/AUDIT_PRODUCTION_READINESS.md` para detalles completos del audit.
