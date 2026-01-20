# Testing de Integración - Convenciones

Guía para escribir tests de integración consistentes en Mateatletas API.

## Filosofía: Black Box Testing (Anti-Sesgo)

**IMPORTANTE:** Los tests de integración deben ser "jueces, no cómplices".

### El Problema del Sesgo

Si la IA lee el código y luego escribe el test, tiende a testear "lo que el código hace" en vez de "lo que el código **debería** hacer". Esto es un riesgo real llamado **sesgo de confirmación**.

### La Solución: Black Box Testing

1. **No mires el código interno**: Al crear el test, no pienses en cómo está escrita la función en el backend.

2. **Céntrate en el contrato**: Piensa: "Si yo envío X al endpoint, debo recibir Y como respuesta".

3. **El test es el juez, no el cómplice**: El test debe basarse en los **requisitos del negocio**, no en las líneas de código.

### Proceso Recomendado

1. **Antes de escribir tests**, definir qué DEBERÍA hacer el endpoint:
   - ¿Qué roles pueden acceder?
   - ¿Qué validaciones debe hacer?
   - ¿Qué debe retornar en cada caso?
   - ¿Qué side-effects debe tener en la DB?

2. **Escribir tests basados en esos requisitos** (sin leer la implementación).

3. **Si el test falla**, puede ser:
   - El código tiene un bug (lo ideal - encontramos un problema)
   - El requisito estaba mal definido (hay que ajustar)

### Qué Tests Siempre Aportan Valor

Incluso leyendo el código primero, estos tests son "universales" y valiosos:

- **Seguridad (401/403)**: Siempre testear que los roles incorrectos no pueden acceder
- **Aislamiento de datos**: Usuario A no puede ver/modificar datos de Usuario B
- **Idempotencia**: Operaciones repetidas no rompen nada
- **Edge cases**: Datos vacíos, nulos, duplicados, estudiantes dados de baja, etc.

---

## ⛔ REGLA CRÍTICA: Qué Hacer Cuando un Test Falla

> **ESTA ES LA REGLA MÁS IMPORTANTE DE ESTE DOCUMENTO. LEER SIEMPRE.**

**PROHIBIDO ABSOLUTO:** Modificar el test para que pase sin antes diagnosticar la causa raíz.

### Protocolo Obligatorio (Sin Excepciones)

Cuando un test falla, Claude Code **DEBE**:

1. **FRENAR** - No tocar nada de código ni tests
2. **REPORTAR** - Decir exactamente:
   - Qué test falló
   - Qué se esperaba vs qué se recibió
   - El error completo
3. **DIAGNOSTICAR** - Investigar si el problema es:
   - **A) Bug en el código** → Arreglar el CÓDIGO, no el test
   - **B) Test incorrecto** → Explicar POR QUÉ el test está mal (con justificación de negocio)
   - **C) Requisito ambiguo** → Preguntar al usuario qué comportamiento espera
4. **PREGUNTAR** antes de actuar:
   > "El test X falló porque esperaba Y pero recibió Z.
   > Esto puede ser:
   >
   > - Un bug en el código (arreglo el código)
   > - El test tiene una expectativa incorrecta (arreglo el test)
   >   ¿Cuál es el comportamiento correcto según el negocio?"

### 🚫 Señales de que Claude está siendo CÓMPLICE (PROHIBIDO)

Estas acciones están **TERMINANTEMENTE PROHIBIDAS** sin autorización explícita del usuario:

- ❌ Cambiar `expect(200)` a `expect(404)` sin explicar por qué
- ❌ Agregar `.optional()` a un campo porque el código no lo retorna
- ❌ Modificar el assertion para que "coincida con la implementación actual"
- ❌ Decir "ajusté el test para que refleje el comportamiento actual"
- ❌ Cambiar el valor esperado en el test para que coincida con lo que retorna el código
- ❌ Eliminar assertions que fallan
- ❌ Comentar tests que no pasan
- ❌ Agregar `skip` o `todo` a tests sin explicar y pedir permiso

### ✅ Señales de que Claude está siendo JUEZ (CORRECTO)

- ✅ "El test espera X, el código retorna Y. El código tiene un bug, voy a arreglarlo."
- ✅ "¿El endpoint debería retornar 200 o 404 en este caso? Necesito saber el requisito."
- ✅ "El test está mal porque asume Z, pero según [documento/requisito] debería ser W. ¿Confirmo?"
- ✅ "Encontré que el código no cumple el contrato esperado. Arreglo el service, no el test."
- ✅ Reportar el fallo ANTES de intentar arreglarlo

### Ejemplo de Diagnóstico Correcto

```
❌ MAL (Cómplice):
"El test esperaba { success: true } pero recibió { ok: true }.
Voy a cambiar el test para que espere { ok: true }."

✅ BIEN (Juez):
"El test esperaba { success: true } pero recibió { ok: true }.
Esto indica que:
- O el código está retornando un formato incorrecto (debería ser success)
- O el test tiene la expectativa equivocada (debería ser ok)

¿Cuál es el contrato correcto de este endpoint según la documentación/requisitos?
Necesito saberlo antes de hacer cualquier cambio."
```

### Consecuencia de Violar Esta Regla

Si Claude modifica un test para que pase sin diagnosticar primero, el usuario tiene derecho a:

1. Revertir todos los cambios
2. Exigir que se siga el protocolo correctamente
3. Considerar el trabajo como NO TERMINADO

---

## Técnicas Black Box Testing

Todos los tests de integración DEBEN aplicar estas técnicas formales de testing.

### 1. Equivalence Partitioning (Partición de Equivalencia)

Dividir los inputs en "clases" que el sistema trata de forma equivalente.
Testear UN representante de cada clase, no todos los valores posibles.

**Ejemplo para GET /docentes/me/asignaciones:**

| Clase             | Descripción              | Representante a testear       |
| ----------------- | ------------------------ | ----------------------------- |
| Válido con datos  | Docente con asignaciones | Docente con 2 asignaciones    |
| Válido sin datos  | Docente sin asignaciones | Docente recién creado         |
| Inválido por auth | Token incorrecto         | Token expirado                |
| Inválido por rol  | Rol no autorizado        | Estudiante intentando acceder |

**NO testear:** docente con 1 asignación, con 3, con 5... son la misma clase.

### 2. Boundary Value Analysis (Análisis de Valores Límite)

Los bugs se esconden en los límites. Testear explícitamente:

- Valor mínimo (0, 1, string vacío)
- Valor máximo (MAX, límite de paginación)
- Justo antes/después del límite (MAX-1, MAX+1)

**Ejemplo para endpoint con paginación (limit=50 máximo):**

```typescript
it('limit=0 → debería retornar error o comportamiento por defecto');
it('limit=1 → debería retornar exactamente 1 resultado');
it('limit=50 → debería retornar hasta 50 resultados (máximo)');
it('limit=51 → debería retornar error o truncar a 50');
it('sin limit → debería usar valor por defecto');
```

**Ejemplo para strings:**

```typescript
it('nombre vacío "" → debería retornar 400');
it('nombre con 1 caracter → debería aceptar');
it('nombre con 255 caracteres → debería aceptar (límite)');
it('nombre con 256 caracteres → debería retornar 400');
```

### 3. Decision Table Testing (Tabla de Decisiones)

Para endpoints con múltiples condiciones que afectan el resultado.
Crear tabla con todas las combinaciones relevantes.

**Ejemplo para activar clase:**

| Condición                    | Caso 1 | Caso 2 | Caso 3 | Caso 4 |
| ---------------------------- | ------ | ------ | ------ | ------ |
| Es dueño de asignación       | ✅     | ✅     | ❌     | ✅     |
| Clase existe                 | ✅     | ❌     | ✅     | ✅     |
| Clase pertenece a asignación | ✅     | -      | ✅     | ❌     |
| **Resultado esperado**       | 201 OK | 404    | 403    | 400    |

Cada columna = un test case.

### 4. State Transition Testing (Transición de Estados)

Para endpoints que cambian estados. Documentar:

- Estados posibles
- Transiciones válidas
- Transiciones inválidas

**Ejemplo para activar/desactivar clase:**

```
Estados: DESACTIVADA, TEORIA_ACTIVA, PRACTICA_ACTIVA, AMBAS_ACTIVAS

Diagrama:
DESACTIVADA ──activar──► AMBAS_ACTIVAS
AMBAS_ACTIVAS ──desactivar──► DESACTIVADA
AMBAS_ACTIVAS ──desactivar_teoria──► PRACTICA_ACTIVA
PRACTICA_ACTIVA ──activar_teoria──► AMBAS_ACTIVAS

Tests de transición:
it('DESACTIVADA + activar → AMBAS_ACTIVAS')
it('AMBAS_ACTIVAS + activar → AMBAS_ACTIVAS (idempotente)')
it('AMBAS_ACTIVAS + desactivar → DESACTIVADA')
```

### 5. Error Guessing (Adivinación de Errores)

Basado en experiencia, testear casos que típicamente fallan:

- Caracteres especiales: `áéíóú`, `中文`, `🎮`, `<script>`, `'; DROP TABLE`
- Valores nulos/undefined donde no deberían estar
- IDs que no existen (formato válido pero no en DB)
- IDs con formato inválido (no UUID)
- Requests duplicados rápidos (race conditions)
- Campos opcionales ausentes
- Campos extra no esperados en el body

## Estructura de Carpetas

```
apps/api/test/
├── setup/
│   ├── test-app.ts       # Bootstrap reutilizable de NestJS
│   └── test-env.ts       # Variables de entorno para tests
├── helpers/
│   ├── auth.helpers.ts   # Login y manejo de sesiones
│   ├── db-cleanup.ts     # Limpieza de tablas entre tests
│   └── assertions.ts     # Assertions de base de datos
├── fixtures/
│   ├── factories/        # Factories por dominio
│   │   ├── usuario.factory.ts
│   │   ├── plan.factory.ts
│   │   ├── grupo.factory.ts
│   │   ├── comision.factory.ts
│   │   ├── contenido.factory.ts
│   │   ├── gamificacion.factory.ts
│   │   ├── scenarios.factory.ts
│   │   └── index.ts      # Re-exporta todo
│   └── presets/
│       ├── estudiante.presets.ts
│       └── index.ts
├── integration/          # Tests de integración
│   ├── auth/
│   ├── estudiantes/
│   └── *.integration.spec.ts
├── docker-compose.test.yml
└── jest-e2e.json
```

## Cómo Correr Tests

```bash
# 1. Levantar DB de test (PostgreSQL + Redis en memoria)
docker-compose -f apps/api/docker-compose.test.yml up -d

# 2. Aplicar migraciones
DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" \
  npx prisma migrate deploy

# 3. Correr tests
yarn workspace api test:integration

# Correr un archivo específico
yarn workspace api test --testPathPattern="completar-leccion.integration" --runInBand
```

## Factories Disponibles

Importar desde `../../fixtures/factories`:

### usuario.factory.ts

```typescript
createTestTutor(prisma, options?)     // → { tutor, password }
createTestDocente(prisma, options?)   // → { docente, password }
createTestAdmin(prisma, options?)     // → admin
createTestEstudiante(prisma, options?) // → { estudiante, password }
```

Options de createTestEstudiante:

- `tutorId?` - Si no se pasa, crea uno automáticamente
- `planId?`, `casaId?`
- `xpInicial?`, `rachaInicial?`
- `suspendido?` - Crea con estado SUSPENDIDO
- `override?` - { acceso_clases_vivo, hasta, motivo }

### plan.factory.ts

```typescript
createTestPlan(prisma, tipo)          // tipo: 'STEAM_LIBROS' | 'STEAM_ASINCRONICO' | 'STEAM_SINCRONICO'
createTestSuscripcion(prisma, tutorId, planId, options?)
```

### grupo.factory.ts

```typescript
createTestSector(prisma, options?)
createTestGrupo(prisma, options?)
createTestClaseGrupo(prisma, options?)
createTestInscripcionClaseGrupo(prisma, estudianteId, claseGrupoId, tutorId)
```

### comision.factory.ts

```typescript
createTestProducto(prisma, options?)
createTestComision(prisma, options)   // Requiere productoId
createTestInscripcionComision(prisma, estudianteId, comisionId, estado?)
```

### contenido.factory.ts

```typescript
createTestContenido(prisma, options?)
createTestPlanificacion(prisma, adminId, options?)
createTestAsignacionPlanificacion(prisma, planificacionId, claseGrupoId, docenteId, options?)
```

### gamificacion.factory.ts

```typescript
createTestLogro(prisma, options?)
createTestActividadFeed(prisma, estudianteId, tipo, options?)
createTestReaccionFeed(prisma, actividadId, estudianteId, emoji?)
```

### scenarios.factory.ts (Escenarios Completos)

```typescript
// Estudiante inscrito en comisión (clases en vivo tipo colonia)
createEstudianteConComision(prisma, options?)
// → { plan, tutor, docente, producto, comision, estudiante, inscripcion, passwords... }

// Estudiante inscrito en ClaseGrupo (aula virtual)
createEstudianteConClaseGrupo(prisma, options?)
// → { plan, tutor, docente, sector, claseGrupo, estudiante, inscripcion, passwords... }

// Setup completo de aula virtual con planificación
createFullAulaSetup(prisma, options?)
// → { admin, docente, sector, grupo, claseGrupo, tutor, estudiante,
//     planificacion, asignacion, clases, passwords... }
```

## Presets de Estudiante

Importar desde `../../fixtures/presets`:

```typescript
import { ESTUDIANTE_PRESETS } from '../../fixtures/presets';

// Variantes disponibles:
ESTUDIANTE_PRESETS.nuevo(prisma); // Sin plan ni suscripción
ESTUDIANTE_PRESETS.planLibros(prisma); // Con plan STEAM_LIBROS
ESTUDIANTE_PRESETS.planAsincronico(prisma); // Con plan STEAM_ASINCRONICO
ESTUDIANTE_PRESETS.planSincronico(prisma); // Con plan + ClaseGrupo + inscripción
ESTUDIANTE_PRESETS.suspendido(prisma); // Con estado SUSPENDIDO
ESTUDIANTE_PRESETS.conOverride(prisma); // Con acceso_override activo
ESTUDIANTE_PRESETS.suscripcionVencida(prisma); // Con suscripción CANCELADA
ESTUDIANTE_PRESETS.conProgreso(prisma); // Con XP, racha, logros, actividades
ESTUDIANTE_PRESETS.todoCompletado(prisma); // Con 50000 XP, nivel máximo
```

Cada preset retorna el estudiante + password + entidades relacionadas necesarias.

## Helpers Disponibles

### auth.helpers.ts

```typescript
import {
  loginUser,
  loginEstudiante,
  loginEstudianteRaw,
  generateUniqueIP,
  withAuthHeaders,
  withOriginHeader,
  withUniqueIP,
  FRONTEND_ORIGIN,
} from '../../helpers/auth.helpers';

// Login tutor/admin (retorna { token, cookie, user })
const auth = await loginUser(app, { email, password });

// Login estudiante (retorna { token, cookie, user })
const auth = await loginEstudiante(app, { username, password });

// Login que retorna cookies raw (para .set('Cookie', cookies))
const cookies = await loginEstudianteRaw(app, { username, password });

// Agregar headers de auth a un request
withAuthHeaders(request(app.getHttpServer()).get('/api/...'), auth);

// IP única para cada request (evita throttle de 5 req/min)
const ip = generateUniqueIP();
```

### db-cleanup.ts

```typescript
import {
  cleanAllTestTables,
  cleanGamificationTables,
} from '../../helpers/db-cleanup';

// Limpia TODAS las tablas de test (usar en beforeEach)
await cleanAllTestTables(prisma);

// Limpia solo tablas de gamificación
await cleanGamificationTables(prisma);
```

### assertions.ts

```typescript
import {
  assertEstudianteExists,
  assertEstudianteNotExists,
  assertTutorExists,
  assertXPEquals,
  assertXPIncreased,
  assertRachaEquals,
  assertInscritoEnClaseGrupo,
  assertEstudianteState,
  getXPActual,
  getRachaActual,
} from '../../helpers/assertions';

// Verificar que estudiante existe con datos esperados
await assertEstudianteExists(
  prisma,
  { username: 'test' },
  { estado_acceso: 'ACTIVO' },
);

// Verificar XP exacto
await assertXPEquals(prisma, estudianteId, 100);

// Verificar estado completo
await assertEstudianteState(prisma, estudianteId, {
  xp: 100,
  racha: 5,
  logrosCount: 2,
});
```

## Patrón de Test con Black Box Testing

El header del archivo DEBE documentar las técnicas BBT aplicadas:

```typescript
/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST
 * ============================================================================
 *
 * ENDPOINT: POST /docentes/asignaciones/:id/clases/:claseId/activar
 *
 * EQUIVALENCE CLASSES:
 * - Auth: [válido-docente-dueño, válido-docente-otro, válido-estudiante, inválido]
 * - Asignación: [existe-propia, existe-ajena, no-existe]
 * - Clase: [existe-en-asignación, existe-otra-asignación, no-existe]
 * - Estado inicial: [desactivada, ya-activa]
 *
 * BOUNDARIES:
 * - N/A para este endpoint (no tiene parámetros numéricos)
 *
 * STATE TRANSITIONS:
 * - DESACTIVADA → activar → ACTIVA
 * - ACTIVA → activar → ACTIVA (idempotente)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="nombre.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { createTestEstudiante } from '../../fixtures/factories';
import { ESTUDIANTE_PRESETS } from '../../fixtures/presets';
import { loginEstudianteRaw, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Feature Name', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // SETUP
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const expressApp = app.getHttpAdapter().getInstance() as express.Application;
    expressApp.set('trust proxy', true);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // TESTS
  // ============================================================================
  describe('POST /api/endpoint', () => {
    it('debe hacer algo cuando condición', async () => {
      // ARRANGE - Crear datos
      const { estudiante, password } = await ESTUDIANTE_PRESETS.planSincronico(prisma);
      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // ACT - Ejecutar acción
      const response = await request(app.getHttpServer())
        .post('/api/endpoint')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ campo: 'valor' });

      // ASSERT - Verificar resultado
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verificar en DB
      const enDB = await prisma.tabla.findFirst({ where: { ... } });
      expect(enDB).toBeDefined();
    });

    it('debe fallar cuando usuario no autenticado', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/endpoint')
        .send({ campo: 'valor' });

      expect(response.status).toBe(401);
    });
  });
});
```

## Convenciones

### Reglas Obligatorias BBT

1. **Header documentado**: Cada archivo DEBE incluir en el header un comentario documentando:
   - Equivalence Classes identificadas
   - Boundaries relevantes (si aplica)
   - State Transitions (si aplica)

2. **Agrupación por técnica**: Los `describe` DEBEN agruparse por técnica BBT:

```typescript
describe('Equivalence Partitioning: Autenticación', () => { ... });
describe('Equivalence Partitioning: Recursos', () => { ... });
describe('State Transitions', () => { ... });
describe('Error Guessing', () => { ... });
```

3. **Nombres descriptivos**: El nombre del test DEBE indicar la clase/boundary/transición:

```typescript
// Bueno - indica la clase de equivalencia
it('Clase VÁLIDO-DOCENTE-DUEÑO: debe activar correctamente', async () => {});
it('Clase INVÁLIDO (sin token): debe retornar 401', async () => {});

// Bueno - indica el boundary
it('limit=50 (máximo): debe retornar hasta 50 resultados', async () => {});

// Bueno - indica la transición
it('Transición DESACTIVADA → activar → ACTIVA', async () => {});
```

### Naming de Archivos

- Tests de integración: `nombre.integration.spec.ts`
- Tests e2e: `nombre.e2e-spec.ts`

### Naming de Describes/Its

```typescript
describe('[INTEGRATION] Feature - SubFeature', () => {
  describe('POST /api/endpoint', () => {
    it('debe [acción] cuando [condición]', async () => {});
    it('debe fallar si [condición de error]', async () => {});
    it('NO debe [acción] si [condición]', async () => {});
  });
});
```

### Manejo de Auth y Throttle

**IMPORTANTE:** El sistema tiene throttle de 5 requests/minuto por IP.

```typescript
// SIEMPRE usar generateUniqueIP() o loginEstudianteRaw()
// que internamente genera IPs únicas
const cookies = await loginEstudianteRaw(app, { username, password });

// Para requests manuales:
request(app.getHttpServer())
  .post('/api/auth/login')
  .set('X-Forwarded-For', generateUniqueIP())
  .send({ ... });
```

### Cleanup Entre Tests

```typescript
beforeEach(async () => {
  await cleanAllTestTables(prisma); // SIEMPRE limpiar
});
```

### Timeouts

```typescript
beforeAll(async () => { ... }, 60000);  // 60s para setup
afterAll(async () => { ... }, 30000);   // 30s para cleanup
```

## Tests de Referencia

Ver estos tests como ejemplos bien estructurados:

1. **Completar lección**: `integration/estudiantes/completar-leccion.integration.spec.ts`
2. **Activity Feed**: `integration/estudiantes/activity-feed.integration.spec.ts`
3. **Fixtures Validation**: `integration/fixtures-validation.integration.spec.ts`

## Docker Compose para Tests

```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:15-alpine
    ports: ['5433:5432']
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test_password_123
      POSTGRES_DB: mateatletas_test
    tmpfs: ['/var/lib/postgresql/data'] # En memoria = rápido

  redis-test:
    image: redis:7-alpine
    ports: ['6380:6379']
    tmpfs: ['/data']
```

URLs:

- `DATABASE_URL=postgresql://test:test_password_123@localhost:5433/mateatletas_test`
- `REDIS_URL=redis://localhost:6380`
