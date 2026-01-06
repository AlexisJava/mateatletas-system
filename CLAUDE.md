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
