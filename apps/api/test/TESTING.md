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

## Patrón de Test

```typescript
/**
 * ============================================================================
 * INTEGRATION TESTS - [Nombre del Feature]
 * ============================================================================
 *
 * Endpoint: POST /api/...
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
