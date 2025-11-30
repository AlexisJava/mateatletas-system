# AUDITORÍA MATEATLETAS STUDIO

> Fecha: 2024-11-29
> Documento auditado: docs/MATEATLETAS_STUDIO.md

---

## Secciones completas

| #   | Sección                             | Estado      | Nivel de detalle                                                           |
| --- | ----------------------------------- | ----------- | -------------------------------------------------------------------------- |
| 1   | Visión General                      | ✅ Completa | Excelente - Principios, propuesta de valor, diferenciación                 |
| 2   | Arquitectura del Sistema            | ✅ Completa | Excelente - Capas, flujo de datos, estados, estética                       |
| 3   | Formulario de Configuración Inicial | ✅ Completa | Excelente - 6 pasos detallados con wireframes ASCII                        |
| 4   | Flujo Post-Plantilla                | ✅ Completa | Excelente - Estados, vistas, acciones                                      |
| 5   | Schema de Plantilla (JSON Madre)    | ✅ Completa | Excelente - TypeScript interfaces, ejemplo completo, validaciones          |
| 6   | Schema de Semana                    | ✅ Completa | Excelente - Estructura, ejemplo real de 3 actividades, árbol de estructura |
| 7   | Catálogo de Componentes             | ✅ Completa | Excelente - 91 componentes, 8 categorías, adaptación por Casa              |
| 9   | Reglas de Validación                | ✅ Completa | Muy bueno - 7 subsecciones con reglas claras                               |
| 12  | Biblioteca y Reutilización          | ✅ Completa | Muy bueno - Qué se guarda, búsqueda, versionado                            |

---

## Secciones incompletas o con TODOs

| #   | Sección                | Estado  | Impacto en construcción                                                                |
| --- | ---------------------- | ------- | -------------------------------------------------------------------------------------- |
| 8   | Sistema de Simuladores | ❌ TODO | **ALTO** - Los 25 simuladores son el diferencial pero no tienen especificación técnica |
| 10  | Adaptación por Casa    | ❌ TODO | **MEDIO** - Ya hay ejemplos dispersos en otras secciones, falta consolidar             |
| 11  | Preview Renderer       | ❌ TODO | **ALTO** - Core del sistema, cómo renderizar los JSONs                                 |
| 13  | Telemetría             | ❌ TODO | **BAJO** - Fase 2 según arquitectura                                                   |
| 14  | Implementación         | ❌ TODO | **MEDIO** - Plan de fases, tecnologías, priorización                                   |

---

## Inconsistencias encontradas

### 1. Nombres de componentes en ejemplos vs catálogo (CRÍTICO)

Los ejemplos en Sección 6 usan nombres que **no existen** en el catálogo (Sección 7):

| Usado en ejemplo (Sección 6) | Existe en catálogo (Sección 7)       | Sugerencia                                                |
| ---------------------------- | ------------------------------------ | --------------------------------------------------------- |
| `presentacion_interactiva`   | ❌ No existe                         | Usar `VideoPlayer` con branching o crear componente nuevo |
| `quiz_opcion_multiple`       | `MultipleChoice` (#4) o `Quiz` (#76) | Usar `Quiz`                                               |
| `narracion_con_seguimiento`  | ❌ No existe                         | Usar `AudioPlayer` (#72) con highlights                   |
| `simulador_mezclas`          | ❌ No existe                         | Usar `StateMatterSim` (#31) o crear como simulador custom |
| `ordenar_por_categoria`      | `SortingBins` (#12)                  | Usar `SortingBins`                                        |
| `checkpoint`                 | ❌ No existe                         | Agregar al catálogo o usar `BadgeDisplay` (#83)           |
| `animacion_paso_a_paso`      | ❌ No existe                         | Usar `VideoPlayer` o crear componente                     |
| `boss_battle`                | `ChallengeMode` (#78)                | Usar `ChallengeMode`                                      |

**Resolución:** Actualizar ejemplos para usar nombres del catálogo, o agregar los componentes faltantes al catálogo.

### 2. Schema de Semana incompleto en TypeScript

La Sección 5 define `ActividadPlantilla` con `contenido: null | ActividadContenido` pero **nunca define `ActividadContenido`**. La Sección 6 muestra la estructura pero no hay interface TypeScript formal.

**Resolución:** Agregar interface `ActividadContenido` y `BloqueContenido` a Sección 5 o 6.

### 3. Recursos referenciados pero sin schema

Los recursos (`aula_pociones.png`, `intro_mezclas.mp3`) se mencionan pero:

- No hay especificación de dónde se almacenan
- No hay límites de tamaño/formato
- No hay regla de validación para recursos faltantes

**Resolución:** Agregar subsección de recursos en Sección 9 (Validación) o crear Sección dedicada.

### 4. Discrepancia en materia vs mundo

En Sección 5.1, `materia` tiene valor `'programacion'` pero en Sección 2.6 (ConfiguracionCurso) dice `'programacion_basica'`.

**Resolución:** Unificar a un solo valor.

---

## Ambigüedades que resolver antes de construir

### 1. Props específicas de cada componente (BLOQUEANTE)

El catálogo lista 91 componentes pero solo hay **1 ejemplo de props** (`DragDropZoneProps`). Para construir el Validation Engine necesitamos:

- Schema de props para cada componente
- O al menos para los 15 interactivos básicos

**Decisión requerida:** ¿Se definen todos los schemas ahora o se van agregando incrementalmente?

### 2. Sistema de Badges no definido

Las reglas dicen "Badge debe existir en el sistema" pero no hay:

- Lista de badges disponibles
- Cómo se crean nuevos badges
- Relación badge → imagen/animación

**Decisión requerida:** ¿Badges predefinidos o creables por el usuario?

### 3. Formato exacto de prerrequisitos

El ejemplo usa `["actividad_1"]` pero no está claro:

- ¿Es siempre un array?
- ¿Puede referenciar actividades de otras semanas?
- ¿Qué pasa si la referencia es inválida?

**Decisión requerida:** Definir sintaxis formal de prerrequisitos.

### 4. Hosting de recursos

Los recursos (imágenes, audio) se mencionan pero:

- ¿Se suben al Studio o se referencian URLs externas?
- ¿Hay CDN?
- ¿Límites de tamaño?

**Decisión requerida:** Definir estrategia de assets.

### 5. Componentes NO disponibles por Casa

La tabla de Editores de Código muestra "N/A" para algunos componentes en ciertas Casas, pero:

- ¿El validador rechaza el JSON o solo lo marca como warning?
- ¿Se puede forzar un componente no recomendado?

**Decisión requerida:** Comportamiento del validador ante componente no disponible.

---

## Análisis de consistencia entre Schemas

### Plantilla (Sección 5) → Semana (Sección 6)

| Campo en Plantilla        | Campo en Semana                | ¿Consistente?                  |
| ------------------------- | ------------------------------ | ------------------------------ |
| `semanas[].numero`        | `semana.numero`                | ✅ Sí                          |
| `semanas[].nombre`        | `semana.nombre`                | ✅ Sí                          |
| `semanas[].descripcion`   | `semana.descripcion`           | ✅ Sí                          |
| `semanas[].actividades[]` | `semana.actividades[]`         | ✅ Sí                          |
| `semanas[].estado`        | No definido en Semana          | ⚠️ Se infiere del contenido    |
| N/A                       | `semana.objetivos_aprendizaje` | ⚠️ Nuevo campo no en Plantilla |
| N/A                       | `semana.recursos`              | ⚠️ Nuevo campo no en Plantilla |
| N/A                       | `semana.resumen_gamificacion`  | ⚠️ Nuevo campo no en Plantilla |

**Nota:** `SemanaPlantilla` es la estructura vacía, `Semana` (del ejemplo) es la completa. Pero falta interface TypeScript para la completa.

### Validación (Sección 9) cubre Schemas

| Qué valida                     | ¿Cubierto? | Notas                                 |
| ------------------------------ | ---------- | ------------------------------------- |
| Campos requeridos de Plantilla | ✅ Sí      | Sección 5.5                           |
| Campos requeridos de Semana    | ✅ Sí      | Sección 9.1                           |
| Campos requeridos de Actividad | ✅ Sí      | Sección 9.2                           |
| Campos requeridos de Bloque    | ✅ Sí      | Sección 9.3                           |
| Componente existe en catálogo  | ✅ Sí      | Sección 9.3                           |
| Props válidas por componente   | ❌ No      | No hay schema de props por componente |
| Recursos existen               | ❌ No      | No hay validación de recursos         |

---

## Conclusión

### ¿Está listo para construir?

**PARCIALMENTE SÍ** - Se puede empezar a construir las siguientes partes:

1. ✅ **Studio UI (Wizard 6 pasos)** - Completamente especificado
2. ✅ **Generación de Plantilla JSON** - Schema completo
3. ✅ **Vista de Carga de Semanas** - Flujo definido
4. ⚠️ **Validation Engine** - Reglas definidas pero faltan schemas de props
5. ⚠️ **Preview Renderer** - Sección vacía pero se puede inferir de componentes
6. ❌ **Simuladores** - Necesita especificación técnica

### Recomendación de siguiente paso

**Prioridad 1 (Bloqueante):**

1. Corregir inconsistencia de nombres de componentes en ejemplos
2. Agregar interface TypeScript completa para `Semana` y `Bloque`

**Prioridad 2 (Para Validation Engine):** 3. Definir schema de props para los 15 interactivos básicos 4. Definir sistema de badges

**Prioridad 3 (Para Preview):** 5. Completar Sección 11 (Preview Renderer) 6. Completar Sección 8 (Sistema de Simuladores) - al menos arquitectura

**Prioridad 4 (Fase 2):** 7. Sección 10 (Adaptación por Casa) - consolidar lo disperso 8. Sección 13 (Telemetría) 9. Sección 14 (Implementación)

---

## Métricas del documento

| Métrica                         | Valor                                                   |
| ------------------------------- | ------------------------------------------------------- |
| Secciones totales               | 14                                                      |
| Secciones completas             | 9 (64%)                                                 |
| Secciones con TODO              | 5 (36%)                                                 |
| Componentes definidos           | 91                                                      |
| Componentes con schema de props | 1 (1%)                                                  |
| Interfaces TypeScript completas | 3 (PlantillaCurso, SemanaPlantilla, ActividadPlantilla) |
| Interfaces TypeScript faltantes | 2+ (ActividadContenido, BloqueContenido, etc.)          |
| Inconsistencias críticas        | 1 (nombres de componentes)                              |
| Decisiones pendientes           | 5                                                       |

---

_Generado por Claude Code - 2024-11-29_
