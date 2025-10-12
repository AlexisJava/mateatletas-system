# MASTER GUIDE - DESARROLLO COMPLETO DE MATEATLETAS

## Guia Exhaustiva de Slices con Prompts Detallados

---

# FASE 0: SETUP DEL MONOREPO

## Objetivo

Crear la estructura base del proyecto con monorepo funcional, TypeScript, linters y conexion a base de datos.

## Duracion Estimada

1-2 dias

---

## SLICE 0.1: Inicializacion del Monorepo

### Que se construye

- Estructura de carpetas del monorepo
- Configuracion de workspaces (Turborepo/PNPM)
- Package.json raiz con scripts comunes

### Prompt para Claude Code

```
# CONTEXTO
Estoy iniciando el proyecto Mateatletas. Necesito crear un monorepo que contenga:
- Frontend: Next.js 14+ con App Router
- Backend: NestJS
- Codigo compartido: libreria de tipos

# TAREA
Crea la estructura inicial del monorepo usando Turborepo (o PNPM workspaces si prefieres):

ESTRUCTURA ESPERADA:
```

mateatletas/
├── apps/
│ ├── web/ # Next.js (se creara en siguiente paso)
│ └── api/ # NestJS (se creara en siguiente paso)
├── packages/
│ └── shared/ # Tipos compartidos (crear basico)
├── package.json # Root package con workspaces
├── turbo.json # Configuracion Turborepo
├── .gitignore
└── README.md

```

REQUERIMIENTOS:
1. Inicializar monorepo con Turborepo
2. Configurar workspaces para apps/web, apps/api, packages/shared
3. En package.json raiz, agregar scripts:
   - "dev": ejecutar web y api en paralelo
   - "build": build de ambas apps
   - "lint": lint de todo el repo
4. Crear packages/shared/package.json con configuracion basica para tipos
5. Gitignore debe incluir: node_modules, .next, dist, .env*

CRITERIO DE EXITO:
- npm install funciona sin errores
- Estructura de carpetas creada
- README.md con instrucciones basicas

NO ejecutes npm install todavia, solo crea la estructura.
```

### Criterio de Aceptacion

- [ ] Estructura de carpetas creada
- [ ] package.json raiz con workspaces configurados
- [ ] turbo.json o pnpm-workspace.yaml configurado
- [ ] .gitignore completo

---

## SLICE 0.2: Setup de Next.js (Frontend)

### Que se construye

- Aplicacion Next.js con App Router
- Configuracion de TypeScript estricto
- Tailwind CSS configurado con tokens del design system

### Prompt para Claude Code

````
# CONTEXTO
Monorepo ya inicializado. Ahora necesito crear la aplicacion Next.js dentro de apps/web.

# TAREA
Crea la aplicacion Next.js 14+ con la siguiente configuracion:

PASOS:
1. En apps/web/, inicializar Next.js:
   - TypeScript: Si
   - ESLint: Si
   - Tailwind CSS: Si
   - App Router: Si
   - src/ directory: Si
   - Import alias: @/*

2. Configurar TypeScript en modo ESTRICTO (apps/web/tsconfig.json):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
````

3. Configurar Tailwind CSS con tokens del design system (apps/web/tailwind.config.ts):

```typescript
// Colores del design system Crash Bandicoot
colors: {
  'orange-primary': '#FF8C00',
  'blue-primary': '#1E90FF',
  'yellow-energy': '#FFD700',
  'green-success': '#00CC44',
  'red-error': '#FF3333',
  'purple-special': '#9933FF',
}

// Sombras chunky (sin blur)
boxShadow: {
  'chunky-sm': '3px 3px 0px rgba(0,0,0,1)',
  'chunky-md': '5px 5px 0px rgba(0,0,0,1)',
  'chunky-lg': '8px 8px 0px rgba(0,0,0,1)',
}

// Fuentes
fontFamily: {
  'lilita': ['Lilita One', 'cursive'],
  'geist': ['Geist Sans', 'sans-serif'],
}
```

4. Crear app/layout.tsx basico con:
   - Metadata de la app
   - Importar fuentes de Google Fonts (Lilita One)
   - Aplicar globals.css

5. Crear app/page.tsx con un "Hello Mateatletas" usando estilos Tailwind

6. En globals.css, agregar estilos base del design system:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-geist bg-white text-black;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply font-lilita;
  }
}
```

CRITERIO DE EXITO:

- npm run dev en apps/web levanta en http://localhost:3000
- Pagina principal muestra "Hello Mateatletas" con fuente Lilita One
- Tailwind CSS funciona (probar alguna clase de color)

```

### Criterio de Aceptacion
- [ ] Next.js corriendo en puerto 3000
- [ ] TypeScript en modo estricto
- [ ] Tailwind configurado con colores y sombras del design system
- [ ] Fuente Lilita One cargada
- [ ] Pagina de inicio renderiza

---

## SLICE 0.3: Setup de NestJS (Backend)

### Que se construye
- Aplicacion NestJS
- Configuracion de TypeScript estricto
- Modulo de configuracion para variables de entorno
- Endpoint de health check

### Prompt para Claude Code

```

# CONTEXTO

Monorepo con Next.js funcionando. Ahora crearemos el backend con NestJS.

# TAREA

Crea la aplicacion NestJS dentro de apps/api con la siguiente configuracion:

PASOS:

1. Inicializar NestJS en apps/api:

```bash
cd apps/api
nest new . --skip-git --package-manager npm
```

2. Configurar TypeScript ESTRICTO (apps/api/tsconfig.json):

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "strict": true
  }
}
```

3. Instalar dependencias necesarias:

```bash
npm install @nestjs/config class-validator class-transformer
npm install --save-dev @types/node
```

4. Configurar puerto 3001 en apps/api/src/main.ts:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(3001);
  console.log('API corriendo en http://localhost:3001');
}
bootstrap();
```

5. Crear modulo de configuracion (apps/api/src/core/config/config.module.ts):

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
```

6. Crear endpoint de health check (apps/api/src/app.controller.ts):

```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Mateatletas API',
  };
}
```

7. Crear archivo .env en la raiz del monorepo:

```
# Base de datos (se configurara en siguiente slice)
DATABASE_URL="postgresql://user:password@localhost:5432/mateatletas?schema=public"

# JWT (se usara en auth)
JWT_SECRET="tu-secreto-super-seguro-cambialo-en-produccion"

# Puertos
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

8. Actualizar apps/api/src/app.module.ts para importar AppConfigModule

CRITERIO DE EXITO:

- npm run start:dev en apps/api levanta en http://localhost:3001
- GET http://localhost:3001/api/health devuelve status: ok
- Variables de entorno se cargan correctamente

```

### Criterio de Aceptacion
- [ ] NestJS corriendo en puerto 3001
- [ ] Endpoint /api/health funciona
- [ ] ConfigModule configurado
- [ ] .env creado con variables basicas
- [ ] TypeScript en modo estricto

---

## SLICE 0.4: Setup de Prisma y PostgreSQL

### Que se construye
- Prisma ORM configurado
- Conexion a base de datos PostgreSQL
- Schema basico con modelo de prueba
- Primera migracion

### Prompt para Claude Code

```

# CONTEXTO

Backend NestJS funcionando. Ahora configuraremos Prisma para conectar a PostgreSQL.

# TAREA

Configura Prisma ORM en el backend con conexion a PostgreSQL:

PASOS:

1. Instalar Prisma en apps/api:

```bash
cd apps/api
npm install prisma @prisma/client
npm install --save-dev prisma
```

2. Inicializar Prisma:

```bash
npx prisma init
```

Esto crea:

- prisma/schema.prisma
- .env (ya existe, solo actualiza DATABASE_URL)

3. Configurar apps/api/prisma/schema.prisma:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelo de prueba simple
model TestModel {
  id         String   @id @default(uuid())
  name       String
  created_at DateTime @default(now())

  @@map("test_models")
}
```

4. Crear PrismaService (apps/api/src/core/database/prisma.service.ts):

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado a la base de datos');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

5. Crear DatabaseModule (apps/api/src/core/database/database.module.ts):

```typescript
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```

6. Importar DatabaseModule en AppModule (apps/api/src/app.module.ts)

7. Actualizar .env con credenciales reales de PostgreSQL:

```
DATABASE_URL="postgresql://usuario:password@localhost:5432/mateatletas?schema=public"
```

NOTA IMPORTANTE: Si no tienes PostgreSQL local, puedes:
a) Usar Supabase (crear proyecto gratis en supabase.com)
b) Usar Docker: docker run --name postgres -e POSTGRES_PASSWORD=mateatletas -p 5432:5432 -d postgres
c) Instalar PostgreSQL localmente

8. Crear primera migracion:

```bash
npx prisma migrate dev --name init
```

9. Generar cliente Prisma:

```bash
npx prisma generate
```

10. Probar conexion agregando endpoint en app.controller.ts:

```typescript
@Get('db-test')
async testDatabase() {
  const count = await this.prisma.testModel.count();
  return {
    status: 'Database connected',
    test_models_count: count
  };
}
```

CRITERIO DE EXITO:

- Prisma genera cliente sin errores
- Migracion se aplica exitosamente
- GET http://localhost:3001/api/db-test devuelve respuesta
- No hay errores de conexion en consola

```

### Criterio de Aceptacion
- [ ] Prisma instalado y configurado
- [ ] PrismaService creado y funcional
- [ ] Conexion a PostgreSQL exitosa
- [ ] Primera migracion aplicada
- [ ] Endpoint de prueba funciona

---

## SLICE 0.5: ESLint, Prettier y Scripts del Monorepo

### Que se construye
- Configuracion de ESLint unificada
- Prettier configurado
- Scripts npm para desarrollo y build
- Husky para pre-commit hooks (opcional)

### Prompt para Claude Code

```

# CONTEXTO

Monorepo con Next.js, NestJS y Prisma funcionando. Ahora configuraremos herramientas de calidad de codigo.

# TAREA

Configura ESLint, Prettier y scripts de desarrollo para el monorepo:

PASOS:

1. Instalar dependencias en la raiz:

```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

2. Crear .eslintrc.js en la raiz:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

3. Crear .prettierrc en la raiz:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

4. Crear .prettierignore:

```
node_modules
dist
.next
build
coverage
.turbo
```

5. Actualizar package.json raiz con scripts:

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:web": "cd apps/web && npm run dev",
    "dev:api": "cd apps/api && npm run start:dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "turbo run type-check",
    "test": "turbo run test"
  }
}
```

6. En apps/web/package.json, agregar:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

7. En apps/api/package.json, agregar:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

8. Crear .vscode/settings.json (opcional, para VSCode):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

9. Actualizar README.md con comandos de desarrollo:

```markdown
# Mateatletas

## Desarrollo Local

### Instalar dependencias

npm install

### Levantar ambas apps en paralelo

npm run dev

### Levantar solo frontend

npm run dev:web

### Levantar solo backend

npm run dev:api

### Linters y formato

npm run lint
npm run format
npm run type-check

### Build

npm run build
```

CRITERIO DE EXITO:

- npm run lint funciona sin errores criticos
- npm run format formatea todos los archivos
- npm run dev levanta ambas apps en paralelo
- npm run type-check pasa sin errores

```

### Criterio de Aceptacion
- [ ] ESLint configurado y funcionando
- [ ] Prettier configurado
- [ ] Scripts npm funcionando
- [ ] README.md actualizado
- [ ] npm run dev levanta todo en paralelo

---

## SLICE 0.6: Configuracion de GitHub y CI Basico

### Que se construye
- Repositorio Git inicializado
- GitHub Actions para CI basico
- Workflow que ejecuta linters y type-check

### Prompt para Claude Code

```

# CONTEXTO

Monorepo completamente configurado localmente. Ahora lo subiremos a GitHub con CI basico.

# TAREA

Configura Git, GitHub y CI basico:

PASOS:

1. Inicializar Git (si aun no esta inicializado):

```bash
git init
git add .
git commit -m "chore: fase 0 completa - setup inicial del monorepo"
```

2. Crear .github/workflows/ci.yml:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript type check
        run: npm run type-check

      - name: Check code formatting
        run: npm run format:check

  build:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build apps
        run: npm run build
```

3. Crear .github/PULL_REQUEST_TEMPLATE.md:

```markdown
## Descripcion

<!-- Describe los cambios realizados -->

## Tipo de cambio

- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentacion

## Checklist

- [ ] El codigo sigue el estilo del proyecto
- [ ] He realizado self-review del codigo
- [ ] He comentado codigo complejo
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests (si aplica)
- [ ] Tests nuevos y existentes pasan localmente
```

4. Crear CONTRIBUTING.md en la raiz:

````markdown
# Guia de Contribucion

## Flujo de trabajo

1. Crear branch desde `develop`:

```bash
git checkout develop
git pull
git checkout -b feature/nombre-descriptivo
```
````

2. Hacer commits con mensajes semanticos:

```
feat: agregar login de tutor
fix: corregir validacion de email
chore: actualizar dependencias
docs: mejorar README
```

3. Antes de hacer push:

```bash
npm run lint
npm run type-check
npm run format
```

4. Crear Pull Request a `develop`

## Estructura de Branches

- `main`: produccion
- `develop`: desarrollo
- `feature/*`: nuevas features
- `fix/*`: bug fixes
- `hotfix/*`: fixes urgentes a produccion

```

5. Actualizar .gitignore:
```

# Dependencies

node_modules/
.pnp
.pnp.js

# Testing

coverage/
.nyc_output/

# Next.js

.next/
out/
build/
dist/

# Env files

.env
.env\*.local

# Logs

npm-debug.log*
yarn-debug.log*
yarn-error.log\*

# OS

.DS_Store
Thumbs.db

# IDE

.vscode/
.idea/
_.swp
_.swo

# Turbo

.turbo/

# Prisma

prisma/migrations/

````

INSTRUCCIONES MANUALES (no automatizar):
1. Crear repositorio en GitHub
2. Agregar remote:
```bash
git remote add origin https://github.com/tu-usuario/mateatletas.git
git branch -M main
git push -u origin main
````

3. Crear branch develop:

```bash
git checkout -b develop
git push -u origin develop
```

4. En GitHub, configurar branch develop como default

CRITERIO DE EXITO:

- Repositorio en GitHub
- CI funciona en cada push
- Template de PR creado

````

### Criterio de Aceptacion
- [ ] Repositorio Git inicializado
- [ ] GitHub repo creado
- [ ] CI pipeline funcionando
- [ ] Branches main y develop creados
- [ ] Templates de PR y contributing creados

---

# ✅ CHECKPOINT FASE 0

## Verificacion Final

Antes de avanzar a Slice #1, verifica:

```bash
# En la raiz del proyecto:

# 1. Frontend funciona
cd apps/web && npm run dev
# ✅ http://localhost:3000 muestra pagina

# 2. Backend funciona
cd apps/api && npm run start:dev
# ✅ http://localhost:3001/api/health devuelve {status: "ok"}
# ✅ http://localhost:3001/api/db-test funciona

# 3. Linters pasan
npm run lint
# ✅ Sin errores criticos

# 4. Type check pasa
npm run type-check
# ✅ Sin errores

# 5. Prisma funciona
cd apps/api && npx prisma studio
# ✅ Se abre interfaz de Prisma Studio
````

## Estructura Final del Proyecto

```
mateatletas/
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── globals.css
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── src/
│       │   ├── core/
│       │   │   ├── config/
│       │   │   └── database/
│       │   │       ├── prisma.service.ts
│       │   │       └── database.module.ts
│       │   ├── app.controller.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       └── package.json
├── .env
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── turbo.json
├── README.md
└── CONTRIBUTING.md
```

---

# FASE 1: VERTICAL SLICES FUNCIONALES

---

# SLICE #1: AUTENTICACION DE TUTOR (Login Completo)

## Objetivo

Implementar el flujo completo de autenticacion: registro, login, sesion persistente y rutas protegidas.

## Duracion Estimada

3-4 dias

## Arquitectura del Slice

```
BACKEND (NestJS):
- Modelo Tutor en Prisma
- Modulo Auth (registro, login, JWT)
- Guards de autenticacion

FRONTEND (Next.js):
- Pagina /login
- Pagina /register
- Pagina /dashboard (protegida)
- Zustand store para auth
- Axios configurado con interceptores
```

---

## SLICE 1.1: Modelo de Datos y Migracion

### Que se construye

- Modelo Tutor en Prisma
- Migracion de base de datos
- Seed de datos de prueba

### Prompt para Claude Code

````
# CONTEXTO
Fase 0 completa. Iniciando Slice #1: Autenticacion. Primero crearemos el modelo de datos.

# TAREA
Crea el modelo Tutor en Prisma con los campos necesarios para autenticacion:

PASOS:
1. Actualizar apps/api/prisma/schema.prisma:

ELIMINAR el modelo TestModel y agregar:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tutor {
  id                         String    @id @default(uuid())
  nombre                     String    @db.VarChar(100)
  apellido                   String    @db.VarChar(100)
  email                      String    @unique @db.VarChar(255)
  password_hash              String    @db.VarChar(255)
  dni                        String?   @unique @db.VarChar(20)
  cuil                       String?   @unique @db.VarChar(20)
  telefono                   String?   @db.VarChar(50)
  estado                     String    @default("Activo") @db.VarChar(50)
  ha_completado_onboarding   Boolean   @default(false)
  created_at                 DateTime  @default(now()) @db.Timestamptz
  updated_at                 DateTime  @updatedAt @db.Timestamptz

  @@map("tutores")
}
````

2. Crear la migracion:

```bash
cd apps/api
npx prisma migrate dev --name crear_modelo_tutor
```

3. Generar cliente Prisma actualizado:

```bash
npx prisma generate
```

4. Crear seed para datos de prueba (apps/api/prisma/seed.ts):

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear tutor de prueba
  const passwordHash = await bcrypt.hash('password123', 10);

  const tutor = await prisma.tutor.upsert({
    where: { email: 'tutor@test.com' },
    update: {},
    create: {
      email: 'tutor@test.com',
      password_hash: passwordHash,
      nombre: 'Juan',
      apellido: 'Perez',
      dni: '12345678',
      telefono: '+54 9 11 1234-5678',
      estado: 'Activo',
      ha_completado_onboarding: false,
    },
  });

  console.log('✅ Seed completado:', { tutor });
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

5. Instalar bcrypt:

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

6. Agregar script de seed en apps/api/package.json:

```json
{
  "scripts": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

7. Ejecutar seed:

```bash
npm run seed
```

8. Verificar en Prisma Studio:

```bash
npx prisma studio
```

CRITERIO DE EXITO:

- Modelo Tutor creado en la BD
- Migracion aplicada sin errores
- Tutor de prueba creado con password hasheado
- Prisma Studio muestra el tutor

```

### Criterio de Aceptacion
- [ ] Modelo Tutor en schema.prisma
- [ ] Migracion aplicada
- [ ] Bcrypt instalado
- [ ] Seed ejecutado exitosamente
- [ ] Tutor de prueba visible en Prisma Studio

---

## SLICE 1.2: Modulo Auth - Backend (Registro y Login)

### Que se construye
- Modulo Auth en NestJS
- DTOs de validacion
- Servicio de autenticacion con bcrypt y JWT
- Controlador con endpoints

### Prompt para Claude Code

```

# CONTEXTO

Modelo Tutor creado. Ahora implementaremos el modulo Auth en NestJS.

# TAREA

Crea el modulo completo de autenticacion en apps/api/src/modules/auth/:

ESTRUCTURA A CREAR:

```
apps/api/src/modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── dtos/
│   ├── register.dto.ts
│   └── login.dto.ts
└── interfaces/
    └── jwt-payload.interface.ts
```

PASOS:

1. Instalar dependencias necesarias:

```bash
cd apps/api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
```

2. Crear DTOs de validacion:

apps/api/src/modules/auth/dtos/register.dto.ts:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Nombre es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'Apellido es requerido' })
  apellido: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}
```

apps/api/src/modules/auth/dtos/login.dto.ts:

```typescript
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;
}
```

3. Crear interface JWT Payload:

apps/api/src/modules/auth/interfaces/jwt-payload.interface.ts:

```typescript
export interface JwtPayload {
  sub: string; // UUID del tutor
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}
```

4. Crear Auth Service:

apps/api/src/modules/auth/auth.service.ts:

```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el email ya existe
    const existingTutor = await this.prisma.tutor.findUnique({
      where: { email: registerDto.email },
    });

    if (existingTutor) {
      throw new ConflictException('El email ya esta registrado');
    }

    // Hash del password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Crear tutor
    const tutor = await this.prisma.tutor.create({
      data: {
        email: registerDto.email,
        password_hash: passwordHash,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        dni: registerDto.dni,
        telefono: registerDto.telefono,
        estado: 'Activo',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        created_at: true,
      },
    });

    // Generar JWT
    const payload: JwtPayload = {
      sub: tutor.id,
      email: tutor.email,
      nombre: tutor.nombre,
      apellido: tutor.apellido,
      rol: 'Tutor',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: tutor,
    };
  }

  async login(loginDto: LoginDto) {
    // Buscar tutor por email
    const tutor = await this.prisma.tutor.findUnique({
      where: { email: loginDto.email },
    });

    if (!tutor) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(loginDto.password, tutor.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Verificar estado del tutor
    if (tutor.estado !== 'Activo') {
      throw new UnauthorizedException('Tu cuenta esta inactiva. Contacta a soporte.');
    }

    // Generar JWT
    const payload: JwtPayload = {
      sub: tutor.id,
      email: tutor.email,
      nombre: tutor.nombre,
      apellido: tutor.apellido,
      rol: 'Tutor',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: tutor.id,
        email: tutor.email,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        ha_completado_onboarding: tutor.ha_completado_onboarding,
      },
    };
  }
}
```

5. Crear Auth Controller:

apps/api/src/modules/auth/auth.controller.ts:

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

6. Crear Auth Module:

apps/api/src/modules/auth/auth.module.ts:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'tu-secreto-super-seguro',
        signOptions: {
          expiresIn: '7d', // Token valido por 7 dias
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

7. Importar AuthModule en AppModule:

apps/api/src/app.module.ts:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule, // <-- AGREGAR
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

8. Habilitar validacion global en main.ts:

apps/api/src/main.ts:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Habilitar validacion global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma los tipos automaticamente
    }),
  );

  app.enableCors();

  await app.listen(3001);
  console.log('✅ API corriendo en http://localhost:3001');
}
bootstrap();
```

CRITERIO DE EXITO:

- POST http://localhost:3001/api/auth/register con body valido crea tutor y devuelve JWT
- POST http://localhost:3001/api/auth/login con credenciales correctas devuelve JWT
- Login con credenciales incorrectas devuelve 401
- Email duplicado en registro devuelve 409
- Body invalido devuelve 400 con mensajes de error claros

```

### Criterio de Aceptacion
- [ ] AuthModule creado e importado
- [ ] DTOs con validaciones funcionando
- [ ] AuthService con bcrypt y JWT
- [ ] Endpoints /auth/register y /auth/login funcionando
- [ ] Validacion global habilitada
- [ ] Manejo de errores correcto

---

## SLICE 1.3: Guards de Autenticacion y Autorizacion

### Que se construye
- JWT Strategy para Passport
- JwtAuthGuard para proteger rutas
- RolesGuard para autorizacion por roles
- Decoradores personalizados

### Prompt para Claude Code

```

# CONTEXTO

Auth module funcionando. Ahora crearemos los guards para proteger rutas.

# TAREA

Implementa la estrategia JWT, guards y decoradores en apps/api/src/core/security/:

ESTRUCTURA A CREAR:

```
apps/api/src/core/security/
├── strategies/
│   └── jwt.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
└── decorators/
    ├── roles.decorator.ts
    └── get-user.decorator.ts
```

PASOS:

1. Crear JWT Strategy:

apps/api/src/core/security/strategies/jwt.strategy.ts:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../../modules/auth/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'tu-secreto-super-seguro',
    });
  }

  async validate(payload: JwtPayload) {
    const { sub: id, email } = payload;

    // Buscar tutor en la BD para asegurar que sigue existiendo y esta activo
    const tutor = await this.prisma.tutor.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        estado: true,
        ha_completado_onboarding: true,
      },
    });

    if (!tutor) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (tutor.estado !== 'Activo') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornamos el tutor, que sera adjuntado a request.user
    return {
      ...tutor,
      rol: 'Tutor',
    };
  }
}
```

2. Crear JwtAuthGuard:

apps/api/src/core/security/guards/jwt-auth.guard.ts:

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Aqui podriamos agregar logica custom
    return super.canActivate(context);
  }
}
```

3. Crear RolesGuard:

apps/api/src/core/security/guards/roles.guard.ts:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles permitidos del decorador @Roles
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true; // Si no hay roles definidos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.rol) {
      return false;
    }

    // Verificar si el rol del usuario esta en los roles permitidos
    return requiredRoles.includes(user.rol);
  }
}
```

4. Crear decorador @Roles:

apps/api/src/core/security/decorators/roles.decorator.ts:

```typescript
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

5. Crear decorador @GetUser:

apps/api/src/core/security/decorators/get-user.decorator.ts:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user?.[data] : user;
});
```

6. Registrar JwtStrategy en AuthModule:

apps/api/src/modules/auth/auth.module.ts:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from '../../core/security/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'tu-secreto-super-seguro',
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

7. Crear endpoint protegido de prueba en auth.controller.ts:

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from '../../core/security/guards/jwt-auth.guard';
import { GetUser } from '../../core/security/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // NUEVO: Endpoint protegido
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: any) {
    return {
      message: 'Este es un endpoint protegido',
      user,
    };
  }
}
```

CRITERIO DE EXITO:

- GET http://localhost:3001/api/auth/profile sin token devuelve 401
- GET http://localhost:3001/api/auth/profile con token valido devuelve info del usuario
- Token expirado devuelve 401
- Usuario con estado "Inactivo" no puede autenticarse

```

### Criterio de Aceptacion
- [ ] JwtStrategy implementada
- [ ] Guards creados (JwtAuthGuard, RolesGuard)
- [ ] Decoradores creados (@Roles, @GetUser)
- [ ] Endpoint /auth/profile protegido funciona
- [ ] Token invalido devuelve 401

---

## SLICE 1.4: Frontend - Store de Autenticacion (Zustand)

### Que se construye
- Zustand store para auth
- Persistencia en localStorage
- Axios client configurado con interceptores

### Prompt para Claude Code

```

# CONTEXTO

Backend de auth completo. Ahora configuraremos el store de autenticacion en frontend.

# TAREA

Crea el store de autenticacion con Zustand en apps/web/src/:

ESTRUCTURA A CREAR:

```
apps/web/src/
├── lib/
│   └── axios.ts
├── store/
│   └── auth.store.ts
└── types/
    └── api.ts
```

PASOS:

1. Instalar dependencias:

```bash
cd apps/web
npm install zustand axios
```

2. Crear tipos compartidos:

apps/web/src/types/api.ts:

```typescript
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  ha_completado_onboarding: boolean;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni?: string;
  telefono?: string;
}
```

3. Crear cliente Axios:

apps/web/src/lib/axios.ts:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Agregar token automaticamente
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const authData = localStorage.getItem('mateatletas-auth');

    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor de Response: Manejar errores 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalido o expirado - limpiar sesion
      localStorage.removeItem('mateatletas-auth');

      // Redirigir a login solo si no estamos ya en esa pagina
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
```

4. Crear store de autenticacion:

apps/web/src/store/auth.store.ts:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Acciones
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'mateatletas-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

5. Crear hook personalizado useAuth:

apps/web/src/hooks/useAuth.ts:

```typescript
import { useAuthStore } from '@/store/auth.store';

export const useAuth = () => {
  const { token, user, isAuthenticated, login, logout, updateUser } = useAuthStore();

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    // Helpers
    isTutor: user?.rol === 'Tutor',
    nombreCompleto: user ? `${user.nombre} ${user.apellido}` : '',
  };
};
```

6. Actualizar .env.local en apps/web:

apps/web/.env.local:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

7. Crear componente de prueba para verificar el store:

apps/web/src/components/AuthDebug.tsx:

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';

export function AuthDebug() {
  const { isAuthenticated, user, token } = useAuth();

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold">Auth Debug</h3>
      <p>Usuario: {user?.nombre} {user?.apellido}</p>
      <p>Email: {user?.email}</p>
      <p>Token: {token?.substring(0, 20)}...</p>
    </div>
  );
}
```

8. Agregar AuthDebug a la pagina principal temporalmente:

apps/web/src/app/page.tsx:

```typescript
import { AuthDebug } from '@/components/AuthDebug';

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-lilita mb-4">Mateatletas</h1>
      <AuthDebug />
    </main>
  );
}
```

CRITERIO DE EXITO:

- Store de Zustand creado y configurado con persistencia
- Axios configurado con interceptores
- Hook useAuth funcional
- Componente AuthDebug muestra "No autenticado" inicialmente
- localStorage guarda/recupera la sesion correctamente

```

### Criterio de Aceptacion
- [ ] Zustand instalado y configurado
- [ ] Store auth.store.ts creado con persistencia
- [ ] Axios client con interceptores
- [ ] Hook useAuth creado
- [ ] Tipos TypeScript definidos
- [ ] AuthDebug component funcional

---

## SLICE 1.5: Frontend - Pagina de Login

### Que se construye
- Pagina /login con formulario
- Componentes UI basicos (Button, Input, Card)
- Integracion con API de login
- Manejo de errores

### Prompt para Claude Code

```

# CONTEXTO

Store de auth configurado. Ahora crearemos los componentes UI basicos y la pagina de login.

# TAREA

Crea los componentes UI y la pagina de login en apps/web/src/:

ESTRUCTURA A CREAR:

```
apps/web/src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
└── app/
    └── login/
        └── page.tsx
```

PASOS:

1. Crear componente Button con estilos Crash Bandicoot:

apps/web/src/components/ui/Button.tsx:

```typescript
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-lilita text-white px-8 py-4 rounded-xl border-4 border-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-orange-primary hover:shadow-chunky-md active:shadow-none active:translate-x-[5px] active:translate-y-[5px]',
      secondary: 'bg-blue-primary hover:shadow-chunky-md active:shadow-none active:translate-x-[5px] active:translate-y-[5px]',
      success: 'bg-green-success hover:shadow-chunky-md active:shadow-none active:translate-x-[5px] active:translate-y-[5px]',
      danger: 'bg-red-error hover:shadow-chunky-md active:shadow-none active:translate-x-[5px] active:translate-y-[5px]',
    };

    const shadowStyles = 'shadow-chunky-md hover:shadow-chunky-lg';

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], shadowStyles, className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Cargando...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

2. Crear componente Input:

apps/web/src/components/ui/Input.tsx:

```typescript
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-geist font-semibold text-base text-black mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full font-geist text-base text-black px-4 py-3 bg-white rounded-xl border-3 border-black shadow-chunky-sm transition-all duration-200',
            'focus:outline-none focus:border-orange-primary focus:shadow-chunky-md focus:translate-x-[-2px] focus:translate-y-[-2px]',
            'placeholder:text-gray-400',
            error && 'border-red-error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-error font-geist">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

3. Crear componente Card:

apps/web/src/components/ui/Card.tsx:

```typescript
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  shadow?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = 'md', children, ...props }, ref) => {
    const shadows = {
      sm: 'shadow-chunky-sm',
      md: 'shadow-chunky-md',
      lg: 'shadow-chunky-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl border-4 border-black p-6',
          shadows[shadow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
```

4. Crear utilidad cn (classnames):

apps/web/src/lib/utils.ts:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

5. Instalar dependencias necesarias:

```bash
cd apps/web
npm install clsx tailwind-merge
```

6. Crear pagina de login:

apps/web/src/app/login/page.tsx:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/axios';
import { AuthResponse, LoginDto } from '@/types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<LoginDto>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
```
