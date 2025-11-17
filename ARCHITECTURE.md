# Arquitectura del Sistema Mateatletas

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura del Monorepo](#arquitectura-del-monorepo)
3. [Arquitectura del Backend (API)](#arquitectura-del-backend-api)
4. [Módulos Principales](#módulos-principales)
5. [Constantes de Dominio](#constantes-de-dominio)
6. [Patrones y Principios](#patrones-y-principios)
7. [Base de Datos](#base-de-datos)

---

## Visión General

Mateatletas es una plataforma educativa que utiliza una arquitectura de monorepo con múltiples aplicaciones y paquetes compartidos.

### Stack Tecnológico

- **Backend**: NestJS + TypeScript + Prisma
- **Frontend**: Next.js + React + TypeScript
- **Base de Datos**: PostgreSQL
- **Monorepo**: Turborepo
- **Gestión de Paquetes**: npm workspaces

---

## Arquitectura del Monorepo

```
mateatletas-ecosystem/
├── apps/
│   ├── api/              # Backend NestJS
│   └── web/              # Frontend Next.js
├── packages/
│   ├── contracts/        # Esquemas compartidos (Zod)
│   └── shared/           # Utilidades compartidas
└── package.json          # Root workspace
```

### Workspaces

- `apps/api`: API REST con NestJS
- `apps/web`: Aplicación web con Next.js
- `packages/contracts`: Validaciones y tipos compartidos
- `packages/shared`: Utilidades reutilizables

---

## Arquitectura del Backend (API)

### Estructura de Carpetas

```
apps/api/src/
├── core/                 # Infraestructura core
│   ├── database/         # Prisma y DB utilities
│   ├── config/           # Configuración global
│   └── filters/          # Exception filters globales
├── domain/               # Lógica de dominio
│   └── constants/        # Constantes de negocio centralizadas
├── auth/                 # Autenticación y autorización
├── pagos/                # Módulo de pagos (CQRS)
├── estudiantes/          # Módulo de estudiantes
├── docentes/             # Módulo de docentes
├── tutores/              # Módulo de tutores
├── clases/               # Módulo de clases
├── cursos/               # Módulo de cursos
├── gamificacion/         # Sistema de gamificación
└── ...                   # Otros módulos
```

### Capas de Arquitectura

#### 1. Presentation Layer
- **Responsabilidad**: Definir endpoints HTTP, validación de entrada
- **Componentes**: Controllers, DTOs, Guards, Decorators
- **Ejemplo**: `PagosController`, `AuthGuard`, `CreateInscripcionDto`

#### 2. Application Layer (Service Layer)
- **Responsabilidad**: Orquestar lógica de negocio, coordinar casos de uso
- **Componentes**: Services principales, Facades
- **Ejemplo**: `PagosService`, `PagosManagementFacadeService`

#### 3. Domain Layer
- **Responsabilidad**: Lógica de negocio pura, reglas de dominio
- **Componentes**: Constantes, Enums, Validadores, Helpers
- **Ejemplo**: `EstadoPago`, `Role`, `EXTERNAL_REFERENCE_FORMATS`

#### 4. Infrastructure Layer
- **Responsabilidad**: Acceso a datos, servicios externos
- **Componentes**: Repositories, External Services
- **Ejemplo**: `PrismaService`, `MercadoPagoService`

---

## Módulos Principales

### Módulo de Pagos (CQRS)

El módulo de pagos implementa **CQRS (Command Query Responsibility Segregation)** para separar operaciones de lectura y escritura.

#### Arquitectura CQRS

```
pagos/
├── presentation/
│   ├── controllers/
│   │   └── pagos.controller.ts          # Endpoints HTTP
│   ├── dtos/                             # DTOs de entrada/salida
│   └── services/
│       ├── pagos.service.ts              # Service viejo (legacy)
│       └── pagos-tutor.service.ts        # Service para tutores
├── services/                             # CQRS Services (nuevo)
│   ├── payment-command.service.ts        # Comandos (escrituras)
│   ├── payment-query.service.ts          # Queries (lecturas)
│   ├── payment-state-mapper.service.ts   # Mapeo de estados
│   ├── payment-webhook.service.ts        # Webhooks de MercadoPago
│   └── pagos-management-facade.service.ts # Facade pattern
├── infrastructure/
│   └── repositories/                     # Acceso a datos
│       ├── configuracion-precios.repository.ts
│       └── inscripcion-mensual.repository.ts
├── dto/
│   └── mercadopago-webhook.dto.ts        # DTOs de MercadoPago
├── guards/
│   └── mercadopago-webhook.guard.ts      # Validación webhooks
└── mercadopago.service.ts                # Cliente MercadoPago

```

#### Servicios CQRS

**1. PaymentCommandService** (Comandos - Solo Escrituras)
```typescript
// Responsabilidades:
- registrarPagoManual()
- actualizarEstadoMembresia()
- actualizarEstadoInscripcion()
- actualizarMembresiaConPreferencia()

// Características:
- Emite eventos de dominio (EventEmitter2)
- NO realiza consultas complejas
- Aplica reglas de negocio para escrituras
```

**2. PaymentQueryService** (Queries - Solo Lecturas)
```typescript
// Responsabilidades:
- findAllInscripciones()
- findInscripcionById()
- findMembresiasDelTutor()
- findMembresiaActiva()
- obtenerConfiguracion()
- obtenerHistorialCambios()

// Características:
- NO modifica datos
- Optimizado para consultas
- Incluye filtros y paginación
```

**3. PaymentStateMapperService** (Mapeo de Estados)
```typescript
// Responsabilidades:
- mapearEstadoPago(estadoMercadoPago) → EstadoPago
- mapearEstadoMembresia(estadoPago) → EstadoMembresia
- mapearEstadoInscripcion(estadoPago) → EstadoPago
- esPagoExitoso(estadoPago) → boolean

// Características:
- Centraliza lógica de mapeo de estados
- Convierte estados externos (MercadoPago) a estados internos
- Type-safe con enums de Prisma
```

**4. PaymentWebhookService** (Webhooks)
```typescript
// Responsabilidades:
- procesarWebhookMercadoPago()
- Parsear external_reference
- Actualizar estados según notificaciones

// Características:
- Usa parseLegacyExternalReference() de domain constants
- Emite eventos de webhook procesado
- Maneja diferentes formatos de external_reference
```

**5. PagosManagementFacadeService** (Facade Pattern)
```typescript
// Responsabilidades:
- calcularPrecioFinal() → Orquesta PricingService
- crearInscripcionMensual() → Orquesta CommandService
- obtenerMetricasDashboard() → Orquesta QueryService

// Características:
- Punto de entrada único para operaciones complejas
- Coordina múltiples servicios
- Simplifica la interfaz para el controller
```

#### Flujo de Webhook

```
┌─────────────────┐
│   MercadoPago   │
└────────┬────────┘
         │ POST /pagos/webhook
         ▼
┌─────────────────────────┐
│  PagosController        │
│  (webhook endpoint)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ PaymentWebhookService   │
│ - Obtener pago de MP    │
│ - Parsear external_ref  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ PaymentStateMapper      │
│ - Mapear estado MP      │
│   a estado interno      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ PaymentCommandService   │
│ - Actualizar membresia  │
│   o inscripción         │
│ - Emitir eventos        │
└─────────────────────────┘
```

### Módulo de Autenticación

#### Guards

**RolesGuard** (con jerarquía)
```typescript
// Jerarquía de roles (menor a mayor privilegio):
ESTUDIANTE (1) < TUTOR (2) < DOCENTE (3) < ADMIN (4) < SUPER_ADMIN (5)

// Uso:
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCENTE)
async getDocentes() {
  // DOCENTE, ADMIN y SUPER_ADMIN tienen acceso
}
```

**Características**:
- Normaliza roles a uppercase automáticamente
- Usa función `cumpleJerarquia()` de domain constants
- Soporta arrays de roles (`roles` o `role`)
- Type-safe con enum `Role`

---

## Constantes de Dominio

Las constantes de dominio centralizan valores de negocio, eliminan magic strings y proporcionan type-safety.

### Ubicación

```
apps/api/src/domain/constants/
├── index.ts                  # Barrel export
├── payment.constants.ts      # Constantes de pagos
└── roles.constants.ts        # Constantes de roles
```

### Payment Constants

#### Enums de Estado

```typescript
// Estados de pago internos
export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  CANCELADO = 'CANCELADO',
  RECHAZADO = 'RECHAZADO',
  EXPIRADO = 'EXPIRADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

// Estados de MercadoPago
export enum EstadoMercadoPago {
  PENDING = 'pending',
  APPROVED = 'approved',
  AUTHORIZED = 'authorized',
  IN_PROCESS = 'in_process',
  IN_MEDIATION = 'in_mediation',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back',
}
```

#### External Reference

**Formatos soportados**:

1. **Nuevos (con `:`)**: `TIPO:param1:param2:...`
   - `CLASE_INSCRIPCION:claseId:estudianteId:fecha`
   - `CURSO_INSCRIPCION:cursoId:estudianteId`
   - `ESTUDIANTE_RECARGA:estudianteId:monto`

2. **Legacy (con `-`)**:
   - `membresia-{id}-tutor-{id}-producto-{id}`
   - `inscripcion-{id}-estudiante-{id}-producto-{id}`
   - `inscripcion2026-{id}-tutor-{id}-tipo-{tipo}`
   - ID numérico directo (colonia)

**Builders**:
```typescript
// Crear external_reference
EXTERNAL_REFERENCE_FORMATS.membresia(membresiaId, tutorId, productoId)
EXTERNAL_REFERENCE_FORMATS.inscripcionMensual(inscripcionId, estudianteId, productoId)
EXTERNAL_REFERENCE_FORMATS.inscripcion2026(inscripcionId, tutorId, tipoInscripcion)
EXTERNAL_REFERENCE_FORMATS.claseInscripcion(claseId, estudianteId, fechaInicio)
```

**Parsers**:
```typescript
// Parsear nuevo formato
const parsed = parseExternalReference('CLASE_INSCRIPCION:123:456:2025-01-15');
// { tipo: 'CLASE_INSCRIPCION', claseId: '123', estudianteId: '456', fecha: '2025-01-15' }

// Parsear formato legacy
const parsed = parseLegacyExternalReference('membresia-MEM001-tutor-TUT001-producto-PROD001');
// { tipo: 'MEMBRESIA', ids: { membresiaId: 'MEM001', tutorId: 'TUT001', productoId: 'PROD001' } }
```

#### Mapeo de Estados

```typescript
// Mapear estado de MercadoPago → Estado interno
const estadoInterno = mapearEstadoMercadoPago('approved');
// EstadoPago.PAGADO

// Validar formato
const esValido = esExternalReferenceValido('CLASE_INSCRIPCION:123:456:2025-01-15');
// true

// Obtener tipo sin parsear completo
const tipo = getTipoExternalReference('CURSO_INSCRIPCION:789:456');
// TipoExternalReference.CURSO_INSCRIPCION
```

### Role Constants

#### Enum de Roles

```typescript
export enum Role {
  ESTUDIANTE = 'ESTUDIANTE',
  TUTOR = 'TUTOR',
  DOCENTE = 'DOCENTE',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}
```

#### Jerarquía

```typescript
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.ESTUDIANTE]: 1,
  [Role.TUTOR]: 2,
  [Role.DOCENTE]: 3,
  [Role.ADMIN]: 4,
  [Role.SUPER_ADMIN]: 5,
};
```

#### Helpers

```typescript
// Verificar jerarquía
cumpleJerarquia(Role.ADMIN, Role.DOCENTE); // true (admin >= docente)
cumpleJerarquia(Role.TUTOR, Role.ADMIN);   // false (tutor < admin)

// Verificar permiso
tienePermiso(Role.DOCENTE, 'crear:tarea'); // true

// Verificar capacidad de acción
puedeActuarSobre(Role.ADMIN, Role.DOCENTE); // true
puedeActuarSobre(Role.TUTOR, Role.ADMIN);   // false

// Obtener roles gestionables
getRolesGestionables(Role.ADMIN);
// [Role.DOCENTE, Role.TUTOR, Role.ESTUDIANTE]

// Validar string
esRoleValido('ADMIN'); // true
esRoleValido('invalid'); // false
```

---

## Patrones y Principios

### SOLID

#### Single Responsibility Principle (SRP)
- ✅ Cada servicio tiene una responsabilidad única
- ✅ `PaymentCommandService` solo para escrituras
- ✅ `PaymentQueryService` solo para lecturas
- ✅ `PaymentStateMapperService` solo para mapeo

#### Open/Closed Principle (OCP)
- ✅ Servicios abiertos a extensión (herencia, composición)
- ✅ Cerrados a modificación (interfaces estables)

#### Dependency Inversion Principle (DIP)
- ✅ Dependencias inyectadas vía constructor (NestJS DI)
- ✅ Servicios dependen de abstracciones (interfaces, contracts)

### Patrones de Diseño

#### CQRS (Command Query Responsibility Segregation)
- **Dónde**: Módulo de pagos
- **Beneficio**: Separación clara de lecturas y escrituras
- **Servicios**: `PaymentCommandService`, `PaymentQueryService`

#### Facade Pattern
- **Dónde**: `PagosManagementFacadeService`
- **Beneficio**: Simplifica interfaz compleja
- **Uso**: Orquesta múltiples servicios para operaciones complejas

#### Repository Pattern
- **Dónde**: `infrastructure/repositories/`
- **Beneficio**: Abstrae acceso a datos
- **Ejemplos**: `ConfiguracionPreciosRepository`, `InscripcionMensualRepository`

#### Strategy Pattern
- **Dónde**: `PaymentStateMapperService`
- **Beneficio**: Encapsula algoritmos de mapeo de estados
- **Uso**: Diferentes estrategias según tipo de pago

### Anti-Patrones Eliminados

#### God Object / God Service
- ❌ **Antes**: `PagosService` con 50+ métodos
- ✅ **Después**: 5 servicios especializados con responsabilidades claras

#### Shotgun Surgery
- ❌ **Antes**: Cambio en lógica de pagos requería modificar 10+ archivos
- ✅ **Después**: Cambios aislados en servicios específicos

#### Magic Strings
- ❌ **Antes**: `if (estado === 'Pendiente')` hardcodeado
- ✅ **Después**: `if (estado === EstadoPago.PENDIENTE)` con enum

#### Copy-Paste Programming
- ❌ **Antes**: Lógica de mapeo duplicada en 8 lugares
- ✅ **Después**: `PaymentStateMapperService` centralizado

---

## Base de Datos

### Prisma ORM

#### Schema Principal

```prisma
model Estudiante {
  id              String   @id @default(uuid())
  username        String   @unique
  nombre          String
  apellido        String
  edad            Int?
  nivelEscolar    String?
  tutor           Tutor    @relation(fields: [tutor_id], references: [id])
  tutor_id        String
  inscripciones   InscripcionMensual[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model InscripcionMensual {
  id              String      @id @default(uuid())
  estudiante      Estudiante  @relation(fields: [estudiante_id], references: [id])
  estudiante_id   String
  tutor           Tutor       @relation(fields: [tutor_id], references: [id])
  tutor_id        String
  periodo         String      // "YYYY-MM"
  estado_pago     EstadoPago  @default(Pendiente)
  precio_final    Decimal     @db.Decimal(10, 2)
  fecha_pago      DateTime?
  metodo_pago     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Membresia {
  id                  String          @id @default(uuid())
  tutor               Tutor           @relation(fields: [tutor_id], references: [id])
  tutor_id            String
  producto            Producto        @relation(fields: [producto_id], references: [id])
  producto_id         String
  estado              EstadoMembresia @default(Pendiente)
  fecha_inicio        DateTime?
  fecha_proximo_pago  DateTime?
  preferencia_id      String?         // MercadoPago preference ID
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
}

enum EstadoPago {
  Pendiente
  Pagado
  Vencido
  Parcial
  Becado
}

enum EstadoMembresia {
  Pendiente
  Activa
  Atrasada
  Cancelada
}
```

#### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar Prisma Client
npx prisma generate

# Reset DB (desarrollo)
npx prisma migrate reset
```

---

## Mejores Prácticas

### Estructura de Archivos

```typescript
// ✅ BIEN: Importar desde barrel export
import { EstadoPago, Role, EXTERNAL_REFERENCE_FORMATS } from '@/domain/constants';

// ❌ MAL: Importar directamente
import { EstadoPago } from '@/domain/constants/payment.constants';
```

### Naming Conventions

```typescript
// ✅ Controllers: PascalCase + Controller
export class PagosController {}

// ✅ Services: PascalCase + Service
export class PaymentCommandService {}

// ✅ DTOs: PascalCase + Dto
export class CreateInscripcionDto {}

// ✅ Enums: PascalCase
export enum EstadoPago {}

// ✅ Constants: UPPER_SNAKE_CASE
export const ROLE_HIERARCHY = {};

// ✅ Functions: camelCase
export function cumpleJerarquia() {}
```

### Tipos vs Enums

```typescript
// ✅ USAR ENUM para valores cerrados conocidos
export enum Role {
  ADMIN = 'ADMIN',
  DOCENTE = 'DOCENTE',
}

// ✅ USAR TYPE para uniones complejas
export type DetailedAuthUser = AuthEstudiante | AuthDocente | AuthTutor;

// ❌ EVITAR string literals hardcodeados
if (user.role === 'admin') {} // MAL
if (user.role === Role.ADMIN) {} // BIEN
```

### Manejo de Errores

```typescript
// ✅ Usar excepciones de NestJS
throw new NotFoundException(`Inscripción ${id} no encontrada`);
throw new BadRequestException('Parámetros inválidos');

// ✅ Loguear errores importantes
this.logger.error(`Error procesando pago: ${error.message}`, error.stack);

// ✅ Emitir eventos para auditabilidad
this.eventEmitter.emit('pago.fallido', { paymentId, error });
```

---

## Testing

### Estrategia de Testing

#### Unit Tests
- **Objetivo**: Probar lógica aislada
- **Herramienta**: Jest
- **Coverage**: Servicios, mappers, helpers

```typescript
// Ejemplo: payment-command.service.spec.ts
describe('PaymentCommandService', () => {
  it('debe actualizar estado de membresía a Activa', async () => {
    expect(result.estado).toBe(EstadoMembresia.Activa);
  });
});
```

#### Integration Tests
- **Objetivo**: Probar integración entre módulos
- **Herramienta**: Jest + Supertest
- **Coverage**: Controllers, webhooks, flujos completos

```typescript
// Ejemplo: pagos.controller.integration.spec.ts
describe('POST /pagos/webhook', () => {
  it('debe procesar webhook de pago aprobado', async () => {
    const response = await request(app.getHttpServer())
      .post('/pagos/webhook')
      .send(webhookPayload)
      .expect(200);
  });
});
```

### Ejecutar Tests

```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests e2e
npm run test:e2e
```

---

## Deployment

### Variables de Entorno

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mateatletas"

# JWT
JWT_SECRET="your-secret-key-minimum-32-characters-long"

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxxxx"

# URLs
BACKEND_URL="https://api.mateatletas.com"
FRONTEND_URL="https://mateatletas.com"
```

### Build y Deploy

```bash
# Build de producción
npm run build

# Ejecutar migraciones
npx prisma migrate deploy

# Generar Prisma Client
npx prisma generate

# Iniciar servidor
npm run start:prod
```

---

## Recursos Adicionales

- [REFACTOR-SUMMARY.md](./apps/api/docs/REFACTOR-SUMMARY.md) - Resumen de refactorings realizados
- [Prisma Docs](https://www.prisma.io/docs/)
- [NestJS Docs](https://docs.nestjs.com/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

---

**Última actualización**: 2025-01-17
**Versión del documento**: 1.0.0
