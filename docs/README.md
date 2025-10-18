# DOCUMENTACIÓN - MATEATLETAS ECOSYSTEM

**Estado:** 7.5/10 - Production Ready
**Última actualización:** 2025-10-18
**Última limpieza:** 2025-10-18 (11 archivos obsoletos movidos a archive/)

---

## 🔴 DOCUMENTOS CORE (Los 3 Sagrados)

Estos 3 documentos son la **única fuente de verdad verificada contra código real**.

### 1. [ESTADO_ACTUAL.md](ESTADO_ACTUAL.md) ⭐
**LEE ESTE PRIMERO**
- Estado verificado del sistema contra código fuente
- Métricas reales: 7.5/10, 16 tests, 30 servicios con Prisma
- Qué está implementado vs qué falta
- Verificación de "99 tests" → 16 tests reales
- Verificación de "9.5/10" → 7.5/10 real

### 2. [PLAN_ACCION.md](PLAN_ACCION.md) ⭐
**LEE ESTE SEGUNDO**
- Qué hacer y en qué orden
- 4 tareas priorizadas con tiempo estimado (11-15h total)
- Roadmap para pasar de 7.5/10 a 9.0/10
- Cronograma de 4 días

### 3. [DECISIONES.md](DECISIONES.md) ⭐
**LEE ESTE PARA CONTEXTO**
- Por qué se tomaron decisiones (ADRs)
- Historia de decisiones arquitectónicas
- ADR-001: Limpieza de documentación
- ADR-002: Circuit Breakers en AdminService
- ADR-003: parseUserRoles utility
- ADR-004: Health check endpoints
- ADR-005: UserThrottlerGuard null-safety

---

## 📊 MÉTRICAS REALES DEL SISTEMA

*(Verificadas contra código - 2025-10-18)*

### Backend: 7.5/10 Production-Ready
- **Puerto:** 3001 ✅
- **Tests:** 16 archivos de test ✅
- **Circuit Breakers:** 5 implementados ✅
- **Health Checks:** 3 endpoints (/health, /health/ready, /health/live) ✅
- **Swagger:** Implementado en /api/docs ✅
- **PrismaService:** Usado en 30 servicios ✅
- **JwtAuthGuard:** 47 usos en 17 archivos ✅
- **AdminService:** 237 líneas, 6 servicios delegados ✅

### Base de Datos: 10/10
- **PostgreSQL:** Puerto 5432 ✅
- **Migraciones:** 11 aplicadas ✅
- **Estado:** Sincronizado ✅

### Frontend: 5/10 Mejorable
- **Type casts inseguros:** 17 ocurrencias ⚠️
- **Contratos compartidos:** No implementados ❌

### Scripts: 9/10
- **dev-clean-restart.sh:** Robusto con health checks ✅
- **wait_for_port():** Implementado ✅
- **wait_for_backend_health():** Implementado ✅

---

## 📖 DOCUMENTACIÓN POR CATEGORÍA

### 📁 API Specifications - [api-specs/](api-specs/)
**12 archivos** - Documentación de endpoints RESTful

- [admin_copiloto.md](api-specs/admin_copiloto.md) - Endpoints admin
- [asistencia.md](api-specs/asistencia.md) - Sistema de asistencias
- [Autenticacion.md](api-specs/Autenticacion.md) - Login, register, JWT
- [calendario.md](api-specs/calendario.md) - Eventos y calendario
- [catalogo.md](api-specs/catalogo.md) - Productos y suscripciones
- [clases.md](api-specs/clases.md) - Gestión de clases
- [docentes.md](api-specs/docentes.md) - CRUD docentes
- [estudiantes.md](api-specs/estudiantes.md) - CRUD estudiantes
- [gamificacion_puntos_logros.md](api-specs/gamificacion_puntos_logros.md) - Sistema de gamificación
- [pagos.md](api-specs/pagos.md) - Integración MercadoPago
- [reserva_clase.md](api-specs/reserva_clase.md) - Reservas de clases
- [tutores.md](api-specs/tutores.md) - CRUD tutores

**Útil para:** Desarrollo de features, integración frontend-backend

---

### 📁 Architecture - [architecture/](architecture/)
**4 archivos** - Decisiones arquitectónicas

- [context.md](architecture/context.md) - Contexto del sistema
- [design-system.md](architecture/design-system.md) - Sistema de diseño
- [documento-tecnico-del-backend.md](architecture/documento-tecnico-del-backend.md) - Arquitectura backend
- [frontend-arquitectura.md](architecture/frontend-arquitectura.md) - Arquitectura frontend

**Útil para:** Entender estructura del proyecto, decisiones de diseño

---

### 📁 Database - [database/](database/)
**1 archivo** - Estrategia de base de datos

- [PRISMA_MIGRATIONS_STRATEGY.md](database/PRISMA_MIGRATIONS_STRATEGY.md) - Estrategia de migraciones Prisma

**Útil para:** Cambios de schema, migraciones

---

### 📁 Development - [development/](development/)
**5 archivos** - Guías de desarrollo

- [CONTRIBUTING.md](development/CONTRIBUTING.md) - Cómo contribuir
- [DEVELOPMENT.md](development/DEVELOPMENT.md) - Guía de desarrollo
- [GITHUB_SETUP.md](development/GITHUB_SETUP.md) - Setup de GitHub
- [prisma-schema-unificado.md](development/prisma-schema-unificado.md) - Schema Prisma
- [QUICK_START.md](development/QUICK_START.md) - Quick start

**Útil para:** Onboarding de desarrolladores

---

### 📁 Frontend - [frontend/](frontend/)
**3 archivos** - Documentación de frontend

- [DESIGN_SYSTEM_EVOLVED.md](frontend/DESIGN_SYSTEM_EVOLVED.md) - Sistema de diseño evolucionado
- [QUICK_REFERENCE.md](frontend/QUICK_REFERENCE.md) - Referencia rápida
- [README.md](frontend/README.md) - Índice frontend

**Útil para:** Desarrollo frontend, componentes UI

---

### 📁 Planning - [planning/](planning/)
**6 archivos** - Planificación y roadmaps

- [DATOS_REALES_NECESARIOS.md](planning/DATOS_REALES_NECESARIOS.md) - Datos reales necesarios
- [FRONTEND_REDESIGN_PLAN.md](planning/FRONTEND_REDESIGN_PLAN.md) - Plan de rediseño frontend
- [PLAN_DE_SLICES.md](planning/PLAN_DE_SLICES.md) - Plan de slices
- [ROADMAP_BACKEND_9.5.md](planning/ROADMAP_BACKEND_9.5.md) - Roadmap backend
- [ROADMAP_FRONTEND_WORLD_CLASS.md](planning/ROADMAP_FRONTEND_WORLD_CLASS.md) - Roadmap frontend
- [VALIDACION_AVANZADA_PLAN.md](planning/VALIDACION_AVANZADA_PLAN.md) - Plan de validación

**Útil para:** Planning de sprints, roadmap

---

### 📁 Progress - [progress/](progress/)
**1 archivo** - Estado del proyecto

- [SOURCE_OF_TRUTH.md](progress/SOURCE_OF_TRUTH.md) - Source of truth (⚠️ Actualizar métricas)

**Útil para:** Tracking de progreso

---

### 📁 Technical - [technical/](technical/)
**4 archivos** - Documentación técnica

- [ARQUITECTURA_POR_INSTANCIAS.md](technical/ARQUITECTURA_POR_INSTANCIAS.md) - Arquitectura por instancias
- [REACT_QUERY_MIGRATION_SUMMARY.md](technical/REACT_QUERY_MIGRATION_SUMMARY.md) - Migración a React Query
- [SECURITY_JWT_COOKIES_MIGRATION.md](technical/SECURITY_JWT_COOKIES_MIGRATION.md) - Migración JWT a cookies
- [SWAGGER_DOCUMENTATION_SUMMARY.md](technical/SWAGGER_DOCUMENTATION_SUMMARY.md) - Implementación Swagger

**Útil para:** Decisiones técnicas, migraciones

---

### 📁 Testing - [testing/](testing/)
**4 archivos** - Documentación de testing

- [CREDENCIALES_TEST.md](testing/CREDENCIALES_TEST.md) - Credenciales de prueba
- [PORTAL_ESTUDIANTE_TEST_FINAL.md](testing/PORTAL_ESTUDIANTE_TEST_FINAL.md) - Tests portal estudiante
- [TESTING_DOCUMENTATION.md](testing/TESTING_DOCUMENTATION.md) - Docs de testing (⚠️ Corregir "99 tests" → "16 tests")
- [TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md) - Resumen de testing

**Útil para:** Escribir tests, credenciales de prueba

---

### 📁 Archive - [archive/](archive/)
**16 archivos históricos** - Documentación obsoleta preservada

- [2025-10-18-cleanup/](archive/2025-10-18-cleanup/) (12 archivos) - Docs obsoletos con claims inflados
- [slices/](archive/slices/) (5 archivos) - Slices históricos completados

**Útil para:** Historia del proyecto, referencia de qué NO hacer

---

## 🚀 QUICK START

### Para Desarrolladores Nuevos
```bash
# 1. Lee los 3 documentos core
cat docs/ESTADO_ACTUAL.md
cat docs/PLAN_ACCION.md
cat docs/DECISIONES.md

# 2. Quick start técnico
cat docs/development/QUICK_START.md

# 3. Inicia el proyecto
./dev-clean-restart.sh

# 4. Verifica que todo funciona
curl http://localhost:3001/api/health
```

### Para Desarrollo de Features
```bash
# 1. Consulta API specs
ls docs/api-specs/

# 2. Lee arquitectura
cat docs/architecture/documento-tecnico-del-backend.md

# 3. Desarrolla tu feature
# ...

# 4. Actualiza ESTADO_ACTUAL.md si cambias algo importante
```

---

## ⚠️ REGLAS DE DOCUMENTACIÓN

### ✅ SÍ Hacer
- ✅ Actualizar ESTADO_ACTUAL.md al cambiar features importantes
- ✅ Actualizar PLAN_ACCION.md al completar tareas
- ✅ Agregar ADRs a DECISIONES.md para decisiones arquitectónicas
- ✅ Verificar claims contra código antes de escribir
- ✅ Usar métricas reales (no infladas)

### ❌ NO Hacer
- ❌ Crear nuevas auditorías (actualizar ESTADO_ACTUAL.md en su lugar)
- ❌ Documentos con fechas en nombre (ej: `*_2025-10-17.md`)
- ❌ Claims sin verificar código (ej: "99 tests" cuando son 16)
- ❌ Múltiples "fuentes de verdad" (solo los 3 docs core)
- ❌ Inflar métricas para verse mejor (7.5/10 es BUENO)

---

## 📋 COMANDOS ÚTILES

### Verificar Estado Real
```bash
# Backend funcionando
curl http://localhost:3001/api/health

# Contar tests reales
find apps tests -name "*.spec.ts" -o -name "*.test.ts" | grep -v node_modules | wc -l
# Resultado esperado: 16

# Contar servicios con Prisma
grep -r "PrismaService" apps/api/src --include="*.service.ts" | wc -l
# Resultado esperado: 30+

# Contar Circuit Breakers
grep -c "new CircuitBreaker" apps/api/src/admin/admin.service.ts
# Resultado esperado: 5

# Contar type casts inseguros
grep -r "as unknown as" apps/web/src/lib/api/ | wc -l
# Resultado esperado: 17
```

### Verificar Documentación
```bash
# Listar docs core
ls -1 docs/*.md
# Debe mostrar: ESTADO_ACTUAL.md, PLAN_ACCION.md, DECISIONES.md, README.md

# Contar archivos activos
find docs -name "*.md" -not -path "*/archive/*" | wc -l
# Resultado esperado: ~46

# Verificar archive
ls docs/archive/2025-10-18-cleanup/ | wc -l
# Resultado esperado: 12

ls docs/archive/slices/ | wc -l
# Resultado esperado: 5
```

---

## 🎯 PRÓXIMOS PASOS

1. **Lee los 3 docs core** en orden
2. **Ejecuta el plan** de [PLAN_ACCION.md](PLAN_ACCION.md)
3. **Actualiza docs** cuando completes tareas
4. **Registra decisiones** en [DECISIONES.md](DECISIONES.md)

---

## 📚 HISTORIA DE LIMPIEZA

### Limpieza 2025-10-18
**Problema encontrado:**
- 57 archivos de documentación
- 11 docs con claims inflados ("99 tests", "9.5/10")
- Múltiples auditorías contradictorias

**Acción tomada:**
- Movidos 11 archivos obsoletos a archive/2025-10-18-cleanup/
- Movidos 5 slices históricos a archive/slices/
- Movido README antiguo a archive/2025-10-18-cleanup/README_OLD.md
- Borradas 3 carpetas vacías (design/, refactoring/, slices/)
- Creados 3 docs core verificados contra código real

**Resultado:**
- 57 → 46 archivos activos
- Documentación refleja estado real
- 3 documentos maestros como única fuente de verdad

**Ver:** [DECISIONES.md - ADR-001](DECISIONES.md#adr-001-limpieza-de-documentación)

---

## 🤝 CONTRIBUIR

### Antes de Hacer un PR
1. Lee [development/CONTRIBUTING.md](development/CONTRIBUTING.md)
2. Verifica que tus cambios no rompen tests
3. Actualiza ESTADO_ACTUAL.md si cambias features
4. Agrega ADR a DECISIONES.md si es decisión arquitectónica

### Formato de Commits
```
feat: add new feature
fix: resolve bug
docs: update documentation
refactor: improve code structure
test: add tests
```

---

**La documentación es código. Mantenla actualizada, honesta y verificable.**
