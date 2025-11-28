# 🎯 PLAN DE DESARROLLO POR SLICES - MATEATLETAS CLUB

## 📐 Metodología de Slices

**Definición de Slice:** Conjunto cohesivo de tareas que entregan valor funcional completo, respetando dependencias técnicas y minimizando bloqueos entre equipos/desarrolladores.

**Principios:**

1. ✅ Cada slice es **desplegable** y **demostrable**
2. ✅ Dependencias técnicas resueltas primero
3. ✅ Valor incremental en cada entrega
4. ✅ Testing incluido en cada slice

---

## 🏗️ ARQUITECTURA DE SLICES (12 Slices)

### Orden de Ejecución

```
SLICE 1: Fundación Pública
    ↓
SLICE 2: Portal Estudiante Core
    ↓
SLICE 3: Experiencia de Clase Base
    ↓
SLICE 4: Portal Tutor Mejorado
    ↓
SLICE 5: Herramientas Docente Avanzadas
    ↓
SLICE 6: Evaluación Diagnóstica
    ↓
SLICE 7: Gamificación Visual
    ↓
SLICE 8: Comunicación Interna
    ↓
SLICE 9: Panel Admin Completo
    ↓
SLICE 10: Tiempo Real y WebSockets
    ↓
SLICE 11: Automatización y Cron Jobs
    ↓
SLICE 12: Inteligencia Artificial
```

---

# 🚀 SLICE 1: FUNDACIÓN PÚBLICA

**Objetivo:** Permitir que visitantes se enteren, inscriban y paguen.

**Duración estimada:** 1 semana (5 días)

**Prioridad:** 🔴 CRÍTICA

## Tareas Incluidas (4)

| ID   | Tarea                                      | Instancia | Días |
| ---- | ------------------------------------------ | --------- | ---- |
| T001 | Landing Page Pública                       | PÚBLICO   | 2    |
| T002 | Formulario de Registro/Inscripción Público | PÚBLICO   | 2    |
| T067 | Integración Pago → Activación Automática   | SISTEMA   | 1    |
| T068 | Mostrar Cupos Disponibles en Frontend      | SISTEMA   | 0.5  |

## Entregables

✅ Landing page atractiva (`/`) con información del club
✅ Formulario multi-step de inscripción (`/inscripcion`)
✅ Selección de grupo con cupos visibles
✅ Pago con MercadoPago
✅ Activación automática post-pago
✅ Email de confirmación

## Dependencias Técnicas

- ✅ Backend de pagos ya existe (completado)
- ✅ Backend de membresías ya existe (completado)
- ⚠️ Mejorar webhook de MercadoPago

## Testing

- [ ] Test E2E: Registro completo
- [ ] Test E2E: Pago y activación
- [ ] Test visual: Landing responsive

---

# 👦 SLICE 2: PORTAL ESTUDIANTE CORE

**Objetivo:** Estudiante puede entrar, ver su dashboard y su progreso básico.

**Duración estimada:** 1.5 semanas (7 días)

**Prioridad:** 🔴 CRÍTICA

## Tareas Incluidas (7)

| ID   | Tarea                                     | Instancia          | Días |
| ---- | ----------------------------------------- | ------------------ | ---- |
| T016 | Portal Completo del Estudiante            | ESTUDIANTE         | 2    |
| T017 | Sistema de Avatares Personalizables       | ESTUDIANTE         | 1    |
| T018 | Tablero de Actividades con Cards          | ESTUDIANTE         | 1    |
| T019 | Animación de Bienvenida Personalizada     | ESTUDIANTE         | 0.5  |
| T033 | Sistema de Niveles con Nombres Creativos  | ESTUDIANTE         | 1    |
| T034 | Notificación y Animación de Level-Up      | ESTUDIANTE         | 1    |
| T015 | Visualización de Insignias y Gamificación | TUTOR (compartido) | 1    |

## Entregables

✅ Dashboard del estudiante (`/estudiante/dashboard`)
✅ Sistema de login con rol estudiante
✅ Avatar seleccionable y visible
✅ Cards: Evaluación, Clase de Hoy, Mis Logros
✅ Animación de bienvenida
✅ Sistema de niveles (Explorador Numérico, etc.)
✅ Animación de subida de nivel
✅ Galería de insignias visual

## Dependencias Técnicas

- ✅ Sistema de gamificación backend ya existe
- ⚠️ Crear tabla de configuración de niveles
- ⚠️ Integrar avatares (Dicebear API o galería custom)

## Testing

- [ ] Test E2E: Login como estudiante
- [ ] Test: Seleccionar avatar
- [ ] Test: Cambio de nivel
- [ ] Test visual: Animaciones

---

# 🎥 SLICE 3: EXPERIENCIA DE CLASE BASE

**Objetivo:** Estudiante y docente pueden entrar a clase en vivo.

**Duración estimada:** 1.5 semanas (7 días)

**Prioridad:** 🔴 CRÍTICA

## Tareas Incluidas (8)

| ID   | Tarea                                           | Instancia  | Días |
| ---- | ----------------------------------------------- | ---------- | ---- |
| T023 | Widget Próxima Clase con Countdown              | ESTUDIANTE | 1    |
| T024 | Botón Dinámico Entrar a Clase                   | ESTUDIANTE | 0.5  |
| T025 | Integración Videollamada con Auto-Join          | ESTUDIANTE | 2    |
| T041 | Integración Videollamadas + Tracking Conectados | DOCENTE    | 2    |
| T035 | Panel Detallado de Grupo                        | DOCENTE    | 1.5  |
| T080 | Registro Automático de Asistencia               | SISTEMA    | 1    |
| T044 | Asignación Rápida de Insignias Durante Clase    | DOCENTE    | 1    |
| T030 | Modal Resumen Post-Clase                        | ESTUDIANTE | 1    |

## Entregables

✅ Countdown hasta próxima clase
✅ Botón "Entrar a clase" que se activa a la hora
✅ Videollamada embebida (Jitsi Meet)
✅ Lista de estudiantes conectados (docente)
✅ Registro automático de asistencia via webhook
✅ Panel de grupo completo para docente
✅ Modal rápido para asignar insignias
✅ Resumen post-clase para estudiante

## Dependencias Técnicas

- ⚠️ Elegir plataforma de videollamada (recomendado: Jitsi Meet)
- ⚠️ Configurar webhooks de videollamada
- ✅ Backend de clases ya existe

## Testing

- [ ] Test E2E: Estudiante entra a clase
- [ ] Test E2E: Docente inicia clase
- [ ] Test: Registro de asistencia automático
- [ ] Test: Asignar insignia durante clase

---

# 👨‍👩‍👦 SLICE 4: PORTAL TUTOR MEJORADO

**Objetivo:** Tutor puede ver progreso del hijo y gestionar su suscripción.

**Duración estimada:** 1 semana (5 días)

**Prioridad:** 🟡 ALTA

## Tareas Incluidas (5)

| ID   | Tarea                                     | Instancia | Días |
| ---- | ----------------------------------------- | --------- | ---- |
| T003 | Widget de Bienvenida Personalizado        | TUTOR     | 1    |
| T004 | Panel de Progreso Detallado del Hijo      | TUTOR     | 2    |
| T005 | Vista de Suscripción y Pagos              | TUTOR     | 1.5  |
| T013 | Resumen Automático Post-Clase para Tutor  | TUTOR     | 1    |
| T081 | Generación Automática de Resumen de Clase | SISTEMA   | 1    |

## Entregables

✅ Widget de bienvenida con última actividad
✅ Página de progreso del hijo (`/dashboard/progreso/[estudianteId]`)
✅ Vista de suscripción con historial de pagos
✅ Notificación automática post-clase con métricas
✅ Pipeline backend de resumen de clase

## Dependencias Técnicas

- ✅ Sistema de pagos ya existe
- ⚠️ Crear vista de suscripción en frontend tutor
- ⚠️ Sistema de resumen requiere métricas de clase (T079)

## Testing

- [ ] Test E2E: Tutor ve progreso del hijo
- [ ] Test: Visualización de suscripción
- [ ] Test: Notificación post-clase

---

# 👩‍🏫 SLICE 5: HERRAMIENTAS DOCENTE AVANZADAS

**Objetivo:** Docente tiene herramientas completas para gestionar grupos.

**Duración estimada:** 1 semana (5 días)

**Prioridad:** 🟡 ALTA

## Tareas Incluidas (6)

| ID   | Tarea                                            | Instancia | Días |
| ---- | ------------------------------------------------ | --------- | ---- |
| T037 | Dashboard Estadísticas Docente Funcional         | DOCENTE   | 2    |
| T040 | Perfil Detallado del Estudiante                  | DOCENTE   | 1.5  |
| T046 | Modal de Cierre de Clase + Observaciones para IA | DOCENTE   | 1    |
| T047 | Dashboard Resultados Diagnósticos                | DOCENTE   | 1    |
| T036 | Enriquecer Notificaciones                        | DOCENTE   | 0.5  |
| T079 | Sistema de Métricas por Clase                    | SISTEMA   | 1    |

## Entregables

✅ Dashboard de reportes funcional (`/docente/reportes`)
✅ Perfil 360° del estudiante (`/docente/estudiante/[id]`)
✅ Modal post-clase con observaciones
✅ Vista de resultados diagnósticos
✅ Notificaciones enriquecidas con contexto
✅ Backend de métricas por clase

## Dependencias Técnicas

- ✅ Observaciones ya existen
- ⚠️ Crear sistema de métricas granulares

## Testing

- [ ] Test E2E: Docente ve reportes
- [ ] Test: Perfil de estudiante
- [ ] Test: Modal post-clase

---

# 📝 SLICE 6: EVALUACIÓN DIAGNÓSTICA

**Objetivo:** Sistema de evaluación inicial para detectar fortalezas/debilidades.

**Duración estimada:** 1.5 semanas (7 días)

**Prioridad:** 🔴 CRÍTICA

## Tareas Incluidas (6)

| ID   | Tarea                                       | Instancia  | Días |
| ---- | ------------------------------------------- | ---------- | ---- |
| T020 | Módulo de Evaluación Diagnóstica Gamificada | ESTUDIANTE | 2    |
| T021 | Algoritmo Adaptativo de Dificultad          | ESTUDIANTE | 2    |
| T022 | Análisis Automático de Resultados + Envío   | ESTUDIANTE | 1.5  |
| T038 | Test de Rendimiento Inicial (Vista Docente) | DOCENTE    | 1    |
| T039 | Gráficos de Fortalezas/Debilidades          | DOCENTE    | 1.5  |
| T008 | Gráficas de Progreso por Competencias       | TUTOR      | 1    |

## Entregables

✅ Test diagnóstico gamificado (`/estudiante/evaluacion`)
✅ Algoritmo de dificultad adaptativa
✅ Análisis automático y perfil de aprendizaje
✅ Notificación automática a docente y admin
✅ Vista de resultados para docente
✅ Gráficos de radar por competencias
✅ Visualización para tutor

## Dependencias Técnicas

- ⚠️ Crear módulo de evaluaciones en backend
- ⚠️ Tabla `Evaluaciones`, `Respuestas`, `PerfilAprendizaje`
- ⚠️ Integrar Recharts para gráficos

## Testing

- [ ] Test E2E: Estudiante completa evaluación
- [ ] Test: Algoritmo adaptativo
- [ ] Test: Generación de perfil
- [ ] Test: Notificaciones a docente

---

# 🎮 SLICE 7: GAMIFICACIÓN VISUAL

**Objetivo:** Experiencia visual completa de gamificación.

**Duración estimada:** 1 semana (5 días)

**Prioridad:** 🟠 MEDIA

## Tareas Incluidas (6)

| ID   | Tarea                                      | Instancia  | Días |
| ---- | ------------------------------------------ | ---------- | ---- |
| T027 | Animaciones en Tiempo Real (Celebraciones) | ESTUDIANTE | 1.5  |
| T045 | Animaciones en Tiempo Real (Vista Docente) | DOCENTE    | 0.5  |
| T009 | Sistema de Recompensas Familiares          | TUTOR      | 2    |
| T010 | Compartir Logros (Tarjetas Visuales)       | TUTOR      | 1.5  |
| T032 | Buzón de Mensajes (Recibir de Tutor)       | ESTUDIANTE | 1    |
| T014 | Tracking Tiempo de Práctica Semanal        | TUTOR      | 1    |

## Entregables

✅ Confetti, estrellas y badges animados
✅ Celebraciones sincronizadas docente-estudiante
✅ Sistema de logros familiares
✅ Generador de tarjetas de logros compartibles
✅ Buzón de mensajes para estudiante
✅ Tracking de tiempo de práctica

## Dependencias Técnicas

- ⚠️ Instalar react-confetti, Lottie
- ⚠️ Canvas API para generar imágenes
- ⚠️ Web Share API para compartir

## Testing

- [ ] Test visual: Animaciones
- [ ] Test: Generación de tarjeta
- [ ] Test: Compartir logro

---

# 💬 SLICE 8: COMUNICACIÓN INTERNA

**Objetivo:** Sistema de mensajería entre tutores y docentes.

**Duración estimada:** 1 semana (5 días)

**Prioridad:** 🟠 MEDIA

## Tareas Incluidas (2)

| ID   | Tarea                                          | Instancia | Días |
| ---- | ---------------------------------------------- | --------- | ---- |
| T007 | Sistema de Mensajería Interna Tutor ↔ Docente | TUTOR     | 3    |
| T006 | Comentarios de Docente Visibles para Tutor     | TUTOR     | 2    |

## Entregables

✅ Módulo backend de mensajería (`/api/mensajes`)
✅ Chat tutor-docente (`/mensajes`)
✅ Notificaciones de mensaje nuevo
✅ Historial de conversación
✅ Observaciones docente visibles para tutor
✅ Endpoint con permisos: solo lee observaciones de SU hijo

## Dependencias Técnicas

- ⚠️ Crear módulo MensajesModule en backend
- ⚠️ Tabla `Mensajes` con relaciones
- ✅ Observaciones ya existen

## Testing

- [ ] Test E2E: Tutor envía mensaje a docente
- [ ] Test E2E: Docente responde
- [ ] Test: Notificaciones de mensaje
- [ ] Test: Permisos de observaciones

---

# 👔 SLICE 9: PANEL ADMIN COMPLETO

**Objetivo:** Admin tiene visibilidad total del negocio.

**Duración estimada:** 1.5 semanas (7 días)

**Prioridad:** 🟡 ALTA

## Tareas Incluidas (10)

| ID   | Tarea                                      | Instancia | Días |
| ---- | ------------------------------------------ | --------- | ---- |
| T049 | Dashboard Global de KPIs                   | ADMIN     | 2    |
| T050 | Tracking de Aciertos por Clase/Estudiante  | ADMIN     | 1    |
| T051 | Índices de Compromiso (ICD, ICE)           | ADMIN     | 1.5  |
| T052 | Gráficas Temporales de Crecimiento         | ADMIN     | 1    |
| T055 | Sistema de Proyecciones Financieras        | ADMIN     | 1.5  |
| T056 | Cálculo de Retención Histórica             | ADMIN     | 1    |
| T057 | Gestión Automatizada de Cobranza (Dunning) | ADMIN     | 1.5  |
| T058 | Métricas de Morosidad y Liquidez           | ADMIN     | 0.5  |
| T053 | Generación Automática de Reportes PDF      | ADMIN     | 1.5  |
| T054 | Email Service para Envíos Automáticos      | ADMIN     | 1    |

## Entregables

✅ Dashboard overview con KPIs principales
✅ Analytics de aciertos por estudiante
✅ Cálculo de ICD e ICE
✅ Gráficas de crecimiento mensual
✅ Proyecciones financieras con ML básico
✅ Métricas de retención
✅ Sistema de cobranza automatizado
✅ Indicadores de morosidad
✅ Exportar reportes en PDF
✅ Email service (Nodemailer + SendGrid)

## Dependencias Técnicas

- ⚠️ Instalar Puppeteer o jsPDF
- ⚠️ Configurar SendGrid/Resend
- ⚠️ Definir fórmulas de ICD/ICE

## Testing

- [ ] Test: Dashboard KPIs
- [ ] Test: Proyecciones financieras
- [ ] Test: Generación PDF
- [ ] Test: Envío de email

---

# ⚡ SLICE 10: TIEMPO REAL Y WEBSOCKETS

**Objetivo:** Experiencia en vivo durante clases.

**Duración estimada:** 1.5 semanas (7 días)

**Prioridad:** 🟠 MEDIA

## Tareas Incluidas (8)

| ID   | Tarea                                    | Instancia  | Días |
| ---- | ---------------------------------------- | ---------- | ---- |
| T077 | WebSockets para Eventos en Tiempo Real   | SISTEMA    | 2    |
| T026 | Tablero de Desafíos en Vivo (WebSockets) | ESTUDIANTE | 2    |
| T028 | Barra de Puntos en Vivo Durante Clase    | ESTUDIANTE | 1    |
| T029 | Leaderboard de Equipos en Tiempo Real    | ESTUDIANTE | 1.5  |
| T042 | Sistema de Gamificación en Vivo          | DOCENTE    | 2    |
| T043 | Contador Grupal y Puntos de Equipo       | DOCENTE    | 1    |
| T012 | Vista Parental en Vivo Durante Clase     | TUTOR      | 1.5  |
| T031 | Sistema de Métricas por Sesión           | ESTUDIANTE | 1    |

## Entregables

✅ Gateway WebSocket configurado
✅ Eventos: puntos, logros, conexiones
✅ Tablero de desafíos en vivo
✅ Barra de puntos actualizada en tiempo real
✅ Leaderboard live
✅ Panel de control docente para lanzar actividades
✅ Sistema de equipos y puntos grupales
✅ Vista parental (modo observador)
✅ Tracking granular de participación

## Dependencias Técnicas

- ⚠️ Configurar Socket.io en NestJS
- ⚠️ Gateway WebSocket
- ⚠️ Rooms por clase

## Testing

- [ ] Test: Conexión WebSocket
- [ ] Test E2E: Asignar puntos en vivo
- [ ] Test: Leaderboard actualiza automáticamente
- [ ] Test: Vista parental sincronizada

---

# ⏰ SLICE 11: AUTOMATIZACIÓN Y CRON JOBS

**Objetivo:** Sistema se auto-gestiona con tareas programadas.

**Duración estimada:** 1 semana (5 días)

**Prioridad:** 🟡 ALTA

## Tareas Incluidas (9)

| ID   | Tarea                                  | Instancia | Días |
| ---- | -------------------------------------- | --------- | ---- |
| T059 | Sistema de Cron Jobs / Scheduled Tasks | SISTEMA   | 1    |
| T060 | Backups Automáticos de Base de Datos   | SISTEMA   | 0.5  |
| T061 | APM y Monitoring de Sistema            | SISTEMA   | 1    |
| T062 | Limpieza Automática de Datos Huérfanos | SISTEMA   | 0.5  |
| T063 | Detección de Suscripciones por Vencer  | SISTEMA   | 0.5  |
| T064 | Recordatorios Escalonados de Pago      | SISTEMA   | 1    |
| T065 | Resumen Semanal Automático a Familias  | SISTEMA   | 1    |
| T066 | Notificaciones Proactivas del Sistema  | SISTEMA   | 1    |
| T011 | Notificaciones Push (PWA/Firebase)     | TUTOR     | 1.5  |

## Entregables

✅ @nestjs/schedule configurado
✅ Cron jobs activos (diarios, semanales)
✅ Backups automáticos de PostgreSQL
✅ Sentry o APM configurado
✅ Script de limpieza semanal
✅ Detección y alerta de vencimientos
✅ Sistema dunning completo
✅ Email semanal a familias
✅ Notificaciones proactivas (clase por empezar, etc.)
✅ Push notifications con Firebase

## Dependencias Técnicas

- ⚠️ Configurar Firebase Cloud Messaging
- ⚠️ pg_dump para backups
- ⚠️ Sentry SDK

## Testing

- [ ] Test: Cron job se ejecuta
- [ ] Test: Backup se genera
- [ ] Test: Email semanal se envía
- [ ] Test: Push notification recibida

---

# 🤖 SLICE 12: INTELIGENCIA ARTIFICIAL

**Objetivo:** IA adaptativa y análisis predictivo.

**Duración estimada:** 2 semanas (10 días)

**Prioridad:** 🟢 BAJA (puede ser fase 2)

## Tareas Incluidas (10)

| ID   | Tarea                                     | Instancia | Días |
| ---- | ----------------------------------------- | --------- | ---- |
| T069 | Pipeline de Ingesta de Datos para AI      | SISTEMA   | 2    |
| T070 | Modelo de Análisis de Debilidades         | SISTEMA   | 2    |
| T071 | Motor de Correlaciones                    | SISTEMA   | 1.5  |
| T072 | Segmentación Inteligente de Usuarios      | SISTEMA   | 1.5  |
| T073 | Recomendaciones Automáticas Operativas    | SISTEMA   | 1.5  |
| T074 | Forecasting con Machine Learning          | SISTEMA   | 2    |
| T075 | AI con Contexto Personalizado por Alumno  | SISTEMA   | 2    |
| T076 | Feed Interno de Recomendaciones AI        | SISTEMA   | 1    |
| T078 | Módulo IA Adaptativa + Perfil Acumulativo | SISTEMA   | 2    |
| T082 | Informe Automático AI sobre Debilidades   | SISTEMA   | 1    |

## Entregables

✅ ETL para recolectar datos
✅ Modelo ML de análisis de debilidades
✅ Motor de correlaciones educativo-financiero
✅ Clustering de usuarios
✅ Sistema de recomendaciones operativas
✅ Forecasting con Prophet/ARIMA
✅ RAG con LLM para personalización
✅ Timeline de insights AI
✅ Perfil adaptativo por estudiante
✅ Reportes semanales automáticos

## Dependencias Técnicas

- ⚠️ Python + scikit-learn/TensorFlow
- ⚠️ Data warehouse o feature store
- ⚠️ API de LLM (OpenAI/Anthropic)
- ⚠️ Langchain para RAG

## Testing

- [ ] Test: Pipeline de datos funciona
- [ ] Test: Modelo genera predicciones
- [ ] Test: Recomendaciones son coherentes

---

# 📊 RESUMEN DEL PLAN

## Duración Total

| Slice    | Duración    | Tipo    | Dependencia |
| -------- | ----------- | ------- | ----------- |
| SLICE 1  | 1 semana    | CRÍTICO | -           |
| SLICE 2  | 1.5 semanas | CRÍTICO | SLICE 1     |
| SLICE 3  | 1.5 semanas | CRÍTICO | SLICE 2     |
| SLICE 4  | 1 semana    | ALTO    | SLICE 3     |
| SLICE 5  | 1 semana    | ALTO    | SLICE 3     |
| SLICE 6  | 1.5 semanas | CRÍTICO | SLICE 2, 5  |
| SLICE 7  | 1 semana    | MEDIO   | SLICE 2, 3  |
| SLICE 8  | 1 semana    | MEDIO   | SLICE 4, 5  |
| SLICE 9  | 1.5 semanas | ALTO    | SLICE 1, 6  |
| SLICE 10 | 1.5 semanas | MEDIO   | SLICE 3, 5  |
| SLICE 11 | 1 semana    | ALTO    | SLICE 9     |
| SLICE 12 | 2 semanas   | BAJO    | Todos       |

**Total (secuencial):** ~15 semanas (3.5 meses)

**Total (con paralelización):** ~10-12 semanas (2.5-3 meses)

## Estrategia de Paralelización

### Sprint 1-2 (Semanas 1-2)

- SLICE 1 (público)
- Inicio de SLICE 2 (estudiante)

### Sprint 3-4 (Semanas 3-4)

- SLICE 2 (completar estudiante)
- SLICE 3 (clase base)

### Sprint 5-6 (Semanas 5-6)

- SLICE 4 (tutor) en paralelo con SLICE 5 (docente)

### Sprint 7-8 (Semanas 7-8)

- SLICE 6 (evaluación)
- SLICE 7 (gamificación) en paralelo

### Sprint 9-10 (Semanas 9-10)

- SLICE 8 (mensajería)
- SLICE 9 (admin)

### Sprint 11-12 (Semanas 11-12)

- SLICE 10 (websockets)
- SLICE 11 (automatización)

### Sprint 13-14 (Semanas 13-14) - OPCIONAL

- SLICE 12 (IA) - puede ser fase 2

---

# 🎯 MVP RECOMENDADO

Para lanzar rápido, el **MVP mínimo viable** incluye:

## MVP = SLICES 1, 2, 3, 4

**Duración:** 5-6 semanas

**Funcionalidad:**
✅ Landing page y registro público
✅ Portal estudiante básico
✅ Clases en vivo funcionales
✅ Portal tutor con progreso
✅ Panel docente básico

**Con esto ya podés:**

- Vender y cobrar
- Dar clases online
- Familias ven progreso
- Docentes gestionan grupos

---

# 📋 CHECKLIST DE CADA SLICE

Para cada slice, seguir este protocolo:

## Antes de Empezar

- [ ] Revisar tareas del slice
- [ ] Verificar dependencias técnicas
- [ ] Crear rama de git `feature/slice-N`
- [ ] Actualizar documentación técnica

## Durante Desarrollo

- [ ] Implementar backend primero
- [ ] Testear endpoints con Postman/Insomnia
- [ ] Implementar frontend
- [ ] Testing unitario
- [ ] Testing E2E
- [ ] Code review

## Antes de Mergear

- [ ] Todos los tests pasan
- [ ] Documentación actualizada
- [ ] Demo funcional grabada
- [ ] Aprobación del PO/cliente
- [ ] Merge a `main`
- [ ] Deploy a staging
- [ ] Smoke test en staging

---

# 🚀 RECOMENDACIÓN FINAL

**Plan sugerido:**

### Fase 1: MVP (6 semanas)

SLICES 1, 2, 3, 4

### Fase 2: Completar Experiencia (6 semanas)

SLICES 5, 6, 7, 8

### Fase 3: Escalabilidad (4 semanas)

SLICES 9, 10, 11

### Fase 4: IA (2 semanas)

SLICE 12

**Total:** 18 semanas (~4.5 meses para producto completo)

**Pero con MVP en 6 semanas ya podés empezar a operar y generar ingresos!** 💰

---

**Documento generado:** `PLAN_DE_SLICES.md`
**Próximos pasos:** Definir por dónde empezar y asignar recursos
