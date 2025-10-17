# Calendario Agenda - Especificación Completa v1.0

**Fecha:** 2025-01-15
**Target:** Portal Docente - Calendario al 100%
**Filosofía:** "Hacemos lo que necesitamos, no lo fácil"

---

## Decisiones de Diseño Confirmadas

### ✅ Vistas
1. **Vista Agenda** (principal - más usada)
2. **Vista Semana** (alternativa - planning semanal)

### ✅ Tipos de Eventos
1. **Clases** (del sistema - recuperar clases)
2. **Tareas** (sistema robusto y complejo)
3. **Recordatorios** (simples)
4. **Notas** (simples)

### ✅ Funcionalidades Core
- Eventos con duración (hora inicio + fin)
- Eventos de todo el día
- Drag & Drop (mover entre días/horas)
- Sin sincronización Google Calendar
- Sistema de tareas ultra completo

---

## 1. VISTAS DEL CALENDARIO

### Vista Agenda (Principal)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📅 Calendario                                    [Semana][Agenda]│
│ [← Hoy →] [Enero 2025]                          [+ Nuevo Evento] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ HOY - Lunes 15 de Enero ──────────────────────────────── 3 eventos│
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 08:00 - 09:00  │ 📝 Preparar materiales Álgebra          │ │ │
│ │ Tarea          │ ⏳ En Progreso · Alta prioridad         │ │ │
│ │                │ Subtareas: 2/5 completadas              │ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 10:00 - 11:30  │ 🎓 CLASE: Álgebra Lineal               │ │ │
│ │ Clase          │ Grupo A · 15/18 estudiantes            │ │ │
│ │                │ [Iniciar] [Ver Grupo] [Asistencia]     │ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Todo el día    │ 📌 Recordatorio: Enviar tarea Grupo B  │ │ │
│ │ Recordatorio   │                                         │ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ MAÑANA - Martes 16 de Enero ──────────────────────────── 1 evento│
│                                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 14:00 - 15:00  │ 📝 Corregir exámenes Geometría         │ │ │
│ │ Tarea          │ ⏸️ Pendiente · Media prioridad          │ │ │
│ │                │ Subtareas: 0/3 completadas              │ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ PRÓXIMOS 7 DÍAS ──────────────────────────────────────── 8 eventos│
│ (Lista compacta agrupada por día)                                │
│                                                                   │
│ MÁS ADELANTE ───────────────────────────────────────── 12 eventos │
│ (Lista muy compacta)                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Características:**
- Agrupación inteligente: Hoy, Mañana, Próximos 7 días, Más adelante
- Cada grupo muestra contador de eventos
- Eventos expandibles (click para ver detalles completos)
- Eventos "Hoy" y "Mañana" con más detalles visuales
- Eventos futuros más compactos
- Scroll infinito hacia el futuro

**Estados de Visualización por Tipo:**

**Tarea:**
```
┌─────────────────────────────────────────────────────────────┐
│ 08:00 - 09:00  │ 📝 Preparar materiales Álgebra          │ │
│ Tarea          │ ⏳ En Progreso · 🔴 Alta prioridad       │ │
│                │ ✓ 2/5 subtareas · 📎 3 archivos         │ │
│                │ [Ver Detalles] [Marcar Completada]       │ │
└─────────────────────────────────────────────────────────────┘
```

**Clase:**
```
┌─────────────────────────────────────────────────────────────┐
│ 10:00 - 11:30  │ 🎓 Álgebra Lineal - Grupo A            │ │
│ Clase          │ 📚 Álgebra · 15/18 estudiantes          │ │
│                │ [Iniciar Clase] [Ver Grupo] [Asistencia]│ │
└─────────────────────────────────────────────────────────────┘
```

**Recordatorio:**
```
┌─────────────────────────────────────────────────────────────┐
│ 15:00          │ 🔔 Enviar recordatorio Grupo B          │ │
│ Recordatorio   │ Click para marcar como completado       │ │
└─────────────────────────────────────────────────────────────┘
```

**Nota:**
```
┌─────────────────────────────────────────────────────────────┐
│ Todo el día    │ 📝 Reunión con padres de Juan          │ │
│ Nota           │ "Revisar progreso en fracciones"        │ │
└─────────────────────────────────────────────────────────────┘
```

---

### Vista Semana

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📅 Calendario                                    [Semana][Agenda]│
│ [← 8-14 Enero →]                                [+ Nuevo Evento] │
├─────────────────────────────────────────────────────────────────┤
│       │ LUN 8 │ MAR 9 │ MIÉ 10│ JUE 11│ VIE 12│ SÁB 13│ DOM 14│
│ ──────┼───────┼───────┼───────┼───────┼───────┼───────┼───────│
│ 08:00 │       │       │ Tarea │       │       │       │       │
│       │       │       │ 📝    │       │       │       │       │
│ ──────┼───────┼───────┼───────┼───────┼───────┼───────┼───────│
│ 09:00 │       │       │       │       │       │       │       │
│ ──────┼───────┼───────┼───────┼───────┼───────┼───────┼───────│
│ 10:00 │ Clase │       │ Clase │       │ Clase │       │       │
│       │ 🎓    │       │ 🎓    │       │ 🎓    │       │       │
│ 11:00 │       │       │       │       │       │       │       │
│ ──────┼───────┼───────┼───────┼───────┼───────┼───────┼───────│
│ 12:00 │       │       │       │       │       │       │       │
│ ──────┼───────┼───────┼───────┼───────┼───────┼───────┼───────│
│ ...   │       │       │       │       │       │       │       │
└─────────────────────────────────────────────────────────────────┘
```

**Características:**
- Timeline vertical (00:00 - 23:59) en intervalos de 1 hora
- 7 columnas (Lunes - Domingo)
- Eventos como bloques de color
- Altura del bloque = duración del evento
- Eventos "todo el día" en fila superior especial
- Scroll vertical para navegar horas
- Auto-scroll al horario actual (ej: 10am)
- Click en celda vacía → Crear evento en ese día/hora
- Click en evento → Modal de detalles/edición

---

## 2. SISTEMA DE TAREAS (ULTRA ROBUSTO)

### Estructura de Datos

```typescript
interface Tarea {
  // Básico
  id: string;
  titulo: string;
  descripcion?: string;

  // Temporal
  fecha_inicio: Date;
  fecha_fin: Date;
  es_todo_el_dia: boolean;

  // Estado y Prioridad
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';

  // Organización
  categoria?: string; // ej: "Preparación", "Corrección", "Administrativo"
  etiquetas: string[]; // ej: ["Álgebra", "Grupo A", "Examen"]

  // Subtareas
  subtareas: {
    id: string;
    titulo: string;
    completada: boolean;
    orden: number;
  }[];

  // Adjuntos
  archivos: {
    id: string;
    nombre: string;
    url: string;
    tipo: string; // "pdf", "docx", "xlsx", etc
    tamaño: number; // bytes
  }[];

  // Relaciones
  clase_relacionada_id?: string;
  estudiante_relacionado_id?: string;

  // Progreso
  porcentaje_completado: number; // 0-100 (calculado o manual)
  tiempo_estimado_minutos?: number;
  tiempo_real_minutos?: number;

  // Recurrencia
  recurrencia?: {
    tipo: 'diaria' | 'semanal' | 'mensual';
    intervalo: number; // cada X días/semanas/meses
    dias_semana?: number[]; // [0,1,2,3,4,5,6] para semanal
    fecha_fin_recurrencia?: Date;
    excepciones: Date[]; // fechas donde NO se repite
  };

  // Notificaciones
  recordatorios: {
    minutos_antes: number; // 15, 30, 60, 1440 (1 día)
    enviado: boolean;
  }[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  docente_id: string;
}
```

### Modal de Creación/Edición de Tarea

```
┌─────────────────────────────────────────────────────────────────┐
│ [X] Nueva Tarea                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Título *                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Corregir exámenes de Álgebra                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Descripción                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Revisar exámenes del tema "Ecuaciones Lineales"            │ │
│ │ Verificar procedimientos y resultados                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌────────────────────┬────────────────────┐                      │
│ │ Fecha y Hora       │ Prioridad          │                      │
│ │ ▼ 16 Ene 2025      │ [🔴 Alta ▼]       │                      │
│ │ 14:00 - 16:00      │                    │                      │
│ │ ☐ Todo el día      │                    │                      │
│ └────────────────────┴────────────────────┘                      │
│                                                                   │
│ ┌────────────────────┬────────────────────┐                      │
│ │ Estado             │ Categoría          │                      │
│ │ [⏸️ Pendiente ▼]   │ [Corrección ▼]    │                      │
│ └────────────────────┴────────────────────┘                      │
│                                                                   │
│ Etiquetas                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Álgebra x] [Grupo A x] [+ Agregar etiqueta]                │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ ✓ Subtareas (3)                                           [+ Add]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ Revisar respuestas del problema 1-5                      │ │
│ │ ☑ Verificar procedimientos del problema 6-10               │ │
│ │ ☐ Calcular promedio del grupo                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ 📎 Archivos Adjuntos (2)                          [+ Subir Archivo]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 examen_algebra_grupo_a.pdf        2.3 MB        [x]      │ │
│ │ 📊 rubrica_evaluacion.xlsx           156 KB        [x]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ 🔗 Relacionar con (opcional)                                     │
│ ┌────────────────────┬────────────────────┐                      │
│ │ Clase              │ Estudiante         │                      │
│ │ [Álgebra Lineal ▼] │ [Ninguno ▼]       │                      │
│ └────────────────────┴────────────────────┘                      │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ ⏱️ Tiempo Estimado                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [2] horas [0] minutos                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ 🔁 Recurrencia                                                   │
│ ☐ Repetir esta tarea                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Semanal ▼] cada [1] semana(s)                              │ │
│ │ ☐ L ☐ M ☑ M ☐ J ☑ V ☐ S ☐ D                                │ │
│ │ Hasta: [31 Dic 2025]                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ 🔔 Recordatorios                                          [+ Agregar]│
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔔 15 minutos antes                                [x]      │ │
│ │ 🔔 1 día antes                                     [x]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│                         [Cancelar]  [Guardar Tarea]              │
└─────────────────────────────────────────────────────────────────┘
```

### Vista Expandida de Tarea en Agenda

Cuando haces click en una tarea en la agenda:

```
┌─────────────────────────────────────────────────────────────────┐
│ 📝 Corregir exámenes de Álgebra                          [Editar]│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 📅 Martes 16 Enero 2025 · 14:00 - 16:00 (2 horas)               │
│ 🔴 Alta prioridad · ⏸️ Pendiente · Corrección                   │
│ 🏷️ Álgebra, Grupo A                                             │
│                                                                   │
│ Descripción:                                                      │
│ Revisar exámenes del tema "Ecuaciones Lineales"                 │
│ Verificar procedimientos y resultados                            │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ Subtareas (1/3 completadas) ──────────────────────── 33%         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ Revisar respuestas del problema 1-5                      │ │
│ │ ☑ Verificar procedimientos del problema 6-10               │ │
│ │ ☐ Calcular promedio del grupo                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ [+ Agregar subtarea]                                              │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ 📎 Archivos (2)                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 examen_algebra_grupo_a.pdf           [Descargar] [Ver]   │ │
│ │ 📊 rubrica_evaluacion.xlsx              [Descargar] [Ver]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ 🔗 Relacionado con: Clase "Álgebra Lineal - Grupo A"    [Ver]   │
│                                                                   │
│ ⏱️ Tiempo: 2h estimadas · 0h trabajadas                         │
│                                                                   │
│ 🔔 Recordatorios: 1 día antes, 15 min antes                     │
│                                                                   │
│ 🔁 Se repite: Cada semana (Miércoles, Viernes)                  │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ Creada: 15 Ene 2025, 10:30 · Actualizada: 15 Ene 2025, 14:15    │
│                                                                   │
│ ──────────────────────────────────────────────────────────────── │
│                                                                   │
│ [Eliminar Tarea] [Duplicar] [Marcar como Completada] [Editar]   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Actions en Tareas

**En Vista Agenda (sin expandir):**
- Checkbox rápido para marcar completada
- Checkbox en subtareas visibles
- Indicador de progreso (barra de porcentaje)

**Estados Visuales:**
```
Pendiente:    ⏸️ + Borde gris
En Progreso:  ⏳ + Borde amarillo + Barra de progreso
Completada:   ✅ + Borde verde + Tachado
Cancelada:    ❌ + Borde rojo + Opacity 50%
```

**Prioridades Visuales:**
```
Baja:     🟢 Verde
Media:    🟡 Amarillo
Alta:     🔴 Rojo
Urgente:  🔴 Rojo parpadeante + Icono ⚡
```

---

## 3. RECORDATORIOS

### Estructura Simple

```typescript
interface Recordatorio {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: Date;
  hora?: string; // "15:00" o null si es "todo el día"
  es_todo_el_dia: boolean;
  completado: boolean;
  color: string;
  docente_id: string;
  createdAt: Date;
}
```

### Modal de Creación

```
┌─────────────────────────────────────────────────────────────────┐
│ [X] Nuevo Recordatorio                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Título *                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Enviar tarea de fracciones al Grupo B                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Descripción                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Enviar por email la guía de ejercicios                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Fecha y Hora                                                      │
│ ┌────────────────────┬────────────────────┐                      │
│ │ ▼ 16 Ene 2025      │ ▼ 15:00           │                      │
│ │ ☐ Todo el día      │                    │                      │
│ └────────────────────┴────────────────────┘                      │
│                                                                   │
│ Color                                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [🔴] [🟠] [🟡] [🟢] [🔵] [🟣] [⚫]                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│                                  [Cancelar]  [Guardar]           │
└─────────────────────────────────────────────────────────────────┘
```

### Acciones

- Click en recordatorio → Marcar como completado (checkbox)
- Click en recordatorio completado → Desmarcar
- Recordatorios completados se tachan pero no desaparecen
- Opción de ocultar completados en filtros

---

## 4. NOTAS

### Estructura Simple

```typescript
interface Nota {
  id: string;
  titulo: string;
  contenido: string; // Texto largo, puede ser markdown
  fecha: Date;
  es_todo_el_dia: boolean;
  hora_inicio?: string;
  hora_fin?: string;
  color: string;
  categoria?: string; // ej: "Reuniones", "Personal", "Administrativo"
  docente_id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Modal de Creación

```
┌─────────────────────────────────────────────────────────────────┐
│ [X] Nueva Nota                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Título *                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Reunión con padres de Juan                                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Contenido                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Temas a tratar:                                             │ │
│ │ - Progreso en fracciones (mejoró 15%)                       │ │
│ │ - Comportamiento en clase (excelente)                       │ │
│ │ - Plan de refuerzo para siguiente mes                       │ │
│ │                                                              │ │
│ │ Notas:                                                       │ │
│ │ Los padres están muy contentos con el progreso             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ Fecha y Hora                                                      │
│ ┌────────────────────┬────────────────────────────────────────┐ │
│ │ ▼ 20 Ene 2025      │ 16:00 - 17:00                          │ │
│ │ ☐ Todo el día      │                                         │ │
│ └────────────────────┴────────────────────────────────────────┘ │
│                                                                   │
│ ┌────────────────────┬────────────────────┐                      │
│ │ Categoría          │ Color              │                      │
│ │ [Reuniones ▼]      │ [🔵 Azul ▼]       │                      │
│ └────────────────────┴────────────────────┘                      │
│                                                                   │
│                                  [Cancelar]  [Guardar]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. CLASES EN EL CALENDARIO

### Visualización

Las **Clases del sistema** se muestran automáticamente en el calendario:

**En Vista Agenda:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 10:00 - 11:30  │ 🎓 Álgebra Lineal - Grupo A                │ │
│ Clase          │ 📚 Álgebra · 15/18 estudiantes · Aula 201  │ │
│                │ Estado: Programada                          │ │
│                │ [Iniciar Clase] [Ver Grupo] [Asistencia]   │ │
│                │ [Reprogramar] [Cancelar]                    │ │
└─────────────────────────────────────────────────────────────────┘
```

**En Vista Semana:**
```
Bloque de color según ruta curricular
Icono 🎓
Texto: "Álgebra"
Hover: Tooltip con info completa
```

### Reprogramar Clase (Recuperar)

Cuando haces click en **[Reprogramar]**:

```
┌─────────────────────────────────────────────────────────────────┐
│ [X] Reprogramar Clase                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ Clase: Álgebra Lineal - Grupo A                                 │
│ Fecha original: Lunes 15 Ene 2025, 10:00 - 11:30                │
│                                                                   │
│ ⚠️ Esta clase será marcada como "Reprogramada"                  │
│                                                                   │
│ Nueva Fecha y Hora *                                              │
│ ┌────────────────────┬────────────────────┐                      │
│ │ ▼ 22 Ene 2025      │ 14:00 - 15:30     │                      │
│ └────────────────────┴────────────────────┘                      │
│                                                                   │
│ Motivo de Reprogramación                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Feriado nacional                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ☑ Notificar a estudiantes del cambio                            │
│                                                                   │
│                            [Cancelar]  [Reprogramar Clase]       │
└─────────────────────────────────────────────────────────────────┘
```

**Efecto:**
1. Clase original: Estado cambia a "Reprogramada"
2. Nueva clase: Se crea en nueva fecha (mismos estudiantes, misma ruta)
3. Ambas aparecen en calendario con indicador de relación
4. Notificación automática a estudiantes inscritos

### Quick Actions en Clases

- **[Iniciar Clase]** → Redirige a `/docente/clase/:id/sala`
- **[Ver Grupo]** → Redirige a `/docente/grupos/:id`
- **[Asistencia]** → Redirige a `/docente/clases/:id/asistencia`
- **[Reprogramar]** → Modal de reprogramación
- **[Cancelar]** → Modal de confirmación (marca clase como cancelada)

---

## 6. DRAG & DROP

### Comportamiento

**En Vista Semana:**
1. **Arrastrar evento entre días:**
   - Grab evento → Arrastrar a otra columna (día)
   - Al soltar: Evento se mueve a ese día (misma hora)
   - Confirmación visual (animación)

2. **Arrastrar evento entre horas:**
   - Grab evento → Arrastrar verticalmente
   - Al soltar: Evento cambia hora de inicio (mantiene duración)

3. **Redimensionar evento:**
   - Hover en borde inferior del evento → Cursor resize
   - Arrastrar hacia arriba/abajo → Cambia hora de fin
   - Duración mínima: 15 minutos

**En Vista Agenda:**
- Drag handle (⋮⋮) a la izquierda de cada evento
- Arrastrar hacia arriba/abajo para reordenar visualmente
- Al soltar: Modal rápido "Mover a otra fecha?" con selector de día

### Restricciones

**Clases del sistema:**
- ❌ NO se pueden mover con drag & drop (solo con "Reprogramar")
- Icono de candado 🔒 al intentar arrastrar
- Tooltip: "Usa el botón Reprogramar para mover esta clase"

**Tareas/Recordatorios/Notas:**
- ✅ Se pueden mover libremente con drag & drop

### Feedback Visual

```
Mientras arrastras:
- Evento original: Opacity 50%
- Evento "fantasma" siguiendo cursor
- Drop zones válidas: Highlight verde
- Drop zones inválidas: Highlight rojo

Al soltar:
- Animación de "snap" a posición final
- Toast: "Evento movido a [nueva fecha/hora]"
- Opción de "Deshacer" (5 segundos)
```

---

## 7. FILTROS Y BÚSQUEDA

### Panel de Filtros (Sidebar o Dropdown)

```
┌─────────────────────────────────────────┐
│ 🔍 Filtros                              │
├─────────────────────────────────────────┤
│                                          │
│ Buscar                                   │
│ ┌─────────────────────────────────────┐ │
│ │ 🔍 Buscar eventos...                │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Mostrar:                                 │
│ ☑ Clases                                │
│ ☑ Tareas                                │
│ ☑ Recordatorios                         │
│ ☑ Notas                                 │
│                                          │
│ Estado de Tareas:                        │
│ ☑ Pendientes                            │
│ ☑ En Progreso                           │
│ ☑ Completadas                           │
│ ☐ Canceladas                            │
│                                          │
│ Prioridad:                               │
│ ☑ Urgente                               │
│ ☑ Alta                                  │
│ ☑ Media                                 │
│ ☑ Baja                                  │
│                                          │
│ Categoría:                               │
│ ☑ Preparación                           │
│ ☑ Corrección                            │
│ ☑ Administrativo                        │
│ ☑ Reuniones                             │
│                                          │
│ Ruta Curricular:                         │
│ ☑ Álgebra                               │
│ ☑ Geometría                             │
│ ☑ Cálculo                               │
│ ☑ Todas                                 │
│                                          │
│ [Limpiar Filtros]                       │
└─────────────────────────────────────────┘
```

### Búsqueda

- Busca en: Título, Descripción, Etiquetas
- Resultados en tiempo real (mientras escribes)
- Highlight de coincidencias en la vista
- Contador: "12 eventos encontrados"

---

## 8. NAVEGACIÓN TEMPORAL

### Controles de Navegación

```
┌─────────────────────────────────────────────────────────────────┐
│ [←] [Hoy] [→]        Enero 2025        [Semana] [Agenda]        │
└─────────────────────────────────────────────────────────────────┘
```

**Comportamiento:**
- **[←]** Vista Agenda: Retrocede 1 día | Vista Semana: Retrocede 1 semana
- **[→]** Vista Agenda: Avanza 1 día | Vista Semana: Avanza 1 semana
- **[Hoy]** Vuelve a la fecha actual
- **Enero 2025** Click abre selector de mes/año

### Keyboard Shortcuts

```
← (flecha izquierda):  Día/Semana anterior
→ (flecha derecha):    Día/Semana siguiente
T:                     Ir a Hoy
N:                     Nuevo evento (abre modal)
F:                     Focus en búsqueda
1-4:                   Toggle filtros (Clases, Tareas, Recordatorios, Notas)
```

---

## 9. EXPORTACIÓN E IMPRESIÓN

### Exportar Calendario

**Opciones:**
1. **PDF** - Vista imprimible del calendario
   - Seleccionar rango de fechas
   - Incluir/excluir tipos de eventos
   - Formato: Agenda o Semana

2. **CSV** - Lista de eventos
   - Todas las columnas (título, descripción, fecha, tipo, estado, etc)
   - Para análisis en Excel

3. **.ics (iCal)** - Archivo de calendario estándar
   - Importar en Apple Calendar, Outlook, etc
   - Sin sincronización bidireccional (solo exportación)

### Imprimir

```
[Imprimir] button →

┌─────────────────────────────────────────┐
│ Imprimir Calendario                      │
├─────────────────────────────────────────┤
│ Rango de Fechas:                         │
│ ○ Esta semana                           │
│ ○ Este mes                              │
│ ● Personalizado                         │
│   Del: [15 Ene] Al: [31 Ene]           │
│                                          │
│ Vista:                                   │
│ ○ Agenda (lista)                        │
│ ● Semana (grid)                         │
│                                          │
│ Incluir:                                 │
│ ☑ Clases                                │
│ ☑ Tareas                                │
│ ☑ Recordatorios                         │
│ ☑ Notas                                 │
│                                          │
│ ☑ Incluir detalles completos            │
│ ☑ Mostrar colores                       │
│                                          │
│         [Cancelar]  [Vista Previa]      │
└─────────────────────────────────────────┘
```

---

## 10. ARQUITECTURA TÉCNICA

### Stack Tecnológico

```typescript
// Librerías principales
- @dnd-kit/core (drag & drop robusto)
- @dnd-kit/sortable (reordenamiento)
- date-fns (manipulación de fechas)
- framer-motion (animaciones)
- react-hook-form (formularios complejos)
- zod (validación de schemas)
- zustand (estado global del calendario)
```

### Estructura de Base de Datos

```prisma
// Modelo principal de eventos
model Evento {
  id                String   @id @default(cuid())

  // Básico
  titulo            String
  descripcion       String?
  tipo              TipoEvento

  // Temporal
  fecha_inicio      DateTime
  fecha_fin         DateTime
  es_todo_el_dia    Boolean  @default(false)

  // Relaciones
  docente_id        String
  docente           User     @relation(fields: [docente_id], references: [id])
  clase_id          String?  // Si tipo = CLASE
  clase             Clase?   @relation(fields: [clase_id], references: [id])

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Polimórfico según tipo
  tarea             Tarea?
  recordatorio      Recordatorio?
  nota              Nota?

  @@index([docente_id, fecha_inicio])
  @@index([tipo])
}

enum TipoEvento {
  CLASE
  TAREA
  RECORDATORIO
  NOTA
}

model Tarea {
  id                       String   @id @default(cuid())
  evento_id                String   @unique
  evento                   Evento   @relation(fields: [evento_id], references: [id], onDelete: Cascade)

  // Estado
  estado                   EstadoTarea
  prioridad                PrioridadTarea
  porcentaje_completado    Int      @default(0)

  // Organización
  categoria                String?
  etiquetas                String[] // Array de strings

  // Subtareas (JSON)
  subtareas                Json     @default("[]")
  // [{id, titulo, completada, orden}]

  // Archivos (JSON)
  archivos                 Json     @default("[]")
  // [{id, nombre, url, tipo, tamaño}]

  // Relaciones opcionales
  clase_relacionada_id     String?
  estudiante_relacionado_id String?

  // Tiempo
  tiempo_estimado_minutos  Int?
  tiempo_real_minutos      Int?

  // Recurrencia (JSON)
  recurrencia              Json?
  // {tipo, intervalo, dias_semana, fecha_fin, excepciones}

  // Recordatorios (JSON)
  recordatorios            Json     @default("[]")
  // [{minutos_antes, enviado}]

  // Fechas
  completedAt              DateTime?
}

enum EstadoTarea {
  PENDIENTE
  EN_PROGRESO
  COMPLETADA
  CANCELADA
}

enum PrioridadTarea {
  BAJA
  MEDIA
  ALTA
  URGENTE
}

model Recordatorio {
  id         String   @id @default(cuid())
  evento_id  String   @unique
  evento     Evento   @relation(fields: [evento_id], references: [id], onDelete: Cascade)

  completado Boolean  @default(false)
  color      String   @default("#6366f1")
}

model Nota {
  id         String   @id @default(cuid())
  evento_id  String   @unique
  evento     Evento   @relation(fields: [evento_id], references: [id], onDelete: Cascade)

  contenido  String   @db.Text
  categoria  String?
  color      String   @default("#8b5cf6")
}
```

### API Endpoints

```typescript
// Eventos (CRUD genérico)
GET    /api/docentes/eventos                    // Listar con filtros
GET    /api/docentes/eventos/:id                // Detalle
POST   /api/docentes/eventos                    // Crear
PUT    /api/docentes/eventos/:id                // Actualizar
DELETE /api/docentes/eventos/:id                // Eliminar
PATCH  /api/docentes/eventos/:id/mover          // Drag & drop

// Tareas (endpoints específicos)
PATCH  /api/docentes/tareas/:id/subtarea        // Toggle subtarea
PATCH  /api/docentes/tareas/:id/estado          // Cambiar estado
POST   /api/docentes/tareas/:id/archivo         // Subir archivo
DELETE /api/docentes/tareas/:id/archivo/:fileId // Eliminar archivo

// Recordatorios
PATCH  /api/docentes/recordatorios/:id/completar // Toggle completado

// Clases
PATCH  /api/docentes/clases/:id/reprogramar     // Reprogramar clase

// Exportación
GET    /api/docentes/eventos/export/pdf         // Exportar PDF
GET    /api/docentes/eventos/export/csv         // Exportar CSV
GET    /api/docentes/eventos/export/ics         // Exportar .ics
```

### Store de Zustand

```typescript
interface CalendarioStore {
  // Data
  eventos: Evento[];
  eventosLoading: boolean;

  // Vista
  vistaActual: 'agenda' | 'semana';
  fechaActual: Date;

  // Filtros
  filtros: {
    tipos: TipoEvento[];
    estadosTarea: EstadoTarea[];
    prioridades: PrioridadTarea[];
    categorias: string[];
    rutas: string[];
    busqueda: string;
  };

  // Actions
  fetchEventos: (desde: Date, hasta: Date) => Promise<void>;
  crearEvento: (data: CrearEventoInput) => Promise<Evento>;
  actualizarEvento: (id: string, data: ActualizarEventoInput) => Promise<void>;
  eliminarEvento: (id: string) => Promise<void>;
  moverEvento: (id: string, nuevaFecha: Date) => Promise<void>;

  // Tareas
  toggleSubtarea: (tareaId: string, subtareaId: string) => Promise<void>;
  cambiarEstadoTarea: (tareaId: string, nuevoEstado: EstadoTarea) => Promise<void>;

  // Recordatorios
  toggleRecordatorio: (recordatorioId: string) => Promise<void>;

  // Clases
  reprogramarClase: (claseId: string, nuevaFecha: Date, motivo: string) => Promise<void>;

  // Vistas
  setVista: (vista: 'agenda' | 'semana') => void;
  setFecha: (fecha: Date) => void;
  irHoy: () => void;
  avanzar: () => void;
  retroceder: () => void;

  // Filtros
  setFiltros: (filtros: Partial<Filtros>) => void;
  limpiarFiltros: () => void;
}
```

---

## 11. UX/UI PREMIUM

### Glassmorphism & Design System

```css
/* Eventos por tipo */
.evento-clase {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05));
  border-left: 4px solid var(--ruta-color);
  backdrop-filter: blur(12px);
}

.evento-tarea {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05));
  border-left: 4px solid #3b82f6;
  backdrop-filter: blur(12px);
}

.evento-recordatorio {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05));
  border-left: 4px solid #10b981;
  backdrop-filter: blur(12px);
}

.evento-nota {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
  border-left: 4px solid #f59e0b;
  backdrop-filter: blur(12px);
}

/* Estados de tarea */
.tarea-urgente {
  animation: pulse-red 2s infinite;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
}
```

### Animaciones (Framer Motion)

```typescript
// Entrada de eventos en agenda
const eventoVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut'
    }
  })
};

// Drag & Drop
const dragConstraints = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};

// Modal de evento
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
};
```

---

## 12. RESUMEN DE FEATURES

### ✅ Implementar

**Core:**
- [x] Vista Agenda (principal)
- [x] Vista Semana (alternativa)
- [x] Crear/Editar/Eliminar eventos (todos los tipos)
- [x] Drag & Drop (mover eventos entre días/horas)
- [x] Filtros avanzados (tipo, estado, prioridad, categoría, ruta)
- [x] Búsqueda en tiempo real

**Tareas (Ultra Robusto):**
- [x] Estados (Pendiente, En Progreso, Completada, Cancelada)
- [x] Prioridades (Baja, Media, Alta, Urgente)
- [x] Subtareas con checkbox
- [x] Adjuntar archivos
- [x] Categorías y etiquetas
- [x] Relacionar con clases/estudiantes
- [x] Tiempo estimado vs real
- [x] Recurrencia (diaria, semanal, mensual)
- [x] Recordatorios múltiples
- [x] Progreso visual (barra de porcentaje)

**Clases:**
- [x] Visualización automática desde sistema
- [x] Quick actions (Iniciar, Ver Grupo, Asistencia)
- [x] Reprogramar clase (crear recuperación)
- [x] Cancelar clase
- [x] No drag & drop (solo con botón Reprogramar)

**Recordatorios:**
- [x] Crear/Editar/Eliminar
- [x] Todo el día o con hora específica
- [x] Marcar como completado
- [x] Color personalizado

**Notas:**
- [x] Crear/Editar/Eliminar
- [x] Contenido largo (markdown opcional)
- [x] Categorías
- [x] Color personalizado

**Exportación:**
- [x] PDF (vista imprimible)
- [x] CSV (análisis)
- [x] .ics (importar a otros calendarios)

**UX Premium:**
- [x] Glassmorphism design
- [x] Framer Motion animations
- [x] Breadcrumbs
- [x] Toast notifications
- [x] Dark mode
- [x] Keyboard shortcuts
- [x] Responsive design

---

## Tiempo Estimado de Desarrollo

| Componente | Estimación |
|------------|-----------|
| Base del calendario (vistas, navegación) | 1 día |
| Sistema de tareas completo | 2 días |
| Drag & Drop | 1 día |
| Clases (reprogramar, quick actions) | 0.5 días |
| Recordatorios y Notas | 0.5 días |
| Filtros y búsqueda | 0.5 días |
| Exportación (PDF, CSV, .ics) | 0.5 días |
| UI/UX polish + animaciones | 0.5 días |
| Testing y ajustes | 0.5 días |
| **TOTAL** | **7-8 días** |

---

## ¿Aprobado para implementar?

Esta especificación cubre el **100% funcional** del calendario como app de productividad robusta.

¿Confirmamos que esto es exactamente lo que necesitas antes de empezar a codear?
