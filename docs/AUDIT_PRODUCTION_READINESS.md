# AUDITORÍA DE PRODUCTION READINESS - MATEATLETAS ECOSYSTEM

**Fecha:** 2026-01-23
**Versión:** 1.0
**Auditor:** Claude Opus 4.5 (Multi-Agent System)
**Metodología:** Basada en mejores prácticas 2025/2026 ([Production Readiness Checklist](https://www.cortex.io/post/how-to-create-a-great-production-readiness-checklist), [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices))

---

## RESUMEN EJECUTIVO

| Dimensión                    | Estado          | Issues Críticos        | Riesgo     |
| ---------------------------- | --------------- | ---------------------- | ---------- |
| Consistencia de Datos/Schema | ✅ EXCELENTE    | 2                      | BAJO       |
| Consistencia de Tipos        | ⚠️ MODERADO     | 10                     | MEDIO      |
| Testing Gaps                 | ❌ INSUFICIENTE | 44 servicios sin tests | ALTO       |
| Seguridad                    | ⚠️ MODERADO     | 4 IDOR                 | MEDIO-ALTO |
| Observabilidad               | ⚠️ MODERADO     | 8                      | MEDIO      |
| Configuración/Env            | ⚠️ MODERADO     | 4 críticos             | MEDIO-ALTO |
| Integridad Referencial       | ⚠️ MODERADO     | 3                      | MEDIO-ALTO |

**VEREDICTO GENERAL:** El proyecto tiene arquitectura sólida pero **NO está listo para producción** sin resolver los issues críticos identificados.

---

## 1. ISSUES CRÍTICOS (Bloquean Lanzamiento)

### 1.1 SEGURIDAD: IDOR en LogrosController

**Archivo:** `apps/api/src/gamificacion/controllers/logros.controller.ts:43-107`

**Problema:** Endpoints de logros permiten acceder a datos de cualquier estudiante sin validar ownership.

**Vector de ataque:** Un estudiante puede enumerar logros de CUALQUIER otro estudiante cambiando el `estudianteId`.

**Fix requerido:**

```typescript
// Agregar EstudianteOwnershipGuard
@UseGuards(EstudianteOwnershipGuard)
@Get('estudiante/:estudianteId')
```

**Severidad:** 🔴 CRÍTICA

---

### 1.2 SEGURIDAD: Endpoint Desbloquear Logros sin Admin

**Archivo:** `apps/api/src/gamificacion/controllers/logros.controller.ts:99-107`

**Problema:** POST `/gamificacion/logros/desbloquear` permite a CUALQUIER usuario autenticado desbloquear logros de cualquier estudiante.

**Fix requerido:**

```typescript
@Roles(Role.ADMIN) // Cambiar de @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
```

**Severidad:** 🔴 CRÍTICA

---

### 1.3 CONFIGURACIÓN: Falta .env.example

**Ubicación:** Raíz del proyecto, apps/api, apps/web

**Problema:** No existe documentación de variables de entorno requeridas. Nuevos desarrolladores y deploys pueden fallar.

**Fix requerido:** Crear `.env.example` con todas las variables documentadas (ver sección 6 del reporte de configuración).

**Severidad:** 🔴 CRÍTICA

---

### 1.4 CONFIGURACIÓN: WebSocket URL Hardcodeada

**Archivo:** `apps/web/src/hooks/useAulaViva.tsx:114`

```typescript
const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
```

**Problema:** Si `NEXT_PUBLIC_API_URL` no está configurada en producción, WebSocket apunta a localhost.

**Fix requerido:**

```typescript
const wsUrl = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL no configurada en producción');
  }
  return apiUrl?.replace('/api', '') || 'http://localhost:3001';
})();
```

**Severidad:** 🔴 CRÍTICA

---

### 1.5 INTEGRIDAD: Cascade Tutor → Estudiante

**Archivo:** `apps/api/prisma/schema.prisma`

**Problema:** Si se borra un Tutor, se borran en cascada TODOS sus estudiantes, inscripciones, progreso, XP, logros, etc.

**Impacto:** Borrado accidental de tutor = pérdida masiva de datos irrecuperable.

**Fix requerido:**

```prisma
model Estudiante {
  tutor Tutor @relation(fields: [tutorId], references: [id], onDelete: Restrict)
}
```

**Severidad:** 🔴 CRÍTICA

---

### 1.6 INTEGRIDAD: Unique Constraints Faltantes

**Archivos:**

- `InscripcionClaseGrupo` - línea ~1116
- `InscripcionComision` - línea ~1180

**Problema:** Un estudiante puede inscribirse múltiples veces al mismo grupo/comisión.

**Fix requerido:**

```prisma
@@unique([claseGrupoId, estudianteId])
@@unique([comisionId, estudianteId])
```

**Severidad:** 🔴 CRÍTICA

---

## 2. ISSUES ALTOS (Resolver Primera Semana)

### 2.1 TESTING: Cobertura E2E Insuficiente

**Estado actual:** 7 archivos E2E para 374 endpoints (~1.9% cobertura)

**Módulos sin tests E2E:**
| Módulo | Endpoints | Prioridad |
|--------|-----------|-----------|
| Pagos | 53 | P0 |
| Admin | 77 | P0 |
| Auth | 25 | P0 |
| Suscripciones | 25 | P0 |
| Docentes | 39 | P1 |
| Estudiantes | 24 | P1 |

**Servicios críticos sin tests unitarios:** 44 servicios

**Impacto:** Bugs en producción no detectados, regresiones frecuentes.

---

### 2.2 TIPOS: Non-null Assertions sin Validación

**Archivos afectados:**

- `apps/api/src/estudiantes/services/acceso-estudiante.service.ts:362` - `estudiante.plan!`
- `apps/api/src/auth/auth.service.ts:311` - `usuario!.passwordHash!`
- `apps/api/src/pagos/application/use-cases/calcular-precio.use-case.ts:180,193` - Maps sin null check
- `apps/api/src/aula-viva/aula-viva.gateway.ts` - 10 ocurrencias

**Problema:** Runtime crashes si valores son null/undefined.

**Fix:** Agregar validaciones explícitas antes de usar `!`.

---

### 2.3 SEGURIDAD: IDOR en AsistenciaController

**Archivo:** `apps/api/src/asistencia/asistencia.controller.ts:85-95`

**Problema:** Un tutor puede ver historial de asistencia de estudiantes que NO son sus hijos.

---

### 2.4 SEGURIDAD: Login Estudiante sin CSRF

**Archivo:** `apps/api/src/auth/auth.controller.ts:266-310`

**Problema:** El endpoint de login estudiante no tiene `@RequireCsrf()` (el login de tutor sí lo tiene).

---

### 2.5 OBSERVABILIDAD: Alertas Solo en Logs

**Problema:** Eventos críticos (chargebacks, fraude, caídas) solo se loggean, no se notifican.

**Fix:** Implementar AlertService con integración Slack/Email.

---

### 2.6 CONFIGURACIÓN: ESLint/TypeScript Ignorados en Build

**Archivo:** `apps/web/next.config.js:5-10`

```javascript
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true }
```

**Problema:** Permite deployar código con errores de tipos.

---

### 2.7 CONFIGURACIÓN: Logs con Datos Sensibles

**Archivo:** `apps/api/src/pagos/guards/mercadopago-webhook.guard.ts:447-457`

**Problema:** Debug logs exponen firmas de webhook y payload parcial.

---

### 2.8 INTEGRIDAD: Campos sin FK en Tarea

**Archivo:** `apps/api/prisma/schema.prisma:1529-1531`

**Problema:** `claseRelacionadaId` y `estudianteRelacionadoId` sin relación definida.

---

## 3. ISSUES MEDIOS (Backlog Prioritario)

### 3.1 SCHEMA: Modelo Equipo Deprecado

**Archivo:** `packages/contracts/src/schemas/equipo.schema.ts`

El modelo `Equipo` fue reemplazado por `Casa` pero aún existe código que lo referencia.

**Fix:** Marcar como `@deprecated` y migrar gradualmente.

---

### 3.2 TIPOS: Campo mustChangePassword no Tipado

**Archivo:** `apps/web/src/store/auth.store.ts:143`

Backend envía `mustChangePassword` pero no está en el tipo de respuesta.

---

### 3.3 OBSERVABILIDAD: Métricas Solo en Pagos

**Problema:** PrometheusService solo se usa en módulo de pagos, no hay visibilidad del 90% del sistema.

---

### 3.4 OBSERVABILIDAD: No Hay APM

**Problema:** Sin integración con Sentry, DataDog, o New Relic para tracing distribuido.

---

### 3.5 SEGURIDAD: Rate Limiting Webhooks Permisivo

**Archivo:** `apps/api/src/pagos/presentation/controllers/pagos.controller.ts:311`

300 req/min es muy alto para webhooks.

---

### 3.6 CONFIGURACIÓN: Timeouts No Configurables

Múltiples timeouts hardcodeados que deberían ser env vars.

---

### 3.7 INTEGRIDAD: Soft Delete Ausente

No hay patrón de `deletedAt` en entidades principales (Tutor, Docente, Estudiante).

---

## 4. ISSUES BAJOS (Nice to Have)

### 4.1 SCHEMA: Falta Schema ClaseGrupo en Contracts

DTOs del backend tienen validación pero no está compartida en contracts.

### 4.2 TIPOS: Enums Duplicados Frontend/Prisma

El frontend redefine enums que ya genera Prisma Client.

### 4.3 OBSERVABILIDAD: Console.log en Tests

29 console.log en archivos de test (no afecta producción).

### 4.4 INTEGRIDAD: Check Constraints Faltantes

Validaciones de rango (edad, porcentaje, precio) deberían ser constraints DB.

---

## 5. MÉTRICAS DEL PROYECTO

| Métrica                 | Valor      |
| ----------------------- | ---------- |
| Líneas en Prisma Schema | 4,118      |
| Modelos Prisma          | 69         |
| Controllers             | 36         |
| Services                | 139        |
| DTOs Backend            | 89         |
| Archivos Test E2E       | 7          |
| Endpoints Totales       | ~374       |
| `@Public()` Endpoints   | 16         |
| Cascades Configurados   | 110 (100%) |
| Unique Constraints      | 56         |
| Índices                 | 193        |

---

## 6. FORTALEZAS IDENTIFICADAS

### Arquitectura

- ✅ Clean Architecture con CQRS en módulos críticos
- ✅ Contracts compartidos (`@mateatletas/contracts`) como Single Source of Truth
- ✅ 100% de campos Prisma con `@map()` correcto (569 campos)
- ✅ Zero inconsistencias snake_case vs camelCase

### Seguridad

- ✅ Helmet bien configurado con CSP, HSTS, X-Frame-Options
- ✅ CORS restrictivo en producción
- ✅ ValidationPipe robusto (whitelist, forbidNonWhitelisted)
- ✅ Rate Limiting distribuido con Redis
- ✅ JWT con HttpOnly Cookies
- ✅ Passwords excluidos de selects
- ✅ Token Blacklist implementado
- ✅ Webhook HMAC Validation

### Observabilidad

- ✅ Logger estructurado con Winston
- ✅ Exception Filters globales (AllExceptions, Http, Prisma)
- ✅ Health Checks completos (DB, Redis, Cache, Throttler, Memory)
- ✅ Request context propagation

---

## 7. CHECKLIST PRE-LANZAMIENTO

### Críticos (Bloqueantes)

- [ ] Agregar EstudianteOwnershipGuard a LogrosController
- [ ] Restringir endpoint desbloquear logros a Admin
- [ ] Crear .env.example completo
- [ ] Validar NEXT_PUBLIC_API_URL antes de crear WebSocket
- [ ] Cambiar cascade Tutor→Estudiante a Restrict
- [ ] Agregar unique constraints a inscripciones

### Altos (Primera Semana)

- [ ] Escribir 30 tests E2E para Pagos, Auth, Suscripciones
- [ ] Fix non-null assertions en servicios críticos
- [ ] Agregar @RequireCsrf() a login estudiante
- [ ] Implementar AlertService con Slack/Email
- [ ] Habilitar ESLint/TypeScript en builds
- [ ] Eliminar logs con datos sensibles

### Medios (Primer Mes)

- [ ] Marcar Equipo schema como deprecated
- [ ] Expandir métricas Prometheus a todos los módulos
- [ ] Integrar Sentry para error tracking
- [ ] Implementar soft delete en entidades principales

---

## 8. ROADMAP DE TESTING SUGERIDO

### Fase 1 (P0 - Críticos): 100 tests E2E

- Pagos (30 tests)
- Auth (25 tests)
- Suscripciones (30 tests)
- Acceso Estudiante (15 tests)

### Fase 2 (P1 - Altos): 150 tests E2E

- Admin CRUD (60 tests)
- Docentes Portal (30 tests)
- Estudiantes Portal (40 tests)
- Contenidos (20 tests)

### Fase 3 (P2 - Medios): 80 tests E2E

- Gamificación (25 tests)
- Notificaciones (15 tests)
- Otros módulos (40 tests)

### Fase 4 (P3 - Bajos): 20 tests E2E

- Metadata y Health

**Total estimado:** ~450 tests nuevos

---

## 9. ARCHIVOS ESENCIALES PARA REMEDIATION

### Seguridad

1. `apps/api/src/gamificacion/controllers/logros.controller.ts`
2. `apps/api/src/asistencia/asistencia.controller.ts`
3. `apps/api/src/auth/auth.controller.ts`
4. `apps/api/src/estudiantes/guards/estudiante-ownership.guard.ts`

### Configuración

5. `apps/api/src/main.ts`
6. `apps/web/next.config.js`
7. `apps/web/src/hooks/useAulaViva.tsx`
8. `apps/api/src/pagos/guards/mercadopago-webhook.guard.ts`

### Integridad

9. `apps/api/prisma/schema.prisma`

### Testing

10. `apps/api/test/TESTING.md`
11. `apps/api/test/fixtures/factories/scenarios.factory.ts`

---

## 10. CONCLUSIÓN

El ecosistema Mateatletas tiene una **arquitectura de calidad** con buenas prácticas de seguridad, naming consistente, y contratos compartidos. Sin embargo, presenta **gaps críticos** que deben resolverse antes del lanzamiento:

1. **Seguridad:** 4 vulnerabilidades IDOR que permiten acceso no autorizado a datos
2. **Testing:** Solo 1.9% de cobertura E2E - alto riesgo de regresiones
3. **Configuración:** Variables críticas sin documentar, WebSocket puede apuntar a localhost en prod
4. **Integridad:** Cascade peligroso puede causar pérdida masiva de datos

**Recomendación:** Resolver los 6 issues críticos de la sección 1 ANTES de cualquier deploy a producción. Estimar 2-3 días de trabajo para los fixes críticos y 2 semanas para los issues altos.

---

**Firma Digital:** Claude Opus 4.5 (Multi-Agent Audit System)
**Fecha:** 2026-01-23
