# Portal Docente - Requisitos Reales vs Implementación Actual

**Fecha:** 2025-01-15
**Status:** Análisis de Gap

---

## Executive Summary

Después de la auditoría y las solicitudes del usuario, hay una desconexión entre:
1. Lo que está implementado (básico/mockup)
2. Lo que realmente se necesita (funcional/productivo)

---

## 1. CALENDARIO

### ❌ Estado Actual (Score: 5/10)
```typescript
// apps/web/src/app/docente/calendario/page.tsx
```

**Implementación Actual:**
- Vista mensual básica (grid 7x6)
- Muestra clases existentes
- Modal con detalles al click en día
- Toggle calendario/lista
- **SOLO LECTURA - No hay funcionalidad de creación/edición**

**Problemas:**
1. ❌ NO es una app de productividad
2. ❌ NO tiene gestión de hábitos
3. ❌ NO se puede crear clases desde calendario
4. ❌ NO hay drag & drop
5. ❌ NO hay vista semanal/diaria
6. ❌ NO hay recordatorios personales
7. ❌ NO hay tareas/to-dos
8. ❌ NO hay bloques de tiempo personales (ej: "Preparar materiales", "Corregir tareas")

### ✅ Lo Que Se Necesita (Target: 10/10)

**App de Productividad Completa:**

#### A. Vistas Múltiples
```
┌─────────────────────────────────────────┐
│ [Día] [Semana] [Mes] [Agenda]          │
└─────────────────────────────────────────┘
```

- **Vista Día:** Timeline 00:00-23:59 con bloques visuales
- **Vista Semana:** 7 columnas con timeline (estilo Google Calendar)
- **Vista Mes:** Grid actual mejorado con drag & drop
- **Vista Agenda:** Lista cronológica con filtros avanzados

#### B. Creación de Eventos
```
Tipos de Eventos:
1. 🎓 Clases (conectadas al sistema de clases)
2. ✅ Tareas/To-Dos (preparar materiales, corregir)
3. 🔔 Recordatorios (enviar notificación, revisar progreso)
4. 📝 Notas personales (reunión padres, junta docentes)
5. 🎯 Hábitos (leer 30min, ejercicio, meditación)
```

**Crear Evento:**
- Click en cualquier día/hora → Modal de creación
- Campos: Título, Tipo, Fecha/Hora inicio/fin, Descripción, Color, Recordatorio
- Para clases: Link al sistema existente (crear clase completa)
- Para hábitos: Recurrencia (diario, semanal, mensual)

#### C. Drag & Drop
```typescript
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// Arrastrar eventos entre días/horas
// Redimensionar eventos (cambiar duración)
// Duplicar eventos (Ctrl+Drag)
```

#### D. Gestión de Hábitos
```
┌─────────────────────────────────────────┐
│ 📊 Mis Hábitos                          │
├─────────────────────────────────────────┤
│ ✅ Leer 30min        🔥 Racha: 12 días  │
│ ✅ Ejercicio         🔥 Racha: 8 días   │
│ ⏸️ Meditación        🔥 Racha: 0 días   │
└─────────────────────────────────────────┘
```

- Tracking diario (check/uncheck)
- Racha visible (motivación)
- Estadísticas mensuales
- Integración con calendario (bloques de hábitos)

#### E. Bloques de Tiempo Personales
```
Ejemplos:
08:00-09:00 | 📖 Preparar clase de Álgebra
09:00-11:00 | 🎓 Clase: Álgebra Lineal (SISTEMA)
11:00-12:00 | ☕ Descanso
14:00-15:30 | ✅ Corregir tareas Grupo A
16:00-17:00 | 📝 Reunión con padres de Juan
17:00-17:30 | 🎯 Leer 30min (HÁBITO)
```

#### F. Recordatorios & Notificaciones
- Notificación 15min antes de evento
- Notificación 24h antes de clase
- Recordatorio de hábito diario
- Email/Push configurable

#### G. Integraciones
- Exportar a Google Calendar (.ics)
- Sincronizar con calendario del sistema
- Compartir disponibilidad (para reuniones con padres)

#### H. UI/UX Premium
- Glassmorphism design
- Framer Motion animations
- Color-coding por tipo de evento
- Vista compacta/expandida
- Filtros avanzados (por tipo, por ruta, por estado)
- Búsqueda global de eventos

---

## 2. OBSERVACIONES

### ❌ Estado Actual (Score: 5/10)
```typescript
// apps/web/src/app/docente/observaciones/page.tsx
```

**Implementación Actual:**
- Lista de observaciones existentes
- Filtros básicos (búsqueda, fecha desde/hasta)
- Modal de detalle
- **SOLO LECTURA - No hay funcionalidad de creación/edición**

**Problemas:**
1. ❌ NO se pueden crear observaciones desde aquí
2. ❌ NO se pueden editar observaciones existentes
3. ❌ NO hay categorización (positiva/negativa/neutral)
4. ❌ NO hay templates de observaciones comunes
5. ❌ NO hay observaciones masivas (toda la clase)
6. ❌ NO hay seguimiento (observación + plan de acción + seguimiento)
7. ❌ NO hay exportación a PDF

### ✅ Lo Que Se Necesita (Target: 10/10)

**Sistema Completo de Observaciones:**

#### A. Crear Observación
```
Desde Observaciones Page:
┌─────────────────────────────────────────┐
│ [+ Nueva Observación]                   │
└─────────────────────────────────────────┘

Modal:
- Estudiante (select con búsqueda)
- Clase relacionada (opcional)
- Tipo: ✅ Positiva | ⚠️ Neutral | ❌ Negativa
- Categoría: Comportamiento, Rendimiento, Participación, Asistencia
- Observación (textarea con templates)
- Seguimiento requerido: Sí/No
- Fecha de seguimiento (si aplica)
- Privacidad: Visible para padres Sí/No
```

#### B. Templates de Observaciones
```
Templates comunes:
- "Excelente participación en clase"
- "Mostró dificultad en [tema], requiere refuerzo"
- "Llegó tarde sin justificación"
- "Completó todas las tareas con excelencia"
- "Ayudó a compañeros con dificultades"
- Custom (guardar nuevos templates)
```

#### C. Observaciones Masivas
```
Crear observación para múltiples estudiantes:
1. Seleccionar clase
2. Ver lista de estudiantes
3. Checkbox para seleccionar múltiples
4. Aplicar misma observación a todos
5. Opción de personalizar individualmente
```

#### D. Editar Observación
```
Click en observación existente:
- Editar texto
- Cambiar tipo/categoría
- Añadir seguimiento
- Historial de cambios (quién, cuándo)
```

#### E. Sistema de Seguimiento
```
Observación → Plan de Acción → Seguimientos

Ejemplo:
┌─────────────────────────────────────────┐
│ ⚠️ Juan muestra dificultad en fracciones │
├─────────────────────────────────────────┤
│ Plan de Acción:                         │
│ - Ejercicios adicionales (3 por semana) │
│ - Reunión con padres (programada)       │
│ - Revisión en 2 semanas                 │
├─────────────────────────────────────────┤
│ Seguimientos:                           │
│ ✅ 20 Ene: Mejoría notable (+15%)       │
│ ✅ 27 Ene: Completó ejercicios          │
│ ⏳ 3 Feb: Evaluación final (pendiente)  │
└─────────────────────────────────────────┘
```

#### F. Vistas & Filtros Avanzados
```
Vistas:
- Lista (actual)
- Timeline (cronológica)
- Por Estudiante (agrupada)
- Por Tipo (positivas/negativas)
- Pendientes de Seguimiento

Filtros:
- Por estudiante
- Por clase
- Por ruta curricular
- Por tipo (positiva/negativa/neutral)
- Por categoría
- Por estado (activa/cerrada)
- Rango de fechas
```

#### G. Exportación & Reportes
```
Exportar:
- PDF individual (para reunión con padres)
- PDF por estudiante (todas sus observaciones)
- PDF por clase
- Excel/CSV (análisis)

Reporte automático:
- Resumen mensual por estudiante
- Envío automático a padres (opcional)
- Notificación si 3+ observaciones negativas
```

#### H. Integración con Estudiantes
```
En perfil de estudiante:
- Ver todas sus observaciones
- Gráfico de tendencia (positivas vs negativas)
- Alertas automáticas
- Link a plan de acción
```

---

## 3. REPORTES

### ❌ Estado Actual (Score: 6/10)
```typescript
// apps/web/src/app/docente/reportes/page.tsx
```

**Implementación Actual:**
- Charts.js con 3 gráficos
- Estadísticas globales (4 cards)
- Top 10 estudiantes
- Asistencia por ruta
- **SOLO VISUALIZACIÓN - No hay filtros, no hay exportación**

**Problemas:**
1. ❌ NO hay filtros (solo datos globales)
2. ❌ NO se puede exportar a PDF/Excel
3. ❌ NO hay reportes personalizados
4. ❌ NO hay comparaciones (mes vs mes, clase vs clase)
5. ❌ NO hay predicciones/tendencias
6. ❌ NO hay reportes por estudiante individual
7. ❌ NO hay dashboard ejecutivo

### ✅ Lo Que Se Necesita (Target: 10/10)

**Sistema Completo de Reportes & Analytics:**

#### A. Filtros Dinámicos
```
┌─────────────────────────────────────────┐
│ Rango de Fechas: [▼ Último mes]        │
│ Clases: [▼ Todas] o [selección múltiple]│
│ Rutas: [▼ Todas] o [Álgebra, Geometría] │
│ Estudiantes: [▼ Todos] o [búsqueda]    │
│                                          │
│ [Aplicar Filtros] [Limpiar] [Guardar]  │
└─────────────────────────────────────────┘
```

#### B. Reportes Predefinidos
```
Templates de Reportes:
1. 📊 Dashboard Ejecutivo (resumen general)
2. 👨‍🎓 Reporte Individual (por estudiante)
3. 🎓 Reporte por Clase
4. 📚 Reporte por Ruta Curricular
5. 📈 Reporte de Tendencias (mes a mes)
6. ⚠️ Reporte de Alertas (estudiantes en riesgo)
7. 🏆 Reporte de Top Performers
8. 📉 Reporte de Bajo Rendimiento
```

#### C. Dashboard Ejecutivo
```
Vista Principal:
┌─────────────────────────────────────────┐
│ 📊 Resumen General (Últimos 30 días)    │
├─────────────────────────────────────────┤
│ [12] Clases   [156] Asistencias   85%  │
├─────────────────────────────────────────┤
│ Gráfico Tendencia Asistencia (línea)   │
├─────────────────────────────────────────┤
│ Top 5 Estudiantes | Bottom 5            │
├─────────────────────────────────────────┤
│ Alertas: 3 estudiantes requieren atención│
├─────────────────────────────────────────┤
│ [Ver Reporte Completo]                  │
└─────────────────────────────────────────┘
```

#### D. Reporte Individual de Estudiante
```
Seleccionar estudiante → Ver reporte completo

┌─────────────────────────────────────────┐
│ 👨‍🎓 Juan Pérez                           │
├─────────────────────────────────────────┤
│ Asistencia Global: 88% ✅               │
│ Clases Totales: 24 / 27                 │
│ Racha Actual: 8 clases consecutivas     │
├─────────────────────────────────────────┤
│ Por Ruta Curricular:                    │
│ Álgebra: 92% (11/12) ✅                 │
│ Geometría: 80% (8/10) ⚠️                │
│ Cálculo: 95% (5/5) ✅                   │
├─────────────────────────────────────────┤
│ Observaciones:                          │
│ ✅ Positivas: 8                         │
│ ⚠️ Neutrales: 2                         │
│ ❌ Negativas: 1                         │
├─────────────────────────────────────────┤
│ Tendencia: ↗️ Mejorando (+5% vs mes pasado)│
├─────────────────────────────────────────┤
│ Gráfico de Asistencia (últimas 8 semanas)│
├─────────────────────────────────────────┤
│ [Exportar PDF] [Enviar a Padres]       │
└─────────────────────────────────────────┘
```

#### E. Comparaciones
```
Comparar:
- Mes actual vs mes anterior
- Clase A vs Clase B
- Ruta Álgebra vs Ruta Geometría
- Estudiante vs Promedio del grupo

Visualización:
- Gráficos superpuestos
- Tabla comparativa
- Indicadores de mejora/declive
```

#### F. Predicciones & Tendencias
```
Análisis Predictivo:
1. Estudiantes en riesgo (< 75% asistencia)
2. Tendencia a la baja (3 semanas consecutivas)
3. Proyección de asistencia mensual
4. Mejores/peores días de la semana
5. Horarios con mayor/menor asistencia
```

#### G. Exportación Avanzada
```
Formatos:
- PDF (profesional, con gráficos)
- Excel (datos raw para análisis)
- CSV (importar a otros sistemas)
- PowerPoint (presentaciones)

Opciones:
- Incluir gráficos: Sí/No
- Incluir observaciones: Sí/No
- Logo de institución: Sí/No
- Firma digital del docente: Sí/No
```

#### H. Gráficos Avanzados
```
Tipos adicionales:
1. Heatmap (asistencia por día/hora)
2. Treemap (distribución por ruta)
3. Radar Chart (estudiante: asistencia, participación, tareas)
4. Gauge Chart (% asistencia con rangos de color)
5. Sankey Diagram (flujo de estudiantes entre clases)
6. Waterfall Chart (cambios mes a mes)
```

#### I. Alertas Automáticas
```
Notificaciones automáticas:
- Estudiante con 3 ausencias consecutivas
- Clase con <70% asistencia
- Tendencia negativa (2 semanas)
- Estudiante superó 95% (celebrar)

Acción sugerida:
- Contactar al estudiante
- Reunión con padres
- Ajustar metodología
```

---

## Prioridades de Implementación

### 🔴 Alta Prioridad (Implementar YA)

**1. Calendario como App de Productividad**
- Vista Semana con Timeline
- Crear/Editar/Eliminar eventos
- Drag & Drop básico
- Tipos: Clases, Tareas, Recordatorios
- Gestión de Hábitos con racha
- Estimado: 2-3 días de desarrollo

**2. Observaciones Funcional**
- Crear observación
- Editar observación
- Templates
- Seguimiento básico
- Estimado: 1-2 días de desarrollo

**3. Reportes con Filtros**
- Filtros dinámicos (fecha, clase, ruta)
- Reporte individual de estudiante
- Exportación a PDF básica
- Estimado: 1 día de desarrollo

### 🟡 Media Prioridad (Siguiente Sprint)

**4. Calendario Avanzado**
- Vista Día con timeline vertical
- Drag & Drop avanzado (redimensionar)
- Integración Google Calendar
- Recordatorios push

**5. Observaciones Avanzado**
- Observaciones masivas
- Sistema completo de seguimiento
- Exportación a PDF con formato profesional
- Notificaciones automáticas

**6. Reportes Avanzados**
- Comparaciones
- Predicciones
- Gráficos avanzados (heatmap, radar)
- Dashboard ejecutivo

### 🟢 Baja Prioridad (Futuro)

**7. Integraciones**
- API para padres (ver observaciones)
- Exportación PowerPoint
- Sincronización bidireccional con Google Calendar

---

## Arquitectura Técnica Recomendada

### Calendario
```typescript
// Librerías necesarias
- @dnd-kit/core (drag & drop)
- @dnd-kit/sortable (reordenar)
- date-fns (manejo de fechas)
- react-big-calendar (componente calendario)
- recharts o @nivo/calendar (heatmaps de hábitos)

// Estructura de datos
interface Evento {
  id: string;
  tipo: 'clase' | 'tarea' | 'recordatorio' | 'nota' | 'habito';
  titulo: string;
  descripcion?: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  color: string;
  clase_id?: string; // Si tipo='clase'
  recurrencia?: {
    frecuencia: 'diario' | 'semanal' | 'mensual';
    dias?: number[]; // 0=domingo, 1=lunes, ...
    fin?: Date;
  };
  recordatorio?: {
    minutos_antes: number;
    notificacion: 'email' | 'push' | 'ambos';
  };
}

interface Habito {
  id: string;
  nombre: string;
  descripcion: string;
  frecuencia: 'diario' | 'semanal';
  meta_semanal?: number; // ej: 5 veces por semana
  racha_actual: number;
  racha_maxima: number;
  completados: { fecha: Date; completado: boolean }[];
}
```

### Observaciones
```typescript
interface ObservacionCompleta {
  id: string;
  estudiante_id: string;
  clase_id?: string;
  docente_id: string;
  tipo: 'positiva' | 'neutral' | 'negativa';
  categoria: 'comportamiento' | 'rendimiento' | 'participacion' | 'asistencia';
  texto: string;
  visible_padres: boolean;
  seguimiento_requerido: boolean;
  fecha_seguimiento?: Date;
  estado: 'activa' | 'en_seguimiento' | 'cerrada';
  plan_accion?: {
    objetivos: string[];
    acciones: string[];
    fecha_revision: Date;
  };
  seguimientos: {
    id: string;
    fecha: Date;
    nota: string;
    progreso: number; // 0-100
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Templates
interface TemplateObservacion {
  id: string;
  nombre: string;
  tipo: 'positiva' | 'neutral' | 'negativa';
  categoria: string;
  texto: string;
  uso_count: number; // popularidad
}
```

### Reportes
```typescript
interface FiltrosReporte {
  fecha_desde: Date;
  fecha_hasta: Date;
  clase_ids?: string[];
  ruta_ids?: string[];
  estudiante_ids?: string[];
}

interface ReporteEstudiante {
  estudiante: Estudiante;
  periodo: { inicio: Date; fin: Date };
  asistencia: {
    total_clases: number;
    asistencias: number;
    ausencias: number;
    justificadas: number;
    porcentaje: number;
    racha_actual: number;
    racha_maxima: number;
  };
  por_ruta: {
    ruta: string;
    color: string;
    asistencias: number;
    total: number;
    porcentaje: number;
  }[];
  observaciones: {
    positivas: number;
    neutrales: number;
    negativas: number;
    ultimas: ObservacionCompleta[];
  };
  tendencia: {
    direccion: 'mejorando' | 'estable' | 'declinando';
    cambio_porcentual: number; // vs periodo anterior
    grafico_semanal: { semana: string; porcentaje: number }[];
  };
  alertas: string[];
}
```

---

## Estimación de Esfuerzo

| Módulo | Básico | Avanzado | Total |
|--------|--------|----------|-------|
| Calendario | 2-3 días | 2 días | 4-5 días |
| Observaciones | 1-2 días | 2 días | 3-4 días |
| Reportes | 1 día | 2 días | 3 días |
| **TOTAL** | **4-6 días** | **6 días** | **10-12 días** |

**Nota:** "Básico" = funcionalidad prioritaria mínima viable
**Nota:** "Avanzado" = features completas premium

---

## Pregunta Clave para el Usuario

**¿Quieres que implemente primero la versión BÁSICA de las 3 páginas (4-6 días)?**

O

**¿Prefieres que haga UNA página completa al 100% (ej: Calendario completo con hábitos, drag&drop, etc)?**

Recomendación: Implementar básico de las 3 → Luego iterar con avanzado
