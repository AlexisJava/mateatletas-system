# Manual del Sandbox - Editor de Contenido Educativo

## Guía Paso a Paso para Crear Lecciones

---

## Tabla de Contenidos

1. [Inicio Rápido](#1-inicio-rápido)
2. [Pantalla de Bienvenida](#2-pantalla-de-bienvenida)
3. [El Árbol de Nodos](#3-el-árbol-de-nodos)
4. [Gestión de Nodos](#4-gestión-de-nodos)
5. [El Editor JSON](#5-el-editor-json)
6. [Catálogo de Componentes](#6-catálogo-de-componentes)
7. [Auto-Guardado](#7-auto-guardado)
8. [Publicación](#8-publicación)
9. [Atajos de Teclado](#9-atajos-de-teclado)
10. [Solución de Problemas](#10-solución-de-problemas)

---

## 1. Inicio Rápido

### Acceso al Sandbox

1. Ingresa al panel de administración (`/admin`)
2. Navega a **Sandbox** en el menú lateral
3. Serás recibido por la **Pantalla de Bienvenida**

### Flujo Básico

```
Seleccionar Casa → Seleccionar Materia → Inicializar
       ↓
Agregar nodos al árbol
       ↓
Editar contenido JSON de cada nodo
       ↓
Previsualizar en tiempo real
       ↓
Publicar cuando esté listo
```

---

## 2. Pantalla de Bienvenida

Al entrar al Sandbox, verás la pantalla de configuración inicial:

```
┌─────────────────────────────────────────────────────────────┐
│                    SANDBOX EDITOR v1.0                       │
│                      Mateatletas                             │
│          Editor de contenido educativo gamificado.           │
│                                                              │
│  ┌─────────────────── Selecciona tu Facción ───────────────┐│
│  │                                                          ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              ││
│  │  │ QUANTUM  │  │  VERTEX  │  │  PULSAR  │              ││
│  │  │  6-9     │  │  10-13   │  │  14-18   │              ││
│  │  └──────────┘  └──────────┘  └──────────┘              ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────── Materia ───────────┐                          │
│  │ ○ Matemáticas                 │                          │
│  │ ○ Programación                │                          │
│  │ ○ Ciencias                    │                          │
│  └───────────────────────────────┘                          │
│                                                              │
│            [ INICIALIZAR → ]                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Casas (Facciones)

| Casa        | Rango de Edad | Color Primario       | Descripción                    |
| ----------- | ------------- | -------------------- | ------------------------------ |
| **QUANTUM** | 6-9 años      | Rosa (`#ec4899`)     | Contenido para niños pequeños  |
| **VERTEX**  | 10-13 años    | Azul (`#0ea5e9`)     | Contenido para preadolescentes |
| **PULSAR**  | 14-18 años    | Amarillo (`#eab308`) | Contenido para adolescentes    |

### Materias (Mundos)

| Materia      | Código Backend | Descripción                 |
| ------------ | -------------- | --------------------------- |
| Matemáticas  | `MATEMATICA`   | Números, geometría, álgebra |
| Programación | `PROGRAMACION` | Código, lógica, algoritmos  |
| Ciencias     | `CIENCIAS`     | Física, química, biología   |

### Acción: Inicializar

Al hacer clic en **Inicializar**:

1. Se crea un nuevo contenido en estado `BORRADOR`
2. Se generan automáticamente 3 nodos raíz: **Teoría**, **Práctica**, **Evaluación**
3. Se abre el editor principal

---

## 3. El Árbol de Nodos

### Estructura del Editor Principal

```
┌────────────────────────────────────────────────────────────────────────┐
│ [≡]  ┌─────────────────────────┐  [Split] [Editor] [Preview]  [Pub]   │
│      │ 📄 Nueva Lección       │                                      │
│      └─────────────────────────┘                              [▶]    │
├─────┬──────────────┬───────────────────────────────────────────────────┤
│     │              │                                                   │
│ S   │  CONTENIDO   │   ┌─────────────────┬─────────────────────────┐  │
│ I   │              │   │                 │                         │  │
│ D   │  📖 Teoría   │   │   EDITOR JSON   │      PREVIEW            │  │
│ E   │    └─ Intro  │   │                 │                         │  │
│ B   │  ⚡ Práctica │   │  {              │   ┌─────────────────┐   │  │
│ A   │  ✓ Evaluación│   │    "type":...   │   │  Bienvenido a   │   │  │
│ R   │              │   │  }              │   │  Mateatletas    │   │  │
│     │              │   │                 │   └─────────────────┘   │  │
│     │              │   └─────────────────┴─────────────────────────┘  │
│     │              │                                                   │
└─────┴──────────────┴───────────────────────────────────────────────────┘
```

### Tipos de Nodos

| Tipo                | Icono | Descripción                       | ¿Editable?     |
| ------------------- | ----- | --------------------------------- | -------------- |
| **Nodo Raíz**       | 📖⚡✓ | Teoría, Práctica, Evaluación      | No (bloqueado) |
| **Nodo Contenedor** | 📁    | Tiene hijos, organiza contenido   | No             |
| **Nodo Hoja**       | 📄    | Sin hijos, contiene JSON editable | ✅ Sí          |

### Reglas de los Nodos

1. Los **nodos raíz** (Teoría, Práctica, Evaluación) NO pueden eliminarse ni renombrarse
2. Solo los **nodos hoja** (sin hijos) son editables con JSON
3. Si un nodo tiene hijos, se convierte automáticamente en contenedor
4. Los nodos se muestran ordenados por el campo `orden`

---

## 4. Gestión de Nodos

### Agregar un Nodo

1. Pasa el mouse sobre el nodo padre
2. Aparecerá un botón `+` a la derecha
3. Haz clic en `+` para agregar un subnodo
4. El nuevo nodo se llamará "Nuevo nodo"

```
📖 Teoría   [+]  ← Hover para ver el botón
   └─ Nuevo nodo   ← Nuevo nodo creado
```

### Renombrar un Nodo

1. Haz **doble clic** en el nombre del nodo
2. Aparecerá un campo de texto editable
3. Escribe el nuevo nombre
4. Presiona **Enter** para guardar o **Escape** para cancelar

```
📖 Teoría
   └─ [Introducción|]  ← Campo de edición activo
```

### Eliminar un Nodo

1. Pasa el mouse sobre el nodo
2. Aparecerá un botón de basura 🗑️
3. Haz clic en 🗑️

**Si el nodo tiene hijos:**

```
┌──────────────────────────────────────┐
│       Confirmar eliminación          │
│                                      │
│  ¿Eliminar "Sección Principal"?      │
│                                      │
│  ⚠️ Esta acción eliminará también   │
│     3 subnodos que dependen de él.   │
│                                      │
│     [Cancelar]    [Eliminar todo]    │
└──────────────────────────────────────┘
```

**Si el nodo NO tiene hijos:** Se elimina directamente sin confirmación.

### Seleccionar un Nodo

- **Clic en nodo hoja:** Selecciona y carga el JSON en el editor
- **Clic en nodo contenedor:** Expande/colapsa los hijos

---

## 5. El Editor JSON

### Vista General

El editor tiene 3 modos de visualización:

| Modo        | Descripción                             |
| ----------- | --------------------------------------- |
| **Split**   | Editor y Preview lado a lado (default)  |
| **Editor**  | Solo el editor JSON a pantalla completa |
| **Preview** | Solo el preview a pantalla completa     |

### Estructura del JSON

Todo contenido sigue esta estructura:

```json
{
  "type": "NombreDelComponente",
  "props": {
    "propiedad1": "valor1",
    "propiedad2": "valor2"
  },
  "children": [
    // Componentes hijos o texto
  ]
}
```

### Ejemplo Básico

```json
{
  "type": "Stage",
  "props": { "pattern": "dots" },
  "children": [
    {
      "type": "ContentZone",
      "props": { "variant": "center" },
      "children": [
        {
          "type": "LessonHeader",
          "props": {
            "title": "Introducción a las Fracciones",
            "subtitle": "Módulo 1",
            "icon": "🍕"
          }
        },
        {
          "type": "InfoAlert",
          "props": { "type": "tip", "title": "Concepto Clave" },
          "children": "Una fracción representa partes de un todo."
        }
      ]
    }
  ]
}
```

### Preview en Tiempo Real

Los cambios en el JSON se reflejan instantáneamente en el preview. Modos de preview:

| Modo        | Descripción                      |
| ----------- | -------------------------------- |
| **Desktop** | Vista de navegador web           |
| **Mobile**  | Simulador de celular (375x780px) |

---

## 6. Catálogo de Componentes

### Componentes de Layout

#### Stage (Contenedor Principal)

El componente raíz que envuelve todo el contenido.

```json
{
  "type": "Stage",
  "props": {
    "pattern": "dots"
  },
  "children": [...]
}
```

**Props:**

| Prop         | Tipo   | Opciones                                          | Default |
| ------------ | ------ | ------------------------------------------------- | ------- |
| `pattern`    | string | `dots`, `cyber-grid`, `stars`, `aurora`, `matrix` | `dots`  |
| `background` | string | URL de imagen o CSS gradient                      | -       |

**Patrones disponibles:**

| Patrón       | Descripción               |
| ------------ | ------------------------- |
| `dots`       | Puntos sutiles (estándar) |
| `cyber-grid` | Grilla estilo cyberpunk   |
| `stars`      | Cielo estrellado          |
| `aurora`     | Degradado tipo aurora     |
| `matrix`     | Líneas estilo Matrix      |

---

#### ContentZone (Zona de Contenido)

Centra y organiza el contenido.

```json
{
  "type": "ContentZone",
  "props": { "variant": "center" },
  "children": [...]
}
```

**Props:**

| Prop      | Tipo   | Opciones                  | Default  |
| --------- | ------ | ------------------------- | -------- |
| `variant` | string | `top`, `center`, `bottom` | `center` |

---

#### Columns (Dos Columnas)

Divide el contenido en dos columnas.

```json
{
  "type": "Columns",
  "props": { "gap": 6 },
  "children": [
    { "type": "div", "children": "Columna 1" },
    { "type": "div", "children": "Columna 2" }
  ]
}
```

**Props:**

| Prop  | Tipo   | Descripción                                   | Default |
| ----- | ------ | --------------------------------------------- | ------- |
| `gap` | number | Espacio entre columnas (multiplicado por 4px) | `6`     |

---

### Componentes de Contenido

#### LessonHeader (Encabezado)

Título principal con icono y subtítulo.

```json
{
  "type": "LessonHeader",
  "props": {
    "title": "Las Fracciones",
    "subtitle": "Lección 1",
    "icon": "🔢"
  }
}
```

**Props:**

| Prop       | Tipo   | Descripción                     | Requerido |
| ---------- | ------ | ------------------------------- | --------- |
| `title`    | string | Título principal                | ✅        |
| `subtitle` | string | Texto pequeño arriba del título | No        |
| `icon`     | string | Emoji o carácter                | No        |

---

#### InfoAlert (Alerta Informativa)

Caja destacada para información importante.

```json
{
  "type": "InfoAlert",
  "props": {
    "type": "tip",
    "title": "Sabías que..."
  },
  "children": "El número π tiene infinitos decimales."
}
```

**Props:**

| Prop    | Tipo   | Opciones                 | Default |
| ------- | ------ | ------------------------ | ------- |
| `type`  | string | `info`, `tip`, `warning` | `info`  |
| `title` | string | Título del alerta        | -       |

**Estilos:**

| Tipo      | Color   | Icono |
| --------- | ------- | ----- |
| `info`    | Cyan    | ℹ️    |
| `tip`     | Púrpura | 💡    |
| `warning` | Ámbar   | ⚠️    |

---

#### ActionCard (Tarjeta de Acción)

Tarjeta interactiva para conceptos o acciones.

```json
{
  "type": "ActionCard",
  "props": {
    "title": "Números Primos",
    "description": "Un número primo solo es divisible por 1 y por sí mismo.",
    "icon": "🔢",
    "active": false
  }
}
```

**Props:**

| Prop          | Tipo    | Descripción                | Requerido |
| ------------- | ------- | -------------------------- | --------- |
| `title`       | string  | Título de la tarjeta       | ✅        |
| `description` | string  | Descripción                | ✅        |
| `icon`        | string  | Emoji                      | ✅        |
| `active`      | boolean | Estado activo/seleccionado | No        |

---

#### STEAMChallenge (Pregunta Interactiva)

Pregunta de opción múltiple con feedback.

```json
{
  "type": "STEAMChallenge",
  "props": {
    "question": "¿Cuánto es 7 × 8?",
    "options": ["54", "56", "58", "64"],
    "correctIndex": 1
  }
}
```

**Props:**

| Prop           | Tipo     | Descripción                               | Requerido |
| -------------- | -------- | ----------------------------------------- | --------- |
| `question`     | string   | La pregunta                               | ✅        |
| `options`      | string[] | Array de opciones (2-4)                   | ✅        |
| `correctIndex` | number   | Índice de la respuesta correcta (0-based) | ✅        |

**Comportamiento:**

1. El usuario selecciona una opción
2. Aparece botón "Confirmar Solución"
3. Al confirmar, muestra si es correcto o incorrecto

---

#### MathHero (Cita de Personaje)

Cita inspiradora de un matemático/científico.

```json
{
  "type": "MathHero",
  "props": {
    "character": "Ada Lovelace",
    "quote": "Esa mente tuya es capaz de cualquier cosa."
  }
}
```

**Props:**

| Prop        | Tipo   | Descripción          | Requerido |
| ----------- | ------ | -------------------- | --------- |
| `character` | string | Nombre del personaje | ✅        |
| `quote`     | string | La cita              | ✅        |

---

#### Formula (Fórmula Matemática)

Muestra una fórmula destacada.

```json
{
  "type": "Formula",
  "props": {
    "tex": "E = mc²",
    "label": "Ecuación de Einstein"
  }
}
```

**Props:**

| Prop    | Tipo   | Descripción                  | Requerido |
| ------- | ------ | ---------------------------- | --------- |
| `tex`   | string | La fórmula (texto, no LaTeX) | ✅        |
| `label` | string | Etiqueta descriptiva         | No        |

---

#### StatCard (Tarjeta Estadística)

Muestra un valor numérico destacado.

```json
{
  "type": "StatCard",
  "props": {
    "value": "∞",
    "label": "Decimales de π"
  }
}
```

**Props:**

| Prop    | Tipo   | Descripción  | Requerido |
| ------- | ------ | ------------ | --------- |
| `value` | string | Valor grande | ✅        |
| `label` | string | Etiqueta     | ✅        |

---

#### Timeline (Línea de Tiempo)

Muestra pasos secuenciales.

```json
{
  "type": "Timeline",
  "props": {
    "steps": [
      { "title": "Paso 1", "desc": "Identificar el problema" },
      { "title": "Paso 2", "desc": "Plantear la ecuación" },
      { "title": "Paso 3", "desc": "Resolver y verificar" }
    ]
  }
}
```

**Props:**

| Prop    | Tipo  | Descripción                | Requerido |
| ------- | ----- | -------------------------- | --------- |
| `steps` | array | Array de `{ title, desc }` | ✅        |

---

### Ejemplo Completo: Lección de Fracciones

```json
{
  "type": "Stage",
  "props": { "pattern": "cyber-grid" },
  "children": [
    {
      "type": "ContentZone",
      "props": { "variant": "center" },
      "children": [
        {
          "type": "LessonHeader",
          "props": {
            "title": "Introducción a las Fracciones",
            "subtitle": "Matemáticas - Módulo 1",
            "icon": "🍕"
          }
        },
        {
          "type": "InfoAlert",
          "props": { "type": "info", "title": "¿Qué es una fracción?" },
          "children": "Una fracción representa una parte de un todo. Por ejemplo, 1/2 significa la mitad de algo."
        },
        {
          "type": "Columns",
          "props": { "gap": 4 },
          "children": [
            {
              "type": "ActionCard",
              "props": {
                "title": "Numerador",
                "description": "El número de arriba. Indica cuántas partes tomamos.",
                "icon": "⬆️"
              }
            },
            {
              "type": "ActionCard",
              "props": {
                "title": "Denominador",
                "description": "El número de abajo. Indica en cuántas partes dividimos.",
                "icon": "⬇️"
              }
            }
          ]
        },
        {
          "type": "Formula",
          "props": {
            "tex": "1/4 + 1/4 = 2/4 = 1/2",
            "label": "Suma de fracciones con igual denominador"
          }
        },
        {
          "type": "STEAMChallenge",
          "props": {
            "question": "Si comes 2 de 8 rebanadas de pizza, ¿qué fracción comiste?",
            "options": ["1/2", "1/4", "2/8", "4/8"],
            "correctIndex": 2
          }
        }
      ]
    }
  ]
}
```

---

## 7. Auto-Guardado

### Cómo Funciona

El Sandbox guarda automáticamente tus cambios:

1. **Cambios en JSON:** Se guardan 2 segundos después de dejar de escribir
2. **Cambios en título:** Se guardan 2 segundos después
3. **Cambio de nodo:** Los cambios pendientes se guardan inmediatamente

### Indicador de Estado

El indicador aparece junto al nombre del proyecto:

| Estado        | Indicador        | Descripción                    |
| ------------- | ---------------- | ------------------------------ |
| **Borrador**  | `○ Borrador`     | Hay cambios sin guardar        |
| **Guardando** | `◐ Guardando...` | Guardado en progreso           |
| **Guardado**  | `● Guardado`     | Todo guardado                  |
| **Error**     | `✕ Error`        | Fallo al guardar (ver mensaje) |

### Comportamiento

```
Usuario escribe → [2 segundos de espera] → Guardado automático
                        ↓
Usuario sigue escribiendo → Timer se reinicia
```

### Forzar Guardado

El guardado se fuerza automáticamente cuando:

- Cambias a otro nodo
- Haces clic en "Publicar"
- Sales del Sandbox

---

## 8. Publicación

### Estados del Contenido

| Estado        | Descripción                                      |
| ------------- | ------------------------------------------------ |
| **BORRADOR**  | En edición, no visible para estudiantes          |
| **PUBLICADO** | Visible para estudiantes de la casa seleccionada |
| **ARCHIVADO** | Oculto, ya no disponible                         |

### Proceso de Publicación

1. Haz clic en el botón **Publicar** (esquina superior derecha)

```
┌────────────────────────────────────┐
│           📤 Publicar              │
│                                    │
│  Lección: "Intro a las Fracciones" │
│  Slides: 5                         │
│                                    │
│  ¿Publicar este contenido?         │
│  Los estudiantes de QUANTUM        │
│  podrán verlo inmediatamente.      │
│                                    │
│   [Cancelar]    [Confirmar]        │
└────────────────────────────────────┘
```

2. Confirma la publicación
3. El estado cambia a `PUBLICADO`
4. El contenido aparece en el portal de estudiantes

### Requisitos para Publicar

- El contenido debe tener al menos un nodo hoja con contenido JSON
- Los cambios pendientes se guardan automáticamente antes de publicar

---

## 9. Atajos de Teclado

| Atajo                         | Acción                        |
| ----------------------------- | ----------------------------- |
| `Cmd/Ctrl + S`                | Formatear JSON (prettify)     |
| `Cmd/Ctrl + Enter`            | Abrir Player (vista completa) |
| `Escape`                      | Cerrar Player                 |
| `Enter` (en edición de nodo)  | Guardar nombre                |
| `Escape` (en edición de nodo) | Cancelar edición              |
| `Doble clic` (en nodo)        | Renombrar nodo                |

---

## 10. Solución de Problemas

### Error: "Componente desconocido"

**Problema:** El preview muestra una caja roja con "Componente desconocido: X"

**Solución:** Verifica que el `type` sea uno de los componentes válidos:

- `Stage`, `ContentZone`, `Columns`
- `LessonHeader`, `ActionCard`, `STEAMChallenge`
- `MathHero`, `InfoAlert`, `StatCard`, `Formula`, `Timeline`
- `div`, `span`, `p`, `h1`, `h2`, `h3`, `h4`

### Error: JSON Inválido

**Problema:** El preview no se actualiza o muestra error

**Solución:**

1. Verifica que el JSON esté bien formado
2. Usa `Cmd/Ctrl + S` para formatear
3. Revisa comillas, comas y corchetes

### No Puedo Editar un Nodo

**Problema:** Al hacer clic en un nodo no aparece el editor

**Causa:** Es un nodo contenedor (tiene hijos)

**Solución:** Selecciona un nodo hoja (sin hijos) para editar

### No Puedo Eliminar un Nodo

**Problema:** No aparece el botón de eliminar

**Causa:** Es un nodo bloqueado (Teoría, Práctica, Evaluación)

**Solución:** Los nodos raíz no pueden eliminarse. Agrega subnodos dentro de ellos.

### El Guardado Falla

**Problema:** Indicador muestra "Error"

**Solución:**

1. Verifica tu conexión a internet
2. Revisa que el backend esté corriendo
3. Recarga la página y reintenta

---

## Anexo: Estructura de Datos

### NodoContenido

```typescript
interface NodoContenido {
  id: string;
  titulo: string;
  bloqueado: boolean; // true para nodos raíz
  parentId: string | null; // null para nodos raíz
  orden: number; // posición entre hermanos
  contenidoJson: string | null; // null si es contenedor
  hijos: NodoContenido[];
}
```

### ContentBlock (JSON)

```typescript
interface ContentBlock {
  type: string; // nombre del componente
  props?: Record<string, any>; // propiedades
  children?: ContentBlock[] | string; // hijos o texto
}
```

---

**Última actualización:** 2026-01-02
