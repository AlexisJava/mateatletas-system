# TypeScript Quality Rules - Mateatletas

## 🎯 Objetivo

**Prevenir código de baja calidad en NUEVOS archivos**, sin romper código legacy existente.

---

## 🚫 Reglas Prohibidas (Solo en archivos NUEVOS/MODIFICADOS)

### 1. Prohibido usar `any`

❌ **MAL:**

```typescript
function procesarDatos(data: any) {
  // ❌ BLOQUEADO en commit
  return data.algo;
}
```

✅ **BIEN:**

```typescript
interface DatosUsuario {
  id: string;
  nombre: string;
}

function procesarDatos(data: DatosUsuario) {
  // ✅ OK
  return data.nombre;
}
```

### 2. Prohibido variables no usadas

❌ **MAL:**

```typescript
function calcular(x: number, y: number) {
  // ❌ 'y' no usado
  return x * 2;
}
```

✅ **BIEN:**

```typescript
// Si no vas a usar el parámetro, prefix con '_'
function calcular(x: number, _y: number) {
  // ✅ OK
  return x * 2;
}

// O elimínalo
function calcular(x: number) {
  // ✅ OK
  return x * 2;
}
```

### 3. Prohibido `any` implícito en operaciones

❌ **MAL:**

```typescript
const data: any = await fetch('/api');
data.map((item) => item.name); // ❌ BLOQUEADO (any implícito)
```

✅ **BIEN:**

```typescript
interface Item {
  name: string;
}

const data: Item[] = await fetch('/api');
data.map((item) => item.name); // ✅ OK (typed)
```

---

## ⚙️ Cómo Funciona

### Para Código Legacy (Existente)

**ESLint en modo permisivo:**

```bash
npm run lint  # Solo warnings, NO bloquea
```

### Para Código Nuevo (Modificado/Staged)

**Git hook con reglas ESTRICTAS:**

```bash
git add mi-nuevo-archivo.ts
git commit -m "feat: nueva feature"

# → Hook ejecuta ESLint STRICT automáticamente
# → Si usa 'any' → ❌ COMMIT BLOQUEADO
# → Si tipos correctos → ✅ COMMIT OK
```

---

## 📜 Configuración Técnica

### 1. ESLint Global (apps/api/eslint.config.mjs)

**Permisivo para no romper legacy:**

```javascript
rules: {
  '@typescript-eslint/no-explicit-any': 'warn',  // Solo advertencia
  '@typescript-eslint/no-unsafe-argument': 'warn',
}
```

### 2. lint-staged (package.json)

**Estricto SOLO en archivos staged:**

```json
"lint-staged": {
  "apps/**/*.{ts,tsx}": [
    "eslint --fix --rule '@typescript-eslint/no-explicit-any: error'"
  ]
}
```

**Esto significa:**

- Código existente: warnings (no bloquea)
- Código nuevo/modificado: errors (SÍ bloquea commit)

---

## 🧪 Probar las Reglas

### Test 1: Crear archivo CON `any`

```bash
# Crear archivo con 'any'
echo "export function test(data: any) { return data; }" > test-any.ts

# Intentar commit
git add test-any.ts
git commit -m "test"

# Resultado: ❌ BLOQUEADO
# Error: '@typescript-eslint/no-explicit-any'
```

### Test 2: Crear archivo SIN `any`

```bash
# Crear archivo tipado
echo "export function test(data: string) { return data; }" > test-typed.ts

# Intentar commit
git add test-typed.ts
git commit -m "test"

# Resultado: ✅ COMMIT OK
```

---

## 🔧 Excepciones Permitidas

### 1. Tests (mocks)

```typescript
// OK en tests
const mockData = { foo: 'bar' } as any;
```

### 2. Migraciones graduales

```typescript
// Temporal mientras migras
// TODO: Tipar correctamente
const legacyData: any = oldFunction();
```

### 3. External APIs sin types

```typescript
// Si librería externa no tiene types
import externalLib from 'no-types-library';
const result: any = externalLib.method(); // Temporal
```

**PERO:** Documentar con comentario `// TODO: Add types`

---

## 🎓 Mejores Prácticas

### Usar tipos correctos

```typescript
// ❌ MAL
function getUser(id: any): any {
  return database.find(id);
}

// ✅ BIEN
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  return database.find(id);
}
```

### Inferir tipos cuando sea posible

```typescript
// ✅ BIEN - TypeScript infiere el tipo
const users = await prisma.user.findMany(); // User[]

// ❌ INNECESARIO
const users: any = await prisma.user.findMany();
```

### Usar `unknown` en lugar de `any`

```typescript
// ❌ MAL - 'any' permite cualquier cosa
function procesarError(error: any) {
  console.log(error.message); // No type checking
}

// ✅ BIEN - 'unknown' requiere type guard
function procesarError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message); // ✅ Type-safe
  }
}
```

---

## 📊 Migración Gradual

### Estrategia Recomendada

1. **No tocar código legacy** (miles de errores)
2. **Aplicar reglas SOLO en nuevo código** (pre-commit hook)
3. **Refactorizar legacy cuando lo toques** (gradual)

### Timeline

```
Mes 1: Reglas activas → Previene nuevo código malo
Mes 2-3: Refactor gradual cuando tocamos archivos
Mes 6: ~80% del código tipado correctamente
Año 1: Código legacy migrado completamente
```

---

## 🚨 Saltarse las Reglas (EMERGENCIAS)

### Opción 1: Commit sin verificar

```bash
git commit --no-verify -m "hotfix crítico"
```

**⚠️ SOLO usar en:**

- Hotfix de producción urgente
- Deploy bloqueado por regla falsa positiva

### Opción 2: Disable comentario

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const urgentFix: any = externalBrokenLibrary();
```

**⚠️ DEBE incluir:**

- Comentario explicando por qué
- Issue/ticket para arreglarlo después

---

## 📈 Métricas de Calidad

### Comandos útiles

```bash
# Ver cuántos 'any' hay en el proyecto
grep -r ": any" apps/ --include="*.ts" | wc -l

# Ver archivos con más 'any'
grep -r ": any" apps/ --include="*.ts" | cut -d: -f1 | uniq -c | sort -nr | head -10

# Ejecutar ESLint strict manualmente
npx eslint apps/api/src --rule '@typescript-eslint/no-explicit-any: error'
```

---

## 🎯 Objetivos

### Corto Plazo (1-2 semanas)

- [x] Reglas configuradas
- [ ] 0 `any` en código nuevo
- [ ] Equipo entrenado en mejores prácticas

### Mediano Plazo (1-3 meses)

- [ ] Refactorizar top 10 archivos con más `any`
- [ ] Agregar tipos a DTOs legacy
- [ ] Migrar servicios críticos (auth, pagos)

### Largo Plazo (6-12 meses)

- [ ] 100% código tipado correctamente
- [ ] 0 `any` en todo el proyecto
- [ ] Habilitar reglas strict en ESLint global

---

## 📚 Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript ESLint](https://typescript-eslint.io/rules/)
- [Effective TypeScript (Book)](https://effectivetypescript.com/)

---

**Última actualización:** 21 de Octubre, 2025
**Política aprobada por:** Equipo de desarrollo
