# Guía de Desarrollo - Mateatletas

Guía completa para desarrolladores del proyecto Mateatletas.

## Herramientas de Calidad de Código

### ESLint

Configuración de ESLint para TypeScript con reglas de Prettier integradas.

**Configuración**: [.eslintrc.js](.eslintrc.js)

**Reglas principales**:

- Variables no utilizadas: error (excepto las que empiezan con `_`)
- `any` explícito: warning
- Integración con Prettier

**Uso**:

```bash
# Lint en todo el monorepo
npm run lint

# Lint solo en web
cd apps/web && npm run lint

# Lint solo en api
cd apps/api && npm run lint
```

### Prettier

Formateador de código automático para mantener consistencia.

**Configuración**: [.prettierrc](.prettierrc)

**Reglas**:

- Semi-colons: true
- Trailing commas: all
- Single quotes: true
- Print width: 100
- Tab width: 2
- End of line: lf

**Uso**:

```bash
# Formatear todos los archivos
npm run format

# Verificar formato sin modificar
npm run format:check
```

### TypeScript

Todos los proyectos usan TypeScript en **modo estricto**.

**Configuraciones**:

- Web: [apps/web/tsconfig.json](apps/web/tsconfig.json)
- API: [apps/api/tsconfig.json](apps/api/tsconfig.json)
- Shared: [packages/shared/tsconfig.json](packages/shared/tsconfig.json)

**Opciones estrictas habilitadas**:

- `strict`: true
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true

**Uso**:

```bash
# Verificar tipos en todo el monorepo
npm run type-check

# Verificar solo en web
cd apps/web && npm run type-check

# Verificar solo en api
cd apps/api && npm run type-check
```

## Scripts de Desarrollo

### Desarrollo

```bash
# Iniciar todas las apps en paralelo
npm run dev

# Iniciar solo el frontend (Next.js)
npm run dev:web

# Iniciar solo el backend (NestJS)
npm run dev:api
```

### Build

```bash
# Build de todas las apps
npm run build

# Build solo web
cd apps/web && npm run build

# Build solo api
cd apps/api && npm run build
```

### Testing

```bash
# Tests en todo el monorepo
npm run test

# Tests en api con coverage
cd apps/api && npm run test:cov

# Tests en modo watch
cd apps/api && npm run test:watch
```

### Limpieza

```bash
# Limpiar builds
npm run clean
```

## Configuración de VSCode

El proyecto incluye configuración recomendada para VSCode en [.vscode/settings.json](.vscode/settings.json).

**Características**:

- Formateo automático al guardar (Prettier)
- Auto-fix de ESLint al guardar
- Uso del TypeScript del workspace
- Configuración por tipo de archivo

**Extensiones recomendadas**:

- ESLint (dbaeumer.vscode-eslint)
- Prettier - Code formatter (esbenp.prettier-vscode)
- Prisma (Prisma.prisma)

## Flujo de Trabajo

### 1. Antes de Commitear

```bash
# Verificar tipos
npm run type-check

# Verificar linting
npm run lint

# Formatear código
npm run format

# Ejecutar tests
npm run test
```

### 2. Durante el Desarrollo

- Usa `npm run dev` para levantar todo el stack
- VSCode formateará automáticamente al guardar
- ESLint mostrará errores en tiempo real
- TypeScript verificará tipos en tiempo real

### 3. Pre-commit (Recomendado)

Considera instalar **husky** y **lint-staged** para ejecutar verificaciones automáticas:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

Ejemplo de `.husky/pre-commit`:

```bash
#!/bin/sh
npx lint-staged
```

Ejemplo de configuración en `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Turborepo

El monorepo usa Turborepo para gestionar builds y tareas.

**Configuración**: [turbo.json](turbo.json)

**Características**:

- Cache inteligente de builds
- Ejecución paralela de tareas
- Dependencias entre tareas
- Cacheo remoto (opcional)

**Tareas configuradas**:

- `build`: Construye apps y paquetes
- `dev`: Modo desarrollo (sin cache)
- `lint`: Linting
- `type-check`: Verificación de tipos
- `test`: Tests
- `clean`: Limpieza

## Estructura del Proyecto

```
mateatletas/
├── apps/
│   ├── web/          # Next.js 15
│   └── api/          # NestJS 11
├── packages/
│   └── shared/       # Tipos compartidos
├── .vscode/          # Configuración VSCode
├── .eslintrc.js      # ESLint config
├── .prettierrc       # Prettier config
├── .prettierignore   # Prettier ignore
├── turbo.json        # Turborepo config
└── package.json      # Root package
```

## Comandos Rápidos

| Comando                | Descripción                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Desarrollo full-stack                |
| `npm run dev:web`      | Solo frontend                        |
| `npm run dev:api`      | Solo backend                         |
| `npm run build`        | Build de producción                  |
| `npm run lint`         | Linting                              |
| `npm run format`       | Formatear código                     |
| `npm run format:check` | Verificar formato                    |
| `npm run type-check`   | Verificar tipos                      |
| `npm run test`         | Ejecutar tests                       |
| `npm run clean`        | Limpiar builds                       |
| `npx prisma studio`    | Abrir Prisma Studio (desde apps/api) |

## Troubleshooting

### Error: ESLint no funciona

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: Prettier no formatea

Verifica que tengas la extensión de Prettier instalada en VSCode:

```
ext install esbenp.prettier-vscode
```

### Error: TypeScript no encuentra tipos

```bash
# Regenerar tipos de Prisma
cd apps/api && npx prisma generate

# Reinstalar dependencias
npm install
```

### Conflictos de formato ESLint vs Prettier

La configuración ya incluye `eslint-config-prettier` que desactiva reglas de ESLint que
conflictan con Prettier.

## Mejores Prácticas

1. **Commits pequeños**: Hacer commits frecuentes y atómicos
2. **Mensajes descriptivos**: Usar mensajes de commit claros
3. **Formateo automático**: Dejar que Prettier maneje el formato
4. **Type-safety**: Aprovechar TypeScript al máximo
5. **Testing**: Escribir tests para lógica de negocio
6. **Code review**: Revisar código antes de mergear
7. **Documentación**: Documentar funciones y componentes complejos

## Recursos

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
