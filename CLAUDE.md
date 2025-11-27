# CLAUDE.md - Mateatletas

## REGLAS OBLIGATORIAS (HOOKS LAS ENFORZAN)

### TypeScript

- PROHIBIDO: `any`, `unknown` sin type guard, `@ts-ignore`, `@ts-nocheck`
- OBLIGATORIO: Tipos explicitos en funciones, interfaces para DTOs

### Arquitectura

- Clean Architecture: Controller -> Service -> Repository
- CQRS para operaciones complejas
- Un archivo = una responsabilidad

### Testing

- TDD: Test primero, codigo despues
- Coverage minimo 80% en codigo nuevo
- Nombres descriptivos: `should_[action]_when_[condition]`

### Commits

- NO commitear si hay errores de TypeScript
- NO commitear si hay warnings de ESLint
- Mensaje descriptivo: `tipo(scope): descripcion`

## STACK

- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js 15 + React + Tailwind
- Testing: Jest + React Testing Library
- Deploy: Railway + Vercel

## COMANDOS UTILES

```bash
npm run build          # Compilar
npm run lint:strict    # Lint sin warnings
npm run typecheck      # Verificar tipos
npm run test           # Tests
npm run validate       # Validacion completa
```

## ESTRUCTURA DEL PROYECTO

```
mateatletas/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   └── contracts/    # DTOs y tipos compartidos
├── docs/             # Documentacion
└── scripts/          # Scripts de utilidad
```

## CONVENCIONES

### Nombres de archivos

- Servicios: `*.service.ts`
- Controladores: `*.controller.ts`
- DTOs: `*.dto.ts`
- Tests: `*.spec.ts` o `*.test.ts`

### Imports

- Usar paths absolutos con alias `@/`
- Ordenar: externos, internos, relativos

### Git

- Branch principal: `main`
- Features: `feature/nombre-descriptivo`
- Fixes: `fix/descripcion-bug`
