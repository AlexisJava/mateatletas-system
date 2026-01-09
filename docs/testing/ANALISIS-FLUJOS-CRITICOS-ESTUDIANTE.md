# ANÁLISIS: Flujos Críticos del Portal Estudiante para Tests de Integración

**Fecha**: 2026-01-09
**Lanzamiento**: Lunes 12 de enero
**Objetivo**: Identificar TODOS los flujos críticos para tests de integración REALES (sin mocks)

---

## 1. MAPA COMPLETO DE FUNCIONALIDADES

### 1.1 Autenticación y Acceso

| Funcionalidad                      | Endpoint(s)                           | Dependencias                                |
| ---------------------------------- | ------------------------------------- | ------------------------------------------- |
| Login estudiante                   | `POST /auth/login`                    | AuthModule                                  |
| Verificar acceso plataforma        | `GET /estudiantes/verificar-acceso`   | Plan, Suscripción Tutor, Comisión, Override |
| Verificar permiso clase específica | `GET /estudiantes/puede-entrar-clase` | ClaseGrupo, Comisión, Plan                  |
| Obtener mi plan                    | `GET /estudiantes/mi-plan`            | Plan, Tutor                                 |

### 1.2 Dashboard Principal

| Funcionalidad                       | Endpoint(s)                         | Dependencias         |
| ----------------------------------- | ----------------------------------- | -------------------- |
| Obtener recursos (nivel, XP, racha) | `GET /gamificacion/recursos/:id`    | GamificacionModule   |
| Obtener próxima clase               | `GET /estudiantes/mi-proxima-clase` | ClaseGrupo, Horarios |
| Obtener plan para validar acceso    | `GET /estudiantes/mi-plan`          | Plan                 |

### 1.3 Explorar Mundos

| Funcionalidad               | Endpoint(s)                                | Dependencias      |
| --------------------------- | ------------------------------------------ | ----------------- |
| Listar contenidos por mundo | `GET /contenidos/estudiante`               | ContenidosModule  |
| Ver contenido específico    | `GET /contenidos/estudiante/:id`           | Contenido, Nodos  |
| Actualizar progreso         | `POST /contenidos/estudiante/:id/progreso` | ProgresoContenido |

### 1.4 Aula Virtual

| Funcionalidad             | Endpoint(s)                                                    | Dependencias                                          |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| Ver resumen mi aula       | `GET /estudiantes/mi-aula`                                     | AsignacionPlanificacion, ProgresoClase, ProgresoTarea |
| Ver detalle planificación | `GET /estudiantes/aula/planificacion/:asignacionId`            | EstadoClase, Docente                                  |
| Ver contenido clase       | `GET /estudiantes/aula/contenido/:asignacionId/:claseId/:tipo` | Contenido, EstadoClase                                |
| Completar lección         | `POST /estudiantes/aula/completar-leccion`                     | ProgresoClase, Gamificación, ActivityFeed             |
| Ver mis tareas            | `GET /estudiantes/mis-tareas`                                  | TareaAsignada, ProgresoTarea                          |
| Iniciar tarea             | `POST /estudiantes/tareas/:id/iniciar`                         | TareaAsignada                                         |
| Completar tarea           | `POST /estudiantes/tareas/:id/completar`                       | ProgresoTarea, Gamificación, ActivityFeed             |
| Ver leaderboard           | `GET /estudiantes/aula/leaderboard/:asignacionId`              | Compañeros, Progreso                                  |

### 1.5 Clases en Vivo

| Funcionalidad         | Endpoint(s)                      | Dependencias                           |
| --------------------- | -------------------------------- | -------------------------------------- |
| Obtener token LiveKit | `POST /livekit/token/estudiante` | LiveKit, AccesoEstudiante, Inscripción |
| Conectar a sala       | WebSocket LiveKit                | Token válido                           |
| Chat en tiempo real   | WebSocket Chat                   | Conexión activa                        |

### 1.6 Activity Feed

| Funcionalidad        | Endpoint(s)                                | Dependencias                |
| -------------------- | ------------------------------------------ | --------------------------- |
| Feed general         | `GET /estudiantes/feed`                    | ActividadFeed               |
| Feed mi casa         | `GET /estudiantes/feed/mi-casa`            | Casa, ActividadFeed         |
| Feed mi comisión     | `GET /estudiantes/feed/mi-comision`        | Compañeros, ActividadFeed   |
| Mis actividades      | `GET /estudiantes/feed/mis-actividades`    | ActividadFeed               |
| Reacciones restantes | `GET /estudiantes/feed/mis-reacciones-hoy` | ReaccionFeed                |
| Agregar reacción     | `POST /estudiantes/feed/:id/reaccion`      | ReaccionFeed (límite 5/día) |
| Quitar reacción      | `DELETE /estudiantes/feed/:id/reaccion`    | ReaccionFeed                |

### 1.7 Compañeros y Clases

| Funcionalidad      | Endpoint(s)                       | Dependencias          |
| ------------------ | --------------------------------- | --------------------- |
| Ver mis compañeros | `GET /estudiantes/mis-companeros` | InscripcionClaseGrupo |
| Ver mis clases     | `GET /estudiantes/mis-clases`     | ClaseGrupo, Horarios  |
| Ver mis sectores   | `GET /estudiantes/mis-sectores`   | Sector, ClaseGrupo    |

### 1.8 Perfil y Datos

| Funcionalidad     | Endpoint(s)                     | Dependencias   |
| ----------------- | ------------------------------- | -------------- |
| Ver perfil        | `GET /estudiantes/:id`          | Estudiante     |
| Actualizar avatar | `PATCH /estudiantes/:id/avatar` | OwnershipGuard |

---

## 2. CLASIFICACIÓN POR CRITICIDAD

### 🔴 CRÍTICO - Sin esto NO funciona la plataforma

| #   | Funcionalidad           | Impacto si falla                       |
| --- | ----------------------- | -------------------------------------- |
| 1   | **Login estudiante**    | Nadie puede entrar                     |
| 2   | **Verificar acceso**    | Estudiantes válidos bloqueados         |
| 3   | **Dashboard carga**     | Pantalla en blanco al entrar           |
| 4   | **Mi Aula (resumen)**   | No ven sus planificaciones             |
| 5   | **Ver contenido clase** | No pueden estudiar                     |
| 6   | **Completar lección**   | Progreso no se guarda, XP no se otorga |
| 7   | **Token LiveKit**       | No entran a clases en vivo             |
| 8   | **Completar tarea**     | Tareas no cuentan como hechas          |

### 🟡 IMPORTANTE - Afecta experiencia significativamente

| #   | Funcionalidad                     | Impacto si falla                   |
| --- | --------------------------------- | ---------------------------------- |
| 1   | **Obtener recursos gamificación** | Nivel/XP/racha muestran mal        |
| 2   | **Próxima clase**                 | No ven cuándo es su clase          |
| 3   | **Feed mi comisión**              | No ven logros de compañeros        |
| 4   | **Agregar reacción**              | No pueden felicitar                |
| 5   | **Ver leaderboard**               | No ven ranking                     |
| 6   | **Explorar mundos**               | No pueden explorar contenido libre |
| 7   | **Chat clase en vivo**            | No pueden chatear en clase         |

### 🟢 MENOR - Nice to have

| #   | Funcionalidad           | Impacto si falla              |
| --- | ----------------------- | ----------------------------- |
| 1   | Mis actividades propias | Solo afecta autovisualizacion |
| 2   | Actualizar avatar       | Estético                      |
| 3   | Ver detalle completo    | Para tutores principalmente   |

---

## 3. CASOS DE TEST DETALLADOS (🔴 CRÍTICOS)

### 3.1 LOGIN ESTUDIANTE

**Happy Path:**

```
1. Estudiante ingresa usuario/contraseña válidos
2. Sistema retorna JWT con rol=ESTUDIANTE
3. Frontend guarda token y redirige a /estudiante
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | Credenciales correctas pero rol=TUTOR | Redirige a /dashboard (no /estudiante) |
| E2 | Credenciales correctas, estudiante con `estado_acceso=SUSPENDIDO` | Login OK pero verificar-acceso retorna false |
| E3 | Password correcto, username con mayúsculas/minúsculas diferentes | Debería funcionar (case-insensitive) |
| E4 | Estudiante sin tutor asignado | Login OK si tiene plan directo |
| E5 | Estudiante recién creado (sin ningún progreso) | Login OK, dashboard vacío pero funcional |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | Password incorrecto | 401 Unauthorized |
| X2 | Usuario inexistente | 401 Unauthorized (mismo mensaje) |
| X3 | Token expirado en request siguiente | 401 → redirect a login |
| X4 | Token malformado | 401 Unauthorized |

---

### 3.2 VERIFICAR ACCESO

**Happy Path (cada fuente de acceso):**

```
1. PLAN_DIRECTO: Estudiante con plan asignado y fecha_vencimiento > hoy
2. SUSCRIPCION_TUTOR: Tutor con suscripción ACTIVA o EN_GRACIA
3. COMISION_ACTIVA: Inscripción Confirmada en comisión con fecha_inicio <= hoy <= fecha_fin
4. OVERRIDE: acceso_override=true y (acceso_override_hasta=null OR > hoy)
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | Plan vencido ayer | SIN_ACCESO (no PLAN_DIRECTO) |
| E2 | Suscripción tutor EN_GRACIA | Acceso OK (igual que ACTIVA) |
| E3 | Suscripción tutor CANCELADA | Sin acceso por suscripción |
| E4 | Comisión con estado="Pendiente" | Auto-confirmar y dar acceso |
| E5 | Comisión con fecha_fin=null (indefinida) | Acceso OK |
| E6 | Override con fecha_hasta=hoy a las 23:59 | Acceso OK todo el día |
| E7 | Override con fecha_hasta=ayer | Sin acceso por override vencido |
| E8 | Override sin fecha_hasta (null) | Acceso indefinido |
| E9 | Estudiante con PLAN + COMISION activa | Plan tiene prioridad (combo permisos) |
| E10 | Estudiante nuevo sin plan, sin tutor, sin comisión | SIN_ACCESO |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | estudianteId inexistente | SIN_ACCESO "Estudiante no encontrado" |
| X2 | estado_acceso=SUSPENDIDO | SIN_ACCESO aunque tenga plan |
| X3 | Token de otro rol (docente) intentando este endpoint | 403 Forbidden |

---

### 3.3 DASHBOARD CARGA

**Happy Path:**

```
1. GET /estudiantes/verificar-acceso → puedeAcceder=true
2. Promise.all:
   - GET /gamificacion/recursos/:id
   - GET /estudiantes/mi-proxima-clase
   - GET /estudiantes/mi-plan
3. Dashboard renderiza con datos
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | No tiene próxima clase | LiveBanner no se muestra |
| E2 | Plan=LIBROS (sin clases vivo) | Card de clases bloqueada |
| E3 | Plan=STEAM_SINCRONICO | Card de clases desbloqueada |
| E4 | Gamificación falla pero rest OK | Fallback a user.nivel_actual |
| E5 | Primera vez (nivel 1, XP 0, racha 0) | Muestra valores iniciales |
| E6 | Racha rota (última actividad hace 2 días) | racha=0 |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | Token expirado durante fetch | 401 → redirect login |
| X2 | API timeout en uno de los endpoints | Mostrar error parcial, no crashear |

---

### 3.4 MI AULA (RESUMEN)

**Happy Path:**

```
1. GET /estudiantes/mi-aula
2. Retorna sectores con planificaciones activas
3. Cada planificación tiene progreso calculado
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | Sin inscripciones a ClaseGrupo | sectores=[], resumen vacío |
| E2 | Inscrito pero sin planificaciones asignadas | sectores con grupos vacíos |
| E3 | Planificación con activa=false | NO aparece en el listado |
| E4 | Clase con teoría activa pero práctica no | Solo cuenta teoría en progreso |
| E5 | 100% completado en una planificación | progreso.porcentaje=100 |
| E6 | Estudiante dado de baja (fecha_baja != null) | NO ve esa planificación |
| E7 | Múltiples planificaciones en un grupo | Todas aparecen |
| E8 | 50+ asignaciones (carga pesada) | No timeout, paginación si hay |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | DB timeout | 500, frontend muestra retry |

---

### 3.5 VER CONTENIDO CLASE

**Happy Path:**

```
1. GET /estudiantes/aula/contenido/:asignacionId/:claseId/teoria
2. Retorna contenido con nodos
3. Usuario ve el contenido
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | tipo=teoria pero teoría no activada | 404 "La teoría no está activada" |
| E2 | tipo=practica pero práctica no activada | 404 "La práctica no está activada" |
| E3 | Clase sin contenido asignado (contenido_id=null) | 404 o contenido vacío |
| E4 | Asignación existe pero estudiante no inscrito | 404 "No tienes acceso" |
| E5 | Asignación con activa=false | 404 |
| E6 | Contenido con nodos vacíos | Retorna pero nodos=[] |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | asignacionId inválido (no UUID) | 400 Bad Request |
| X2 | claseId inexistente | 404 |
| X3 | tipo="invalido" | 400 "Tipo debe ser teoria o practica" |

---

### 3.6 COMPLETAR LECCIÓN

**Happy Path:**

```
1. POST /estudiantes/aula/completar-leccion
   Body: { asignacionId, claseId, tipo: "teoria", tiempoSegundos: 300 }
2. Crea/actualiza ProgresoClaseEstudiante
3. Emite evento → Gamificación otorga XP
4. Crea ActividadFeed
5. Retorna { xpGanado, nivelSubido }
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | Completar teoría cuando ya estaba completada | No duplicar XP, retorna success |
| E2 | Completar práctica después de teoría | Marcar clase como completada |
| E3 | tiempoSegundos=0 | ¿Otorgar XP o rechazar? (definir) |
| E4 | tiempoSegundos muy bajo (< 30s) | ¿Otorgar XP reducido? |
| E5 | Completar lección → sube de nivel | nivelSubido=true, entrada feed NIVEL_SUBIDO |
| E6 | Completar todas las clases de planificación | Entrada feed PLANIFICACION_COMPLETADA |
| E7 | Dos requests simultáneos (race condition) | Solo una cuenta, no duplicar |
| E8 | Lección sin contenido_id | ¿Permitir o rechazar? |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | Asignación no existe | 404 |
| X2 | Clase no activada por docente | 404 "no está activada" |
| X3 | Estudiante no inscrito | 404 "No tienes acceso" |
| X4 | DB error al guardar progreso | 500, pero ¿XP ya se otorgó? |

---

### 3.7 TOKEN LIVEKIT (CLASES EN VIVO)

**Happy Path:**

```
1. POST /livekit/token/estudiante
   Body: { claseGrupoId: "xxx" }
2. Valida: estudiante inscrito + plan permite clases
3. Retorna { token, wsUrl, roomName }
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | Plan=LIBROS (sin clases en vivo) | 403 "Plan no permite clases en vivo" |
| E2 | Inscrito en ClaseGrupo pero dado de baja | 403 "No inscrito" |
| E3 | comisionId en vez de claseGrupoId | OK si inscrito en comisión |
| E4 | Ambos claseGrupoId y comisionId | 400 "Solo uno" |
| E5 | Ningún ID | 400 "Debe proporcionar ID" |
| E6 | Clase ya finalizó (hace 1 hora) | ¿Permitir o rechazar? |
| E7 | Clase aún no empezó (faltan 2 horas) | ¿Permitir early join? |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | claseGrupoId inexistente | 404 |
| X2 | LiveKit server down | 500 |
| X3 | Token sin rol ESTUDIANTE | 403 |

---

### 3.8 COMPLETAR TAREA

**Happy Path:**

```
1. POST /estudiantes/tareas/:tareaAsignadaId/completar
   Body: { tiempoSegundos: 600, calificacion: 100 }
2. Actualiza ProgresoTareaEstudiante.estado = COMPLETADA
3. Emite evento → XP
4. Crea ActividadFeed (TAREA_COMPLETADA o TAREA_PERFECTA)
```

**Edge Cases:**
| # | Caso | Qué debería pasar |
|---|------|-------------------|
| E1 | Tarea ya completada | No duplicar, retorna success |
| E2 | calificacion=100 | TAREA_PERFECTA en feed |
| E3 | calificacion=undefined | TAREA_COMPLETADA normal |
| E4 | Tarea con fecha_limite pasada | ¿Permitir completar tarde? |
| E5 | Tarea sin iniciar (sin POST /iniciar) | ¿Crear progreso automático? |
| E6 | Dos tareas completadas en 1 segundo (race) | Ambas cuentan |

**Casos de Error:**
| # | Caso | Respuesta esperada |
|---|------|-------------------|
| X1 | tareaAsignadaId inexistente | 404 |
| X2 | Tarea de otra planificación | 403 |
| X3 | Estudiante no tiene esa tarea asignada | 403 |

---

## 4. MAPA DE DEPENDENCIAS

```
┌─────────────────────────────────────────────────────────────────┐
│                      AUTENTICACIÓN                               │
│  POST /auth/login → JWT con rol ESTUDIANTE                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICAR ACCESO                              │
│  GET /estudiantes/verificar-acceso                              │
│  Depende de: Plan | Suscripción Tutor | Comisión | Override     │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    DASHBOARD    │  │   MI AULA       │  │  CLASES VIVO    │
│  - recursos     │  │  - planif.      │  │  - token        │
│  - próxima clase│  │  - progreso     │  │  - conectar     │
│  - mi plan      │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ VER CONTENIDO   │  │ COMPLETAR       │  │ TAREAS          │
│ - asignación    │  │ LECCIÓN         │  │ - iniciar       │
│ - estado clase  │  │ - progreso      │  │ - completar     │
│                 │  │ - gamificación  │  │ - gamificación  │
│                 │  │ - activity feed │  │ - activity feed │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ACTIVITY FEED                               │
│  - Entrada creada al completar lección/tarea/subir nivel        │
│  - Reacciones de compañeros (límite 5/día)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### Fase 1: Infraestructura Base (Día 1)

1. Setup de base de datos de test
2. Fixtures de datos (estudiante, tutor, plan, comisión)
3. Helper para generar JWT de test
4. Helper para requests HTTP autenticados

### Fase 2: Autenticación y Acceso (Día 1-2)

1. `auth.login.spec.ts` - Login estudiante
2. `acceso.verificar.spec.ts` - Verificar acceso (todas las fuentes)
3. `acceso.puede-entrar-clase.spec.ts` - Permiso clase específica

### Fase 3: Dashboard y Navegación (Día 2)

1. `dashboard.carga.spec.ts` - Carga paralela de datos
2. `estudiante.mi-plan.spec.ts` - Obtener plan

### Fase 4: Aula Virtual Core (Día 2-3)

1. `aula.mi-aula.spec.ts` - Resumen del aula
2. `aula.planificacion-detalle.spec.ts` - Detalle planificación
3. `aula.contenido-clase.spec.ts` - Ver contenido
4. `aula.completar-leccion.spec.ts` - **MÁS CRÍTICO**

### Fase 5: Tareas (Día 3)

1. `tareas.mis-tareas.spec.ts` - Listar tareas
2. `tareas.iniciar.spec.ts` - Iniciar tarea
3. `tareas.completar.spec.ts` - Completar tarea

### Fase 6: Clases en Vivo (Día 3-4)

1. `livekit.token-estudiante.spec.ts` - Obtener token
2. (WebSocket tests si hay tiempo)

### Fase 7: Activity Feed (Día 4)

1. `feed.obtener.spec.ts` - Obtener feeds
2. `feed.reacciones.spec.ts` - Agregar/quitar reacciones
3. `feed.limite-diario.spec.ts` - Límite 5/día

### Fase 8: Gamificación Cross-Check (Día 4)

1. `gamificacion.completar-leccion.spec.ts` - XP se otorga
2. `gamificacion.nivel-up.spec.ts` - Subida de nivel

---

## 6. FIXTURES NECESARIOS

```typescript
// Base: Un estudiante completo con todo el contexto
interface TestEstudiante {
  id: string;
  usuario: string;
  password: string;
  tutorId: string;
  planId: string;            // STEAM_SINCRONICO
  casaId: string;
  claseGrupoId: string;      // Inscrito
  asignacionId: string;      // Planificación asignada
  claseId: string;           // Clase dentro de planificación
  tareaAsignadaId: string;   // Tarea asignada
}

// Variantes para edge cases:
- EstudianteSinPlan
- EstudiantePlanLibros (sin clases vivo)
- EstudianteSoloComision (sin plan ni suscripción)
- EstudianteConOverride
- EstudianteSuspendido
- EstudianteNuevo (sin progreso)
- EstudianteConTodo100Completado
```

---

## 7. RIESGOS IDENTIFICADOS

| Riesgo                                | Probabilidad | Impacto | Mitigación               |
| ------------------------------------- | ------------ | ------- | ------------------------ |
| Race condition en completar lección   | Media        | Alto    | Test concurrente         |
| XP otorgado pero progreso no guardado | Baja         | Crítico | Transacciones o rollback |
| Token LiveKit sin validar inscripción | Media        | Alto    | Test de seguridad        |
| Comisión pendiente no auto-confirma   | Media        | Medio   | Test específico          |
| Override sin fecha queda indefinido   | Baja         | Medio   | Test de expiración       |
| Fallback gamificación inconsistente   | Alta         | Bajo    | Test de fallback         |

---

## 8. PRÓXIMOS PASOS

1. **Revisar este documento con el equipo**
2. **Priorizar tests por día disponible**
3. **Crear estructura de tests de integración**
4. **Implementar fixtures base**
5. **Escribir tests críticos primero**

---

_Documento generado: 2026-01-09_
