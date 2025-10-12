# 🏗️ Arquitectura Fase 1 - Sistema de Autenticación

**Versión**: 1.0
**Fecha**: 2025-10-12
**Estado**: Implementado y Funcional

---

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MATEATLETAS ECOSYSTEM                          │
│                          (Turborepo Monorepo)                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐    ┌────────────────────────────────┐
│         FRONTEND (Next.js)        │    │      BACKEND (NestJS)          │
│      apps/web (Port 3000)         │    │    apps/api (Port 3001)        │
└──────────────────────────────────┘    └────────────────────────────────┘
           │                                         │
           │                                         │
           ▼                                         ▼
┌──────────────────────────────────┐    ┌────────────────────────────────┐
│       React Components            │    │       Auth Module              │
│  ┌──────────────────────────┐    │    │  ┌──────────────────────┐     │
│  │ pages/                   │    │    │  │ auth.controller.ts   │     │
│  │  - /showcase             │    │    │  │  POST /register      │     │
│  │  - /login (TODO)         │    │    │  │  POST /login         │     │
│  │  - /register (TODO)      │    │    │  │  GET  /profile 🔒    │     │
│  │  - /dashboard (TODO)     │    │    │  │  POST /logout 🔒     │     │
│  └──────────────────────────┘    │    │  └──────────────────────┘     │
│                                   │    │           │                    │
│  ┌──────────────────────────┐    │    │           ▼                    │
│  │ components/ui/           │    │    │  ┌──────────────────────┐     │
│  │  - Button.tsx            │    │    │  │ auth.service.ts      │     │
│  │  - Input.tsx             │    │    │  │  - register()        │     │
│  │  - Card.tsx              │    │    │  │  - login()           │     │
│  │  - ComponentShowcase     │    │    │  │  - validateUser()    │     │
│  └──────────────────────────┘    │    │  │  - getProfile()      │     │
│                                   │    │  └──────────────────────┘     │
│           │                       │    │           │                    │
│           ▼                       │    │           ▼                    │
│  ┌──────────────────────────┐    │    │  ┌──────────────────────┐     │
│  │ store/auth.store.ts      │    │    │  │ strategies/          │     │
│  │ (Zustand)                │    │    │  │  - jwt.strategy.ts   │     │
│  │  - user                  │    │    │  └──────────────────────┘     │
│  │  - token                 │    │    │           │                    │
│  │  - isAuthenticated       │    │    │           ▼                    │
│  │  - login()               │    │    │  ┌──────────────────────┐     │
│  │  - logout()              │    │    │  │ guards/              │     │
│  │  - register()            │    │    │  │  - jwt-auth.guard.ts │     │
│  └──────────────────────────┘    │    │  │  - roles.guard.ts    │     │
│           │                       │    │  └──────────────────────┘     │
│           │                       │    │           │                    │
│           ▼                       │    │           ▼                    │
│  ┌──────────────────────────┐    │    │  ┌──────────────────────┐     │
│  │ lib/axios.ts             │    │    │  │ dto/                 │     │
│  │  - Request Interceptor   │───HTTP──▶│  │  - register.dto.ts   │     │
│  │    (auto-attach JWT)     │    │    │  │  - login.dto.ts      │     │
│  │  - Response Interceptor  │◀───────│  └──────────────────────┘     │
│  │    (handle 401)          │    │    │                                │
│  └──────────────────────────┘    │    └────────────────────────────────┘
│           │                       │                 │
│           ▼                       │                 │
│  ┌──────────────────────────┐    │                 ▼
│  │ lib/api/auth.api.ts      │    │    ┌────────────────────────────────┐
│  │  - register()            │    │    │      Prisma ORM                │
│  │  - login()               │    │    │                                │
│  │  - getProfile()          │    │    │  model Tutor {                 │
│  │  - logout()              │    │    │    id String @id @default(...) │
│  └──────────────────────────┘    │    │    email String @unique        │
│                                   │    │    password_hash String        │
│  ┌──────────────────────────┐    │    │    nombre String               │
│  │ localStorage             │    │    │    apellido String             │
│  │  - auth-storage          │    │    │    ... (otros campos)          │
│  │    { user, token }       │    │    │  }                             │
│  └──────────────────────────┘    │    └────────────────────────────────┘
│                                   │                 │
└──────────────────────────────────┘                 │
                                                      ▼
                                         ┌────────────────────────────────┐
                                         │   PostgreSQL Database          │
                                         │   (Docker Container)           │
                                         │                                │
                                         │   Table: tutores               │
                                         │   - id (PK)                    │
                                         │   - email (UNIQUE)             │
                                         │   - password_hash              │
                                         │   - nombre                     │
                                         │   - apellido                   │
                                         │   - dni                        │
                                         │   - telefono                   │
                                         │   - fecha_registro             │
                                         │   - ha_completado_onboarding   │
                                         │   - createdAt, updatedAt       │
                                         └────────────────────────────────┘
```

---

## 🔄 Flujo de Autenticación

### 1. Registro de Usuario

```
Usuario            Frontend                    Backend                Database
  │                   │                          │                        │
  │── Completa ──────▶│                          │                        │
  │   formulario      │                          │                        │
  │                   │                          │                        │
  │                   │── POST /register ───────▶│                        │
  │                   │   {email, password,      │                        │
  │                   │    nombre, apellido}     │                        │
  │                   │                          │                        │
  │                   │                          │── Validate DTO ───────▶│
  │                   │                          │                        │
  │                   │                          │── Check unique email ─▶│
  │                   │                          │◀─── Result ────────────│
  │                   │                          │                        │
  │                   │                          │── Hash password ───────│
  │                   │                          │   (bcrypt 10 rounds)   │
  │                   │                          │                        │
  │                   │                          │── INSERT tutor ───────▶│
  │                   │                          │◀─── tutor data ────────│
  │                   │                          │                        │
  │                   │◀── 201 Created ──────────│                        │
  │                   │   {user}                 │                        │
  │                   │                          │                        │
  │                   │── Auto-login ────────────▶                        │
  │                   │   (internal call)        │                        │
  │                   │                          │                        │
  │◀── Redirect ──────│                          │                        │
  │   to dashboard    │                          │                        │
```

### 2. Login de Usuario

```
Usuario            Frontend                    Backend                Database
  │                   │                          │                        │
  │── Ingresa ───────▶│                          │                        │
  │   credenciales    │                          │                        │
  │                   │                          │                        │
  │                   │── POST /login ──────────▶│                        │
  │                   │   {email, password}      │                        │
  │                   │                          │                        │
  │                   │                          │── Validate DTO ────────│
  │                   │                          │                        │
  │                   │                          │── Find by email ──────▶│
  │                   │                          │◀─── tutor + hash ──────│
  │                   │                          │                        │
  │                   │                          │── Compare password ────│
  │                   │                          │   bcrypt.compare()     │
  │                   │                          │                        │
  │                   │                          │── Generate JWT ────────│
  │                   │                          │   sign({sub, email,    │
  │                   │                          │         role})         │
  │                   │                          │                        │
  │                   │◀── 200 OK ───────────────│                        │
  │                   │   {access_token, user}   │                        │
  │                   │                          │                        │
  │                   │── Save to Store ─────────│                        │
  │                   │   zustand.setUser()      │                        │
  │                   │                          │                        │
  │                   │── Save to localStorage ──│                        │
  │                   │   key: "auth-storage"    │                        │
  │                   │                          │                        │
  │◀── Redirect ──────│                          │                        │
  │   to dashboard    │                          │                        │
```

### 3. Petición Autenticada

```
Usuario            Frontend                    Backend                Database
  │                   │                          │                        │
  │── Accede a ──────▶│                          │                        │
  │   recurso 🔒      │                          │                        │
  │                   │                          │                        │
  │                   │── GET /profile ─────────▶│                        │
  │                   │   Header: Authorization  │                        │
  │                   │   Bearer <JWT_TOKEN>     │                        │
  │                   │                          │                        │
  │                   │                          │── JwtAuthGuard ────────│
  │                   │                          │   canActivate()        │
  │                   │                          │                        │
  │                   │                          │── JwtStrategy ─────────│
  │                   │                          │   validate(payload)    │
  │                   │                          │                        │
  │                   │                          │── Find user by ID ────▶│
  │                   │                          │◀─── user data ─────────│
  │                   │                          │                        │
  │                   │                          │── Inject to request ───│
  │                   │                          │   req.user = tutor     │
  │                   │                          │                        │
  │                   │                          │── Controller method ───│
  │                   │                          │   getProfile()         │
  │                   │                          │                        │
  │                   │◀── 200 OK ───────────────│                        │
  │                   │   {user}                 │                        │
  │                   │                          │                        │
  │◀── Muestra ───────│                          │                        │
  │   perfil          │                          │                        │
```

### 4. Token Inválido/Expirado

```
Usuario            Frontend                    Backend
  │                   │                          │
  │── Request ───────▶│                          │
  │                   │                          │
  │                   │── GET /profile ─────────▶│
  │                   │   Bearer <INVALID_TOKEN> │
  │                   │                          │
  │                   │                          │── JwtAuthGuard ────────│
  │                   │                          │   Token validation ❌  │
  │                   │                          │                        │
  │                   │◀── 401 Unauthorized ─────│
  │                   │                          │
  │                   │── Response Interceptor ──│
  │                   │   if (status === 401)    │
  │                   │                          │
  │                   │── Clear localStorage ────│
  │                   │   remove("auth-token")   │
  │                   │                          │
  │                   │── Clear Store ───────────│
  │                   │   zustand.logout()       │
  │                   │                          │
  │                   │── Redirect to /login ────│
  │                   │                          │
  │◀── Redirect ──────│                          │
  │   to login        │                          │
```

### 5. Logout

```
Usuario            Frontend                    Backend
  │                   │                          │
  │── Click ─────────▶│                          │
  │   "Logout"        │                          │
  │                   │                          │
  │                   │── POST /logout ─────────▶│
  │                   │   Bearer <JWT_TOKEN>     │
  │                   │                          │
  │                   │◀── 200 OK ───────────────│
  │                   │                          │
  │                   │── Clear localStorage ────│
  │                   │   remove("auth-storage") │
  │                   │                          │
  │                   │── Clear Store ───────────│
  │                   │   zustand.logout()       │
  │                   │   {user: null,           │
  │                   │    token: null,          │
  │                   │    isAuthenticated: false}
  │                   │                          │
  │                   │── Redirect to /login ────│
  │                   │                          │
  │◀── Redirect ──────│                          │
  │   to login        │                          │
```

---

## 🔒 Capa de Seguridad

### Backend

```
Request → JwtAuthGuard → JwtStrategy → Controller
              │              │              │
              │              │              ▼
              │              │         @GetUser()
              │              │         decorator
              │              │              │
              │              ▼              ▼
              │        Validate Token   req.user
              │        Extract Payload
              │        Load User from DB
              │              │
              ▼              ▼
         if valid      inject user
           ✅              │
         else             ▼
          401 ❌     Continue to handler
```

### Password Security

```
Registration Flow:
  Plain Password ──▶ bcrypt.hash(pwd, 10) ──▶ password_hash ──▶ Database
                     (10 rounds = 2^10       (stored)
                      iterations)

Login Flow:
  Plain Password ──┐
                   │
  password_hash ───┼──▶ bcrypt.compare() ──▶ boolean
  (from DB)        │    (timing-safe)        (valid/invalid)
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "cm3gnrzk93000xwjhmi1lx8az",  // Tutor ID (cuid)
    "email": "juan.perez@example.com",
    "role": "tutor",
    "iat": 1760277866,                    // Issued At
    "exp": 1760882666                     // Expires (7 days)
  },
  "signature": "HMACSHA256(...)"           // Signed with JWT_SECRET
}
```

---

## 📦 Estructura de Datos

### Database Schema (Prisma)

```prisma
model Tutor {
  id                         String   @id @default(cuid())
  email                      String   @unique
  password_hash              String   // bcrypt hash, never exposed
  nombre                     String
  apellido                   String
  dni                        String?
  telefono                   String?
  fecha_registro             DateTime @default(now())
  ha_completado_onboarding   Boolean  @default(false)
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt

  @@map("tutores")
}
```

### Frontend Types

```typescript
// User in Store
interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
  fecha_registro: string;
  ha_completado_onboarding: boolean;
}

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}
```

### API Responses

```typescript
// POST /auth/register
{
  "message": "Tutor registrado exitosamente",
  "user": {
    "id": "...",
    "email": "...",
    "nombre": "...",
    "apellido": "...",
    // ... (sin password_hash)
  }
}

// POST /auth/login
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": {
    "id": "...",
    "email": "...",
    // ... (sin password_hash)
  }
}

// GET /auth/profile
{
  "id": "...",
  "email": "...",
  // ... (sin password_hash)
}
```

---

## 🎨 Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary: #ff6b35;        /* Naranja vibrante - CTA principal */
  --color-secondary: #f7b801;      /* Amarillo dorado - CTA secundario */
  --color-accent: #00d9ff;         /* Cyan brillante - Focus, links */

  /* Semantic Colors */
  --color-success: #4caf50;        /* Verde - Success messages */
  --color-danger: #f44336;         /* Rojo - Errors, delete */

  /* Neutral Colors */
  --color-dark: #2a1a5e;           /* Morado oscuro - Texto principal */
  --color-light: #fff9e6;          /* Beige claro - Backgrounds */
}
```

### Component Variants

```typescript
// Button Variants
primary    → bg-[#ff6b35] hover:scale-105
secondary  → bg-[#f7b801] hover:scale-105
outline    → border-[#ff6b35] hover:bg-[#ff6b35]
ghost      → text-[#ff6b35] hover:bg-[#ff6b35]/10

// Button Sizes
sm  → px-4 py-2 text-sm
md  → px-6 py-3 text-base
lg  → px-8 py-4 text-lg

// Input States
default → border-gray-300
focus   → border-[#00d9ff] ring-[#00d9ff]
error   → border-red-500 text-red-600
disabled → bg-gray-100 cursor-not-allowed
```

---

## 🔌 API Endpoints

### Authentication

| Método | Endpoint           | Auth | Descripción                |
|--------|-------------------|------|----------------------------|
| POST   | `/auth/register`  | ❌   | Registrar nuevo tutor      |
| POST   | `/auth/login`     | ❌   | Autenticar y obtener token |
| GET    | `/auth/profile`   | ✅   | Obtener perfil del usuario |
| POST   | `/auth/logout`    | ✅   | Cerrar sesión              |

### Request/Response Examples

#### POST /auth/register

**Request:**
```json
{
  "email": "juan.perez@example.com",
  "password": "Password123!",
  "nombre": "Juan",
  "apellido": "Pérez",
  "dni": "12345678",
  "telefono": "+54 11 1234-5678"
}
```

**Response (201 Created):**
```json
{
  "message": "Tutor registrado exitosamente",
  "user": {
    "id": "cm3gnrzk93000xwjhmi1lx8az",
    "email": "juan.perez@example.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "dni": "12345678",
    "telefono": "+54 11 1234-5678",
    "fecha_registro": "2025-10-12T10:30:00Z",
    "ha_completado_onboarding": false
  }
}
```

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS 11
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator, class-transformer
- **Password**: bcrypt
- **TypeScript**: 5.x

### Frontend
- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **State Management**: Zustand 5
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS v4
- **TypeScript**: 5.x

### DevOps
- **Monorepo**: Turborepo
- **Package Manager**: npm (workspaces)
- **Containerization**: Docker (PostgreSQL)
- **Database Migrations**: Prisma Migrate

---

## 📊 Performance Metrics

### Build Times
- **Full Build**: ~17s (first time)
- **Cached Build**: ~81ms (FULL TURBO)
- **Hot Reload**: <1s

### Bundle Sizes
- **Main App**: 113 kB (First Load JS)
- **Showcase Page**: +2.96 kB
- **Shared Chunks**: 119 kB

### API Response Times (local)
- **Register**: ~50-100ms (bcrypt hashing)
- **Login**: ~50-100ms (bcrypt compare)
- **Profile**: ~10-20ms (DB lookup)

---

## 🚀 Deployment Considerations

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRATION="7d"
PORT=3001
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use HTTPS for all requests
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Add Helmet for security headers
- [ ] Use production database
- [ ] Configure logging (Winston/Pino)
- [ ] Add monitoring (Sentry)
- [ ] Enable compression
- [ ] Configure CDN for static assets

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **JWT Stateless**: Elegido por escalabilidad
2. **bcrypt 10 rounds**: Balance entre seguridad y performance
3. **Zustand**: Más simple que Redux para este caso de uso
4. **localStorage**: Para persistencia del token (SSR-safe)
5. **Axios Interceptors**: Centraliza lógica de auth
6. **No Refresh Tokens**: Fase 1 usa solo access tokens

### Limitaciones Conocidas

1. **No Refresh Tokens**: Token expira en 7 días, requiere re-login
2. **localStorage**: Vulnerable a XSS (considerar HttpOnly cookies)
3. **No Email Verification**: Cualquiera puede registrarse
4. **No Rate Limiting**: Vulnerable a brute force
5. **No 2FA**: Solo email/password

### Próximas Mejoras (Fase 2+)

1. Implementar refresh tokens
2. Migrar a HttpOnly cookies
3. Agregar verificación de email
4. Implementar rate limiting
5. Agregar 2FA opcional
6. OAuth providers (Google, GitHub)

---

**Última actualización**: 2025-10-12
**Versión**: 1.0
**Estado**: ✅ Implementado y Documentado
