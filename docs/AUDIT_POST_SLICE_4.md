# Audit Post-SLICE 4 - Analisis de Anti-patterns

Fecha: 2024-11-28
Slices auditados: CASAS, MUNDOS, TIERS, ONBOARDING

## Metodologia

- Lineas de codigo por archivo
- Dependencias inyectadas por service
- Codigo duplicado
- Violaciones de Clean Architecture

---

## Analisis

### 1. God Services (servicios > 300 lineas)

| Servicio                            | Lineas | Deps | Severidad |
| ----------------------------------- | ------ | ---- | --------- |
| inscripciones-2026.service.ts       | 1063   | 9    | CRITICO   |
| auth.service.ts                     | 1024   | 5    | CRITICO   |
| audit-log.service.ts                | 915    | 1    | ALTO      |
| colonia.service.ts                  | 871    | 5    | CRITICO   |
| docente-stats.service.ts            | 798    | 2    | ALTO      |
| admin-estudiantes.service.ts        | 720    | 1    | ALTO      |
| clase-grupos.service.ts             | 694    | -    | ALTO      |
| tienda.service.ts (gamificacion)    | 665    | 2    | MEDIO     |
| estudiante-query.service.ts         | 603    | -    | MEDIO     |
| security-monitoring.service.ts      | 586    | -    | MEDIO     |
| eventos.service.ts                  | 569    | -    | MEDIO     |
| estudiante-command.service.ts       | 568    | -    | MEDIO     |
| tutor-stats.service.ts              | 553    | -    | MEDIO     |
| clase-query.service.ts              | 505    | -    | MEDIO     |
| payment-amount-validator.service.ts | 500    | -    | MEDIO     |
| asistencia-reportes.service.ts      | 500    | -    | MEDIO     |
| tienda.service.ts (tienda)          | 485    | 2    | MEDIO     |
| **onboarding.service.ts (NUEVO)**   | 482    | 3    | MEDIO     |
| pagos.service.ts                    | 481    | 8    | CRITICO   |
| verificacion-morosidad.service.ts   | 473    | -    | MEDIO     |

**Total God Services:** 20 servicios > 300 lineas

### 2. Fat Controllers (controllers > 200 lineas)

| Controller                           | Lineas | Severidad |
| ------------------------------------ | ------ | --------- |
| admin.controller.ts                  | 707    | CRITICO   |
| pagos.controller.ts                  | 518    | CRITICO   |
| auth.controller.ts                   | 479    | ALTO      |
| estudiantes.controller.ts            | 401    | ALTO      |
| eventos.controller.ts                | 285    | MEDIO     |
| mfa.controller.ts                    | 275    | MEDIO     |
| tienda.controller.ts (gamificacion)  | 271    | MEDIO     |
| clases.controller.ts                 | 262    | MEDIO     |
| cursos.controller.ts                 | 253    | MEDIO     |
| inscripciones-2026.controller.ts     | 212    | BAJO      |
| **onboarding.controller.ts (NUEVO)** | 207    | BAJO      |
| tienda.controller.ts                 | 204    | BAJO      |
| tutor.controller.ts                  | 203    | BAJO      |

**Total Fat Controllers:** 13 controllers > 200 lineas

### 3. Dependencias Excesivas (> 5 deps inyectadas)

| Servicio                      | Dependencias | Detalle                                                                           |
| ----------------------------- | ------------ | --------------------------------------------------------------------------------- |
| inscripciones-2026.service.ts | 9            | prisma, mercadoPago, config, pricing, pin, tutor, webhook, idempotency, validator |
| pagos.service.ts              | 8            | 4 use-cases, 2 repos, mercadoPago, prisma                                         |
| colonia.service.ts            | 5            | prisma, mercadoPago, pricing, pin, tutor                                          |
| auth.service.ts               | 5            | -                                                                                 |

**Patron positivo:** Los servicios nuevos (Onboarding, Tiers, Casas, Mundos) tienen <= 3 dependencias.

### 4. Codigo Duplicado

#### Patrones repetidos encontrados:

| Patron                                            | Ocurrencias | Ubicacion                           |
| ------------------------------------------------- | ----------- | ----------------------------------- |
| `throw new NotFoundException(...no encontrad...)` | 86          | Todos los servicios                 |
| Logica de PIN generation                          | 3           | inscripciones-2026, colonia, shared |
| Logica de pricing                                 | 2           | inscripciones-2026, colonia         |
| Validacion de estudiante existente                | ~20         | Multiples servicios                 |

**Ya refactorizado:**

- PinGeneratorService (compartido)
- TutorCreationService (compartido)
- PricingCalculatorService (compartido)

### 5. Violaciones Clean Architecture

| Tipo                           | Cantidad  | Detalle                                       |
| ------------------------------ | --------- | --------------------------------------------- |
| Controllers con Prisma directo | 2         | HealthController (aceptable)                  |
| Services con HTTP exceptions   | 235       | Todas las NotFoundException, BadRequest, etc. |
| forwardRef (deps circulares)   | 4 modulos | security, shared, inscripciones-2026, queues  |

**Nota:** Usar HTTP exceptions en services es comun en NestJS y se considera aceptable, pero idealmente deberian usar excepciones de dominio.

### 6. Circular Dependencies

```
SecurityModule <-> AuthModule (TokenBlacklistService)
SharedModule <-> PagosModule (MercadoPagoWebhookProcessor)
Inscripciones2026Module <-> WebhookQueueModule
```

### 7. Otros Hallazgos

| Metrica             | Valor                                     |
| ------------------- | ----------------------------------------- |
| Uso de `any`        | 2 (aceptable, en interceptors/processors) |
| TODO/FIXME comments | 27                                        |

---

## Problemas Encontrados (por severidad)

### CRITICOS

1. **inscripciones-2026.service.ts (1063 lineas, 9 deps)**
   - Hace DEMASIADO: crea tutor, crea estudiante, procesa pago, maneja webhook
   - Deberia dividirse en use-cases

2. **auth.service.ts (1024 lineas)**
   - Maneja login, registro, MFA, tokens, password reset
   - Deberia dividirse en dominios

3. **admin.controller.ts (707 lineas)**
   - Controlador "god" con demasiados endpoints
   - Deberia dividirse por recurso

4. **pagos.controller.ts (518 lineas)**
   - Demasiada logica de presentacion

### ALTOS

1. **audit-log.service.ts (915 lineas)**
   - Servicio de auditoria muy grande

2. **colonia.service.ts (871 lineas)**
   - Duplica logica de inscripciones-2026

3. **docente-stats.service.ts (798 lineas)**
   - Servicio de estadisticas muy complejo

### MEDIOS

1. **Servicios entre 400-600 lineas** - 12 servicios
   - Manejables pero cerca del limite

2. **onboarding.service.ts (482 lineas, 3 deps)**
   - NUEVO: Aceptable para primer slice
   - Monitorear crecimiento

### MENORES

1. **27 TODO comments pendientes**
   - Algunos son de fase 2, otros son tech debt real

2. **2 usos de `any`**
   - En interceptors y processors, aceptable

---

## Metricas Slices 1-4 (nuevos)

| Modulo     | Service Lines | Controller Lines | Deps | Tests |
| ---------- | ------------- | ---------------- | ---- | ----- |
| casas      | 109           | 0                | 1    | 41    |
| mundos     | 97            | 85               | 1    | 21    |
| tiers      | 139           | 90               | 1    | 34    |
| onboarding | 482           | 207              | 3    | 27    |

**Observacion:** Los slices nuevos estan bien estructurados. Onboarding es el mas grande pero tiene logica de estado compleja justificada.

---

## Plan de Accion

### Fase Inmediata (no bloquea SLICE 5)

- [ ] Documentar patrones a seguir para nuevos slices

### Fase Posterior (tech debt sprint)

1. **Dividir inscripciones-2026.service.ts**
   - CrearInscripcionUseCase
   - ProcesarWebhookUseCase
   - ValidarInscripcionUseCase

2. **Dividir auth.service.ts**
   - LoginService
   - RegistroService
   - MfaService
   - TokenService

3. **Dividir admin.controller.ts**
   - AdminEstudiantesController
   - AdminDocentesController
   - AdminClasesController

4. **Resolver dependencias circulares**
   - Extraer interfaces compartidas
   - Usar eventos en lugar de llamadas directas

---

## Conclusion

El codebase legacy tiene tech debt significativo, pero los **nuevos slices (1-4) estan bien estructurados**:

- Services < 500 lineas
- Controllers < 210 lineas
- Max 3 dependencias
- Sin dependencias circulares
- 100% coverage en tests

**Recomendacion:** Continuar con el patron de los slices 1-4 para slices 5-10.
