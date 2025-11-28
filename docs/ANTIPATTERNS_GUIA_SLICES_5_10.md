# Guia Anti-patterns para SLICES 5-10

Lecciones aprendidas de SLICES 1-4 y auditoria del codebase existente.

---

## NO HACER

### 1. God Services (> 300 lineas)

**Problema real encontrado:**

- `inscripciones-2026.service.ts`: 1063 lineas, 9 dependencias
- `auth.service.ts`: 1024 lineas

**Solucion:**

- Maximo 300 lineas por service
- Si crece mas, extraer a use-cases o servicios especializados
- Un service = una responsabilidad

**Ejemplo de refactor:**

```typescript
// MAL: God Service
class InscripcionesService {
  crearInscripcion() {
    /* 200 lineas */
  }
  procesarWebhook() {
    /* 300 lineas */
  }
  validarPago() {
    /* 150 lineas */
  }
  crearEstudiante() {
    /* 200 lineas */
  }
}

// BIEN: Servicios especializados
class CrearInscripcionUseCase {
  /* 150 lineas */
}
class ProcesarWebhookUseCase {
  /* 150 lineas */
}
class InscripcionesService {
  // Orquestador < 100 lineas
  constructor(
    private crearInscripcion: CrearInscripcionUseCase,
    private procesarWebhook: ProcesarWebhookUseCase,
  ) {}
}
```

### 2. Fat Controllers (> 150 lineas)

**Problema real encontrado:**

- `admin.controller.ts`: 707 lineas
- `pagos.controller.ts`: 518 lineas

**Solucion:**

- Controller solo recibe request, llama service, retorna response
- NO logica de negocio en controllers
- Maximo 150 lineas
- Dividir por recurso si crece

**Ejemplo:**

```typescript
// MAL
@Controller('admin')
class AdminController {
  // 50 endpoints mezclados: estudiantes, docentes, clases, pagos
}

// BIEN
@Controller('admin/estudiantes')
class AdminEstudiantesController {
  /* 10 endpoints */
}

@Controller('admin/docentes')
class AdminDocentesController {
  /* 10 endpoints */
}
```

### 3. Dependencias Excesivas (> 5 deps)

**Problema real encontrado:**

- `inscripciones-2026.service.ts`: 9 dependencias
- `pagos.service.ts`: 8 dependencias

**Solucion:**

- Maximo 5 dependencias inyectadas por service
- Si necesitas mas, probablemente el service hace demasiado
- Considera usar facade pattern

**Ejemplo:**

```typescript
// MAL: 9 dependencias
constructor(
  private prisma: PrismaService,
  private mercadoPago: MercadoPagoService,
  private config: ConfigService,
  private pricing: PricingCalculatorService,
  private pin: PinGeneratorService,
  private tutor: TutorCreationService,
  private webhook: WebhookProcessorService,
  private idempotency: IdempotencyService,
  private validator: ValidatorService,
) {}

// BIEN: Facade + especializado
constructor(
  private prisma: PrismaService,
  private inscripcionFacade: InscripcionFacadeService, // Agrupa pricing, pin, tutor
  private pagosFacade: PagosFacadeService, // Agrupa mercadoPago, webhook, idempotency
) {}
```

### 4. Dependencias Circulares

**Problema real encontrado:**

```
SecurityModule <-> AuthModule
SharedModule <-> PagosModule
Inscripciones2026Module <-> WebhookQueueModule
```

**Solucion:**

- NUNCA usar `forwardRef()` para nuevo codigo
- Extraer logica compartida a modulo comun
- Usar eventos para comunicacion desacoplada

**Ejemplo:**

```typescript
// MAL: forwardRef
imports: [forwardRef(() => AuthModule)];

// BIEN: Extraer a modulo compartido
// shared/token-validation.service.ts
@Injectable()
export class TokenValidationService {}

// O usar eventos
@Injectable()
export class WebhookService {
  constructor(private eventEmitter: EventEmitter2) {}

  async process(webhook) {
    this.eventEmitter.emit('payment.confirmed', payload);
  }
}
```

### 5. Codigo Duplicado

**Problema real encontrado:**

- 86 `throw new NotFoundException(...no encontrad...)`
- Logica de PIN en 3 lugares (ya refactorizado)
- Logica de pricing duplicada

**Solucion:**

- Crear helpers/utilities compartidos
- Usar servicios compartidos en SharedModule

**Ejemplo:**

```typescript
// MAL: Duplicado en cada service
if (!estudiante) {
  throw new NotFoundException(`Estudiante ${id} no encontrado`);
}

// BIEN: Helper compartido
// shared/helpers/assert.helper.ts
export function assertExists<T>(
  entity: T | null | undefined,
  entityName: string,
  id: string,
): asserts entity is T {
  if (!entity) {
    throw new NotFoundException(`${entityName} ${id} no encontrado`);
  }
}

// Uso
assertExists(estudiante, 'Estudiante', id);
```

### 6. any/unknown sin Type Guard

**Problema:** Solo 2 casos en codebase (bien manejado)

**Regla:**

- PROHIBIDO: `any` en codigo nuevo
- PROHIBIDO: `unknown` sin type guard
- PROHIBIDO: `@ts-ignore`, `@ts-nocheck`

```typescript
// MAL
function process(data: any) {}

// BIEN
function process(data: unknown) {
  if (isValidPayload(data)) {
    // ahora TypeScript sabe el tipo
  }
}

function isValidPayload(data: unknown): data is PayloadType {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

---

## HACER

### Estructura Recomendada por Modulo

```
modulo/
├── modulo.module.ts
├── modulo.controller.ts     # < 150 lineas
├── modulo.service.ts        # < 300 lineas
├── use-cases/               # Si hay logica compleja
│   ├── crear-X.use-case.ts
│   └── actualizar-X.use-case.ts
├── dto/
│   ├── create-X.dto.ts
│   └── update-X.dto.ts
├── entities/                # Si hay logica de dominio
├── interfaces/
└── __tests__/
    └── modulo.service.spec.ts
```

### Ejemplo Real: SLICE 4 (Onboarding)

```
onboarding/
├── onboarding.module.ts     # 23 lineas
├── onboarding.controller.ts # 207 lineas (limite)
├── onboarding.service.ts    # 482 lineas (OK, logica de estado compleja)
├── index.ts                 # 4 lineas
└── __tests__/
    └── onboarding.service.spec.ts  # 27 tests
```

**Metricas:**

- Service: 482 lineas, 3 deps
- Controller: 207 lineas
- Tests: 27, 100% coverage de logica

### Patrones Exitosos de Slices 1-4

| Slice      | Service | Controller | Deps | Tests |
| ---------- | ------- | ---------- | ---- | ----- |
| Casas      | 109     | 0\*        | 1    | 41    |
| Mundos     | 97      | 85         | 1    | 21    |
| Tiers      | 139     | 90         | 1    | 34    |
| Onboarding | 482     | 207        | 3    | 27    |

\*Casas no expone controller publico (solo interno)

---

## Checklist antes de PR

### Tamano

- [ ] Ningun service > 300 lineas
- [ ] Ningun controller > 150 lineas
- [ ] Maximo 5 deps por constructor

### Calidad

- [ ] 0 errores TypeScript (`npx tsc --noEmit`)
- [ ] Sin `any`/`unknown` sin guard
- [ ] Sin `forwardRef()`
- [ ] Sin `@ts-ignore`

### Tests

- [ ] Tests con coverage > 80% en codigo nuevo
- [ ] Nombres descriptivos: `should_[action]_when_[condition]`
- [ ] TDD: test primero, codigo despues

### Commits

- [ ] Build pasa (`npm run build`)
- [ ] Lint pasa (`npm run lint`)
- [ ] Mensaje descriptivo: `tipo(scope): descripcion`

---

## Metricas Objetivo por Slice

| Metrica           | Limite | Ideal |
| ----------------- | ------ | ----- |
| Service lines     | < 300  | < 200 |
| Controller lines  | < 150  | < 100 |
| Dependencies      | <= 5   | <= 3  |
| Test coverage     | > 80%  | > 90% |
| TypeScript errors | 0      | 0     |

---

## Quick Reference

### Cuando crear use-case separado?

- Logica > 100 lineas
- Logica reutilizable entre endpoints
- Requiere multiples servicios coordinados

### Cuando dividir service?

- > 300 lineas
- > 5 dependencias
- Multiples responsabilidades evidentes

### Cuando dividir controller?

- > 150 lineas
- Endpoints de diferentes recursos
- Diferentes niveles de autorizacion

---

## Comandos Utiles

```bash
# Verificar tamano de services
find src -name "*.service.ts" -exec wc -l {} \; | sort -rn | head -10

# Verificar tamano de controllers
find src -name "*.controller.ts" -exec wc -l {} \; | sort -rn | head -10

# Buscar any
grep -rn ": any\b" --include="*.ts" | grep -v "node_modules\|\.spec\."

# Buscar forwardRef
grep -rn "forwardRef" --include="*.module.ts"

# TypeScript check
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

---

**Ultima actualizacion:** 2024-11-28
**Aplicar desde:** SLICE 5 en adelante
