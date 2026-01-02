# SANDBOX AUDIT - FASE 1: RECONOCIMIENTO

**Fecha:** 2026-01-02
**Objetivo:** Entender el estado actual del Sandbox SIN tocar código.

---

## 1. RUTAS Y PÁGINAS DEL SANDBOX

### Frontend (Next.js)

| Ruta                | Descripción                              |
| ------------------- | ---------------------------------------- |
| `/admin/sandbox`    | Página principal del editor de contenido |
| `/admin/contenidos` | Gestión de contenidos (lista/CRUD)       |

### Componentes Principales

```
apps/web/src/components/admin/views/sandbox/
├── SandboxView.tsx              # Vista principal con editor Monaco + preview
├── components/
│   ├── CodePreview.tsx          # Preview de componentes desde JSON
│   ├── DesignSystem.tsx         # Sistema de diseño y contexto de viewport
│   ├── JSONRenderer.tsx         # Renderiza componentes desde JSON
│   ├── LessonPlayer.tsx         # Player de lección completa
│   ├── PreviewErrorBoundary.tsx # Manejo de errores en preview
│   ├── PublishModal.tsx         # Modal de publicación
│   ├── SandboxIcons.tsx         # Iconos del editor
│   ├── SaveStatusIndicator.tsx  # Indicador de estado de guardado
│   ├── StudioSidebar.tsx        # Sidebar con componentes y fondos
│   ├── TreeSidebar.tsx          # Sidebar con árbol de nodos
│   ├── WelcomeScreen.tsx        # Pantalla inicial de configuración
│   └── index.ts                 # Re-exports
├── hooks/
│   ├── useAutoSave.ts           # Auto-guardado con debounce
│   ├── useDebounce.ts           # Hook de debounce genérico
│   └── index.ts                 # Re-exports
├── types/
│   ├── sandbox.types.ts         # Tipos TypeScript del frontend
│   └── index.ts                 # Re-exports
├── constants/
│   ├── sandbox.constants.ts     # Constantes (INITIAL_JSON, HOUSES)
│   └── index.ts                 # Re-exports
└── __tests__/
    ├── SandboxView.spec.tsx     # Tests de funciones helper del árbol
    ├── SandboxView.bugs.spec.tsx # Tests de bugs corregidos
    └── useAutoSave.spec.ts      # Tests del hook de auto-guardado
```

---

## 2. ENDPOINTS DE API

### Admin Routes (ContenidoAdminController)

Ubicación: [contenido-admin.controller.ts](apps/api/src/contenidos/controllers/contenido-admin.controller.ts)

| Método   | Endpoint                          | Descripción                          |
| -------- | --------------------------------- | ------------------------------------ |
| `POST`   | `/contenidos`                     | Crear contenido como BORRADOR        |
| `GET`    | `/contenidos`                     | Listar contenidos con filtros        |
| `GET`    | `/contenidos/:id`                 | Obtener contenido completo           |
| `GET`    | `/contenidos/:id/arbol`           | Obtener árbol jerárquico de nodos    |
| `PATCH`  | `/contenidos/:id`                 | Actualizar contenido (solo BORRADOR) |
| `DELETE` | `/contenidos/:id`                 | Eliminar contenido (solo BORRADOR)   |
| `POST`   | `/contenidos/:id/publicar`        | Publicar (BORRADOR → PUBLICADO)      |
| `POST`   | `/contenidos/:id/archivar`        | Archivar (PUBLICADO → ARCHIVADO)     |
| `POST`   | `/contenidos/:id/nodos`           | Agregar nodo a contenido             |
| `PATCH`  | `/contenidos/nodos/:nodoId`       | Actualizar nodo                      |
| `DELETE` | `/contenidos/nodos/:nodoId`       | Eliminar nodo                        |
| `PATCH`  | `/contenidos/:id/nodos/reordenar` | Reordenar nodos                      |
| `PATCH`  | `/contenidos/nodos/:nodoId/mover` | Mover nodo a otro padre              |

### Estudiante Routes (ContenidoEstudianteController)

Ubicación: [contenido-estudiante.controller.ts](apps/api/src/contenidos/controllers/contenido-estudiante.controller.ts)

| Método | Endpoint                              | Descripción                    |
| ------ | ------------------------------------- | ------------------------------ |
| `GET`  | `/contenidos/estudiante`              | Listar contenidos publicados   |
| `GET`  | `/contenidos/estudiante/:id`          | Obtener contenido con progreso |
| `POST` | `/contenidos/estudiante/:id/progreso` | Actualizar progreso            |

### API Client Frontend

Ubicación: [contenidos.api.ts](apps/web/src/lib/api/contenidos.api.ts)

---

## 3. MODELOS DE PRISMA INVOLUCRADOS

Ubicación: [schema.prisma](apps/api/prisma/schema.prisma) (líneas 237-370)

### Contenido (línea 237)

```prisma
model Contenido {
  id                String              @id @default(cuid())
  titulo            String
  casaTipo          CasaTipo            @map("casa_tipo")
  mundoTipo         MundoTipo           @map("mundo_tipo")
  estado            EstadoContenido     @default(BORRADOR)
  creadorId         String              @map("creador_id")
  descripcion       String?
  imagenPortada     String?             @map("imagen_portada")
  orden             Int                 @default(0)
  duracionMinutos   Int?                @map("duracion_minutos")
  fechaPublicacion  DateTime?           @map("fecha_publicacion")
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  creador           Admin               @relation(...)
  nodos             NodoContenido[]
  progresos         ProgresoContenido[]

  @@map("contenidos")
}
```

### NodoContenido (línea 293)

```prisma
model NodoContenido {
  id            String            @id @default(cuid())
  contenidoId   String            @map("contenido_id")
  parentId      String?           @map("parent_id")
  titulo        String
  bloqueado     Boolean           @default(false)
  orden         Int               @default(0)
  contenidoJson String?           @map("contenido_json") @db.Text
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  contenido     Contenido         @relation(fields: [contenidoId], ...)
  parent        NodoContenido?    @relation("NodoHijos", ...)
  hijos         NodoContenido[]   @relation("NodoHijos")

  @@map("nodos_contenido")
}
```

### ProgresoContenido (línea 343)

```prisma
model ProgresoContenido {
  id            String      @id @default(cuid())
  estudianteId  String      @map("estudiante_id")
  contenidoId   String      @map("contenido_id")
  nodoActualId  String?     @map("nodo_actual_id")
  completado    Boolean     @default(false)

  estudiante    Estudiante  @relation(...)
  contenido     Contenido   @relation(...)
  nodoActual    NodoContenido? @relation(...)

  @@unique([estudianteId, contenidoId])
  @@map("progreso_contenido")
}
```

### Enums Relacionados

```prisma
enum EstadoContenido {
  BORRADOR
  PUBLICADO
  ARCHIVADO
}

enum CasaTipo {
  QUANTUM   // 6-9 años
  VERTEX    // 10-13 años
  PULSAR    // 14-18 años
}

enum MundoTipo {
  MATEMATICA
  PROGRAMACION
  CIENCIAS
}
```

---

## 4. TESTS EXISTENTES

### Backend Tests

| Archivo                                                                        | Tests | Descripción          |
| ------------------------------------------------------------------------------ | ----- | -------------------- |
| [nodo.service.spec.ts](apps/api/src/contenidos/__tests__/nodo.service.spec.ts) | 6     | Tests de NodoService |

**Detalle de tests backend:**

| Test                                                      | Estado  |
| --------------------------------------------------------- | ------- |
| `BUG #4: moverNodo - Optimización de detección de ciclos` | ✅ PASS |
| `BUG #17: reordenar - Validación de seguridad (RECHAZAR)` | ✅ PASS |
| `BUG #17: reordenar - Validación de seguridad (ACEPTAR)`  | ✅ PASS |
| `BUG #18: getArbol - NotFoundException si no existe`      | ✅ PASS |
| `BUG #18: getArbol - retorna [] si existe pero vacío`     | ✅ PASS |
| `removeNodo - Cascade delete behavior`                    | ✅ PASS |

### Frontend Tests

| Archivo                                                                                                      | Tests | Descripción                         |
| ------------------------------------------------------------------------------------------------------------ | ----- | ----------------------------------- |
| [SandboxView.spec.tsx](apps/web/src/components/admin/views/sandbox/__tests__/SandboxView.spec.tsx)           | 17    | Tests de funciones helper del árbol |
| [SandboxView.bugs.spec.tsx](apps/web/src/components/admin/views/sandbox/__tests__/SandboxView.bugs.spec.tsx) | 4     | Tests de bugs corregidos            |
| [useAutoSave.spec.ts](apps/web/src/components/admin/views/sandbox/__tests__/useAutoSave.spec.ts)             | 5     | Tests del hook de auto-guardado     |

**Detalle de tests frontend:**

| Categoría                              | Tests | Estado              |
| -------------------------------------- | ----- | ------------------- |
| findNodoById                           | 4     | ✅ PASS             |
| updateNodoInTree                       | 4     | ✅ PASS             |
| addNodoToParent                        | 3     | ✅ PASS             |
| removeNodoFromTree                     | 3     | ✅ PASS             |
| countDescendants                       | 4     | ✅ PASS             |
| Confirmación de eliminación            | 3     | ✅ PASS             |
| BUG #2: Delete sin confirmación        | 2     | ✅ PASS             |
| BUG #3: handleRenameNodo doble request | 2     | ✅ PASS             |
| BUG #1: Pérdida de datos (useAutoSave) | 3     | ✅ PASS             |
| Status transitions                     | 2     | ✅ PASS (1 skipped) |

### E2E Tests

| Archivo                                                     | Descripción              |
| ----------------------------------------------------------- | ------------------------ |
| [07-sandbox.spec.ts](apps/web/tests/e2e/07-sandbox.spec.ts) | Tests E2E con Playwright |

---

## 5. COVERAGE ACTUAL

### Backend (Jest)

```
=============================== Coverage summary ===============================
Statements   : 0.73% ( 76/10284 )
Branches     : 0.4% ( 26/6380 )
Functions    : 0.81% ( 16/1968 )
Lines        : 0.72% ( 70/9677 )
================================================================================
```

**Nota:** El coverage reportado es del monorepo completo. El módulo de contenidos tiene tests específicos que cubren los bugs críticos corregidos.

### Frontend (Vitest)

```
Test Files: 3 passed (3)
Tests:      29 passed | 1 skipped (30)
Duration:   3.40s
```

---

## 6. FLUJO: ¿CÓMO SE CREA CONTENIDO?

### Paso 1: Inicio (WelcomeScreen)

El usuario selecciona:

1. **Casa** (QUANTUM/VERTEX/PULSAR)
2. **Mundo** (MATH/CODE/SCIENCE)
3. **Patrón** visual (decorativo)

### Paso 2: Creación en Backend

```
POST /contenidos
Body: { titulo, casaTipo, mundoTipo }
```

El backend crea:

1. Registro en tabla `contenidos` con `estado: BORRADOR`
2. **3 nodos raíz automáticamente** (Teoría, Práctica, Evaluación)
   - Estos nodos tienen `bloqueado: true`
   - No pueden ser eliminados ni renombrados

### Paso 3: Estructura del Árbol

```
Contenido (BORRADOR)
├── Teoría (bloqueado)
│   ├── Nodo Hoja 1 (editable con JSON)
│   └── Nodo Hoja 2 (editable con JSON)
├── Práctica (bloqueado)
│   └── Nodo Hoja 3 (editable con JSON)
└── Evaluación (bloqueado)
    └── (vacío)
```

### Paso 4: Edición de Nodos

- **Nodos contenedor** (con hijos): No editables, sirven para organizar
- **Nodos hoja** (sin hijos): Editables con JSON en `contenidoJson`

El JSON de cada nodo define los componentes visuales:

```json
{
  "type": "Stage",
  "props": {
    "background": "linear-gradient(...)"
  },
  "children": [
    {
      "type": "Title",
      "props": { "text": "Introducción" }
    },
    {
      "type": "Paragraph",
      "props": { "text": "Contenido..." }
    }
  ]
}
```

### Paso 5: Auto-guardado

El hook `useAutoSave` guarda automáticamente:

- Cambios en `contenidoJson` de nodos (debounce 1000ms)
- Cambios en metadata del contenido (título, etc.)
- `flushPendingChanges()` guarda inmediatamente antes de cambiar de nodo

### Paso 6: Publicación

```
POST /contenidos/:id/publicar
```

Transición: `BORRADOR` → `PUBLICADO`

- Valida que haya contenido
- Setea `fechaPublicacion`
- El contenido queda visible para estudiantes

---

## 7. DÓNDE SE GUARDA

### Base de Datos (PostgreSQL)

| Tabla                | Contenido                                              |
| -------------------- | ------------------------------------------------------ |
| `contenidos`         | Metadata: título, casa, mundo, estado, creador, fechas |
| `nodos_contenido`    | Estructura jerárquica + contenido JSON de cada slide   |
| `progreso_contenido` | Seguimiento de estudiantes                             |

### Estructura de Datos

```
contenido (1)
    │
    └── nodos (N) ─── relación recursiva
         │
         └── progreso_contenido (N por estudiante)
```

### JSON en `contenidoJson`

El campo `contenidoJson` en `NodoContenido` almacena un string JSON que el frontend parsea para renderizar los componentes visuales. El schema del JSON está documentado en [MATEATLETAS_STUDIO.md](docs/MATEATLETAS_STUDIO.md).

---

## 8. SERVICIOS BACKEND

### Módulo de Contenidos

Ubicación: [contenidos.module.ts](apps/api/src/contenidos/contenidos.module.ts)

| Servicio                      | Responsabilidad                            |
| ----------------------------- | ------------------------------------------ |
| `ContenidoAdminService`       | CRUD de contenidos                         |
| `ContenidoPublicacionService` | Transiciones de estado (publicar/archivar) |
| `NodoService`                 | CRUD de nodos + árbol jerárquico           |
| `ContenidoEstudianteService`  | Acceso para estudiantes                    |
| `ProgresoService`             | Seguimiento de progreso                    |

---

## 9. DOCUMENTACIÓN RELACIONADA

- [MATEATLETAS_STUDIO.md](docs/MATEATLETAS_STUDIO.md) - Diseño completo del sistema Studio

---

## 10. RESUMEN EJECUTIVO

### Estado Actual

- ✅ CRUD completo de contenidos y nodos
- ✅ Estructura jerárquica con 3 nodos raíz bloqueados
- ✅ Editor Monaco con preview en tiempo real
- ✅ Auto-guardado con debounce
- ✅ Publicación/Archivado de contenidos
- ✅ Tests unitarios de backend (6) y frontend (30)
- ✅ Bugs críticos corregidos (#2, #3, #4, #17, #18)

### Cobertura de Tests

| Área                    | Tests     | Estado       |
| ----------------------- | --------- | ------------ |
| Backend - NodoService   | 6         | ✅ 100% pass |
| Frontend - Tree helpers | 17        | ✅ 100% pass |
| Frontend - Bugs         | 4         | ✅ 100% pass |
| Frontend - useAutoSave  | 5         | ✅ 100% pass |
| E2E                     | 1 archivo | Existente    |

### Archivos Clave

```
📁 apps/api/src/contenidos/
├── 📁 controllers/
│   ├── contenido-admin.controller.ts    # 148 líneas
│   └── contenido-estudiante.controller.ts
├── 📁 services/
│   ├── contenido-admin.service.ts
│   ├── contenido-publicacion.service.ts
│   ├── nodo.service.ts                  # 396 líneas
│   ├── contenido-estudiante.service.ts
│   └── progreso.service.ts
├── 📁 dto/
│   └── (8 DTOs)
└── 📁 __tests__/
    └── nodo.service.spec.ts             # 352 líneas

📁 apps/web/src/components/admin/views/sandbox/
├── SandboxView.tsx                       # 971 líneas
├── 📁 components/ (11 componentes)
├── 📁 hooks/ (2 hooks)
├── 📁 types/ (1 archivo)
├── 📁 constants/ (1 archivo)
└── 📁 __tests/ (3 archivos de tests)
```
