# Guía de Refactoring Profundo - Para el Futuro

**Fecha de Creación:** 18 de Octubre, 2025
**Estado Actual del Sistema:** 33/100 (Funcional pero Frágil)
**Usar Esta Guía:** Después del 31 de Octubre, cuando tengas tiempo

---

## 📋 Índice Rápido

1. [Nivel de Profundidad Requerido](#nivel-de-profundidad-requerido)
2. [Checklist de Análisis Exhaustivo](#checklist-de-análisis-exhaustivo)
3. [Plan de Refactoring por Fases](#plan-de-refactoring-por-fases)
4. [Herramientas y Técnicas](#herramientas-y-técnicas)
5. [Criterios de Éxito](#criterios-de-éxito)
6. [Referencias a Documentos de Análisis](#referencias-a-documentos-de-análisis)

---

## Nivel de Profundidad Requerido

### Profundidad Actual (Octubre 2025)

✅ **Lo que SÍ se analizó:**
- Acoplamiento de servicios (PrismaService en 59 lugares)
- Guards globales y su impacto (67+ usos)
- Contratos frontend-backend (40+ type casts, 8+ mismatches)
- Escenarios de fallo en cascada
- Dependencias entre módulos
- Código vulnerable específico

❌ **Lo que NO se analizó:**
- Ejecución real del código bajo carga
- Tests actuales (coverage, calidad)
- Performance profiling
- Security audit completo
- Integridad de datos en BD
- Infrastructure/deployment
- Lógica de negocio dentro de cada servicio

**Puntuación de Profundidad Actual:** 7/10 para análisis arquitectural

---

### Profundidad Requerida para Refactoring (Futuro)

Para refactorizar con confianza, necesitas **9/10 de profundidad**:

#### 1. ✅ Análisis Estático (YA HECHO)
- [x] Mapeo de dependencias
- [x] Identificación de puntos críticos
- [x] Análisis de contratos
- [x] Detección de anti-patrones

#### 2. ⚠️ Análisis Dinámico (PENDIENTE)
- [ ] **Ejecutar tests actuales**
  - ¿Cuántos tests existen?
  - ¿Cuál es el coverage real?
  - ¿Cuáles fallan actualmente?

- [ ] **Load Testing**
  - Simular 100 usuarios concurrentes
  - Medir cuándo se agota el connection pool
  - Identificar bottlenecks de performance

- [ ] **Memory Profiling**
  - Detectar memory leaks
  - Medir uso de memoria bajo carga
  - Identificar N+1 queries

#### 3. ⚠️ Análisis de Datos (PENDIENTE)
- [ ] **Database Integrity**
  - Verificar constraints (foreign keys)
  - Buscar datos huérfanos
  - Validar cascading deletes
  - Revisar índices faltantes

- [ ] **Migration History**
  - Revisar todas las migraciones de Prisma
  - Identificar migraciones riesgosas
  - Validar rollback safety

#### 4. ⚠️ Análisis de Seguridad (PENDIENTE)
- [ ] **OWASP Top 10**
  - SQL Injection (Prisma ayuda, pero revisar raw queries)
  - XSS (frontend)
  - CSRF
  - Authentication/Authorization flaws
  - Sensitive data exposure

- [ ] **JWT Security**
  - Validación de tokens
  - Refresh token strategy
  - Secret rotation plan

- [ ] **Rate Limiting**
  - ¿Funciona correctamente UserThrottlerGuard?
  - ¿Puede bypassearse?

#### 5. ⚠️ Análisis de Lógica de Negocio (PENDIENTE)
- [ ] **Revisar cada servicio individualmente**
  - AdminService: ¿Lógica de coordinación correcta?
  - EstudiantesService: ¿Validaciones completas?
  - ClasesService: ¿Manejo de estados consistente?
  - PagosService: ¿Transacciones atómicas?

- [ ] **Edge Cases**
  - ¿Qué pasa si un estudiante se inscribe 2 veces?
  - ¿Qué pasa si se cancela una clase con estudiantes?
  - ¿Qué pasa si un pago falla a medias?

#### 6. ⚠️ Análisis de Frontend (PENDIENTE)
- [ ] **Performance**
  - Bundle size
  - Re-renders innecesarios
  - Lazy loading
  - Code splitting

- [ ] **State Management**
  - Zustand stores: ¿Consistencia de estado?
  - Race conditions
  - Stale data

- [ ] **UX/Accesibilidad**
  - Keyboard navigation
  - Screen readers
  - Error messages útiles

---

## Checklist de Análisis Exhaustivo

### Antes de Refactorizar, Completa Esto:

#### 📊 Métricas Cuantitativas

```bash
# 1. Test Coverage
npm run test:coverage
# Target: >80% para refactorizar con confianza

# 2. Bundle Size (Frontend)
npm run build
# Revisar tamaño de bundles, lazy loading

# 3. Dependencies Audit
npm audit
# Resolver vulnerabilidades críticas

# 4. TypeScript Strict Mode
# Habilitar strict: true en tsconfig.json
# Arreglar TODOS los errores

# 5. Linter Errors
npm run lint
# 0 errores antes de refactorizar

# 6. Circular Dependencies (Backend)
npx madge --circular src
# Ya verificado: ✅ No hay circulares

# 7. Database Migrations
npx prisma migrate status
# Todas las migraciones aplicadas
```

#### 🔍 Code Review Manual

**Backend (apps/api/src/):**

- [ ] **app.module.ts**
  - Revisar configuración global
  - Validar guards/interceptors
  - Verificar imports

- [ ] **auth/** (Crítico)
  - [ ] auth.service.ts - Lógica de login
  - [ ] jwt.strategy.ts - Validación de tokens
  - [ ] roles.guard.ts - Lógica de autorización (línea 51-53)
  - [ ] jwt-auth.guard.ts - Guard principal

- [ ] **admin/** (Alta complejidad)
  - [ ] admin.service.ts - 6 dependencias, revisar coordinación
  - [ ] admin.module.ts - 8 providers, validar estructura
  - [ ] services/*.service.ts - Revisar cada uno

- [ ] **estudiantes/**
  - [ ] estudiantes.service.ts - CRUD, validaciones
  - [ ] dto/create-estudiante.dto.ts - Campos vs frontend

- [ ] **clases/**
  - [ ] clases.service.ts - Delegación a 3 servicios
  - [ ] services/*.service.ts - Lógica de negocio
  - [ ] dto/crear-clase.dto.ts - Validaciones

- [ ] **pagos/** (Crítico - Dinero)
  - [ ] pagos.service.ts - Transacciones atómicas?
  - [ ] Manejo de errores
  - [ ] Rollback strategy

- [ ] **common/**
  - [ ] guards/user-throttler.guard.ts - NULL SAFETY (línea 36)
  - [ ] interceptors/logging.interceptor.ts - Error handling

**Frontend (apps/web/src/):**

- [ ] **lib/api/** (Contratos)
  - [ ] admin.api.ts - Type casts (líneas 9, 13, 17, 21, 25)
  - [ ] estudiantes.api.ts - Double casts (líneas 24-25)
  - [ ] clases.api.ts
  - [ ] catalogo.api.ts - Type casts (líneas 34, 42, 50, 58)

- [ ] **types/**
  - [ ] estudiante.ts - Comparar con backend DTO
  - [ ] clases.types.ts - Comparar con backend DTO
  - [ ] admin.types.ts

- [ ] **store/**
  - [ ] admin.store.ts - Código defensivo (línea 122-124)
  - [ ] estudiantes.store.ts - Error handling
  - [ ] clases.store.ts - Transformaciones (línea 119-123)

#### 🧪 Testing Exhaustivo

**Tests Unitarios:**
```bash
# Crear tests para servicios críticos
# Target: >80% coverage

✅ Priority 1 (Crítico):
- [ ] auth.service.spec.ts - Login, JWT validation
- [ ] roles.guard.spec.ts - Múltiples roles, edge cases
- [ ] admin.service.spec.ts - Coordinación de servicios

✅ Priority 2 (Alto):
- [ ] estudiantes.service.spec.ts
- [ ] clases.service.spec.ts
- [ ] pagos.service.spec.ts

✅ Priority 3 (Medio):
- [ ] Resto de servicios
```

**Tests de Integración:**
```bash
# Validar contratos API

✅ Priority 1:
- [ ] POST /auth/login - Respuesta correcta
- [ ] GET /admin/dashboard - Formato de respuesta
- [ ] POST /estudiantes - DTO validation

✅ Priority 2:
- [ ] Todos los endpoints principales
- [ ] Error responses (400, 401, 403, 404, 500)
```

**Tests E2E:**
```bash
# Flujos completos de usuario

✅ Priority 1:
- [ ] Login → Dashboard
- [ ] Crear estudiante → Ver en lista
- [ ] Crear clase → Inscribir estudiante

✅ Priority 2:
- [ ] Flujo completo de pago
- [ ] Flujo completo de asistencia
```

**Load Testing:**
```bash
# Usar Artillery, k6, o similar

✅ Escenarios:
- [ ] 10 usuarios concurrentes - Baseline
- [ ] 50 usuarios concurrentes - Expected load
- [ ] 100 usuarios concurrentes - Peak load
- [ ] 500 usuarios concurrentes - Stress test

✅ Medir:
- [ ] Response time (p50, p95, p99)
- [ ] Error rate
- [ ] Database connection pool exhaustion
- [ ] Memory usage
```

#### 🔐 Security Audit

**Automated Scan:**
```bash
npm audit fix
npx snyk test  # Si tienes cuenta Snyk
```

**Manual Review:**
- [ ] **SQL Injection**
  - Revisar raw queries de Prisma
  - Validar inputs en DTOs

- [ ] **XSS**
  - Sanitizar outputs en frontend
  - Revisar dangerouslySetInnerHTML

- [ ] **CSRF**
  - Tokens CSRF en forms?
  - SameSite cookies?

- [ ] **Authentication**
  - JWT expiration adecuado?
  - Refresh token strategy?
  - Password hashing (bcrypt)?

- [ ] **Authorization**
  - Roles verificados en TODOS los endpoints?
  - Ownership checks (user puede editar solo SUS datos)?

- [ ] **Sensitive Data**
  - Passwords nunca en logs
  - PII encriptado?
  - HTTPS en producción?

#### 📈 Performance Profiling

**Backend:**
```bash
# 1. Database Queries
# Habilitar Prisma query logging
# Identificar N+1 queries
# Verificar índices

# 2. API Response Times
# Medir p50, p95, p99 de cada endpoint
# Target: <200ms p95

# 3. Memory Usage
# Profiling con Node.js --inspect
# Detectar memory leaks
```

**Frontend:**
```bash
# 1. Bundle Analysis
npm run build
npx webpack-bundle-analyzer

# 2. Lighthouse Score
# Target: >90 en Performance, Accessibility

# 3. React Profiler
# Identificar re-renders innecesarios
# Optimizar con memo, useMemo, useCallback
```

---

## Plan de Refactoring por Fases

### Fase 0: Preparación (1 semana)

**Objetivo:** Sistema estable y bien testeado ANTES de refactorizar

**Tareas:**
1. ✅ Implementar 3 fixes críticos (ya planeados)
2. ✅ Escribir tests de integración para endpoints principales
3. ✅ Establecer baseline de performance
4. ✅ Congelar nuevas features

**Criterio de Éxito:**
- [ ] Tests de integración cubren 80% de endpoints críticos
- [ ] Load test pasa con 50 usuarios concurrentes
- [ ] 0 errores críticos en npm audit

---

### Fase 1: Contratos Compartidos (2-3 semanas)

**Objetivo:** Eliminar type casts, establecer contratos estables

**Tareas:**

**Semana 1: Setup**
1. Crear package `@mateatletas/contracts`
2. Instalar Zod
3. Definir schemas para 5 entidades principales

**Semana 2: Backend**
4. Crear DTOs con Zod en backend
5. Validación automática en pipes
6. Actualizar 10 endpoints principales

**Semana 3: Frontend**
7. Importar schemas de contracts
8. Reemplazar type casts con validación
9. Actualizar stores para usar schemas

**Archivos a Modificar:**
```
Backend (apps/api/):
- src/estudiantes/dto/*.dto.ts
- src/clases/dto/*.dto.ts
- src/admin/dto/*.dto.ts
- src/auth/dto/*.dto.ts

Frontend (apps/web/):
- src/lib/api/*.api.ts (eliminar "as unknown as")
- src/types/*.types.ts (importar de contracts)
- src/store/*.store.ts (validar responses)

Nuevo Package:
- packages/contracts/
  - schemas/estudiante.schema.ts
  - schemas/clase.schema.ts
  - schemas/admin.schema.ts
  - schemas/auth.schema.ts
```

**Criterio de Éxito:**
- [ ] 0 type casts (`as T`, `as unknown as T`)
- [ ] Todas las APIs validadas con Zod
- [ ] Tests de integración validan contratos
- [ ] TypeScript strict mode habilitado

**Riesgo:** Cambios grandes, posibles bugs
**Mitigación:** Tests de integración completos ANTES de empezar

---

### Fase 2: Desacoplamiento Backend (3-4 semanas)

**Objetivo:** Reducir dependencias de PrismaService de 59 a <20

**Tareas:**

**Semana 1: Repository Pattern**
1. Crear interfaces de repositorios
2. Implementar repositorios para 3 entidades principales
3. Actualizar servicios para usar repositorios

**Semana 2: Migración Gradual**
4. Migrar EstudiantesService
5. Migrar ClasesService
6. Migrar AdminService (dividir en sub-servicios)

**Semana 3: Refactorizar AdminModule**
7. Split AdminModule en 5 módulos:
   - UsersModule
   - RolesModule
   - StatsModule
   - AlertsModule
   - StudentsModule

**Semana 4: Testing y Optimización**
8. Tests unitarios para repositorios
9. Tests de integración actualizados
10. Performance benchmarking

**Archivos a Crear:**
```
Backend:
- src/repositories/
  - base.repository.ts (interface)
  - estudiante.repository.ts
  - clase.repository.ts
  - usuario.repository.ts
  - prisma/
    - estudiante-prisma.repository.ts
    - clase-prisma.repository.ts

- src/modules/
  - users/
  - roles/
  - stats/
  - alerts/
  - students/
```

**Archivos a Refactorizar:**
```
- src/admin/admin.service.ts (simplificar)
- src/admin/admin.module.ts (dividir)
- src/estudiantes/estudiantes.service.ts (usar repo)
- src/clases/clases.service.ts (usar repo)
```

**Criterio de Éxito:**
- [ ] PrismaService inyectado en <20 lugares
- [ ] AdminService tiene <3 dependencias
- [ ] Cada módulo tiene responsabilidad única
- [ ] Tests pasan al 100%

**Riesgo:** Refactoring masivo, alto riesgo de bugs
**Mitigación:**
- Migración gradual (1 servicio por vez)
- Tests comprehensivos
- Feature flags para rollback

---

### Fase 3: Resiliencia y Monitoring (2 semanas)

**Objetivo:** Sistema resiliente que maneja fallos gracefully

**Tareas:**

**Semana 1: Circuit Breakers y Resilience**
1. Implementar circuit breakers en todos los servicios externos
2. Graceful degradation (si stats falla, dashboard parcial)
3. Retry logic con backoff exponencial
4. Request timeouts configurables

**Semana 2: Observability**
5. Structured logging con Winston
6. Distributed tracing (OpenTelemetry)
7. Metrics (Prometheus)
8. Alertas (cuando P99 > 500ms, error rate > 1%)

**Herramientas:**
```bash
npm install @nestjs/terminus  # Health checks
npm install @nestjs/bull      # Queue system
npm install prom-client       # Metrics
npm install winston           # Logging
npm install opentelemetry     # Tracing
```

**Archivos a Crear:**
```
- src/health/
  - health.controller.ts
  - health.service.ts
  - indicators/
    - database.indicator.ts
    - redis.indicator.ts

- src/monitoring/
  - metrics.service.ts
  - tracing.service.ts
  - logger.service.ts (mejorar existente)
```

**Criterio de Éxito:**
- [ ] Health check endpoint funcional
- [ ] Circuit breakers en servicios críticos
- [ ] Logs estructurados con trace IDs
- [ ] Dashboard de métricas (Grafana)
- [ ] Alertas configuradas

---

### Fase 4: Performance y Escalabilidad (2-3 semanas)

**Objetivo:** Sistema optimizado para 1000+ usuarios concurrentes

**Tareas:**

**Semana 1: Database Optimization**
1. Añadir índices faltantes
2. Optimizar N+1 queries
3. Implementar caching (Redis)
4. Connection pooling tuning

**Semana 2: API Optimization**
5. Response compression
6. Rate limiting per-user mejorado
7. Pagination eficiente
8. GraphQL para queries complejas? (opcional)

**Semana 3: Frontend Optimization**
9. Code splitting
10. Lazy loading de componentes
11. Image optimization
12. Service Worker / PWA

**Criterio de Éxito:**
- [ ] Load test con 1000 usuarios pasa
- [ ] P99 latency <300ms
- [ ] Frontend bundle <500KB (gzipped)
- [ ] Lighthouse score >90

---

### Fase 5: Security Hardening (1-2 semanas)

**Objetivo:** Sistema seguro para producción

**Tareas:**
1. Security headers (helmet)
2. CORS configurado correctamente
3. Rate limiting robusto
4. Input sanitization
5. HTTPS enforced
6. Secrets management (Vault, AWS Secrets)
7. Audit logging (quién hizo qué, cuándo)
8. GDPR compliance (si aplica)

**Criterio de Éxito:**
- [ ] Security audit pasa (OWASP Top 10)
- [ ] npm audit muestra 0 vulnerabilidades críticas
- [ ] Penetration testing básico pasa

---

## Herramientas y Técnicas

### Análisis Automático

```bash
# 1. Dependency Analysis
npx madge --circular src
npx dependency-cruiser src

# 2. Code Quality
npx eslint . --ext .ts,.tsx
npx prettier --check .

# 3. Security
npm audit
npx snyk test

# 4. Bundle Analysis
npx webpack-bundle-analyzer

# 5. Performance
npx lighthouse https://tu-app.com

# 6. Test Coverage
npm run test:coverage

# 7. Type Coverage
npx type-coverage
```

### Code Review Checklist

Para cada Pull Request de refactoring:

- [ ] **Tests:** Nuevos tests agregados, existentes pasan
- [ ] **Breaking Changes:** Documentados, versionados
- [ ] **Performance:** No regresión (benchmarks)
- [ ] **Security:** No nuevas vulnerabilidades
- [ ] **Documentation:** Actualizada
- [ ] **Migration Guide:** Si aplica

### Métricas de Éxito

**Antes del Refactoring (Estado Actual):**
```
Salud General: 33/100
- Coupling: 9/10 (CRÍTICO) - PrismaService en 59 lugares
- Contracts: 2/10 (CRÍTICO) - 40+ type casts
- Resilience: 1/10 (CRÍTICO) - No circuit breakers
- Testing: 3/10 (estimado)
- Performance: 5/10 (funciona pero no optimizado)
```

**Después del Refactoring (Objetivo):**
```
Salud General: 82/100
- Coupling: 8/10 (BUENO) - Repository pattern, <20 dependencias
- Contracts: 9/10 (EXCELENTE) - Zod schemas, 0 type casts
- Resilience: 8/10 (BUENO) - Circuit breakers, monitoring
- Testing: 8/10 (BUENO) - >80% coverage
- Performance: 8/10 (BUENO) - <300ms p99, 1000+ usuarios
```

---

## Criterios de Éxito por Fase

### ✅ Fase 0 Completa Cuando:
- [ ] 3 fixes críticos implementados
- [ ] Tests de integración >60% coverage
- [ ] Load test baseline establecido
- [ ] No breaking changes planeados

### ✅ Fase 1 Completa Cuando:
- [ ] 0 type casts en código
- [ ] Contratos compartidos funcionando
- [ ] TypeScript strict mode habilitado
- [ ] Tests de contratos al 100%

### ✅ Fase 2 Completa Cuando:
- [ ] PrismaService en <20 lugares
- [ ] AdminModule dividido en 5 módulos
- [ ] Repository pattern implementado
- [ ] Acoplamiento reducido significativamente

### ✅ Fase 3 Completa Cuando:
- [ ] Health checks funcionando
- [ ] Circuit breakers en servicios críticos
- [ ] Monitoring dashboard activo
- [ ] Alertas configuradas

### ✅ Fase 4 Completa Cuando:
- [ ] Load test con 1000 usuarios pasa
- [ ] P99 <300ms
- [ ] Frontend optimizado (<500KB)
- [ ] Índices de BD optimizados

### ✅ Fase 5 Completa Cuando:
- [ ] Security audit pasa
- [ ] 0 vulnerabilidades críticas
- [ ] Compliance verificado
- [ ] Audit logging implementado

---

## Estimación de Tiempo Total

**Con dedicación full-time:**
- Fase 0: 1 semana
- Fase 1: 2-3 semanas
- Fase 2: 3-4 semanas
- Fase 3: 2 semanas
- Fase 4: 2-3 semanas
- Fase 5: 1-2 semanas

**TOTAL: 11-15 semanas (~3 meses)**

**Con dedicación part-time (50%):**
**TOTAL: 6 meses**

---

## Referencias a Documentos de Análisis

### Documentos Creados (Octubre 2025)

1. **[DIAGNOSTICO_FRAGILIDAD_COMPLETO.md](DIAGNOSTICO_FRAGILIDAD_COMPLETO.md)**
   - Resumen ejecutivo de fragilidad
   - 5 problemas críticos identificados
   - Escenarios de fallo
   - Estado actual del sistema

2. **[FRAGILITY_EXECUTIVE_SUMMARY.md](FRAGILITY_EXECUTIVE_SUMMARY.md)**
   - Scorecard de fragilidad
   - Top 5 riesgos
   - Cascading failure scenarios
   - Acciones inmediatas

3. **[FRAGILITY_ANALYSIS.md](FRAGILITY_ANALYSIS.md)**
   - Análisis técnico profundo
   - Gráficos de dependencias
   - Anti-patrones detectados
   - Métricas cuantitativas

4. **[NIVELES_DE_SALUD_SOFTWARE.md](NIVELES_DE_SALUD_SOFTWARE.md)**
   - Pirámide de 5 capas de salud
   - Evaluación actual vs objetivo
   - Métricas por capa
   - Plan de mejora

5. **[ANALYSIS_INDEX.md](ANALYSIS_INDEX.md)** (si existe)
   - Navegación de documentos

### Análisis Frontend-Backend (en /tmp/)

6. **contract_analysis.md**
   - Type casting crisis
   - Field mismatches
   - Response format uncertainty

7. **detailed_findings.md**
   - Inventario completo de type casts
   - Bugs reproducibles
   - Código más frágil

---

## Notas Finales

### ⚠️ IMPORTANTE: Lee Esto Antes de Empezar

1. **No refactorices bajo presión de deadline**
   - Refactoring requiere tiempo y tests
   - Hacerlo con prisa genera más bugs

2. **Tests primero, siempre**
   - Sin tests, no sabes si rompiste algo
   - Coverage >80% antes de refactorizar

3. **Migración gradual**
   - No refactorices todo de una vez
   - Feature flags para rollback
   - Canary deployments

4. **Documenta decisiones**
   - ADRs (Architecture Decision Records)
   - Por qué elegiste X sobre Y
   - Trade-offs considerados

5. **Métricas de éxito claras**
   - Define "success criteria" antes de empezar
   - Mide antes y después
   - Benchmarks de performance

### 📚 Recursos Recomendados

**Libros:**
- "Refactoring" by Martin Fowler
- "Working Effectively with Legacy Code" by Michael Feathers
- "Building Microservices" by Sam Newman

**Cursos:**
- Testing NestJS Applications
- Advanced TypeScript Patterns
- System Design Interview (para arquitectura)

**Tools:**
- Zod (schema validation)
- class-validator (DTO validation)
- Prisma Client Extensions (para Repository pattern)
- Artillery/k6 (load testing)
- Sentry/LogRocket (error tracking)

---

## Cuándo Usar Esta Guía

✅ **USA ESTA GUÍA cuando:**
- Pasó el deadline del 31 de Octubre
- Tienes 2-3 meses de tiempo dedicado
- El producto tiene tracción con usuarios
- Necesitas escalar o mejorar mantenibilidad
- Vas a contratar más desarrolladores

❌ **NO USES ESTA GUÍA si:**
- Estás bajo deadline inmediato
- El producto no tiene product-market fit aún
- Prefieres pivotar que refactorizar
- No tienes tiempo para tests comprehensivos

---

## Contacto Futuro

Cuando decidas empezar el refactoring:

1. Lee primero [DIAGNOSTICO_FRAGILIDAD_COMPLETO.md](DIAGNOSTICO_FRAGILIDAD_COMPLETO.md)
2. Revisa [NIVELES_DE_SALUD_SOFTWARE.md](NIVELES_DE_SALUD_SOFTWARE.md)
3. Vuelve a esta guía para el plan detallado
4. Empieza con Fase 0 (preparación)

**Y vuelve a preguntarme cuando estés listo.** Te ayudaré paso a paso.

---

**Guardado para el futuro. Ahora enfoquémonos en llegar al 31 de Octubre.** 🚀
