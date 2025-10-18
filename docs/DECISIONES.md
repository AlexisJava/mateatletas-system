# DECISIONES ARQUITECTÓNICAS - MATEATLETAS

**Última actualización:** 2025-10-18

Este documento registra decisiones arquitectónicas importantes usando el formato ADR (Architecture Decision Record).

---

## ADR-001: Limpieza de Documentación
**Fecha:** 2025-10-18
**Estado:** ✅ Aceptada

### Contexto
57 archivos de documentación con **claims inflados**:
- 11 documentos afirmaban "99 tests unitarios" cuando existen 16
- 11 documentos afirmaban "9.5/10 WORLD-CLASS" cuando es 7.5/10
- Múltiples auditorías contradictorias generaban confusión
- Documentación desorganizada (11 archivos en root de docs/)

### Problema
La documentación NO reflejaba el estado real del código, generando:
- Confusión sobre qué estaba implementado
- Expectativas infladas vs realidad
- Múltiples "fuentes de verdad" contradictorias
- Dificultad para encontrar información correcta

### Decisión
**Limpieza completa de documentación:**

1. **Mover a archive/** (no borrar):
   - 11 archivos obsoletos → `docs/archive/2025-10-18-cleanup/`
   - 5 slices históricos → `docs/archive/slices/`

2. **Mantener 3 documentos maestros verificados:**
   - `ESTADO_ACTUAL.md` - Estado verificado contra código real
   - `PLAN_ACCION.md` - Qué hacer y en qué orden
   - `DECISIONES.md` - Este documento

3. **Organización:**
   - Mantener carpetas organizadas: api-specs/, architecture/, development/, etc.
   - Borrar carpetas vacías: design/, refactoring/
   - Solo README.md en root de docs/

### Alternativas Consideradas

**Opción A: Actualizar todos los docs existentes**
- ❌ Rechazada: Demasiado esfuerzo, perpetúa desorganización

**Opción B: Borrar todo y empezar de cero**
- ❌ Rechazada: Perderíamos historia y contexto valioso

**Opción C: Limpieza con archive (elegida)**
- ✅ Aceptada: Balance entre limpieza y preservación de historia

### Consecuencias

**Positivas:**
- ✅ Documentación refleja código real (7.5/10, 16 tests)
- ✅ 3 documentos maestros como única fuente de verdad
- ✅ Historia preservada en archive/
- ✅ Fácil encontrar información correcta
- ✅ Reducción de 57 → 46 archivos activos

**Negativas (aceptadas):**
- ⚠️ Links rotos a docs archivados (aceptable)
- ⚠️ Necesidad de actualizar docs después de cambios

### Verificación
```bash
# Verificar estructura
ls -la docs/*.md
# Debe mostrar: ESTADO_ACTUAL.md, PLAN_ACCION.md, DECISIONES.md, README.md

# Verificar archive
ls docs/archive/2025-10-18-cleanup/ | wc -l
# Debe mostrar: 11

ls docs/archive/slices/ | wc -l
# Debe mostrar: 5
```

---

## ADR-002: Circuit Breakers en AdminService
**Fecha:** 2025-10-17 (documentado 2025-10-18)
**Estado:** ✅ Implementado

### Contexto
AdminService se refactorizó en 6 servicios especializados:
- AdminStatsService
- AdminAlertasService
- AdminUsuariosService
- AdminRolesService
- AdminEstudiantesService
- SectoresRutasService

### Problema
Si uno de estos servicios falla, podría hacer caer todo el dashboard administrativo.

### Decisión
Implementar **Circuit Breakers** para cada servicio delegado:
- 5 Circuit Breakers con threshold de 5 fallos
- Reset timeout de 60 segundos
- Fallbacks para degradación elegante

### Consecuencias
- ✅ Si AdminStatsService falla → Dashboard muestra stats en 0, pero NO crashea
- ✅ Si AdminAlertasService falla → Muestra array vacío, resto del admin funciona
- ✅ Degradación elegante en lugar de fallo total

### Verificación
```bash
# Ver implementación
cat apps/api/src/admin/admin.service.ts | grep -A10 "Circuit"

# Verificar 5 circuit breakers
grep -c "new CircuitBreaker" apps/api/src/admin/admin.service.ts
# Debe mostrar: 5
```

**Archivo:** [apps/api/src/admin/admin.service.ts](../apps/api/src/admin/admin.service.ts#L39-L77)

---

## ADR-003: parseUserRoles Utility
**Fecha:** 2025-10-16 (documentado 2025-10-18)
**Estado:** ✅ Implementado

### Contexto
Roles de usuario vienen de la base de datos como string JSON, array o undefined.
Esto causaba crashes por `null.map is not a function`.

### Problema
Parsing inseguro de roles causaba errores runtime en múltiples lugares.

### Decisión
Crear utility function `parseUserRoles()` en `apps/api/src/common/utils/role.utils.ts`:
- Maneja string JSON, arrays, undefined
- Try-catch para parsing seguro
- Fallback a array vacío
- Usado en 5 ubicaciones del código

### Consecuencias
- ✅ No más crashes por roles malformados
- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Fácil de testear

### Verificación
```bash
# Ver implementación
cat apps/api/src/common/utils/role.utils.ts

# Contar usos
grep -r "parseUserRoles" apps/api/src --include="*.ts" | wc -l
# Debe mostrar: 5+
```

**Archivo:** [apps/api/src/common/utils/role.utils.ts](../apps/api/src/common/utils/role.utils.ts)

---

## ADR-004: Health Check Endpoints
**Fecha:** 2025-10-15 (documentado 2025-10-18)
**Estado:** ✅ Implementado

### Contexto
Necesitamos monitorear la salud del sistema para:
- DevOps: Detectar cuando el backend está caído
- Kubernetes/Docker: Readiness y Liveness probes
- Scripts: `dev-clean-restart.sh` necesita verificar que backend arrancó

### Problema
Sin health checks, no sabemos si el sistema está funcionando correctamente.

### Decisión
Implementar 3 endpoints de health check:
- `GET /api/health` - Health check completo (Prisma + servicios)
- `GET /api/health/ready` - Readiness probe (¿puede recibir tráfico?)
- `GET /api/health/live` - Liveness probe (¿está vivo el proceso?)

### Consecuencias
- ✅ Scripts pueden verificar que backend arrancó
- ✅ Kubernetes puede hacer health checks
- ✅ Monitoreo en producción

### Verificación
```bash
# Verificar endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/ready
curl http://localhost:3001/api/health/live

# Ver código
cat apps/api/src/health/health.controller.ts
```

**Archivo:** [apps/api/src/health/health.controller.ts](../apps/api/src/health/health.controller.ts)

---

## ADR-005: UserThrottlerGuard Null-Safety
**Fecha:** 2025-10-16 (documentado 2025-10-18)
**Estado:** ✅ Implementado

### Contexto
El UserThrottlerGuard leía headers `x-forwarded-for` para rate limiting por IP.
Si el header estaba malformado, `split(',')` crasheaba el sistema.

### Problema
Headers HTTP malformados causaban crashes en producción.

### Decisión
Implementar null-safety en líneas 35-46:
```typescript
const forwardedFor = request.headers['x-forwarded-for'];
const forwardedParts = typeof forwardedFor === 'string'
  ? forwardedFor.split(',')
  : [];
const forwardedIp = forwardedParts[0]?.trim();
```

### Consecuencias
- ✅ No más crashes por headers malformados
- ✅ Fallback a 'unknown' si no hay IP
- ✅ Optional chaining `?.` previene errores

### Verificación
```bash
# Ver fix
cat apps/api/src/common/guards/user-throttler.guard.ts | sed -n '35,46p'
```

**Archivo:** [apps/api/src/common/guards/user-throttler.guard.ts:35-46](../apps/api/src/common/guards/user-throttler.guard.ts#L35-L46)

---

## FORMATO PARA NUEVAS DECISIONES

### ADR-XXX: [Título Descriptivo]
**Fecha:** YYYY-MM-DD
**Estado:** Propuesta / Aceptada / Rechazada / Deprecada

#### Contexto
[Por qué surgió esta necesidad]

#### Problema
[Qué necesitamos resolver exactamente]

#### Decisión
[Qué decidimos hacer y cómo]

#### Alternativas Consideradas
- **Opción A:** [Descripción] - ❌ Rechazada porque...
- **Opción B:** [Descripción] - ✅ Aceptada porque...

#### Consecuencias
**Positivas:**
- ✅ [Beneficio 1]
- ✅ [Beneficio 2]

**Negativas (aceptadas):**
- ⚠️ [Trade-off 1]
- ⚠️ [Trade-off 2]

#### Verificación
```bash
# Comando para verificar que está implementado
comando_aqui
```

**Archivos afectados:** [links a código]

---

## GUÍA DE USO

### Cuándo crear un ADR
Crea un ADR cuando:
- ✅ Tomas una decisión arquitectónica importante
- ✅ Cambias un patrón existente
- ✅ Rechazas una solución alternativa por razones específicas
- ✅ Implementas algo que afecta múltiples módulos

### Cuándo NO crear un ADR
No crees ADR para:
- ❌ Bugs simples o typos
- ❌ Cambios triviales de estilo
- ❌ Refactorings menores

### Cómo actualizar este documento
1. Copia el formato de arriba
2. Llena todas las secciones
3. Incluye comando de verificación
4. Linkea a código real
5. Commit: `docs: add ADR-XXX for [título]`

---

## ÍNDICE DE DECISIONES

| ADR | Título | Fecha | Estado |
|-----|--------|-------|--------|
| ADR-001 | Limpieza de Documentación | 2025-10-18 | ✅ Aceptada |
| ADR-002 | Circuit Breakers en AdminService | 2025-10-17 | ✅ Implementado |
| ADR-003 | parseUserRoles Utility | 2025-10-16 | ✅ Implementado |
| ADR-004 | Health Check Endpoints | 2025-10-15 | ✅ Implementado |
| ADR-005 | UserThrottlerGuard Null-Safety | 2025-10-16 | ✅ Implementado |

---

**Mantén este documento actualizado. Es la historia de por qué el sistema es como es.**
# Security Note: xlsx vulnerability
- Vulnerability: HIGH (Prototype Pollution + ReDoS)
- Impact: LOW (solo usamos para export, no import)
- Action: Monitor para fix futuro
- Date: 2025-10-18
