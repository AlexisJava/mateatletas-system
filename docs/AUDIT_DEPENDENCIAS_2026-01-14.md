# Auditoría de Dependencias - Mateatletas Ecosystem

**Fecha:** 2026-01-14
**Rama:** feature/game-engine
**Package Manager:** Yarn 4.10.3

---

## Resumen Ejecutivo

### Vulnerabilidades Críticas Encontradas

| Severidad    | Cantidad | Paquetes Afectados                                               |
| ------------ | -------- | ---------------------------------------------------------------- |
| **CRÍTICA**  | 1        | jspdf (CVE-2025-68428)                                           |
| **ALTA**     | 2        | xlsx (CVE-2023-30533, ReDoS)                                     |
| **MODERADA** | 2        | cache-manager-ioredis-yet (deprecated), eslint@8.x (unsupported) |

### Estado General

- **Total de workspaces:** 7 (root + 2 apps + 4 packages)
- **Dependencias directas:** ~120 únicas
- **Dependencias con updates críticos:** 15+
- **Dependencias obsoletas (deprecated):** 2

---

## 1. Estructura del Monorepo

```
mateatletas-ecosystem/
├── package.json (root)
├── apps/
│   ├── api/package.json (NestJS Backend)
│   └── web/package.json (Next.js Frontend)
└── packages/
    ├── contracts/package.json (@mateatletas/contracts)
    ├── ui/package.json (@mateatletas/ui)
    ├── game-engine/package.json (@mateatletas/game-engine)
    └── lesson-engine/package.json (@mateatletas/lesson-engine)
```

---

## 2. Vulnerabilidades de Seguridad

### 2.1 CRÍTICAS - Requieren Acción Inmediata

#### jspdf - CVE-2025-68428 (CVSS 9.2)

| Campo              | Valor                                 |
| ------------------ | ------------------------------------- |
| **Paquete**        | jspdf                                 |
| **Versión actual** | 3.0.3                                 |
| **Versión segura** | 4.0.0+                                |
| **Ubicación**      | apps/web                              |
| **Tipo**           | Local File Inclusion / Path Traversal |

**Descripción:** Permite la lectura arbitraria de archivos del sistema de archivos en deployments Node.js a través de métodos como `loadFile`, `addImage`, `html`, y `addFont`.

**Acción requerida:**

```bash
yarn workspace web add jspdf@^4.0.0
```

**Notas:** Solo afecta builds de Node.js. Browser builds no son vulnerables.

---

### 2.2 ALTAS - Requieren Acción Pronto

#### xlsx (SheetJS) - CVE-2023-30533 + ReDoS

| Campo              | Valor                          |
| ------------------ | ------------------------------ |
| **Paquete**        | xlsx                           |
| **Versión actual** | 0.18.5                         |
| **Versión segura** | 0.20.2+ (NO disponible en npm) |
| **Ubicación**      | apps/web                       |
| **Tipo**           | Prototype Pollution + ReDoS    |

**Problema:** La versión 0.18.5 en npm es la última publicada en el registro público, pero contiene vulnerabilidades conocidas. Las versiones parcheadas (0.20.x) solo están disponibles desde el CDN oficial de SheetJS.

**Acción requerida:**

```bash
# Remover la versión vulnerable
yarn workspace web remove xlsx

# Instalar desde CDN oficial
yarn workspace web add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

**Alternativa:** Considerar migrar a una librería alternativa como `exceljs` que tiene mantenimiento activo en npm.

---

### 2.3 MODERADAS

#### cache-manager-ioredis-yet (Deprecated)

| Campo              | Valor                     |
| ------------------ | ------------------------- |
| **Paquete**        | cache-manager-ioredis-yet |
| **Versión actual** | 2.1.2                     |
| **Estado**         | DEPRECATED                |
| **Ubicación**      | apps/api                  |

**Razón:** Con cache-manager v6+ se usa Keyv como adaptador de caché.

**Acción requerida:**

```bash
# Ya tienes @keyv/redis instalado. Remover el paquete deprecated:
yarn workspace api remove cache-manager-ioredis-yet

# Asegurarse de usar el patrón Keyv en lugar de ioredis directo
```

#### eslint@8.x (End of Life)

| Campo               | Valor               |
| ------------------- | ------------------- |
| **Paquete**         | eslint              |
| **Versión actual**  | 8.57.0 (web)        |
| **Versión estable** | 9.39.2              |
| **Próximo major**   | 10.0.0 (enero 2026) |
| **Ubicación**       | apps/web            |

**Nota:** ESLint 8.x ya no recibe soporte. ESLint 9.x usa flat config por defecto. ESLint 10 eliminará eslintrc completamente.

---

## 3. Dependencias Core - Comparación de Versiones

### 3.1 Framework Backend (NestJS)

| Paquete               | Versión Actual | Última Estable | Estado          | Breaking Changes |
| --------------------- | -------------- | -------------- | --------------- | ---------------- |
| @nestjs/core          | ^11.0.1        | 11.1.11        | ✅ OK           | No               |
| @nestjs/common        | ^11.0.1        | 11.1.11        | ⚠️ Minor update | No               |
| @nestjs/cli           | ^11.0.0        | 11.0.14        | ⚠️ Minor update | No               |
| @nestjs/swagger       | ^11.2.1        | 11.2.1         | ✅ Actualizado  | No               |
| @nestjs/jwt           | ^11.0.1        | 11.0.1         | ✅ Actualizado  | No               |
| @nestjs/passport      | ^11.0.5        | 11.0.5         | ✅ Actualizado  | No               |
| @nestjs/config        | ^4.0.2         | 4.0.2          | ✅ Actualizado  | No               |
| @nestjs/cache-manager | ^3.0.1         | 3.0.1          | ✅ Actualizado  | No               |
| @nestjs/throttler     | ^6.4.0         | 6.4.0          | ✅ Actualizado  | No               |
| @nestjs/terminus      | ^11.0.0        | 11.0.0         | ✅ Actualizado  | No               |
| @nestjs/bullmq        | ^11.0.4        | 11.0.4         | ✅ Actualizado  | No               |
| @nestjs/websockets    | ^11.1.11       | 11.1.11        | ✅ Actualizado  | No               |

**Veredicto NestJS:** El stack NestJS está bien actualizado en v11.x.

---

### 3.2 Framework Frontend (Next.js + React)

| Paquete   | Versión Actual | Última Estable | Estado          | Breaking Changes   |
| --------- | -------------- | -------------- | --------------- | ------------------ |
| next      | ^15.5.9        | 16.1.1         | 🔴 Major atrás  | SÍ - PPR, proxy.ts |
| react     | 19.1.4         | 19.2.3         | ⚠️ Minor update | No                 |
| react-dom | 19.1.4         | 19.2.3         | ⚠️ Minor update | No                 |

**Notas sobre Next.js 16:**

- Next.js 16 incluye Cache Components con PPR y `use cache`
- Middleware fue reemplazado por `proxy.ts`
- Mejoras significativas en Turbopack
- **CVE-2025-66478** - Todas las versiones 15.x y 16.x deben actualizarse por seguridad

**Acción recomendada:** Planificar migración a Next.js 16.x

---

### 3.3 Base de Datos (Prisma)

| Paquete        | Versión Actual | Última Estable | Estado         | Breaking Changes |
| -------------- | -------------- | -------------- | -------------- | ---------------- |
| prisma         | 6.18.0         | 7.2.0          | 🔴 Major atrás | SÍ               |
| @prisma/client | 6.18.0         | 7.2.0          | 🔴 Major atrás | SÍ               |

**Notas sobre Prisma 7:**

- Client migrado de Rust a TypeScript puro
- ~90% reducción en bundle size
- Queries más rápidas
- Menor uso de CPU
- 98% menos tipos para evaluar schemas
- 70% más rápido en type checking

**Acción recomendada:** Prisma 7 es un upgrade significativo. Evaluar migración después de estabilizar el codebase actual.

---

### 3.4 Testing

| Paquete              | Versión Actual | Última Estable | Estado          | Breaking Changes  |
| -------------------- | -------------- | -------------- | --------------- | ----------------- |
| jest                 | ^30.0.0        | 30.2.0         | ⚠️ Minor update | No                |
| vitest (web)         | ^4.0.3         | 4.0.16         | ⚠️ Patch update | No                |
| vitest (contracts)   | ^1.0.4         | 4.0.16         | 🔴 Major atrás  | SÍ - Browser Mode |
| vitest (ui)          | ^1.0.4         | 4.0.16         | 🔴 Major atrás  | SÍ                |
| vitest (game-engine) | ^2.0.0         | 4.0.16         | 🔴 Major atrás  | SÍ                |
| @playwright/test     | ^1.56.0        | 1.55.0         | ✅ Actualizado  | No                |
| ts-jest              | ^29.2.5        | 29.2.5         | ✅ Actualizado  | No                |

**Notas sobre Vitest 4:**

- Browser Mode ahora es estable
- Visual Regression Testing incluido
- Playwright Traces para debugging
- 17M+ descargas semanales

---

### 3.5 State Management & Data Fetching

| Paquete                        | Versión Actual | Última Estable | Estado          | Breaking Changes |
| ------------------------------ | -------------- | -------------- | --------------- | ---------------- |
| zustand                        | ^5.0.9         | 5.0.10         | ✅ OK           | No               |
| @tanstack/react-query          | ^5.90.5        | 5.90.16        | ✅ OK           | No               |
| @tanstack/react-query-devtools | ^5.90.2        | 5.90.16        | ⚠️ Patch update | No               |

---

### 3.6 Styling & Animation

| Paquete                | Versión Actual | Última Estable | Estado          | Breaking Changes |
| ---------------------- | -------------- | -------------- | --------------- | ---------------- |
| tailwindcss            | ^4             | 4.1.x          | ✅ OK           | No               |
| framer-motion          | ^12.23.24      | 12.26.2        | ⚠️ Patch update | No               |
| framer-motion (ui)     | ^11.15.0       | 12.26.2        | 🔴 Major atrás  | Posible          |
| framer-motion (lesson) | ^11.15.0       | 12.26.2        | 🔴 Major atrás  | Posible          |

---

### 3.7 TypeScript & Linting

| Paquete                | Versión Actual | Última Estable | Estado          | Breaking Changes |
| ---------------------- | -------------- | -------------- | --------------- | ---------------- |
| typescript (root)      | ^5.6.3         | 5.9.x          | ⚠️ Minor update | No               |
| typescript (api)       | ^5.7.3         | 5.9.x          | ⚠️ Minor update | No               |
| typescript (contracts) | ^5.3.3         | 5.9.x          | ⚠️ Minor update | No               |
| eslint (root)          | ^9.37.0        | 9.39.2         | ⚠️ Minor update | No               |
| eslint (api)           | ^9.18.0        | 9.39.2         | ⚠️ Minor update | No               |
| eslint (web)           | ^8.57.0        | 9.39.2         | 🔴 EOL          | SÍ - Flat config |
| @typescript-eslint/\*  | ^8.46.0        | 8.46.0         | ✅ Actualizado  | No               |

**Notas:**

- TypeScript 6.0 será un "bridge release" hacia TypeScript 7.0 (reescrito en Go)
- ESLint 10.0 viene en enero 2026, elimina eslintrc completamente

---

### 3.8 Game Engine

| Paquete | Versión Actual | Última Estable   | Estado          | Breaking Changes |
| ------- | -------------- | ---------------- | --------------- | ---------------- |
| phaser  | ^3.80.0        | 3.90.0 "Tsugumi" | ⚠️ Minor update | No               |

**Notas:** Phaser 4 está en Beta 5 (enero 2025), es un port a TypeScript sin cambios de API.

---

### 3.9 LiveKit (Video/Audio)

| Paquete                   | Versión Actual | Última Estable | Estado | Breaking Changes |
| ------------------------- | -------------- | -------------- | ------ | ---------------- |
| livekit-server-sdk        | ^2.15.0        | 2.x (latest)   | ✅ OK  | No               |
| livekit-client            | ^2.16.1        | 2.x (latest)   | ✅ OK  | No               |
| @livekit/components-react | ^2.9.17        | 2.x (latest)   | ✅ OK  | No               |

---

### 3.10 Queue & Cache

| Paquete | Versión Actual | Última Estable | Estado         | Breaking Changes |
| ------- | -------------- | -------------- | -------------- | ---------------- |
| bullmq  | ^5.66.2        | 5.66.5         | ✅ OK          | No               |
| redis   | ^5.8.3         | 5.8.3          | ✅ Actualizado | No               |
| keyv    | ^5.5.3         | 5.5.3          | ✅ Actualizado | No               |
| ioredis | ^5.8.2         | 5.8.2          | ✅ Actualizado | No               |

---

### 3.11 Forms & Validation

| Paquete             | Versión Actual | Última Estable | Estado         | Breaking Changes |
| ------------------- | -------------- | -------------- | -------------- | ---------------- |
| zod (web)           | ^3.25.76       | 4.3.5          | 🔴 Major atrás | SÍ               |
| zod (contracts)     | ^3.22.4        | 4.3.5          | 🔴 Major atrás | SÍ               |
| react-hook-form     | ^7.67.0        | 7.67.0         | ✅ Actualizado | No               |
| @hookform/resolvers | ^5.2.2         | 5.2.2          | ✅ Actualizado | No               |

**Notas sobre Zod 4:**

- Lanzado el 10 de julio 2025
- Mejor performance y nuevas features
- Posible importar JSON Schema directamente
- v3.25.0+ incluye copias de Zod 3 y 4 para migración gradual

---

## 4. Dependencias Duplicadas entre Workspaces

### 4.1 Inconsistencias Detectadas

| Dependencia   | root    | api     | web       | contracts | ui       | game-engine | lesson-engine |
| ------------- | ------- | ------- | --------- | --------- | -------- | ----------- | ------------- |
| typescript    | ^5.6.3  | ^5.7.3  | -         | ^5.3.3    | ^5.6.3   | ^5.7.0      | ^5.7.0        |
| eslint        | ^9.37.0 | ^9.18.0 | ^8.57.0   | ^9.0.0    | ^9.0.0   | ^9.0.0      | ^9.0.0        |
| vitest        | -       | -       | ^4.0.3    | ^1.0.4    | ^1.0.4   | ^2.0.0      | -             |
| @types/react  | 19.2.2  | -       | ^19.2.2   | -         | ^19.2.2  | ^19.0.0     | ^19.0.0       |
| framer-motion | -       | -       | ^12.23.24 | -         | ^11.15.0 | -           | ^11.15.0      |
| lucide-react  | -       | -       | ^0.545.0  | -         | ^0.562.0 | -           | ^0.562.0      |

### 4.2 Recomendaciones de Consolidación

1. **TypeScript:** Unificar a `^5.9.x` en root
2. **ESLint:** Migrar web de 8.x a 9.x, unificar en root
3. **Vitest:** Unificar a `^4.0.x` en todos los packages
4. **framer-motion:** Unificar a `^12.x` en todos los packages
5. **lucide-react:** Unificar versión en todos los packages

---

## 5. Dependencias para Mover a Root

Estas dependencias están duplicadas y deberían consolidarse en el root `package.json`:

```json
{
  "devDependencies": {
    "typescript": "^5.9.0",
    "eslint": "^9.39.0",
    "@typescript-eslint/eslint-plugin": "^8.46.0",
    "@typescript-eslint/parser": "^8.46.0",
    "vitest": "^4.0.16",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2"
  }
}
```

---

## 6. Plan de Actualización Priorizado

### 6.1 Inmediato (Seguridad) - Esta semana

| Prioridad | Paquete                   | Acción                                      |
| --------- | ------------------------- | ------------------------------------------- |
| 🔴 P0     | jspdf                     | Actualizar a ^4.0.0                         |
| 🔴 P0     | xlsx                      | Migrar a CDN oficial (0.20.3) o alternativa |
| 🟠 P1     | cache-manager-ioredis-yet | Remover (deprecated)                        |
| 🟠 P1     | eslint@web                | Migrar de 8.x a 9.x                         |

### 6.2 Corto Plazo - Próximas 2 semanas

| Prioridad | Paquete           | Acción              |
| --------- | ----------------- | ------------------- |
| 🟡 P2     | vitest (packages) | Unificar a ^4.0.x   |
| 🟡 P2     | framer-motion     | Unificar a ^12.x    |
| 🟡 P2     | typescript        | Unificar a ^5.9.x   |
| 🟡 P2     | lucide-react      | Unificar versión    |
| 🟡 P2     | react/react-dom   | Actualizar a 19.2.3 |

### 6.3 Mediano Plazo - Próximo mes

| Prioridad | Paquete | Acción                   |
| --------- | ------- | ------------------------ |
| 🟢 P3     | Next.js | Evaluar migración a 16.x |
| 🟢 P3     | Zod     | Evaluar migración a 4.x  |
| 🟢 P3     | Phaser  | Actualizar a 3.90.0      |

### 6.4 Largo Plazo - Próximo trimestre

| Prioridad | Paquete    | Acción                  |
| --------- | ---------- | ----------------------- |
| 🔵 P4     | Prisma     | Evaluar migración a 7.x |
| 🔵 P4     | ESLint     | Preparar para 10.0      |
| 🔵 P4     | TypeScript | Preparar para 6.0/7.0   |

---

## 7. Comandos de Actualización

### Seguridad Inmediata

```bash
# jspdf - Fix CVE-2025-68428
yarn workspace web add jspdf@^4.0.0

# xlsx - Migrar desde CDN oficial
yarn workspace web remove xlsx
yarn workspace web add https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz

# Remover deprecated
yarn workspace api remove cache-manager-ioredis-yet
```

### ESLint Migration (web)

```bash
# Actualizar eslint en web
yarn workspace web add -D eslint@^9.39.0 eslint-config-next@latest

# Migrar configuración de .eslintrc a eslint.config.mjs
```

### Unificación de Vitest

```bash
# Actualizar en cada package
yarn workspace @mateatletas/contracts add -D vitest@^4.0.16
yarn workspace @mateatletas/ui add -D vitest@^4.0.16
yarn workspace @mateatletas/game-engine add -D vitest@^4.0.16
```

---

## 8. Resumen de Riesgos

| Riesgo                   | Impacto | Probabilidad              | Mitigación                 |
| ------------------------ | ------- | ------------------------- | -------------------------- |
| jspdf LFI                | CRÍTICO | Alta si se usa loadFile() | Actualizar inmediatamente  |
| xlsx Prototype Pollution | ALTO    | Media                     | Migrar a CDN o alternativa |
| Next.js 15.x sin parches | MEDIO   | Media                     | Planificar upgrade a 16.x  |
| ESLint 8.x sin soporte   | BAJO    | Baja                      | Migrar a 9.x               |
| Prisma 6.x vs 7.x        | BAJO    | Baja                      | Evaluar cuando estabilice  |

---

## 9. Referencias

### Fuentes de Versiones

- [NestJS Releases](https://github.com/nestjs/nest/releases)
- [Next.js Blog](https://nextjs.org/blog)
- [Prisma Changelog](https://www.prisma.io/changelog)
- [React Versions](https://react.dev/versions)
- [TypeScript Releases](https://github.com/microsoft/typescript/releases)
- [ESLint Release Notes](https://eslint.org/blog/category/release-notes/)
- [Vitest Blog](https://vitest.dev/blog/vitest-4)
- [Playwright Release Notes](https://playwright.dev/docs/release-notes)

### CVEs Relevantes

- [CVE-2025-68428 - jsPDF Path Traversal](https://www.cvedetails.com/cve/CVE-2025-68428/)
- [CVE-2023-30533 - SheetJS Prototype Pollution](https://security.snyk.io/vuln/SNYK-JS-XLSX-5457926)
- [CVE-2025-66478 - Next.js/React Security](https://github.com/vercel/next.js/discussions/86939)

---

**Generado automáticamente por Claude Code**
**Próxima auditoría recomendada:** 2026-02-14
