# REFACTOR CASA/MUNDO 2026 - Estado y Documentación

**Fecha de inicio:** 2026-01-10
**Branch:** `feature/refactor-casa-mundo-architecture`
**Estado:** FASE 1 COMPLETADA

---

## CONTEXTO

Este refactor implementa el Sistema Casa/Mundo 2026 para la gestión de docentes, reemplazando el sistema legacy de Sectores/Rutas.

### Conceptos Clave

| Concepto            | Descripción                                                        |
| ------------------- | ------------------------------------------------------------------ |
| **Casa**            | Agrupación por edad: QUANTUM (6-9), VERTEX (10-12), PULSAR (13-17) |
| **Mundo**           | Disciplina STEAM: MATEMATICA, PROGRAMACION, CIENCIAS               |
| **GrupoPedagogico** | Contenedor de ClaseGrupos y/o Comisiones                           |
| **TipoAsignacion**  | Cómo trabaja el docente: CLASE_GRUPOS, COMISIONES, AMBOS           |
| **TipoAcceso**      | Modalidad estudiante: SYNC (vivo), ASYNC (grabaciones)             |

---

## FASES DEL REFACTOR

### FASE 1: Preparar nuevos modelos ✅ COMPLETADA

| Tarea                                                         | Estado | Commit     |
| ------------------------------------------------------------- | ------ | ---------- |
| 1.1 Crear DocenteCasa, DocenteMundo en schema                 | ✅     | `98b1ed2b` |
| 1.2 Renombrar Grupo → GrupoPedagogico + casa_tipo, mundo_tipo | ✅     | `98b1ed2b` |
| 1.3 Agregar tipo_acceso a InscripcionClaseGrupo               | ✅     | `98b1ed2b` |
| 1.4 Agregar grupo_id a Comision (opcional)                    | ✅     | `98b1ed2b` |
| 1.5 Agregar tipo_asignacion a Docente                         | ✅     | `98b1ed2b` |
| 1.6 Crear migración Prisma                                    | ✅     | `98b1ed2b` |
| 1.7 Eliminar código legacy Sectores/Rutas                     | ✅     | `98b1ed2b` |
| 1.8 Crear DocenteAsignacionesService                          | ✅     | `be2a8a27` |
| 1.9 Crear GrupoPedagogicoService                              | ✅     | `be2a8a27` |
| 1.10 Agregar endpoints al controlador                         | ✅     | `be2a8a27` |

### FASE 2: Frontend Admin ⏳ PENDIENTE

| Tarea                              | Estado | Descripción                           |
| ---------------------------------- | ------ | ------------------------------------- |
| 2.1 Vista de asignaciones docentes | ⏳     | UI para asignar Casa/Mundo a docentes |
| 2.2 Vista de grupos pedagógicos    | ⏳     | CRUD de grupos con filtros Casa/Mundo |
| 2.3 Actualizar vista de docentes   | ⏳     | Mostrar casas/mundos asignados        |

### FASE 3: Tests de Integración ⏳ PENDIENTE

| Tarea                                | Estado | Descripción                    |
| ------------------------------------ | ------ | ------------------------------ |
| 3.1 Tests DocenteAsignacionesService | ⏳     | Asignar/remover casa/mundo     |
| 3.2 Tests GrupoPedagogicoService     | ⏳     | CRUD grupos + migración legacy |
| 3.3 Tests endpoints admin            | ⏳     | E2E de todos los endpoints     |

### FASE 4: Seeds y Datos de Prueba ⏳ PENDIENTE

| Tarea                           | Estado | Descripción                               |
| ------------------------------- | ------ | ----------------------------------------- |
| 4.1 Seed DocenteCasa            | ⏳     | Datos de prueba desarrollo                |
| 4.2 Seed DocenteMundo           | ⏳     | Datos de prueba desarrollo                |
| 4.3 Actualizar docentes.seed.ts | ⏳     | Asignar casas/mundos a docentes de prueba |

---

## ARCHIVOS CREADOS/MODIFICADOS

### Nuevos Archivos (FASE 1)

```
apps/api/src/admin/services/docente-asignaciones.service.ts  (418 líneas)
apps/api/src/admin/services/grupo-pedagogico.service.ts      (234 líneas)
apps/api/prisma/migrations/20260110101957_sistema_casa_mundo_2026/
```

### Archivos Modificados (FASE 1)

```
apps/api/prisma/schema.prisma                    (nuevos modelos y enums)
apps/api/src/admin/admin.module.ts               (+2 providers)
apps/api/src/admin/admin.controller.ts           (+17 endpoints)
apps/api/prisma/seeds/index.ts                   (-seedSectores)
```

### Archivos Eliminados (código legacy)

```
apps/api/src/admin/services/sectores-rutas.service.ts
apps/api/src/admin/dto/sector.dto.ts
apps/api/src/admin/dto/ruta-especialidad.dto.ts
apps/api/prisma/seeds/sectores.seed.ts
apps/api/src/admin/__tests__/sectores-ciencias.spec.ts
apps/api/src/admin/__tests__/sectores-seed.spec.ts
apps/api/src/clases/__tests__/clases-sectores.spec.ts
apps/api/src/estudiantes/__tests__/copiar-estudiante-entre-sectores.spec.ts
```

---

## NUEVOS ENDPOINTS (17 total)

### Asignaciones de Docentes a Casas

| Método | Endpoint                                     | Descripción                 |
| ------ | -------------------------------------------- | --------------------------- |
| POST   | `/admin/docentes/:docenteId/casas`           | Asignar casa                |
| DELETE | `/admin/docentes/:docenteId/casas/:casaTipo` | Remover casa                |
| GET    | `/admin/docentes/:docenteId/casas`           | Obtener casas del docente   |
| GET    | `/admin/casas/:casaTipo/docentes`            | Listar docentes de una casa |

### Asignaciones de Docentes a Mundos

| Método | Endpoint                                       | Descripción                 |
| ------ | ---------------------------------------------- | --------------------------- |
| POST   | `/admin/docentes/:docenteId/mundos`            | Asignar mundo               |
| DELETE | `/admin/docentes/:docenteId/mundos/:mundoTipo` | Remover mundo               |
| GET    | `/admin/docentes/:docenteId/mundos`            | Obtener mundos del docente  |
| GET    | `/admin/mundos/:mundoTipo/docentes`            | Listar docentes de un mundo |

### Tipo de Asignación y Perfil

| Método | Endpoint                                     | Descripción                                     |
| ------ | -------------------------------------------- | ----------------------------------------------- |
| PATCH  | `/admin/docentes/:docenteId/tipo-asignacion` | Actualizar tipo (CLASE_GRUPOS/COMISIONES/AMBOS) |
| GET    | `/admin/docentes/:docenteId/asignaciones`    | Perfil completo de asignaciones                 |
| GET    | `/admin/docentes/filtrados`                  | Filtrar por casa/mundo/tipo                     |

### Grupos Pedagógicos

| Método | Endpoint                                  | Descripción            |
| ------ | ----------------------------------------- | ---------------------- |
| GET    | `/admin/grupos-pedagogicos`               | Listar con filtros     |
| GET    | `/admin/grupos-pedagogicos/:id`           | Obtener por ID         |
| PATCH  | `/admin/grupos-pedagogicos/:id`           | Actualizar casa/mundo  |
| POST   | `/admin/grupos-pedagogicos/migrar-legacy` | Migrar desde sector_id |
| GET    | `/admin/grupos-pedagogicos/estadisticas`  | Stats por casa/mundo   |

---

## MODELOS DE DATOS

### DocenteCasa (NUEVO)

```prisma
model DocenteCasa {
  id          String   @id @default(cuid())
  docente_id  String
  casa_tipo   CasaTipo
  asignado_en DateTime @default(now())

  docente     Docente  @relation(...)

  @@unique([docente_id, casa_tipo])
}
```

### DocenteMundo (NUEVO)

```prisma
model DocenteMundo {
  id          String    @id @default(cuid())
  docente_id  String
  mundo_tipo  MundoTipo
  asignado_en DateTime  @default(now())

  docente     Docente   @relation(...)

  @@unique([docente_id, mundo_tipo])
}
```

### Enums Agregados

```prisma
enum TipoAsignacionDocente {
  CLASE_GRUPOS
  COMISIONES
  AMBOS
}

enum TipoAccesoClase {
  SYNC
  ASYNC
}
```

### Campos Agregados a Modelos Existentes

| Modelo                | Campo Nuevo         | Tipo                                   |
| --------------------- | ------------------- | -------------------------------------- |
| Docente               | tipo_asignacion     | TipoAsignacionDocente (default: AMBOS) |
| GrupoPedagogico       | casa_tipo           | CasaTipo?                              |
| GrupoPedagogico       | mundo_tipo          | MundoTipo?                             |
| InscripcionClaseGrupo | tipo_acceso         | TipoAccesoClase (default: SYNC)        |
| Comision              | grupo_pedagogico_id | String?                                |

---

## RELACIÓN CON PLAN_CONSTRUCCION_2026.md

Este refactor es **complementario** a los slices del plan de construcción:

| Slice             | Relación                       |
| ----------------- | ------------------------------ |
| SLICE 1: CASAS    | ✅ Ya existía el modelo Casa   |
| SLICE 2: MUNDOS   | ✅ Ya existía el modelo Mundo  |
| SLICE 3: TIERS    | ✅ Ya existía                  |
| **Este refactor** | Conecta Docentes ↔ Casa/Mundo |

El plan de construcción se enfoca en:

- Estudiantes y su asignación a casas/mundos
- Onboarding
- Gamificación

Este refactor se enfoca en:

- Admin y gestión de docentes
- Asignación de docentes a casas/mundos
- Grupos pedagógicos

---

## COMMITS REALIZADOS

```
98b1ed2b feat(schema): implement Casa/Mundo 2026 system + remove legacy Sectores
         - Add DocenteCasa, DocenteMundo models
         - Rename Grupo → GrupoPedagogico
         - Add TipoAsignacionDocente, TipoAccesoClase enums
         - Delete Sector, RutaEspecialidad, DocenteRuta models
         - Remove legacy code (services, DTOs, tests, seeds)
         BREAKING CHANGE: Sector/Ruta system removed

be2a8a27 feat(admin): add Casa/Mundo 2026 services and endpoints
         - DocenteAsignacionesService (418 lines)
         - GrupoPedagogicoService (234 lines)
         - 17 new admin endpoints
```

---

## PRÓXIMOS PASOS RECOMENDADOS

### Opción A: Merge a dev/main

Si el backend está listo para integrarse.

### Opción B: Frontend Admin

Crear la UI para gestionar asignaciones Casa/Mundo.

### Opción C: Tests de Integración

Agregar cobertura de tests para los nuevos endpoints.

### Opción D: Seeds de Desarrollo

Agregar datos de prueba para docentes con casas/mundos asignados.

---

## COMANDOS ÚTILES

```bash
# Ver estado del branch
git log --oneline feature/refactor-casa-mundo-architecture

# Aplicar migración en otra DB
DATABASE_URL="..." npx prisma migrate deploy

# Regenerar Prisma Client
npx prisma generate

# Probar endpoints (requiere token admin)
curl -X GET http://localhost:3001/api/admin/grupos-pedagogicos/estadisticas \
  -H "Authorization: Bearer $TOKEN"
```

---

**Última actualización:** 2026-01-10
**Autor:** Claude + Alexis
