# PLAN DE CONSTRUCCIÓN - MATEATLETAS STUDIO

> Fecha: 2024-11-29
> Estado: Aprobado para ejecución

---

## RESUMEN EJECUTIVO

El Planificador (Studio) se construye en **4 fases secuenciales**. Cada fase debe estar 100% completa y testeada antes de pasar a la siguiente.

| Fase | Nombre               | Qué construye                 | Dependencias |
| ---- | -------------------- | ----------------------------- | ------------ |
| 1    | Fundamentos          | DB + API + Recursos           | Ninguna      |
| 2    | Wizard               | UI 6 pasos + Plantilla JSON   | Fase 1       |
| 3    | Editor               | Carga semanas + Validador     | Fase 2       |
| 4    | Preview + Biblioteca | Visualización + Reutilización | Fase 3       |

---

## REGLAS DE DESARROLLO

### Proceso

1. **No avanzar de fase sin completar la anterior**
2. **Cada fase debe tener tests antes de considerar terminada**
3. **Commits pequeños y frecuentes**
4. **Revisar juntos al final de cada fase**
5. **Si algo no está claro, preguntar antes de asumir**

### TDD (Test-Driven Development)

- **Primero el test, después el código**
- Cobertura mínima 80%
- Tests unitarios para cada función/servicio
- Tests de integración para cada endpoint
- Tests E2E para flujos críticos

### TypeScript Estricto

| Regla                             | Acción                                        |
| --------------------------------- | --------------------------------------------- |
| `any`                             | **PROHIBIDO** - Usar tipos explícitos siempre |
| `unknown` sin type guard          | **PROHIBIDO** - Validar antes de usar         |
| `@ts-ignore` / `@ts-expect-error` | **PROHIBIDO** - Resolver el problema          |
| `as` / `!` sin justificación      | **PROHIBIDO** - Evitar casteos forzados       |
| Tipos en parámetros y retornos    | **OBLIGATORIO**                               |
| Interfaces para objetos           | **OBLIGATORIO**                               |

### Seguridad

- **Validar TODOS los inputs** - Nunca confiar en datos del cliente
- **Sanitizar antes de guardar en DB**
- **Verificar permisos en cada endpoint** - ¿Este usuario puede hacer esto?
- **No exponer errores internos al cliente**
- **Rate limiting en endpoints sensibles**
- **Tokens JWT httpOnly** - Nunca en localStorage

### Clean Architecture

- **Separar concerns** - Controller → Service → Repository
- **DTOs** para entrada/salida de API
- **Entities** para lógica de negocio
- **Vertical slices** cuando corresponda

### Código

- **Analizar CAUSA RAÍZ**, no parchar
- **Nombres descriptivos** - El código se explica solo
- **Funciones pequeñas** - Una responsabilidad
- **Sin código comentado** - Si no sirve, se borra

---

## FASE 1: FUNDAMENTOS

**Objetivo:** Tener la base de datos y API funcionando para que el resto pueda construirse encima.

### 1.1 Schemas de Base de Datos (Prisma)

Crear los modelos necesarios:

```prisma
// Curso (la plantilla madre)
model Curso {
  id              String        @id @default(uuid())
  nombre          String
  descripcion     String

  // Clasificación
  categoria       CategoriaType // EXPERIENCIA | CURRICULAR
  mundo           MundoType     // MATEMATICA | PROGRAMACION | CIENCIAS
  casa            CasaType      // QUANTUM | VERTEX | PULSAR
  tierMinimo      TierType      // ARCADE | ARCADE_PLUS | PRO

  // Tipo específico
  tipoExperiencia TipoExperiencia?
  materia         Materia?

  // Estética
  esteticaBase    String
  esteticaVariante String?

  // Duración
  cantidadSemanas Int
  actividadesPorSemana Int

  // Estado
  estado          EstadoCurso   // DRAFT | EN_PROGRESO | EN_REVISION | PUBLICADO

  // Publicación
  landingMundo    Boolean       @default(false)
  landingHome     Boolean       @default(false)
  catalogoInterno Boolean       @default(false)
  notificarUpgrade Boolean      @default(false)
  fechaVenta      DateTime?
  fechaDisponible DateTime?

  // Relaciones
  semanas         Semana[]
  recursos        Recurso[]

  // Timestamps
  creadoEn        DateTime      @default(now())
  actualizadoEn   DateTime      @updatedAt

  @@map("cursos")
}

// Semana
model Semana {
  id              String        @id @default(uuid())
  cursoId         String
  curso           Curso         @relation(fields: [cursoId], references: [id])

  numero          Int
  nombre          String?
  descripcion     String?

  // Contenido completo en JSON (el schema definido en el documento)
  contenido       Json?

  // Estado
  estado          EstadoSemana  // VACIA | COMPLETA

  // Timestamps
  creadoEn        DateTime      @default(now())
  actualizadoEn   DateTime      @updatedAt

  @@unique([cursoId, numero])
  @@map("semanas")
}

// Recurso (imágenes, audios, etc.)
model Recurso {
  id              String        @id @default(uuid())
  cursoId         String
  curso           Curso         @relation(fields: [cursoId], references: [id])

  tipo            TipoRecurso   // IMAGEN | AUDIO | VIDEO | DOCUMENTO
  nombre          String        // Nombre original del archivo
  archivo         String        // Path en el servidor
  tamanioBytes    Int

  // Timestamps
  creadoEn        DateTime      @default(now())

  @@map("recursos")
}

// Badge custom (los predefinidos están en código)
model BadgeCustom {
  id              String        @id @default(uuid())
  cursoId         String?       // null = disponible para todos

  nombre          String
  descripcion     String
  icono           String        // Path al archivo de imagen

  enBiblioteca    Boolean       @default(false)

  creadoEn        DateTime      @default(now())

  @@map("badges_custom")
}

// Enums
enum CategoriaType {
  EXPERIENCIA
  CURRICULAR
}

enum MundoType {
  MATEMATICA
  PROGRAMACION
  CIENCIAS
}

enum CasaType {
  QUANTUM
  VERTEX
  PULSAR
}

enum TierType {
  ARCADE
  ARCADE_PLUS
  PRO
}

enum TipoExperiencia {
  NARRATIVO
  EXPEDICION
  LABORATORIO
  SIMULACION
  PROYECTO
  DESAFIO
}

enum Materia {
  MATEMATICA_ESCOLAR
  FISICA
  QUIMICA
  PROGRAMACION
}

enum EstadoCurso {
  DRAFT
  EN_PROGRESO
  EN_REVISION
  PUBLICADO
}

enum EstadoSemana {
  VACIA
  COMPLETA
}

enum TipoRecurso {
  IMAGEN
  AUDIO
  VIDEO
  DOCUMENTO
}
```

### 1.2 API Endpoints

| Método | Endpoint                          | Qué hace                    |
| ------ | --------------------------------- | --------------------------- |
| POST   | `/api/studio/cursos`              | Crear curso (desde wizard)  |
| GET    | `/api/studio/cursos`              | Listar mis cursos           |
| GET    | `/api/studio/cursos/:id`          | Obtener curso completo      |
| PATCH  | `/api/studio/cursos/:id`          | Actualizar curso            |
| DELETE | `/api/studio/cursos/:id`          | Eliminar curso (solo DRAFT) |
| PATCH  | `/api/studio/cursos/:id/estado`   | Cambiar estado              |
| POST   | `/api/studio/cursos/:id/publicar` | Publicar curso              |

| Método | Endpoint                                      | Qué hace                    |
| ------ | --------------------------------------------- | --------------------------- |
| GET    | `/api/studio/cursos/:id/semanas`              | Listar semanas del curso    |
| GET    | `/api/studio/cursos/:id/semanas/:num`         | Obtener semana específica   |
| PUT    | `/api/studio/cursos/:id/semanas/:num`         | Guardar contenido de semana |
| POST   | `/api/studio/cursos/:id/semanas/:num/validar` | Validar JSON de semana      |

| Método | Endpoint                      | Qué hace         |
| ------ | ----------------------------- | ---------------- |
| POST   | `/api/studio/recursos/upload` | Subir recurso    |
| GET    | `/api/studio/recursos/:id`    | Obtener recurso  |
| DELETE | `/api/studio/recursos/:id`    | Eliminar recurso |

### 1.3 Servicio de Upload

```typescript
// Configuración
const UPLOAD_CONFIG = {
  imagen: {
    formatos: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    maxSize: 5 * 1024 * 1024, // 5 MB
  },
  audio: {
    formatos: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 20 * 1024 * 1024, // 20 MB
  },
  video: {
    formatos: ['video/mp4', 'video/webm'],
    maxSize: 100 * 1024 * 1024, // 100 MB
  },
  documento: {
    formatos: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10 MB
  },
};

// Estructura de carpetas
// /uploads/cursos/{cursoId}/imagenes/
// /uploads/cursos/{cursoId}/audios/
// /uploads/cursos/{cursoId}/videos/
// /uploads/cursos/{cursoId}/documentos/
```

### 1.4 Criterios de "Terminado" - Fase 1

- [ ] Migración de Prisma ejecutada sin errores
- [ ] CRUD de cursos funciona (crear, leer, actualizar, eliminar)
- [ ] CRUD de semanas funciona
- [ ] Upload de recursos funciona con validación de formato/tamaño
- [ ] Tests unitarios para cada endpoint
- [ ] Tests de integración básicos

---

## FASE 2: WIZARD DE CREACIÓN

**Objetivo:** UI completa del wizard de 6 pasos que genera la plantilla JSON.

### 2.1 Componentes de UI

```
/app/admin/studio/
├── page.tsx                    # Lista de cursos
├── nuevo/
│   └── page.tsx                # Wizard de 6 pasos
├── [cursoId]/
│   ├── page.tsx                # Vista de carga de semanas
│   ├── semana/[num]/
│   │   └── page.tsx            # Editor de semana
│   └── publicar/
│       └── page.tsx            # Configuración de publicación
```

### 2.2 Wizard - 6 Pasos

**Paso 1: ¿Qué vas a crear?**

```typescript
interface Paso1State {
  categoria: 'EXPERIENCIA' | 'CURRICULAR' | null;
}
```

- 2 cards grandes con descripción
- Click selecciona y avanza

**Paso 2a: ¿Para qué edad?**

```typescript
interface Paso2aState {
  casa: 'QUANTUM' | 'VERTEX' | 'PULSAR' | null;
}
```

- 3 cards con rango de edad

**Paso 2b: ¿Qué mundo?**

```typescript
interface Paso2bState {
  mundo: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS' | null;
}
```

- 3 cards con íconos

**Paso 3: ¿Qué tipo?**

```typescript
interface Paso3State {
  // Si EXPERIENCIA
  tipoExperiencia?:
    | 'NARRATIVO'
    | 'EXPEDICION'
    | 'LABORATORIO'
    | 'SIMULACION'
    | 'PROYECTO'
    | 'DESAFIO';
  // Si CURRICULAR
  materia?: 'MATEMATICA_ESCOLAR' | 'FISICA' | 'QUIMICA' | 'PROGRAMACION';
}
```

- Cards dinámicas según categoría elegida

**Paso 4: Detalles**

```typescript
interface Paso4State {
  nombre: string;
  descripcion: string;
  variante?: string;
  conceptos: string[];
}
```

- Inputs de texto
- Selector de variante temática (según mundo)
- Input de tags para conceptos

**Paso 5: Duración y Tier**

```typescript
interface Paso5State {
  semanas: number;
  actividadesPorSemana: number;
  tierMinimo: 'ARCADE' | 'ARCADE_PLUS' | 'PRO';
}
```

- Selectores numéricos
- Radio buttons para tier

**Paso 6: Confirmación**

- Resumen de todo
- Botón "Generar Plantilla"
- Al confirmar:
  1. Llama a POST `/api/studio/cursos`
  2. Backend crea curso + semanas vacías
  3. Redirige a vista de carga de semanas

### 2.3 Estado del Wizard

```typescript
interface WizardState {
  pasoActual: 1 | 2 | 3 | 4 | 5 | 6;
  datos: {
    categoria: CategoriaType | null;
    casa: CasaType | null;
    mundo: MundoType | null;
    tipoExperiencia: TipoExperiencia | null;
    materia: Materia | null;
    nombre: string;
    descripcion: string;
    variante: string | null;
    conceptos: string[];
    semanas: number;
    actividadesPorSemana: number;
    tierMinimo: TierType;
  };
  errores: Record<string, string>;
}
```

### 2.4 Validaciones del Wizard

| Paso | Campo                   | Validación                |
| ---- | ----------------------- | ------------------------- |
| 1    | categoria               | Requerido                 |
| 2a   | casa                    | Requerido                 |
| 2b   | mundo                   | Requerido                 |
| 3    | tipoExperiencia/materia | Requerido según categoría |
| 4    | nombre                  | Mínimo 3 caracteres       |
| 4    | descripcion             | Mínimo 10 caracteres      |
| 5    | semanas                 | Entre 1 y 12              |
| 5    | actividadesPorSemana    | Entre 1 y 5               |
| 5    | tierMinimo              | Requerido                 |

### 2.5 Criterios de "Terminado" - Fase 2

- [ ] Wizard navega entre los 6 pasos
- [ ] Validaciones funcionan en cada paso
- [ ] Botón "Atrás" mantiene el estado
- [ ] "Generar Plantilla" crea el curso en DB
- [ ] Redirige a vista de carga de semanas
- [ ] UI responsive (desktop + tablet)
- [ ] Tests E2E del flujo completo

---

## FASE 3: EDITOR DE SEMANAS

**Objetivo:** Poder subir JSONs de semanas, validarlos y guardarlos.

### 3.1 Vista de Carga de Semanas

```
┌─────────────────────────────────────────────────────────┐
│ 📚 La Química de Harry Potter                           │
│ Estado: EN_PROGRESO                                     │
│                                                         │
│ Progreso: 2/8 semanas                                   │
│ [████████░░░░░░░░░░░░░░░░] 25%                          │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ✅ Semana 1 - Tu Primera Poción      [Editar] [Preview] │
│ ✅ Semana 2 - Estados de la Materia  [Editar] [Preview] │
│ ○  Semana 3 - Vacía                  [Subir JSON]       │
│ ○  Semana 4 - Vacía                  [Subir JSON]       │
│ ○  Semana 5 - Vacía                  [Subir JSON]       │
│ ○  Semana 6 - Vacía                  [Subir JSON]       │
│ ○  Semana 7 - Vacía                  [Subir JSON]       │
│ ○  Semana 8 - Vacía                  [Subir JSON]       │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [Descargar contexto para Claude]  [Pasar a revisión →]  │
│                                   (cuando 8/8)          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Subida de Semana

```
1. Click en "Subir JSON"
2. Se abre modal con:
   - Área de drop/selección de archivo
   - O textarea para pegar JSON
3. Usuario sube/pega el JSON
4. Click en "Validar"
5. Sistema ejecuta validación:
   - Si OK → Muestra preview + botón "Guardar"
   - Si errores → Muestra lista de errores
6. Click en "Guardar"
7. Se guarda en DB
8. Semana marcada como completa
```

### 3.3 Validation Engine

```typescript
interface ValidationResult {
  valido: boolean;
  errores: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
}

interface ValidationError {
  tipo: 'error';
  ubicacion: string; // "actividad_2.bloque_3.contenido"
  mensaje: string;
  sugerencia?: string;
}

interface ValidationWarning {
  tipo: 'warning';
  ubicacion: string;
  mensaje: string;
  ignorable: boolean;
}

interface ValidationInfo {
  tipo: 'info';
  mensaje: string;
}
```

**Validaciones implementadas:**

```typescript
// Semana
validarCamposRequeridos(semana); // nombre, descripcion, objetivos
validarNumeroSemana(semana, esperado);
validarCantidadActividades(semana, esperada);

// Actividades
validarDuracion(actividad); // 5-60 min
validarCantidadBloques(actividad); // 2-10
validarPrerrequisitos(actividad, semana);
validarGamificacion(actividad);

// Bloques
validarComponenteExiste(bloque); // En catálogo
validarComponentePorCasa(bloque, casa); // Warning si no corresponde
validarOrdenSecuencial(bloques);
validarDesbloqueos(bloques);
validarRepasoSiFalla(bloque); // Si tiene minimo, debe tener repaso

// Recursos
validarRecursosExisten(semana, recursos);
```

### 3.4 Subida de Recursos en el Editor

Cuando el JSON referencia recursos:

```
1. Validador detecta recursos referenciados
2. Muestra lista de recursos necesarios:
   - ✅ aula_pociones.png (ya subido)
   - ❌ intro_mezclas.mp3 (falta)
   - ❌ reglas.png (falta)
3. Usuario sube los faltantes
4. Cuando todos están, puede guardar
```

### 3.5 Descargar Contexto para Claude

Botón que genera un archivo con:

```markdown
# Contexto para generar semana

## Información del curso

- Nombre: La Química de Harry Potter
- Categoría: Experiencia Narrativa
- Casa: VERTEX (10-12 años)
- Mundo: Ciencias

## Semana a generar

- Número: 3
- Actividades esperadas: 3

## Componentes disponibles

[Lista de los 95 componentes con descripción corta]

## Estructura esperada

[Schema de Semana simplificado]

## Ejemplo de semana completa

[Semana 1 como referencia]

## Instrucciones

Generá el JSON para la semana 3 siguiendo la estructura.
Tema sugerido: [lo que defina el usuario]
```

### 3.6 Criterios de "Terminado" - Fase 3

- [ ] Vista de carga muestra todas las semanas
- [ ] Subida de JSON funciona (archivo o paste)
- [ ] Validador detecta todos los errores definidos
- [ ] Validador muestra warnings sin bloquear
- [ ] Subida de recursos faltantes funciona
- [ ] "Descargar contexto" genera archivo útil
- [ ] Semanas se guardan correctamente
- [ ] Estado del curso cambia automáticamente
- [ ] Tests para cada tipo de validación

---

## FASE 4: PREVIEW Y BIBLIOTECA

**Objetivo:** Ver el curso como lo ve el estudiante y reutilizar contenido.

### 4.1 Preview de Semana

Vista que renderiza el JSON exactamente como lo vería el estudiante:

- Navegación entre actividades
- Bloques se muestran en orden
- Componentes renderizan su contenido
- Gamificación visible (XP, badges)

**Nota:** No necesita ser 100% funcional (los quizzes no necesitan evaluar respuestas), pero debe verse igual.

### 4.2 Preview de Curso Completo

Antes de publicar, poder recorrer todo el curso:

- Navegar semana por semana
- Ver el flujo completo
- Identificar problemas de continuidad

### 4.3 Vista de Revisión Final

```
┌─────────────────────────────────────────────────────────┐
│ 📚 La Química de Harry Potter                           │
│ Estado: EN_REVISIÓN                                     │
│                                                         │
│ ✅ 8/8 semanas completas                                │
│                                                         │
│ [▶ PREVIEW CURSO COMPLETO]                              │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ CONFIGURACIÓN DE PUBLICACIÓN                            │
│                                                         │
│ Visibilidad:                                            │
│ ☑ Landing del mundo (Ciencias)                          │
│ ☐ Landing home (destacado)                              │
│ ☑ Catálogo interno                                      │
│ ☑ Notificar upgrade a tiers inferiores                  │
│                                                         │
│ Fechas:                                                 │
│ Fecha de venta:      [15/01/2026]                       │
│ Fecha disponible:    [01/02/2026]                       │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [← Volver a editar]              [🚀 PUBLICAR CURSO]    │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Biblioteca

```
/app/admin/studio/biblioteca/
├── page.tsx              # Vista principal
├── cursos/
│   └── page.tsx          # Cursos guardados
├── semanas/
│   └── page.tsx          # Semanas reutilizables
├── actividades/
│   └── page.tsx          # Actividades sueltas
├── bloques/
│   └── page.tsx          # Bloques configurados
└── badges/
    └── page.tsx          # Badges custom
```

**Funcionalidades:**

- Buscar por tags
- Filtrar por mundo/casa/tipo
- "Usar como base" → Copia a nuevo curso
- "Insertar" → Agrega a curso actual

### 4.5 Criterios de "Terminado" - Fase 4

- [ ] Preview de semana renderiza todos los componentes
- [ ] Preview de curso permite navegar completo
- [ ] Vista de revisión muestra configuración de publicación
- [ ] Publicar cambia estado y fecha
- [ ] Biblioteca lista contenido guardado
- [ ] Búsqueda y filtros funcionan
- [ ] "Usar como base" crea copia
- [ ] Tests E2E del flujo de publicación

---

## CRONOGRAMA ESTIMADO

| Fase   | Duración estimada | Entregable                         |
| ------ | ----------------- | ---------------------------------- |
| Fase 1 | 3-5 días          | DB + API + Upload funcionando      |
| Fase 2 | 5-7 días          | Wizard completo, genera plantillas |
| Fase 3 | 7-10 días         | Editor + Validador funcionando     |
| Fase 4 | 5-7 días          | Preview + Biblioteca + Publicación |

**Total estimado:** 20-29 días de desarrollo

---

## PRÓXIMO PASO

Ejecutar **Fase 1: Fundamentos**

Empezando por:

1. Crear migración de Prisma con los nuevos modelos
2. Crear módulo `studio` en el backend NestJS
3. Implementar endpoints de CRUD de cursos

---

_Plan aprobado: 2024-11-29_
