# MATEATLETAS 2026 - ESPECIFICACIÓN TÉCNICA

## 1. VISIÓN DEL PRODUCTO

### 1.1 ¿Qué es Mateatletas?

Mateatletas es una plataforma educativa STEAM gamificada para chicos de 6 a 17 años donde estudiar y jugar son la misma cosa.

No es:
- ❌ Un Udemy para niños (videos pasivos)
- ❌ Un complemento escolar (ejercicios aburridos)
- ❌ Una academia online tradicional (clases por Zoom)

Es:
- ✅ Una experiencia de aprendizaje inmersiva
- ✅ Un campus virtual donde los estudiantes se ven entre sí
- ✅ Simuladores, laboratorios virtuales y juegos educativos
- ✅ "Roblox Education meets Hogwarts"

### 1.2 Misión

Transformar la educación STEAM en una experiencia que los chicos elijan por diversión, no por obligación.

### 1.3 Problema que Resuelve

| Problema | Cómo lo resolvemos |
|----------|-------------------|
| Los chicos se aburren con educación tradicional | Gamificación real: casas, XP, rankings, avatares |
| Videos pasivos no generan engagement | Simulaciones interactivas y desafíos prácticos |
| Falta de opciones accesibles en Argentina | Precios en pesos, contenido en español, contexto local |
| Aprendizaje solitario sin motivación social | Campus virtual multiplayer, competencia por casa |
| Contenido genérico que no desafía | 3 niveles por casa + nivel olímpico para los cracks |

### 1.4 Filosofía Educativa

**80% práctica, 20% teoría**

- Primero hacés, después entendés por qué
- Cada concepto tiene una simulación o desafío asociado
- Los errores son parte del aprendizaje (sistema anti-frustración)
- Progresión adaptativa según nivel real del estudiante

**Aprendizaje por experiencias:**

| Tipo | Ejemplo |
|------|---------|
| Simuladores de física | Gravedad, fricción, colisiones, péndulos |
| Laboratorios virtuales | Reacciones químicas, circuitos eléctricos |
| Editores de código integrados | Scratch, Python, Lua (Roblox) |
| Desafíos tipo competencia | CSSBattle, problemas de olimpiadas |
| Construcción de proyectos | Crear juegos en Roblox, apps simples |

### 1.5 Público Objetivo

| Segmento | Edad | Qué buscan |
|----------|------|------------|
| Quantum | 6-9 | Descubrir, jugar, explorar |
| Vertex | 10-12 | Crear cosas, Roblox, Scratch, competir |
| Pulsar | 13-17 | Skills reales, Python, Web, prepararse para el futuro |

**Perfil del estudiante ideal:**
- Le gustan los videojuegos
- Tiene curiosidad por cómo funcionan las cosas
- Se aburre en el colegio pero no es "mal estudiante"
- Quiere aprender pero no de forma tradicional

**Perfil del padre que paga:**
- Quiere que su hijo aprenda tecnología/matemática
- Busca algo más que "clases particulares"
- Valora que su hijo esté motivado, no obligado
- Preocupado por el futuro laboral de su hijo

### 1.6 Diferenciador vs Competencia

| Competidor | Su enfoque | Nuestro diferenciador |
|------------|------------|----------------------|
| **Udemy/Coursera** | Videos pasivos, certificados | Experiencias interactivas, gamificación, multiplayer |
| **Khan Academy** | Ejercicios + videos, gratis | Simulaciones de calidad, casas, competencia social |
| **FreeCodeCamp** | Solo programación, individual | STEAM completo, social, adaptado a edad |
| **Platzi** | Adultos, carreras tech | Niños y adolescentes, juego + aprendizaje |
| **Academias locales** | Clases por Zoom, horarios fijos | Asincrónico + campus virtual, aprende cuando quieras |

**Lo que NADIE más tiene:**
- Campus virtual 2D donde ves a otros estudiantes en tiempo real (Phaser + Colyseus)
- Sistema de casas por edad con competencia interna (Quantum, Vertex, Pulsar)
- Simulaciones educativas de alta calidad integradas en el flujo
- Sistema anti-frustración que te baja de nivel sin humillarte

### 1.7 Resultados Esperados en Estudiantes

| Casa | Resultado esperado |
|------|-------------------|
| **Quantum (6-9)** | Desarrollar pensamiento lógico, curiosidad por STEAM, bases de programación con Scratch |
| **Vertex (10-12)** | Crear proyectos propios (juegos Roblox, apps simples), competir en olimpiadas escolares |
| **Pulsar (13-17)** | Skills reales de programación (Python, Web), portfolio de proyectos, preparación para universidad/trabajo |

### 1.8 Visión a 5 años

**2025:** Lanzamiento modelo 2026, 500 estudiantes activos
**2026:** Expansión presencial en Neuquén, 2.000 estudiantes
**2027:** Expansión a otras provincias de Argentina, 10.000 estudiantes
**2028:** Lanzamiento en Chile y Uruguay, 30.000 estudiantes
**2029:** Plataforma #1 de educación STEAM gamificada en LATAM, 100.000 estudiantes

### 1.9 El Norte

**Cuando un pibe entre a Mateatletas tiene que decir:**

> "Esto es como un juego, pero estoy aprendiendo posta"

**Cuando un padre vea a su hijo usando Mateatletas tiene que pensar:**

> "Está jugando... pero está aprendiendo. No lo voy a interrumpir."

## 2. TECNOLOGÍAS DEFINIDAS
- Frontend: Next.js (existente)
- Backend: NestJS (existente)
- Base de datos: PostgreSQL + Prisma (existente)
- Campus virtual: Phaser (2D) + Colyseus (multiplayer)
- Avatares: 2D (Phaser, NO Ready Player Me)
- Pagos: MercadoPago (existente)

## 3. EXPERIENCIA DEL ESTUDIANTE

### 3.1 Primera Vez (Onboarding)

El estudiante entra por primera vez DESPUÉS de que su padre pagó:

| Paso | Qué hace | Qué ve |
|------|----------|--------|
| 1. Bienvenida | Animación de entrada | "Bienvenido a Mateatletas" con su nombre |
| 2. Selección de Mundos | Elige qué quiere estudiar | Cards de Matemática, Programación, Ciencias (según tier) |
| 3. Test de Ubicación | Responde 10-15 preguntas por mundo | Preguntas adaptativas, barra de progreso |
| 4. Asignación de Casa | Ve su casa y nivel asignado | Animación épica: "Sos un VERTEX Intermedio" |
| 5. Crear Avatar | Personaliza su personaje 2D | Editor de avatar con opciones básicas |
| 6. Tutorial Campus | Recorre el campus virtual | Guía interactiva de cada zona |
| 7. Primera Actividad | Completa su primera misión | Actividad fácil para ganar primeros XP |

### 3.2 Día a Día (Loop Principal)

Cuando el estudiante entra normalmente:

```
ENTRAR A MATEATLETAS
│
▼
┌─────────────────────────────────────────┐
│           CAMPUS VIRTUAL                 │
│  (Ve su avatar, ve otros online)         │
│                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ GIMNASIO│ │  ARENA  │ │ TIENDA  │    │
│  │(planif.)│ │(diaria) │ │(comprar)│    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                          │
│  ┌─────────┐ ┌─────────┐                │
│  │  CASA   │ │ PERFIL  │                │
│  │(ranking)│ │(avatar) │                │
│  └─────────┘ └─────────┘                │
└─────────────────────────────────────────┘
```

### 3.3 Zonas del Campus

| Zona | Qué hace ahí | Frecuencia de uso |
|------|--------------|-------------------|
| **Gimnasio** | Ve sus planificaciones, completa actividades diarias | Todos los días |
| **Arena Diaria** | Cápsula de curiosidad/trivia del día | Todos los días (opcional) |
| **Arena Competencia** | Desafíos contra otros de su casa | Cuando quiera competir |
| **Tienda** | Compra items para avatar con monedas | Cuando tenga monedas |
| **Mi Casa** | Ve ranking de su casa, sus compañeros | Para ver progreso |
| **Perfil** | Edita avatar, ve logros, estadísticas | Ocasional |

### 3.4 Flujo de una Actividad

```
ESTUDIANTE ENTRA AL GIMNASIO
│
▼
Ve sus mundos activos
(Matemática / Programación / Ciencias)
│
▼
Elige un mundo
│
▼
Ve su planificación mensual
(22 actividades, 1 por día de semana)
│
▼
Ve cuáles completó ✅ y cuál es la de hoy 🔵
│
▼
Entra a la actividad del día
│
▼
┌─────────────────────────────────┐
│  TIPOS DE ACTIVIDAD:            │
│  • Simulación interactiva       │
│  • Video corto + quiz           │
│  • Desafío de código            │
│  • Problema matemático          │
│  • Experimento virtual          │
│  • Construcción de proyecto     │
└─────────────────────────────────┘
│
▼
Completa la actividad
│
▼
RECOMPENSAS:
+50 XP (personal)
+10 puntos (para su casa)
+5 monedas (para tienda)
Posible logro desbloqueado 🏆
```

### 3.5 Sistema de Progreso

| Elemento | Qué es | Para qué sirve |
|----------|--------|----------------|
| **XP** | Puntos de experiencia personal | Subir de nivel (1-50) |
| **Nivel** | Tu nivel dentro de la plataforma | Desbloquear contenido, prestigio |
| **Monedas** | Divisa virtual | Comprar items en la tienda |
| **Puntos de Casa** | Puntos que sumás a tu casa | Ranking de la casa |
| **Racha** | Días consecutivos completando actividad | Bonus de XP, logros especiales |
| **Logros** | Achievements por acciones específicas | Colección, XP bonus |

### 3.6 Motivadores Diarios

| Motivador | Cómo funciona |
|-----------|---------------|
| **Racha** | Días seguidos = multiplicador de XP. Perder racha duele. |
| **Arena Diaria** | Contenido nuevo cada día, curiosidad, fácil de completar |
| **Ranking de Casa** | Ver tu posición vs compañeros de casa |
| **Actividad del día** | Solo 1 actividad obligatoria, no abruma |
| **Notificación** | "¡Tu racha está en riesgo!" si no entraste |

### 3.7 Reglas de Planificación

| Regla | Descripción |
|-------|-------------|
| 22 actividades/mes | 1 por día de semana (lunes a viernes) |
| No adelantarse | No puede hacer la de mañana hoy |
| Puede atrasarse | Si no hizo la de ayer, la puede hacer después |
| Fines de semana | Solo Arena Diaria + recuperar atrasadas |
| Orden secuencial | Las actividades están diseñadas en orden pedagógico |

### 3.8 Experiencia por Casa

| Casa | Experiencia particular |
|------|------------------------|
| **Quantum (6-9)** | Más visual, más juego, menos texto, feedback inmediato, celebraciones exageradas |
| **Vertex (10-12)** | Más construcción, proyectos, Roblox/Scratch, competencias, logros |
| **Pulsar (13-17)** | Más profesional, código real, proyectos portfolio, preparación laboral |

### 3.9 Qué NO ve el Estudiante

- ❌ Estudiantes de otras casas (cada casa es un mundo separado)
- ❌ Su nivel de pago (ARCADE/ARCADE+/PRO) - no hay diferencia visible
- ❌ Información de sus padres/tutor
- ❌ Panel de administración
- ❌ Métricas de negocio

## 4. EXPERIENCIA DEL PADRE/TUTOR

### 4.1 Rol del Padre/Tutor

El padre/tutor es quien:
- Paga la suscripción
- Inscribe a sus hijos
- Monitorea el progreso
- Recibe reportes
- Gestiona la cuenta familiar

**NO es quien:**
- ❌ Hace las actividades
- ❌ Ve el campus virtual
- ❌ Interactúa con otros estudiantes
- ❌ Accede al contenido educativo directamente

### 4.2 Flujo de Inscripción

```
PADRE LLEGA A LANDING
│
▼
Ve demo jugable (simulación)
"Mirá lo que tu hijo puede aprender"
│
▼
Ve los 3 tiers (ARCADE / ARCADE+ / PRO)
│
▼
Elige tier + cantidad de hijos
│
▼
Completa datos del tutor
(nombre, email, teléfono, DNI)
│
▼
Completa datos de cada hijo
(nombre, edad, email del estudiante)
│
▼
Paga con MercadoPago
│
▼
CONFIRMACIÓN:
- Email al tutor con credenciales
- Email a cada hijo con su acceso
- Acceso inmediato al portal
```

### 4.3 Portal del Tutor

| Sección | Qué ve | Qué puede hacer |
|---------|--------|-----------------|
| **Dashboard** | Resumen de todos sus hijos | Ver actividad reciente de cada uno |
| **Hijos** | Lista de estudiantes inscriptos | Ver detalle de cada uno |
| **Progreso** | Estadísticas por hijo | Ver actividades completadas, racha, nivel |
| **Reportes** | Reportes mensuales | Descargar PDF con progreso |
| **Membresía** | Su plan actual, próximo cobro | Cambiar tier, cancelar, agregar hijo |
| **Pagos** | Historial de pagos | Ver facturas, descargar comprobantes |
| **Cuenta** | Sus datos personales | Editar email, teléfono, contraseña |

### 4.4 Dashboard del Tutor

```
┌─────────────────────────────────────────────────────────┐
│  Hola, [Nombre del Tutor]                               │
│  Plan: ARCADE+ | Próximo cobro: 15/01/2026              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MIS HIJOS:                                             │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │ 🌟 Martina (8) - QUANTUM Intermedio      │          │
│  │    Racha: 🔥 12 días                      │          │
│  │    Hoy: ✅ Completó actividad             │          │
│  │    Nivel: 5 | XP: 1,250                   │          │
│  └──────────────────────────────────────────┘          │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │ 🚀 Tomás (11) - VERTEX Avanzado          │          │
│  │    Racha: 🔥 5 días                       │          │
│  │    Hoy: ⏳ Pendiente                      │          │
│  │    Nivel: 12 | XP: 4,850                  │          │
│  └──────────────────────────────────────────┘          │
│                                                         │
│  [+ Agregar otro hijo]                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.5 Vista de Progreso por Hijo

| Métrica | Qué muestra |
|---------|-------------|
| **Racha actual** | Días consecutivos de actividad |
| **Racha máxima** | Record histórico de racha |
| **Actividades completadas** | Este mes / Total histórico |
| **Nivel actual** | Nivel 1-50 + barra de progreso |
| **Casa y nivel interno** | Ej: "Vertex Avanzado" |
| **Mundos activos** | Matemática, Programación, Ciencias |
| **Logros recientes** | Últimos 5 logros desbloqueados |
| **Posición en ranking** | Puesto en su casa |

### 4.6 Reportes Mensuales

El tutor recibe automáticamente un reporte mensual por email con:

| Sección del reporte | Contenido |
|---------------------|-----------|
| **Resumen** | Actividades completadas, días activo, racha promedio |
| **Progreso por mundo** | Avance en Matemática, Programación, Ciencias |
| **Logros del mes** | Nuevos logros desbloqueados |
| **Comparativa** | vs mes anterior (mejoró/empeoró) |
| **Recomendaciones** | "Tomás podría beneficiarse de más práctica en fracciones" |

**Formato:** PDF descargable + vista web

**Solo para PRO:** Reporte semanal + llamada mensual con docente

### 4.7 Gestión de Membresía

| Acción | Cómo funciona |
|--------|---------------|
| **Subir de tier** | Inmediato, paga diferencia prorrateada |
| **Bajar de tier** | Aplica próximo mes, no hay reembolso |
| **Agregar hijo** | Paga proporcional al plan actual |
| **Quitar hijo** | Aplica próximo mes |
| **Cancelar** | Acceso hasta fin del período pagado |
| **Pausar** | No disponible (cancela y vuelve a inscribir) |

### 4.8 Descuentos Familiares

| Cantidad de hijos | Descuento |
|-------------------|-----------|
| 1 hijo | 0% (precio normal) |
| 2 hijos | 10% en el total |
| 3+ hijos | 15% en el total |

### 4.9 Notificaciones al Tutor

| Evento | Notificación |
|--------|--------------|
| Hijo completó actividad | ❌ No (sería spam) |
| Hijo perdió racha de 7+ días | ✅ Email: "La racha de Martina se cortó" |
| Hijo subió de nivel | ✅ Email: "¡Tomás subió a nivel 15!" |
| Hijo lleva 3+ días sin entrar | ✅ Email: "Hace 3 días que Martina no entra" |
| Reporte mensual listo | ✅ Email con PDF adjunto |
| Pago exitoso | ✅ Email con comprobante |
| Pago fallido | ✅ Email + WhatsApp urgente |
| Renovación próxima (5 días) | ✅ Email recordatorio |

### 4.10 Qué NO ve el Tutor

- ❌ El campus virtual (eso es del estudiante)
- ❌ El contenido de las actividades en detalle
- ❌ Los chats o interacciones del hijo
- ❌ Otros estudiantes o sus datos
- ❌ Panel de administración

## 5. EXPERIENCIA DEL DOCENTE

### 5.1 Rol del Docente en 2026

**IMPORTANTE:** El modelo 2026 prioriza contenido asincrónico. Los docentes NO son el centro de la experiencia.

| Tier | Rol del docente |
|------|-----------------|
| **ARCADE** | ❌ Sin docente. 100% asincrónico. |
| **ARCADE+** | ❌ Sin docente. 100% asincrónico. |
| **PRO** | ✅ Clases en vivo semanales + seguimiento personalizado. |

### 5.2 Qué hace un Docente (solo PRO)

| Tarea | Frecuencia | Descripción |
|-------|------------|-------------|
| **Clases en vivo** | 1x semana | Clase grupal por mundo (Mate/Progra/Ciencias) |
| **Revisión de proyectos** | Según demanda | Feedback en proyectos entregados |
| **Seguimiento individual** | 1x mes | Llamada/mensaje personalizado con estudiantes asignados |
| **Reportes a tutores** | 1x mes | Feedback cualitativo para el reporte PRO |
| **Responder dudas** | Diario | Consultas de estudiantes PRO en su mundo |

### 5.3 Qué NO hace un Docente

- ❌ Crear contenido (eso lo hace el Admin/Alexis)
- ❌ Corregir actividades asincrónicas (automático)
- ❌ Gestionar pagos o inscripciones
- ❌ Interactuar con estudiantes ARCADE/ARCADE+
- ❌ Acceder al campus virtual como avatar

### 5.4 Portal del Docente

| Sección | Qué ve | Qué puede hacer |
|---------|--------|-----------------|
| **Dashboard** | Resumen de sus estudiantes PRO | Ver actividad reciente |
| **Mis Estudiantes** | Lista de estudiantes PRO asignados | Ver progreso individual |
| **Clases** | Calendario de clases en vivo | Programar, iniciar, ver grabaciones |
| **Dudas** | Consultas pendientes de estudiantes | Responder, marcar resuelta |
| **Proyectos** | Proyectos entregados para revisar | Dar feedback, calificar |
| **Reportes** | Generar feedback para tutores | Escribir comentarios mensuales |

### 5.5 Dashboard del Docente

```
┌─────────────────────────────────────────────────────────┐
│  Hola, [Nombre del Docente]                             │
│  Mundo: Programación | Estudiantes PRO: 24              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📅 PRÓXIMA CLASE:                                      │
│  Viernes 10/01 - 18:00hs                                │
│  "Python: Funciones y parámetros"                       │
│  [Iniciar clase] [Ver asistentes]                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠️ REQUIERE ATENCIÓN:                                  │
│  • 3 dudas sin responder                                │
│  • 2 proyectos pendientes de revisión                   │
│  • 1 estudiante sin actividad hace 7 días               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 ESTA SEMANA:                                        │
│  • 18/24 estudiantes activos                            │
│  • 45 actividades completadas                           │
│  • 1 clase dictada (85% asistencia)                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.6 Gestión de Clases en Vivo

| Aspecto | Detalle |
|---------|---------|
| **Plataforma** | Google Meet / Zoom integrado |
| **Duración** | 45-60 minutos |
| **Frecuencia** | 1x por semana por grupo |
| **Grabación** | Automática, disponible para estudiantes PRO |
| **Asistencia** | Registro automático |
| **Material** | Subido previamente por el docente |

**Flujo de clase:**

```
DOCENTE PROGRAMA CLASE
│
▼
Sistema notifica a estudiantes PRO
│
▼
Día de la clase: docente inicia desde el portal
│
▼
Estudiantes entran desde su portal
│
▼
Clase se graba automáticamente
│
▼
Grabación disponible en 24hs
```

### 5.7 Sistema de Dudas

| Estado | Significado |
|--------|-------------|
| 🔴 Nueva | Estudiante envió, docente no vio |
| 🟡 Vista | Docente vio, no respondió |
| 🟢 Resuelta | Docente respondió |
| ⚫ Cerrada | Estudiante confirmó que se resolvió |

**SLA esperado:** Responder en menos de 24 horas hábiles.

### 5.8 Revisión de Proyectos

Solo para estudiantes PRO que entregan proyectos (principalmente Programación):

| Campo | Descripción |
|-------|-------------|
| **Proyecto** | Link al código/archivo entregado |
| **Consigna** | Qué se pedía |
| **Feedback** | Texto libre del docente |
| **Calificación** | ⭐ 1-5 estrellas (opcional) |
| **XP Bonus** | Docente puede dar XP extra por mérito |

### 5.9 Asignación de Docentes

| Criterio | Cómo se asigna |
|----------|----------------|
| **Por mundo** | Cada docente es especialista en 1 mundo |
| **Por casa** | Un docente atiende 1 o más casas del mismo mundo |
| **Por cantidad** | Máximo 30 estudiantes PRO por docente |

**Ejemplo:**
- Docente A: Programación Vertex + Programación Pulsar (25 estudiantes)
- Docente B: Matemática Vertex + Matemática Pulsar (28 estudiantes)
- Docente C: Ciencias (todas las casas) (15 estudiantes)

### 5.10 Métricas del Docente

El admin ve estas métricas por docente:

| Métrica | Qué mide |
|---------|----------|
| **Tiempo de respuesta** | Promedio de horas para responder dudas |
| **Asistencia a clases** | % de estudiantes que asisten a sus clases |
| **Proyectos revisados** | Cantidad y tiempo promedio de revisión |
| **Satisfacción** | Rating de estudiantes (post-clase) |
| **Retención** | % de sus estudiantes que renuevan |

### 5.11 Qué NO ve el Docente

- ❌ Estudiantes ARCADE o ARCADE+ (solo PRO)
- ❌ Información de pagos o membresías
- ❌ Datos de los tutores/padres
- ❌ Otros docentes o sus estudiantes
- ❌ Panel de administración completo
- ❌ Contenido de otros mundos

## 6. SISTEMA DE TIERS
- **ARCADE ($30.000/mes)**: 1 mundo, sin clases en vivo
- **ARCADE+ ($60.000/mes)**: 2 mundos, sin clases en vivo
- **PRO ($75.000/mes)**: 3 mundos, clases en vivo con docente

## 7. SISTEMA DE CASAS

### 7.1 Estructura de Casas

Mateatletas tiene 3 casas organizadas por edad base, pero con flexibilidad según nivel real del estudiante.

| Casa | Edad Base | Descripción | Core |
|------|-----------|-------------|------|
| 🌟 **QUANTUM** | 6-9 años | Los exploradores. Todo es nuevo y mágico. Descubren el mundo del conocimiento. | Descubrimiento |
| 🚀 **VERTEX** | 10-12 años | Los constructores. Creativos, builders, les gusta crear cosas. | Construcción |
| ⚡ **PULSAR** | 13-17 años | Los dominadores. Ambiciosos, quieren skills reales, crear apps, competir. | Dominio |

### 7.2 Niveles Internos por Casa y Mundo

Cada casa tiene niveles internos para el contenido asincrónico:

| Casa | Matemática | Programación | Ciencias |
|------|------------|--------------|----------|
| **Quantum** | Básico, Intermedio, Avanzado | Básico, Intermedio, Avanzado | Básico, Intermedio, Avanzado |
| **Vertex** | Básico, Intermedio, Avanzado, Olímpico | Básico, Intermedio, Avanzado, Olímpico | Básico, Intermedio, Avanzado |
| **Pulsar** | Básico, Intermedio, Avanzado, Olímpico | Básico, Intermedio, Avanzado, Olímpico | Básico, Intermedio, Avanzado |

**Notas:**
- Olímpico solo existe en Matemática y Programación
- Olímpico solo disponible para Vertex (10-12) y Pulsar (13-17)
- Ciencias tiene máximo nivel Avanzado en todas las casas

### 7.3 Reglas de Ubicación

**Regla principal:** La edad determina tu casa BASE, pero el test puede BAJARTE si no tenés el nivel.

| Edad | Casa por defecto | ¿Puede bajar? |
|------|------------------|---------------|
| 6-9 | Quantum | No (ya es la base) |
| 10-12 | Vertex | Sí → a Quantum |
| 13-17 | Pulsar | Sí → a Vertex (nunca a Quantum) |

**Regla anti-frustración:** NO podés SUBIR de casa por ser crack. Un pibe de 8 años aunque sea genio sigue en Quantum (pero en nivel Avanzado dentro de Quantum).

**Cuando un estudiante baja de casa:** Entra al nivel ALTO de esa casa (no al básico). Un pibe de 11 que baja a Quantum no va con los de nivel Básico, va con los Avanzados de Quantum.

### 7.4 Ejemplos de Ubicación

| Estudiante | Resultado Test | Ubicación Final |
|------------|----------------|-----------------|
| 8 años, nivel normal | Medio | Quantum Intermedio |
| 8 años, muy crack | Alto | Quantum Avanzado |
| 11 años, nivel normal | Medio | Vertex Intermedio |
| 11 años, muy bajo | Bajo | Quantum Avanzado (baja de casa) |
| 15 años, nivel normal | Medio | Pulsar Intermedio |
| 15 años, nivel bajo | Bajo | Vertex Intermedio (baja de casa) |
| 15 años, muy bajo | Muy bajo | Vertex Básico (máximo que puede bajar) |

### 7.5 Mundos por Casa

| Casa | Matemática | Programación | Ciencias |
|------|------------|--------------|----------|
| **Quantum** | Básica (números, operaciones) | Scratch | Experimentos simples |
| **Vertex** | Base + Lógica + Olímpica | Scratch, Roblox, Python básico + Olímpica | Ciencias intermedias |
| **Pulsar** | Opcional (puede ser olímpica) | **CORE:** Python, Web, Apps + Olímpica | Opcional |

**Pulsar es programación-first:** Los adolescentes de 13-17 quieren cosas reales. Programación es el core, Matemática y Ciencias son complementarios/opcionales.

### 7.6 Competencia

**NO hay competencia entre casas.** Es absurdo hacer competir a un Pulsar de 16 años contra un Quantum de 7.

**La competencia es INTERNA por casa:**
- 🏆 Ranking Quantum (compiten entre Quantums)
- 🏆 Ranking Vertex (compiten entre Vertex)
- 🏆 Ranking Pulsar (compiten entre Pulsar)

Cada casa tiene sus propios rankings semanales/mensuales, eventos especiales y torneos internos.

### 7.7 Movilidad entre Casas

| Acción | ¿Es posible? | Detalle |
|--------|--------------|---------|
| Subir de nivel interno | ✅ Sí | Automático si el rendimiento es bueno |
| Subir de casa | ❌ No | La edad es límite superior |
| Bajar de nivel interno | ✅ Sí | Si se frustra o el rendimiento baja |
| Bajar de casa | ✅ Sí | Si el nivel es muy bajo (Pulsar solo a Vertex, Vertex a Quantum) |
| Cambiar de casa voluntariamente | ✅ Sí | Requiere nuevo test |

**Al cambiar de casa:**
- Conserva: XP, monedas, logros, nivel personal
- NO conserva: puntos aportados al ranking de la casa anterior

### 7.8 Design System - Colores (Paleta Profesional/Tech)

**Quantum 🌟**
- Primary: #F472B6
- Secondary: #F9A8D4
- Accent: #FCE7F3
- Dark: #DB2777
- Gradient: linear-gradient(135deg, #F472B6 0%, #FB923C 100%)

**Vertex 🚀**
- Primary: #38BDF8
- Secondary: #7DD3FC
- Accent: #E0F2FE
- Dark: #0284C7
- Gradient: linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)

**Pulsar ⚡**
- Primary: #6366F1
- Secondary: #8B5CF6
- Accent: #6C7086
- Dark: #11111B
- Gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)

## 8. SISTEMA DE MUNDOS
- **Matemática**
- **Programación**
- **Ciencias**

## 9. ONBOARDING

### 9.1 Flujo Completo

El onboarding ocurre DESPUÉS de que el padre paga. Primera vez que el estudiante entra:

1. **Selección de Mundo(s)** → Elige qué quiere estudiar (según su tier)
2. **Test de Ubicación** → Determina casa y nivel interno
3. **Confirmación de Casa** → Ve su casa asignada
4. **Crear Avatar 2D** → Personalización para el campus virtual

### 9.2 Test de Ubicación

El test determina 2 cosas:
1. **Casa** → Confirma la casa por edad o te baja si no das el nivel
2. **Nivel interno** → Básico, Intermedio, Avanzado u Olímpico

**Características del test:**
- Adaptativo (10-15 preguntas por mundo)
- Específico por mundo (Matemática, Programación, Ciencias)
- Mide: conocimiento previo + razonamiento
- Un estudiante puede tener diferentes niveles por mundo

**Reglas anti-frustración:**
- En límites dudosos, va al nivel INFERIOR (mejor que suba motivado a que baje frustrado)
- Al bajar de casa, entra al nivel ALTO de la nueva casa
- Retest permitido después de 7 días si el estudiante siente que le fue mal

**PENDIENTE:** Diseñar algoritmo detallado del test de ubicación.

### 9.3 Creación de Avatar

Después del test, el estudiante crea su avatar 2D:
- Personalización de apariencia
- Selección de ropa y accesorios básicos
- Items premium se compran en la tienda con monedas
- El avatar se usa en el Campus Virtual (Phaser)

## 10. CAMPUS VIRTUAL (Phaser + Colyseus)

### 10.1 Qué es el Campus Virtual [MOCK - PENDIENTE DISEÑO ORIGINAL]

El campus virtual es un mundo 2D donde los estudiantes:
- Ven su avatar caminando
- Ven a otros estudiantes de su casa en tiempo real
- Acceden a las distintas zonas (Gimnasio, Arena, Tienda, etc.)
- Sienten que están en un "lugar" y no en una página web

**Tecnologías:**
- **Phaser 3:** Motor de juegos 2D para el cliente
- **Colyseus:** Servidor multiplayer para sincronización en tiempo real
- **Next.js:** Contenedor web que hostea el juego

### 10.2 Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Next.js)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │              PHASER 3 (Canvas)                   │    │
│  │  • Renderiza el mapa                            │    │
│  │  • Renderiza avatares                           │    │
│  │  • Maneja input del jugador                     │    │
│  │  • Animaciones y efectos                        │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│                          │ WebSocket                     │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              COLYSEUS CLIENT                     │    │
│  │  • Sincroniza posición                          │    │
│  │  • Recibe updates de otros jugadores            │    │
│  │  • Maneja estado compartido                     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           │ WebSocket (wss://)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 SERVIDOR COLYSEUS                        │
│  • Una room por casa (QuantumRoom, VertexRoom, etc.)    │
│  • Sincroniza posiciones de todos los jugadores         │
│  • Valida movimientos                                   │
│  • Broadcast de eventos                                 │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Mapa del Campus

El campus tiene zonas conectadas. El estudiante camina entre ellas:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ┌─────────┐                          │
│                    │ PORTAL  │                          │
│                    │ ENTRADA │                          │
│                    └────┬────┘                          │
│                         │                               │
│          ┌──────────────┼──────────────┐               │
│          │              │              │               │
│     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐         │
│     │GIMNASIO │    │  PLAZA  │    │  ARENA  │         │
│     │         │    │ CENTRAL │    │ DIARIA  │         │
│     └─────────┘    └────┬────┘    └─────────┘         │
│                         │                               │
│          ┌──────────────┼──────────────┐               │
│          │              │              │               │
│     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐         │
│     │ TIENDA  │    │ MI CASA │    │ PERFIL  │         │
│     │         │    │(ranking)│    │         │         │
│     └─────────┘    └─────────┘    └─────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 10.4 Zonas y Funcionalidad

| Zona | Qué hace el estudiante | Implementación |
|------|------------------------|----------------|
| **Portal/Entrada** | Spawn inicial, ve bienvenida | Escena Phaser + UI overlay |
| **Plaza Central** | Camina, ve otros estudiantes, socializa | Escena Phaser multiplayer |
| **Gimnasio** | Accede a planificaciones, hace actividades | Transición a UI Next.js |
| **Arena Diaria** | Completa la cápsula del día | Transición a UI Next.js |
| **Tienda** | Compra items para avatar | Transición a UI Next.js |
| **Mi Casa** | Ve ranking de su casa, compañeros | Transición a UI Next.js |
| **Perfil** | Edita avatar, ve logros | Transición a UI Next.js |

### 10.5 Separación por Casa

**CRÍTICO:** Cada casa tiene su propia instancia del campus. NO se mezclan.

| Casa | Room Colyseus | Quién ve a quién |
|------|---------------|------------------|
| Quantum | `quantum-room` | Solo Quantums ven a otros Quantums |
| Vertex | `vertex-room` | Solo Vertex ven a otros Vertex |
| Pulsar | `pulsar-room` | Solo Pulsar ven a otros Pulsar |

**Motivo:**
- Evitar que un Pulsar de 16 interactúe con un Quantum de 7
- Cada casa es una comunidad separada
- Estética/tema puede variar por casa

### 10.6 Avatar 2D

| Aspecto | Detalle |
|---------|---------|
| **Estilo** | Pixel art o cartoon simple (definir) |
| **Tamaño** | 32x32 o 64x64 pixels |
| **Animaciones** | Idle, caminar (4 direcciones), celebrar |
| **Personalización** | Pelo, piel, ropa, accesorios |
| **Items comprables** | Sombreros, mascotas, efectos, colores especiales |

**Editor de avatar:**
- Se accede desde Perfil o en Onboarding
- Opciones básicas gratis
- Items premium con monedas
- Preview en tiempo real

### 10.7 Movimiento y Sincronización

```
JUGADOR PRESIONA TECLA (WASD o flechas)
│
▼
Cliente Phaser mueve avatar localmente (inmediato)
│
▼
Cliente envía nueva posición a Colyseus
│
▼
Servidor valida movimiento (anti-cheat básico)
│
▼
Servidor hace broadcast a todos en la room
│
▼
Otros clientes reciben y actualizan posición del jugador
```

**Interpolación:** Los otros jugadores se mueven suavemente (lerp) para evitar saltos.

### 10.8 Interacciones en el Campus

| Interacción | Cómo funciona |
|-------------|---------------|
| **Caminar** | WASD o flechas, click to move opcional |
| **Entrar a zona** | Caminar hasta la puerta/portal, aparece prompt "Entrar" |
| **Ver otro jugador** | Acercarse muestra nombre y nivel |
| **Emotes** | Teclas 1-9 para emotes rápidos (saludar, bailar, etc.) |
| **Chat** | ❌ NO por ahora (moderar menores es complejo) |

### 10.9 Estados de Presencia

| Estado | Visual | Significado |
|--------|--------|-------------|
| 🟢 Online | Avatar visible caminando | Está en el campus ahora |
| 🟡 En actividad | Avatar con indicador | Está haciendo una actividad |
| ⚫ Offline | No aparece | No está conectado |

### 10.10 Performance y Límites

| Aspecto | Límite | Motivo |
|---------|--------|--------|
| **Jugadores por room** | Máximo 50 simultáneos | Performance del servidor |
| **Tick rate** | 20 updates/segundo | Balance latencia/bandwidth |
| **Tamaño del mapa** | 1920x1080 viewport, mapa más grande con scroll | UX en diferentes pantallas |
| **Sprites cargados** | Lazy loading por zona | Memoria del cliente |

**Si hay más de 50 online en una casa:** Se crean sub-rooms automáticas (quantum-room-1, quantum-room-2).

### 10.11 Transiciones Campus ↔ UI

Cuando el estudiante entra a una zona funcional (Gimnasio, Tienda, etc.):

```
ESTUDIANTE EN CAMPUS (Phaser)
│
▼
Camina hasta puerta del Gimnasio
│
▼
Presiona "Entrar" (o colisiona con trigger)
│
▼
Fade out del canvas Phaser
│
▼
Se muestra UI de Next.js (Gimnasio)
│
▼
Conexión Colyseus se mantiene (estado "En actividad")
│
▼
Estudiante hace actividades en UI normal
│
▼
Presiona "Volver al campus"
│
▼
Fade in del canvas Phaser
│
▼
Avatar reaparece en la puerta del Gimnasio
```

### 10.12 Assets Necesarios

| Tipo | Cantidad estimada | Descripción |
|------|-------------------|-------------|
| **Tileset** | 1-3 por casa | Piso, paredes, decoración |
| **Edificios** | 6-8 | Gimnasio, Arena, Tienda, etc. |
| **Avatares base** | 1 spritesheet | Con variaciones de color |
| **Items avatar** | 20-50 iniciales | Pelos, ropas, accesorios |
| **Efectos** | 5-10 | Partículas, brillos, emotes |
| **UI elementos** | 10-15 | Botones, prompts, indicadores |

### 10.13 Implementación Técnica

**Estructura de carpetas sugerida:**

```
/apps/web/src/
├── game/
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── CampusScene.ts
│   │   ├── UIScene.ts (overlay)
│   ├── entities/
│   │   ├── Player.ts
│   │   ├── OtherPlayer.ts
│   │   ├── NPC.ts (opcional)
│   ├── network/
│   │   ├── ColyseusClient.ts
│   │   ├── RoomState.ts
│   ├── ui/
│   │   ├── Minimap.ts
│   │   ├── PlayerInfo.ts
│   ├── assets/
│   │   ├── sprites/
│   │   ├── tilemaps/
│   └── config/
│       └── GameConfig.ts

/apps/api/src/
├── colyseus/
│   ├── rooms/
│   │   ├── CampusRoom.ts
│   │   ├── QuantumRoom.ts
│   │   ├── VertexRoom.ts
│   │   ├── PulsarRoom.ts
│   ├── schema/
│   │   ├── PlayerState.ts
│   │   ├── RoomState.ts
│   └── colyseus.module.ts
```

### 10.14 MVP del Campus

**Para vender en diciembre, el MVP mínimo incluye:**

| Feature | Prioridad | Estado |
|---------|-----------|--------|
| Mapa básico con zonas | 🔴 Crítico | Pendiente |
| Avatar básico (sin items) | 🔴 Crítico | Pendiente |
| Movimiento WASD | 🔴 Crítico | Pendiente |
| Ver otros jugadores | 🔴 Crítico | Pendiente |
| Entrar/salir de zonas | 🔴 Crítico | Pendiente |
| Rooms por casa | 🔴 Crítico | Pendiente |
| Emotes | 🟡 Deseable | Pendiente |
| Items comprables | 🟡 Deseable | Pendiente |
| Efectos especiales | 🟢 Opcional | Pendiente |
| Mascotas | 🟢 Opcional | Pendiente |

## 11. PLANIFICACIONES
- 22 actividades por mes (1 por día de semana)
- No puede adelantarse
- Puede atrasarse y recuperar
- Fines de semana: Arena Diaria + ponerse al día

## 12. ARENA DIARIA
- Cápsula de contenido rotativo diario
- Curiosidad/trivia/dato interesante
- Gancho para entrar todos los días
- No es evaluativo

## 13. QUÉ NO SE TOCA
- Sistema de pagos MercadoPago
- Autenticación multi-rol
- Colonia de verano
- Inscripciones 2026

## 14. REGLAS DE CÓDIGO (innegociables)
- ❌ PROHIBIDO: `any`, `unknown`, `@ts-ignore`
- ✅ Clean Architecture: Controller → Service → Repository
- ✅ TDD: test primero, código después
- ✅ SOLID
- ✅ DTOs con validación
- ✅ Código encapsulado y modular

## 15. OBJETIVO DICIEMBRE
Para vender en diciembre necesitamos:
- Landing con demo jugable (simulación educativa)
- Campus virtual funcionando (Phaser + Colyseus)
- Sistema de tiers visible
