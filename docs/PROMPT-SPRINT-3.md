# Prompt para Iniciar Sprint 3: Optimización de Performance

## Contexto General

Soy desarrollador del proyecto **Mateatletas Ecosystem**, una plataforma educativa de matemáticas con gamificación, gestión de clases y múltiples portales. Hemos completado dos sprints importantes:

- **Sprint 1:** Correcciones Críticas de Seguridad (7 vulnerabilidades resueltas)
- **Sprint 2:** Mejoras de Seguridad Adicionales (rate limiting, auditoría, alertas, monitoreo)

**IMPORTANTE:** Antes de comenzar, lee la documentación de sprints anteriores:

1. `docs/SPRINT-1-CORRECCIONES-CRITICAS.md` - Vulnerabilidades resueltas, errores cometidos
2. `docs/SPRINT-2-MEJORAS-SEGURIDAD.md` - Mejoras de seguridad implementadas

Esta documentación contiene:

- Estado actual del sistema
- Soluciones implementadas
- **Errores cometidos y lecciones aprendidas** (MUY IMPORTANTE)
- Lineamientos de trabajo establecidos
- Estándares de seguridad cumplidos

---

## Contexto del Proyecto

### Arquitectura

- **Monorepo:** TurboRepo con workspaces
- **Backend:** NestJS + Prisma ORM + PostgreSQL
- **Frontend:** Next.js (no modificaremos en este sprint)
- **Caching:** Redis (implementaremos en este sprint)
- **Queue:** Bull/BullMQ (implementaremos en este sprint)
- **Ubicación del código:** `apps/api/src/`

### Módulos Principales

- `inscripciones-2026/` - Sistema de inscripciones (optimizaremos)
- `pagos/` - Integración con MercadoPago (optimizaremos)
- `auth/` - Autenticación y autorización
- `core/` - Database, configuración, shared services
- `audit/` - Sistema de auditoría (Sprint 2)
- `fraud-alerts/` - Alertas de fraude (Sprint 2)
- `security-metrics/` - Monitoreo de seguridad (Sprint 2)

### Tecnologías Clave

- NestJS 10.x
- Prisma ORM 5.x
- PostgreSQL 15
- **Redis 7.x** (nuevo en Sprint 3)
- **Bull/BullMQ** (nuevo en Sprint 3)
- Jest para testing

---

## Estado Actual (Post Sprint 1 y 2)

### Sprint 1: Vulnerabilidades Resueltas

✅ Webhooks duplicados (idempotencia)
✅ Fraude por manipulación de montos
✅ Webhooks de testing en producción
✅ Escalación de privilegios
✅ Acceso no autorizado a datos
✅ Doble procesamiento de pagos
✅ Inconsistencia de base de datos

### Sprint 2: Mejoras de Seguridad

✅ Rate limiting en webhooks (100 req/min por IP)
✅ Sistema de auditoría completo (tabla audit_logs)
✅ Alertas automáticas de fraude (emails a admins)
✅ Dashboard de métricas de seguridad

### Tests Actuales

- **Total:** ~93-100 tests (dependiendo de Sprint 2)
- **Cobertura:** 100% de vulnerabilidades críticas
- **Estado:** Todos pasando

### Problemas de Performance Detectados

**Problema #1: Latencia Alta en Webhooks**

- Tiempo de respuesta actual: 800-1200ms
- Queries a DB: 5-7 por webhook
- Sin caching → cada request golpea la DB

**Problema #2: Picos de Tráfico**

- MercadoPago puede enviar 100+ webhooks simultáneos
- Procesamiento síncrono → timeout si hay pico
- Riesgo: perder webhooks importantes

**Problema #3: Queries Lentas**

- Queries sin índices: 200-500ms
- Full table scans en tablas grandes
- Reportes lentos (> 5 segundos)

---

## Objetivo del Sprint 3: Optimización de Performance

Ahora que el sistema es **seguro y auditable**, necesitamos hacerlo **rápido y escalable**:

1. **Reducir latencia** de webhooks en 70-80%
2. **Manejar picos de tráfico** sin timeouts
3. **Optimizar queries** para sub-100ms
4. **Preparar para escala** (10,000+ inscripciones)

**Métricas objetivo:**

- Latencia webhooks: < 200ms (actualmente ~1000ms)
- Throughput: 1000+ webhooks/min (actualmente ~100/min)
- Query time: < 100ms (actualmente 200-500ms)
- Uptime: 99.9% durante picos de tráfico

---

## Tareas del Sprint 3

### PASO 3.1: Caching de Validaciones con Redis

**Problema a resolver:**

- `wasProcessed()` consulta DB en CADA webhook → 50-100ms
- Validación de montos consulta pago en DB → 100-200ms
- Mismo payment_id se valida múltiples veces (reintentos de MP)

**Solución esperada:**

```typescript
// ❌ ANTES: Sin caching (lento)
async wasProcessed(paymentId: string): Promise<boolean> {
  const record = await this.prisma.webhooksProcessed.findUnique({
    where: { payment_id: paymentId }
  });
  return !!record; // 50-100ms por query
}

// ✅ DESPUÉS: Con Redis caching (rápido)
async wasProcessed(paymentId: string): Promise<boolean> {
  // 1. Verificar cache (< 5ms)
  const cached = await this.redis.get(`webhook:processed:${paymentId}`);
  if (cached !== null) {
    return cached === 'true';
  }

  // 2. Si no está en cache, consultar DB
  const record = await this.prisma.webhooksProcessed.findUnique({
    where: { payment_id: paymentId }
  });

  // 3. Guardar en cache (TTL: 5 minutos)
  await this.redis.setex(
    `webhook:processed:${paymentId}`,
    300, // 5 minutos
    record ? 'true' : 'false'
  );

  return !!record;
}
```

**Implementación:**

- Instalar Redis: `npm install ioredis @nestjs/cache-manager cache-manager-ioredis-yet`
- Crear módulo `RedisModule` con configuración
- Cachear: `wasProcessed()`, validación de montos, datos de inscripciones
- TTL: 5 minutos para validaciones, 2 minutos para datos de inscripciones
- Invalidación de cache cuando cambia el estado

**Archivos a crear:**

- `apps/api/src/core/redis/redis.module.ts`
- `apps/api/src/core/redis/redis.service.ts`
- Tests: `apps/api/src/core/redis/__tests__/redis.service.spec.ts`

**Archivos a modificar:**

- `apps/api/src/pagos/services/webhook-idempotency.service.ts`
- `apps/api/src/pagos/services/payment-amount-validator.service.ts`
- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts`
- `apps/api/package.json` (agregar dependencias de Redis)

**Tests:**

- Cache hit retorna valor cacheado (< 10ms)
- Cache miss consulta DB y guarda en cache
- TTL expira correctamente después de 5 minutos
- Cache se invalida cuando cambia estado
- Manejo de errores si Redis no está disponible (fallback a DB)

**Métricas esperadas:**

- Latencia de `wasProcessed()`: 50-100ms → **< 5ms** (mejora 95%)
- Latencia de webhooks: 800-1200ms → **200-400ms** (mejora 60-70%)

---

### PASO 3.2: Batch Processing de Webhooks con Bull

**Problema a resolver:**

- MercadoPago envía 100+ webhooks simultáneos durante picos
- Procesamiento síncrono → servidor se satura → timeouts
- Webhooks perdidos → pagos no procesados → clientes sin acceso

**Solución esperada:**

```typescript
// ❌ ANTES: Procesamiento síncrono (se satura en picos)
@Post('webhook/mercadopago')
async procesarWebhookMercadoPago(@Body() webhookData: MercadoPagoWebhookDto) {
  // Procesa inmediatamente → bloquea request hasta terminar
  return await this.service.procesarWebhookMercadoPago(webhookData);
  // Tiempo: 800-1200ms
  // Problema: Si llegan 100 simultáneos → timeout
}

// ✅ DESPUÉS: Queue asíncrono (maneja picos)
@Post('webhook/mercadopago')
async procesarWebhookMercadoPago(@Body() webhookData: MercadoPagoWebhookDto) {
  // 1. Validación rápida (idempotencia en cache)
  const wasProcessed = await this.idempotency.wasProcessed(webhookData.data.id);
  if (wasProcessed) {
    return { success: true, message: 'Already queued or processed' };
  }

  // 2. Agregar a queue (< 10ms)
  await this.webhookQueue.add('process-webhook', webhookData, {
    priority: 1,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });

  // 3. Retornar inmediatamente (no esperar procesamiento)
  return { success: true, message: 'Webhook queued for processing' };
  // Tiempo: < 50ms (98% más rápido)
}

// Worker procesa webhooks en background
@Processor('webhooks')
class WebhookProcessor {
  @Process('process-webhook')
  async processWebhook(job: Job<MercadoPagoWebhookDto>) {
    // Procesa webhook en background (800-1200ms)
    return await this.service.procesarWebhookMercadoPago(job.data);
  }
}
```

**Implementación:**

- Instalar Bull: `npm install @nestjs/bull bull`
- Crear `WebhookQueue` con Bull
- Procesamiento en batches de 10-20 webhooks concurrentes
- Retry automático con exponential backoff (2s, 4s, 8s)
- Dead letter queue para webhooks fallidos
- Dashboard de Bull para monitoreo (opcional)

**Archivos a crear:**

- `apps/api/src/queues/webhook-queue.module.ts`
- `apps/api/src/queues/processors/webhook.processor.ts`
- `apps/api/src/queues/webhook-queue.service.ts`
- Tests: `apps/api/src/queues/__tests__/webhook-queue.service.spec.ts`
- Tests: `apps/api/src/queues/__tests__/webhook.processor.spec.ts`

**Archivos a modificar:**

- `apps/api/src/inscripciones-2026/inscripciones-2026.controller.ts`
- `apps/api/src/inscripciones-2026/inscripciones-2026.module.ts`
- `apps/api/package.json` (agregar dependencias de Bull)
- `docker-compose.yml` (agregar servicio de Redis si no existe)

**Tests:**

- Webhook se agrega a queue correctamente
- Worker procesa webhook en background
- Retry funciona después de fallo (exponential backoff)
- Dead letter queue captura webhooks fallidos después de 3 reintentos
- Queue maneja 100+ webhooks simultáneos sin perder ninguno
- Latencia de endpoint < 50ms (solo agregar a queue)

**Métricas esperadas:**

- Latencia de endpoint: 800-1200ms → **< 50ms** (mejora 95%)
- Throughput: 100 webhooks/min → **1000+ webhooks/min** (mejora 10x)
- Uptime durante picos: 90% → **99.9%**

---

### PASO 3.3: Optimización de Queries con Índices

**Problema a resolver:**

- Query `findFirst({ where: { inscripcion_id } })` → 200-500ms (full table scan)
- Query `findUnique({ where: { mercadopago_payment_id } })` → 100-200ms (sin índice)
- Reportes de inscripciones → > 5 segundos (sin paginación)

**Solución esperada:**

**3.3.1 Agregar Índices en Prisma:**

```prisma
// schema.prisma

model PagoInscripcion2026 {
  id                      String   @id @default(cuid())
  inscripcion_id          String
  mercadopago_payment_id  String?  @unique
  tipo                    String
  monto                   Decimal
  estado                  String
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  inscripcion Inscripcion2026 @relation(fields: [inscripcion_id], references: [id])

  // ✅ ÍNDICES AGREGADOS
  @@index([inscripcion_id])           // Query: findFirst by inscripcion_id
  @@index([estado])                   // Query: findMany by estado
  @@index([createdAt])                // Ordenamiento por fecha
  @@index([inscripcion_id, tipo])     // Composite index para query común
}

model Inscripcion2026 {
  id                String   @id @default(cuid())
  tutor_id          String
  tipo_inscripcion  String
  estado            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  tutor Tutor @relation(fields: [tutor_id], references: [id])

  // ✅ ÍNDICES AGREGADOS
  @@index([tutor_id])                 // Query: findMany by tutor_id
  @@index([estado])                   // Query: findMany by estado
  @@index([createdAt])                // Ordenamiento por fecha
  @@index([tutor_id, estado])         // Composite index para dashboard
}

model WebhooksProcessed {
  id                   String   @id @default(cuid())
  payment_id           String   @unique
  webhook_type         String
  status               String
  external_reference   String?
  processed_at         DateTime @default(now())

  // ✅ ÍNDICES AGREGADOS
  @@index([processed_at])             // Cleanup de registros antiguos
  @@index([webhook_type, status])     // Métricas de seguridad
}

model AuditLog {
  id              String   @id @default(cuid())
  entity_type     String
  entity_id       String
  action          String
  user_id         String
  ip_address      String?
  user_agent      String?
  changes         Json
  createdAt       DateTime @default(now())

  // ✅ ÍNDICES AGREGADOS
  @@index([entity_type, entity_id])   // Query: buscar logs de entidad específica
  @@index([user_id])                  // Query: buscar logs de usuario
  @@index([createdAt])                // Ordenamiento por fecha
  @@index([action])                   // Query: filtrar por tipo de acción
}
```

**3.3.2 Optimizar Queries con Select Específicos:**

```typescript
// ❌ ANTES: Trae TODO (lento)
const inscripcion = await this.prisma.inscripcion2026.findUnique({
  where: { id },
  // Trae TODAS las columnas + TODAS las relaciones
});

// ✅ DESPUÉS: Trae solo lo necesario (rápido)
const inscripcion = await this.prisma.inscripcion2026.findUnique({
  where: { id },
  select: {
    id: true,
    estado: true,
    tutor_id: true,
    // Solo las columnas necesarias
  },
});
```

**3.3.3 Implementar Paginación:**

```typescript
// ❌ ANTES: Sin paginación (lento con 10k+ registros)
@Get()
async findAll() {
  return this.prisma.inscripcion2026.findMany();
  // Trae TODOS los registros → OOM si hay 100k inscripciones
}

// ✅ DESPUÉS: Con paginación (rápido)
@Get()
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.inscripcion2026.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        estado: true,
        tipo_inscripcion: true,
        tutor: { select: { nombre: true, email: true } }
      }
    }),
    this.prisma.inscripcion2026.count()
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

**Implementación:**

- Crear migración Prisma: `npx prisma migrate dev --name add_performance_indexes`
- Modificar queries en servicios para usar `select` específicos
- Agregar paginación en endpoints de listado
- Agregar DTOs de paginación

**Archivos a crear:**

- Migración: `prisma/migrations/XXX_add_performance_indexes.sql`
- `apps/api/src/common/dto/pagination.dto.ts`
- `apps/api/src/common/dto/paginated-response.dto.ts`
- Tests: `apps/api/src/inscripciones-2026/__tests__/inscripciones-2026-pagination.spec.ts`

**Archivos a modificar:**

- `apps/api/prisma/schema.prisma` (agregar índices)
- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts` (optimizar queries)
- `apps/api/src/inscripciones-2026/inscripciones-2026.controller.ts` (agregar paginación)
- `apps/api/src/pagos/services/webhook-idempotency.service.ts` (select específicos)

**Tests:**

- Query con índice es < 50ms (vs 200-500ms sin índice)
- Paginación retorna solo el límite especificado
- Paginación funciona correctamente con 10,000+ registros
- Select específico retorna solo las columnas solicitadas
- Count total es correcto

**Métricas esperadas:**

- Query time: 200-500ms → **< 50ms** (mejora 80-90%)
- Reportes: > 5s → **< 500ms** (mejora 90%)
- Memoria: Full load → **Paginado (constante)**

---

### PASO 3.4: Monitoreo de Performance

**Problema a resolver:**

- No sabemos la latencia real de webhooks en producción
- No sabemos qué queries son lentas
- No sabemos cuándo hay picos de tráfico

**Solución esperada:**

**3.4.1 Logger de Performance:**

```typescript
@Injectable()
export class PerformanceLoggerService {
  async logWebhookLatency(paymentId: string, latency: number) {
    await this.prisma.performanceMetrics.create({
      data: {
        metric_type: 'webhook_latency',
        entity_id: paymentId,
        value: latency,
        timestamp: new Date(),
      },
    });

    // Si latencia > 1000ms, alertar
    if (latency > 1000) {
      this.logger.warn(`⚠️ Webhook lento: ${paymentId} - ${latency}ms`);
    }
  }

  async getAverageLatency(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await this.prisma.performanceMetrics.aggregate({
      where: {
        metric_type: 'webhook_latency',
        timestamp: { gte: since },
      },
      _avg: { value: true },
      _max: { value: true },
      _min: { value: true },
    });

    return {
      avg: metrics._avg.value,
      max: metrics._max.value,
      min: metrics._min.value,
    };
  }
}
```

**3.4.2 Endpoint de Métricas:**

```typescript
@Get('performance/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async getPerformanceMetrics(@Query('hours') hours: number = 24) {
  return {
    webhookLatency: await this.performanceLogger.getAverageLatency(hours),
    cacheHitRate: await this.redis.getCacheHitRate(hours),
    queueLength: await this.webhookQueue.getQueueLength(),
    slowQueries: await this.performanceLogger.getSlowQueries(hours)
  };
}
```

**Implementación:**

- Crear tabla `performance_metrics` en Prisma
- Logger de latencia en cada operación crítica
- Dashboard endpoint (solo admin)
- Integración opcional con Prometheus/Grafana

**Archivos a crear:**

- Migración: `prisma/migrations/XXX_create_performance_metrics.sql`
- `apps/api/src/performance/performance-logger.service.ts`
- `apps/api/src/performance/performance.controller.ts`
- `apps/api/src/performance/performance.module.ts`
- Tests: `apps/api/src/performance/__tests__/performance-logger.spec.ts`

**Archivos a modificar:**

- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts` (agregar logging)
- `apps/api/prisma/schema.prisma` (agregar modelo PerformanceMetric)

**Tests:**

- Logger registra latencia correctamente
- Latencia > 1000ms genera warning
- Agregación calcula avg/max/min correctamente
- Endpoint retorna métricas solo a admin
- Cache hit rate se calcula correctamente

**Métricas a trackear:**

- Latencia promedio de webhooks (últimas 24h)
- Cache hit rate (últimas 24h)
- Longitud de queue (actual)
- Queries lentas (> 100ms)
- Throughput (webhooks/min)

---

## Lineamientos de Trabajo (MUY IMPORTANTE)

### 1. Metodología TDD Estricta

**APRENDIMOS EN SPRINT 1 Y 2 QUE:**

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
5. Medir mejora de performance con benchmarks
6. Refactorizar si es necesario
7. Crear commit atómico

### 2. Benchmarking Obligatorio

**NUEVO EN SPRINT 3:**

- Medir performance ANTES de optimizar (baseline)
- Medir performance DESPUÉS de optimizar
- Documentar mejora en % en el commit
- Ejemplo: "Latencia: 800ms → 150ms (mejora 81%)"

### 3. Tests de Performance

**Además de tests funcionales, crear:**

- Tests de latencia (< Xms)
- Tests de throughput (> Y req/min)
- Tests de carga (simular 100+ webhooks simultáneos)
- Tests de cache hit rate (> 80%)

### 4. Tipos Explícitos (No any/unknown)

- **NUNCA usar `any` en código de producción**
- **NUNCA usar `unknown` sin type guards**
- Todos los parámetros, retornos y variables deben tener tipos explícitos
- TypeScript en modo estricto

### 5. Commits Atómicos y Descriptivos

Formato de commits:

```
tipo(scope): descripción corta

PROBLEMA:
- Descripción del problema de performance

SOLUCIÓN:
- Descripción de la optimización implementada

BENCHMARK:
- Métrica ANTES: Xms
- Métrica DESPUÉS: Yms
- Mejora: Z% más rápido

CAMBIOS:
- Archivo 1: Qué se modificó
- Archivo 2: Qué se modificó

TESTING:
- X/Y tests pasando
- Tests de performance incluidos

ESTÁNDARES:
- Performance best practices
- Scalability patterns

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 6. Zero Regresión

- Antes de cada commit, ejecutar **TODA** la suite de tests
- Verificar que todos los tests del Sprint 1 y 2 sigan pasando
- Si se rompe algo, arreglarlo antes de hacer commit
- Las optimizaciones NO deben cambiar el comportamiento

### 7. Documentación de Errores

**SI COMETES UN ERROR:**

1. Admítelo inmediatamente
2. Documenta el error en el commit de corrección
3. Incluye la lección aprendida
4. NO ocultes errores ni confundas con narrativas inconsistentes

---

## Resultado Esperado del Sprint 3

### Al Final del Sprint 3 Deberíamos Tener:

**Código:**

- ✅ Caching con Redis (PASO 3.1)
- ✅ Queue de webhooks con Bull (PASO 3.2)
- ✅ Índices en DB + paginación (PASO 3.3)
- ✅ Sistema de monitoreo de performance (PASO 3.4)

**Performance:**

- ✅ Latencia de webhooks: < 200ms (mejora 80%)
- ✅ Throughput: 1000+ webhooks/min (mejora 10x)
- ✅ Query time: < 50ms (mejora 80-90%)
- ✅ Uptime: 99.9% durante picos

**Tests:**

- ✅ ~20-30 tests nuevos (funcionales)
- ✅ ~10-15 tests de performance (benchmarks)
- ✅ 100% de tests pasando (sin regresión)
- ✅ Cobertura de casos críticos de performance

**Infraestructura:**

- ✅ Redis corriendo en Docker
- ✅ Bull dashboard para monitoreo de queue
- ✅ Índices en PostgreSQL
- ✅ Tabla de métricas de performance

**Documentación:**

- ✅ `docs/SPRINT-3-OPTIMIZACION-PERFORMANCE.md` con:
  - Problemas de performance resueltos
  - Soluciones implementadas
  - Benchmarks antes/después
  - **Errores cometidos y lecciones aprendidas**
  - Métricas de mejora

**Compliance:**

- ✅ Best practices de performance (NestJS)
- ✅ Scalability patterns (caching, queueing, indexing)
- ✅ Resilience patterns (retry, fallback)

---

## Instrucciones para el Asistente

### Al Comenzar:

1. **LEE** `docs/SPRINT-1-CORRECCIONES-CRITICAS.md` completo
2. **LEE** `docs/SPRINT-2-MEJORAS-SEGURIDAD.md` completo
3. **LEE** `docs/PROMPT-SPRINT-3.md` (este archivo)
4. **ENTIENDE** los errores que cometimos en sprints anteriores
5. **APLICA** los lineamientos de trabajo aprendidos
6. **PREGUNTA** si algo no está claro ANTES de empezar a codear

### Durante el Sprint:

1. **TDD ESTRICTO:** Tests primero, código después
2. **BENCHMARK:** Medir antes y después de cada optimización
3. **UN PASO A LA VEZ:** No saltes pasos
4. **EJECUTA TESTS:** Después de cada cambio
5. **COMMITS ATÓMICOS:** Un commit por cada PASO completado
6. **DOCUMENTA ERRORES:** Si te equivocas, admítelo y documéntalo
7. **ZERO REGRESIÓN:** Todos los tests de Sprint 1 y 2 deben pasar

### Al Terminar:

1. Verificar que todos los tests de Sprint 1, 2 y 3 pasen
2. Ejecutar benchmarks finales
3. Crear documentación completa del Sprint 3
4. Incluir sección de errores y lecciones aprendidas
5. Documentar mejoras de performance (antes/después)
6. Commit final con la documentación

---

## Preguntas Frecuentes

**P: ¿Necesito instalar Redis y Bull localmente?**
R: Sí. Usa Docker Compose para levantar Redis. Ejemplo:

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
```

**P: ¿Cómo mido la mejora de performance?**
R: Usa `console.time()` / `console.timeEnd()` para medir latencia. Documenta antes/después en el commit.

**P: ¿Qué hago si una optimización rompe tests del Sprint 1 o 2?**
R: Revierte la optimización y encuentra otra forma que NO rompa tests. Zero regresión es obligatorio.

**P: ¿Puedo usar otras librerías de caching además de Redis?**
R: Preferimos Redis por su popularidad y soporte en NestJS. Si quieres usar otra, consulta primero.

**P: ¿Qué hago si Redis no está disponible?**
R: Implementa fallback a DB. La aplicación debe funcionar sin Redis (más lento, pero funcional).

**P: ¿Necesito implementar Grafana/Prometheus?**
R: Es opcional. Enfócate primero en los 4 pasos principales. Si hay tiempo, agrega Grafana.

---

## Comenzar el Sprint 3

**Prompt sugerido para empezar:**

```
Voy a comenzar el Sprint 3: Optimización de Performance del proyecto Mateatletas Ecosystem.

IMPORTANTE:
1. Lee primero estos archivos:
   - docs/SPRINT-1-CORRECCIONES-CRITICAS.md
   - docs/SPRINT-2-MEJORAS-SEGURIDAD.md
   - docs/PROMPT-SPRINT-3.md

2. Vamos a trabajar siguiendo:
   - TDD ESTRICTO: Tests primero (RED phase), código después (GREEN phase)
   - BENCHMARKING: Medir antes/después de cada optimización
   - ZERO REGRESIÓN: Todos los tests de Sprint 1 y 2 deben pasar

3. Empezaremos con el PASO 3.1: Caching de Validaciones con Redis
   - Primero instalaremos Redis con Docker
   - Luego crearemos RedisModule
   - Luego tests de caching (RED)
   - Luego implementación (GREEN)
   - Luego benchmark de mejora

¿Estás listo para comenzar? Confirma que leíste los 3 documentos y entendiste los lineamientos.
```

---

## Archivos de Referencia

**Documentación:**

- `docs/SPRINT-1-CORRECCIONES-CRITICAS.md` - Vulnerabilidades y errores del Sprint 1
- `docs/SPRINT-2-MEJORAS-SEGURIDAD.md` - Mejoras de seguridad del Sprint 2

**Código de referencia:**

- `apps/api/src/inscripciones-2026/inscripciones-2026.service.ts` - Servicio a optimizar
- `apps/api/src/pagos/services/webhook-idempotency.service.ts` - Servicio a cachear
- `apps/api/src/pagos/services/payment-amount-validator.service.ts` - Servicio a cachear

**Tests de referencia:**

- `apps/api/src/inscripciones-2026/__tests__/inscripciones-2026-idempotency.spec.ts`
- `apps/api/src/inscripciones-2026/__tests__/inscripciones-2026-atomic-rollback.spec.ts`

**Configuración:**

- `apps/api/package.json` - Agregar dependencias de Redis y Bull
- `docker-compose.yml` - Agregar servicio de Redis
- `apps/api/prisma/schema.prisma` - Agregar índices

---

## Contacto

Si tienes dudas o necesitas aclaraciones, pregunta ANTES de empezar a codear.

**Principio fundamental:** Es mejor preguntar y hacer las cosas bien la primera vez, que asumir y tener que corregir después.

**Principio de performance:** Mide antes de optimizar. No optimices sin datos.

¡Éxito en el Sprint 3! 🚀⚡
