# 🏗️ ARQUITECTURA MATEATLETAS CLUB - POR INSTANCIAS

## 📋 Resumen Ejecutivo

**Total de tareas:** 82
**Instancias identificadas:** 6
**Slices de desarrollo:** 12

---

## 🎭 INSTANCIAS DEL SISTEMA

### 1. **PÚBLICO/LANDING** (Visitante sin autenticación)
### 2. **TUTOR/PADRE** (Usuario autenticado - rol: tutor)
### 3. **ESTUDIANTE** (Usuario autenticado - rol: estudiante)
### 4. **DOCENTE** (Usuario autenticado - rol: docente)
### 5. **ADMINISTRADOR** (Usuario autenticado - rol: admin)
### 6. **SISTEMA/BACKEND** (Infraestructura, automatización, IA)

---

## 📊 DISTRIBUCIÓN DE TAREAS POR INSTANCIA

| Instancia | Tareas | Porcentaje |
|-----------|--------|------------|
| **PÚBLICO/LANDING** | 2 | 2.4% |
| **TUTOR/PADRE** | 13 | 15.9% |
| **ESTUDIANTE** | 18 | 22.0% |
| **DOCENTE** | 14 | 17.1% |
| **ADMINISTRADOR** | 10 | 12.2% |
| **SISTEMA/BACKEND** | 25 | 30.5% |
| **TOTAL** | 82 | 100% |

---

# 🌐 INSTANCIA 1: PÚBLICO/LANDING

**Descripción:** Portal público para visitantes no autenticados. Primera impresión de Mateatletas Club.

## Tareas (2)

### 📍 T001 - Landing Page Pública
- **Flujo:** FLUJO 1
- **Descripción:** Página de aterrizaje con información del club, beneficios, testimonios, precios
- **Componentes:**
  - Hero section con CTA
  - Sección "¿Qué es Mateatletas?"
  - Beneficios y metodología STEAM
  - Planes y precios
  - Testimonios de familias
  - FAQ
  - Footer con contacto
- **Stack:** Next.js (app router), Tailwind CSS, Framer Motion
- **Ruta:** `/` (público)
- **Prioridad:** 🔴 CRÍTICA

### 📍 T002 - Formulario de Registro/Inscripción Público
- **Flujo:** FLUJO 1
- **Descripción:** Formulario multi-step para inscripción de nuevos estudiantes
- **Componentes:**
  - Paso 1: Datos del estudiante (nombre, edad, grado)
  - Paso 2: Datos del tutor (nombre, email, teléfono)
  - Paso 3: Selección de grupo/horario (ver cupos disponibles)
  - Paso 4: Método de pago
  - Paso 5: Confirmación
- **Validaciones:** Email único, edad válida, cupo disponible
- **Stack:** React Hook Form, Zod validation
- **Ruta:** `/inscripcion` (público)
- **Prioridad:** 🔴 CRÍTICA

---

# 👨‍👩‍👦 INSTANCIA 2: TUTOR/PADRE

**Descripción:** Portal para padres/tutores. Seguimiento del progreso del hijo, comunicación con docentes, gestión de pagos.

## Tareas (13)

### 📍 T003 - Widget de Bienvenida Personalizado
- **Flujo:** FLUJO 3
- **Descripción:** Card de bienvenida con resumen de última actividad del hijo
- **Datos mostrados:**
  - Saludo personalizado con nombre del tutor
  - Resumen última clase (fecha, puntos ganados)
  - CTA "Ver progreso completo"
  - Notificaciones pendientes
- **Ruta:** `/dashboard` (tutor)
- **Prioridad:** 🟡 ALTA

### 📍 T004 - Panel de Progreso Detallado del Hijo
- **Flujo:** FLUJO 3
- **Descripción:** Vista completa del progreso del estudiante
- **Componentes:**
  - Información de última clase
  - Insignias obtenidas (visual)
  - Nivel actual con nombre personalizado
  - Tiempo de práctica semanal
  - Próxima clase programada
- **Ruta:** `/dashboard/progreso/[estudianteId]` (tutor)
- **Prioridad:** 🟡 ALTA

### 📍 T005 - Vista de Suscripción y Pagos
- **Flujo:** FLUJO 3
- **Descripción:** Gestión completa de membresía y pagos
- **Componentes:**
  - Estado actual de suscripción (activa/vencida)
  - Próxima fecha de renovación
  - Método de pago guardado
  - Historial de pagos con recibos
  - Opción de cancelar suscripción
  - Banner de recordatorio de vencimiento
- **Ruta:** `/membresia` o `/suscripcion` (tutor)
- **Prioridad:** 🟡 ALTA

### 📍 T006 - Comentarios de Docente Visibles para Tutor
- **Flujo:** FLUJO 3
- **Descripción:** Acceso a observaciones que escribió el docente sobre el estudiante
- **Componentes:**
  - Timeline de comentarios ordenados por fecha
  - Filtros por tipo de observación
  - Vista detallada de cada observación
- **Permisos:** Solo leer observaciones de SU hijo
- **Endpoint:** GET `/api/observaciones/estudiante/[id]` con auth de tutor
- **Ruta:** `/dashboard/progreso/[estudianteId]#observaciones` (tutor)
- **Prioridad:** 🟠 MEDIA

### 📍 T007 - Sistema de Mensajería Interna Tutor ↔ Docente
- **Flujo:** FLUJO 3
- **Descripción:** Chat/mensajería bidireccional entre tutor y docente del grupo
- **Componentes:**
  - Bandeja de entrada
  - Lista de conversaciones
  - Chat individual por docente
  - Notificación de mensaje nuevo
  - Historial de conversación
- **Backend:** Nuevo módulo `/api/mensajes`
- **Ruta:** `/mensajes` (tutor)
- **Prioridad:** 🟠 MEDIA

### 📍 T008 - Gráficas de Progreso por Competencias
- **Flujo:** FLUJO 3
- **Descripción:** Visualización del crecimiento en áreas matemáticas
- **Competencias:**
  - Cálculo mental
  - Razonamiento lógico
  - Geometría
  - Resolución de problemas
- **Tipo de gráfico:** Radar chart o barras comparativas
- **Stack:** Recharts o Chart.js
- **Ruta:** `/dashboard/progreso/[estudianteId]#competencias` (tutor)
- **Prioridad:** 🟠 MEDIA

### 📍 T009 - Sistema de Recompensas Familiares
- **Flujo:** FLUJO 3
- **Descripción:** Logros compartidos entre tutor e hijo
- **Componentes:**
  - "Recompensas del Mes"
  - Logros familiares desbloqueables
  - Metas conjuntas (ej: asistencia perfecta + nivel 2 = medalla "Equipo Mateatleta")
  - Galería de medallas compartidas
- **Backend:** Extiende `/api/gamificacion` con logros familiares
- **Ruta:** `/recompensas` (tutor)
- **Prioridad:** 🟢 BAJA

### 📍 T010 - Compartir Logros (Tarjetas Visuales)
- **Flujo:** FLUJO 3
- **Descripción:** Generador de imágenes de logros para compartir en redes
- **Componentes:**
  - Canvas con diseño de tarjeta de logro
  - Información: nombre estudiante, logro, fecha
  - Botón "Compartir" (usa Web Share API)
  - Opción de descargar imagen
- **Stack:** html2canvas o canvas nativo
- **Ruta:** Modal en `/dashboard/progreso/[estudianteId]` (tutor)
- **Prioridad:** 🟢 BAJA

### 📍 T011 - Notificaciones Push (PWA/Firebase)
- **Flujo:** FLUJO 3
- **Descripción:** Push notifications para eventos importantes
- **Eventos:**
  - Clase de hijo comenzó
  - Clase terminó (con resumen)
  - Nuevo logro obtenido
  - Mensaje nuevo de docente
  - Recordatorio de pago
- **Stack:** Firebase Cloud Messaging o PWA Service Workers
- **Prioridad:** 🟠 MEDIA

### 📍 T012 - Vista Parental en Vivo Durante Clase
- **Flujo:** FLUJO 3
- **Descripción:** Observar participación del hijo en tiempo real (modo espectador)
- **Componentes:**
  - Indicador de clase activa
  - Puntajes acumulados en vivo
  - Marcador parpadea cuando responde correctamente
  - SIN posibilidad de intervenir
- **Stack:** WebSockets para datos en tiempo real
- **Ruta:** `/clase/[id]/observar` (tutor)
- **Prioridad:** 🟢 BAJA

### 📍 T013 - Resumen Automático Post-Clase para Tutor
- **Flujo:** FLUJO 3
- **Descripción:** Notificación y vista de resumen al finalizar clase
- **Datos:**
  - Participación (sí/no en todos los juegos)
  - % de respuestas correctas
  - Estrellas/puntos ganados
  - Insignias nuevas
- **Trigger:** Automático al finalizar clase
- **Ruta:** Modal push notification → `/dashboard/progreso/[estudianteId]#resumen` (tutor)
- **Prioridad:** 🟡 ALTA

### 📍 T014 - Tracking Tiempo de Práctica Semanal
- **Flujo:** FLUJO 3
- **Descripción:** Contador de minutos de práctica/estudio semanal
- **Componentes:**
  - Widget con total de minutos
  - Desglose por actividad
  - Meta semanal (ej: 60 min)
  - Barra de progreso
- **Backend:** Sistema de tracking de sesiones activas
- **Ruta:** `/dashboard/progreso/[estudianteId]#tiempo` (tutor)
- **Prioridad:** 🟠 MEDIA

### 📍 T015 - Visualización de Insignias y Gamificación
- **Flujo:** FLUJO 1 (compartido con ESTUDIANTE)
- **Descripción:** Galería visual de insignias obtenidas por el hijo
- **Componentes:**
  - Grid de insignias con iconos
  - Insignias bloqueadas (grises)
  - Descripción al hover
  - Fecha de obtención
- **Ruta:** `/dashboard/progreso/[estudianteId]#insignias` (tutor)
- **Prioridad:** 🟡 ALTA

---

# 👦 INSTANCIA 3: ESTUDIANTE

**Descripción:** Portal del niño/adolescente. Experiencia gamificada, clases en vivo, evaluaciones, progreso personal.

## Tareas (18)

### 📍 T016 - Portal Completo del Estudiante
- **Flujo:** FLUJO 4 + FLUJO 1
- **Descripción:** Dashboard principal del estudiante
- **Componentes:**
  - Avatar personalizado en header
  - Nivel y barra de experiencia
  - Navegación principal
  - Widgets de actividades
- **Autenticación:** JWT con rol 'estudiante'
- **Ruta:** `/estudiante/dashboard`
- **Prioridad:** 🔴 CRÍTICA

### 📍 T017 - Sistema de Avatares Personalizables
- **Flujo:** FLUJO 4
- **Descripción:** Avatar que representa al estudiante
- **Opciones:**
  - Galería de avatares predefinidos (Dicebear API o custom)
  - Personalización básica (color, accesorios)
  - Mostrar en dashboard y durante clases
- **Backend:** Campo `avatar` en tabla Estudiante
- **Ruta:** `/estudiante/perfil/avatar`
- **Prioridad:** 🟡 ALTA

### 📍 T018 - Tablero de Actividades con Cards
- **Flujo:** FLUJO 4
- **Descripción:** Cards principales de navegación
- **Cards:**
  1. **Evaluación de Rendimiento** - "Descubrí tus fortalezas"
  2. **Clase de Hoy** - Horario y countdown
  3. **Mis Logros y Recompensas** - Insignias y nivel
- **Diseño:** Amigable para niños, colores vibrantes
- **Ruta:** `/estudiante/dashboard` (sección principal)
- **Prioridad:** 🔴 CRÍTICA

### 📍 T019 - Animación de Bienvenida Personalizada
- **Flujo:** FLUJO 4
- **Descripción:** Saludo animado al entrar
- **Componente:**
  - Animación breve (2-3 seg)
  - Mensaje: "¡Bienvenido, [Nombre]! Hoy empieza tu aventura matemática 🧮✨"
  - Framer Motion o Lottie
- **Trigger:** Al hacer login
- **Prioridad:** 🟢 BAJA

### 📍 T020 - Módulo de Evaluación Diagnóstica Gamificada
- **Flujo:** FLUJO 4 + FLUJO 1
- **Descripción:** Test inicial para detectar fortalezas/debilidades
- **Características:**
  - Preguntas con animaciones coloridas
  - Feedback visual inmediato (correcto/incorrecto)
  - Diseño tipo juego (no examen aburrido)
  - Progreso visible (5/20 preguntas)
- **Ruta:** `/estudiante/evaluacion`
- **Prioridad:** 🔴 CRÍTICA

### 📍 T021 - Algoritmo Adaptativo de Dificultad
- **Flujo:** FLUJO 4 + FLUJO 1
- **Descripción:** Ajusta dificultad según respuestas
- **Lógica:**
  - Si acierta 3 seguidas → aumenta dificultad
  - Si falla 2 seguidas → disminuye dificultad
  - Calibración por área (cálculo, lógica, geometría)
- **Backend:** Algoritmo en servicio de evaluación
- **Prioridad:** 🟠 MEDIA

### 📍 T022 - Análisis Automático de Resultados + Envío
- **Flujo:** FLUJO 4 + FLUJO 1
- **Descripción:** Procesa resultados y los distribuye
- **Proceso:**
  1. Analiza respuestas (% aciertos por área)
  2. Identifica fortalezas y debilidades
  3. Genera perfil de aprendizaje
  4. Envía notificación a docente
  5. Envía notificación a admin
  6. Guarda contexto para IA
- **Mensaje al estudiante:** "¡Completado! Sos fuerte en patrones y razonamiento lógico. Vamos a trabajar tu velocidad."
- **Backend:** POST `/api/evaluaciones/completar`
- **Prioridad:** 🔴 CRÍTICA

### 📍 T023 - Widget Próxima Clase con Countdown
- **Flujo:** FLUJO 4
- **Descripción:** Contador regresivo hasta próxima clase
- **Estados:**
  - "Próxima clase en 2 días 5 horas"
  - "Tu clase comienza en 15 minutos" (amarillo)
  - "¡Tu clase está activa!" (verde pulsante)
  - "Clase finalizada" (gris)
- **Ruta:** Card en `/estudiante/dashboard`
- **Prioridad:** 🟡 ALTA

### 📍 T024 - Botón Dinámico Entrar a Clase
- **Flujo:** FLUJO 4
- **Descripción:** Botón que se activa a la hora de clase
- **Comportamiento:**
  - ANTES de la hora: deshabilitado (gris) "Falta X tiempo"
  - A LA HORA exacta: cambia a verde "🔵 ENTRAR A MI CLASE EN VIVO"
  - DESPUÉS de 15 min: amarillo "Clase en progreso"
  - DESPUÉS de finalizada: gris "Clase finalizada"
- **Ruta:** Card en `/estudiante/dashboard`
- **Prioridad:** 🔴 CRÍTICA

### 📍 T025 - Integración Videollamada con Auto-Join
- **Flujo:** FLUJO 4 + FLUJO 1 + FLUJO 2
- **Descripción:** Abre sala de videollamada desde dashboard
- **Stack sugerido:** Jitsi Meet (open source, embebible)
- **Alternativas:** Daily.co, Whereby, Zoom SDK
- **Comportamiento:**
  - Click en botón → abre sala embebida
  - Auto-join con nombre del estudiante
  - Registro automático de asistencia (webhook)
- **Ruta:** Modal o `/clase/[id]/sala` en iframe
- **Prioridad:** 🔴 CRÍTICA

### 📍 T026 - Tablero de Desafíos en Vivo (WebSockets)
- **Flujo:** FLUJO 4
- **Descripción:** Interfaz de juegos durante la clase
- **Componentes:**
  - Problemas/preguntas en tiempo real
  - Botones de respuesta
  - Feedback inmediato
  - Sincronización con otros estudiantes
- **Stack:** Socket.io para WebSockets
- **Ruta:** Overlay durante videollamada o tab paralela
- **Prioridad:** 🟠 MEDIA

### 📍 T027 - Animaciones en Tiempo Real (Celebraciones)
- **Flujo:** FLUJO 4
- **Descripción:** Efectos visuales al obtener logros
- **Animaciones:**
  - Lluvia de estrellas al acertar
  - Confetti al subir de nivel
  - Badge flotante al desbloquear logro
  - Toasts de felicitación
- **Stack:** react-confetti, Framer Motion, Lottie
- **Prioridad:** 🟢 BAJA

### 📍 T028 - Barra de Puntos en Vivo Durante Clase
- **Flujo:** FLUJO 4
- **Descripción:** Widget visible que muestra puntos acumulados
- **Componente:**
  - Barra fija en esquina superior
  - Animación al sumar puntos (+10, +25, etc.)
  - Contador total de puntos de la sesión
- **Actualización:** WebSocket cuando docente asigna puntos
- **Prioridad:** 🟠 MEDIA

### 📍 T029 - Leaderboard de Equipos en Tiempo Real
- **Flujo:** FLUJO 4
- **Descripción:** Tabla de posiciones durante clase
- **Componentes:**
  - Ranking individual (top 5)
  - Ranking de equipos (si se juega en equipos)
  - Actualización automática en vivo
  - Highlight del estudiante actual
- **Ruta:** Overlay durante clase o tab `/clase/[id]/ranking`
- **Prioridad:** 🟢 BAJA

### 📍 T030 - Modal Resumen Post-Clase
- **Flujo:** FLUJO 4
- **Descripción:** Pantalla de cierre al terminar clase
- **Datos mostrados:**
  - Estrellas ganadas
  - Logros desbloqueados
  - Tiempo de concentración
  - Nivel actual
  - Botón "Compartir logro"
- **Trigger:** Automático al finalizar clase
- **Prioridad:** 🟡 ALTA

### 📍 T031 - Sistema de Métricas por Sesión
- **Flujo:** FLUJO 4 + FLUJO 3
- **Descripción:** Tracking granular de participación en clase
- **Métricas:**
  - Tiempo activo vs inactivo
  - Cantidad de respuestas (correctas/incorrectas)
  - Items completados
  - Nivel de concentración (algorítmico)
- **Backend:** Tabla `SesionesClase` con métricas por estudiante
- **Prioridad:** 🟠 MEDIA

### 📍 T032 - Buzón de Mensajes (Recibir de Tutor)
- **Flujo:** FLUJO 4
- **Descripción:** Inbox simple para mensajes de su tutor/madre
- **Componentes:**
  - Icono con badge de mensajes nuevos
  - Lista de mensajes
  - Vista individual de mensaje
  - Interfaz simple (apropiada para niños)
- **Ruta:** `/estudiante/mensajes`
- **Prioridad:** 🟢 BAJA

### 📍 T033 - Sistema de Niveles con Nombres Creativos
- **Flujo:** FLUJO 4 + FLUJO 3
- **Descripción:** Niveles de progreso con nombres atractivos
- **Ejemplos:**
  - Nivel 1: "Explorador Numérico"
  - Nivel 2: "Explorador Avanzado"
  - Nivel 3: "Cazador de Patrones"
  - Nivel 4: "Maestro del Cálculo"
  - Nivel 5: "Leyenda Matemática"
- **Backend:** Configuración de niveles con umbrales de puntos
- **Prioridad:** 🟡 ALTA

### 📍 T034 - Notificación y Animación de Level-Up
- **Flujo:** FLUJO 4
- **Descripción:** Celebración especial al subir de nivel
- **Componente:**
  - Animación fullscreen (3-5 seg)
  - Mensaje: "¡SUBISTE DE NIVEL! Ahora sos [Nombre Nivel]"
  - Confetti y efectos visuales
  - Sonido de celebración (opcional)
- **Trigger:** Al alcanzar umbral de puntos
- **Stack:** Framer Motion, react-confetti
- **Prioridad:** 🟢 BAJA

---

# 👩‍🏫 INSTANCIA 4: DOCENTE

**Descripción:** Portal del docente. Gestión de grupos, clases en vivo, asignación de puntos, observaciones, estadísticas.

## Tareas (14)

### 📍 T035 - Panel Detallado de Grupo
- **Flujo:** FLUJO 2
- **Descripción:** Vista completa de un grupo/clase
- **Componentes:**
  - Lista de estudiantes inscritos
  - Progreso individual de cada uno
  - Evaluaciones pendientes
  - Logros obtenidos (por estudiante)
  - Próximas clases programadas
  - Botón "Iniciar clase"
- **Ruta:** `/docente/grupo/[claseId]`
- **Prioridad:** 🔴 CRÍTICA

### 📍 T036 - Enriquecer Notificaciones
- **Flujo:** FLUJO 2
- **Descripción:** Mejorar payload de notificaciones existentes
- **Mejoras:**
  - Tipo 'nuevo_estudiante': agregar edad del estudiante
  - Tipo 'nuevo_estudiante': mostrar cupo actualizado "9/10"
  - Incluir info relevante según tipo
- **Backend:** Modificar servicio de notificaciones
- **Prioridad:** 🟢 BAJA

### 📍 T037 - Dashboard Estadísticas Docente Funcional
- **Flujo:** FLUJO 2
- **Descripción:** Completar página de reportes con métricas reales
- **Métricas:**
  - Nuevos alumnos incorporados (mes/semana)
  - % de mejora promedio del grupo
  - Insignias entregadas (total y por tipo)
  - Logros desbloqueados globalmente
  - Asistencia promedio
  - Tasa de participación
- **Ruta:** `/docente/reportes`
- **Prioridad:** 🟡 ALTA

### 📍 T038 - Test de Rendimiento Inicial (Vista Docente)
- **Flujo:** FLUJO 2 + FLUJO 1
- **Descripción:** Ver resultados de evaluaciones diagnósticas
- **Componente:**
  - Tabla con estudiantes y estado de evaluación
  - Botón "Ver resultados" por estudiante
  - Vista de perfil detallado
- **Backend:** GET `/api/evaluaciones/estudiante/[id]`
- **Ruta:** `/docente/grupo/[id]#evaluaciones`
- **Prioridad:** 🟡 ALTA

### 📍 T039 - Gráficos de Fortalezas/Debilidades
- **Flujo:** FLUJO 2
- **Descripción:** Visualización de perfil del estudiante
- **Componentes:**
  - Gráfico de radar por competencias
  - Barras comparativas con promedio del grupo
  - Timeline de evolución
- **Stack:** Recharts
- **Ruta:** `/docente/estudiante/[id]/perfil`
- **Prioridad:** 🟠 MEDIA

### 📍 T040 - Perfil Detallado del Estudiante
- **Flujo:** FLUJO 2
- **Descripción:** Vista 360° del estudiante
- **Componentes:**
  - Información básica (nombre, edad, contacto tutor)
  - Gráficos de competencias
  - Historial de observaciones
  - Asistencia histórica
  - Insignias y nivel
  - Botón "Agregar observación"
- **Ruta:** `/docente/estudiante/[id]`
- **Prioridad:** 🟡 ALTA

### 📍 T041 - Integración Videollamadas + Tracking Conectados
- **Flujo:** FLUJO 2 + FLUJO 1
- **Descripción:** Iniciar clase y ver quién está conectado
- **Componentes:**
  - Botón "Iniciar clase" en panel de grupo
  - Abre sala de videollamada
  - Lista de estudiantes conectados en tiempo real
  - Avatares flotantes en esquina
  - Registro automático de asistencia (webhook)
- **Stack:** Jitsi Meet + webhooks
- **Prioridad:** 🔴 CRÍTICA

### 📍 T042 - Sistema de Gamificación en Vivo
- **Flujo:** FLUJO 2
- **Descripción:** Lanzar actividades interactivas durante clase
- **Componentes:**
  - Panel de control de actividades
  - Crear/lanzar desafío
  - Ver respuestas en tiempo real
  - Asignar puntos masivos o individuales
- **Stack:** WebSockets
- **Ruta:** Overlay durante videollamada o `/clase/[id]/control`
- **Prioridad:** 🟠 MEDIA

### 📍 T043 - Contador Grupal y Puntos de Equipo
- **Flujo:** FLUJO 2
- **Descripción:** Sistema de puntos colectivos
- **Componentes:**
  - Dividir grupo en equipos
  - Contador de puntos por equipo
  - Asignar puntos a equipo completo
  - Visualización en vivo para estudiantes
- **Backend:** Tabla `Equipos` y puntos compartidos
- **Prioridad:** 🟢 BAJA

### 📍 T044 - Asignación Rápida de Insignias Durante Clase
- **Flujo:** FLUJO 2
- **Descripción:** Modal rápido para otorgar insignias
- **Componentes:**
  - Click en nombre de estudiante
  - Modal con galería de insignias disponibles
  - Selección rápida
  - Confirmación instantánea
  - Animación en pantalla del estudiante
- **Ruta:** Modal en `/docente/grupo/[id]` o durante clase
- **Prioridad:** 🟡 ALTA

### 📍 T045 - Animaciones en Tiempo Real (Vista Docente)
- **Flujo:** FLUJO 2
- **Descripción:** Ver celebraciones sincronizadas del grupo
- **Componente:**
  - Confetti cuando se alcanza meta grupal
  - Medallas flotantes al otorgar insignia
  - Efectos visuales sincronizados
- **Prioridad:** 🟢 BAJA

### 📍 T046 - Modal de Cierre de Clase + Observaciones para IA
- **Flujo:** FLUJO 2
- **Descripción:** Prompt automático al finalizar clase
- **Componentes:**
  - Aparece al hacer click "Finalizar clase"
  - Campo: "¿Deseás registrar observaciones o ajustes para la IA?"
  - Textarea libre
  - Opciones rápidas: "Aumentar dificultad", "Reforzar tema X"
  - Botón "Guardar y cerrar"
- **Backend:** Guarda observaciones con flag `para_ia: true`
- **Prioridad:** 🟠 MEDIA

### 📍 T047 - Dashboard Resultados Diagnósticos
- **Flujo:** FLUJO 1
- **Descripción:** Vista consolidada de resultados de evaluaciones
- **Componentes:**
  - Tabla con todos los estudiantes
  - Columnas: Nombre, Fecha evaluación, Estado, Fortalezas, Debilidades
  - Filtros por grupo
  - Exportar a CSV
- **Ruta:** `/docente/evaluaciones`
- **Prioridad:** 🟠 MEDIA

### 📍 T048 - Juegos Educativos Interactivos (Gestión)
- **Flujo:** FLUJO 1
- **Descripción:** Biblioteca de actividades/juegos para usar en clase
- **Componentes:**
  - Catálogo de juegos disponibles
  - Filtros por tema, dificultad, duración
  - Vista previa de juego
  - Botón "Lanzar en clase"
- **Ruta:** `/docente/actividades`
- **Prioridad:** 🟢 BAJA

---

# 👔 INSTANCIA 5: ADMINISTRADOR

**Descripción:** Portal del administrador. Métricas globales, gestión financiera, auditoría, configuración del sistema.

## Tareas (10)

### 📍 T049 - Dashboard Global de KPIs
- **Flujo:** FLUJO 5
- **Descripción:** Vista panorámica del estado del sistema
- **KPIs mostrados:**
  - Total estudiantes activos
  - Total docentes activos
  - Total grupos/clases
  - Ingresos del mes
  - Tasa de retención
  - Nuevos ingresos esta semana
  - Clases programadas hoy
- **Ruta:** `/admin/overview` o `/admin/dashboard`
- **Prioridad:** 🔴 CRÍTICA

### 📍 T050 - Tracking de Aciertos por Clase/Estudiante
- **Flujo:** FLUJO 5 + FLUJO 3
- **Descripción:** Registro granular de respuestas en actividades
- **Backend:**
  - Tabla `RespuestasActividad` (estudiante, actividad, correcto, timestamp)
  - Endpoint para consultar aciertos
- **Vista admin:** Tabla de analytics
- **Prioridad:** 🟠 MEDIA

### 📍 T051 - Índices de Compromiso (ICD, ICE)
- **Flujo:** FLUJO 5
- **Descripción:** Métricas de engagement
- **Índices:**
  - **ICD (Índice Compromiso Docente):** Calculado por asistencia, observaciones escritas, uso de planificador, respuesta a mensajes
  - **ICE (Índice Compromiso Estudiante):** Calculado por asistencia, participación en actividades, tiempo de práctica, logros obtenidos
- **Fórmulas:** Definir algoritmo de cálculo
- **Vista:** Cards en `/admin/metricas`
- **Prioridad:** 🟢 BAJA

### 📍 T052 - Gráficas Temporales de Crecimiento
- **Flujo:** FLUJO 5 + FLUJO 6
- **Descripción:** Series temporales de métricas clave
- **Gráficos:**
  - Estudiantes activos por mes (últimos 12 meses)
  - Ingresos mensuales
  - Tasa de crecimiento
  - Proyección (con línea punteada)
- **Stack:** Recharts con soporte de forecast
- **Ruta:** `/admin/metricas#crecimiento`
- **Prioridad:** 🟡 ALTA

### 📍 T053 - Generación Automática de Reportes PDF
- **Flujo:** FLUJO 5
- **Descripción:** Exportar reportes en PDF
- **Tipos de reportes:**
  - Reporte mensual de ingresos
  - Reporte de estudiantes
  - Reporte de asistencia
  - Reporte de métricas educativas
- **Stack:** Puppeteer, jsPDF, o PDFKit
- **Ruta:** Botón "Exportar PDF" en secciones relevantes
- **Prioridad:** 🟠 MEDIA

### 📍 T054 - Email Service para Envíos Automáticos
- **Flujo:** FLUJO 5
- **Descripción:** Servicio de emails transaccionales y automáticos
- **Casos de uso:**
  - Confirmación de inscripción
  - Recordatorio de pago
  - Resumen semanal a familias
  - Reporte mensual a admin
  - Notificación de nuevo estudiante a docente
- **Stack:** Nodemailer + SendGrid/Resend/Amazon SES
- **Backend:** Módulo `/api/emails`
- **Prioridad:** 🟡 ALTA

### 📍 T055 - Sistema de Proyecciones Financieras
- **Flujo:** FLUJO 6
- **Descripción:** Forecasting de ingresos
- **Componentes:**
  - Proyección mes siguiente basada en retención histórica
  - Proyección anual
  - Escenarios: optimista, realista, pesimista
  - Gráfico con línea proyectada
- **Algoritmo:** Regresión lineal o media móvil ponderada
- **Ruta:** `/admin/finanzas#proyecciones`
- **Prioridad:** 🟠 MEDIA

### 📍 T056 - Cálculo de Retención Histórica
- **Flujo:** FLUJO 6
- **Descripción:** Métrica de retención mensual
- **Fórmula:**
  ```
  Retención = (Estudiantes fin de mes - Nuevos) / Estudiantes inicio de mes
  ```
- **Vista:**
  - Card con % de retención actual
  - Gráfico temporal de retención
  - Comparación con meses anteriores
- **Ruta:** `/admin/finanzas#retencion`
- **Prioridad:** 🟠 MEDIA

### 📍 T057 - Gestión Automatizada de Cobranza (Dunning)
- **Flujo:** FLUJO 6
- **Descripción:** Sistema de recordatorios escalonados
- **Políticas:**
  - Día 5: Recordatorio amable (email)
  - Día 10: Aviso de retención (email + notificación)
  - Día 15: Suspensión de cuenta
- **Backend:** Cron job diario que verifica pagos atrasados
- **Prioridad:** 🟡 ALTA

### 📍 T058 - Métricas de Morosidad y Liquidez
- **Flujo:** FLUJO 6
- **Descripción:** Indicadores financieros de salud
- **Métricas:**
  - **Morosidad:** % de pagos atrasados
  - **Liquidez:** % de ingresos confirmados vs esperados
  - **Deudores activos:** Cantidad y lista
  - **Pagos pendientes:** Cantidad
- **Vista:** Cards en `/admin/finanzas`
- **Prioridad:** 🟠 MEDIA

---

# ⚙️ INSTANCIA 6: SISTEMA/BACKEND

**Descripción:** Infraestructura, automatización, inteligencia artificial, tareas programadas, monitoreo.

## Tareas (25)

## 🔧 Infraestructura y Automatización (10)

### 📍 T059 - Sistema de Cron Jobs / Scheduled Tasks
- **Flujo:** FLUJO 5
- **Descripción:** Infraestructura para tareas programadas
- **Stack:** `@nestjs/schedule` con decorador `@Cron()`
- **Tareas a programar:**
  - Verificación de suscripciones (diaria)
  - Envío de resúmenes semanales (domingos)
  - Limpieza de datos (domingos)
  - Recordatorios de pago (diaria)
  - Backups (diaria)
- **Prioridad:** 🔴 CRÍTICA

### 📍 T060 - Backups Automáticos de Base de Datos
- **Flujo:** FLUJO 5
- **Descripción:** Respaldos periódicos de PostgreSQL
- **Estrategia:**
  - Backup diario (retener 7 días)
  - Backup semanal (retener 4 semanas)
  - Backup mensual (retener 12 meses)
- **Stack:** `pg_dump` + cron job + almacenamiento (S3/local)
- **Prioridad:** 🔴 CRÍTICA

### 📍 T061 - APM y Monitoring de Sistema
- **Flujo:** FLUJO 5
- **Descripción:** Monitoreo de performance y errores
- **Métricas:**
  - Uptime del servidor
  - Latencia de endpoints
  - Tasa de errores
  - Uso de CPU/memoria
  - Logs centralizados
- **Stack:** Sentry (errores) + PM2 (logs) o New Relic (APM completo)
- **Prioridad:** 🟠 MEDIA

### 📍 T062 - Limpieza Automática de Datos Huérfanos
- **Flujo:** FLUJO 5
- **Descripción:** Script de mantenimiento semanal
- **Acciones:**
  - Detectar registros huérfanos (relaciones rotas)
  - Limpiar sesiones expiradas
  - Eliminar notificaciones antiguas (>90 días)
  - Archivar clases pasadas
- **Trigger:** Cron semanal (domingos 3 AM)
- **Prioridad:** 🟢 BAJA

### 📍 T063 - Detección de Suscripciones por Vencer
- **Flujo:** FLUJO 6
- **Descripción:** Identificar membresías próximas a expirar
- **Lógica:**
  - Cron diario revisa `fechaFin` de membresías
  - Si faltan ≤ 5 días: enviar recordatorio
  - Si faltan ≤ 2 días: enviar alerta urgente
  - Si vencida: cambiar estado a 'vencida'
- **Trigger:** Cron diario (8 AM)
- **Prioridad:** 🟡 ALTA

### 📍 T064 - Recordatorios Escalonados de Pago
- **Flujo:** FLUJO 6
- **Descripción:** Implementar políticas de dunning
- **Lógica:**
  - Detectar pagos atrasados
  - Aplicar políticas según días de atraso
  - Enviar emails automáticos
  - Registrar intentos de contacto
- **Backend:** Servicio `CobranzaService`
- **Prioridad:** 🟡 ALTA

### 📍 T065 - Resumen Semanal Automático a Familias
- **Flujo:** FLUJO 5
- **Descripción:** Email semanal con progreso del hijo
- **Contenido:**
  - Clases asistidas
  - Logros obtenidos
  - Ranking semanal
  - Próximas actividades
- **Trigger:** Cron semanal (domingos 7 PM)
- **Stack:** Email service + plantilla HTML
- **Prioridad:** 🟠 MEDIA

### 📍 T066 - Notificaciones Proactivas del Sistema
- **Flujo:** FLUJO 5
- **Descripción:** Alertas automáticas de eventos
- **Eventos:**
  - Clase por empezar (15 min antes)
  - Clase iniciada
  - Clase finalizada
  - Logro desbloqueado
  - Mensaje nuevo
  - Pago procesado
- **Backend:** Sistema de eventos con listeners
- **Prioridad:** 🟡 ALTA

### 📍 T067 - Integración Pago → Activación Automática
- **Flujo:** FLUJO 1
- **Descripción:** Pipeline automático post-pago
- **Proceso:**
  1. Webhook de MercadoPago confirma pago
  2. Crear/renovar membresía
  3. Activar acceso del estudiante a plataforma
  4. Enviar email de confirmación
  5. Notificar a docente del grupo
  6. Notificar a admin
- **Backend:** Mejorar webhook actual
- **Prioridad:** 🔴 CRÍTICA

### 📍 T068 - Mostrar Cupos Disponibles en Frontend
- **Flujo:** FLUJO 1
- **Descripción:** Visualizar cupos en tiempo real
- **Componente:**
  - Badge "9/10 cupos" en card de grupo
  - Color verde (disponible), amarillo (pocos), rojo (lleno)
  - Deshabilitar inscripción si lleno
- **Backend:** GET `/api/clases/[id]/cupos`
- **Prioridad:** 🟡 ALTA

## 🤖 Inteligencia Artificial y Machine Learning (8)

### 📍 T069 - Pipeline de Ingesta de Datos para AI
- **Flujo:** FLUJO 5 + FLUJO 6
- **Descripción:** Sistema de recolección de datos para entrenar IA
- **Datos a ingestar:**
  - Resultados de evaluaciones
  - Respuestas en actividades
  - Tiempo de participación
  - Interacciones familiares
  - Datos financieros
- **Stack:** Proceso ETL (Extract, Transform, Load)
- **Destino:** Data warehouse o feature store
- **Prioridad:** 🟢 BAJA

### 📍 T070 - Modelo de Análisis de Debilidades
- **Flujo:** FLUJO 5
- **Descripción:** IA que identifica áreas de mejora por estudiante
- **Input:** Historial de respuestas, evaluaciones
- **Output:** Perfil de debilidades (ej: "Velocidad de cálculo baja")
- **Stack:** Python + scikit-learn o TensorFlow
- **Prioridad:** 🟢 BAJA

### 📍 T071 - Motor de Correlaciones
- **Flujo:** FLUJO 5 + FLUJO 6
- **Descripción:** Descubrir patrones entre variables
- **Correlaciones objetivo:**
  - Insignias obtenidas ↔ tasa de retención
  - Reportes visuales ↔ puntualidad en pagos
  - Participación familiar ↔ mejora académica
- **Stack:** Pandas + análisis estadístico
- **Prioridad:** 🟢 BAJA

### 📍 T072 - Segmentación Inteligente de Usuarios
- **Flujo:** FLUJO 6
- **Descripción:** Clustering de usuarios por comportamiento
- **Segmentos:**
  - Por comportamiento de pago
  - Por nivel de engagement
  - Por progreso académico
- **Algoritmo:** K-means o DBSCAN
- **Prioridad:** 🟢 BAJA

### 📍 T073 - Recomendaciones Automáticas Operativas
- **Flujo:** FLUJO 5
- **Descripción:** IA sugiere acciones al admin
- **Ejemplos:**
  - "Agregar 1 nuevo docente para expansión moderada"
  - "Grupo de lunes 17:00 tiene baja participación, considerar cambio de horario"
  - "Estudiante X en riesgo de abandono, contactar familia"
- **Stack:** Sistema de reglas + ML
- **Prioridad:** 🟢 BAJA

### 📍 T074 - Forecasting con Machine Learning
- **Flujo:** FLUJO 6
- **Descripción:** Predicción de ingresos con ML
- **Modelos:** ARIMA, Prophet (Facebook), o LSTM
- **Output:** Proyección de ingresos con intervalos de confianza
- **Prioridad:** 🟢 BAJA

### 📍 T075 - AI con Contexto Personalizado por Alumno
- **Flujo:** FLUJO 1 + FLUJO 2
- **Descripción:** Sistema que adapta contenido según perfil
- **Funcionalidad:**
  - Mantener contexto acumulativo del estudiante
  - Ajustar dificultad de actividades
  - Recomendar recursos personalizados
- **Stack:** LLM (GPT/Claude) + RAG (Retrieval-Augmented Generation)
- **Prioridad:** 🟢 BAJA

### 📍 T076 - Feed Interno de Recomendaciones AI
- **Flujo:** FLUJO 5
- **Descripción:** Timeline de insights automáticos
- **Contenido:**
  - Alertas de IA
  - Recomendaciones semanales
  - Patrones detectados
  - Acciones sugeridas
- **Vista:** `/admin/insights` o `/docente/insights`
- **Prioridad:** 🟢 BAJA

## 🌐 WebSockets y Tiempo Real (2)

### 📍 T077 - WebSockets para Eventos en Tiempo Real
- **Flujo:** FLUJO 2 + FLUJO 4
- **Descripción:** Infraestructura de comunicación bidireccional
- **Stack:** Socket.io
- **Eventos:**
  - Asignación de puntos
  - Logro desbloqueado
  - Estudiante conectado a clase
  - Respuesta a actividad
  - Actualización de leaderboard
- **Backend:** Gateway WebSocket en NestJS
- **Prioridad:** 🟡 ALTA

### 📍 T078 - Módulo IA Adaptativa + Perfil Acumulativo
- **Flujo:** FLUJO 2
- **Descripción:** Sistema que aprende y se adapta por estudiante
- **Componentes:**
  - Base de datos de perfil (fortalezas, debilidades, preferencias)
  - Algoritmo de ajuste de dificultad
  - Registro de interacciones
  - API para consultar perfil
- **Backend:** Servicio `PerfilAdaptativoService`
- **Prioridad:** 🟢 BAJA

## 📊 Analytics y Métricas (5)

### 📍 T079 - Sistema de Métricas por Clase
- **Flujo:** FLUJO 3
- **Descripción:** Analytics granular de cada sesión
- **Métricas:**
  - Participación por estudiante
  - % de aciertos
  - Tiempo de participación
  - Preguntas respondidas
- **Backend:** Tabla `MetricasClase`
- **Prioridad:** 🟠 MEDIA

### 📍 T080 - Registro Automático de Asistencia
- **Flujo:** FLUJO 2 + FLUJO 5
- **Descripción:** Detectar asistencia automáticamente
- **Método:**
  - Webhook de videollamada cuando estudiante se une
  - Trigger para crear registro en tabla `Asistencia`
- **Alternativa:** Botón manual "Registrar asistencia" si no hay webhook
- **Prioridad:** 🟡 ALTA

### 📍 T081 - Generación Automática de Resumen de Clase
- **Flujo:** FLUJO 2 + FLUJO 5
- **Descripción:** Pipeline post-clase
- **Proceso:**
  1. Clase finaliza
  2. Recopilar métricas (asistencia, aciertos, puntos)
  3. Generar resumen por estudiante
  4. Notificar a tutores
  5. Enviar a docente
- **Backend:** Servicio `ResumenClaseService`
- **Prioridad:** 🟡 ALTA

### 📍 T082 - Informe Automático AI sobre Debilidades
- **Flujo:** FLUJO 5
- **Descripción:** IA genera reporte semanal
- **Contenido:**
  - Debilidades detectadas por grupo
  - Estudiantes que requieren atención
  - Temas que necesitan refuerzo
- **Trigger:** Cron semanal (lunes 8 AM)
- **Destinatarios:** Docentes y admin
- **Prioridad:** 🟢 BAJA

---

## 📈 RESUMEN FINAL POR INSTANCIA

| Instancia | Tareas | IDs |
|-----------|--------|-----|
| **PÚBLICO/LANDING** | 2 | T001-T002 |
| **TUTOR/PADRE** | 13 | T003-T015 |
| **ESTUDIANTE** | 18 | T016-T034 |
| **DOCENTE** | 14 | T035-T048 |
| **ADMINISTRADOR** | 10 | T049-T058 |
| **SISTEMA/BACKEND** | 25 | T059-T082 |
| **TOTAL** | **82** | - |

---

**Documento generado:** `ARQUITECTURA_POR_INSTANCIAS.md`
**Próximo paso:** Plan de desarrollo por SLICES
