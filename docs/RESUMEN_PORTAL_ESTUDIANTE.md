# 📋 RESUMEN COMPLETO: PORTAL DEL ESTUDIANTE - MATEATLETAS

> **Fecha de Auditoría**: 29 de Octubre 2025
> **Estado**: Sistema Parcialmente Implementado (Backend 90%, Frontend 40%)

---

## 1️⃣ ENDPOINTS API PARA ESTUDIANTES (Funcionando)

### 🔐 Autenticación

```
POST   /auth/estudiante/login          Login con credenciales propias
GET    /auth/profile                   Perfil del usuario autenticado
POST   /auth/logout                    Cerrar sesión
```

### 👤 Gestión de Estudiante

```
GET    /estudiantes                    Listar estudiantes (tutor ve sus hijos)
GET    /estudiantes/:id                Obtener detalle de estudiante
PATCH  /estudiantes/:id                Actualizar datos de estudiante
DELETE /estudiantes/:id                Eliminar estudiante
GET    /estudiantes/count              Contar estudiantes del tutor
GET    /estudiantes/estadisticas       Estadísticas de estudiantes
GET    /estudiantes/:id/detalle-completo  Detalle completo (gamificación, asistencia, stats)
```

### 🎮 Avatar 3D (Ready Player Me)

```
GET    /estudiantes/mi-avatar          Obtener avatar del estudiante logueado
PATCH  /estudiantes/avatar             Actualizar URL del avatar 3D
PATCH  /estudiantes/:id/avatar         Actualizar gradiente del avatar (tutor)
```

### 🏆 Gamificación

```
GET    /gamificacion/dashboard/:estudianteId      Dashboard completo (nivel, puntos, racha)
GET    /gamificacion/logros/:estudianteId         Logros desbloqueados y bloqueados
GET    /gamificacion/puntos/:estudianteId         Resumen de puntos
GET    /gamificacion/ranking/:estudianteId        Ranking del estudiante (equipo + global)
GET    /gamificacion/progreso/:estudianteId       Progreso por ruta curricular
GET    /gamificacion/historial/:estudianteId      Historial de puntos ganados
POST   /gamificacion/puntos                       Otorgar puntos (solo Docente/Admin)
```

### 📚 Clases y Asistencia

```
GET    /clases/:id/estudiantes         Estudiantes inscritos en una clase
POST   /clases/:id/asignar-estudiantes Asignar estudiantes a clase (Admin)
GET    /asistencia/estudiantes/:estudianteId  Historial de asistencias
POST   /asistencia                     Auto-registro de asistencia (Estudiante)
POST   /asistencia/clases/:claseId/estudiantes/:estudianteId  Marcar asistencia (Docente)
```

### 💰 Pagos (Solo Consulta)

```
GET    /pagos/estudiantes-descuentos   Estudiantes con descuentos disponibles
GET    /pagos/morosidad/estudiantes    Estudiantes con morosidad
GET    /pagos/morosidad/estudiante/:estudianteId  Estado de pago del estudiante
```

### 👥 Equipos

```
GET    /equipos                        Listar equipos disponibles
```

---

## 2️⃣ ¿QUÉ DEBE PODER HACER UN ESTUDIANTE? (Flujos)

### ✅ **Implementado (Backend + Frontend)**

1. **Login**: Autenticación con email/username y contraseña
2. **Crear Avatar 3D**: Integración con Ready Player Me
3. **Ver Dashboard (Gimnasio)**: Hub principal ultra-gamificado
4. **Ver Stats Personales**: Nivel, puntos XP, racha, monedas, gemas
5. **Interactuar con Avatar**: Hover, click, animaciones automáticas
6. **Ver Navegación**: 10 secciones (Inicio, Juegos, Cursos, Logros, Tienda, etc.)

### 🚧 **Backend Listo, Frontend Pendiente**

1. **Juegos/Ejercicios**: Sistema de planificaciones y actividades semanales
2. **Asistencia a Clases**: Registro automático o por docente
3. **Ranking/Leaderboard**: Ver posición en equipo y global
4. **Logros/Badges**: Galería de medallas desbloqueadas
5. **Progreso de Cursos**: Avance por ruta curricular
6. **Historial de Puntos**: Ver acciones que dieron puntos
7. **Chat con Equipo**: Comunicación entre miembros del equipo
8. **Notificaciones**: Alertas de clases, nuevos logros, etc.

### 📝 **Planificado, No Implementado**

1. **Tienda de Power-ups**: Comprar items con monedas/gemas
2. **Sistema de Amigos**: Agregar y competir con amigos
3. **Entrenamientos Personalizados**: Rutas adaptativas
4. **Desafíos Especiales**: Eventos temporales con recompensas

---

## 3️⃣ INFORMACIÓN QUE NECESITA VER (Dashboard Content)

### 📊 **Dashboard Principal** (`/estudiante/gimnasio`)

#### Header (10vh):

- **Avatar pequeño** + Nombre del estudiante + Nivel + Grupo
  - Muestra: "Nivel 1 • 🔥 Grupo Fénix" (comunidad, no competencia)
- **Logo**: "Mateatletas Club STEAM" (centrado, Lilita One font)
- **Recursos**:
  - 💰 Monedas (coins): Actualmente hardcoded en 168
  - 💎 Gemas (gems): Actualmente hardcoded en 0
  - 🔥 Racha: Días consecutivos de actividad

#### Centro (90vh - 50/50 split):

**Columna Izquierda (50%):**

- **Avatar 3D gigante** (Ready Player Me)
- Plataforma 3D circular animada
- Ring giratorio con efecto de profundidad
- Efecto de fuego si racha >= 3 días
- **Interactividad**:
  - Hover → saluda (wave)
  - Click → animación aleatoria (clapping, dance, victory)
  - Idle → animaciones cada 10-15 segundos

**Columna Derecha (50%):**

- **Badge de Nivel**: Nivel actual (1-10) con gradiente
- **Barra de XP**: Progreso al siguiente nivel (X/1000 XP)
- **3 Stats Cards** (Progreso Personal):
  - 🔥 RACHA: X días → "¡Sigue así!" (onClick → animación clapping)
  - 🏆 LOGROS: 12/50 → "Desbloqueados" (onClick → animación wave)
  - 🎯 ÁLGEBRA: 85% → "¡Casi maestro!" (onClick → animación dance)
- **Botón CTA Gigante**: "JUGAR" → animación victory + navega a entrenamientos

#### Navegación Lateral:

**Izquierda (5 botones):**

1. 🏠 HUB - Tu espacio personal
2. 🎮 ENTRENAMIENTOS - Práctica y ejercicios (badge: 3 nuevos)
3. 📚 MIS CURSOS - Tus rutas de aprendizaje
4. 🏆 MIS LOGROS - Tus logros personales (badge: 2 nuevos)
5. 🛒 TIENDA - Mejoras y avatares

**Derecha (4 botones):**

1. 👥 MI GRUPO - Tu comunidad de estudio
2. 📊 MI PROGRESO - Tu evolución personal
3. 🔔 NOTIFICACIONES - Novedades y alertas (badge: 7 nuevas)
4. ⚙️ AJUSTES - Configuración

---

## 4️⃣ SISTEMA DE TAREAS/CLASES (Pedagogía)

### 📅 **Clases (Sincrónicas)**

**Tipos:**

1. **Clase Individual** (`Clase`): Clase one-off programada por admin
2. **Clase Grupal** (`ClaseGrupo`): Clase recurrente semanal (ej: "B1 - Lunes 19:30")

**Flujo:**

```
1. Admin crea clase → 2. Tutor reserva cupo para su hijo →
3. Estudiante asiste → 4. Docente marca asistencia →
5. Puntos otorgados automáticamente
```

**Estados:** `Programada` | `Cancelada`

**Datos Clave:**

- Día/hora de inicio
- Duración en minutos
- Cupos máximos/ocupados
- Docente asignado
- Ruta curricular (tema)
- Sector (Matemática o Programación)

### 📝 **Planificaciones (Asíncronas - Homework)**

**Concepto**: Plan mensual de 4 semanas con actividades semanales interactivas

**Dos Sistemas:**

#### A) PlanificacionMensual (Full-Featured):

- Creada por admins
- Asignada a grupos pedagógicos (B1, B2, B3, A1)
- Contiene 4 **ActividadSemanal**
- Cada actividad es un componente React interactivo
- Docente activa semanas progresivamente
- Estudiante completa a su ritmo dentro de la semana

#### B) PlanificacionSimple (Auto-Detected):

- Desarrolladores crean componentes React en `/apps/web/src/planificaciones/`
- Sistema auto-detecta con `PLANIFICACION_CONFIG` export
- No requiere registro manual
- Convención sobre configuración

**Estructura de Actividad:**

```typescript
{
  semana_numero: 1-4,
  titulo: "Semana 1: Tablas de Multiplicar",
  componente_nombre: "JuegoTablasMultiplicar",
  componente_props: { nivel: "basico", tablas: [2,3,4] },
  nivel_dificultad: "BASICO" | "INTERMEDIO" | "AVANZADO" | "OLIMPICO",
  tiempo_estimado_minutos: 30,
  puntos_gamificacion: 50,
  instrucciones_estudiante: "Completa las multiplicaciones..."
}
```

### 🎮 **Actividades (Games/Exercises)**

**Tipos de Componentes:**

- `juego`: Juegos interactivos (ej: JuegoTablasMultiplicar)
- `video`: Videos educativos
- `pdf`: Documentos para lectura
- `ejercicio`: Ejercicios tradicionales

**Tracking Automático** (ProgresoEstudianteActividad):

- ✅ Iniciado / Completado
- ⏱️ Tiempo total en minutos
- 🎯 Intentos realizados
- 🏆 Mejor puntaje
- 💾 Estado del juego (JSON para resumir)
- 📊 Respuestas detalladas (para análisis del docente)

**Workflow del Estudiante:**

```
1. Docente activa Semana X →
2. Estudiante ve "Disponible ✅ [▶️ EMPEZAR]" →
3. Click abre componente React →
4. Auto-save cada 30 segundos →
5. Estudiante puede pausar/reanudar →
6. Al completar → Puntos otorgados + Logros desbloqueados
```

### 📊 **Asistencia (Attendance)**

**Modelos:**

- `Asistencia`: Para clases individuales
- `AsistenciaClaseGrupo`: Para clases grupales recurrentes

**Estados:** `Presente` | `Ausente` | `Justificado`

**Flujo:**

```
Clase ocurre → Docente marca asistencia →
Docente agrega observaciones → Sistema otorga puntos (10 pts por asistencia)
```

**Características:**

- Registro batch optimizado (30+ estudiantes a la vez)
- Observaciones del docente por estudiante
- Cálculo automático de racha (días consecutivos)
- Integración con gamificación

---

## 5️⃣ ¿QUÉ SON LOS "JUEGOS"? (Ejercicios vs Mini-games)

### 🎯 **Definición**

Los "juegos" en Mateatletas son **componentes React interactivos** que:

- Enseñan conceptos matemáticos o de programación
- Tienen mecánicas de juego (puntos, timer, vidas)
- Se guardan automáticamente
- Otorgan puntos y desbloquean logros

### 🕹️ **Tipos de Juegos**

**1. Mini-Games Interactivos:**

- Tablas de multiplicar (timing challenge)
- Fracciones (drag & drop)
- Geometría (construcción visual)

**2. Ejercicios Gamificados:**

- Problemas con sistema de intentos
- Feedback inmediato correcto/incorrecto
- Explicaciones paso a paso

**3. Videos/PDFs Interactivos:**

- Requieren completar para marcar como "visto"
- Pueden tener quiz al final

### 🏗️ **Arquitectura Técnica**

**PlanificacionWrapper** (`/apps/web/src/planificaciones/shared/PlanificacionWrapper.tsx`):

- HOC que envuelve cada juego
- Proporciona hooks automáticos:
  - `usePlanificacion()` → acceso a progreso
  - `guardarEstado(state)` → auto-save cada 30s
  - `completarSemana(puntos)` → marcar completado
  - `puedeAcceder(semana)` → control de acceso

**Ejemplo de Juego:**

```tsx
// apps/web/src/planificaciones/2025-03-multiplicaciones-b1.tsx

export const PLANIFICACION_CONFIG = {
  codigo: '2025-03-multiplicaciones-b1',
  titulo: 'Multiplicaciones - Marzo 2025',
  grupo: 'B1',
  mes: 3,
  anio: 2025,
  semanas: 4,
};

export default function JuegoMultiplicaciones() {
  const { progreso, guardarEstado, completarSemana } = usePlanificacion();

  return (
    <div className="juego-container">
      {/* Lógica del juego */}
      <Timer />
      <MultipicacionPregunta />
      <Puntaje actual={progreso.puntos_obtenidos} />

      <button onClick={() => completarSemana(100)}>Finalizar</button>
    </div>
  );
}
```

### 📦 **Juegos Detectados en Codebase**

Actualmente implementados:

- `JuegoTablasMultiplicar` - Multiplicación con timer
- (Otros en desarrollo según planificaciones detectadas)

---

## 6️⃣ SISTEMA DE PROGRESO PERSONAL Y COMUNIDAD (SIN COMPETENCIA)

### 🎯 **CAMBIO FUNDAMENTAL: De Competitivo a Colaborativo**

**FILOSOFÍA:**
El sistema se centra en el **progreso personal** y la **comunidad de aprendizaje**, eliminando rankings y posiciones que generan estrés competitivo.

**4 Grupos (Comunidades de Estudio):**

1. 🔥 Fénix (Phoenix) - Color rojo/naranja
2. 🐉 Dragón (Dragon) - Color verde/esmeralda
3. 🐯 Tigre (Tiger) - Color amarillo/dorado
4. 🦅 Águila (Eagle) - Color azul/celeste

**Función de los Grupos:**

- ❌ NO competencia entre grupos
- ✅ Comunidad de apoyo y celebración
- ✅ Objetivos colaborativos semanales
- ✅ Reconocimiento de logros de compañeros
- ✅ Sentido de pertenencia

### 📊 **Sistema de Progreso Personal**

#### Mi Progreso (Vista Dedicada)

**Gráfico de Evolución:**

- Puntos por semana (últimas 4 semanas)
- Muestra tu crecimiento personal
- Mensajes motivacionales ("¡Has sumado +450 puntos este mes! 🚀")

**Dominio por Tema:**

- Álgebra: 85% ⚡ "¡Casi maestro!"
- Geometría: 62% 📐
- Fracciones: 95% 🌟 "¡Excelente!"
- Multiplicación: 78% ✨

**Tiempo Practicado:**

- Horas por semana
- Histograma visual
- Seguimiento de constancia

**Próximos Retos:**

- "Completar Álgebra I" (85% progreso)
- "Llegar a 10 días de racha" (30% progreso)
- "Desbloquear 5 logros más" (71% progreso)

#### Mi Grupo (Vista Colaborativa)

**Objetivo Semanal Grupal:**

- "Completar 100 ejercicios entre todos"
- Barra de progreso colectiva (73/100)
- Todos contribuyen, nadie compite

**Celebraciones Recientes:**

- Ana desbloqueó "Maestro de Fracciones"
- Carlos alcanzó 10 días de racha 🔥
- María completó Geometría I
- Luis alcanzó nivel 5 ⭐

**Stats del Grupo:**

- 15 miembros
- 8 días de racha grupal
- 47 logros esta semana

**Sin Rankings:**

- ❌ No hay "posición #1, #2, #3"
- ❌ No se comparan estudiantes
- ✅ Se celebran logros individuales
- ✅ Se fomenta la colaboración

### 🎖️ **Sistema de Logros (8 Predefinidos)**

| Emoji | Nombre              | Puntos Bonus | Requisito               |
| ----- | ------------------- | ------------ | ----------------------- |
| 🎓    | Primera Clase       | +50 pts      | Asistir a 1 clase       |
| 🔥    | Racha de Fuego      | +200 pts     | 5 clases consecutivas   |
| 📚    | Matemático Dedicado | +100 pts     | Acumular 500 puntos     |
| ⭐    | Estrella Brillante  | +150 pts     | Alcanzar nivel 5        |
| 👑    | Leyenda Matemática  | +300 pts     | Alcanzar nivel 10       |
| 🏆    | Maestro de Equipo   | +250 pts     | Tu equipo #1 en ranking |
| 🤝    | Colaborador         | +180 pts     | Ayudar a 10 compañeros  |
| 💯    | Perfeccionista      | +220 pts     | 20 ejercicios perfectos |

**Rareza de Logros:**

- Común: Verde (fáciles de obtener)
- Raro: Azul (requieren esfuerzo)
- Épico: Morado (muy difíciles)
- Legendario: Dorado (casi imposibles)

### 📈 **Sistema de Niveles (10 Niveles)**

| Nivel | Nombre                | Rango de Puntos | Color         | Emoji |
| ----- | --------------------- | --------------- | ------------- | ----- |
| 1     | Explorador Numérico   | 0-499           | Verde         | 🌱    |
| 2     | Aprendiz Matemático   | 500-999         | Azul          | 📚    |
| 3     | Calculador Experto    | 1000-1999       | Morado        | 🧮    |
| 4     | Maestro del Álgebra   | 2000-3499       | Rosa          | 🎯    |
| 5     | Genio Geométrico      | 3500-4999       | Amarillo      | 📐    |
| 6     | Hechicero del Cálculo | 5000-7499       | Cyan          | 🔮    |
| 7     | Sabio Matemático      | 7500-9999       | Morado oscuro | 🧙‍♂️    |
| 8     | Leyenda Numérica      | 10000-14999     | Rojo          | 👑    |
| 9     | Titán Matemático      | 15000-24999     | Naranja       | ⚡    |
| 10    | Dios de los Números   | 25000+          | Dorado        | 🌟    |

**Progresión:**

- Cada nivel requiere exponencialmente más puntos
- Dashboard muestra barra de progreso al siguiente nivel
- Al subir de nivel → animación épica + notificación

### 💰 **Monedas y Gemas (Futura Tienda)**

**Actualmente Hardcoded:**

- Monedas: 168 (placeholder)
- Gemas: 0 (placeholder)

**Sistema Planificado:**

- Monedas se ganan por completar actividades
- Gemas son premium (compras o logros especiales)
- Tienda para comprar:
  - Power-ups (ej: "Comodín 50/50")
  - Avatares especiales
  - Temas visuales
  - Efectos de partículas

### 📊 **Acciones Puntuables (8 Configuradas)**

| Acción                   | Puntos | Cuándo se Otorga                      |
| ------------------------ | ------ | ------------------------------------- |
| Asistencia a clase       | 10 pts | Al marcar presente                    |
| Participación activa     | 15 pts | Docente lo otorga manualmente         |
| Ejercicios completados   | 20 pts | Al completar actividad                |
| Ayudó a un compañero     | 25 pts | Docente lo reconoce                   |
| Excelencia en ejercicios | 30 pts | 100% correcto en actividad            |
| Racha semanal            | 50 pts | Asistir toda la semana                |
| Desafío superado         | 40 pts | Completar actividad avanzada/olímpica |
| Mejora destacada         | 35 pts | Docente lo destaca                    |

---

## 7️⃣ ESTADO DE IMPLEMENTACIÓN

### ✅ Backend (API) - 90% Completo

**Completamente Implementado:**

- ✅ Autenticación de estudiantes
- ✅ CRUD de estudiantes
- ✅ Avatares 3D (Ready Player Me)
- ✅ Sistema de equipos
- ✅ Gamificación completa (puntos, niveles, logros, ranking)
- ✅ Clases (individuales y grupales)
- ✅ Asistencia con batch recording
- ✅ Planificaciones (ambos sistemas)
- ✅ Actividades semanales
- ✅ Progreso de estudiantes
- ✅ Historial de puntos
- ✅ Consultas de pagos

**Pendiente:**

- ⏳ Sistema de chat/mensajería
- ⏳ Notificaciones push
- ⏳ Tienda virtual (productos, compras)
- ⏳ Sistema de amigos
- ⏳ Eventos especiales/torneos

### 🎨 Frontend (Web) - 40% Completo

**Completamente Implementado:**

- ✅ Login de estudiantes
- ✅ Creación de avatar 3D (Ready Player Me)
- ✅ Dashboard ultra-gamificado (Gimnasio)
- ✅ Avatar 3D interactivo con animaciones
- ✅ Navegación lateral con 10 secciones
- ✅ Layout responsive con guards
- ✅ Hooks de React Query para gamificación

**Parcialmente Implementado:**

- 🚧 Mis Actividades (backend listo, UI falta)
- 🚧 Logros/Badges (componentes existen, integración falta)
- 🚧 Ranking (backend listo, UI falta)
- 🚧 Progreso de cursos (tracking existe, vista falta)

**No Implementado:**

- ❌ Juegos (componentes individuales)
- ❌ Cursos (catálogo y navegación)
- ❌ Entrenamientos (rutas personalizadas)
- ❌ Tienda (UI completa)
- ❌ Chat (mensajería)
- ❌ Amigos (lista y competencia)
- ❌ Notificaciones (centro de notificaciones)
- ❌ Ajustes (panel de configuración)

---

## 8️⃣ PRIORIDADES SUGERIDAS PARA DESARROLLO

### 🔥 Alta Prioridad (Core Functionality):

1. **Mis Actividades UI** - Mostrar planificaciones y actividades asignadas
2. **Componente de Juego Base** - Template para crear juegos rápidamente
3. **Logros Gallery** - Vista completa de badges con animaciones
4. **Ranking/Leaderboard UI** - Tabla de posiciones con equipos
5. **Progreso Visual** - Barras de progreso por curso/ruta

### 🟡 Media Prioridad (Engagement):

1. **Chat Simple** - Mensajería dentro del equipo
2. **Notificaciones** - Sistema de alertas (clases, logros, mensajes)
3. **Perfil de Estudiante** - Vista editable con avatar y stats
4. **Historial de Actividad** - Timeline de acciones y puntos

### 🟢 Baja Prioridad (Nice to Have):

1. **Tienda Virtual** - Compra de power-ups y avatares
2. **Sistema de Amigos** - Agregar/remover amigos
3. **Eventos Especiales** - Torneos temporales
4. **Analytics Dashboard** - Gráficos de progreso
5. **Customización Avatar** - Editor avanzado

---

## 9️⃣ ARQUITECTURA TÉCNICA

### 🗂️ Stack Tecnológico

**Backend:**

- NestJS (framework)
- Prisma ORM (database)
- PostgreSQL (database)
- JWT (authentication)
- bcrypt (password hashing)
- class-validator (DTO validation)

**Frontend:**

- Next.js 15.5.4 (React framework)
- Turbopack (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- React Query (data fetching)
- Zustand (state management)
- Lucide React (icons)
- model-viewer (3D avatars)
- Ready Player Me API (avatar creation)

### 📁 Estructura de Directorios

**Backend:**

```
apps/api/src/
├── auth/                    # Autenticación
├── estudiantes/             # CRUD estudiantes
├── gamificacion/            # Puntos, logros, niveles, ranking
├── clases/                  # Clases individuales y grupales
├── asistencia/              # Registro de asistencia
├── planificaciones/         # Planificaciones mensuales
├── planificaciones-simples/ # Auto-detected planificaciones
├── admin/                   # Gestión administrativa
└── common/                  # Guards, decorators, utils
```

**Frontend:**

```
apps/web/src/
├── app/
│   ├── estudiante/          # Portal del estudiante
│   │   ├── crear-avatar/    # Creación de avatar
│   │   ├── gimnasio/        # Dashboard principal
│   │   └── layout.tsx       # Auth guard
│   ├── tutor/               # Portal del tutor
│   ├── docente/             # Portal del docente
│   └── admin/               # Portal administrativo
├── components/
│   ├── gamificacion/        # Badges, logros
│   ├── dashboard/           # Widgets
│   └── ui/                  # Componentes base
├── lib/
│   ├── api/                 # Cliente API (axios)
│   ├── hooks/               # React Query hooks
│   └── stores/              # Zustand stores
└── planificaciones/         # Juegos/actividades
    └── shared/              # PlanificacionWrapper
```

### 🔒 Seguridad

**Implementado:**

- JWT tokens (httpOnly cookies)
- Token blacklist (logout invalida inmediatamente)
- Role-based access control (RBAC)
- Ownership guards (estudiante solo ve sus datos)
- Password hashing (bcrypt)
- CSRF protection
- Rate limiting (100-1000 req/min)
- Avatar URL validation (solo readyplayer.me)

---

## 🔟 CASOS DE USO COMPLETOS

### 📖 Caso de Uso 1: Estudiante Nuevo

```
1. Admin/Tutor crea estudiante en sistema
2. Sistema genera credenciales temporales
3. Estudiante recibe email/username + password temporal
4. Estudiante hace login por primera vez
5. Sistema redirige a /estudiante/crear-avatar
6. Estudiante crea avatar 3D con Ready Player Me
7. Sistema guarda avatar_url en BD
8. Redirige a /estudiante/gimnasio (Dashboard)
9. Ve su nivel inicial (1), puntos (0), sin logros
10. Docente asigna primera planificación
11. Estudiante ve "Semana 1 disponible"
```

### 📖 Caso de Uso 2: Completar una Actividad

```
1. Estudiante entra a /estudiante/gimnasio
2. Click en "JUEGOS" (nav lateral)
3. Ve lista de planificaciones asignadas
4. Click en "Semana 1: Multiplicaciones"
5. Sistema carga componente JuegoTablasMultiplicar
6. PlanificacionWrapper auto-guarda cada 30s
7. Estudiante juega, acumula puntos
8. Click en "Finalizar"
9. Sistema:
   - Marca completado
   - Otorga 50 puntos
   - Verifica si desbloquea logros
   - Si alcanza nuevo nivel → animación
10. Redirige a dashboard con notificación
11. Dashboard actualiza: nivel, puntos, logros nuevos
```

### 📖 Caso de Uso 3: Asistir a una Clase

```
1. Tutor reserva clase para estudiante
2. Estudiante recibe notificación (futuro)
3. Estudiante asiste a clase en horario
4. Docente marca asistencia "Presente"
5. Sistema:
   - Registra asistencia
   - Otorga 10 puntos automáticamente
   - Calcula racha (días consecutivos)
   - Si racha = 5 → desbloquea "Racha de Fuego" (+200 pts)
6. Estudiante ve en dashboard:
   - Puntos actualizados
   - Racha incrementada
   - Nuevo logro (si aplica)
```

### 📖 Caso de Uso 4: Competir con Equipo

```
1. Admin asigna estudiante a equipo "Fénix"
2. Estudiante acumula puntos (asistencias + actividades)
3. Puntos se suman al total del equipo
4. Sistema calcula ranking de equipos
5. Estudiante ve en dashboard:
   - Su posición en equipo (#3 de 15)
   - Posición global (#42 de 150)
   - Top 10 de su equipo
6. Si su equipo llega a #1:
   - Todos los miembros desbloquean "Maestro de Equipo"
   - +250 puntos bonus
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

**Archivos Clave:**

- `/docs/PLANIFICACIONES_SISTEMA.md` - Guía completa de planificaciones
- `/docs/api-specs/gamificacion_puntos_logros.md` - Spec de gamificación
- `/docs/api-specs/clases.md` - Spec de clases
- `/docs/api-specs/asistencia.md` - Spec de asistencia
- `/apps/api/prisma/schema.prisma` - Schema completo de BD

**DFDs (Data Flow Diagrams):**

- `/DFD/DFD'S-FINALES/*.md` - Diagramas de flujo de datos

**Seeds:**

- `/apps/api/prisma/seeds/logros.seed.ts` - 8 logros predefinidos
- `/apps/api/prisma/seeds/niveles.seed.ts` - 10 niveles configurados
- `/apps/api/prisma/seeds/acciones-puntuables.seed.ts` - 8 acciones

---

## 🎯 CONCLUSIÓN

El portal del estudiante de Mateatletas es un **sistema de aprendizaje gamificado** completo que combina:

✅ **Backend robusto** (90% completo) con APIs RESTful
✅ **Gamificación completa** (puntos, niveles, logros, ranking)
✅ **Avatares 3D interactivos** (Ready Player Me)
✅ **Sistema de clases** (sincrónicas y asíncronas)
✅ **Planificaciones flexibles** (auto-detectadas y manuales)
✅ **Tracking exhaustivo** (progreso, tiempo, intentos)
✅ **Competencia por equipos** (ranking individual y grupal)

🚧 **Frontend parcial** (40% completo) requiere:

- UI para actividades/juegos
- Galería de logros
- Leaderboard visual
- Sistema de notificaciones
- Chat de equipo

El sistema está **listo para escalar** con arquitectura sólida, seguridad robusta, y patrones de diseño consistentes.

---

**Generado por**: Claude Code
**Fecha**: 29 de Octubre 2025
