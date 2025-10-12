# Módulo de Autenticación - Guía de Uso

Este documento explica cómo usar el sistema de autenticación JWT con Passport en la aplicación.

## Tabla de Contenidos

1. [Guards](#guards)
2. [Decorators](#decorators)
3. [Estrategia JWT](#estrategia-jwt)
4. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Guards

### JwtAuthGuard

Protege rutas que requieren autenticación JWT. Valida el token JWT del header `Authorization: Bearer <token>`.

**Ubicación:** `guards/jwt-auth.guard.ts`

**Uso básico:**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('tutores')
export class TutoresController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return 'Dashboard protegido';
  }
}
```

### RolesGuard

Verifica que el usuario autenticado tenga los roles requeridos. Debe usarse junto con `JwtAuthGuard` y el decorator `@Roles()`.

**Ubicación:** `guards/roles.guard.ts`

**Uso con JwtAuthGuard:**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { Role } from './auth/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  getStats() {
    return 'Solo para tutores';
  }
}
```

---

## Decorators

### @GetUser()

Extrae el usuario autenticado del request (inyectado por JwtStrategy después de validar el token).

**Ubicación:** `decorators/get-user.decorator.ts`

**Uso para obtener el usuario completo:**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GetUser } from './auth/decorators/get-user.decorator';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: any) {
    return user;
  }
}
```

**Uso para obtener una propiedad específica:**

```typescript
@Get('email')
@UseGuards(JwtAuthGuard)
getEmail(@GetUser('email') email: string) {
  return { email };
}

@Get('info')
@UseGuards(JwtAuthGuard)
getInfo(
  @GetUser('id') userId: string,
  @GetUser('email') email: string,
) {
  return { userId, email };
}
```

### @Roles()

Especifica qué roles tienen acceso a un endpoint. Debe usarse junto con `JwtAuthGuard` y `RolesGuard`.

**Ubicación:** `decorators/roles.decorator.ts`

**Roles disponibles:**

```typescript
export enum Role {
  TUTOR = 'TUTOR',
  // Futuros roles:
  // ADMIN = 'ADMIN',
  // ESTUDIANTE = 'ESTUDIANTE',
}
```

**Uso:**

```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { Role } from './auth/decorators/roles.decorator';

@Get('tutores-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TUTOR)
getTutoresContent() {
  return 'Solo para tutores';
}

// Múltiples roles (OR logic)
@Get('content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TUTOR, Role.ADMIN)
getContent() {
  return 'Para tutores o admins';
}
```

---

## Estrategia JWT

### JwtStrategy

Estrategia de Passport que valida tokens JWT y carga el usuario desde la base de datos.

**Ubicación:** `strategies/jwt.strategy.ts`

**Flujo:**

1. Extrae el token JWT del header `Authorization: Bearer <token>`
2. Valida el token usando `JWT_SECRET` del `.env`
3. Decodifica el payload: `{ sub: userId, email, role }`
4. Busca el tutor en la base de datos por ID
5. Inyecta el objeto tutor completo en `request.user`

**Payload JWT:**

```typescript
interface JwtPayload {
  sub: string; // ID del tutor
  email: string; // Email del tutor
  role: string; // Rol del usuario (ej: 'tutor')
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Ruta Pública

```typescript
@Controller('public')
export class PublicController {
  @Get('info')
  getPublicInfo() {
    return 'Esta ruta es pública';
  }
}
```

### Ejemplo 2: Ruta Protegida con JWT

```typescript
@Controller('tutores')
export class TutoresController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: any) {
    return user;
  }
}
```

### Ejemplo 3: Ruta Protegida con Roles

```typescript
@Controller('admin')
export class AdminController {
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  getDashboard(@GetUser() user: any) {
    return {
      message: 'Dashboard de tutor',
      user,
    };
  }
}
```

### Ejemplo 4: Ruta con Múltiples Decorators

```typescript
@Controller('content')
export class ContentController {
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TUTOR)
  createContent(
    @GetUser('id') tutorId: string,
    @Body() createContentDto: CreateContentDto,
  ) {
    return {
      tutorId,
      content: createContentDto,
    };
  }
}
```

---

## Variables de Entorno Requeridas

Asegúrate de tener estas variables en tu archivo `.env`:

```env
JWT_SECRET="tu-secreto-super-seguro-cambialo-en-produccion"
JWT_EXPIRATION="7d"
```

---

## Flujo de Autenticación Completo

### 1. Registro

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "tutor@example.com",
  "password": "Test1234!",
  "nombre": "Juan",
  "apellido": "Pérez"
}
```

**Respuesta:**

```json
{
  "message": "Tutor registrado exitosamente",
  "user": {
    "id": "...",
    "email": "tutor@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    ...
  }
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "tutor@example.com",
  "password": "Test1234!"
}
```

**Respuesta:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "tutor@example.com",
    ...
  }
}
```

### 3. Acceso a Ruta Protegida

```bash
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:**

```json
{
  "id": "...",
  "email": "tutor@example.com",
  "nombre": "Juan",
  "apellido": "Pérez",
  ...
}
```

---

## Notas de Seguridad

1. **Nunca** exponer `JWT_SECRET` en el código
2. **Nunca** retornar `password_hash` al frontend
3. Usar HTTPS en producción
4. Implementar refresh tokens para sesiones largas (futuro)
5. Considerar blacklist de tokens para logout (futuro)
6. Rotar `JWT_SECRET` periódicamente en producción
