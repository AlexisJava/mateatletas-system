# CLAUDE.md - Mateatletas

## METODOLOGÍA OBLIGATORIA

### Ciclo de Trabajo

AUDITORÍA → PLANIFICACIÓN → ATOMIZACIÓN → VERIFICACIÓN

1. **AUDITORÍA**: Analizar antes de tocar código
2. **PLANIFICACIÓN**: Plan completo ANTES de ejecutar
3. **ATOMIZACIÓN**: Commits pequeños y lógicos
4. **VERIFICACIÓN**: yarn build && yarn lint && yarn test después de cada cambio

### Si algo falla

- NO parches reactivos
- Analizar CAUSA RAÍZ
- Entender el problema completo antes de arreglar

## REGLAS INQUEBRANTABLES

### TypeScript

- ❌ PROHIBIDO: `any`, `unknown`, `@ts-ignore`, `@ts-nocheck`, `as` sin justificar
- ✅ OBLIGATORIO: Tipos explícitos, interfaces para DTOs, generics cuando aplique

### Prisma / Base de Datos

- ❌ PROHIBIDO: `prisma db push` (causa drift y desincronización)
- ❌ PROHIBIDO: `prisma migrate dev` sin backup previo (puede resetear la DB)
- ✅ OBLIGATORIO: Backup ANTES de cualquier migración
- ✅ Para ver SQL sin aplicar: `prisma migrate dev --create-only --name descripcion`
- Si hay error de migración: analizar causa, NO usar db push como parche

## MIGRACIONES DE BASE DE DATOS - REGLAS CRÍTICAS

**NUNCA uses `prisma migrate dev` directamente.** Puede resetear la base de datos y perder todos los datos.

### Proceso seguro de migración:

1. **SIEMPRE hacer backup antes de migrar:**

```bash
pg_dump -U postgres mateatletas_dev > backups/pre_migrate_$(date +%Y%m%d_%H%M%S).sql
```

2. **Crear la carpeta de backups si no existe:**

```bash
mkdir -p backups
```

3. **Para migraciones en desarrollo, usar:**

```bash
# Opción A: migrate deploy (no resetea, solo aplica migraciones pendientes)
npx prisma migrate deploy

# Opción B: si necesitás crear nueva migración
pg_dump -U postgres mateatletas_dev > backups/pre_migrate_$(date +%Y%m%d_%H%M%S).sql
npx prisma migrate dev --name nombre_migracion
```

4. **Si la migración falla o resetea la DB, restaurar:**

```bash
psql -U postgres mateatletas_dev < backups/pre_migrate_XXXXX.sql
```

### Script recomendado (usar siempre):

```bash
# scripts/safe-migrate.sh
#!/bin/bash
mkdir -p backups
echo "Haciendo backup..."
pg_dump -U postgres mateatletas_dev > backups/pre_migrate_$(date +%Y%m%d_%H%M%S).sql
echo "Migrando..."
npx prisma migrate dev --name "$1"
echo "Listo. Backup guardado en /backups"
```

**IMPORTANTE:** Si Alexis pide hacer una migración, SIEMPRE hacer backup primero. Sin excepciones.

### Seguridad

- ParseUUIDPipe en todos los @Param de IDs
- Nunca exponer passwords, tokens, secrets en logs/responses
- @Public() explícito para endpoints sin auth

### Arquitectura

- Clean Architecture: Controller → Service → Repository
- CQRS para operaciones complejas (Query vs Command services)
- Servicios < 400 líneas (si es más grande, dividir)
- Un archivo = una responsabilidad

### Testing

- TDD: Test primero, código después
- Coverage mínimo 80% en código nuevo
- Nombres: `should_[action]_when_[condition]`
- **Para escribir tests de integración, SIEMPRE leer primero: `apps/api/test/TESTING.md`**

### Commits

- NO commitear con errores TypeScript
- NO commitear con errores ESLint
- Commits atómicos: un cambio lógico por commit
- Mensaje: `tipo(scope): descripción`

## STACK

- **Backend**: NestJS 10 + Prisma 6 + PostgreSQL 15
- **Frontend**: Next.js 15 + React 19 + Tailwind 4
- **Testing**: Jest + React Testing Library
- **Cache**: Redis (Keyv) + In-Memory fallback
- **Queues**: BullMQ
- **Deploy**: Railway + Vercel

## COMANDOS

```bash
yarn build           # Compilar todo
yarn lint            # ESLint
yarn typecheck       # Verificar tipos
yarn test            # Tests
yarn test:cov        # Coverage
```

## ESTRUCTURA

```
mateatletas-ecosystem/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   └── contracts/    # DTOs compartidos
├── docs/             # Documentación técnica
├── prisma/           # Schema y migraciones
└── scripts/          # Utilidades
```

## CONVENCIONES

### Archivos

- Servicios: `nombre.service.ts` o `nombre-query.service.ts` / `nombre-command.service.ts`
- Controladores: `nombre.controller.ts`
- DTOs: `nombre.dto.ts`
- Tests: `nombre.spec.ts`

### Git

- Branch principal: `main`
- Features: `feature/nombre-descriptivo`
- Fixes: `fix/descripcion-bug`

## ANTI-PATRONES A EVITAR

- ❌ God Services (>400 líneas)
- ❌ N+1 queries (usar groupBy, include, o batch)
- ❌ Promise.all con loops de queries individuales
- ❌ console.log en producción (usar Logger de NestJS)
- ❌ Parches sin entender causa raíz

## FRONTEND - SKILL DE DISEÑO

**IMPORTANTE**: Antes de crear componentes UI, leer `/mnt/skills/public/frontend-design/SKILL.md`

### Principios de Diseño

1. **Dirección estética BOLD** - Elegir un estilo claro y ejecutarlo con precisión
2. **Typography distintiva** - NUNCA usar fonts genéricas (Arial, Inter, Roboto)
3. **Paleta cohesiva** - Colores dominantes con acentos fuertes, no paletas tímidas
4. **Motion con propósito** - Micro-interacciones, staggered reveals, scroll-triggered
5. **Composición espacial** - Layouts asimétricos, overlaps, grid-breaking
6. **Atmósfera y profundidad** - Gradientes, texturas, noise, shadows dramáticos

### EVITAR (AI Slop)

- ❌ Fonts genéricas (Inter, Roboto, Arial, system fonts)
- ❌ Gradientes púrpura sobre blanco (cliché AI)
- ❌ Layouts predecibles y cookie-cutter
- ❌ Componentes sin personalidad contextual
- ❌ Diseño que "parece hecho por AI"

### Estética Mateatletas

- **Tema**: Futurista/espacial con gradientes saturados
- **Background**: Dark (#030014) con FloatingLines animadas
- **Cards**: Bento grid con glassmorphism y glow effects
- **Colores por sección**:
  - Explorar: Púrpura (#a855f7)
  - Jugar: Cyan (#06b6d4)
  - Progreso: Verde (#10b981)
  - Clases: Amber (#f59e0b)

## AUDITORÍA PORTAL ADMIN (2026-01-05)

### Estado de Conectividad Frontend ↔ Backend

**Conectado (90%)**

| Vista      | Funcionalidades                             | Endpoints                        |
| ---------- | ------------------------------------------- | -------------------------------- |
| Dashboard  | Stats, actividad reciente, clases próximas  | GET /admin/dashboard/\*          |
| Personas   | CRUD estudiantes, docentes, tutores, admins | GET/POST/PATCH/DELETE /admin/\*  |
| Productos  | CRUD productos                              | GET/POST/PATCH/DELETE /productos |
| Finanzas   | Inscripciones, pagos, suscripciones         | GET /admin/inscripciones, /pagos |
| Analytics  | Métricas generales                          | GET /admin/dashboard/stats       |
| Contenidos | Libros, bloques, niveles                    | GET/POST /libros, /bloques       |
| Sandbox    | Testing endpoints                           | Varios                           |

**Parcialmente Implementado (⚠️)**

| Funcionalidad               | Estado        | Solución Requerida                 |
| --------------------------- | ------------- | ---------------------------------- |
| Clases asignadas (docentes) | Hardcoded a 0 | GET /docentes/:id/clases-count     |
| Libros leídos (analytics)   | Muestra "—"   | GET /admin/analytics/libros-leidos |
| Ventas por producto         | Hardcoded a 0 | GET /productos/:id/ventas-count    |

**No Implementado (❌)**

| Funcionalidad             | Ubicación | Trabajo Requerido                |
| ------------------------- | --------- | -------------------------------- |
| Exportar reportes CSV/PDF | Finanzas  | Frontend + Backend               |
| Registro pago manual      | Finanzas  | Modal + POST /admin/pagos/manual |
| Vista comisiones          | Finanzas  | Nueva vista + endpoints          |

### Archivos Clave del Admin

```
apps/web/src/components/admin/
├── views/
│   ├── dashboard/       # Vista principal
│   ├── personas/        # Gestión usuarios
│   │   ├── hooks/usePersonas.ts
│   │   └── components/PersonRow.tsx
│   ├── finanzas/        # Pagos e inscripciones
│   ├── analytics/       # Métricas
│   ├── productos/       # Catálogo
│   └── contenidos/      # Material educativo
└── shared/              # Componentes reutilizables
```

### Notas de Implementación

- **Personas**: Combina 3 endpoints (estudiantes, usuarios, docentes) en vista unificada
- **Plan de estudiante**: Visible en tabla con badge de color según tier
- **Menú contextual**: Usa createPortal para evitar overflow clipping
- **Credenciales**: Auto-generadas al crear estudiante/docente, copiadas a clipboard

## TESTS DE INTEGRACIÓN - MEJORES PRÁCTICAS

### PRINCIPIOS FUNDAMENTALES

1. **Sin mocks para la base de datos**
   - Usar base de datos REAL de test (PostgreSQL en Docker)
   - Los mocks ocultan bugs de integración
   - "Si tus tests no tocan la base de datos, no son tests de integración"

2. **Aislamiento total entre tests**
   - Cada test empieza con estado limpio
   - Usar transacciones con rollback O truncate entre tests
   - Nunca depender del orden de ejecución

3. **Fixtures y Factories**
   - Crear factories para generar datos de test consistentes
   - Definir variantes de entidades (EstudianteNuevo, EstudianteSuspendido, etc.)
   - Evitar datos hardcodeados dispersos

### ESTRUCTURA DE ARCHIVOS

```
apps/api/
├── test/
│   ├── setup/
│   │   ├── test-database.ts      # Conexión DB test
│   │   ├── reset-db.ts           # Limpiar entre tests
│   │   └── global-setup.ts       # Setup inicial
│   ├── factories/
│   │   ├── estudiante.factory.ts
│   │   ├── contenido.factory.ts
│   │   └── index.ts
│   ├── fixtures/
│   │   └── estudiantes.fixture.ts
│   └── integration/
│       ├── auth/
│       ├── estudiantes/
│       └── gamificacion/
```

### CONFIGURACIÓN BASE

```typescript
// test/setup/test-database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_TEST_URL },
  },
});

export { prisma };
```

```typescript
// test/setup/reset-db.ts
import { prisma } from './test-database';

export async function resetDatabase() {
  // Orden inverso a las relaciones FK
  await prisma.$transaction([
    prisma.reaccionFeed.deleteMany(),
    prisma.actividadFeed.deleteMany(),
    prisma.progresoContenido.deleteMany(),
    prisma.inscripcionClaseGrupo.deleteMany(),
    prisma.estudiante.deleteMany(),
    // ... resto de tablas
  ]);
}
```

```typescript
// test/setup/global-setup.ts (Jest)
import { resetDatabase } from './reset-db';

beforeEach(async () => {
  await resetDatabase();
});
```

### FACTORY PATTERN

```typescript
// test/factories/estudiante.factory.ts
import { prisma } from '../setup/test-database';
import { faker } from '@faker-js/faker';

interface CreateEstudianteOptions {
  conPlan?: 'LIBROS' | 'SINCRONICO' | 'ASINCRONICO';
  conComision?: boolean;
  conProgreso?: boolean;
  suspendido?: boolean;
}

export async function crearEstudiante(options: CreateEstudianteOptions = {}) {
  const estudiante = await prisma.estudiante.create({
    data: {
      nombre: faker.person.firstName(),
      apellido: faker.person.lastName(),
      edad: faker.number.int({ min: 6, max: 17 }),
      estado_acceso: options.suspendido ? 'SUSPENDIDO' : 'ACTIVO',
      // ... más campos
    },
  });

  if (options.conPlan) {
    await crearSuscripcion(estudiante.id, options.conPlan);
  }

  if (options.conComision) {
    await inscribirEnComision(estudiante.id);
  }

  return estudiante;
}
```

### ESTRUCTURA DE UN TEST

```typescript
// test/integration/estudiantes/completar-leccion.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { crearEstudiante } from '../../factories/estudiante.factory';
import { crearContenido } from '../../factories/contenido.factory';
import { prisma } from '../../setup/test-database';

describe('Completar Lección (Integration)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /contenidos/:id/completar', () => {
    it('debe registrar progreso y otorgar XP', async () => {
      // ARRANGE - Crear datos reales
      const estudiante = await crearEstudiante({ conPlan: 'SINCRONICO' });
      const contenido = await crearContenido();
      token = await generarToken(estudiante);

      // ACT - Ejecutar acción real
      const response = await request(app.getHttpServer())
        .post(`/contenidos/${contenido.id}/completar`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tiempoSegundos: 300 });

      // ASSERT - Verificar en base de datos real
      expect(response.status).toBe(200);

      const progreso = await prisma.progresoContenido.findFirst({
        where: { estudianteId: estudiante.id, contenidoId: contenido.id },
      });
      expect(progreso.completado).toBe(true);

      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudiante.id },
      });
      expect(recursos.xp_total).toBeGreaterThan(0);
    });

    it('debe fallar si el estudiante está suspendido', async () => {
      const estudiante = await crearEstudiante({ suspendido: true });
      const contenido = await crearContenido();
      token = await generarToken(estudiante);

      const response = await request(app.getHttpServer())
        .post(`/contenidos/${contenido.id}/completar`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('debe manejar completar dos veces (idempotencia)', async () => {
      const estudiante = await crearEstudiante({ conPlan: 'SINCRONICO' });
      const contenido = await crearContenido();
      token = await generarToken(estudiante);

      // Primera vez
      await request(app.getHttpServer())
        .post(`/contenidos/${contenido.id}/completar`)
        .set('Authorization', `Bearer ${token}`);

      // Segunda vez
      const response = await request(app.getHttpServer())
        .post(`/contenidos/${contenido.id}/completar`)
        .set('Authorization', `Bearer ${token}`);

      // No debe duplicar XP
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudiante.id },
      });
      expect(recursos.xp_total).toBe(50); // Solo una vez
    });
  });
});
```

### DOCKER COMPOSE PARA TESTS

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: mateatletas_test
    ports:
      - '5433:5432'
    tmpfs:
      - /var/lib/postgresql/data # En memoria = más rápido
```

### SCRIPTS EN PACKAGE.JSON

```json
{
  "scripts": {
    "test:integration": "docker-compose -f docker-compose.test.yml up -d && DATABASE_TEST_URL=postgresql://test:test@localhost:5433/mateatletas_test jest --config jest.integration.config.js --runInBand",
    "test:integration:watch": "npm run test:integration -- --watch",
    "pretest:integration": "npx prisma db push --schema=./prisma/schema.prisma"
  }
}
```

### REGLAS DE ORO

1. **Un test = un escenario** - No testear múltiples cosas en un test
2. **Nombres descriptivos** - `debe fallar si el estudiante no tiene plan activo`
3. **AAA Pattern** - Arrange, Act, Assert claramente separados
4. **No compartir estado** - Cada test crea sus propios datos
5. **Testear edge cases** - Datos nulos, vacíos, duplicados, concurrencia
6. **Verificar en DB** - No confiar solo en el response, verificar estado real
7. **Correr en serie** - `--runInBand` para evitar race conditions entre tests

### BLACK BOX TESTING - TÉCNICAS OBLIGATORIAS

**IMPORTANTE:** Antes de escribir cualquier test, aplicar estas técnicas formales.
Ver documentación completa en: `apps/api/test/TESTING.md`

#### 1. Equivalence Partitioning

Dividir inputs en clases equivalentes. Testear UN representante por clase.

```typescript
// Clases: [válido-con-datos, válido-sin-datos, inválido-auth, inválido-rol]
it('Clase VÁLIDO-CON-DATOS: docente con asignaciones');
it('Clase VÁLIDO-SIN-DATOS: docente sin asignaciones');
it('Clase INVÁLIDO-AUTH: token expirado → 401');
it('Clase INVÁLIDO-ROL: estudiante → 403');
```

#### 2. Boundary Value Analysis

Los bugs viven en los límites. Testear: 0, 1, MAX-1, MAX, MAX+1

```typescript
it('limit=0 → error o default');
it('limit=1 → exactamente 1 resultado');
it('limit=50 → máximo permitido');
it('limit=51 → error o truncar');
```

#### 3. State Transition Testing

Para endpoints que cambian estado, documentar transiciones:

```
DESACTIVADA → activar → ACTIVA
ACTIVA → activar → ACTIVA (idempotente)
ACTIVA → desactivar → DESACTIVADA
```

#### 4. Error Guessing

Testear casos típicos de fallo:

- Caracteres especiales: `áéíóú`, `中文`, `🎮`, `<script>`
- IDs válidos pero inexistentes
- IDs con formato inválido
- Requests duplicados rápidos (race conditions)
- Body vacío, campos faltantes, campos extra

### FIXTURES RECOMENDADAS PARA MATEATLETAS

```typescript
// Variantes de estudiante para cubrir casos
export const FIXTURES_ESTUDIANTE = {
  nuevo: { conPlan: null, conComision: false, conProgreso: false },
  planLibros: { conPlan: 'LIBROS', conComision: false },
  planSincronico: { conPlan: 'SINCRONICO', conComision: true },
  suspendido: { suspendido: true },
  sinComision: { conPlan: 'SINCRONICO', conComision: false },
  todoCompletado: { conPlan: 'SINCRONICO', progreso100: true },
  conOverride: { override: { acceso_clases_vivo: true } },
};
```
