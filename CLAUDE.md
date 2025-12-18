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
