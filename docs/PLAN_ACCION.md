# PLAN DE ACCIÓN ÚNICO - MATEATLETAS ECOSYSTEM
**Fecha:** 2025-10-18
**Basado en:** [ESTADO_REAL_VERIFICADO.md](ESTADO_REAL_VERIFICADO.md)
**Calificación actual:** 7.5/10
**Objetivo:** 9.0/10

---

## RESUMEN EJECUTIVO

**Estado actual:** Sistema production-ready con 3 áreas de mejora identificadas
**Problemas críticos:** 0
**Problemas a resolver:** 3 (todos MEDIO/BAJO)
**Tiempo total estimado:** 11-15 horas

---

## FILOSOFÍA DE ESTE PLAN

Este plan se basa en **EVIDENCIA VERIFICADA** contra el código fuente real.
- ✅ NO incluye "bugs fantasma" de documentos contradictorios
- ✅ NO incluye tareas ya completadas
- ✅ SOLO incluye mejoras verificadas como necesarias

---

## PRIORIDADES

### 🔴 Prioridad 1: CRÍTICO (Blockers para producción)
**Estado:** ✅ Ningún problema crítico encontrado

El sistema está production-ready. Las siguientes son MEJORAS, no BLOCKERS.

---

### 🟠 Prioridad 2: ALTO (Mejoras importantes)

#### Tarea #1: Implementar Contratos Compartidos Frontend-Backend
**Problema verificado:** [ESTADO_REAL_VERIFICADO.md - Problema #2](ESTADO_REAL_VERIFICADO.md#-problema-2-contratos-frontend-backend-no-implementados)

**Evidencia:**
- ❌ No existe `packages/contracts/`
- ❌ No se usa Zod en DTOs
- ⚠️ 17 type casts inseguros (`as unknown as`)

**Objetivo:**
Crear package compartido con Zod schemas para validación runtime en frontend y backend.

**Pasos:**

1. **Crear estructura de package contracts** (30 min)
   ```bash
   mkdir -p packages/contracts/src
   cd packages/contracts
   npm init -y
   npm install zod
   ```

2. **Crear schemas base** (1 hora)
   - `src/schemas/auth.schema.ts` - Login, register, JWT payload
   - `src/schemas/estudiante.schema.ts` - Estudiante CRUD
   - `src/schemas/clase.schema.ts` - Clase, asistencia
   - `src/schemas/admin.schema.ts` - Dashboard stats, alertas

3. **Migrar DTOs de backend a schemas** (1 hora)
   Ejemplo:
   ```typescript
   // packages/contracts/src/schemas/auth.schema.ts
   import { z } from 'zod';

   export const loginSchema = z.object({
     email: z.string().email(),
     password: z.string().min(6),
   });

   export type LoginDto = z.infer<typeof loginSchema>;
   ```

   ```typescript
   // apps/api/src/auth/dto/login.dto.ts
   import { loginSchema, LoginDto } from '@mateatletas/contracts';

   export class LoginDto implements LoginDto {
     // Validación con class-validator + Zod schema
   }
   ```

4. **Refactorizar API client del frontend** (1.5 horas)
   - Importar schemas de `@mateatletas/contracts`
   - Validar responses con `schema.parse(data)`
   - Eliminar `as unknown as` (17 ocurrencias)

5. **Tests de integración** (30 min)
   - Verificar que frontend y backend usan mismos tipos
   - Test: Invalid response lanza ZodError

**Archivos a modificar:**
- `apps/web/src/lib/api/estudiantes.api.ts` (1 type cast)
- `apps/web/src/lib/api/notificaciones.api.ts` (5 type casts)
- `apps/web/src/lib/api/equipos.api.ts` (7 type casts)
- `apps/web/src/lib/api/catalogo.api.ts` (4 type casts)

**Tiempo estimado:** 4.5 horas
**Impacto:** +1.5 puntos en calificación (Type Safety: 5/10 → 9/10)

**Comandos de verificación:**
```bash
# Verificar que contracts existe
ls packages/contracts/src/schemas/

# Verificar que Zod se usa
grep -r "z.object" packages/contracts/

# Verificar que type casts desaparecieron
grep -r "as unknown as" apps/web/src/lib/api/
# Resultado esperado: 0 ocurrencias
```

---

### 🟡 Prioridad 3: MEDIO (Mejoras de calidad)

#### Tarea #2: Eliminar Type Casts Inseguros en Frontend
**Problema verificado:** [ESTADO_REAL_VERIFICADO.md - Problema #1](ESTADO_REAL_VERIFICADO.md#-problema-1-type-casts-en-frontend)

**Evidencia:**
- 17 ocurrencias de `as unknown as` en 4 archivos

**Objetivo:**
Eliminar todos los type casts inseguros usando schemas validados.

**Pasos:**

1. **Refactorizar estudiantes.api.ts** (30 min)
   - Importar `estudianteSchema` de contracts
   - Reemplazar `as unknown as` con `estudianteSchema.parse()`

2. **Refactorizar notificaciones.api.ts** (45 min)
   - 5 type casts a eliminar
   - Usar `notificacionSchema.parse()`

3. **Refactorizar equipos.api.ts** (1 hora)
   - 7 type casts a eliminar
   - Usar `equipoSchema.parse()`

4. **Refactorizar catalogo.api.ts** (45 min)
   - 4 type casts a eliminar
   - Usar `productoSchema.parse()`

**DEPENDENCIA:** Requiere completar Tarea #1 (Contratos Compartidos)

**Tiempo estimado:** 3 horas
**Impacto:** +0.5 puntos en calificación (consolidar Type Safety)

**Comandos de verificación:**
```bash
# Verificar eliminación completa
grep -r "as unknown as" apps/web/src/lib/api/
# Resultado esperado: 0 ocurrencias

# Verificar uso de schemas
grep -r "\.parse\(" apps/web/src/lib/api/
# Resultado esperado: 17+ ocurrencias
```

---

#### Tarea #3: Aumentar Cobertura de Tests
**Problema verificado:** [ESTADO_REAL_VERIFICADO.md - Problema #3](ESTADO_REAL_VERIFICADO.md#-problema-3-cobertura-de-tests-limitada)

**Evidencia:**
- Solo ~16 archivos de test encontrados
- Cobertura real: DESCONOCIDA

**Objetivo:**
Alcanzar >70% de cobertura en servicios críticos.

**Pasos:**

1. **Medir cobertura actual** (15 min)
   ```bash
   cd apps/api
   npm run test:cov
   ```

2. **Tests para AuthService** (1.5 horas)
   - `apps/api/src/auth/auth.service.spec.ts`
   - Test: Login exitoso
   - Test: Login con credenciales inválidas
   - Test: Refresh token
   - Test: parseUserRoles con diferentes formatos

3. **Tests para AdminRolesService** (1 hora)
   - `apps/api/src/admin/services/admin-roles.service.spec.ts`
   - Test: changeUserRole
   - Test: updateUserRoles
   - Test: Validación de roles inválidos

4. **Tests para ClasesManagementService** (1.5 horas)
   - Ya existe: `apps/api/src/clases/services/clases-management.service.spec.ts`
   - Ampliar cobertura a >80%

5. **Tests E2E para flujo completo** (2 horas)
   - `tests/e2e/auth-estudiante-clase.spec.ts`
   - Flujo: Login tutor → Crear estudiante → Inscribir a clase → Registrar asistencia

**Tiempo estimado:** 6 horas
**Impacto:** +1.0 punto en calificación (Testing: 4/10 → 8/10)

**Comandos de verificación:**
```bash
# Ejecutar tests
npm run test

# Verificar cobertura
npm run test:cov
# Resultado esperado: Statements >70%, Branches >60%

# Contar archivos de test
find apps -name "*.spec.ts" | grep -E "^apps/" | wc -l
# Resultado esperado: 15+ archivos
```

---

### 🟢 Prioridad 4: BAJO (Optimizaciones)

#### Tarea #4: Dashboard de Observabilidad para Circuit Breakers
**Problema:** Circuit Breakers implementados pero métricas no expuestas

**Objetivo:**
Exponer métricas de Circuit Breakers para monitoring.

**Pasos:**

1. **Crear endpoint de métricas** (30 min)
   ```typescript
   // apps/api/src/admin/admin.controller.ts
   @Get('metrics/circuits')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   async getCircuitMetrics() {
     return this.adminService.getCircuitMetrics();
   }
   ```

2. **Crear página de observabilidad en frontend** (1 hora)
   - `apps/web/src/app/admin/observability/page.tsx`
   - Mostrar estado de cada circuit (OPEN/CLOSED/HALF_OPEN)
   - Mostrar métricas (failures, successes, timeouts)

**Tiempo estimado:** 1.5 horas
**Impacto:** +0.5 puntos en calificación (Observabilidad)

**Comandos de verificación:**
```bash
# Verificar endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/admin/metrics/circuits
# Resultado esperado: JSON con métricas de 5 circuits
```

---

## CRONOGRAMA RECOMENDADO

### Día 1 (4.5 horas)
- ✅ Tarea #1: Implementar Contratos Compartidos (4.5h)

### Día 2 (3 horas)
- ✅ Tarea #2: Eliminar Type Casts Inseguros (3h)

### Día 3 (6 horas)
- ✅ Tarea #3: Aumentar Cobertura de Tests (6h)

### Día 4 (1.5 horas) - OPCIONAL
- 🟢 Tarea #4: Dashboard de Observabilidad (1.5h)

**Tiempo total:** 15 horas (11-13.5h sin opcional)

---

## MÉTRICAS DE ÉXITO

| Métrica | Actual | Objetivo | Verificación |
|---------|--------|----------|--------------|
| **Contratos Compartidos** | ❌ 0 schemas | ✅ 15+ schemas | `ls packages/contracts/src/schemas/` |
| **Type Casts Inseguros** | ⚠️ 17 | ✅ 0 | `grep -r "as unknown as" apps/web/src/lib/api/` |
| **Cobertura de Tests** | ⚠️ ~16 tests | ✅ >70% statements | `npm run test:cov` |
| **Circuit Breakers Observables** | ⚠️ No expuestos | ✅ Endpoint + Dashboard | `curl /api/admin/metrics/circuits` |
| **Calificación General** | 7.5/10 | 9.0/10 | Re-ejecutar auditoría |

---

## COMANDOS RÁPIDOS DE VERIFICACIÓN

### Después de completar TODO
```bash
# 1. Verificar contratos existen
ls packages/contracts/src/schemas/
# Esperado: 4+ archivos .ts

# 2. Verificar type casts eliminados
grep -r "as unknown as" apps/web/src/lib/api/ | wc -l
# Esperado: 0

# 3. Verificar cobertura de tests
cd apps/api && npm run test:cov
# Esperado: Statements >70%

# 4. Verificar métricas de circuits
curl http://localhost:3001/api/admin/metrics/circuits
# Esperado: JSON con métricas

# 5. Ejecutar build completo
npm run build
# Esperado: Sin errores
```

---

## TAREAS QUE NO ESTÁN EN ESTE PLAN (YA COMPLETADAS)

❌ **NO hacer estas tareas** (ya están implementadas):

1. ✅ UserThrottlerGuard null-safety - YA IMPLEMENTADO
2. ✅ parseUserRoles utility - YA IMPLEMENTADO
3. ✅ AdminService refactoring - YA COMPLETADO
4. ✅ Health check endpoints - YA IMPLEMENTADOS
5. ✅ Circuit Breakers - YA IMPLEMENTADOS
6. ✅ Scripts de desarrollo robustos - YA FUNCIONAN
7. ✅ Migraciones de base de datos - YA SINCRONIZADAS

**Verificación:** Ver [ESTADO_REAL_VERIFICADO.md - Sección 2: Fixes Implementados](ESTADO_REAL_VERIFICADO.md#2-fixes-verificados-como-implementados)

---

## TAREAS OPCIONALES (Mejoras futuras)

Estas tareas NO son necesarias para alcanzar 9.0/10, pero sumarían puntos extras:

1. **Implementar Sentry para error tracking** (2h)
2. **Agregar Prometheus metrics** (3h)
3. **Implementar cache con Redis** (4h)
4. **Rate limiting por usuario** (Ya implementado - verificar funcionamiento)
5. **Agregar logs estructurados con Winston** (2h)

---

## CALIFICACIÓN ESPERADA DESPUÉS DEL PLAN

| Aspecto | Actual | Después del Plan |
|---------|--------|------------------|
| **Backend Arquitectura** | 9/10 | 9/10 |
| **Base de Datos** | 10/10 | 10/10 |
| **Seguridad** | 8/10 | 8/10 |
| **Health Checks** | 10/10 | 10/10 |
| **Circuit Breakers** | 9/10 | 10/10 (+1 por observabilidad) |
| **Frontend Type Safety** | 5/10 | 9/10 (+4 por contracts) |
| **Contratos Compartidos** | 0/10 | 9/10 (+9) |
| **Testing** | 4/10 | 8/10 (+4 por cobertura) |
| **Scripts DevOps** | 9/10 | 9/10 |

**PROMEDIO ACTUAL:** 7.5/10
**PROMEDIO ESPERADO:** 9.0/10

---

## PRÓXIMOS PASOS INMEDIATOS

1. **Leer** [ESTADO_REAL_VERIFICADO.md](ESTADO_REAL_VERIFICADO.md) para entender el estado real
2. **Borrar** archivos obsoletos (ver [archivos_a_borrar.txt](archivos_a_borrar.txt))
3. **Ejecutar** Tarea #1: Implementar Contratos Compartidos
4. **Iterar** hasta completar el plan

---

**Este plan está basado 100% en código verificado.**
**Ninguna tarea fantasma. Solo mejoras reales.**
