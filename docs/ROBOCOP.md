# 🚔 ROBOCOP - Sistema de Enforcement de Calidad

## ¿Qué es ROBOCOP?

ROBOCOP es el sistema de enforcement automático de calidad de código en Mateatletas.
Bloquea commits que no cumplan con los estándares de calidad.

**Principio fundamental**: Código que no cumple las reglas NO ENTRA. Punto.

---

## Reglas Activas

### 1. TypeScript Estricto (0 errores permitidos)

El código debe compilar sin errores de TypeScript.

**Verificación**: `npm run typecheck`

**Bloquea si**:

- Hay errores de tipo
- Hay tipos implícitos `any`
- Hay propiedades faltantes
- Hay nulls no manejados

### 2. ESLint Estricto (0 warnings permitidos)

El código debe pasar ESLint sin warnings.

**Verificación**: `npm run lint:strict`

**Reglas NO NEGOCIABLES**:

| Regla                            | Descripción                            | Prohibe                  |
| -------------------------------- | -------------------------------------- | ------------------------ |
| `no-explicit-any`                | Prohibir `any` explícito               | `let x: any`             |
| `no-unsafe-assignment`           | Prohibir asignaciones inseguras        | `const x = untypedValue` |
| `no-unsafe-call`                 | Prohibir llamadas inseguras            | `unknownFunc()`          |
| `no-unsafe-member-access`        | Prohibir acceso inseguro a propiedades | `unknown.prop`           |
| `no-unsafe-return`               | Prohibir retornos inseguros            | `return untypedValue`    |
| `no-unsafe-argument`             | Prohibir argumentos inseguros          | `func(unknownValue)`     |
| `ban-ts-comment`                 | Prohibir `@ts-ignore` y `@ts-nocheck`  | `// @ts-ignore`          |
| `explicit-function-return-type`  | Obligar tipos de retorno explícitos    | `function foo() {}`      |
| `explicit-module-boundary-types` | Obligar tipos en exports               | `export function foo()`  |
| `no-floating-promises`           | Obligar manejo de promesas             | `asyncFunc();` sin await |
| `no-unused-vars`                 | Prohibir variables no usadas           | `const unused = 1;`      |
| `no-console`                     | Prohibir console.log                   | `console.log(...)`       |

### 3. Prettier (formato consistente)

El código debe estar formateado con Prettier.

**Verificación**: Automático en lint-staged

---

## Cómo Funciona

### En cada commit (pre-commit hook):

```
                    ┌─────────────────────────────────┐
                    │       git commit -m "..."        │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   🚔 ROBOCOP: pre-commit hook    │
                    └───────────────┬─────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │ TypeScript │   │  ESLint   │   │  Prettier │
            │   check    │   │  strict   │   │   format  │
            └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                  │               │               │
                  ▼               ▼               ▼
            ┌─────────────────────────────────────────┐
            │             ¿Todo OK?                    │
            └───────────────┬─────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼                           ▼
        ┌─────────┐                 ┌─────────┐
        │   NO    │                 │   SÍ    │
        │ ❌ BLOCK │                 │ ✅ PASS  │
        └─────────┘                 └─────────┘
```

---

## Comandos de Verificación

```bash
# Verificar TypeScript (debe dar 0 errores)
npm run typecheck

# Verificar ESLint (debe dar 0 warnings)
npm run lint:strict

# Verificar todo (TypeScript + ESLint)
npm run quality

# Verificación completa (Quality + Tests)
npm run quality:full
```

---

## ¿Cómo Bypasear?

**RESPUESTA CORTA**: No se bypasea.

**RESPUESTA LARGA**: Si necesitas hacer un commit urgente sin pasar las verificaciones:

```bash
git commit --no-verify -m "mensaje"
```

⚠️ **ADVERTENCIA**:

- Esto está prohibido en código de producción
- Será detectado en code review
- Quien lo use tendrá que explicar por qué

---

## Arreglar Errores Comunes

### Error: `any` implícito

```typescript
// ❌ Mal
function foo(param) {
  return param;
}

// ✅ Bien
function foo(param: string): string {
  return param;
}
```

### Error: `@ts-ignore`

```typescript
// ❌ Mal
// @ts-ignore
const x = somethingWeird();

// ✅ Bien - Arreglar el error de tipo real
const x: ProperType = somethingWeird();
```

### Error: `console.log`

```typescript
// ❌ Mal
console.log('debug');

// ✅ Bien - Usar el logger
this.logger.debug('debug');
```

### Error: Variables sin usar

```typescript
// ❌ Mal
const unused = 1;

// ✅ Bien - Prefijo con underscore si es intencional
const _intentionallyUnused = 1;

// ✅ Mejor - Eliminarlo si no se usa
```

### Error: Promesa sin await

```typescript
// ❌ Mal
asyncFunction(); // Floating promise

// ✅ Bien
await asyncFunction();

// ✅ También bien
void asyncFunction(); // Si realmente no te importa el resultado
```

---

## Configuración

### Archivos de configuración:

| Archivo                        | Propósito                    |
| ------------------------------ | ---------------------------- |
| `.husky/pre-commit`            | Hook que ejecuta ROBOCOP     |
| `apps/api/eslint.config.mjs`   | Reglas de ESLint             |
| `apps/api/tsconfig.json`       | Configuración TypeScript     |
| `package.json` → `lint-staged` | Comandos por tipo de archivo |

---

## FAQ

### ¿Por qué es tan estricto?

Porque código malo cuesta más arreglarlo después que prevenirlo ahora.

### ¿Y si tengo un caso legítimo para usar `any`?

No existe tal cosa. Si crees que sí, pregunta en code review.

### ¿Esto ralentiza los commits?

Sí, unos segundos. Pero ahorra horas de debugging de errores de tipos.

### ¿Funciona en CI?

Los mismos comandos (`npm run quality`) se ejecutan en CI.

---

## Historial

- **2024-11-30**: Implementación inicial de ROBOCOP
  - TypeScript strict mode
  - ESLint con reglas NO NEGOCIABLES
  - Pre-commit hook con bloqueo
