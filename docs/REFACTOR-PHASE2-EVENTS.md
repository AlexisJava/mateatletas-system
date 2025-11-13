# 🔄 Fase 2.1: Resolver Dependencias Circulares con Event-Driven Architecture

**Fecha**: 2025-11-12
**Fase**: Event-Driven Architecture
**Estado**: ✅ Completado
**Versión**: 1.0

---

## 📊 Resumen Ejecutivo

Se eliminó la dependencia circular entre **AuthModule** y **GamificacionModule** implementando **Event-Driven Architecture** con `@nestjs/event-emitter`. Ahora AuthModule emite eventos de dominio que GamificacionModule escucha, logrando un desacoplamiento completo.

### Métricas de Refactorización

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Dependencias circulares** | 1 crítica | **0** | ✅ -100% |
| **forwardRef() usados** | 1 | **0** | ✅ -100% |
| **Módulos acoplados** | Auth ↔ Gamificación | **Desacoplados** | ✅ 100% |
| **Tests de eventos** | 0 | **14** | ✅ +14 |
| **Verificación madge** | No existía | **✅ 0 circulares** | ✅ Implementado |

---

## 🔍 Problema Identificado

### Dependencia Circular Detectada

**AuthModule ↔ GamificacionModule**

```typescript
// ❌ ANTES: Dependencia circular

// auth.module.ts
@Module({
  imports: [
    forwardRef(() => GamificacionModule), // ⚠️ Circular dependency!
  ],
})

// auth.service.ts
constructor(
  @Inject(forwardRef(() => LogrosService))
  private logrosService: LogrosService, // ⚠️ Direct dependency
) {}

async loginWithUsername(username: string, password: string) {
  // ...
  await this.logrosService.desbloquearLogro(
    estudiante.id,
    'PRIMER_INGRESO',
  ); // ⚠️ Tight coupling
}
```

**Problemas causados:**
- ⚠️ Riesgo de errores de inicialización circular
- ⚠️ Tests complicados (necesitan mockear módulos completos)
- ⚠️ Difícil agregar nuevos listeners sin modificar AuthModule
- ⚠️ Violación del principio de Single Responsibility
- ⚠️ Acoplamiento fuerte entre módulos

---

## ✅ Solución Implementada

### Event-Driven Architecture

Implementamos el patrón **Domain Events** usando `@nestjs/event-emitter`:

```
AuthModule                GamificacionModule
    │                           │
    │ emite evento             │ escucha evento
    │ ─────────────>           │
    │ user.registered          │ @OnEvent('user.registered')
    │ user.logged-in           │ @OnEvent('user.logged-in')
    │ estudiante.primer-login  │ @OnEvent('estudiante.primer-login')
    │                           │
    └─────────────────────────┘
         Sin imports directos!
```

**Beneficios:**
- ✅ Cero dependencias circulares
- ✅ Módulos desacoplados (pueden evolucionar independientemente)
- ✅ Fácil agregar nuevos listeners sin tocar AuthModule
- ✅ Tests más simples (mockear eventos es más fácil)
- ✅ Cumple Single Responsibility Principle

---

## 🛠️ Implementación Detallada

### 1. Instalación de @nestjs/event-emitter

```bash
yarn workspace api add @nestjs/event-emitter
```

**Resultado:**
```json
// apps/api/package.json
{
  "dependencies": {
    "@nestjs/event-emitter": "^3.0.1"
  }
}
```

---

### 2. Configuración de EventEmitterModule

**Archivo**: [apps/api/src/app.module.ts:49-60](apps/api/src/app.module.ts#L49-L60)

```typescript
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // Event Emitter: Sistema de eventos para desacoplar módulos
    // - Permite comunicación async entre módulos sin dependencias circulares
    // - Usado para resolver Auth ↔ Gamificación circular dependency
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    // ...otros módulos
  ],
})
export class AppModule {}
```

**Configuración:**
- `wildcard: false` - No usar patrones tipo `user.*` (mayor performance)
- `delimiter: '.'` - Separador para nombres de eventos (`user.logged-in`)
- `maxListeners: 10` - Límite de listeners por evento (previene memory leaks)
- `ignoreErrors: false` - Propagar errores en listeners (mejor debugging)

---

### 3. Creación de Domain Events

**Archivo**: [apps/api/src/common/events/domain-events.ts](apps/api/src/common/events/domain-events.ts)

Se crearon 8 eventos de dominio:

#### UserRegisteredEvent
```typescript
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly userType: 'tutor' | 'docente' | 'admin',
    public readonly email: string,
    public readonly nombre: string,
    public readonly apellido: string,
  ) {}
}
```

**Se emite cuando**: Un tutor/docente/admin se registra exitosamente.
**Listeners**: GamificacionModule (futuro: asignar casa, otorgar logro de bienvenida).

---

#### UserLoggedInEvent
```typescript
export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly userType: 'tutor' | 'docente' | 'admin' | 'estudiante',
    public readonly email: string,
    public readonly esPrimerLogin: boolean,
  ) {}
}
```

**Se emite cuando**: Un usuario hace login exitosamente.
**Listeners**: GamificacionModule (futuro: otorgar XP por login diario, actualizar racha).

---

#### EstudiantePrimerLoginEvent
```typescript
export class EstudiantePrimerLoginEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly username: string,
  ) {}
}
```

**Se emite cuando**: Un estudiante hace su primer login (detectado por no tener logros desbloqueados).
**Listeners**: GamificacionModule → otorga logro "PRIMER_INGRESO".

---

**Otros eventos creados** (para futuro uso):
- `EstudianteActividadCompletadaEvent` - Cuando completa quiz/ejercicio/lección
- `XpGainedEvent` - Cuando recibe XP
- `EstudianteNivelUpEvent` - Cuando sube de nivel
- `LogroDesbloqueadoEvent` - Cuando desbloquea un logro
- `PasswordChangedEvent` - Cuando cambia su contraseña

---

### 4. Refactorización de AuthService

**Archivo**: [apps/api/src/auth/auth.service.ts](apps/api/src/auth/auth.service.ts)

#### Cambio 1: Eliminar imports circulares

**ANTES:**
```typescript
import { Inject, forwardRef } from '@nestjs/common';
import { LogrosService } from '../gamificacion/services/logros.service';

constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
  @Inject(forwardRef(() => LogrosService))
  private logrosService: LogrosService, // ⚠️ Dependencia circular
) {}
```

**DESPUÉS:**
```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstudiantePrimerLoginEvent, UserLoggedInEvent, UserRegisteredEvent } from '../common/events';

constructor(
  private prisma: PrismaService,
  private jwtService: JwtService,
  private eventEmitter: EventEmitter2, // ✅ Sin circular dependency
) {}
```

---

#### Cambio 2: Emitir eventos en register()

**Archivo**: [apps/api/src/auth/auth.service.ts:98-111](apps/api/src/auth/auth.service.ts#L98-L111)

```typescript
async register(registerDto: RegisterDto) {
  // ... crear tutor en BD ...

  // 4. Emitir evento de registro exitoso
  // Este evento será escuchado por GamificacionModule para asignar casa y logros
  this.eventEmitter.emit(
    'user.registered',
    new UserRegisteredEvent(
      tutor.id,
      'tutor',
      tutor.email,
      tutor.nombre,
      tutor.apellido,
    ),
  );

  this.logger.log(`Tutor registrado exitosamente: ${tutor.id} (${tutor.email})`);

  return { message: 'Tutor registrado exitosamente', user: { ...tutor, role: Role.Tutor } };
}
```

---

#### Cambio 3: Emitir eventos en login()

**Archivo**: [apps/api/src/auth/auth.service.ts:254-264](apps/api/src/auth/auth.service.ts#L254-L264)

```typescript
async login(loginDto: LoginDto) {
  // ... validar credenciales ...

  // 7. Emitir evento de login exitoso
  const userType = isTutorUser(user) ? 'tutor' : isDocenteUser(user) ? 'docente' : 'admin';
  this.eventEmitter.emit(
    'user.logged-in',
    new UserLoggedInEvent(
      user.id,
      userType,
      user.email,
      false, // Los tutores/docentes/admins no tienen "primer login"
    ),
  );

  // ... generar JWT y retornar ...
}
```

---

#### Cambio 4: Emitir eventos en loginWithUsername()

**Archivo**: [apps/api/src/auth/auth.service.ts:637-667](apps/api/src/auth/auth.service.ts#L637-L667)

**ANTES:**
```typescript
// Otorgar logro de primer ingreso
if (esPrimerLogin) {
  try {
    await this.logrosService.desbloquearLogro( // ⚠️ Acoplamiento directo
      estudiante.id,
      'PRIMER_INGRESO',
    );
    this.logger.log(`Logro PRIMER_INGRESO otorgado a estudiante ${estudiante.id}`);
  } catch (error) {
    this.logger.error(`Error al otorgar logro PRIMER_INGRESO: ${error}`);
  }
}
```

**DESPUÉS:**
```typescript
// Verificar si es el primer login (no tiene logros desbloqueados)
const logrosDesbloqueados = await this.prisma.logroEstudiante.count({
  where: { estudiante_id: estudiante.id },
});

const esPrimerLogin = logrosDesbloqueados === 0;

// Emitir evento de login de estudiante
this.eventEmitter.emit(
  'estudiante.logged-in',
  new UserLoggedInEvent(
    estudiante.id,
    'estudiante',
    estudiante.email || estudiante.username || '',
    esPrimerLogin,
  ),
);

// Emitir evento específico de primer login si aplica
if (esPrimerLogin) {
  this.eventEmitter.emit(
    'estudiante.primer-login',
    new EstudiantePrimerLoginEvent(
      estudiante.id,
      estudiante.username || estudiante.id,
    ),
  );
  this.logger.log(`Primer login detectado para estudiante ${estudiante.id}`);
}
```

---

### 5. Creación de AuthEventsListener

**Archivo**: [apps/api/src/gamificacion/listeners/auth-events.listener.ts](apps/api/src/gamificacion/listeners/auth-events.listener.ts)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  EstudiantePrimerLoginEvent,
} from '../../common/events';
import { LogrosService } from '../services/logros.service';

@Injectable()
export class AuthEventsListener {
  private readonly logger = new Logger(AuthEventsListener.name);

  constructor(private readonly logrosService: LogrosService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(
      `Usuario registrado: ${event.userId} (${event.userType}) - ${event.email}`,
    );
    // TODO: Implementar lógica de bienvenida para tutores
  }

  @OnEvent('user.logged-in')
  async handleUserLoggedIn(event: UserLoggedInEvent) {
    this.logger.log(
      `Usuario ${event.userType} hizo login: ${event.userId} (${event.email})`,
    );

    // Solo ejecutar lógica de gamificación para estudiantes
    if (event.userType !== 'estudiante') {
      return;
    }

    // TODO: Implementar lógica de login diario (XP, racha, logros)
  }

  @OnEvent('estudiante.primer-login')
  async handleEstudiantePrimerLogin(event: EstudiantePrimerLoginEvent) {
    this.logger.log(
      `Primer login detectado para estudiante: ${event.estudianteId} (${event.username})`,
    );

    try {
      await this.logrosService.desbloquearLogro(
        event.estudianteId,
        'PRIMER_INGRESO',
      );
      this.logger.log(
        `Logro PRIMER_INGRESO otorgado a estudiante ${event.estudianteId}`,
      );
    } catch (error) {
      // Log del error pero no fallar la operación de login
      this.logger.error(
        `Error al otorgar logro PRIMER_INGRESO a estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
```

**Beneficios del Listener:**
- ✅ GamificacionModule escucha eventos sin que AuthModule lo sepa
- ✅ Fácil agregar más listeners sin modificar AuthModule
- ✅ Errores en gamificación no afectan el login (try-catch)
- ✅ Logging estructurado para debugging

---

### 6. Registro del Listener en GamificacionModule

**Archivo**: [apps/api/src/gamificacion/gamificacion.module.ts](apps/api/src/gamificacion/gamificacion.module.ts)

```typescript
import { Module } from '@nestjs/common';
import { AuthEventsListener } from './listeners/auth-events.listener';
// ... otros imports

@Module({
  controllers: [LogrosController, RecursosController, TiendaController],
  providers: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    TiendaService,
    PrismaService,
    // Event Listeners
    AuthEventsListener, // ✅ Registrado como provider
  ],
  exports: [
    LogrosService,
    RecursosService,
    RachaService,
    VerificadorLogrosService,
    TiendaService,
  ],
})
export class GamificacionModule {}
```

---

### 7. Eliminación de Dependencia Circular en AuthModule

**Archivo**: [apps/api/src/auth/auth.module.ts](apps/api/src/auth/auth.module.ts)

**ANTES:**
```typescript
import { Module, forwardRef } from '@nestjs/common'; // ⚠️
import { GamificacionModule } from '../gamificacion/gamificacion.module'; // ⚠️

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => GamificacionModule), // ⚠️ Circular dependency!
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ /* ... */ }),
  ],
  // ...
})
export class AuthModule {}
```

**DESPUÉS:**
```typescript
import { Module } from '@nestjs/common'; // ✅ No más forwardRef

@Module({
  imports: [
    DatabaseModule,
    // ✅ GamificacionModule YA NO está importado!
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ /* ... */ }),
  ],
  // ...
})
export class AuthModule {}
```

**Comentarios agregados:**
```typescript
/**
 * Dependencias circulares resueltas:
 * - AuthModule ya NO importa GamificacionModule
 * - En su lugar, AuthService emite eventos que GamificacionModule escucha
 * - Ver: src/gamificacion/listeners/auth-events.listener.ts
 */
```

---

## 🧪 Tests Implementados

### Tests de AuthEventsListener

**Archivo**: [apps/api/src/gamificacion/listeners/__tests__/auth-events.listener.spec.ts](apps/api/src/gamificacion/listeners/__tests__/auth-events.listener.spec.ts)

Se crearon **14 tests** cubriendo:

#### 1. Tests de `handleUserRegistered` (3 tests)
```typescript
✓ debe loggear el evento de registro de tutor
✓ debe loggear el evento de registro de docente
✓ debe loggear el evento de registro de admin
```

#### 2. Tests de `handleUserLoggedIn` (5 tests)
```typescript
✓ debe loggear login de tutor sin ejecutar gamificación
✓ debe loggear login de docente sin ejecutar gamificación
✓ debe loggear login de admin sin ejecutar gamificación
✓ debe loggear login de estudiante
✓ debe loggear primer login de estudiante
```

#### 3. Tests de `handleEstudiantePrimerLogin` (3 tests)
```typescript
✓ debe otorgar logro PRIMER_INGRESO en primer login
✓ debe loggear error si falla desbloquear logro pero no debe fallar
✓ debe loggear error incluso si el error no es una instancia de Error
```

#### 4. Integration scenarios (3 tests)
```typescript
✓ debe manejar múltiples eventos de registro en secuencia
✓ debe manejar múltiples eventos de login en secuencia
✓ debe manejar evento de primer login seguido de login normal
```

---

### Resultado de Tests

```bash
npm test -- auth-events.listener.spec.ts

PASS src/gamificacion/listeners/__tests__/auth-events.listener.spec.ts
  AuthEventsListener
    handleUserRegistered
      ✓ debe loggear el evento de registro de tutor (16 ms)
      ✓ debe loggear el evento de registro de docente (3 ms)
      ✓ debe loggear el evento de registro de admin (3 ms)
    handleUserLoggedIn
      ✓ debe loggear login de tutor sin ejecutar gamificación (2 ms)
      ✓ debe loggear login de docente sin ejecutar gamificación (2 ms)
      ✓ debe loggear login de admin sin ejecutar gamificación (2 ms)
      ✓ debe loggear login de estudiante (2 ms)
      ✓ debe loggear primer login de estudiante (2 ms)
    handleEstudiantePrimerLogin
      ✓ debe otorgar logro PRIMER_INGRESO en primer login (3 ms)
      ✓ debe loggear error si falla desbloquear logro pero no debe fallar (11 ms)
      ✓ debe loggear error incluso si el error no es una instancia de Error (1 ms)
    Integration scenarios
      ✓ debe manejar múltiples eventos de registro en secuencia (2 ms)
      ✓ debe manejar múltiples eventos de login en secuencia (1 ms)
      ✓ debe manejar evento de primer login seguido de login normal (2 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        1.184 s
```

**✅ 14/14 tests pasando (100% success rate)**

---

## 🔍 Verificación con Madge

### Instalación de Madge

```bash
yarn workspace api add -D madge
```

**Resultado:**
```json
// apps/api/package.json
{
  "devDependencies": {
    "madge": "^8.0.0"
  }
}
```

---

### Ejecución de Análisis

```bash
npx madge --circular --extensions ts src/
```

**Resultado:**
```
Processed 322 files (4.2s) (2 warnings)
- Finding files
✔ No circular dependency found!
```

**✅ 0 dependencias circulares detectadas** (antes teníamos 1 crítica)

---

## 📋 Archivos Creados

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `src/common/events/domain-events.ts` | Definición de 8 eventos de dominio | 161 |
| `src/common/events/index.ts` | Barrel file para exports | 7 |
| `src/gamificacion/listeners/auth-events.listener.ts` | Listener de eventos de auth | 115 |
| `src/gamificacion/listeners/__tests__/auth-events.listener.spec.ts` | Tests del listener (14 tests) | 351 |
| `docs/REFACTOR-PHASE2-EVENTS.md` | Esta documentación | 1000+ |

**Total**: 5 archivos nuevos, ~1634 líneas de código

---

## 📋 Archivos Modificados

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `apps/api/package.json` | + @nestjs/event-emitter, + madge | 2 |
| `src/app.module.ts` | + EventEmitterModule.forRoot() | +13 |
| `src/auth/auth.service.ts` | - LogrosService, + EventEmitter2, + emit() calls | -8 / +42 |
| `src/auth/auth.module.ts` | - forwardRef, - GamificacionModule import | -3 |
| `src/gamificacion/gamificacion.module.ts` | + AuthEventsListener provider | +2 |

**Total**: 5 archivos modificados, ~46 líneas modificadas

---

## 🎯 Impacto

### Beneficios Inmediatos

1. **Cero Dependencias Circulares**: AuthModule y GamificacionModule ya no se conocen entre sí
2. **Tests Más Simples**: 14 nuevos tests cubriendo event listeners
3. **Código Más Limpio**: No más `forwardRef()` ni `@Inject(forwardRef())`
4. **Mejor Logging**: Logs estructurados en listeners

### Beneficios a Largo Plazo

1. **Escalabilidad**: Fácil agregar nuevos listeners sin modificar AuthModule
   - Ejemplo: NotificacionesModule puede escuchar `user.registered` para enviar emails de bienvenida
   - Ejemplo: AnalyticsModule puede escuchar `user.logged-in` para tracking

2. **Maintainability**: Módulos desacoplados (pueden evolucionar independientemente)
   - AuthModule puede cambiar sin afectar GamificacionModule
   - GamificacionModule puede cambiar sin afectar AuthModule

3. **Testability**: Mockear eventos es más fácil que mockear servicios
   ```typescript
   // Fácil de testear
   await authService.login(loginDto); // Emite evento
   expect(eventEmitter.emit).toHaveBeenCalledWith('user.logged-in', ...);
   ```

4. **Single Responsibility**: Cada módulo tiene una responsabilidad clara
   - AuthModule: Autenticación y autorización
   - GamificacionModule: Lógica de gamificación
   - EventEmitterModule: Comunicación entre módulos

---

## 🚀 Recomendaciones Post-Implementación

### 1. Agregar Más Listeners

**NotificacionesModule** puede escuchar eventos de auth:

```typescript
// src/notificaciones/listeners/auth-events.listener.ts
@Injectable()
export class AuthNotificacionesListener {
  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent) {
    // Enviar email de bienvenida
    await this.emailService.sendWelcomeEmail(event.email, event.nombre);
  }

  @OnEvent('password.changed')
  async handlePasswordChanged(event: PasswordChangedEvent) {
    // Enviar email de confirmación de cambio de contraseña
    await this.emailService.sendPasswordChangedEmail(event.email);
  }
}
```

---

### 2. Implementar Lógica de Login Diario

En `AuthEventsListener.handleUserLoggedIn()`:

```typescript
@OnEvent('user.logged-in')
async handleUserLoggedIn(event: UserLoggedInEvent) {
  if (event.userType !== 'estudiante') {
    return;
  }

  // Verificar si es el primer login del día
  const ultimoLogin = await this.prisma.loginLog.findFirst({
    where: {
      estudiante_id: event.userId,
      fecha: { gte: startOfDay(new Date()) }
    },
  });

  if (!ultimoLogin) {
    // Otorgar XP por login diario
    await this.recursosService.agregarXp(event.userId, 10, 'Login diario');

    // Actualizar racha
    await this.rachaService.actualizarRacha(event.userId);

    // Verificar logros de racha
    await this.verificadorLogrosService.verificarLogrosRacha(event.userId);
  }
}
```

---

### 3. Event Replay para Testing

Implementar un sistema de replay de eventos para testing E2E:

```typescript
// test/helpers/event-recorder.ts
export class EventRecorder {
  private events: Array<{ name: string; payload: unknown }> = [];

  @OnEvent('**') // Escuchar TODOS los eventos
  recordEvent(name: string, payload: unknown) {
    this.events.push({ name, payload });
  }

  getEvents() {
    return this.events;
  }

  reset() {
    this.events = [];
  }
}

// Uso en tests E2E
const recorder = app.get(EventRecorder);
await authService.login(loginDto);

expect(recorder.getEvents()).toContainEqual({
  name: 'user.logged-in',
  payload: expect.objectContaining({ userId: 'test-user-id' }),
});
```

---

### 4. Event Sourcing (Futuro)

Considerar implementar **Event Sourcing** para auditoría completa:

```typescript
// src/common/event-store/event-store.service.ts
@Injectable()
export class EventStoreService {
  @OnEvent('**', { async: true })
  async storeEvent(name: string, payload: unknown) {
    await this.prisma.eventLog.create({
      data: {
        event_name: name,
        payload: JSON.stringify(payload),
        timestamp: new Date(),
      },
    });
  }
}
```

**Beneficios:**
- Auditoría completa de todos los eventos
- Replay de eventos históricos
- Debugging de producción
- Analytics avanzados

---

### 5. Monitoreo de Performance

Agregar métricas de eventos:

```typescript
@Injectable()
export class EventMetricsInterceptor {
  @OnEvent('**')
  async recordMetrics(name: string, payload: unknown) {
    const start = Date.now();

    // Esperar a que todos los listeners terminen
    await new Promise(resolve => setTimeout(resolve, 100));

    const duration = Date.now() - start;

    // Registrar en sistema de métricas (ej: Datadog, Prometheus)
    this.metricsService.recordEvent(name, duration);
  }
}
```

---

## 📊 Métricas Finales

| Métrica | Valor |
|---------|-------|
| **Dependencias circulares eliminadas** | 1 → 0 ✅ |
| **forwardRef() eliminados** | 1 → 0 ✅ |
| **Eventos de dominio creados** | 8 |
| **Event Listeners creados** | 1 (3 handlers) |
| **Tests de eventos** | 14 ✅ |
| **Archivos nuevos** | 5 |
| **Archivos modificados** | 5 |
| **Verificación madge** | ✅ 0 circulares |
| **Build exitoso** | ✅ |

---

## ✅ Checklist Final

- [x] Instalado @nestjs/event-emitter
- [x] Configurado EventEmitterModule en AppModule
- [x] Analizadas dependencias circulares Auth ↔ Gamificación
- [x] Creados 8 domain events
- [x] Refactorizado AuthService para emitir eventos
- [x] Creado AuthEventsListener en GamificacionModule
- [x] Eliminado forwardRef() de AuthModule
- [x] Eliminado import de GamificacionModule de AuthModule
- [x] Creados 14 tests para event listeners
- [x] Instalado madge para detección de circulares
- [x] Verificado 0 dependencias circulares con madge
- [x] Documentación completa creada

---

## 🎓 Guidelines para el Equipo

### ❌ NO Hacer

```typescript
// ❌ NO importar módulos con lógica de negocio directamente
import { GamificacionModule } from '../gamificacion/gamificacion.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [GamificacionModule, NotificacionesModule], // ⚠️ Riesgo de circular
})

// ❌ NO usar forwardRef() (indica problema de diseño)
@Module({
  imports: [forwardRef(() => OtroModule)], // ⚠️ Code smell
})

// ❌ NO llamar servicios de otros módulos directamente
constructor(
  @Inject(forwardRef(() => OtroService))
  private otroService: OtroService, // ⚠️ Acoplamiento
) {}
```

---

### ✅ SÍ Hacer

```typescript
// ✅ Emitir eventos de dominio
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MiService {
  constructor(private eventEmitter: EventEmitter2) {}

  async hacerAlgo() {
    // ... lógica de negocio ...

    // Emitir evento
    this.eventEmitter.emit(
      'algo.sucedio',
      new AlgoSucedioEvent(data),
    );
  }
}

// ✅ Escuchar eventos con @OnEvent
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MiListener {
  @OnEvent('algo.sucedio')
  async handleAlgoSucedio(event: AlgoSucedioEvent) {
    // Lógica de reacción al evento
  }
}

// ✅ Crear eventos de dominio con clases
export class AlgoSucedioEvent {
  constructor(
    public readonly id: string,
    public readonly data: unknown,
  ) {}
}
```

---

### Cuándo Usar Eventos vs. Imports Directos

| Escenario | Usar Eventos | Usar Import Directo |
|-----------|--------------|---------------------|
| **Módulos de diferente dominio** | ✅ Sí | ❌ No |
| **Lógica asíncrona opcional** | ✅ Sí | ❌ No |
| **Múltiples consumidores** | ✅ Sí | ⚠️ Depende |
| **Auditoría/Logging** | ✅ Sí | ❌ No |
| **Utilities/Helpers** | ❌ No | ✅ Sí |
| **Database/Config** | ❌ No | ✅ Sí |
| **Guards/Interceptors** | ❌ No | ✅ Sí |

---

### Naming Conventions para Eventos

```typescript
// ✅ BUENO: Verbos en pasado (algo YA sucedió)
UserRegisteredEvent
UserLoggedInEvent
EstudiantePrimerLoginEvent
XpGainedEvent
LogroDesbloqueadoEvent

// ❌ MALO: Verbos en presente/futuro
UserRegisteringEvent // ⚠️ No, usar pasado
UserWillLoginEvent   // ⚠️ No, usar pasado
GainXpEvent          // ⚠️ No, usar pasado

// ✅ BUENO: Nombres descriptivos
EstudianteActividadCompletadaEvent

// ❌ MALO: Nombres genéricos
DataChangedEvent // ⚠️ Muy genérico
UpdateEvent      // ⚠️ Muy genérico
```

---

**Última actualización**: 2025-11-12
**Próxima revisión**: Mensual
**Responsable**: Equipo Backend Mateatletas
