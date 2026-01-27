# Auditoría Fase 3: Flujos de Datos entre Portales

> **Fecha:** 2026-01-27
> **Alcance:** Verificar que cuando un portal CREA/MODIFICA datos, otros portales pueden VER esos datos
> **Metodología:** Trazabilidad completa de endpoints de escritura → tablas → endpoints de lectura

---

## Resumen Ejecutivo

| PASO | Flujo                 | Estado      | Gaps Encontrados                      |
| ---- | --------------------- | ----------- | ------------------------------------- |
| 1    | Planificaciones       | ✅ COMPLETO | Ninguno                               |
| 2    | Clases y ClaseGrupo   | ✅ COMPLETO | Tutor no tiene endpoint directo       |
| 3    | Comisiones            | ⚠️ PARCIAL  | Docente/Tutor sin visibilidad directa |
| 4    | Inscripciones         | ✅ COMPLETO | Vista unificada funcional             |
| 5    | Asistencia            | ⚠️ PARCIAL  | Tutor ve resumen, no detalle          |
| 6    | Observaciones         | ❌ GAP      | Tutor/Estudiante NO ven               |
| 7    | Anuncios              | ✅ COMPLETO | Ninguno                               |
| 8    | Gamificación          | ✅ COMPLETO | Ninguno                               |
| 9    | Suscripciones y Pagos | ✅ COMPLETO | Ninguno                               |
| 10   | Contenido (Libros)    | ⚠️ PARCIAL  | Tutor NO ve contenidos                |

---

## PASO 1: FLUJO DE PLANIFICACIONES

### Origen: Admin crea planificación

| Aspecto           | Valor                                               |
| ----------------- | --------------------------------------------------- |
| **Endpoint**      | `POST /admin/planificaciones`                       |
| **Controller**    | `PlanificacionesAdminController`                    |
| **Service**       | `AdminPlanificacionesService.crear()`               |
| **Tablas Prisma** | `Planificacion`, `ClasePlanificacion`, `TareaClase` |

**Endpoints adicionales de Admin:**

- `POST /admin/planificaciones/:id/publicar` → Publica la planificación
- `PATCH /admin/planificaciones/clases/:claseId` → Actualiza clase
- `POST /admin/planificaciones/clases/:claseId/tareas` → Agrega tarea

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                                        | Query/Filtro                                    | Estado       |
| -------------- | ---- | ----------------------------------------------- | ----------------------------------------------- | ------------ |
| **Docente**    | ✅   | `GET /docentes/me/asignaciones-planificaciones` | `WHERE docenteId = req.user.id`                 | ✅ OK        |
| **Estudiante** | ✅   | `GET /estudiantes/me/aula-virtual`              | Filtra por inscripción activa y estado de clase | ✅ OK        |
| **Tutor**      | ⚠️   | Indirecto via dashboard                         | No hay endpoint específico                      | ⚠️ INDIRECTO |

### Tablas Involucradas

```
Planificacion
├── ClasePlanificacion (clases del plan)
│   └── TareaClase (tareas por clase)
└── AsignacionPlanificacion (asignación a docente+grupo)
    └── EstadoClaseGrupo (qué está activo)
    └── TareaAsignada (tareas asignadas al grupo)
```

---

## PASO 2: FLUJO DE CLASES Y CLASEGRUPO

### Origen: Admin crea ClaseGrupo

| Aspecto           | Valor                                  |
| ----------------- | -------------------------------------- |
| **Endpoint**      | `POST /admin/clase-grupos`             |
| **Controller**    | `AdminController`                      |
| **Service**       | `ClaseGruposService.crearClaseGrupo()` |
| **Tablas Prisma** | `ClaseGrupo`, `InscripcionClaseGrupo`  |

**Endpoints adicionales de Admin:**

- `PUT /admin/clase-grupos/:id` → Actualiza grupo
- `POST /admin/clase-grupos/:id/estudiantes` → Inscribe estudiantes
- `POST /admin/clase-grupos/:id/asistencias` → Registra asistencias

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                                 | Query/Filtro                        | Estado      |
| -------------- | ---- | ---------------------------------------- | ----------------------------------- | ----------- |
| **Docente**    | ✅   | `GET /clase-grupos/:id/detalle-completo` | `@Roles(DOCENTE, ADMIN)`            | ✅ OK       |
| **Estudiante** | ✅   | `GET /estudiantes/me/aula-virtual`       | Filtra por inscripción activa       | ✅ OK       |
| **Tutor**      | ⚠️   | `GET /tutor/proximas-clases`             | Resumen de clases, no detalle grupo | ⚠️ LIMITADO |

### Tablas Involucradas

```
ClaseGrupo
├── inscripciones: InscripcionClaseGrupo[]
├── asistencias: Asistencia[]
└── asignacionesPlanificacion: AsignacionPlanificacion[]
```

---

## PASO 3: FLUJO DE COMISIONES

### Origen: Admin crea Comisión

| Aspecto           | Valor                             |
| ----------------- | --------------------------------- |
| **Endpoint**      | `POST /admin/comisiones`          |
| **Controller**    | `AdminController`                 |
| **Service**       | `ComisionesService.create()`      |
| **Tablas Prisma** | `Comision`, `InscripcionComision` |

**Endpoints adicionales de Admin:**

- `POST /admin/comisiones/:id/estudiantes` → Inscribe estudiantes
- `POST /admin/comisiones/:id/estudiantes/nuevo` → Crea estudiante e inscribe

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                | Query/Filtro | Estado |
| -------------- | ---- | ----------------------- | ------------ | ------ |
| **Admin**      | ✅   | `GET /admin/comisiones` | Con filtros  | ✅ OK  |
| **Docente**    | ❌   | NO ENCONTRADO           | -            | ❌ GAP |
| **Tutor**      | ❌   | NO ENCONTRADO           | -            | ❌ GAP |
| **Estudiante** | ❌   | NO ENCONTRADO           | -            | ❌ GAP |

### Gap Identificado

**Problema:** Los docentes asignados a comisiones no tienen endpoint para ver sus comisiones ni los estudiantes inscritos.

**Recomendación:** Crear endpoint `GET /docentes/me/comisiones` similar a `GET /docentes/me/asignaciones-planificaciones`.

---

## PASO 4: FLUJO DE INSCRIPCIONES (CRÍTICO)

### Fuentes de Inscripción (Escritura)

| Fuente                | Endpoint                                   | Tabla Prisma            | Tipo             |
| --------------------- | ------------------------------------------ | ----------------------- | ---------------- |
| **Admin Manual**      | `POST /admin/clase-grupos/:id/estudiantes` | `InscripcionClaseGrupo` | MANUAL           |
| **Admin Comisión**    | `POST /admin/comisiones/:id/estudiantes`   | `InscripcionComision`   | MANUAL           |
| **Tutor Suscripción** | `POST /suscripciones`                      | `InscripcionActividad`  | SUSCRIPCION_2026 |

### Vista Unificada (Lectura)

| Aspecto              | Valor                                    |
| -------------------- | ---------------------------------------- |
| **Vista PostgreSQL** | `inscripciones_unificadas`               |
| **Modelo Prisma**    | `InscripcionUnificada`                   |
| **Campos fuente**    | `fuente: 'MANUAL' \| 'SUSCRIPCION_2026'` |

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                                 | Query/Filtro                  | Estado |
| -------------- | ---- | ---------------------------------------- | ----------------------------- | ------ |
| **Admin**      | ✅   | `GET /admin/estudiantes`                 | Include inscripciones         | ✅ OK  |
| **Docente**    | ✅   | `GET /clase-grupos/:id/detalle-completo` | Estudiantes inscritos         | ✅ OK  |
| **Tutor**      | ✅   | `GET /tutor/mis-inscripciones`           | `WHERE tutorId = req.user.id` | ✅ OK  |
| **Estudiante** | ✅   | `GET /estudiantes/me/aula-virtual`       | Sus inscripciones activas     | ✅ OK  |

### Diagrama de Flujo

```
ESCRITURA                              LECTURA
─────────                              ───────
Admin → InscripcionClaseGrupo ─┐
                               ├─→ VIEW inscripciones_unificadas → Todos los portales
Tutor → InscripcionActividad  ─┘
```

---

## PASO 5: FLUJO DE ASISTENCIA

### Origen: Admin/Docente registra asistencia

| Aspecto              | Valor                                       |
| -------------------- | ------------------------------------------- |
| **Endpoint Admin**   | `POST /admin/clase-grupos/:id/asistencias`  |
| **Endpoint Docente** | Mismo, validado por rol                     |
| **Service**          | `AsistenciasService.registrarAsistencias()` |
| **Tablas Prisma**    | `Asistencia`                                |

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                                            | Query/Filtro                       | Estado      |
| -------------- | ---- | --------------------------------------------------- | ---------------------------------- | ----------- |
| **Admin**      | ✅   | `GET /admin/clase-grupos/:id/asistencias/historial` | Historial completo                 | ✅ OK       |
| **Docente**    | ✅   | `GET /clase-grupos/:id/detalle-completo`            | Stats de asistencia por estudiante | ✅ OK       |
| **Tutor**      | ⚠️   | `GET /tutor/dashboard-resumen`                      | Solo alertas de baja asistencia    | ⚠️ LIMITADO |
| **Estudiante** | ❌   | NO ENCONTRADO                                       | -                                  | ❌ GAP      |

### Gap Identificado

**Problema:**

- Tutores solo ven alertas de asistencia baja, no historial detallado
- Estudiantes no tienen visibilidad de su propia asistencia

**Recomendación:** Agregar `GET /tutor/estudiantes/:id/asistencias` y `GET /estudiantes/me/asistencias`.

---

## PASO 6: FLUJO DE OBSERVACIONES

### Origen: Docente crea observación

| Aspecto           | Valor                                                 |
| ----------------- | ----------------------------------------------------- |
| **Endpoint**      | `POST /observaciones`                                 |
| **Controller**    | `ObservacionesController`                             |
| **Service**       | `ObservacionesService.crear()`                        |
| **Tablas Prisma** | `Observacion`, `ObservacionEstudiante`, `Seguimiento` |

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint             | Query/Filtro      | Estado         |
| -------------- | ---- | -------------------- | ----------------- | -------------- |
| **Admin**      | ✅   | `GET /observaciones` | Todas con filtros | ✅ OK          |
| **Docente**    | ✅   | `GET /observaciones` | Solo las propias  | ✅ OK          |
| **Tutor**      | ❌   | NO ENCONTRADO        | -                 | ❌ GAP CRÍTICO |
| **Estudiante** | ❌   | NO ENCONTRADO        | -                 | ❌ GAP CRÍTICO |

### Gap Identificado

**Problema CRÍTICO:** Los tutores NO pueden ver las observaciones de sus hijos. Los estudiantes tampoco ven su historial de observaciones.

**Recomendación:**

1. Crear `GET /tutor/estudiantes/:id/observaciones` con filtro de observaciones positivas o que el docente marque como visibles
2. Evaluar si los estudiantes deben ver sus observaciones (decisión de producto)

---

## PASO 7: FLUJO DE ANUNCIOS

### Origen: Docente crea anuncio

| Aspecto           | Valor                              |
| ----------------- | ---------------------------------- |
| **Endpoint**      | `POST /docentes/me/anuncios`       |
| **Controller**    | `AnunciosDocenteController`        |
| **Service**       | `AnunciosService.crearAnuncio()`   |
| **Tablas Prisma** | `Anuncio`, relación con `Comision` |

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                    | Query/Filtro                      | Estado |
| -------------- | ---- | --------------------------- | --------------------------------- | ------ |
| **Docente**    | ✅   | `GET /docentes/me/anuncios` | Sus propios anuncios              | ✅ OK  |
| **Tutor**      | ✅   | `GET /tutor/anuncios`       | Anuncios de docentes de sus hijos | ✅ OK  |
| **Estudiante** | ✅   | `GET /estudiantes/anuncios` | Anuncios de sus comisiones        | ✅ OK  |

### Estado: ✅ COMPLETO

---

## PASO 8: FLUJO DE GAMIFICACIÓN

### Origen: Docente/Admin otorga puntos

| Aspecto               | Valor                                                        |
| --------------------- | ------------------------------------------------------------ |
| **Endpoint**          | `POST /gamificacion/puntos`                                  |
| **Endpoint Insignia** | `POST /gamificacion/asignar-insignia`                        |
| **Controller**        | `GamificacionController`                                     |
| **Service**           | `GamificacionService.otorgarPuntos()`                        |
| **Tablas Prisma**     | `HistorialPuntos`, `RecursosEstudiante`, `LogroDesbloqueado` |

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                                    | Query/Filtro         | Estado |
| -------------- | ---- | ------------------------------------------- | -------------------- | ------ |
| **Admin**      | ✅   | `GET /gamificacion/dashboard/:estudianteId` | Cualquier estudiante | ✅ OK  |
| **Docente**    | ✅   | `GET /gamificacion/dashboard/:estudianteId` | Cualquier estudiante | ✅ OK  |
| **Tutor**      | ✅   | `GET /gamificacion/dashboard/:estudianteId` | Cualquier estudiante | ✅ OK  |
| **Estudiante** | ✅   | `GET /gamificacion/dashboard/:estudianteId` | Solo el propio       | ✅ OK  |

### Endpoints Adicionales

- `GET /gamificacion/logros/:estudianteId` → Todos los logros
- `GET /gamificacion/puntos/:estudianteId` → Puntos por ruta
- `GET /gamificacion/ranking/:estudianteId` → Ranking casa/global
- `GET /gamificacion/historial/:estudianteId` → Historial de puntos

### Estado: ✅ COMPLETO

---

## PASO 9: FLUJO DE SUSCRIPCIONES Y PAGOS

### Origen: Tutor crea suscripción

| Aspecto           | Valor                                                   |
| ----------------- | ------------------------------------------------------- |
| **Endpoint**      | `POST /suscripciones`                                   |
| **Controller**    | `SuscripcionesController`                               |
| **Service**       | `PreapprovalService.crear()`                            |
| **Tablas Prisma** | `Suscripcion`, `PagoSuscripcion`, `SuscripcionFamiliar` |

### Visibilidad por Portal

| Portal    | ¿Ve? | Endpoint                               | Query/Filtro      | Estado |
| --------- | ---- | -------------------------------------- | ----------------- | ------ |
| **Admin** | ✅   | `GET /suscripciones/admin`             | Todas con filtros | ✅ OK  |
| **Admin** | ✅   | `GET /suscripciones/admin/metricas`    | Dashboard         | ✅ OK  |
| **Admin** | ✅   | `GET /suscripciones/admin/morosas`     | Morosas           | ✅ OK  |
| **Tutor** | ✅   | `GET /suscripciones/mis-suscripciones` | Solo las propias  | ✅ OK  |
| **Tutor** | ✅   | `GET /suscripciones/:id`               | Detalle           | ✅ OK  |
| **Tutor** | ✅   | `GET /suscripciones/:id/pagos`         | Historial pagos   | ✅ OK  |

### Flujo de Pagos (Admin)

| Aspecto                      | Valor                                 |
| ---------------------------- | ------------------------------------- |
| **Pago Manual**              | `POST /admin/pagos/registrar`         |
| **Inscripciones Pendientes** | `GET /admin/pagos/pendientes`         |
| **Métricas**                 | `GET /pagos/dashboard/metricas`       |
| **Morosidad**                | `GET /pagos/morosidad/tutor/:tutorId` |

### Estado: ✅ COMPLETO

---

## PASO 10: FLUJO DE CONTENIDO (LIBROS/SANDBOX)

### Origen: Admin crea contenido

| Aspecto           | Valor                                             |
| ----------------- | ------------------------------------------------- |
| **Endpoint**      | `POST /contenidos`                                |
| **Controller**    | `ContenidoAdminController`                        |
| **Service**       | `ContenidoAdminService.create()`                  |
| **Tablas Prisma** | `Contenido`, `NodoContenido`, `ProgresoContenido` |

### Visibilidad por Portal

| Portal         | ¿Ve? | Endpoint                              | Query/Filtro            | Estado |
| -------------- | ---- | ------------------------------------- | ----------------------- | ------ |
| **Admin**      | ✅   | `GET /contenidos`                     | Todos con filtros       | ✅ OK  |
| **Admin**      | ✅   | `GET /contenidos/:id/arbol`           | Árbol de nodos          | ✅ OK  |
| **Estudiante** | ✅   | `GET /contenidos/estudiante`          | Publicados para su casa | ✅ OK  |
| **Estudiante** | ✅   | `GET /contenidos/estudiante/progreso` | Su progreso             | ✅ OK  |
| **Tutor**      | ❌   | NO ENCONTRADO                         | -                       | ❌ GAP |
| **Docente**    | ❌   | NO ENCONTRADO                         | -                       | ❌ GAP |

### Gap Identificado

**Problema:**

- Los tutores NO pueden ver qué contenidos están leyendo sus hijos ni su progreso
- Los docentes NO pueden ver el progreso de contenidos de sus estudiantes

**Recomendación:**

1. Crear `GET /tutor/estudiantes/:id/contenidos/progreso`
2. Evaluar si docentes necesitan ver progreso de contenidos

---

## Resumen de Gaps por Prioridad

### CRÍTICOS (Afectan funcionalidad core)

| Gap                   | Descripción                               | Portales Afectados | Solución                                              |
| --------------------- | ----------------------------------------- | ------------------ | ----------------------------------------------------- |
| Observaciones → Tutor | Tutores no ven observaciones de sus hijos | Tutor              | Crear endpoint `/tutor/estudiantes/:id/observaciones` |

### ALTOS (Afectan experiencia de usuario)

| Gap                     | Descripción                | Portales Afectados | Solución                               |
| ----------------------- | -------------------------- | ------------------ | -------------------------------------- |
| Asistencia → Tutor      | Solo alertas, no historial | Tutor              | Endpoint detallado de asistencias      |
| Asistencia → Estudiante | No ven su asistencia       | Estudiante         | Endpoint `/estudiantes/me/asistencias` |
| Contenidos → Tutor      | No ven progreso de hijos   | Tutor              | Endpoint de progreso por hijo          |
| Comisiones → Docente    | No ven sus comisiones      | Docente            | Endpoint `/docentes/me/comisiones`     |

### MEDIOS (Mejoras de visibilidad)

| Gap                  | Descripción                 | Portales Afectados | Solución                  |
| -------------------- | --------------------------- | ------------------ | ------------------------- |
| Comisiones → Tutor   | No ven comisiones de hijos  | Tutor              | Incluir en dashboard      |
| Contenidos → Docente | No ven progreso estudiantes | Docente            | Evaluar necesidad         |
| ClaseGrupo → Tutor   | Solo resumen, no detalle    | Tutor              | Endpoint de detalle grupo |

---

## Matriz de Visibilidad Completa

| Recurso       | Admin Escribe | Admin Lee | Docente Lee | Tutor Lee | Estudiante Lee |
| ------------- | ------------- | --------- | ----------- | --------- | -------------- |
| Planificacion | ✅            | ✅        | ✅          | ⚠️        | ✅             |
| ClaseGrupo    | ✅            | ✅        | ✅          | ⚠️        | ✅             |
| Comision      | ✅            | ✅        | ❌          | ❌        | ❌             |
| Inscripcion\* | ✅            | ✅        | ✅          | ✅        | ✅             |
| Asistencia    | ✅            | ✅        | ✅          | ⚠️        | ❌             |
| Observacion   | -             | ✅        | ✅          | ❌        | ❌             |
| Anuncio       | -             | -         | ✅          | ✅        | ✅             |
| Gamificacion  | ✅            | ✅        | ✅          | ✅        | ✅             |
| Suscripcion   | -             | ✅        | -           | ✅        | -              |
| Contenido     | ✅            | ✅        | ❌          | ❌        | ✅             |

**Leyenda:**

- ✅ = Endpoint existe y funciona
- ⚠️ = Acceso parcial/indirecto
- ❌ = Sin endpoint (GAP)
- `-` = No aplica para ese rol

\*Inscripcion: Usa vista unificada `inscripciones_unificadas`

---

## Recomendaciones de Implementación

### Sprint Inmediato (Críticos)

1. **Observaciones para Tutores**
   - Crear `GET /tutor/estudiantes/:id/observaciones`
   - Filtrar por: solo positivas O marcadas como "compartir con tutor"
   - Incluir fecha, tipo, texto resumido

### Sprint Siguiente (Altos)

2. **Asistencias Detalladas**
   - `GET /tutor/estudiantes/:id/asistencias`
   - `GET /estudiantes/me/asistencias`
   - Incluir: fecha, estado, porcentaje acumulado

3. **Progreso de Contenidos para Tutores**
   - `GET /tutor/estudiantes/:id/contenidos/progreso`
   - Incluir: contenido, % completado, tiempo invertido

4. **Comisiones para Docentes**
   - `GET /docentes/me/comisiones`
   - Similar a asignaciones de planificaciones

---

## Conclusión

La arquitectura de datos actual tiene una buena base con la vista unificada de inscripciones funcionando correctamente. Los principales gaps están en la **visibilidad cruzada** entre portales, especialmente:

1. **Tutor ↔ Sistema de Observaciones** (brecha crítica)
2. **Tutor ↔ Asistencias detalladas**
3. **Tutor ↔ Progreso de contenidos**
4. **Docente ↔ Comisiones**

La resolución de estos gaps mejorará significativamente la experiencia del tutor en el seguimiento académico de sus hijos.

---

## Resolución FASE 4 (2026-01-27)

### Gaps Implementados

| Gap                              | Endpoint/Cambio                                                 | Estado                         |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------ |
| Comisiones → Docente             | `GET /docentes/me/comisiones`                                   | ✅ **YA EXISTÍA** (verificado) |
| Progreso Contenidos → Tutor      | `GET /tutor/estudiantes/:estudianteId/contenidos/progreso`      | ✅ **IMPLEMENTADO**            |
| Comisiones → Tutor (vista hijos) | Agregado `comisiones: ComisionInfo[]` a `HijoInfo` en dashboard | ✅ **IMPLEMENTADO**            |

### Gaps Descartados (con justificación)

Los siguientes gaps fueron evaluados y descartados intencionalmente:

| Gap                               | Razón del Descarte                                                  |
| --------------------------------- | ------------------------------------------------------------------- |
| Observaciones → Tutor             | Son notas internas; flujo correcto es via notificaciones selectivas |
| Asistencia Detallada → Tutor      | El porcentaje + alertas de baja asistencia son suficientes          |
| Asistencia Detallada → Estudiante | Fuera del alcance del portal gamificado                             |
| Contenidos → Docente              | Acceden via planificaciones asignadas (flujo correcto)              |
| Productos → Estudiante            | Decisión de diseño: inscripciones las maneja el tutor               |

**Ver documentación completa:** [docs/decisiones/gaps-descartados-fase4.md](decisiones/gaps-descartados-fase4.md)
