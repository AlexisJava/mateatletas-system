# 🎨 Auditoría UX/UI - Portal Docente Mateatletas

## Análisis Senior por Experto en EdTech (10+ años)

**Fecha:** 27 de Octubre, 2025
**Auditor:** Senior UX/UI Designer especializado en portales educativos
**Alcance:** Portal Docente completo + Endpoints Admin-Docente
**Metodología:** Jobs-to-be-Done (JTBD) + Information Architecture + Cognitive Load Theory

---

## 📊 Resumen Ejecutivo

### 🎯 Calificación General: **6.5/10**

**Fortalezas:**

- ✅ Diseño visual moderno con glassmorphism bien ejecutado
- ✅ Arquitectura de información clara (sidebar navigation)
- ✅ Estados de loading y error considerados
- ✅ Responsive design implementado

**Problemas Críticos:**

- ❌ **Datos mock ocultan problemas reales de UX**
- ❌ **Falta de endpoints dashboard críticos**
- ❌ **Information overload en algunas vistas**
- ❌ **Flujos de trabajo incompletos**
- ❌ **Falta de contexto en acciones críticas**

---

## 🧠 Análisis de Jobs-to-be-Done (JTBD)

### ¿Qué "trabajos" viene a hacer un docente al portal?

#### **Job #1: "Prepararme para mi próxima clase"** 🔥 CRÍTICO

**Frecuencia:** Varias veces al día
**Contexto:** 15-30 minutos antes de clase
**Necesita:**

- ✅ Ver cuándo es la próxima clase (fecha/hora)
- ✅ Ver cuántos estudiantes vienen
- ❌ **FALTA:** Materiales de la clase
- ❌ **FALTA:** Objetivos de aprendizaje
- ❌ **FALTA:** Historial de la clase anterior
- ❌ **FALTA:** Notas sobre estudiantes específicos

**Endpoint faltante:** `GET /api/docentes/me/dashboard`

```typescript
interface DashboardDocente {
  claseInminente: {
    id: string;
    titulo: string;
    fecha_hora_inicio: string;
    duracion: number;
    estudiantes_inscritos: number;
    grupo: { nombre: string; id: string };
    materiales: Material[]; // PDFs, videos, enlaces
    objetivos: string[];
    nota_clase_anterior?: string;
  } | null;

  alertas: Alerta[];

  stats: {
    clases_hoy: number;
    asistencia_promedio_semanal: number;
    observaciones_pendientes: number;
  };
}
```

**🎨 Recomendación UX:**

- Pantalla dashboard debe priorizar **clase inminente** con countdown visual
- Usar progressive disclosure: mostrar info básica primero, expandir si necesita más
- Agregar quick actions contextuales (ver materiales, tomar asistencia, etc.)

---

#### **Job #2: "Tomar asistencia de mi clase"** 🔥 CRÍTICO

**Frecuencia:** Al inicio de cada clase
**Contexto:** Primer 5-10 minutos de clase
**Necesita:**

- ✅ Lista de estudiantes esperados
- ✅ Marcar presente/ausente/justificado rápidamente
- ❌ **FALTA:** Historial de asistencia del estudiante (racha, % asistencia)
- ❌ **FALTA:** Alertas automáticas (2+ faltas consecutivas)
- ❌ **FALTA:** Quick notes por estudiante

**Endpoint existente:** ✅ `POST /api/clases/:id/asistencia`
**Endpoint faltante:** `GET /api/clases/:id/estudiantes/contexto`

```typescript
interface EstudianteContexto {
  id: string;
  nombre: string;
  apellido: string;
  avatar_url: string;
  asistencia_hoy?: 'Presente' | 'Ausente' | 'Justificado';
  historial: {
    total_clases: number;
    asistidas: number;
    porcentaje: number;
    racha_actual: number;
    faltas_consecutivas: number;
  };
  alertas: string[]; // "2+ faltas consecutivas", "Bajo rendimiento"
  ultima_observacion?: {
    texto: string;
    fecha: string;
  };
}
```

**🎨 Recomendación UX:**

- **ELIMINAR** flujo multi-step para asistencia
- Usar vista single-screen con checkboxes grandes
- Mostrar indicadores visuales de riesgo (🔴 alerta, 🟡 atención, 🟢 ok)
- Permitir bulk actions: "Marcar todos presentes" → Ajustar excepciones

---

#### **Job #3: "Ver el progreso de mis estudiantes"** 🟡 IMPORTANTE

**Frecuencia:** Semanal
**Contexto:** Planning de próximas clases
**Necesita:**

- ❌ **FALTA:** Vista consolidada por grupo
- ❌ **FALTA:** Métricas de progreso (no solo asistencia)
- ❌ **FALTA:** Comparación con objetivos

**Endpoint faltante:** `GET /api/grupos/:id/progreso`

```typescript
interface GrupoProgreso {
  id: string;
  nombre: string;
  ruta_curricular: { nombre: string; color: string };

  estudiantes: Array<{
    id: string;
    nombre_completo: string;
    avatar_url: string;
    equipo: { nombre: string; color: string };

    metricas: {
      asistencia_porcentaje: number;
      participacion_promedio: number;
      ejercicios_completados: number;
      nivel_actual: number;
      tendencia: 'up' | 'down' | 'stable';
    };

    alertas: string[];
  }>;

  estadisticas_grupo: {
    asistencia_promedio: number;
    estudiantes_en_riesgo: number;
    completitud_objetivos: number;
  };
}
```

**🎨 Recomendación UX:**

- Vista debe ser **scannable** - el docente debe entender en 3 segundos quién necesita atención
- Usar color coding consistente (verde/amarillo/rojo)
- Permitir ordenamiento por diferentes métricas
- **ELIMINAR** información no accionable (puntos totales sin contexto)

---

#### **Job #4: "Escribir observaciones sobre un estudiante"** 🟡 IMPORTANTE

**Frecuencia:** Durante/después de clase
**Contexto:** Algo notable ocurrió (positivo o negativo)
**Necesita:**

- ✅ Form rápido para escribir nota
- ❌ **FALTA:** Contexto de observaciones anteriores
- ❌ **FALTA:** Templates pre-escritos
- ❌ **FALTA:** Notificación automática al tutor

**Endpoint existente:** ✅ `GET /api/asistencia/docente/observaciones`
**Endpoint recomendado mejorar:** Agregar templates y auto-notificación

**🎨 Recomendación UX:**

- Agregar modal flotante accesible desde anywhere (Ctrl+N)
- Ofrecer templates: "Excelente participación", "Necesita refuerzo en X", etc.
- Auto-completar estudiante si se está en contexto de clase
- Preview de observaciones anteriores del estudiante

---

#### **Job #5: "Planificar mis próximas clases"** 🟢 OPCIONAL

**Frecuencia:** Semanal
**Contexto:** Fin de semana o inicio de semana
**Necesita:**

- ✅ Ver calendario de clases
- ❌ **FALTA:** Crear materiales (implementado en planificador pero desconectado)
- ❌ **FALTA:** Reutilizar materiales de clases anteriores
- ❌ **FALTA:** Ver feedback de estudiantes

**Endpoint existente:** ✅ Planificador con IA (localhost storage)
**Problema:** Está **desconectado** del flujo principal - se siente como feature aparte

**🎨 Recomendación UX:**

- **INTEGRAR** planificador en vista de clase
- Permitir "Guardar como template" desde clase completada
- Mostrar materiales usados previamente en clases similares

---

## 📐 Arquitectura de Información

### 🔴 Problemas Identificados:

#### **1. Dashboard Vacío = Experiencia Rota**

**Problema:** Sin datos mock, el dashboard no muestra NADA útil.
**Impacto:** Docente entra → pantalla vacía → frustración → abandono

**Solución:**

```
┌─────────────────────────────────────────────┐
│  🔥 PRÓXIMA CLASE                           │
│  Álgebra Básica - en 15 min                │
│  [Iniciar Clase] [Ver Materiales]          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  ⚠️  REQUIERE ATENCIÓN                      │
│  • 3 estudiantes con 2+ faltas → [Ver]     │
│  • 5 observaciones sin responder → [Ver]   │
└─────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ 3 clases hoy │ 87% asist.   │ 45 estud.    │
└──────────────┴──────────────┴──────────────┘
```

**Endpoint requerido:** `GET /api/docentes/me/dashboard`

---

#### **2. Vista Grupo sin Contexto Accionable**

**Problema:** Muestra datos (puntos, racha) pero no ayuda a DECIDIR qué hacer

**🗑️ ELIMINAR:**

- ❌ `puntosToales` (typo + no accionable sin contexto)
- ❌ `nivelActual` (gamificación es secundaria para docente)
- ❌ Badges decorativos sin significado

**✅ MANTENER/AGREGAR:**

- ✅ Asistencia % (crítico)
- ✅ Participación % (importante)
- ✅ Alertas visibles (faltas consecutivas, bajo rendimiento)
- ➕ Agregar: "Última clase asistida", "Trend (↑↓)"

**🎨 Jerarquía Visual:**

```
Estudiante [Avatar]
├─ Nombre + Equipo
├─ 🔴 ALERTA: 3 faltas consecutivas  <-- Más visible
├─ Asistencia: 85% (↓ -5% vs mes anterior)
└─ Participación: 78%
```

---

#### **3. Navegación: Demasiadas Opciones**

**Problema:** 6 items en sidebar - información overload

**Actual:**

1. Dashboard
2. Mis Clases
3. Calendario
4. Observaciones
5. Reportes
6. Planificador AI

**🎨 Reorganización Propuesta:**

```
Nivel 1 (Frecuente):
├─ 🏠 Dashboard (todo integrado aquí)
├─ 📚 Mis Clases
└─ 👥 Mis Grupos

Nivel 2 (Menos frecuente - dropdown "Más"):
├─ 📊 Reportes
├─ ✨ Planificador IA
└─ ⚙️ Configuración
```

**Razón:** Docente no piensa "voy a ver observaciones" - piensa "¿cómo va Juan?" → busca a Juan → ve observaciones ahí

---

## 🛠️ Endpoints: ¿Qué Sirve y Qué NO?

### ✅ MANTENER (están bien diseñados)

#### 1. `GET /api/clases/docente/mis-clases`

**Por qué:** Core job del docente
**Mejora sugerida:** Agregar query param `?proximas=true` para dashboard

#### 2. `PATCH /api/clases/:id/cancelar`

**Por qué:** Acción necesaria con validación correcta

#### 3. `POST /api/clases/:id/asistencia`

**Por qué:** Flujo crítico bien implementado

#### 4. `GET /api/asistencia/docente/observaciones`

**Por qué:** Permite tracking de feedback

---

### 🔄 MEJORAR (funcionan pero incompletos)

#### 1. `GET /api/docentes/me`

**Problema:** Solo datos básicos de perfil
**Mejora:** Agregar:

```typescript
{
  ...perfil_basico,
  clases_totales: number,
  estudiantes_activos: number,
  horas_enseñadas: number,
  rating_promedio?: number  // Si hay feedback de estudiantes
}
```

#### 2. `GET /api/clases/:id`

**Problema:** Falta contexto para el docente
**Mejora:** Cuando es docente autenticado, agregar:

```typescript
{
  ...clase_basica,
  estudiantes_contexto: EstudianteContexto[],  // Con historial
  materiales_previos?: Material[],  // De clases similares
  objetivos_cumplidos_clase_anterior?: boolean
}
```

---

### ❌ ELIMINAR/REEMPLAZAR

#### 1. `POST /api/docentes/:id/reasignar-clases`

**Por qué:** Es función de ADMIN, no debe estar en módulo docentes
**Acción:** Mover a `AdminController`

#### 2. Notificaciones hardcodeadas (`count={3}`)

**Por qué:** No es dato real, confunde al docente
**Acción:** Implementar `GET /api/notificaciones/docente/count` o eliminar bell icon

---

### ➕ AGREGAR (endpoints faltantes críticos)

#### 1. **`GET /api/docentes/me/dashboard`** 🔥 CRÍTICO

**Justificación:** Sin este endpoint, dashboard está roto
**Respuesta:**

```typescript
{
  clase_inminente: ClaseInminente | null,
  alertas: Alerta[],
  stats_resumen: StatsResumen,
  clases_hoy: ClaseResumen[]
}
```

#### 2. **`GET /api/grupos/:id/estudiantes/contexto`** 🔥 CRÍTICO

**Justificación:** Vista grupo sin este endpoint es solo decorativa
**Respuesta:** Array de `EstudianteContexto` (definido arriba)

#### 3. **`GET /api/clases/:id/materiales`** 🟡 IMPORTANTE

**Justificación:** Docente necesita acceso rápido a materiales
**Respuesta:**

```typescript
{
  materiales_clase: Material[],
  materiales_sugeridos: Material[],  // De clases similares
  templates: Template[]
}
```

#### 4. **`POST /api/asistencia/batch`** 🟡 IMPORTANTE

**Justificación:** Tomar asistencia estudiante por estudiante es lento
**Request:**

```typescript
{
  clase_id: string,
  asistencias: Array<{
    estudiante_id: string,
    estado: EstadoAsistencia,
    observacion?: string
  }>
}
```

#### 5. **`GET /api/docentes/me/estadisticas/semanal`** 🟢 NICE-TO-HAVE

**Justificación:** Para reportes tab
**Respuesta:** Trends semanales/mensuales

---

## 🎨 Principios de Diseño Recomendados

### 1. **Progressive Disclosure**

No mostrar todo a la vez. Ejemplo:

```
┌─────────────────────────────────────┐
│ Juan Pérez          [▼]            │  <-- Colapsado por defecto
├─────────────────────────────────────┤
│ Asistencia: 85%  Participación: 78%│
└─────────────────────────────────────┘

Al expandir [▼]:
┌─────────────────────────────────────┐
│ Juan Pérez          [▲]            │
├─────────────────────────────────────┤
│ Asistencia: 85% (↓ -5%)            │
│ Participación: 78%                  │
│ Última clase: 25 Oct                │
│ Observaciones: 3 → [Ver todas]     │
│ [Escribir observación]              │
└─────────────────────────────────────┘
```

### 2. **Action-Oriented UI**

Cada pantalla debe tener CTA claro. Ejemplo:

**❌ Mal:**

```
Dashboard
  Clase inminente: Álgebra Básica en 15 min
```

**✅ Bien:**

```
Dashboard
  🔥 Clase inminente: Álgebra Básica en 15 min
  [Iniciar Clase Ahora] [Ver Materiales] [Lista de Estudiantes]
```

### 3. **Cognitive Load Reduction**

Docente está ocupado - reducir decisiones.

**Ejemplo:** Observaciones

```
❌ Mal: Textarea vacío - docente debe pensar qué escribir

✅ Bien:
  Quick templates:
  □ Excelente participación hoy
  □ Necesita refuerzo en [tema]
  □ Faltó a la clase
  □ Personalizado: [textarea]
```

### 4. **Consistent Visual Language**

```
🔴 Rojo = Requiere atención URGENTE (>3 faltas)
🟡 Amarillo = Monitorear (asistencia <80%)
🟢 Verde = Todo bien (asistencia >90%)
```

---

## 📊 Priorización de Cambios

### 🔥 CRÍTICO (Implementar primero - Portal NO funciona sin esto)

1. **Implementar** `GET /api/docentes/me/dashboard`
2. **Implementar** `GET /api/grupos/:id/estudiantes/contexto`
3. **Eliminar** todos los datos mock y conectar con APIs reales
4. **Mejorar** vista de asistencia (bulk actions, contexto estudiante)

### 🟡 IMPORTANTE (Implementar segundo - Mejora significativa UX)

1. **Implementar** `POST /api/asistencia/batch`
2. **Reorganizar** navegación (dashboard como hub central)
3. **Integrar** planificador en flujo de clases
4. **Agregar** templates de observaciones

### 🟢 NICE-TO-HAVE (Implementar tercero - Polish)

1. **Implementar** `GET /api/clases/:id/materiales`
2. **Agregar** estadísticas semanales
3. **Mejorar** animaciones y transitions
4. **Implementar** keyboard shortcuts

---

## 🚀 Roadmap Sugerido

### Sprint 1 (1-2 semanas): Funcionalidad Core

- [ ] Backend: Implementar endpoints dashboard + grupo contexto
- [ ] Frontend: Conectar dashboard y grupos con APIs reales
- [ ] Testing: Probar con docente real (no mock)

### Sprint 2 (1 semana): Asistencia Workflow

- [ ] Backend: Endpoint batch asistencia
- [ ] Frontend: Rediseñar UI de asistencia (bulk actions)
- [ ] UX: Agregar alertas visuales de estudiantes en riesgo

### Sprint 3 (1 semana): Observaciones & Integration

- [ ] Frontend: Templates de observaciones
- [ ] Backend: Auto-notificación a tutores
- [ ] UX: Integrar planificador en flujo de clases

### Sprint 4 (1 semana): Polish & Optimization

- [ ] Performance: Lazy loading, code splitting
- [ ] UX: Keyboard shortcuts, quick actions
- [ ] Analytics: Tracking de uso real

---

## 📝 Conclusiones

### ✅ Lo que está bien:

- Arquitectura backend sólida (NestJS + Prisma)
- Diseño visual moderno y consistente
- Estructura de rutas clara

### ❌ Lo que debe cambiar:

- **Eliminar** datos mock completamente
- **Implementar** endpoints dashboard críticos
- **Reducir** cognitive load (menos clicks, más contexto)
- **Priorizar** información accionable sobre decorativa

### 🎯 Objetivo Final:

**Un docente debe poder:**

1. Entrar al portal
2. Ver su próxima clase en <2 segundos
3. Iniciar clase en <3 clicks
4. Tomar asistencia completa en <1 minuto
5. Escribir observación en <30 segundos

**Actualmente:** Ninguno de estos benchmarks se cumple por falta de endpoints.

---

## 📎 Anexo: Quick Wins (cambios <1 día)

1. **Eliminar** sección "Puntos Totales" de vista grupo → No aporta valor al docente
2. **Cambiar** "Mis Clases" para mostrar primero las de HOY → Reduce scrolling
3. **Agregar** estado empty en dashboard: "No tienes clases programadas hoy" vs pantalla en blanco
4. **Mover** botón "Iniciar Clase" a dashboard (si hay clase inminente) → Reduce clicks
5. **Eliminar** notificaciones hardcodeadas (count=3) → Confunde

---

**🎨 Fin de Auditoría UX/UI**
**Próximo paso recomendado:** Implementar endpoints dashboard críticos antes de cualquier mejora visual
