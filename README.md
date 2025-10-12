# Mateatletas Ecosystem

Monorepo para la plataforma Mateatletas, construido con Turborepo.

## Estructura del Proyecto

```
mateatletas/
├── apps/
│   ├── web/          # Aplicación Next.js 14+ (App Router)
│   └── api/          # API NestJS
├── packages/
│   └── shared/       # Tipos compartidos y utilidades
├── package.json      # Configuración raíz del monorepo
└── turbo.json        # Configuración de Turborepo
```

## Tecnologías

- **Monorepo**: Turborepo
- **Frontend**: Next.js 15 con App Router + Tailwind CSS v4
- **Backend**: NestJS 11
- **Lenguaje**: TypeScript (modo estricto)
- **Gestión de paquetes**: npm workspaces

## Primeros Pasos

### Instalación

```bash
npm install
```

### Desarrollo Local

Ejecutar todas las aplicaciones en modo desarrollo (en paralelo):

```bash
npm run dev
```

Ejecutar solo el frontend:

```bash
npm run dev:web
```

Ejecutar solo el backend:

```bash
npm run dev:api
```

### Build

Construir todas las aplicaciones:

```bash
npm run build
```

### Linters y Formato

Ejecutar linter en todo el monorepo:

```bash
npm run lint
```

Formatear código con Prettier:

```bash
npm run format
```

Verificar formato sin modificar:

```bash
npm run format:check
```

Verificar tipos TypeScript:

```bash
npm run type-check
```

### Tests

```bash
npm run test
```

### Limpieza

Limpiar archivos de build:

```bash
npm run clean
```

## Workspaces

- **@mateatletas/web**: Aplicación frontend (Next.js)
- **@mateatletas/api**: API backend (NestJS)
- **@mateatletas/shared**: Tipos y utilidades compartidas

## 📚 Documentación

- **[QUICK_START.md](./QUICK_START.md)** - Guía de inicio rápido
- **[CHECKPOINT_FASE_1.md](./CHECKPOINT_FASE_1.md)** - Estado completo de Fase 1
- **[docs/ARCHITECTURE_FASE_1.md](./docs/ARCHITECTURE_FASE_1.md)** - Diagramas y arquitectura
- **[docs/README.md](./docs/README.md)** - Índice completo de documentación
- **[apps/api/src/auth/README.md](./apps/api/src/auth/README.md)** - Documentación del módulo Auth
- **[apps/api/CURL_EXAMPLES.md](./apps/api/CURL_EXAMPLES.md)** - Ejemplos de uso de la API

## 🎨 Componentes UI

Ver el showcase interactivo de todos los componentes:
```
http://localhost:3000/showcase
```

Componentes disponibles:
- **Button** - 4 variantes, 3 tamaños, estado loading
- **Input** - Con validación y mensajes de error
- **Card** - Con título opcional y efecto hover

## 🔐 API Endpoints

| Método | Endpoint           | Auth | Descripción              |
|--------|-------------------|------|--------------------------|
| POST   | `/auth/register`  | ❌   | Registrar nuevo tutor    |
| POST   | `/auth/login`     | ❌   | Login y obtener token    |
| GET    | `/auth/profile`   | ✅   | Obtener perfil           |
| POST   | `/auth/logout`    | ✅   | Cerrar sesión            |

Ver ejemplos completos: [apps/api/CURL_EXAMPLES.md](./apps/api/CURL_EXAMPLES.md)

## Variables de Entorno

Las variables de entorno se encuentran en el archivo `.env` en la raíz del monorepo:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mateatletas?schema=public"
JWT_SECRET="tu-secreto-super-seguro-cambialo-en-produccion"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

**Nota**: El archivo `.env` está ignorado por Git. Crea tu propio archivo basándote en las variables necesarias.

## Aplicaciones

### Frontend (Next.js)

- Puerto: http://localhost:3000
- Características:
  - App Router
  - Tailwind CSS v4 con design system personalizado
  - TypeScript estricto
  - Fuentes: Lilita One + Geist Sans

### Backend (NestJS)

- Puerto: http://localhost:3001
- Base URL: http://localhost:3001/api
- Características:
  - CORS habilitado
  - Validation Pipe global
  - ConfigModule para variables de entorno
  - Health check endpoint: `/api/health`

## 🚀 Estado Actual

### ✅ Fase 1: Sistema de Autenticación (COMPLETADO)

- ✅ Base de datos configurada (PostgreSQL + Prisma)
- ✅ Autenticación JWT implementada
- ✅ Módulo Auth completo con guards y strategies
- ✅ 4 endpoints REST funcionales
- ✅ Cliente Axios con interceptors
- ✅ Store Zustand con persistencia
- ✅ Componentes UI (Button, Input, Card) con estilo Crash Bandicoot

**📚 Ver documentación completa**: [CHECKPOINT_FASE_1.md](./CHECKPOINT_FASE_1.md)

### 🔜 Próximos Pasos (Fase 2)

- [ ] Crear páginas de login y registro
- [ ] Implementar dashboard protegido
- [ ] Agregar navbar con estado de autenticación
- [ ] Middleware de protección de rutas

## Comandos Útiles

| Comando                | Descripción                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Inicia todas las apps en modo desarrollo (paralelo) |
| `npm run dev:web`      | Inicia solo el frontend Next.js                     |
| `npm run dev:api`      | Inicia solo el backend NestJS                       |
| `npm run build`        | Construye todas las apps                            |
| `npm run lint`         | Ejecuta el linter en todas las apps                 |
| `npm run format`       | Formatea el código con Prettier                     |
| `npm run format:check` | Verifica formato sin modificar                      |
| `npm run type-check`   | Verifica tipos TypeScript                           |
| `npm run test`         | Ejecuta tests                                       |
| `npm run clean`        | Limpia los archivos de build                        |

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
