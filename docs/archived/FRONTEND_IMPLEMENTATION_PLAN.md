# Plan de Implementación Frontend - Mateatletas
## Desarrollo por Fases con Design System Crash Bandicoot

---

## 📋 Índice

1. [Contexto y Design System](#contexto-y-design-system)
2. [Fase 1: Flujo Tutor Completo](#fase-1-flujo-tutor-completo-4-5-días)
3. [Fase 2: Panel Docente](#fase-2-panel-docente-3-4-días)
4. [Fase 3: Panel Administrativo](#fase-3-panel-administrativo-4-5-días)
5. [Fase 4: Gamificación y Portal Estudiante](#fase-4-gamificación-y-portal-estudiante-2-3-días)
6. [Fase 5: Polish, Testing y Optimización](#fase-5-polish-testing-y-optimización-2-3-días)
7. [Checklist de Componentes UI](#checklist-de-componentes-ui)
8. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🎨 Contexto y Design System

### Design System Existente: "Crash Bandicoot Style"

**Filosofía**: Diseño chunky, vibrante y energético inspirado en Crash Bandicoot (PS1, 1998)

#### Colores Principales (ya definidos en globals.css)

```css
--color-primary: #ff6b35;       /* Naranja vibrante - CTAs principales */
--color-secondary: #f7b801;     /* Amarillo dorado - Acentos, puntos */
--color-accent: #00d9ff;        /* Cyan brillante - Elementos especiales */
--color-success: #4caf50;       /* Verde éxito */
--color-danger: #f44336;        /* Rojo peligro */
--color-dark: #2a1a5e;          /* Morado oscuro - Texto */
--color-light: #fff9e6;         /* Beige claro - Fondos */
```

#### Tipografía

- **Títulos**: Lilita One (chunky, divertida)
- **Texto**: Fredoka (redondeada, legible)

#### Sombras Chunky (sin blur)

```css
--shadow-chunky-sm: 3px 3px 0px rgba(0,0,0,1);
--shadow-chunky-md: 5px 5px 0px rgba(0,0,0,1);
--shadow-chunky-lg: 8px 8px 0px rgba(0,0,0,1);
```

#### Componentes UI Ya Implementados ✅

- Button (4 variantes: primary, secondary, outline, ghost)
- Card (con title, footer)
- Input (text, email, password)
- Modal/Dialog
- Avatar
- Badge
- Select

---

## 🚀 FASE 1: Flujo Tutor Completo (4-5 días)

**Objetivo**: Permitir a los tutores navegar el catálogo, comprar productos y reservar clases.

### 📦 Módulo 1.1: Catálogo de Productos (Día 1)

#### Página: `/catalogo` - Vista Grid de Productos

**Componentes a Crear:**

1. **ProductCard** - Tarjeta de producto individual
   ```tsx
   // Estructura:
   - Imagen del producto (placeholder colorido)
   - Badge tipo (Suscripción/Curso/Recurso)
   - Título del producto
   - Descripción corta
   - Precio con badge destacado
   - Botón "Ver detalles" / "Comprar"

   // Design:
   - Card con shadow-chunky-md
   - Border 3px negro sólido
   - Hover: scale(1.05) + shadow-chunky-lg
   - Badge con colores vibrantes según tipo:
     * Suscripción: bg-accent (cyan)
     * Curso: bg-primary (naranja)
     * Recurso: bg-secondary (amarillo)
   ```

2. **ProductFilter** - Barra de filtros
   ```tsx
   // Filtros disponibles:
   - Todos
   - Suscripciones
   - Cursos
   - Recursos

   // Design:
   - Botones pill estilo chunky
   - Activo: bg-primary con shadow-chunky-sm
   - Inactivo: bg-white con border
   - Font: Fredoka Bold
   ```

3. **ProductModal** - Modal de detalle de producto
   ```tsx
   // Contenido:
   - Imagen grande
   - Descripción completa
   - Beneficios (lista con checkmarks)
   - Precio destacado
   - Botón CTA grande "Comprar ahora"

   // Design:
   - Modal con border chunky 4px
   - Shadow-chunky-lg
   - Close button estilo X circular
   - CTA button: variant="primary" size="lg"
   ```

**Store: `catalogo.store.ts`**
```typescript
interface CatalogoStore {
  productos: Producto[];
  filtroActivo: 'todos' | 'suscripcion' | 'curso' | 'recurso';
  isLoading: boolean;

  // Actions
  fetchProductos: () => Promise<void>;
  setFiltro: (filtro: string) => void;
  getProductosFiltrados: () => Producto[];
}
```

**API Client: `catalogo.api.ts`**
```typescript
// GET /api/productos
export const getProductos = () => axios.get('/productos');

// GET /api/productos/:id
export const getProductoPorId = (id: string) =>
  axios.get(`/productos/${id}`);

// Filtros
export const getCursos = () => axios.get('/productos/cursos');
export const getSuscripciones = () =>
  axios.get('/productos/suscripciones');
```

**Layout:**
```tsx
// Grid responsive:
- Mobile: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

// Header de página:
<h1 className="font-lilita text-5xl text-dark">
  🎓 Catálogo de Productos
</h1>
```

---

### 💳 Módulo 1.2: Proceso de Pago (Días 2-3)

#### Página 1: `/membresia/planes` - Planes de Suscripción

**Componentes a Crear:**

1. **PricingCard** - Tarjeta de plan de suscripción
   ```tsx
   // Estructura:
   - Badge "Popular" (condicional)
   - Nombre del plan (H2 con Lilita)
   - Precio grande con tachado (descuento)
   - Lista de beneficios (con íconos)
   - Botón "Suscribirme"

   // Design:
   - 3 tamaños: Básico, Estándar, Premium
   - Premium: Escalado 1.1x + border-primary + shadow-chunky-lg
   - Colores alternados: cyan/naranja/amarillo
   - Spacing generoso (p-8)
   ```

2. **ComparisonTable** - Tabla de comparación de planes
   ```tsx
   // Features:
   - Tabla responsive (colapsa en mobile)
   - Checkmarks coloridos para features incluidas
   - X rojo para no incluidas
   - Sticky header en scroll

   // Design:
   - Borders chunky entre celdas
   - Header con bg-gradient naranja-amarillo
   - Row hover: bg-light
   ```

**Flujo de Compra:**
```
1. Usuario selecciona plan
2. Modal de confirmación
3. Redirect a MercadoPago (usando URL de preferencia)
4. Callback a /membresia/confirmacion?payment_id=XXX
5. Actualizar estado de membresía
```

#### Página 2: `/cursos/[id]/inscribir` - Inscripción a Curso

**Componentes:**

1. **CourseDetail** - Detalle completo del curso
   ```tsx
   // Incluye:
   - Hero section con imagen
   - Descripción del curso
   - Objetivos de aprendizaje
   - Instructor (si aplica)
   - Precio y duración
   ```

2. **EnrollmentForm** - Form de inscripción
   ```tsx
   // Campos:
   - Seleccionar estudiante (dropdown)
   - Confirmar precio
   - Términos y condiciones (checkbox)
   - Botón "Proceder al pago"

   // Validación:
   - Verificar que estudiante no esté ya inscrito
   - Validar membresía activa (si es requerida)
   ```

#### Página 3: `/membresia/confirmacion` - Post-Pago

**Componentes:**

1. **PaymentSuccess** - Confirmación exitosa
   ```tsx
   // Elementos:
   - Checkmark animado grande (verde)
   - Mensaje "¡Pago exitoso!"
   - Detalles de la transacción
   - Botón "Ir al dashboard"

   // Animación:
   - Checkmark con scale bounce
   - Confetti particles (opcional)
   ```

2. **PaymentPending** - Pago pendiente
   ```tsx
   // Mensaje:
   - Ícono de reloj
   - "Tu pago está siendo procesado"
   - Instrucciones de qué hacer
   ```

**Store: `pagos.store.ts`**
```typescript
interface PagosStore {
  membresiaActual: Membresia | null;
  historialPagos: Pago[];
  isLoading: boolean;

  // Actions
  fetchMembresia: () => Promise<void>;
  crearPreferenciaSuscripcion: (productoId: string) =>
    Promise<{ init_point: string }>;
  crearPreferenciaCurso: (productoId: string, estudianteId: string) =>
    Promise<{ init_point: string }>;
  activarMembresiaManual: (id: string) => Promise<void>; // Mock
}
```

**API Client: `pagos.api.ts`**
```typescript
// POST /api/pagos/suscripcion
export const crearPreferenciaSuscripcion = (productoId: string) =>
  axios.post('/pagos/suscripcion', { producto_id: productoId });

// POST /api/pagos/curso
export const crearPreferenciaCurso = (data: {
  producto_id: string;
  estudiante_id: string;
}) => axios.post('/pagos/curso', data);

// GET /api/pagos/membresia
export const getMembresiaActual = () =>
  axios.get('/pagos/membresia');

// GET /api/pagos/inscripciones
export const getInscripciones = () =>
  axios.get('/pagos/inscripciones');
```

---

### 📅 Módulo 1.3: Clases y Reservas (Días 4-5)

#### Página 1: `/clases` - Calendario de Clases Disponibles

**Componentes a Crear:**

1. **ClassCalendar** - Calendario visual de clases
   ```tsx
   // Tipo de vista:
   - Semanal (default)
   - Mensual (opcional)

   // Elementos:
   - Grid de días de la semana
   - Slots de tiempo (horarios)
   - Cards de clase clickeables

   // Design:
   - Card por clase con color de ruta curricular
   - Badge con cupos disponibles
   - Hover: elevación + cursor pointer
   ```

2. **ClassCard** - Tarjeta de clase individual
   ```tsx
   // Info mostrada:
   - Ruta curricular (con color badge)
   - Fecha y hora
   - Docente (nombre + avatar)
   - Cupos disponibles / total
   - Botón "Reservar"

   // Design:
   - Border-left grueso con color de ruta
   - Shadow-chunky-sm
   - Icono de reloj + calendario
   ```

3. **RutaFilter** - Filtro por ruta curricular
   ```tsx
   // Rutas (con colores del backend):
   - Lógica (#8B5CF6)
   - Álgebra (#3B82F6)
   - Geometría (#10B981)
   - Aritmética (#F59E0B)
   - Estadística (#EF4444)
   - Cálculo (#6366F1)

   // Design:
   - Pills coloridos con badge de color de ruta
   - Activo: opacidad 100% + shadow
   - Inactivo: opacidad 60%
   ```

4. **ClassReservationModal** - Modal de reserva
   ```tsx
   // Pasos:
   1. Seleccionar estudiante (de los hijos del tutor)
   2. Confirmar detalles de la clase
   3. Verificar membresía activa
   4. Confirmar reserva

   // Design:
   - Stepper visual (opcional)
   - Select de estudiantes con avatares
   - Botón grande "Confirmar reserva"
   ```

#### Página 2: `/mis-clases` - Clases Reservadas del Tutor

**Componentes:**

1. **MyClassesList** - Lista de clases reservadas
   ```tsx
   // Agrupación:
   - Próximas clases (orden cronológico)
   - Clases pasadas (historial)

   // Info por clase:
   - Fecha/hora
   - Estudiante asignado
   - Ruta curricular
   - Estado (Programada/Completada/Cancelada)
   - Botón "Cancelar" (si es próxima)
   ```

2. **ClassDetailCard** - Expandible con más info
   ```tsx
   // Info adicional:
   - Descripción de la clase
   - Docente con contacto
   - Link de videoconferencia (si aplica)
   - Asistencia registrada (si está completada)
   ```

**Store: `clases.store.ts`**
```typescript
interface ClasesStore {
  clasesDisponibles: Clase[];
  misReservas: InscripcionClase[];
  filtroRuta: string | null;
  isLoading: boolean;

  // Actions
  fetchClasesDisponibles: (filtros?: {
    rutaId?: string;
    fecha?: Date;
  }) => Promise<void>;

  fetchMisReservas: () => Promise<void>;

  reservarClase: (claseId: string, estudianteId: string) =>
    Promise<void>;

  cancelarReserva: (inscripcionId: string) => Promise<void>;

  setFiltroRuta: (rutaId: string | null) => void;
}
```

**API Client: `clases.api.ts`**
```typescript
// GET /api/clases
export const getClasesDisponibles = (params?: {
  rutaId?: string;
  fecha?: string;
}) => axios.get('/clases', { params });

// POST /api/clases/:id/reservar
export const reservarClase = (
  claseId: string,
  estudianteId: string
) => axios.post(`/clases/${claseId}/reservar`, { estudiante_id: estudianteId });

// DELETE /api/clases/reservas/:id
export const cancelarReserva = (inscripcionId: string) =>
  axios.delete(`/clases/reservas/${inscripcionId}`);

// GET /api/clases/metadata/rutas-curriculares
export const getRutasCurriculares = () =>
  axios.get('/clases/metadata/rutas-curriculares');
```

**Layout de Página:**
```tsx
<div className="space-y-6">
  {/* Header con filtros */}
  <div className="flex justify-between items-center">
    <h1 className="font-lilita text-4xl text-dark">
      📚 Clases Disponibles
    </h1>
    <RutaFilter />
  </div>

  {/* Calendario o Grid */}
  <ClassCalendar clases={clasesDisponibles} />
</div>
```

---

## 👨‍🏫 FASE 2: Panel Docente (3-4 días)

**Objetivo**: Dashboard y herramientas para docentes gestionar clases y asistencia.

### 🎯 Módulo 2.1: Dashboard Docente (Día 1)

#### Layout: `/docente/layout.tsx`

**Componentes:**

1. **DocenteSidebar** - Navegación lateral
   ```tsx
   // Items del menú:
   - Dashboard (icono: 📊)
   - Mis Clases (icono: 📅)
   - Asistencia (icono: ✅)
   - Perfil (icono: 👤)

   // Design:
   - Sidebar fijo con bg-dark (morado)
   - Items con hover: bg-primary/20
   - Item activo: bg-primary + text-white
   - Logo en top
   ```

2. **DocenteHeader** - Header específico
   ```tsx
   // Elementos:
   - Título de página dinámico
   - Notificaciones (badge con contador)
   - Avatar + nombre del docente
   - Botón logout

   // Design:
   - bg-white con border-bottom chunky
   - Shadow-chunky-sm
   ```

#### Página: `/docente/dashboard`

**Componentes:**

1. **TeacherStatsCards** - Cards de estadísticas
   ```tsx
   // Métricas:
   - Clases esta semana
   - Estudiantes totales
   - Asistencia promedio (%)
   - Próxima clase

   // Design:
   - Grid 2x2
   - Cada card con ícono grande
   - Colores alternados (cyan/naranja/verde/amarillo)
   ```

2. **UpcomingClassesList** - Próximas clases
   ```tsx
   // Info:
   - Lista de próximas 5 clases
   - Fecha/hora
   - Ruta curricular
   - Estudiantes inscritos
   - Botón rápido "Tomar asistencia"

   // Design:
   - Cards compactos
   - Orden cronológico
   - Badge con tiempo restante (ej: "En 2 horas")
   ```

---

### 📋 Módulo 2.2: Gestión de Clases (Día 2)

#### Página: `/docente/mis-clases`

**Componentes:**

1. **TeacherClassList** - Lista de clases del docente
   ```tsx
   // Tabs:
   - Próximas
   - En progreso
   - Completadas
   - Canceladas

   // Por clase:
   - Detalle completo
   - Lista de inscritos
   - Estado de asistencia
   - Botones de acción
   ```

2. **ClassStudentsList** - Lista de estudiantes inscritos
   ```tsx
   // Info por estudiante:
   - Avatar
   - Nombre
   - Edad/Grado
   - Estado de inscripción
   - Historial de asistencia (icono)

   // Design:
   - Table responsive
   - Avatares circulares con border
   ```

3. **CancelClassModal** - Cancelar clase
   ```tsx
   // Pasos:
   - Motivo de cancelación (textarea)
   - Confirmar acción
   - Notificar a estudiantes (checkbox)

   // Design:
   - Modal de confirmación rojo (danger)
   - Botón "Sí, cancelar" prominente
   ```

---

### ✅ Módulo 2.3: Registro de Asistencia (Días 3-4)

#### Página: `/docente/clases/[id]/asistencia`

**Componentes Principales:**

1. **AttendanceGrid** - Grid de asistencia
   ```tsx
   // Estructura:
   - Fila por cada estudiante inscrito
   - Columnas: Avatar, Nombre, Estado, Puntos, Observaciones

   // Estados de asistencia:
   - Presente (✅ verde)
   - Ausente (❌ rojo)
   - Justificado (📝 amarillo)

   // Interacción:
   - Click en estado para cambiar
   - Input de puntos (0-10)
   - Textarea de observaciones (expandible)

   // Design:
   - Table con borders chunky
   - Row hover: bg-light
   - Estados con badges coloridos grandes
   ```

2. **AttendanceQuickActions** - Acciones rápidas
   ```tsx
   // Botones:
   - "Marcar todos presentes"
   - "Marcar todos ausentes"
   - "Asignar puntos por defecto"

   // Design:
   - Botones pequeños en toolbar
   - Iconos descriptivos
   ```

3. **AttendanceStateSwitcher** - Selector de estado
   ```tsx
   // Componente:
   - 3 botones circulares grandes
   - Presente / Ausente / Justificado
   - Visual chunky con iconos

   // Design:
   - Activo: Scaled + shadow-chunky-md
   - Colores: verde / rojo / amarillo
   - Size: w-16 h-16
   ```

4. **PointsInput** - Input de puntos
   ```tsx
   // Características:
   - Input numérico (0-10)
   - Botones +/- para incrementar
   - Preset rápido (0, 5, 10)

   // Validación:
   - Min: 0, Max: 10
   - Solo números enteros
   ```

5. **ObservationsTextarea** - Observaciones
   ```tsx
   // Features:
   - Textarea expandible
   - Placeholder: "Observaciones sobre la clase..."
   - Max length: 500 caracteres
   - Counter de caracteres

   // Design:
   - Border chunky al focus
   - Resize vertical only
   ```

6. **AttendanceSummary** - Resumen de asistencia
   ```tsx
   // Métricas:
   - Total estudiantes
   - Presentes / Ausentes / Justificados
   - Porcentaje de asistencia
   - Puntos promedio otorgados

   // Design:
   - Card sticky en sidebar
   - Gráfico circular de asistencia
   - Colores según estado
   ```

**Store: `asistencia.store.ts`**
```typescript
interface AsistenciaStore {
  claseActual: Clase | null;
  registros: RegistroAsistencia[];
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  fetchClaseConInscritos: (claseId: string) => Promise<void>;

  marcarAsistencia: (data: {
    inscripcionClaseId: string;
    estado: 'Presente' | 'Ausente' | 'Justificado';
    puntosOtorgados: number;
    observaciones?: string;
  }) => Promise<void>;

  marcarTodosPresentes: () => Promise<void>;

  obtenerHistorialEstudiante: (estudianteId: string) =>
    Promise<HistorialAsistencia>;
}
```

**API Client: `asistencia.api.ts`**
```typescript
// POST /api/asistencia
export const marcarAsistencia = (data: {
  inscripcion_clase_id: string;
  estado: EstadoAsistencia;
  puntos_otorgados: number;
  observaciones?: string;
}) => axios.post('/asistencia', data);

// GET /api/asistencia/clase/:id
export const getAsistenciaClase = (claseId: string) =>
  axios.get(`/asistencia/clase/${claseId}`);

// GET /api/asistencia/estudiante/:id
export const getHistorialEstudiante = (estudianteId: string) =>
  axios.get(`/asistencia/estudiante/${estudianteId}`);

// GET /api/asistencia/docente/resumen
export const getResumenDocente = () =>
  axios.get('/asistencia/docente/resumen');
```

**Layout Completo:**
```tsx
<div className="grid grid-cols-12 gap-6">
  {/* Main content - 9 cols */}
  <div className="col-span-12 lg:col-span-9">
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-lilita text-2xl text-dark">
            Registro de Asistencia
          </h2>
          <p className="text-gray-600">
            {clase.ruta_curricular.nombre} - {formatDate(clase.fecha)}
          </p>
        </div>
        <AttendanceQuickActions />
      </div>

      <AttendanceGrid registros={registros} />

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          💾 Guardar Asistencia
        </Button>
      </div>
    </Card>
  </div>

  {/* Sidebar - 3 cols */}
  <div className="col-span-12 lg:col-span-3">
    <AttendanceSummary registros={registros} />
  </div>
</div>
```

---

## 👑 FASE 3: Panel Administrativo (4-5 días)

**Objetivo**: Dashboard completo para administradores con todas las funcionalidades.

### 📊 Módulo 3.1: Dashboard Admin (Día 1)

#### Layout: `/admin/layout.tsx`

**Componentes:**

1. **AdminSidebar** - Navegación completa
   ```tsx
   // Secciones del menú:

   📊 Dashboard

   👥 Usuarios
   - Tutores
   - Docentes
   - Estudiantes

   📚 Contenido
   - Productos
   - Rutas Curriculares
   - Clases

   📈 Reportes
   - Asistencia
   - Pagos
   - Analytics

   ⚙️ Configuración

   // Design:
   - Sidebar colapsable
   - Grupos con titles
   - Iconos Lucide React
   - bg-dark con text-white
   ```

2. **AdminHeader** - Header con breadcrumbs
   ```tsx
   // Elementos:
   - Breadcrumbs de navegación
   - Search bar global
   - Notificaciones con badge
   - Avatar + dropdown de admin

   // Design:
   - Sticky top
   - bg-white con shadow-chunky-sm
   ```

#### Página: `/admin/dashboard`

**Componentes:**

1. **AdminMetricsGrid** - Métricas principales
   ```tsx
   // KPIs:
   - Total usuarios (tutores + estudiantes + docentes)
   - Clases esta semana
   - Ingresos del mes
   - Tasa de asistencia promedio
   - Membresías activas
   - Cursos vendidos

   // Design:
   - Grid 3x2
   - Cards grandes con iconos
   - Tendencia (↑↓) en esquina
   - Colores variados por métrica
   ```

2. **AlertasCopilot** - Panel de alertas (Admin Copilot)
   ```tsx
   // Tipos de alerta:
   - Estudiantes con baja asistencia
   - Clases con baja inscripción
   - Pagos pendientes
   - Docentes inactivos

   // Features:
   - Lista priorizada (urgente primero)
   - Badge de prioridad (Alta/Media/Baja)
   - Botón "Ver sugerencia" (IA)
   - Botón "Marcar como resuelta"

   // Design:
   - Card con border-left según prioridad
   - Iconos descriptivos
   - Hover: elevación
   ```

3. **RecentActivityFeed** - Feed de actividad reciente
   ```tsx
   // Eventos:
   - Nuevos registros
   - Clases creadas
   - Pagos completados
   - Asistencias registradas

   // Design:
   - Timeline vertical
   - Iconos por tipo de evento
   - Timestamp relativo
   - Avatar de usuario (si aplica)
   ```

**Store: `admin.store.ts`**
```typescript
interface AdminStore {
  dashboard: {
    stats: DashboardStats;
    alertas: Alerta[];
    actividadReciente: Actividad[];
  };
  isLoading: boolean;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchAlertas: () => Promise<void>;
  resolverAlerta: (id: string) => Promise<void>;
  getSugerenciaAlerta: (id: string) => Promise<string>;
}
```

**API Client: `admin.api.ts`**
```typescript
// GET /api/admin/dashboard
export const getDashboardStats = () =>
  axios.get('/admin/dashboard');

// GET /api/admin/alertas
export const getAlertas = () =>
  axios.get('/admin/alertas');

// PATCH /api/admin/alertas/:id/resolver
export const resolverAlerta = (id: string) =>
  axios.patch(`/admin/alertas/${id}/resolver`);

// GET /api/admin/alertas/:id/sugerencia
export const getSugerencia = (id: string) =>
  axios.get(`/admin/alertas/${id}/sugerencia`);
```

---

### 👥 Módulo 3.2: Gestión de Usuarios (Día 2)

#### Páginas: `/admin/tutores`, `/admin/docentes`, `/admin/estudiantes`

**Componentes Comunes:**

1. **UsersTable** - Tabla maestra de usuarios
   ```tsx
   // Columnas:
   - Avatar
   - Nombre completo
   - Email
   - Rol
   - Fecha registro
   - Estado (Activo/Inactivo)
   - Acciones

   // Features:
   - Sorting por columna
   - Búsqueda
   - Filtros (Estado, Rol)
   - Paginación

   // Design:
   - Table responsive
   - Borders chunky
   - Row hover: bg-light
   - Actions: botones pequeños (Editar/Eliminar)
   ```

2. **UserFormModal** - Crear/Editar usuario
   ```tsx
   // Campos comunes:
   - Nombre
   - Apellido
   - Email
   - Teléfono (opcional)
   - Rol (dropdown)

   // Validación:
   - Email único
   - Campos requeridos
   - Format email

   // Design:
   - Modal grande
   - Form con Grid 2 columnas
   - Botones: Cancelar / Guardar
   ```

3. **UserDetailPanel** - Panel lateral con detalles
   ```tsx
   // Info mostrada:
   - Datos personales
   - Actividad reciente
   - Estadísticas (según rol)
   - Acciones rápidas

   // Design:
   - Drawer que se desliza desde derecha
   - Sticky en scroll
   - Tabs para organizar info
   ```

**Específico para Estudiantes:**

4. **StudentMetrics** - Métricas de estudiante
   ```tsx
   // Datos:
   - Clases asistidas
   - Porcentaje asistencia
   - Puntos totales
   - Equipo actual
   - Tutor asignado

   // Design:
   - Cards pequeños en grid
   - Gráfico de barras de asistencia
   ```

---

### 📚 Módulo 3.3: Gestión de Contenido (Días 3-4)

#### Página 1: `/admin/productos` - CRUD de Productos

**Componentes:**

1. **ProductsManagementTable** - Tabla de productos
   ```tsx
   // Columnas:
   - Nombre
   - Tipo (Badge)
   - Precio
   - Estado (Activo/Inactivo)
   - Creado
   - Acciones

   // Features:
   - Filtro por tipo
   - Toggle activo/inactivo inline
   - Edición rápida de precio
   ```

2. **ProductFormModal** - Crear/Editar producto
   ```tsx
   // Campos:
   - Nombre
   - Descripción
   - Tipo (Select: Suscripción/Curso/Recurso)
   - Precio
   - Duración (solo para suscripciones)
   - Estado

   // Design:
   - Form largo con secciones
   - Preview del producto
   ```

#### Página 2: `/admin/rutas` - CRUD de Rutas Curriculares

**Componentes:**

1. **RutasGrid** - Grid de rutas curriculares
   ```tsx
   // Por ruta:
   - Nombre
   - Color (badge circular grande)
   - Descripción
   - Número de clases asociadas
   - Botones: Editar / Eliminar

   // Design:
   - Grid 2x3
   - Cards con border del color de la ruta
   - Hover: elevación
   ```

2. **RutaFormModal** - Crear/Editar ruta
   ```tsx
   // Campos:
   - Nombre
   - Color (color picker)
   - Descripción

   // Validación:
   - Nombre único
   - No eliminar si tiene clases asociadas

   // Design:
   - Color picker con preview
   - Ejemplo de badge con color seleccionado
   ```

#### Página 3: `/admin/clases` - Gestión de Clases

**Componentes:**

1. **ClassManagementCalendar** - Calendario admin
   ```tsx
   // Features:
   - Vista semanal/mensual
   - Drag & drop para reprogramar (opcional)
   - Filtros por docente/ruta
   - Click para editar

   // Design:
   - Calendario grande full-width
   - Color-coded por ruta
   - Badge con estado de clase
   ```

2. **CreateClassModal** - Crear nueva clase
   ```tsx
   // Campos:
   - Ruta curricular (select)
   - Docente (select)
   - Fecha y hora
   - Duración (minutos)
   - Cupos máximo
   - Producto requerido (opcional)

   // Validación:
   - No conflictos de horario del docente
   - Fecha futura
   ```

3. **ClassDetailPanel** - Detalle de clase
   ```tsx
   // Info:
   - Detalles completos
   - Lista de inscritos
   - Asistencia (si ya pasó)
   - Botones: Editar / Cancelar / Ver asistencia
   ```

---

### 📈 Módulo 3.4: Reportes y Analytics (Día 5)

#### Página: `/admin/reportes`

**Componentes:**

1. **ReportsTabs** - Tabs de tipos de reporte
   ```tsx
   // Tabs:
   - Asistencia
   - Pagos
   - Usuarios
   - Clases

   // Design:
   - Tabs horizontales chunky
   - Activo: bg-primary + shadow
   ```

2. **AttendanceReport** - Reporte de asistencia
   ```tsx
   // Métricas:
   - Asistencia global (%)
   - Por ruta curricular
   - Top estudiantes con mejor asistencia
   - Alertas de baja asistencia

   // Visualización:
   - Gráfico de barras por ruta
   - Tabla de estudiantes
   - Filtros por fecha
   ```

3. **PaymentReport** - Reporte de pagos
   ```tsx
   // Métricas:
   - Ingresos totales
   - Por tipo de producto
   - Membresías activas vs inactivas
   - Cursos más vendidos

   // Visualización:
   - Gráfico de líneas (ingresos por mes)
   - Pie chart (distribución por producto)
   - Tabla de transacciones recientes
   ```

4. **ExportButton** - Exportar reportes
   ```tsx
   // Formatos:
   - CSV
   - PDF (opcional)

   // Design:
   - Dropdown button
   - Iconos por formato
   ```

---

## 🎮 FASE 4: Gamificación y Portal Estudiante (2-3 días)

**Objetivo**: Vista para estudiantes con progreso, logros y gamificación.

### 🎯 Módulo 4.1: Portal Estudiante (Día 1)

#### Layout: `/estudiante/layout.tsx`

**Componentes:**

1. **StudentSidebar** - Navegación estudiante
   ```tsx
   // Items:
   - Mi Dashboard (🏠)
   - Mi Progreso (📈)
   - Mi Equipo (🏆)
   - Mis Clases (📅)
   - Mis Logros (🏅)

   // Design:
   - Sidebar colorido
   - Iconos grandes
   - bg-gradient from-primary to-secondary
   ```

2. **StudentHeader** - Header gamificado
   ```tsx
   // Elementos:
   - Puntos totales (badge grande)
   - Nivel actual (ej: "Nivel 5")
   - Barra de progreso a siguiente nivel
   - Avatar del estudiante

   // Design:
   - bg-gradient naranja-amarillo
   - Elementos brillantes con shadow
   ```

#### Página: `/estudiante/dashboard`

**Componentes:**

1. **StudentWelcomeCard** - Bienvenida personalizada
   ```tsx
   // Contenido:
   - "¡Hola, {nombre}!"
   - Frase motivacional del día
   - Streak de días consecutivos
   - Imagen/ilustración divertida

   // Design:
   - Card grande con bg-gradient
   - Ilustración estilo cartoon
   ```

2. **StudentProgressCards** - Cards de progreso
   ```tsx
   // Métricas:
   - Clases completadas
   - Asistencia (%)
   - Puntos esta semana
   - Próxima clase

   // Design:
   - Grid 2x2
   - Iconos grandes
   - Números destacados
   - Colores vibrantes
   ```

3. **NextClassCard** - Próxima clase
   ```tsx
   // Info:
   - Ruta curricular con color
   - Fecha y hora
   - Tiempo restante (countdown)
   - Botón "Ver detalles"

   // Design:
   - Card destacado
   - Badge de color de ruta
   - Timer animado
   ```

---

### 🏆 Módulo 4.2: Logros y Puntos (Días 2-3)

#### Página 1: `/estudiante/logros` - Badges y Logros

**Componentes:**

1. **AchievementsGrid** - Grid de logros
   ```tsx
   // Tipos de logros:
   - Asistencia (racha de días)
   - Puntos acumulados
   - Clases completadas
   - Retos especiales

   // Estados:
   - Desbloqueado (color + animación)
   - Bloqueado (grayscale + candado)
   - En progreso (barra de progreso)

   // Design:
   - Grid responsive
   - Badges circulares grandes
   - Hover: scale + shine effect
   - Tooltip con descripción
   ```

2. **AchievementCard** - Detalle de logro
   ```tsx
   // Info:
   - Ícono del logro (emoji grande)
   - Nombre del logro
   - Descripción
   - Progreso (si aplica)
   - Recompensa (puntos)

   // Design:
   - Modal o card expandible
   - Animación de confetti al desbloquear
   ```

3. **PointsHistory** - Historial de puntos
   ```tsx
   // Lista:
   - Fecha
   - Acción (ej: "Asistencia a clase")
   - Puntos ganados/perdidos
   - Balance actual

   // Design:
   - Timeline vertical
   - Iconos por tipo de acción
   - Colores: verde (+), rojo (-)
   ```

#### Página 2: `/estudiante/equipo` - Vista de Equipo

**Componentes:**

1. **TeamCard** - Card de equipo
   ```tsx
   // Info:
   - Nombre del equipo
   - Logo/color del equipo
   - Puntos totales
   - Ranking actual
   - Miembros del equipo

   // Design:
   - Card grande destacado
   - bg-gradient con colores del equipo
   - Shadow-chunky-lg
   ```

2. **TeamRanking** - Ranking de equipos
   ```tsx
   // Elementos:
   - Lista de todos los equipos
   - Posición
   - Puntos
   - Diferencia con el anterior

   // Design:
   - Top 3 con medallas (🥇🥈🥉)
   - Highlight del equipo del estudiante
   - Animación de cambio de posición
   ```

3. **TeamMembersList** - Miembros del equipo
   ```tsx
   // Por miembro:
   - Avatar
   - Nombre
   - Puntos individuales
   - Contribución al equipo

   // Design:
   - Lista con avatares circulares
   - Barra de contribución
   ```

#### Página 3: `/estudiante/progreso` - Progreso por Ruta

**Componentes:**

1. **RoutesProgressGrid** - Progreso por ruta curricular
   ```tsx
   // Por ruta:
   - Nombre de la ruta
   - Color badge
   - Clases completadas / total
   - Porcentaje de progreso
   - Barra de progreso chunky

   // Design:
   - Grid de cards
   - Border-left con color de ruta
   - Barra de progreso animada
   ```

2. **ProgressChart** - Gráfico de progreso
   ```tsx
   // Tipo:
   - Gráfico radial (spider chart)
   - Un eje por cada ruta curricular
   - Muestra nivel en cada ruta

   // Design:
   - Colores de las rutas
   - Interactivo (hover para detalles)
   ```

---

## ✨ FASE 5: Polish, Testing y Optimización (2-3 días)

**Objetivo**: Pulir la experiencia de usuario, testing completo y optimización.

### 🎨 Módulo 5.1: Componentes Avanzados (Día 1)

#### Componentes UI Faltantes

1. **Toast Notifications** - Sistema de notificaciones
   ```tsx
   // Implementar con 'sonner' o 'react-hot-toast'

   // Tipos:
   - Success (verde con checkmark)
   - Error (rojo con X)
   - Warning (amarillo con !)
   - Info (cyan con i)

   // Design:
   - Toast con border chunky
   - Shadow-chunky-md
   - Animación slide-in desde top-right
   - Auto-dismiss después de 4s
   ```

2. **LoadingStates** - Estados de carga
   ```tsx
   // Componentes:

   a) Spinner - Spinner global
   - Circular con colores del brand
   - Size: sm/md/lg

   b) SkeletonLoader - Skeleton para cards
   - Shimmer effect
   - Shape según componente

   c) ProgressBar - Barra de progreso chunky
   - Gradient naranja-amarillo
   - Animación smooth

   // Design:
   - Usar colores del brand
   - Animaciones suaves
   ```

3. **ErrorBoundary** - Captura de errores
   ```tsx
   // Componente:
   - Catch errors en runtime
   - Mostrar UI amigable
   - Botón "Reintentar"
   - Log error a consola

   // Design:
   - Ilustración de error divertida
   - Mensaje claro y simple
   - Botón grande para volver
   ```

4. **EmptyState** - Estados vacíos
   ```tsx
   // Casos:
   - No hay clases
   - No hay estudiantes
   - No hay resultados de búsqueda

   // Elementos:
   - Ilustración o ícono grande
   - Mensaje claro
   - CTA relevante

   // Design:
   - Centrado vertical y horizontal
   - Colores suaves
   - Botón CTA destacado
   ```

5. **ConfirmDialog** - Diálogo de confirmación
   ```tsx
   // Props:
   - title: string
   - message: string
   - confirmLabel: string
   - onConfirm: function
   - variant: 'danger' | 'warning' | 'info'

   // Design:
   - Modal pequeño centrado
   - Botones destacados
   - Color según variant
   ```

---

### 📱 Módulo 5.2: PWA y Offline (Día 2)

#### 1. Service Worker

```typescript
// public/sw.js

// Cache strategies:
- Cache-first para assets estáticos
- Network-first para API calls
- Fallback offline page

// Features:
- Precache de páginas principales
- Cache de imágenes y fonts
- Offline fallback
```

#### 2. Manifest

```json
// public/manifest.json
{
  "name": "Mateatletas",
  "short_name": "Mateatletas",
  "description": "Plataforma educativa de matemáticas",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff9e6",
  "theme_color": "#ff6b35",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 3. Offline Fallback

```tsx
// components/OfflineFallback.tsx

// UI cuando no hay conexión:
- Ícono de no conexión
- Mensaje claro
- Botón "Reintentar"
- Cached data (si hay)

// Design:
- Full page centered
- Colores suaves
- Animación de "buscando conexión"
```

---

### 🧪 Módulo 5.3: Testing E2E (Día 3)

#### Tests Críticos con Playwright

```typescript
// tests/e2e/tutor-flow.spec.ts

test('Flujo completo de tutor: Login → Crear estudiante → Reservar clase', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'tutor@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // 2. Crear estudiante
  await page.click('text=Agregar Estudiante');
  await page.fill('[name="nombre"]', 'Juan');
  await page.fill('[name="apellido"]', 'Pérez');
  // ... más campos
  await page.click('button:text("Guardar")');
  await expect(page.locator('text=Estudiante creado')).toBeVisible();

  // 3. Reservar clase
  await page.goto('/clases');
  await page.click('.class-card >> nth=0'); // Primera clase
  await page.click('button:text("Reservar")');
  await page.selectOption('[name="estudiante"]', 'Juan Pérez');
  await page.click('button:text("Confirmar")');
  await expect(page.locator('text=Clase reservada')).toBeVisible();
});

// tests/e2e/docente-flow.spec.ts

test('Flujo de docente: Login → Ver clases → Tomar asistencia', async ({ page }) => {
  // Similar estructura
});

// tests/e2e/payment-flow.spec.ts

test('Flujo de pago: Seleccionar plan → MercadoPago → Confirmación', async ({ page }) => {
  // Mock de MercadoPago
});
```

---

## ✅ CHECKLIST DE COMPONENTES UI

### Componentes Base (Ya implementados ✅)

- [x] Button (primary, secondary, outline, ghost)
- [x] Card
- [x] Input (text, email, password)
- [x] Modal
- [x] Avatar
- [x] Badge
- [x] Select

### Componentes a Crear

#### Fase 1 (Tutor)
- [ ] ProductCard
- [ ] ProductFilter
- [ ] ProductModal
- [ ] PricingCard
- [ ] ComparisonTable
- [ ] PaymentSuccess
- [ ] ClassCalendar
- [ ] ClassCard
- [ ] RutaFilter
- [ ] ClassReservationModal

#### Fase 2 (Docente)
- [ ] DocenteSidebar
- [ ] DocenteHeader
- [ ] TeacherStatsCards
- [ ] UpcomingClassesList
- [ ] AttendanceGrid
- [ ] AttendanceStateSwitcher
- [ ] PointsInput
- [ ] ObservationsTextarea
- [ ] AttendanceSummary

#### Fase 3 (Admin)
- [ ] AdminSidebar
- [ ] AdminHeader
- [ ] AdminMetricsGrid
- [ ] AlertasCopilot
- [ ] UsersTable
- [ ] UserFormModal
- [ ] ProductsManagementTable
- [ ] RutasGrid
- [ ] ClassManagementCalendar
- [ ] ReportsTabs
- [ ] AttendanceReport
- [ ] PaymentReport

#### Fase 4 (Estudiante)
- [ ] StudentSidebar
- [ ] StudentHeader
- [ ] StudentWelcomeCard
- [ ] AchievementsGrid
- [ ] TeamCard
- [ ] TeamRanking
- [ ] RoutesProgressGrid

#### Fase 5 (Polish)
- [ ] Toast Notifications
- [ ] Spinner
- [ ] SkeletonLoader
- [ ] ProgressBar
- [ ] ErrorBoundary
- [ ] EmptyState
- [ ] ConfirmDialog
- [ ] OfflineFallback

---

## 🛠️ GUÍA DE DESARROLLO

### Estructura de Archivos por Fase

```
apps/web/src/
├── app/
│   ├── (protected)/          # FASE 1
│   │   ├── catalogo/
│   │   │   └── page.tsx
│   │   ├── clases/
│   │   │   └── page.tsx
│   │   ├── mis-clases/
│   │   │   └── page.tsx
│   │   └── membresia/
│   │       ├── planes/
│   │       │   └── page.tsx
│   │       └── confirmacion/
│   │           └── page.tsx
│   │
│   ├── docente/              # FASE 2
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── mis-clases/
│   │   └── clases/
│   │       └── [id]/
│   │           └── asistencia/
│   │
│   ├── admin/                # FASE 3
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── tutores/
│   │   ├── docentes/
│   │   ├── estudiantes/
│   │   ├── productos/
│   │   ├── rutas/
│   │   ├── clases/
│   │   └── reportes/
│   │
│   └── estudiante/           # FASE 4
│       ├── layout.tsx
│       ├── dashboard/
│       ├── progreso/
│       ├── equipo/
│       └── logros/
│
├── components/
│   ├── ui/                   # Componentes base
│   ├── features/             # Por módulo
│   │   ├── catalogo/
│   │   ├── clases/
│   │   ├── asistencia/
│   │   ├── admin/
│   │   └── estudiante/
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── api/                  # API clients
│   │   ├── catalogo.api.ts   # FASE 1
│   │   ├── pagos.api.ts      # FASE 1
│   │   ├── clases.api.ts     # FASE 1
│   │   ├── asistencia.api.ts # FASE 2
│   │   └── admin.api.ts      # FASE 3
│   ├── hooks/
│   └── utils/
│
├── store/                    # Zustand stores
│   ├── catalogo.store.ts     # FASE 1
│   ├── pagos.store.ts        # FASE 1
│   ├── clases.store.ts       # FASE 1
│   ├── asistencia.store.ts   # FASE 2
│   └── admin.store.ts        # FASE 3
│
└── types/
    ├── catalogo.types.ts
    ├── pago.types.ts
    ├── clase.types.ts
    └── asistencia.types.ts
```

### Checklist por Componente

Al crear cada componente, verificar:

- [ ] TypeScript types definidos
- [ ] Props interface exportada
- [ ] JSDoc con descripción y ejemplo
- [ ] Variants/sizes si aplica
- [ ] Estados (loading, error, empty)
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Design system colors y shadows
- [ ] Animaciones suaves (transitions)
- [ ] Error handling

### Ejemplo de Componente Completo

```tsx
// components/features/catalogo/ProductCard.tsx

import { Card, Badge, Button } from '@/components/ui';
import { Producto } from '@/types/catalogo.types';

/**
 * ProductCard - Tarjeta de producto en catálogo
 *
 * Muestra información resumida del producto con diseño chunky
 * y colores según el tipo.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   producto={producto}
 *   onClick={() => handleDetail(producto.id)}
 * />
 * ```
 */
interface ProductCardProps {
  producto: Producto;
  onClick?: () => void;
}

export function ProductCard({ producto, onClick }: ProductCardProps) {
  // Colores según tipo
  const tipoBadgeColor = {
    Suscripcion: 'bg-[#00d9ff]',  // cyan
    Curso: 'bg-[#ff6b35]',         // naranja
    Recurso: 'bg-[#f7b801]',       // amarillo
  };

  return (
    <Card
      className="
        cursor-pointer
        border-3 border-black
        shadow-[5px_5px_0px_rgba(0,0,0,1)]
        hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
        hover:scale-105
        transition-all duration-200
      "
      onClick={onClick}
    >
      {/* Imagen placeholder */}
      <div className="
        h-48
        bg-gradient-to-br from-primary/20 to-secondary/20
        rounded-t-lg
        flex items-center justify-center
        text-6xl
      ">
        📚
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Badge tipo */}
        <Badge
          className={`
            ${tipoBadgeColor[producto.tipo]}
            text-dark
            font-bold
            px-3 py-1
            shadow-[3px_3px_0px_rgba(0,0,0,1)]
          `}
        >
          {producto.tipo}
        </Badge>

        {/* Título */}
        <h3 className="font-lilita text-2xl text-dark line-clamp-2">
          {producto.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm line-clamp-3">
          {producto.descripcion}
        </p>

        {/* Precio */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-3xl font-bold text-primary">
              ${producto.precio}
            </span>
            {producto.duracion_dias && (
              <span className="text-sm text-gray-600">
                /{producto.duracion_dias} días
              </span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Ver más →
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## 📝 Notas Finales

### Prioridades

1. **Funcionalidad primero**: Hacer que funcione antes de optimizar
2. **Mobile responsive**: Desarrollar mobile-first
3. **Design system**: Respetar colores, sombras y tipografía
4. **Accesibilidad**: ARIA labels y navegación por teclado
5. **Performance**: Code splitting y lazy loading donde aplique

### Convenciones de Código

- **Componentes**: PascalCase (ProductCard.tsx)
- **Stores**: camelCase.store.ts (catalogo.store.ts)
- **API clients**: camelCase.api.ts (catalogo.api.ts)
- **Types**: camelCase.types.ts (producto.types.ts)
- **Hooks**: camelCase con prefijo use (useProductos.ts)

### Git Workflow

```bash
# Por cada fase:
git checkout -b feature/fase-1-tutor-flow
# Commits descriptivos por módulo
git commit -m "feat(catalogo): implement product grid and filters"
git commit -m "feat(pagos): add payment flow with mercadopago"
# Al terminar fase:
git push origin feature/fase-1-tutor-flow
# Crear PR con checklist de módulos
```

---

**Última actualización**: 13 de octubre de 2025
**Estado**: Plan detallado listo para implementación
**Próximo paso**: Comenzar Fase 1 - Módulo 1.1 (Catálogo de Productos)
