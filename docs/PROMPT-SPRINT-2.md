# Prompt para Iniciar Sprint 2: Mejoras de Seguridad Adicionales

## Contexto General

Soy desarrollador del proyecto **Mateatletas Ecosystem**, un sistema de gestión para una academia deportiva. Acabamos de completar el **Sprint 1: Correcciones Críticas de Seguridad** donde resolvimos 7 vulnerabilidades críticas en el módulo de inscripciones 2026.

**IMPORTANTE:** Antes de comenzar, lee la documentación completa del Sprint 1:
- Archivo: `docs/SPRINT-1-CORRECCIONES-CRITICAS.md`
- Ubicación: `/home/alexis/Documentos/Mateatletas-Ecosystem/docs/SPRINT-1-CORRECCIONES-CRITICAS.md`

Esta documentación contiene:
- Las 7 vulnerabilidades que resolvimos
- Soluciones implementadas con código
- **Errores que cometimos y lecciones aprendidas** (MUY IMPORTANTE)
- Estándares de seguridad cumplidos
- Estado actual: 73/73 tests pasando

---

## Contexto del Proyecto

### Arquitectura
- **Monorepo:** TurboRepo con workspaces
- **Backend:** NestJS + Prisma ORM + PostgreSQL
- **Frontend:** Next.js (no modificaremos en este sprint)
- **Ubicación del código:** `apps/api/src/`

### Módulos Principales
- `inscripciones-2026/` - Sistema de inscripciones (donde trabajamos en Sprint 1)
- `pagos/` - Integración con MercadoPago
- `auth/` - Autenticación y autorización
- `core/` - Database, configuración, shared services

### Tecnologías Clave
- NestJS 10.x
- Prisma ORM 5.x
- PostgreSQL 15
- Jest para testing
- MercadoPago SDK

---

## Estado Actual (Post Sprint 1)

### Vulnerabilidades Resueltas
✅ Webhooks duplicados (idempotencia)
✅ Fraude por manipulación de montos
✅ Webhooks de testing en producción
✅ Escalación de privilegios
✅ Acceso no autorizado a datos
✅ Doble procesamiento de pagos
✅ Inconsistencia de base de datos

### Tests
- **Total:** 73/73 pasando (100%)
- **Archivos de tests:** 8
- **Cobertura:** 100% de vulnerabilidades críticas

### Commits del Sprint 1
```
d2175df - feat(security): implementar idempotencia en webhooks
48baee8 - feat(security): implementar validación de montos en webhooks
a2729f2 - feat(seguridad): validar live_mode en webhooks MercadoPago
b0d0665 - feat(seguridad): agregar RolesGuard en PATCH /estado
49756bd - feat(seguridad): agregar OwnershipGuard en GET /:id
68079a3 - feat(seguridad): agregar unique constraint a mercadopago_payment_id
525c5f2 - feat(inscripciones-2026): implementar transacciones atómicas
a3fcb0b - test(inscripciones-2026): agregar tests de rollback atómico
c7beb64 - docs: agregar documentación completa del Sprint 1
```

---

## Objetivo del Sprint 2: Mejoras de Seguridad Adicionales

Ahora que hemos resuelto las vulnerabilidades críticas, necesitamos implementar **capas adicionales de seguridad** para:
1. **Detectar y prevenir ataques proactivamente**
2. **Cumplir con estándares de compliance** (GDPR, ISO 27001)
3. **Generar visibilidad y trazabilidad** de eventos de seguridad

---

## Tareas del Sprint 2

### PASO 2.1: Rate Limiting en Webhooks
**Problema a resolver:**
- Sin rate limiting, un atacante puede enviar 10,000 webhooks/segundo → DoS
- El servidor se sobrecarga y deja de responder a usuarios legítimos

**Solución esperada:**
- Implementar throttler en endpoint `/inscripciones-2026/webhook/mercadopago`
- Límite: **100 requests por minuto por IP**
- Retornar HTTP 429 (Too Many Requests) cuando se exceda
- Tests que verifiquen el límite

**Archivos a modificar:**
- `apps/api/src/inscripciones-2026/inscripciones-2026.controller.ts`
- Crear: `apps/api/src/inscripciones-2026/guards/webhook-rate-limit.guard.ts`
- Crear tests: `apps/api/src/inscripciones-2026/__tests__/inscripciones-2026-rate-limit.spec.ts`

**Estándares:**
- OWASP A05:2021 - Security Misconfiguration
- ISO 27001 A.14.2.8 - System security testing

---

### PASO 2.2: Auditoría de Cambios
**Problema a resolver:**
- No hay registro de QUIÉN cambió QUÉ y CUÁNDO
- En caso de incidente, no podemos rastrear el origen del problema
- No cumplimos GDPR Art. 30 (Records of processing activities)

**Solución esperada:**
- Crear tabla `audit_logs` en Prisma schema
- Loguear automáticamente todos los cambios de estado en inscripciones
- Incluir: usuario, timestamp, IP, user agent, cambio anterior, cambio nuevo
- Service `AuditLogService` para gestionar logs
- Tests que verifiquen logging automático

**Archivos a crear:**
- Migración Prisma: `prisma/migrations/XXX_create_audit_logs.sql`
- `apps/api/src/audit/audit-log.service.ts`
- `apps/api/src/audit/audit-log.module.ts`
- Tests: `apps/api/src/audit/__tests__/audit-log.service.spec.ts`

**Archivos a modificar:**
- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts` (agregar logging)
- `apps/api/prisma/schema.prisma` (agregar modelo AuditLog)

**Estándares:**
- GDPR Art. 30 - Records of processing activities
- ISO 27001 A.12.4.1 - Event logging
- ISO 27001 A.12.4.3 - Administrator and operator logs

---

### PASO 2.3: Alertas de Fraude
**Problema a resolver:**
- Si se detecta fraude (monto incorrecto, webhook duplicado), nadie se entera hasta días después
- No hay notificación inmediata a admins
- Pérdidas financieras pueden acumularse sin detección

**Solución esperada:**
- Crear servicio `FraudAlertService` que envíe emails a admins
- Integrar con servicio de email (ej: SendGrid, AWS SES, o Nodemailer)
- Enviar alerta cuando:
  - Se detecta monto incorrecto en webhook
  - Se detecta webhook duplicado
  - Se detecta intento de escalación de privilegios
  - Se detecta acceso no autorizado
- Panel de alertas en dashboard (opcional para este sprint)
- Tests que verifiquen envío de alertas

**Archivos a crear:**
- `apps/api/src/fraud-alerts/fraud-alert.service.ts`
- `apps/api/src/fraud-alerts/fraud-alert.module.ts`
- `apps/api/src/fraud-alerts/dto/fraud-alert.dto.ts`
- Tests: `apps/api/src/fraud-alerts/__tests__/fraud-alert.service.spec.ts`

**Archivos a modificar:**
- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts` (llamar a FraudAlertService)
- `apps/api/src/pagos/services/payment-amount-validator.service.ts` (llamar a FraudAlertService)
- `apps/api/src/pagos/services/webhook-idempotency.service.ts` (llamar a FraudAlertService)

**Estándares:**
- PCI DSS Req 10.6 - Review logs and security events
- ISO 27001 A.16.1.2 - Reporting information security events

---

### PASO 2.4: Monitoreo de Seguridad
**Problema a resolver:**
- No tenemos visibilidad de qué está pasando en el sistema
- No sabemos cuántos webhooks se rechazan diariamente
- No sabemos si hay patrones de ataque

**Solución esperada:**
- Crear servicio `SecurityMetricsService` para recopilar métricas
- Métricas a trackear:
  - Webhooks rechazados por live_mode (por día)
  - Webhooks duplicados detectados (por día)
  - Intentos de acceso no autorizado (por día)
  - Montos rechazados por validación (por día)
  - Rate limits alcanzados (por IP)
- Endpoint GET `/api/security/metrics` (solo admin)
- Tests que verifiquen cálculo de métricas

**Archivos a crear:**
- `apps/api/src/security-metrics/security-metrics.service.ts`
- `apps/api/src/security-metrics/security-metrics.controller.ts`
- `apps/api/src/security-metrics/security-metrics.module.ts`
- Tests: `apps/api/src/security-metrics/__tests__/security-metrics.service.spec.ts`

**Opcional (si hay tiempo):**
- Integración con Grafana/Prometheus para dashboards visuales

**Estándares:**
- ISO 27001 A.12.4.1 - Event logging
- NIST Cybersecurity Framework - Detect (DE)

---

## Lineamientos de Trabajo (MUY IMPORTANTE)

### 1. Metodología TDD Estricta
**APRENDIMOS EN SPRINT 1 QUE:**
- NO se implementa código sin tests primero
- El ciclo es: **RED → GREEN → REFACTOR**
  1. Escribir test que falle (RED)
  2. Implementar código mínimo para que pase (GREEN)
  3. Refactorizar (REFACTOR)

**Proceso para cada PASO:**
1. Crear archivo de tests con todos los casos (RED phase)
2. Ejecutar tests y verificar que fallan
3. Implementar código de producción
4. Ejecutar tests y verificar que pasan (GREEN phase)
5. Refactorizar si es necesario
6. Crear commit atómico

### 2. Tipos Explícitos (No any/unknown)
- **NUNCA usar `any` en código de producción**
- **NUNCA usar `unknown` sin type guards**
- Todos los parámetros, retornos y variables deben tener tipos explícitos
- TypeScript en modo estricto

### 3. Commits Atómicos y Descriptivos
Formato de commits:
```
tipo(scope): descripción corta

PROBLEMA:
- Descripción del problema que resuelve

SOLUCIÓN:
- Descripción de la solución implementada

CAMBIOS:
- Archivo 1: Qué se modificó
- Archivo 2: Qué se modificó

TESTING:
- X/Y tests pasando
- Cobertura de casos

ESTÁNDARES:
- Estándar 1 (ej: OWASP A01:2021)
- Estándar 2 (ej: GDPR Art. 32)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 4. Documentación de Errores
**SI COMETES UN ERROR:**
1. Admítelo inmediatamente
2. Documenta el error en el commit de corrección
3. Incluye la lección aprendida
4. NO ocultes errores ni confundas con narrativas inconsistentes

### 5. Ejecución Metódica
- Trabajar **UN PASO A LA VEZ**
- NO saltar al siguiente paso hasta que el actual esté 100% completo
- Ejecutar tests después de CADA cambio
- Verificar que NO se rompan tests existentes

### 6. Zero Regresión
- Antes de cada commit, ejecutar **TODA** la suite de tests
- Verificar que todos los tests del Sprint 1 sigan pasando
- Si se rompe algo, arreglarlo antes de hacer commit

---

## Resultado Esperado del Sprint 2

### Al Final del Sprint 2 Deberíamos Tener:

**Código:**
- ✅ Rate limiting en webhooks (PASO 2.1)
- ✅ Sistema de auditoría completo (PASO 2.2)
- ✅ Alertas automáticas de fraude (PASO 2.3)
- ✅ Dashboard de métricas de seguridad (PASO 2.4)

**Tests:**
- ✅ ~20-30 tests nuevos (además de los 73 existentes)
- ✅ 100% de tests pasando (sin regresión)
- ✅ Cobertura de todos los casos críticos

**Documentación:**
- ✅ `docs/SPRINT-2-MEJORAS-SEGURIDAD.md` con:
  - Problemas resueltos
  - Soluciones implementadas
  - Tests creados
  - **Errores cometidos y lecciones aprendidas**
  - Estándares cumplidos

**Compliance:**
- ✅ GDPR Art. 30 (Records of processing activities)
- ✅ ISO 27001 A.12.4.1 (Event logging)
- ✅ ISO 27001 A.16.1.2 (Reporting security events)
- ✅ PCI DSS Req 10.6 (Review logs)
- ✅ OWASP A05:2021 (Security Misconfiguration)

---

## Instrucciones para el Asistente

### Al Comenzar:
1. **LEE** `docs/SPRINT-1-CORRECCIONES-CRITICAS.md` completo
2. **ENTIENDE** los errores que cometimos en Sprint 1
3. **APLICA** los lineamientos de trabajo aprendidos
4. **PREGUNTA** si algo no está claro ANTES de empezar a codear

### Durante el Sprint:
1. **TDD ESTRICTO:** Tests primero, código después
2. **UN PASO A LA VEZ:** No saltes pasos
3. **EJECUTA TESTS:** Después de cada cambio
4. **COMMITS ATÓMICOS:** Un commit por cada PASO completado
5. **DOCUMENTA ERRORES:** Si te equivocas, admítelo y documéntalo

### Al Terminar:
1. Verificar que los 73 tests del Sprint 1 sigan pasando
2. Crear documentación completa del Sprint 2
3. Incluir sección de errores y lecciones aprendidas
4. Commit final con la documentación

---

## Preguntas Frecuentes

**P: ¿Puedo usar librerías externas?**
R: Sí, pero primero consulta. Preferimos usar librerías estándar de NestJS cuando sea posible.

**P: ¿Qué hago si un test es muy difícil de escribir?**
R: NO lo elimines. Pide ayuda para simplificarlo. Tests difíciles = diseño complejo.

**P: ¿Puedo modificar código del Sprint 1?**
R: Solo si es necesario para integrar las nuevas features. NO refactorices sin razón.

**P: ¿Qué hago si rompo un test del Sprint 1?**
R: Arréglalo INMEDIATAMENTE antes de continuar. Zero regresión.

**P: ¿Necesito crear migraciones de Prisma?**
R: Sí, para el PASO 2.2 (tabla audit_logs). Usa `npx prisma migrate dev --name create_audit_logs`.

---

## Comenzar el Sprint 2

**Prompt sugerido para empezar:**

```
Voy a comenzar el Sprint 2: Mejoras de Seguridad Adicionales del proyecto Mateatletas Ecosystem.

IMPORTANTE:
1. Lee primero el archivo docs/SPRINT-1-CORRECCIONES-CRITICAS.md para entender:
   - El contexto del proyecto
   - Las vulnerabilidades que ya resolvimos
   - Los errores que cometimos y las lecciones aprendidas

2. Vamos a trabajar siguiendo TDD ESTRICTO:
   - Tests primero (RED phase)
   - Implementación después (GREEN phase)
   - Refactorización si es necesario

3. Empezaremos con el PASO 2.1: Rate Limiting en Webhooks

¿Estás listo para comenzar? Confirma que leíste la documentación del Sprint 1 y entendiste los lineamientos de trabajo.
```

---

## Archivos de Referencia

**Documentación:**
- `docs/SPRINT-1-CORRECCIONES-CRITICAS.md` - Documentación completa del Sprint 1

**Código de referencia del Sprint 1:**
- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts` - Implementación de webhooks
- `apps/api/src/pagos/services/webhook-idempotency.service.ts` - Ejemplo de servicio bien hecho
- `apps/api/src/pagos/services/payment-amount-validator.service.ts` - Ejemplo de validación
- `apps/api/src/inscripciones-2026/guards/inscripcion-ownership.guard.ts` - Ejemplo de guard

**Tests de referencia:**
- `apps/api/src/inscripciones-2026/__tests__/inscripciones-2026-idempotency.spec.ts` - Ejemplo de tests completos
- `apps/api/src/inscripciones-2026/__tests__/inscripciones-2026-atomic-rollback.spec.ts` - Ejemplo de tests de rollback

---

## Contacto

Si tienes dudas o necesitas aclaraciones, pregunta ANTES de empezar a codear.

**Principio fundamental:** Es mejor preguntar y hacer las cosas bien la primera vez, que asumir y tener que corregir después.

¡Éxito en el Sprint 2! 🚀