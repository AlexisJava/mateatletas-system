# PLAN DE ACCIÓN ACTUALIZADO - MATEATLETAS ECOSYSTEM

**Fecha:** 2025-10-22  
**Basado en:** Auditorías recuperadas + Estado verificado  
**Calificación actual:** 9.1/10  
**Objetivo:** 9.5/10 (excelencia operacional)

---

## 📊 RESUMEN EJECUTIVO

**Estado actual:** Sistema production-ready con mejoras identificadas  
**Problemas críticos detectados:** 4 vulnerabilidades de seguridad  
**Trabajo completado desde última auditoría:**
- ✅ Contratos compartidos (9 schemas Zod)
- ✅ Type casts eliminados (0 inseguros)
- ✅ Tests expandidos (475 tests, 34 suites)
- ✅ Sistema de passwords temporales

**Trabajo pendiente prioritario:** 3 áreas principales

---

## 🎯 PRIORIDADES ACTUALIZADAS

### 🔴 Prioridad 1: SEGURIDAD CRÍTICA (4 vulnerabilidades)

**Fuente:** AUDITORIA_DEUDA_TECNICA_EXHAUSTIVA.md  
**Impacto:** CRÍTICO - Riesgo de pérdida de ingresos, robo de datos, DDoS

#### Tarea #1.1: Proteger Endpoint Mock de Pagos
**Archivo:** `apps/api/src/pagos/pagos.controller.ts:159`  
**Tiempo:** 15 minutos  
**Impacto:** Prevenir activación de membresías gratis

**Acción:**
```typescript
@Post('mock/activar-membresia/:id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
async activarMembresiaMock(@Param('id') membresiaId: string) {
  if (process.env.NODE_ENV === 'production') {
    throw new ForbiddenException('Mock endpoint disabled in production');
  }
  return this.pagosService.activarMembresiaMock(membresiaId);
}
```

#### Tarea #1.2: Configurar CORS Restrictivo
**Archivo:** `apps/api/src/main.ts:13`  
**Tiempo:** 10 minutos  
**Impacto:** Prevenir CSRF y XSS cross-site

**Acción:**
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    process.env.FRONTEND_URL || 'https://mateatletas.com',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
});
```

#### Tarea #1.3: Verificar Migración JWT a httpOnly Cookies
**Archivo:** `apps/web/src/lib/axios.ts:29`  
**Tiempo:** 5 minutos (verificación)  
**Estado:** Según auditoría dice "✅ RESUELTO" - VERIFICAR

**Acción:** Confirmar que NO se usa `localStorage.getItem('auth-token')`

#### Tarea #1.4: Implementar Rate Limiting
**Archivo:** `apps/api/src/auth/auth.controller.ts`  
**Tiempo:** 1 hora  
**Impacto:** Prevenir brute force y DDoS

**Acción:**
```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
```

**Tiempo total Prioridad 1:** 1.5 horas  
**Impacto:** +0.3 puntos (Seguridad: 4/10 → 8/10)

---

### 🟠 Prioridad 2: VALIDACIÓN ZOD EN FRONTEND (9 archivos)

**Fuente:** ANALISIS_API_ZOD_ESTADO.md  
**Estado actual:** 5/14 archivos con validación (36%)  
**Objetivo:** 14/14 archivos (100%)

#### Archivos Prioritarios Sin Validación

**Alta Prioridad (4 archivos):**

1. **pagos.api.ts** (2.4K, 6 funciones)
   - Schemas necesarios: `membresiaSchema`, `pagoSchema`
   - Tiempo: 45 min

2. **asistencia.api.ts** (4.3K)
   - Schema necesario: `asistenciaSchema`
   - Tiempo: 1 hora

3. **clases.api.ts** (2.9K)
   - Schema necesario: `claseSchema` (ya existe en contracts)
   - Tiempo: 45 min

4. **calendario.api.ts** (4.8K)
   - Schemas necesarios: `eventoSchema`, `calendarioSchema`
   - Tiempo: 1 hora

**Media Prioridad (3 archivos):**

5. **cursos.api.ts** (7.6K) - 1.5 horas
6. **gamificacion.api.ts** (4.2K) - 1 hora
7. **auth.api.ts** (3.0K) - 45 min

**Baja Prioridad (2 archivos):**

8. **docentes.api.ts** (2.7K) - Ya tiene validación parcial en admin.api.ts
9. **sectores.api.ts** (3.1K) - Ya tiene validación parcial en admin.api.ts

#### Pasos para cada archivo:

1. Crear/importar schema de `@mateatletas/contracts`
2. Reemplazar `return response.data` con `schema.parse(response.data)`
3. Agregar tests de validación

**Tiempo total Prioridad 2:** 7 horas (alta prioridad), 10.5 horas (completo)  
**Impacto:** Reducir 30-40 errores TypeScript más

---

### 🟡 Prioridad 3: ERRORES TYPESCRIPT EN FRONTEND (206 errores)

**Fuente:** INFORME_ERRORES_TYPESCRIPT_ESLINT_EXHAUSTIVO.md  
**Estado actual:** 206 errores en apps/web

#### Top 5 Archivos con Más Errores

1. **components/admin/__tests__/CreateDocenteForm.improvements.spec.tsx** (37 errores)
   - Problema: Falta `@testing-library/react`
   - Solución: `npm install --save-dev @testing-library/react @testing-library/jest-dom`
   - Tiempo: 30 min

2. **app/admin/usuarios/page.tsx** (23 errores)
   - Problema: Type casting incorrecto + unknown types
   - Tiempo: 1 hora

3. **app/admin/reportes/page.tsx** (19 errores)
   - Problema: Export utils + Recharts types
   - Tiempo: 1.5 horas

4. **components/admin/GestionarEstudiantesModal.tsx** (12 errores)
   - Problema: AxiosResponse mal tipado
   - Tiempo: 45 min

5. **app/estudiante/logros/page.tsx** (11 errores)
   - Problema: Record<string, unknown> issues
   - Tiempo: 45 min

**Categorías de Errores:**
- Casting incorrecto: 45 errores (22%)
- Unknown types: 68 errores (33%)
- Null safety: 40 errores (19%)
- Tests sin deps: 37 errores (18%)

**Estrategia:**
1. Fix testing library (37 errores) - 30 min
2. Fix top 5 archivos (102 errores) - 5 horas
3. Resto (67 errores) - 4 horas

**Tiempo total Prioridad 3:** 9.5 horas  
**Impacto:** Build limpio sin errores TypeScript

---

### 🟢 Prioridad 4: MEJORAS OPCIONALES

#### 4.1 Dashboard de Observabilidad para Circuit Breakers
**Tiempo:** 1.5 horas  
**Estado:** No implementado (verificado)

#### 4.2 Aumentar Coverage de Tests
**Estado actual:** 475 tests (excelente)  
**Acción:** Medir coverage con `npm run test:cov`  
**Tiempo:** 15 min verificación

#### 4.3 Implementar Sentry para Error Tracking
**Tiempo:** 2 horas  
**Impacto:** Mejor observabilidad en producción

---

## 📅 CRONOGRAMA RECOMENDADO

### Día 1 (1.5 horas) - CRÍTICO
- 🔴 Prioridad 1: Seguridad (4 vulnerabilidades)
  - Mock endpoint protection (15 min)
  - CORS restrictivo (10 min)
  - Verificar JWT cookies (5 min)
  - Rate limiting (1 hora)

### Día 2 (4 horas) - ALTA
- 🟠 Prioridad 2: Validación Zod (archivos alta prioridad)
  - pagos.api.ts (45 min)
  - asistencia.api.ts (1 hora)
  - clases.api.ts (45 min)
  - calendario.api.ts (1 hora)

### Día 3 (5.5 horas) - ALTA
- 🟡 Prioridad 3: Errores TypeScript (top issues)
  - Fix testing library (30 min)
  - usuarios/page.tsx (1 hora)
  - reportes/page.tsx (1.5 horas)
  - GestionarEstudiantesModal (45 min)
  - logros/page.tsx (45 min)
  - Validar build (30 min)

### Día 4+ (Opcional)
- Completar validación Zod (3.5 horas)
- Completar errores TypeScript (4 horas)
- Dashboard observabilidad (1.5 horas)

**Tiempo total mínimo:** 11 horas  
**Tiempo total completo:** 20 horas

---

## 🎯 MÉTRICAS DE ÉXITO

| Métrica | Actual | Objetivo Día 1 | Objetivo Final |
|---------|--------|----------------|----------------|
| **Vulnerabilidades Críticas** | 4 | 0 ✅ | 0 ✅ |
| **Archivos API con Validación** | 5/14 (36%) | 9/14 (64%) | 14/14 (100%) |
| **Errores TypeScript (web)** | 206 | 169 | 0 |
| **Build limpio** | ⚠️ Con warnings | ⚠️ Con warnings | ✅ Sin errores |
| **Calificación Seguridad** | 4/10 | 8/10 | 9/10 |
| **Calificación General** | 9.1/10 | 9.3/10 | 9.5/10 |

---

## ✅ COMANDOS DE VERIFICACIÓN

### Después de Día 1 (Seguridad)
```bash
# Verificar guards en mock endpoint
grep -A 5 "activarMembresiaMock" apps/api/src/pagos/pagos.controller.ts

# Verificar CORS
grep -A 10 "enableCors" apps/api/src/main.ts

# Verificar JWT no en localStorage
grep -r "localStorage.getItem.*auth" apps/web/src/

# Verificar rate limiting
grep -r "ThrottlerModule" apps/api/src/
```

### Después de Día 2 (Validación Zod)
```bash
# Contar archivos con validación
grep -r "\.parse\|\.safeParse" apps/web/src/lib/api/*.ts | wc -l
# Esperado: >100 líneas

# Verificar schemas específicos
ls packages/contracts/src/schemas/ | grep -E "membresia|pago|asistencia|calendario"
```

### Después de Día 3 (TypeScript)
```bash
# Build sin errores
cd apps/web && npm run build
# Esperado: 0 errors (warnings OK)

# Contar errores restantes
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
# Esperado: <100 errores
```

---

## 📋 TAREAS COMPLETADAS (No hacer)

✅ Sistema de passwords temporales  
✅ Método cambiarPassword  
✅ Login por username  
✅ Contratos compartidos (9 schemas)  
✅ Type casts eliminados  
✅ 475 tests implementados  
✅ Circuit breakers implementados  

---

## 🚨 ALERTAS Y NOTAS

### CRÍTICO
- **Mock endpoint de pagos está ACTIVO en producción sin protección**
- Implementar Día 1 INMEDIATAMENTE

### IMPORTANTE
- Las auditorías son de Oct 17-20, algunos issues pueden estar resueltos
- Verificar estado antes de empezar cada tarea

### NICE TO HAVE
- Dashboard de observabilidad
- Sentry integration
- Coverage reports

---

## 🎯 CONCLUSIÓN

**Prioridad inmediata:** Día 1 (Seguridad) - 1.5 horas  
**ROI más alto:** Día 2 (Validación Zod) - Elimina 30-40 errores  
**Objetivo alcanzable:** 9.5/10 en 11 horas de trabajo enfocado
