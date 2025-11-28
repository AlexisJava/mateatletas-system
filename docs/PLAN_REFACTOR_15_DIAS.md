# PLAN DE REFACTOR MATEATLETAS 2026 - 15 DÍAS

**Fecha inicio estimada:** Diciembre 2025
**Branch:** `feature/refactor-2026`
**Base:** `feature/planificaciones-v2`

---

## RESUMEN EJECUTIVO

| Fase                   | Días  | Foco Principal              |
| ---------------------- | ----- | --------------------------- |
| **1. Fundamentos**     | 1-3   | Schema, Tiers, Casas        |
| **2. Gamificación**    | 4-5   | Casas ranking, Onboarding   |
| **3. Planificaciones** | 6-9   | Backend + Frontend completo |
| **4. Arena**           | 10-12 | Diaria + Multijugador       |
| **5. PRO Features**    | 13-14 | Telemetría + Reportes       |
| **6. Integración**     | 15    | Testing E2E, Deploy         |

---

# FASE 1: FUNDAMENTOS (Días 1-3)

---

## DÍA 1: SCHEMA PRISMA - MIGRACIONES BASE

### Objetivo

Tener el schema Prisma actualizado con todos los nuevos modelos y enums necesarios para el modelo 2026.

### Pre-requisitos

- Branch `feature/planificaciones-v2` actualizado
- Base de datos de desarrollo limpia o con backup

### Tareas (en orden)

#### Tarea 1.1: Crear enums Tier y Mundo

- **Tipo:** Schema
- **Archivos a modificar:**
  - `apps/api/prisma/schema.prisma` - Agregar después de línea ~1600 (antes de planificaciones)
- **Código a agregar:**

```prisma
/// Tiers de suscripción disponibles
enum Tier {
  ARCADE       // $30k - 1 mundo, planificaciones básicas
  ARCADE_PLUS  // $60k - 2 mundos, arena diaria
  PRO          // $75k - 3 mundos, todo incluido

  @@map("tier")
}

/// Mundos disponibles (reemplaza concepto de Sector)
enum Mundo {
  MATEMATICA
  PROGRAMACION
  CIENCIAS

  @@map("mundo")
}
```

- **Criterio de éxito:** `npx prisma validate` sin errores

#### Tarea 1.2: Agregar campos Tier a modelos existentes

- **Tipo:** Schema
- **Archivos a modificar:**
  - `apps/api/prisma/schema.prisma` - Modelo `Tutor` (~línea 13)
  - `apps/api/prisma/schema.prisma` - Modelo `Membresia` (~línea 363)
  - `apps/api/prisma/schema.prisma` - Modelo `ClaseGrupo` (~línea 542)
- **Cambios específicos:**

**En modelo Tutor (después de `roles`):**

```prisma
  /// Tier de suscripción actual del tutor
  tier                      Tier?
  /// Mundos activos para este tutor (según tier)
  mundos_activos            Mundo[]               @default([])
  /// Fecha de inicio de la suscripción actual
  fecha_inicio_suscripcion  DateTime?
  /// Fecha de fin/renovación de la suscripción
  fecha_fin_suscripcion     DateTime?
```

**En modelo Membresia (después de `estado`):**

```prisma
  /// Tier de la membresía
  tier               Tier?
  /// Mundos incluidos en esta membresía
  mundos_incluidos   Mundo[]             @default([])
```

**En modelo ClaseGrupo (después de `activo`):**

```prisma
  /// Tier mínimo requerido para acceder a este grupo (null = cualquier tier)
  tier_requerido     Tier?
```

- **Criterio de éxito:** `npx prisma validate` sin errores

#### Tarea 1.3: Crear modelo Casa (reemplaza Equipo conceptualmente)

- **Tipo:** Schema
- **Archivos a modificar:**
  - `apps/api/prisma/schema.prisma` - Agregar después del modelo `Equipo` (~línea 218)
- **Código a agregar:**

```prisma
/// Modelo para las 4 Casas de gamificación
/// Reemplaza conceptualmente a "Equipo" con identidad más fuerte
model Casa {
  /// Identificador único de la casa
  id                String       @id @default(cuid())

  /// Nombre único de la casa (Phoenix, Dragon, Tiger, Eagle)
  nombre            String       @unique

  /// Código corto para identificación (PHX, DRG, TGR, EGL)
  codigo            String       @unique

  /// Color primario en formato hexadecimal
  color_primario    String

  /// Color secundario en formato hexadecimal
  color_secundario  String

  /// URL del emblema/escudo de la casa
  emblema_url       String?

  /// Lema de la casa
  lema              String?

  /// Descripción de los valores de la casa
  descripcion       String?

  /// Puntos totales acumulados en la temporada actual
  puntos_temporada  Int          @default(0)

  /// Ranking actual (1-4)
  ranking_actual    Int          @default(0)

  /// Timestamp de creación
  createdAt         DateTime     @default(now())

  /// Timestamp de última actualización
  updatedAt         DateTime     @updatedAt

  /// Estudiantes que pertenecen a esta casa
  estudiantes       Estudiante[] @relation("EstudianteCasa")

  @@map("casas")
}
```

- **Criterio de éxito:** `npx prisma validate` sin errores

#### Tarea 1.4: Agregar relación Casa a Estudiante

- **Tipo:** Schema
- **Archivos a modificar:**
  - `apps/api/prisma/schema.prisma` - Modelo `Estudiante` (~línea 75)
- **Cambios específicos (después de `equipoId`):**

```prisma
  /// ID de la casa a la que pertenece el estudiante (gamificación 2026)
  casa_id                   String?

  /// Indica si el estudiante completó el onboarding 2026
  onboarding_completado     Boolean                           @default(false)

  /// Nivel asignado en el test de ubicación (1-10)
  nivel_ubicacion           Int?

  /// Fecha en que completó el onboarding
  fecha_onboarding          DateTime?
```

- **Agregar relación (en la sección de relaciones del modelo):**

```prisma
  casa                      Casa?                             @relation("EstudianteCasa", fields: [casa_id], references: [id])
```

- **Agregar índice:**

```prisma
  @@index([casa_id])
```

- **Criterio de éxito:** `npx prisma validate` sin errores

#### Tarea 1.5: Crear modelo TestUbicacion

- **Tipo:** Schema
- **Archivos a modificar:**
  - `apps/api/prisma/schema.prisma` - Agregar después del modelo `Casa`
- **Código a agregar:**

```prisma
/// Test de ubicación para determinar nivel del estudiante
model TestUbicacion {
  /// Identificador único
  id                    String     @id @default(cuid())

  /// ID del estudiante que realiza el test
  estudiante_id         String

  /// Mundo para el cual se realiza el test
  mundo                 Mundo

  /// Preguntas respondidas con respuestas (JSON)
  /// Estructura: [{ pregunta_id, respuesta, correcta, tiempo_segundos }]
  respuestas            Json

  /// Cantidad de respuestas correctas
  correctas             Int        @default(0)

  /// Cantidad total de preguntas
  total_preguntas       Int

  /// Nivel asignado basado en el resultado (1-10)
  nivel_asignado        Int

  /// Porcentaje de aciertos
  porcentaje_aciertos   Decimal    @db.Decimal(5, 2)

  /// Tiempo total en segundos
  tiempo_total_segundos Int

  /// Si el test fue completado
  completado            Boolean    @default(false)

  /// Fecha de inicio del test
  fecha_inicio          DateTime   @default(now())

  /// Fecha de completado
  fecha_completado      DateTime?

  /// Timestamp de creación
  createdAt             DateTime   @default(now())

  /// Timestamp de última actualización
  updatedAt             DateTime   @updatedAt

  /// Relaciones
  estudiante            Estudiante @relation(fields: [estudiante_id], references: [id], onDelete: Cascade)

  @@index([estudiante_id])
  @@index([mundo])
  @@index([completado])
  @@map("tests_ubicacion")
}
```

- **Agregar relación en Estudiante:**

```prisma
  tests_ubicacion           TestUbicacion[]
```

- **Criterio de éxito:** `npx prisma validate` sin errores

#### Tarea 1.6: Actualizar ConfiguracionPrecios con tiers

- **Tipo:** Schema
- **Archivos a modificar:**
  - `apps/api/prisma/schema.prisma` - Modelo `ConfiguracionPrecios` (~línea 1413)
- **Agregar campos (después de `descuento_aacrea_activo`):**

```prisma
  /// Precios por tier (pesos argentinos)
  precio_tier_arcade        Decimal @default(30000) @db.Decimal(10, 2)
  precio_tier_arcade_plus   Decimal @default(60000) @db.Decimal(10, 2)
  precio_tier_pro           Decimal @default(75000) @db.Decimal(10, 2)

  /// Descuento por pago anual (porcentaje)
  descuento_pago_anual      Decimal @default(15) @db.Decimal(5, 2)
```

- **Criterio de éxito:** `npx prisma validate` sin errores

#### Tarea 1.7: Generar y aplicar migración

- **Tipo:** Schema
- **Comandos:**

```bash
cd apps/api
npx prisma migrate dev --name add_tiers_casas_onboarding
npx prisma generate
```

- **Tests requeridos:**
  - Verificar que las tablas se crearon en la BD
  - Verificar que PrismaClient tiene los nuevos tipos
- **Criterio de éxito:** Migración aplicada sin errores, `npx prisma studio` muestra nuevas tablas

### Entregables del día

- [ ] Enums `Tier` y `Mundo` creados
- [ ] Campos tier agregados a `Tutor`, `Membresia`, `ClaseGrupo`
- [ ] Modelo `Casa` creado con 4 casas conceptuales
- [ ] Modelo `TestUbicacion` creado
- [ ] Relación `Estudiante` ↔ `Casa` establecida
- [ ] `ConfiguracionPrecios` actualizado con precios de tiers
- [ ] Migración aplicada exitosamente
- [ ] `npx prisma generate` ejecutado

### Validación

```bash
# 1. Validar schema
npx prisma validate

# 2. Verificar migración
npx prisma migrate status

# 3. Abrir Prisma Studio y verificar tablas
npx prisma studio

# 4. Verificar tipos en código
# Abrir cualquier .service.ts y verificar que this.prisma.casa existe
```

---

## DÍA 2: MÓDULO TIERS - BACKEND COMPLETO

### Objetivo

Tener el módulo de Tiers funcionando con CRUD completo, verificación de acceso y endpoints REST.

### Pre-requisitos

- Día 1 completado (schema con Tier enum)
- Migración aplicada

### Tareas (en orden)

#### Tarea 2.1: Crear estructura de carpetas del módulo Tiers

- **Tipo:** Backend
- **Archivos a crear:**

```
apps/api/src/tiers/
├── tiers.module.ts
├── tiers.controller.ts
├── tiers.service.ts
├── dto/
│   ├── index.ts
│   ├── update-tier.dto.ts
│   └── tier-response.dto.ts
└── guards/
    └── tier-access.guard.ts
```

- **Criterio de éxito:** Estructura de carpetas creada

#### Tarea 2.2: Crear DTOs de Tiers

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/tiers/dto/update-tier.dto.ts`

```typescript
import { IsEnum, IsOptional, IsArray } from 'class-validator';
import { Tier, Mundo } from '@prisma/client';

export class UpdateTierDto {
  @IsEnum(Tier)
  tier: Tier;

  @IsArray()
  @IsEnum(Mundo, { each: true })
  @IsOptional()
  mundos_activos?: Mundo[];
}
```

- `apps/api/src/tiers/dto/tier-response.dto.ts`

```typescript
import { Tier, Mundo } from '@prisma/client';

export class TierResponseDto {
  tier: Tier | null;
  mundos_activos: Mundo[];
  fecha_inicio: Date | null;
  fecha_fin: Date | null;
  dias_restantes: number | null;
  features: TierFeatures;
}

export interface TierFeatures {
  mundos_disponibles: number;
  arena_diaria: boolean;
  arena_multijugador: boolean;
  telemetria_pro: boolean;
  reportes_automaticos: boolean;
  clases_pro: boolean;
}

export const TIER_FEATURES: Record<Tier, TierFeatures> = {
  ARCADE: {
    mundos_disponibles: 1,
    arena_diaria: false,
    arena_multijugador: false,
    telemetria_pro: false,
    reportes_automaticos: false,
    clases_pro: false,
  },
  ARCADE_PLUS: {
    mundos_disponibles: 2,
    arena_diaria: true,
    arena_multijugador: false,
    telemetria_pro: false,
    reportes_automaticos: false,
    clases_pro: false,
  },
  PRO: {
    mundos_disponibles: 3,
    arena_diaria: true,
    arena_multijugador: true,
    telemetria_pro: true,
    reportes_automaticos: true,
    clases_pro: true,
  },
};
```

- `apps/api/src/tiers/dto/index.ts`

```typescript
export * from './update-tier.dto';
export * from './tier-response.dto';
```

- **Criterio de éxito:** DTOs creados con validaciones

#### Tarea 2.3: Crear TiersService

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/tiers/tiers.service.ts`

```typescript
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { Tier, Mundo } from '@prisma/client';
import { UpdateTierDto, TierResponseDto, TIER_FEATURES, TierFeatures } from './dto';

@Injectable()
export class TiersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el tier actual de un tutor con sus features
   */
  async obtenerTierTutor(tutorId: string): Promise<TierResponseDto> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: {
        tier: true,
        mundos_activos: true,
        fecha_inicio_suscripcion: true,
        fecha_fin_suscripcion: true,
      },
    });

    if (!tutor) {
      throw new BadRequestException('Tutor no encontrado');
    }

    const diasRestantes = tutor.fecha_fin_suscripcion
      ? Math.ceil((tutor.fecha_fin_suscripcion.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      tier: tutor.tier,
      mundos_activos: tutor.mundos_activos as Mundo[],
      fecha_inicio: tutor.fecha_inicio_suscripcion,
      fecha_fin: tutor.fecha_fin_suscripcion,
      dias_restantes: diasRestantes,
      features: tutor.tier ? TIER_FEATURES[tutor.tier] : this.getDefaultFeatures(),
    };
  }

  /**
   * Actualiza el tier de un tutor (solo admin)
   */
  async actualizarTier(tutorId: string, dto: UpdateTierDto): Promise<TierResponseDto> {
    const features = TIER_FEATURES[dto.tier];

    // Validar que los mundos activos no excedan el límite del tier
    if (dto.mundos_activos && dto.mundos_activos.length > features.mundos_disponibles) {
      throw new BadRequestException(
        `El tier ${dto.tier} solo permite ${features.mundos_disponibles} mundo(s)`,
      );
    }

    const tutor = await this.prisma.tutor.update({
      where: { id: tutorId },
      data: {
        tier: dto.tier,
        mundos_activos: dto.mundos_activos || [],
        fecha_inicio_suscripcion: new Date(),
        fecha_fin_suscripcion: this.calcularFechaFin(),
      },
      select: {
        tier: true,
        mundos_activos: true,
        fecha_inicio_suscripcion: true,
        fecha_fin_suscripcion: true,
      },
    });

    return {
      tier: tutor.tier,
      mundos_activos: tutor.mundos_activos as Mundo[],
      fecha_inicio: tutor.fecha_inicio_suscripcion,
      fecha_fin: tutor.fecha_fin_suscripcion,
      dias_restantes: 30,
      features: TIER_FEATURES[dto.tier],
    };
  }

  /**
   * Verifica si un tutor tiene acceso a un mundo específico
   */
  async verificarAccesoMundo(tutorId: string, mundo: Mundo): Promise<boolean> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { mundos_activos: true },
    });

    if (!tutor) return false;
    return (tutor.mundos_activos as Mundo[]).includes(mundo);
  }

  /**
   * Verifica si un tutor tiene acceso a una feature específica
   */
  async verificarAccesoFeature(tutorId: string, feature: keyof TierFeatures): Promise<boolean> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { tier: true },
    });

    if (!tutor || !tutor.tier) return false;
    return TIER_FEATURES[tutor.tier][feature] as boolean;
  }

  /**
   * Obtiene los mundos disponibles para un tier
   */
  getMundosDisponibles(tier: Tier): number {
    return TIER_FEATURES[tier].mundos_disponibles;
  }

  /**
   * Obtiene las features de un tier
   */
  getTierFeatures(tier: Tier): TierFeatures {
    return TIER_FEATURES[tier];
  }

  /**
   * Obtiene el precio de un tier desde la configuración
   */
  async obtenerPrecioTier(tier: Tier): Promise<number> {
    const config = await this.prisma.configuracionPrecios.findUnique({
      where: { id: 'singleton' },
    });

    if (!config) {
      // Precios por defecto
      const precios = { ARCADE: 30000, ARCADE_PLUS: 60000, PRO: 75000 };
      return precios[tier];
    }

    const precios = {
      ARCADE: Number(config.precio_tier_arcade),
      ARCADE_PLUS: Number(config.precio_tier_arcade_plus),
      PRO: Number(config.precio_tier_pro),
    };

    return precios[tier];
  }

  private calcularFechaFin(): Date {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + 1);
    return fecha;
  }

  private getDefaultFeatures(): TierFeatures {
    return {
      mundos_disponibles: 0,
      arena_diaria: false,
      arena_multijugador: false,
      telemetria_pro: false,
      reportes_automaticos: false,
      clases_pro: false,
    };
  }
}
```

- **Criterio de éxito:** Servicio compila sin errores

#### Tarea 2.4: Crear TierAccessGuard

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/tiers/guards/tier-access.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TiersService } from '../tiers.service';
import { Tier } from '@prisma/client';

export const REQUIRED_TIER_KEY = 'required_tier';
export const RequiredTier = (tier: Tier) => Reflect.metadata(REQUIRED_TIER_KEY, tier);

@Injectable()
export class TierAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tiersService: TiersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<Tier>(REQUIRED_TIER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTier) {
      return true; // No tier requirement
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.tutorId) {
      throw new ForbiddenException('Usuario no autenticado como tutor');
    }

    const tierInfo = await this.tiersService.obtenerTierTutor(user.tutorId);

    if (!tierInfo.tier) {
      throw new ForbiddenException('No tienes una suscripción activa');
    }

    const tierOrder = { ARCADE: 1, ARCADE_PLUS: 2, PRO: 3 };
    const userTierLevel = tierOrder[tierInfo.tier];
    const requiredTierLevel = tierOrder[requiredTier];

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException(
        `Esta función requiere tier ${requiredTier} o superior. Tu tier actual es ${tierInfo.tier}`,
      );
    }

    return true;
  }
}
```

- **Criterio de éxito:** Guard compila sin errores

#### Tarea 2.5: Crear TiersController

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/tiers/tiers.controller.ts`

```typescript
import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TiersService } from './tiers.service';
import { UpdateTierDto, TierResponseDto, TIER_FEATURES } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Tier } from '@prisma/client';

@Controller('tiers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}

  /**
   * GET /tiers/mi-tier
   * Obtiene el tier del tutor autenticado
   */
  @Get('mi-tier')
  @Roles(Role.TUTOR)
  async obtenerMiTier(@Request() req): Promise<TierResponseDto> {
    return this.tiersService.obtenerTierTutor(req.user.tutorId);
  }

  /**
   * GET /tiers/tutor/:tutorId
   * Obtiene el tier de un tutor específico (admin)
   */
  @Get('tutor/:tutorId')
  @Roles(Role.ADMIN)
  async obtenerTierTutor(@Param('tutorId') tutorId: string): Promise<TierResponseDto> {
    return this.tiersService.obtenerTierTutor(tutorId);
  }

  /**
   * PATCH /tiers/tutor/:tutorId
   * Actualiza el tier de un tutor (admin)
   */
  @Patch('tutor/:tutorId')
  @Roles(Role.ADMIN)
  async actualizarTier(
    @Param('tutorId') tutorId: string,
    @Body() dto: UpdateTierDto,
  ): Promise<TierResponseDto> {
    return this.tiersService.actualizarTier(tutorId, dto);
  }

  /**
   * GET /tiers/precios
   * Obtiene los precios de todos los tiers
   */
  @Get('precios')
  async obtenerPrecios(): Promise<Record<Tier, number>> {
    const precios: Record<Tier, number> = {
      ARCADE: await this.tiersService.obtenerPrecioTier(Tier.ARCADE),
      ARCADE_PLUS: await this.tiersService.obtenerPrecioTier(Tier.ARCADE_PLUS),
      PRO: await this.tiersService.obtenerPrecioTier(Tier.PRO),
    };
    return precios;
  }

  /**
   * GET /tiers/features
   * Obtiene las features de todos los tiers
   */
  @Get('features')
  obtenerFeatures() {
    return TIER_FEATURES;
  }

  /**
   * GET /tiers/features/:tier
   * Obtiene las features de un tier específico
   */
  @Get('features/:tier')
  obtenerFeaturesTier(@Param('tier') tier: Tier) {
    return this.tiersService.getTierFeatures(tier);
  }
}
```

- **Criterio de éxito:** Controller compila sin errores

#### Tarea 2.6: Crear TiersModule

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/tiers/tiers.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TiersController } from './tiers.controller';
import { TiersService } from './tiers.service';
import { TierAccessGuard } from './guards/tier-access.guard';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [TiersController],
  providers: [TiersService, TierAccessGuard, PrismaService],
  exports: [TiersService, TierAccessGuard],
})
export class TiersModule {}
```

- **Criterio de éxito:** Módulo compila sin errores

#### Tarea 2.7: Registrar TiersModule en AppModule

- **Tipo:** Backend
- **Archivos a modificar:**
  - `apps/api/src/app.module.ts`
- **Cambios:**

```typescript
// Agregar import
import { TiersModule } from './tiers/tiers.module';

// Agregar al array de imports (después de AuthModule)
TiersModule,
```

- **Criterio de éxito:** Aplicación inicia sin errores

#### Tarea 2.8: Crear tests unitarios para TiersService

- **Tipo:** Backend - Tests
- **Archivos a crear:**
  - `apps/api/src/tiers/__tests__/tiers.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TiersService } from '../tiers.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Tier, Mundo } from '@prisma/client';

describe('TiersService', () => {
  let service: TiersService;
  let prisma: PrismaService;

  const mockPrisma = {
    tutor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    configuracionPrecios: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TiersService>(TiersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('obtenerTierTutor', () => {
    it('debe retornar el tier del tutor', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        tier: Tier.ARCADE_PLUS,
        mundos_activos: [Mundo.MATEMATICA, Mundo.PROGRAMACION],
        fecha_inicio_suscripcion: new Date(),
        fecha_fin_suscripcion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await service.obtenerTierTutor('tutor-123');

      expect(result.tier).toBe(Tier.ARCADE_PLUS);
      expect(result.mundos_activos).toHaveLength(2);
      expect(result.features.mundos_disponibles).toBe(2);
    });

    it('debe lanzar error si el tutor no existe', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue(null);

      await expect(service.obtenerTierTutor('no-existe')).rejects.toThrow('Tutor no encontrado');
    });
  });

  describe('verificarAccesoMundo', () => {
    it('debe retornar true si el tutor tiene acceso al mundo', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        mundos_activos: [Mundo.MATEMATICA],
      });

      const result = await service.verificarAccesoMundo('tutor-123', Mundo.MATEMATICA);

      expect(result).toBe(true);
    });

    it('debe retornar false si el tutor no tiene acceso', async () => {
      mockPrisma.tutor.findUnique.mockResolvedValue({
        mundos_activos: [Mundo.MATEMATICA],
      });

      const result = await service.verificarAccesoMundo('tutor-123', Mundo.PROGRAMACION);

      expect(result).toBe(false);
    });
  });

  describe('getTierFeatures', () => {
    it('debe retornar features correctas para ARCADE', () => {
      const features = service.getTierFeatures(Tier.ARCADE);

      expect(features.mundos_disponibles).toBe(1);
      expect(features.arena_diaria).toBe(false);
      expect(features.arena_multijugador).toBe(false);
    });

    it('debe retornar features correctas para PRO', () => {
      const features = service.getTierFeatures(Tier.PRO);

      expect(features.mundos_disponibles).toBe(3);
      expect(features.arena_diaria).toBe(true);
      expect(features.arena_multijugador).toBe(true);
      expect(features.telemetria_pro).toBe(true);
    });
  });
});
```

- **Criterio de éxito:** Tests pasan con `npm run test -- tiers.service`

### Entregables del día

- [ ] Carpeta `apps/api/src/tiers/` completa
- [ ] DTOs con validaciones
- [ ] TiersService con todos los métodos
- [ ] TierAccessGuard funcionando
- [ ] TiersController con 6 endpoints
- [ ] TiersModule registrado en AppModule
- [ ] Tests unitarios pasando

### Validación

```bash
# 1. Compilar proyecto
npm run build

# 2. Ejecutar tests
npm run test -- tiers

# 3. Iniciar servidor y probar endpoints
npm run start:dev

# 4. Probar con curl
curl http://localhost:3001/api/tiers/features
curl http://localhost:3001/api/tiers/precios
```

---

## DÍA 3: REFACTOR EQUIPOS → CASAS

### Objetivo

Migrar el sistema de "Equipos" a "Casas" manteniendo compatibilidad hacia atrás, y poblar las 4 casas iniciales.

### Pre-requisitos

- Día 1 y 2 completados
- Modelo Casa existente en schema

### Tareas (en orden)

#### Tarea 3.1: Crear script de seed para las 4 Casas

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/prisma/seeds/casas.seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CASAS_DATA = [
  {
    nombre: 'Phoenix',
    codigo: 'PHX',
    color_primario: '#FF6B35',
    color_secundario: '#FFD700',
    lema: 'De las cenizas, renacemos más fuertes',
    descripcion:
      'La Casa Phoenix representa la resiliencia, la creatividad y el renacimiento. Sus miembros nunca se rinden ante los desafíos.',
    emblema_url: '/images/casas/phoenix.svg',
  },
  {
    nombre: 'Dragon',
    codigo: 'DRG',
    color_primario: '#8B0000',
    color_secundario: '#1C1C1C',
    lema: 'Con sabiduría y poder, conquistamos',
    descripcion:
      'La Casa Dragon simboliza la sabiduría ancestral y el poder. Sus miembros son estrategas y pensadores profundos.',
    emblema_url: '/images/casas/dragon.svg',
  },
  {
    nombre: 'Tiger',
    codigo: 'TGR',
    color_primario: '#FF8C00',
    color_secundario: '#000000',
    lema: 'Velocidad, fuerza, precisión',
    descripcion:
      'La Casa Tiger encarna la agilidad mental y la determinación. Sus miembros son rápidos, decididos y competitivos.',
    emblema_url: '/images/casas/tiger.svg',
  },
  {
    nombre: 'Eagle',
    codigo: 'EGL',
    color_primario: '#1E90FF',
    color_secundario: '#FFFFFF',
    lema: 'Desde las alturas, vemos más lejos',
    descripcion:
      'La Casa Eagle representa la visión, la libertad y la excelencia. Sus miembros tienen una perspectiva amplia y metas elevadas.',
    emblema_url: '/images/casas/eagle.svg',
  },
];

export async function seedCasas() {
  console.log('🏠 Iniciando seed de Casas...');

  for (const casaData of CASAS_DATA) {
    const casa = await prisma.casa.upsert({
      where: { codigo: casaData.codigo },
      update: casaData,
      create: casaData,
    });
    console.log(`  ✓ Casa ${casa.nombre} (${casa.codigo}) creada/actualizada`);
  }

  console.log('✅ Seed de Casas completado');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCasas()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
```

- **Criterio de éxito:** Script ejecuta sin errores

#### Tarea 3.2: Actualizar seed principal

- **Tipo:** Backend
- **Archivos a modificar:**
  - `apps/api/prisma/seed.ts` (o crear si no existe)

```typescript
import { PrismaClient } from '@prisma/client';
import { seedCasas } from './seeds/casas.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...\n');

  // Seed de Casas
  await seedCasas();

  console.log('\n🎉 Todos los seeds completados!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- **Agregar script en package.json:**

```json
"db:seed": "ts-node prisma/seed.ts"
```

- **Criterio de éxito:** `npm run db:seed` crea las 4 casas

#### Tarea 3.3: Crear CasasService

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/casas/casas.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { Casa } from '@prisma/client';

export interface CasaConStats extends Casa {
  _count: {
    estudiantes: number;
  };
}

export interface RankingCasas {
  casas: CasaConStats[];
  temporada_actual: string;
}

@Injectable()
export class CasasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todas las casas con conteo de estudiantes
   */
  async obtenerTodas(): Promise<CasaConStats[]> {
    return this.prisma.casa.findMany({
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
      orderBy: { ranking_actual: 'asc' },
    });
  }

  /**
   * Obtiene una casa por ID
   */
  async obtenerPorId(id: string): Promise<CasaConStats> {
    const casa = await this.prisma.casa.findUnique({
      where: { id },
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
    });

    if (!casa) {
      throw new NotFoundException(`Casa con ID ${id} no encontrada`);
    }

    return casa;
  }

  /**
   * Obtiene una casa por código (PHX, DRG, TGR, EGL)
   */
  async obtenerPorCodigo(codigo: string): Promise<CasaConStats> {
    const casa = await this.prisma.casa.findUnique({
      where: { codigo: codigo.toUpperCase() },
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
    });

    if (!casa) {
      throw new NotFoundException(`Casa con código ${codigo} no encontrada`);
    }

    return casa;
  }

  /**
   * Obtiene el ranking actual de las casas
   */
  async obtenerRanking(): Promise<RankingCasas> {
    const casas = await this.prisma.casa.findMany({
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
      orderBy: { puntos_temporada: 'desc' },
    });

    // Actualizar rankings basado en puntos
    const casasConRanking = casas.map((casa, index) => ({
      ...casa,
      ranking_actual: index + 1,
    }));

    return {
      casas: casasConRanking,
      temporada_actual: this.obtenerTemporadaActual(),
    };
  }

  /**
   * Asigna un estudiante a una casa
   */
  async asignarEstudiante(estudianteId: string, casaId: string): Promise<void> {
    // Verificar que la casa existe
    const casa = await this.prisma.casa.findUnique({
      where: { id: casaId },
    });

    if (!casa) {
      throw new NotFoundException(`Casa con ID ${casaId} no encontrada`);
    }

    // Verificar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${estudianteId} no encontrado`);
    }

    // Asignar casa
    await this.prisma.estudiante.update({
      where: { id: estudianteId },
      data: { casa_id: casaId },
    });
  }

  /**
   * Obtiene la casa con menos estudiantes (para balanceo)
   */
  async obtenerCasaParaBalanceo(): Promise<Casa> {
    const casas = await this.prisma.casa.findMany({
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
      orderBy: {
        estudiantes: {
          _count: 'asc',
        },
      },
      take: 1,
    });

    if (casas.length === 0) {
      throw new BadRequestException('No hay casas disponibles');
    }

    return casas[0];
  }

  /**
   * Agrega puntos a una casa
   */
  async agregarPuntos(casaId: string, puntos: number): Promise<Casa> {
    return this.prisma.casa.update({
      where: { id: casaId },
      data: {
        puntos_temporada: {
          increment: puntos,
        },
      },
    });
  }

  /**
   * Reinicia los puntos de todas las casas (nueva temporada)
   */
  async reiniciarTemporada(): Promise<void> {
    await this.prisma.casa.updateMany({
      data: {
        puntos_temporada: 0,
        ranking_actual: 0,
      },
    });
  }

  /**
   * Obtiene los miembros de una casa
   */
  async obtenerMiembros(casaId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        where: { casa_id: casaId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          avatarUrl: true,
          puntos_totales: true,
          nivel_actual: true,
        },
        orderBy: { puntos_totales: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.estudiante.count({
        where: { casa_id: casaId },
      }),
    ]);

    return {
      estudiantes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private obtenerTemporadaActual(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Temporada 1: Marzo-Julio, Temporada 2: Agosto-Diciembre
    if (month >= 2 && month <= 6) {
      return `T1-${year}`;
    } else if (month >= 7 && month <= 11) {
      return `T2-${year}`;
    } else {
      // Enero-Febrero: Colonia
      return `Colonia-${year}`;
    }
  }
}
```

- **Criterio de éxito:** Servicio compila sin errores

#### Tarea 3.4: Crear CasasController

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/casas/casas.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CasasService, RankingCasas } from './casas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('casas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasasController {
  constructor(private readonly casasService: CasasService) {}

  /**
   * GET /casas
   * Obtiene todas las casas
   */
  @Get()
  async obtenerTodas() {
    return this.casasService.obtenerTodas();
  }

  /**
   * GET /casas/ranking
   * Obtiene el ranking de las casas
   */
  @Get('ranking')
  async obtenerRanking(): Promise<RankingCasas> {
    return this.casasService.obtenerRanking();
  }

  /**
   * GET /casas/:id
   * Obtiene una casa por ID
   */
  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.casasService.obtenerPorId(id);
  }

  /**
   * GET /casas/codigo/:codigo
   * Obtiene una casa por código
   */
  @Get('codigo/:codigo')
  async obtenerPorCodigo(@Param('codigo') codigo: string) {
    return this.casasService.obtenerPorCodigo(codigo);
  }

  /**
   * GET /casas/:id/miembros
   * Obtiene los miembros de una casa
   */
  @Get(':id/miembros')
  async obtenerMiembros(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.casasService.obtenerMiembros(id, page, limit);
  }

  /**
   * POST /casas/:id/estudiantes/:estudianteId
   * Asigna un estudiante a una casa (admin)
   */
  @Post(':id/estudiantes/:estudianteId')
  @Roles(Role.ADMIN)
  async asignarEstudiante(
    @Param('id') casaId: string,
    @Param('estudianteId') estudianteId: string,
  ) {
    await this.casasService.asignarEstudiante(estudianteId, casaId);
    return { message: 'Estudiante asignado exitosamente' };
  }

  /**
   * POST /casas/:id/puntos
   * Agrega puntos a una casa (admin/docente)
   */
  @Post(':id/puntos')
  @Roles(Role.ADMIN, Role.DOCENTE)
  async agregarPuntos(@Param('id') id: string, @Body('puntos') puntos: number) {
    return this.casasService.agregarPuntos(id, puntos);
  }

  /**
   * POST /casas/reiniciar-temporada
   * Reinicia los puntos de todas las casas (admin)
   */
  @Post('reiniciar-temporada')
  @Roles(Role.ADMIN)
  async reiniciarTemporada() {
    await this.casasService.reiniciarTemporada();
    return { message: 'Temporada reiniciada exitosamente' };
  }
}
```

- **Criterio de éxito:** Controller compila sin errores

#### Tarea 3.5: Crear CasasModule

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/casas/casas.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CasasController } from './casas.controller';
import { CasasService } from './casas.service';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  controllers: [CasasController],
  providers: [CasasService, PrismaService],
  exports: [CasasService],
})
export class CasasModule {}
```

- **Archivos a modificar:**
  - `apps/api/src/app.module.ts` - Agregar CasasModule

```typescript
import { CasasModule } from './casas/casas.module';

// En imports:
CasasModule,
```

- **Criterio de éxito:** Módulo registrado y funcionando

#### Tarea 3.6: Ejecutar seed y verificar

- **Tipo:** Backend
- **Comandos:**

```bash
cd apps/api
npm run db:seed
```

- **Verificación:**

```bash
npx prisma studio
# Verificar tabla "casas" tiene 4 registros
```

- **Criterio de éxito:** 4 casas creadas en la BD

#### Tarea 3.7: Crear tests para CasasService

- **Tipo:** Backend - Tests
- **Archivos a crear:**
  - `apps/api/src/casas/__tests__/casas.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CasasService } from '../casas.service';
import { PrismaService } from '../../core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CasasService', () => {
  let service: CasasService;

  const mockPrisma = {
    casa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    estudiante: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CasasService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<CasasService>(CasasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('obtenerTodas', () => {
    it('debe retornar todas las casas ordenadas por ranking', async () => {
      const mockCasas = [
        {
          id: '1',
          nombre: 'Phoenix',
          codigo: 'PHX',
          ranking_actual: 1,
          _count: { estudiantes: 10 },
        },
        { id: '2', nombre: 'Dragon', codigo: 'DRG', ranking_actual: 2, _count: { estudiantes: 8 } },
      ];
      mockPrisma.casa.findMany.mockResolvedValue(mockCasas);

      const result = await service.obtenerTodas();

      expect(result).toHaveLength(2);
      expect(result[0].nombre).toBe('Phoenix');
    });
  });

  describe('obtenerPorCodigo', () => {
    it('debe retornar la casa correcta', async () => {
      const mockCasa = { id: '1', nombre: 'Phoenix', codigo: 'PHX', _count: { estudiantes: 10 } };
      mockPrisma.casa.findUnique.mockResolvedValue(mockCasa);

      const result = await service.obtenerPorCodigo('phx');

      expect(mockPrisma.casa.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'PHX' },
        include: { _count: { select: { estudiantes: true } } },
      });
      expect(result.nombre).toBe('Phoenix');
    });

    it('debe lanzar error si la casa no existe', async () => {
      mockPrisma.casa.findUnique.mockResolvedValue(null);

      await expect(service.obtenerPorCodigo('XXX')).rejects.toThrow(NotFoundException);
    });
  });

  describe('asignarEstudiante', () => {
    it('debe asignar el estudiante a la casa', async () => {
      mockPrisma.casa.findUnique.mockResolvedValue({ id: 'casa-1' });
      mockPrisma.estudiante.findUnique.mockResolvedValue({ id: 'est-1' });
      mockPrisma.estudiante.update.mockResolvedValue({});

      await service.asignarEstudiante('est-1', 'casa-1');

      expect(mockPrisma.estudiante.update).toHaveBeenCalledWith({
        where: { id: 'est-1' },
        data: { casa_id: 'casa-1' },
      });
    });
  });
});
```

- **Criterio de éxito:** Tests pasan

### Entregables del día

- [ ] Script de seed para 4 casas
- [ ] CasasService completo
- [ ] CasasController con 8 endpoints
- [ ] CasasModule registrado
- [ ] 4 casas creadas en BD
- [ ] Tests pasando

### Validación

```bash
# 1. Ejecutar seed
npm run db:seed

# 2. Verificar casas en Prisma Studio
npx prisma studio

# 3. Iniciar servidor
npm run start:dev

# 4. Probar endpoints
curl http://localhost:3001/api/casas
curl http://localhost:3001/api/casas/ranking
curl http://localhost:3001/api/casas/codigo/PHX
```

---

# FASE 2: GAMIFICACIÓN (Días 4-5)

---

## DÍA 4: MÓDULO CASAS - INTEGRACIÓN GAMIFICACIÓN

### Objetivo

Integrar el sistema de Casas con la gamificación existente: cuando un estudiante gana puntos, su casa también los gana.

### Pre-requisitos

- Días 1-3 completados
- CasasService funcionando
- 4 casas en BD

### Tareas (en orden)

#### Tarea 4.1: Modificar PuntosService para actualizar puntos de Casa

- **Tipo:** Backend
- **Archivos a modificar:**
  - `apps/api/src/gamificacion/puntos.service.ts`
- **Agregar inyección de CasasService y modificar método de otorgar puntos:**

```typescript
// Agregar import
import { CasasService } from '../casas/casas.service';

// En constructor:
constructor(
  private readonly prisma: PrismaService,
  private readonly casasService: CasasService, // NUEVO
) {}

// Modificar método que otorga puntos (buscar el método existente)
// Después de actualizar puntos del estudiante, agregar:
async otorgarPuntos(estudianteId: string, puntos: number, ...args) {
  // ... código existente que actualiza puntos del estudiante ...

  // NUEVO: Actualizar puntos de la casa
  const estudiante = await this.prisma.estudiante.findUnique({
    where: { id: estudianteId },
    select: { casa_id: true },
  });

  if (estudiante?.casa_id) {
    await this.casasService.agregarPuntos(estudiante.casa_id, puntos);
  }

  // ... resto del código ...
}
```

- **Criterio de éxito:** Al otorgar puntos, la casa también recibe puntos

#### Tarea 4.2: Modificar GamificacionModule para importar CasasModule

- **Tipo:** Backend
- **Archivos a modificar:**
  - `apps/api/src/gamificacion/gamificacion.module.ts`

```typescript
// Agregar import
import { CasasModule } from '../casas/casas.module';

// En imports del módulo:
@Module({
  imports: [CasasModule], // NUEVO
  // ... resto
})
```

- **Criterio de éxito:** Módulo compila sin errores de dependencias circulares

#### Tarea 4.3: Crear endpoint para obtener estadísticas de casa del estudiante

- **Tipo:** Backend
- **Archivos a modificar:**
  - `apps/api/src/estudiantes/estudiantes.controller.ts`
- **Agregar endpoint:**

```typescript
/**
 * GET /estudiantes/mi-casa
 * Obtiene la información de la casa del estudiante autenticado
 */
@Get('mi-casa')
@Roles(Role.ESTUDIANTE)
async obtenerMiCasa(@Request() req) {
  const estudiante = await this.estudiantesFacade.obtener(req.user.estudianteId);

  if (!estudiante.casa_id) {
    return {
      asignado: false,
      mensaje: 'No tienes una casa asignada aún'
    };
  }

  // Importar CasasService y usar
  const casa = await this.casasService.obtenerPorId(estudiante.casa_id);
  const ranking = await this.casasService.obtenerRanking();

  return {
    asignado: true,
    casa,
    mi_ranking_en_casa: await this.obtenerRankingEnCasa(req.user.estudianteId, estudiante.casa_id),
    ranking_general: ranking,
  };
}
```

- **Criterio de éxito:** Endpoint funcionando

#### Tarea 4.4: Agregar lógica de asignación automática de casa (balanceada)

- **Tipo:** Backend
- **Archivos a modificar:**
  - `apps/api/src/casas/casas.service.ts`
- **Agregar método:**

```typescript
/**
 * Asigna automáticamente una casa al estudiante basándose en balanceo
 * Se usa durante el onboarding
 */
async asignarCasaAutomatica(estudianteId: string): Promise<Casa> {
  const casaMenosEstudiantes = await this.obtenerCasaParaBalanceo();
  await this.asignarEstudiante(estudianteId, casaMenosEstudiantes.id);
  return casaMenosEstudiantes;
}
```

- **Criterio de éxito:** Método disponible para onboarding

#### Tarea 4.5: Crear componente frontend CasaCard

- **Tipo:** Frontend
- **Archivos a crear:**
  - `apps/web/src/components/gamificacion/CasaCard.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Casa {
  id: string;
  nombre: string;
  codigo: string;
  color_primario: string;
  color_secundario: string;
  emblema_url: string | null;
  lema: string | null;
  puntos_temporada: number;
  ranking_actual: number;
  _count?: {
    estudiantes: number;
  };
}

interface CasaCardProps {
  casa: Casa;
  isUserCasa?: boolean;
  showRanking?: boolean;
  onClick?: () => void;
}

export function CasaCard({ casa, isUserCasa = false, showRanking = true, onClick }: CasaCardProps) {
  const getRankingIcon = (ranking: number) => {
    switch (ranking) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${ranking}`;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative rounded-xl p-4 cursor-pointer overflow-hidden
        ${isUserCasa ? 'ring-2 ring-yellow-400' : ''}
      `}
      style={{
        background: `linear-gradient(135deg, ${casa.color_primario}20, ${casa.color_secundario}20)`,
        borderLeft: `4px solid ${casa.color_primario}`,
      }}
    >
      {/* Badge de "Tu Casa" */}
      {isUserCasa && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
          Tu Casa
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Emblema */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: casa.color_primario }}
        >
          {casa.emblema_url ? (
            <Image
              src={casa.emblema_url}
              alt={casa.nombre}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <span className="text-3xl font-bold text-white">
              {casa.codigo.charAt(0)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg" style={{ color: casa.color_primario }}>
              {casa.nombre}
            </h3>
            {showRanking && (
              <span className="text-xl">{getRankingIcon(casa.ranking_actual)}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            "{casa.lema}"
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="font-semibold" style={{ color: casa.color_primario }}>
              {casa.puntos_temporada.toLocaleString()} pts
            </span>
            {casa._count && (
              <span className="text-gray-500">
                {casa._count.estudiantes} miembros
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- **Criterio de éxito:** Componente renderiza correctamente

#### Tarea 4.6: Crear componente RankingCasas

- **Tipo:** Frontend
- **Archivos a crear:**
  - `apps/web/src/components/gamificacion/RankingCasas.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CasaCard } from './CasaCard';
import { apiClient } from '@/lib/api-client';

interface Casa {
  id: string;
  nombre: string;
  codigo: string;
  color_primario: string;
  color_secundario: string;
  emblema_url: string | null;
  lema: string | null;
  puntos_temporada: number;
  ranking_actual: number;
  _count?: {
    estudiantes: number;
  };
}

interface RankingCasasProps {
  userCasaId?: string | null;
}

export function RankingCasas({ userCasaId }: RankingCasasProps) {
  const [casas, setCasas] = useState<Casa[]>([]);
  const [temporada, setTemporada] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await apiClient.get('/casas/ranking');
        setCasas(response.data.casas);
        setTemporada(response.data.temporada_actual);
      } catch (err) {
        setError('Error al cargar el ranking');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Ranking de Casas</h2>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {temporada}
        </span>
      </div>

      <div className="space-y-3">
        {casas.map((casa) => (
          <CasaCard
            key={casa.id}
            casa={casa}
            isUserCasa={casa.id === userCasaId}
            showRanking={true}
          />
        ))}
      </div>
    </div>
  );
}
```

- **Criterio de éxito:** Componente muestra ranking de casas

#### Tarea 4.7: Agregar RankingCasas a página de gamificación del estudiante

- **Tipo:** Frontend
- **Archivos a modificar:**
  - `apps/web/src/app/estudiante/gamificacion/page.tsx`
- **Agregar import y componente:**

```typescript
import { RankingCasas } from '@/components/gamificacion/RankingCasas';

// En el JSX, agregar sección:
<section className="mt-8">
  <RankingCasas userCasaId={estudiante?.casa_id} />
</section>
```

- **Criterio de éxito:** Ranking visible en página de gamificación

### Entregables del día

- [ ] PuntosService actualiza puntos de casa
- [ ] GamificacionModule importa CasasModule
- [ ] Endpoint `/estudiantes/mi-casa` funcionando
- [ ] Método `asignarCasaAutomatica` disponible
- [ ] Componente `CasaCard` creado
- [ ] Componente `RankingCasas` creado
- [ ] Ranking visible en gamificación

### Validación

```bash
# 1. Verificar que al otorgar puntos se actualiza la casa
# (crear test manual o usar endpoint existente)

# 2. Verificar ranking en frontend
# Abrir /estudiante/gamificacion y ver ranking

# 3. Probar endpoint
curl http://localhost:3001/api/casas/ranking
```

---

## DÍA 5: ONBOARDING - TEST UBICACIÓN + QUIZ CASA

### Objetivo

Crear el flujo completo de onboarding para estudiantes nuevos: test de ubicación + quiz de personalidad para casa + creación de avatar.

### Pre-requisitos

- Días 1-4 completados
- Modelo TestUbicacion en schema
- CasasService con asignación automática

### Tareas (en orden)

#### Tarea 5.1: Crear OnboardingService

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/onboarding/onboarding.service.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CasasService } from '../casas/casas.service';
import { Mundo } from '@prisma/client';

interface PreguntaTest {
  id: string;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
  dificultad: number; // 1-10
}

interface RespuestaTest {
  pregunta_id: string;
  respuesta: number;
  correcta: boolean;
  tiempo_segundos: number;
}

interface ResultadoTest {
  nivel_asignado: number;
  porcentaje_aciertos: number;
  tiempo_total: number;
  recomendacion: string;
}

interface PreguntaQuizCasa {
  id: string;
  pregunta: string;
  opciones: { texto: string; casa: string }[];
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly casasService: CasasService,
  ) {}

  /**
   * Inicia un nuevo test de ubicación para un estudiante
   */
  async iniciarTestUbicacion(estudianteId: string, mundo: Mundo) {
    // Verificar que el estudiante existe y no tiene test completado para ese mundo
    const testExistente = await this.prisma.testUbicacion.findFirst({
      where: {
        estudiante_id: estudianteId,
        mundo,
        completado: true,
      },
    });

    if (testExistente) {
      throw new BadRequestException(`Ya completaste el test de ${mundo}`);
    }

    // Generar preguntas (10 preguntas de dificultad progresiva)
    const preguntas = this.generarPreguntasTest(mundo);

    // Crear registro del test
    const test = await this.prisma.testUbicacion.create({
      data: {
        estudiante_id: estudianteId,
        mundo,
        respuestas: [],
        total_preguntas: preguntas.length,
        correctas: 0,
        nivel_asignado: 0,
        porcentaje_aciertos: 0,
        tiempo_total_segundos: 0,
      },
    });

    return {
      test_id: test.id,
      preguntas,
      tiempo_limite_minutos: 15,
    };
  }

  /**
   * Guarda la respuesta a una pregunta del test
   */
  async guardarRespuesta(
    testId: string,
    preguntaId: string,
    respuesta: number,
    tiempoSegundos: number,
  ) {
    const test = await this.prisma.testUbicacion.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException('Test no encontrado');
    }

    if (test.completado) {
      throw new BadRequestException('El test ya fue completado');
    }

    const preguntas = this.generarPreguntasTest(test.mundo);
    const pregunta = preguntas.find((p) => p.id === preguntaId);

    if (!pregunta) {
      throw new BadRequestException('Pregunta no encontrada');
    }

    const correcta = respuesta === pregunta.respuesta_correcta;
    const respuestasActuales = test.respuestas as RespuestaTest[];

    const nuevaRespuesta: RespuestaTest = {
      pregunta_id: preguntaId,
      respuesta,
      correcta,
      tiempo_segundos: tiempoSegundos,
    };

    await this.prisma.testUbicacion.update({
      where: { id: testId },
      data: {
        respuestas: [...respuestasActuales, nuevaRespuesta],
        correctas: correcta ? test.correctas + 1 : test.correctas,
        tiempo_total_segundos: test.tiempo_total_segundos + tiempoSegundos,
      },
    });

    return { correcta, pregunta_siguiente: respuestasActuales.length + 1 < test.total_preguntas };
  }

  /**
   * Completa el test y calcula el nivel
   */
  async completarTest(testId: string): Promise<ResultadoTest> {
    const test = await this.prisma.testUbicacion.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException('Test no encontrado');
    }

    const porcentaje = (test.correctas / test.total_preguntas) * 100;
    const nivel = this.calcularNivel(porcentaje, test.tiempo_total_segundos);

    await this.prisma.testUbicacion.update({
      where: { id: testId },
      data: {
        completado: true,
        fecha_completado: new Date(),
        nivel_asignado: nivel,
        porcentaje_aciertos: porcentaje,
      },
    });

    // Actualizar nivel del estudiante
    await this.prisma.estudiante.update({
      where: { id: test.estudiante_id },
      data: { nivel_ubicacion: nivel },
    });

    return {
      nivel_asignado: nivel,
      porcentaje_aciertos: porcentaje,
      tiempo_total: test.tiempo_total_segundos,
      recomendacion: this.obtenerRecomendacion(nivel),
    };
  }

  /**
   * Obtiene las preguntas del quiz de casa
   */
  obtenerQuizCasa(): PreguntaQuizCasa[] {
    return [
      {
        id: 'q1',
        pregunta: '¿Qué prefieres hacer en tu tiempo libre?',
        opciones: [
          { texto: 'Inventar o crear cosas nuevas', casa: 'PHX' },
          { texto: 'Leer y aprender sobre historia o ciencia', casa: 'DRG' },
          { texto: 'Deportes o actividades competitivas', casa: 'TGR' },
          { texto: 'Observar la naturaleza o el cielo', casa: 'EGL' },
        ],
      },
      {
        id: 'q2',
        pregunta: 'Cuando enfrentas un problema difícil...',
        opciones: [
          { texto: 'Busco una solución creativa e innovadora', casa: 'PHX' },
          { texto: 'Analizo todas las opciones cuidadosamente', casa: 'DRG' },
          { texto: 'Lo enfrento de manera directa y rápida', casa: 'TGR' },
          { texto: 'Busco ver el panorama completo primero', casa: 'EGL' },
        ],
      },
      {
        id: 'q3',
        pregunta: '¿Qué cualidad admiras más?',
        opciones: [
          { texto: 'La creatividad y la originalidad', casa: 'PHX' },
          { texto: 'La sabiduría y el conocimiento', casa: 'DRG' },
          { texto: 'La valentía y la determinación', casa: 'TGR' },
          { texto: 'La visión y la libertad', casa: 'EGL' },
        ],
      },
      {
        id: 'q4',
        pregunta: 'En un equipo, prefieres ser...',
        opciones: [
          { texto: 'El que aporta ideas nuevas', casa: 'PHX' },
          { texto: 'El estratega que planifica', casa: 'DRG' },
          { texto: 'El líder que toma acción', casa: 'TGR' },
          { texto: 'El que ve oportunidades que otros no ven', casa: 'EGL' },
        ],
      },
      {
        id: 'q5',
        pregunta: '¿Qué elemento te representa mejor?',
        opciones: [
          { texto: 'Fuego - Transformación y energía', casa: 'PHX' },
          { texto: 'Tierra - Estabilidad y profundidad', casa: 'DRG' },
          { texto: 'Metal - Fuerza y precisión', casa: 'TGR' },
          { texto: 'Aire - Libertad y perspectiva', casa: 'EGL' },
        ],
      },
    ];
  }

  /**
   * Procesa las respuestas del quiz y asigna casa
   */
  async procesarQuizCasa(
    estudianteId: string,
    respuestas: { pregunta_id: string; casa_elegida: string }[],
  ) {
    // Contar votos por casa
    const votos: Record<string, number> = { PHX: 0, DRG: 0, TGR: 0, EGL: 0 };

    for (const respuesta of respuestas) {
      votos[respuesta.casa_elegida]++;
    }

    // Encontrar casa ganadora (o balancear si hay empate)
    const maxVotos = Math.max(...Object.values(votos));
    const casasGanadoras = Object.entries(votos)
      .filter(([, v]) => v === maxVotos)
      .map(([k]) => k);

    let casaCodigo: string;
    if (casasGanadoras.length === 1) {
      casaCodigo = casasGanadoras[0];
    } else {
      // En caso de empate, elegir aleatoriamente entre las ganadoras
      casaCodigo = casasGanadoras[Math.floor(Math.random() * casasGanadoras.length)];
    }

    // Obtener casa y asignar
    const casa = await this.casasService.obtenerPorCodigo(casaCodigo);
    await this.casasService.asignarEstudiante(estudianteId, casa.id);

    return {
      casa_asignada: casa,
      votos,
      mensaje: `¡Bienvenido a la Casa ${casa.nombre}! ${casa.lema}`,
    };
  }

  /**
   * Completa todo el onboarding del estudiante
   */
  async completarOnboarding(estudianteId: string) {
    await this.prisma.estudiante.update({
      where: { id: estudianteId },
      data: {
        onboarding_completado: true,
        fecha_onboarding: new Date(),
      },
    });

    return { completado: true };
  }

  /**
   * Verifica el estado del onboarding de un estudiante
   */
  async obtenerEstadoOnboarding(estudianteId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: {
        onboarding_completado: true,
        nivel_ubicacion: true,
        casa_id: true,
        avatarUrl: true,
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return {
      completado: estudiante.onboarding_completado,
      pasos: {
        test_ubicacion: estudiante.nivel_ubicacion !== null,
        casa_asignada: estudiante.casa_id !== null,
        avatar_creado: estudiante.avatarUrl !== null,
      },
    };
  }

  // Métodos privados

  private generarPreguntasTest(mundo: Mundo): PreguntaTest[] {
    // En producción, esto vendría de una base de datos de preguntas
    // Por ahora, preguntas de ejemplo
    const preguntasMatematica: PreguntaTest[] = [
      {
        id: 'm1',
        pregunta: '¿Cuánto es 7 + 5?',
        opciones: ['10', '11', '12', '13'],
        respuesta_correcta: 2,
        dificultad: 1,
      },
      {
        id: 'm2',
        pregunta: '¿Cuánto es 15 - 8?',
        opciones: ['5', '6', '7', '8'],
        respuesta_correcta: 2,
        dificultad: 1,
      },
      {
        id: 'm3',
        pregunta: '¿Cuánto es 6 x 4?',
        opciones: ['20', '22', '24', '26'],
        respuesta_correcta: 2,
        dificultad: 2,
      },
      {
        id: 'm4',
        pregunta: '¿Cuánto es 36 ÷ 6?',
        opciones: ['4', '5', '6', '7'],
        respuesta_correcta: 2,
        dificultad: 2,
      },
      {
        id: 'm5',
        pregunta: '¿Cuál es el siguiente número primo después de 7?',
        opciones: ['8', '9', '10', '11'],
        respuesta_correcta: 3,
        dificultad: 3,
      },
      {
        id: 'm6',
        pregunta: '¿Cuánto es 3²?',
        opciones: ['6', '8', '9', '12'],
        respuesta_correcta: 2,
        dificultad: 3,
      },
      {
        id: 'm7',
        pregunta: '¿Cuánto es 25% de 80?',
        opciones: ['15', '20', '25', '30'],
        respuesta_correcta: 1,
        dificultad: 4,
      },
      {
        id: 'm8',
        pregunta: '¿Cuánto es √64?',
        opciones: ['6', '7', '8', '9'],
        respuesta_correcta: 2,
        dificultad: 4,
      },
      {
        id: 'm9',
        pregunta: 'Si x + 5 = 12, ¿cuánto es x?',
        opciones: ['5', '6', '7', '8'],
        respuesta_correcta: 2,
        dificultad: 5,
      },
      {
        id: 'm10',
        pregunta: '¿Cuál es el MCD de 12 y 18?',
        opciones: ['2', '3', '6', '9'],
        respuesta_correcta: 2,
        dificultad: 5,
      },
    ];

    // Retornar según el mundo
    switch (mundo) {
      case Mundo.MATEMATICA:
        return preguntasMatematica;
      case Mundo.PROGRAMACION:
        // TODO: Agregar preguntas de programación
        return preguntasMatematica; // Temporalmente usar las mismas
      case Mundo.CIENCIAS:
        // TODO: Agregar preguntas de ciencias
        return preguntasMatematica; // Temporalmente usar las mismas
      default:
        return preguntasMatematica;
    }
  }

  private calcularNivel(porcentaje: number, tiempoSegundos: number): number {
    // Algoritmo simple: nivel base por porcentaje, bonificación por tiempo
    let nivel = Math.floor(porcentaje / 10); // 0-10 basado en porcentaje

    // Bonificación si fue rápido (menos de 5 minutos)
    if (tiempoSegundos < 300 && porcentaje >= 70) {
      nivel = Math.min(10, nivel + 1);
    }

    return Math.max(1, Math.min(10, nivel)); // Clamp entre 1 y 10
  }

  private obtenerRecomendacion(nivel: number): string {
    if (nivel <= 3) {
      return 'Te recomendamos empezar con el grupo Básico 1 (B1) para construir una base sólida.';
    } else if (nivel <= 5) {
      return 'Tienes una buena base. Te recomendamos el grupo Básico 2 (B2).';
    } else if (nivel <= 7) {
      return 'Excelente nivel. El grupo Básico 3 (B3) o Avanzado 1 (A1) sería ideal para ti.';
    } else {
      return '¡Impresionante! Estás listo para desafíos avanzados en el grupo A1 o preparación olímpica.';
    }
  }
}
```

- **Criterio de éxito:** Servicio compila sin errores

#### Tarea 5.2: Crear OnboardingController

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/onboarding/onboarding.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Mundo } from '@prisma/client';

@Controller('onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * GET /onboarding/estado
   * Obtiene el estado del onboarding del estudiante
   */
  @Get('estado')
  @Roles(Role.ESTUDIANTE)
  async obtenerEstado(@Request() req) {
    return this.onboardingService.obtenerEstadoOnboarding(req.user.estudianteId);
  }

  /**
   * POST /onboarding/test-ubicacion/iniciar
   * Inicia el test de ubicación
   */
  @Post('test-ubicacion/iniciar')
  @Roles(Role.ESTUDIANTE)
  async iniciarTest(@Request() req, @Body('mundo') mundo: Mundo) {
    return this.onboardingService.iniciarTestUbicacion(req.user.estudianteId, mundo);
  }

  /**
   * POST /onboarding/test-ubicacion/:testId/responder
   * Guarda una respuesta del test
   */
  @Post('test-ubicacion/:testId/responder')
  @Roles(Role.ESTUDIANTE)
  async responderPregunta(
    @Param('testId') testId: string,
    @Body() body: { pregunta_id: string; respuesta: number; tiempo_segundos: number },
  ) {
    return this.onboardingService.guardarRespuesta(
      testId,
      body.pregunta_id,
      body.respuesta,
      body.tiempo_segundos,
    );
  }

  /**
   * POST /onboarding/test-ubicacion/:testId/completar
   * Completa el test y obtiene el resultado
   */
  @Post('test-ubicacion/:testId/completar')
  @Roles(Role.ESTUDIANTE)
  async completarTest(@Param('testId') testId: string) {
    return this.onboardingService.completarTest(testId);
  }

  /**
   * GET /onboarding/quiz-casa/preguntas
   * Obtiene las preguntas del quiz de casa
   */
  @Get('quiz-casa/preguntas')
  @Roles(Role.ESTUDIANTE)
  obtenerPreguntasQuiz() {
    return this.onboardingService.obtenerQuizCasa();
  }

  /**
   * POST /onboarding/quiz-casa/procesar
   * Procesa las respuestas y asigna casa
   */
  @Post('quiz-casa/procesar')
  @Roles(Role.ESTUDIANTE)
  async procesarQuiz(
    @Request() req,
    @Body() body: { respuestas: { pregunta_id: string; casa_elegida: string }[] },
  ) {
    return this.onboardingService.procesarQuizCasa(req.user.estudianteId, body.respuestas);
  }

  /**
   * POST /onboarding/completar
   * Marca el onboarding como completado
   */
  @Post('completar')
  @Roles(Role.ESTUDIANTE)
  async completarOnboarding(@Request() req) {
    return this.onboardingService.completarOnboarding(req.user.estudianteId);
  }
}
```

- **Criterio de éxito:** Controller compila sin errores

#### Tarea 5.3: Crear OnboardingModule

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/onboarding/onboarding.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { CasasModule } from '../casas/casas.module';
import { PrismaService } from '../core/database/prisma.service';

@Module({
  imports: [CasasModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, PrismaService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
```

- **Registrar en AppModule:**

```typescript
import { OnboardingModule } from './onboarding/onboarding.module';

// En imports:
OnboardingModule,
```

- **Criterio de éxito:** Módulo registrado y funcionando

#### Tarea 5.4: Crear página de onboarding en frontend

- **Tipo:** Frontend
- **Archivos a crear:**
  - `apps/web/src/app/estudiante/onboarding/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { TestUbicacionStep } from './components/TestUbicacionStep';
import { QuizCasaStep } from './components/QuizCasaStep';
import { AvatarStep } from './components/AvatarStep';
import { CompletadoStep } from './components/CompletadoStep';

type OnboardingStep = 'test' | 'quiz' | 'avatar' | 'completado';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('test');
  const [loading, setLoading] = useState(true);
  const [estadoOnboarding, setEstadoOnboarding] = useState<any>(null);

  useEffect(() => {
    const verificarEstado = async () => {
      try {
        const response = await apiClient.get('/onboarding/estado');
        setEstadoOnboarding(response.data);

        // Si ya completó, redirigir
        if (response.data.completado) {
          router.push('/estudiante/gimnasio');
          return;
        }

        // Determinar paso actual basado en estado
        if (!response.data.pasos.test_ubicacion) {
          setStep('test');
        } else if (!response.data.pasos.casa_asignada) {
          setStep('quiz');
        } else if (!response.data.pasos.avatar_creado) {
          setStep('avatar');
        } else {
          setStep('completado');
        }
      } catch (error) {
        console.error('Error al verificar estado:', error);
      } finally {
        setLoading(false);
      }
    };

    verificarEstado();
  }, [router]);

  const handleTestCompletado = () => {
    setStep('quiz');
  };

  const handleQuizCompletado = () => {
    setStep('avatar');
  };

  const handleAvatarCompletado = () => {
    setStep('completado');
  };

  const handleOnboardingCompletado = async () => {
    await apiClient.post('/onboarding/completar');
    router.push('/estudiante/gimnasio');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: '0%' }}
          animate={{
            width: step === 'test' ? '25%' : step === 'quiz' ? '50%' : step === 'avatar' ? '75%' : '100%',
          }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 pt-16">
        <AnimatePresence mode="wait">
          {step === 'test' && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <TestUbicacionStep onComplete={handleTestCompletado} />
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <QuizCasaStep onComplete={handleQuizCompletado} />
            </motion.div>
          )}

          {step === 'avatar' && (
            <motion.div
              key="avatar"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <AvatarStep onComplete={handleAvatarCompletado} />
            </motion.div>
          )}

          {step === 'completado' && (
            <motion.div
              key="completado"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CompletadoStep onComplete={handleOnboardingCompletado} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- **Criterio de éxito:** Página renderiza correctamente

#### Tarea 5.5: Crear componentes de pasos del onboarding

- **Tipo:** Frontend
- **Archivos a crear:**
  - `apps/web/src/app/estudiante/onboarding/components/TestUbicacionStep.tsx`
  - `apps/web/src/app/estudiante/onboarding/components/QuizCasaStep.tsx`
  - `apps/web/src/app/estudiante/onboarding/components/AvatarStep.tsx`
  - `apps/web/src/app/estudiante/onboarding/components/CompletadoStep.tsx`

(Por brevedad, incluyo solo TestUbicacionStep - los demás siguen patrón similar)

```typescript
// TestUbicacionStep.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

interface TestUbicacionStepProps {
  onComplete: () => void;
}

export function TestUbicacionStep({ onComplete }: TestUbicacionStepProps) {
  const [testId, setTestId] = useState<string | null>(null);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const iniciarTest = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/onboarding/test-ubicacion/iniciar', {
        mundo: 'MATEMATICA',
      });
      setTestId(response.data.test_id);
      setPreguntas(response.data.preguntas);
      setTiempoInicio(Date.now());
    } catch (error) {
      console.error('Error al iniciar test:', error);
    } finally {
      setLoading(false);
    }
  };

  const responderPregunta = async (respuestaIndex: number) => {
    if (!testId) return;

    const tiempoSegundos = Math.floor((Date.now() - tiempoInicio) / 1000);

    try {
      const response = await apiClient.post(`/onboarding/test-ubicacion/${testId}/responder`, {
        pregunta_id: preguntas[preguntaActual].id,
        respuesta: respuestaIndex,
        tiempo_segundos: tiempoSegundos,
      });

      if (response.data.pregunta_siguiente) {
        setPreguntaActual(prev => prev + 1);
        setTiempoInicio(Date.now());
      } else {
        // Completar test
        const resultadoResponse = await apiClient.post(`/onboarding/test-ubicacion/${testId}/completar`);
        setResultado(resultadoResponse.data);
      }
    } catch (error) {
      console.error('Error al responder:', error);
    }
  };

  if (resultado) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">¡Test Completado!</h2>
        <div className="bg-white/10 rounded-xl p-6 mb-6">
          <p className="text-2xl mb-2">Tu nivel: <span className="font-bold text-yellow-400">{resultado.nivel_asignado}</span></p>
          <p className="text-lg mb-4">Aciertos: {resultado.porcentaje_aciertos.toFixed(0)}%</p>
          <p className="text-gray-300">{resultado.recomendacion}</p>
        </div>
        <button
          onClick={onComplete}
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-bold text-lg"
        >
          Continuar
        </button>
      </div>
    );
  }

  if (!testId) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Test de Ubicación</h1>
        <p className="text-xl text-gray-300 mb-8">
          Vamos a conocer tu nivel actual con unas preguntas rápidas.
          No te preocupes, esto nos ayuda a personalizar tu experiencia.
        </p>
        <button
          onClick={iniciarTest}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-bold text-lg disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Comenzar Test'}
        </button>
      </div>
    );
  }

  const pregunta = preguntas[preguntaActual];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <span className="text-sm text-gray-400">
          Pregunta {preguntaActual + 1} de {preguntas.length}
        </span>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }}
          />
        </div>
      </div>

      <motion.div
        key={preguntaActual}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-6">{pregunta.pregunta}</h2>
        <div className="space-y-3">
          {pregunta.opciones.map((opcion: string, index: number) => (
            <button
              key={index}
              onClick={() => responderPregunta(index)}
              className="w-full text-left p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 mr-3">
                {String.fromCharCode(65 + index)}
              </span>
              {opcion}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
```

- **Criterio de éxito:** Componentes funcionan en el wizard

#### Tarea 5.6: Agregar redirección a onboarding si no completado

- **Tipo:** Frontend
- **Archivos a modificar:**
  - `apps/web/src/middleware.ts` (o crear)
  - O agregar verificación en layout de estudiante

```typescript
// En el layout del estudiante o en un hook
useEffect(() => {
  const verificarOnboarding = async () => {
    if (user?.role === 'estudiante') {
      const response = await apiClient.get('/onboarding/estado');
      if (!response.data.completado && !pathname.startsWith('/estudiante/onboarding')) {
        router.push('/estudiante/onboarding');
      }
    }
  };
  verificarOnboarding();
}, [user, pathname]);
```

- **Criterio de éxito:** Estudiantes nuevos son redirigidos al onboarding

### Entregables del día

- [ ] OnboardingService con test + quiz
- [ ] OnboardingController con 7 endpoints
- [ ] OnboardingModule registrado
- [ ] Página `/estudiante/onboarding`
- [ ] Componentes de pasos (4 componentes)
- [ ] Redirección automática para nuevos estudiantes

### Validación

```bash
# 1. Probar endpoints
curl -X POST http://localhost:3001/api/onboarding/test-ubicacion/iniciar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mundo": "MATEMATICA"}'

# 2. Probar quiz de casa
curl http://localhost:3001/api/onboarding/quiz-casa/preguntas \
  -H "Authorization: Bearer $TOKEN"

# 3. Probar flujo completo en frontend
# Crear estudiante nuevo y verificar que va a onboarding
```

---

# FASE 3: PLANIFICACIONES (Días 6-9)

---

## DÍA 6: BACKEND PLANIFICACIONES - SERVICIOS

### Objetivo

Crear el servicio de planificaciones con todas las operaciones CRUD y lógica de negocio.

### Pre-requisitos

- Días 1-5 completados
- Modelos de planificaciones en schema (ya existen)

### Tareas (en orden)

#### Tarea 6.1: Crear estructura de carpetas

- **Tipo:** Backend
- **Archivos a crear:**

```
apps/api/src/planificaciones/
├── planificaciones.module.ts
├── planificaciones.controller.ts
├── services/
│   ├── planificaciones.service.ts
│   ├── actividades.service.ts
│   └── asignaciones.service.ts
├── dto/
│   ├── index.ts
│   ├── create-planificacion.dto.ts
│   ├── update-planificacion.dto.ts
│   ├── create-actividad.dto.ts
│   ├── asignar-planificacion.dto.ts
│   └── filtros-planificaciones.dto.ts
└── guards/
    └── planificacion-access.guard.ts
```

#### Tarea 6.2: Crear DTOs

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/planificaciones/dto/create-planificacion.dto.ts`

```typescript
import { IsString, IsInt, IsArray, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { EstadoPlanificacion, NivelDificultad } from '@prisma/client';

export class CreatePlanificacionDto {
  @IsString()
  grupo_id: string;

  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt()
  @Min(2024)
  @Max(2030)
  anio: number;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  tematica_principal: string;

  @IsArray()
  @IsString({ each: true })
  objetivos_aprendizaje: string[];

  @IsString()
  @IsOptional()
  notas_docentes?: string;
}

export class CreateActividadDto {
  @IsInt()
  @Min(1)
  @Max(4)
  semana_numero: number;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsString()
  componente_nombre: string;

  @IsOptional()
  componente_props?: Record<string, any>;

  @IsEnum(NivelDificultad)
  nivel_dificultad: NivelDificultad;

  @IsInt()
  @Min(5)
  @Max(120)
  tiempo_estimado_minutos: number;

  @IsInt()
  @Min(0)
  puntos_gamificacion: number;

  @IsString()
  instrucciones_docente: string;

  @IsString()
  instrucciones_estudiante: string;

  @IsArray()
  @IsOptional()
  recursos_url?: { tipo: string; titulo: string; url: string }[];
}
```

- `apps/api/src/planificaciones/dto/filtros-planificaciones.dto.ts`

```typescript
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoPlanificacion } from '@prisma/client';

export class FiltrosPlanificacionesDto {
  @IsOptional()
  @IsString()
  grupo_id?: string;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  mes?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  anio?: number;

  @IsOptional()
  @IsEnum(EstadoPlanificacion)
  estado?: EstadoPlanificacion;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
```

#### Tarea 6.3: Crear PlanificacionesService

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/planificaciones/services/planificaciones.service.ts`

(Servicio completo con CRUD - similar a lo que documentamos en auditoría)

#### Tarea 6.4: Crear ActividadesService

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/planificaciones/services/actividades.service.ts`

#### Tarea 6.5: Crear AsignacionesService

- **Tipo:** Backend
- **Archivos a crear:**
  - `apps/api/src/planificaciones/services/asignaciones.service.ts`

#### Tarea 6.6: Crear tests unitarios

- **Tipo:** Backend - Tests

### Entregables del día

- [ ] DTOs con validaciones
- [ ] PlanificacionesService completo
- [ ] ActividadesService completo
- [ ] AsignacionesService completo
- [ ] Tests unitarios pasando

---

## DÍA 7: BACKEND PLANIFICACIONES - CONTROLLER

### Objetivo

Crear el controller con todos los endpoints REST para planificaciones.

### Pre-requisitos

- Día 6 completado

### Tareas

- Crear PlanificacionesController con ~15 endpoints
- Crear PlanificacionesModule
- Registrar en AppModule
- Tests de integración

---

## DÍA 8: FRONTEND ADMIN PLANIFICACIONES

### Objetivo

Conectar el frontend existente de admin con el backend de planificaciones.

### Pre-requisitos

- Días 6-7 completados

### Tareas

- Actualizar `planificaciones.api.ts` para usar endpoints reales
- Actualizar `planificaciones.store.ts`
- Verificar que la UI existente funciona
- Agregar manejo de errores

---

## DÍA 9: FRONTEND ESTUDIANTE + DOCENTE PLANIFICACIONES

### Objetivo

Conectar las vistas de estudiante y docente con el backend.

### Pre-requisitos

- Día 8 completado

### Tareas

- Actualizar vista del gimnasio para cargar planificaciones reales
- Crear endpoints de progreso para estudiantes
- Conectar vista de docente

---

# FASE 4: ARENA (Días 10-12)

## DÍA 10: ARENA DIARIA - BACKEND

(Crear modelo, servicio, controller para cápsulas diarias)

## DÍA 11: ARENA DIARIA - FRONTEND

(Crear componentes y página de arena diaria)

## DÍA 12: ARENA MULTIJUGADOR - ESTRUCTURA BASE

(Crear estructura base sin WebSockets completos)

---

# FASE 5: PRO FEATURES (Días 13-14)

## DÍA 13: TELEMETRÍA BÁSICA

(Sistema básico de tracking de eventos)

## DÍA 14: REPORTES AUTOMÁTICOS

(Estructura de reportes semanales)

---

# FASE 6: INTEGRACIÓN (Día 15)

## DÍA 15: TESTING E2E Y DEPLOY

### Objetivo

Verificar que todo funciona end-to-end, corregir bugs, preparar para deploy.

### Tareas

#### Tarea 15.1: Suite de tests E2E

- **Tipo:** Tests
- **Tests a ejecutar:**
  - Flujo completo de onboarding
  - Asignación de planificación a grupo
  - Estudiante completa actividad
  - Puntos se reflejan en casa
  - Ranking de casas actualizado

#### Tarea 15.2: Verificación de migraciones

- **Tipo:** DevOps
- **Verificar:**
  - Migraciones listas para producción
  - Seeds de casas incluidos
  - Configuración de precios con tiers

#### Tarea 15.3: Documentación actualizada

- **Tipo:** Documentación
- **Actualizar:**
  - README con nuevas features
  - API docs con nuevos endpoints
  - Variables de entorno necesarias

#### Tarea 15.4: Fix de bugs encontrados

- **Tipo:** Backend/Frontend
- **Reservar tiempo para:**
  - Bugs de integración
  - Ajustes de UI
  - Edge cases no contemplados

### Entregables del día

- [ ] Tests E2E pasando
- [ ] Migraciones verificadas
- [ ] Documentación actualizada
- [ ] Bugs críticos resueltos
- [ ] Branch lista para merge

---

# CHECKLIST GENERAL DE ENTREGABLES

## Fase 1: Fundamentos ✅

- [ ] Schema Prisma actualizado con Tiers, Casas, TestUbicacion
- [ ] TiersModule funcionando (service + controller + guard)
- [ ] CasasModule funcionando (service + controller)
- [ ] 4 Casas pobladas en BD
- [ ] Tests unitarios de servicios nuevos

## Fase 2: Gamificación ✅

- [ ] Integración Casas con sistema de puntos existente
- [ ] OnboardingModule completo (test + quiz + avatar)
- [ ] Componentes frontend (CasaCard, RankingCasas)
- [ ] Página de onboarding funcional
- [ ] Redirección automática para nuevos estudiantes

## Fase 3: Planificaciones ✅

- [ ] PlanificacionesModule backend completo
- [ ] Frontend admin conectado
- [ ] Frontend estudiante conectado
- [ ] Frontend docente conectado
- [ ] Sistema de progreso funcionando

## Fase 4: Arena ✅

- [ ] ArenaDiariaModule funcionando
- [ ] Frontend de arena diaria
- [ ] Estructura base de multijugador

## Fase 5: PRO Features ✅

- [ ] Sistema básico de telemetría
- [ ] Estructura de reportes automáticos

## Fase 6: Integración ✅

- [ ] Tests E2E pasando
- [ ] Documentación actualizada
- [ ] Branch lista para deploy

---

_Plan generado: 2025-11-26_
_Basado en: AUDITORIA_COMPLETA_2026.md_
