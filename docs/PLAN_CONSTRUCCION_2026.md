# PLAN DE CONSTRUCCION - MATEATLETAS 2026

**Fecha de inicio:** 2025-11-27
**Metodologia:** Vertical Slices (feature completa de punta a punta)
**Branch:** `feature/planificaciones-v2`

---

## ESTADO INICIAL (Baseline)

| Metrica           | Valor                       |
| ----------------- | --------------------------- |
| Tests pasando     | 1352                        |
| Tests fallando    | 5 (Redis - infraestructura) |
| Tests skipped     | 157                         |
| Coverage actual   | 40.78%                      |
| Coverage objetivo | 80% en codigo nuevo         |

## ESTADO ACTUAL (Post-SLICE 2)

| Metrica        | Valor                       |
| -------------- | --------------------------- |
| Tests pasando  | 1404                        |
| Tests fallando | 0 (6 Redis solo localmente) |
| Tests skipped  | 157                         |
| Errores TS     | 0                           |

**Commits de referencia:**

- `pre-refactor-2026` (tag) - Estado antes de cualquier cambio
- FASE 1 completada - Limpieza de modelos legacy (LogroCurso, LogroDesbloqueado, Nexus)
- FASE 1.5 completada - Estabilizacion de tests

---

## METODOLOGIA

### Vertical Slices

Cada slice incluye:

1. **Tests primero (TDD)** - Escribir tests que fallen
2. **Backend** - Modelo, Service, Controller, DTOs
3. **Frontend** - Componentes, paginas, stores
4. **Tests pasando** - Verificar que todo funciona
5. **Commit** - Un commit limpio por slice completado

### Reglas innegociables

- PROHIBIDO: `any`, `unknown`, `@ts-ignore`, `@ts-nocheck`
- TDD: Test primero -> Codigo despues -> Refactor
- Coverage minimo 80% en codigo nuevo/modificado
- NO avanzar al siguiente slice si hay tests fallando
- Cada slice termina con commit descriptivo

---

## ORDEN DE SLICES

| #   | Slice           | Prioridad  | Dependencias         | Estado        |
| --- | --------------- | ---------- | -------------------- | ------------- |
| 1   | CASAS           | Critico    | Ninguna              | ✅ COMPLETADO |
| 2   | MUNDOS          | Critico    | Casas                | ✅ COMPLETADO |
| 3   | TIERS           | Critico    | Mundos               | Pendiente     |
| 4   | ONBOARDING      | Critico    | Casas, Mundos, Tiers | Pendiente     |
| 5   | PLANIFICACIONES | Critico    | Mundos               | Pendiente     |
| 6   | GAMIFICACION    | Importante | Casas                | Pendiente     |
| 7   | CAMPUS VIRTUAL  | Importante | Casas, Gamificacion  | Pendiente     |
| 8   | ARENA DIARIA    | Importante | Mundos               | Pendiente     |
| 9   | PORTAL TUTOR    | Deseable   | Tiers                | Pendiente     |
| 10  | PORTAL DOCENTE  | Deseable   | Tiers                | Pendiente     |

---

## SLICE 1: CASAS

### Alcance

Sistema de 3 casas organizadas por edad con niveles internos.

### Especificacion (de /docs/MATEATLETAS_2026_ESPECIFICACION.md)

**Estructura de casas:**
| Casa | Edad Base | Descripcion | Core |
|------|-----------|-------------|------|
| QUANTUM | 6-9 anos | Exploradores, descubrimiento | Descubrimiento |
| VERTEX | 10-12 anos | Constructores, builders | Construccion |
| PULSAR | 13-17 anos | Dominadores, skills reales | Dominio |

**Niveles internos por casa y mundo:**
| Casa | Matematica | Programacion | Ciencias |
|------|------------|--------------|----------|
| Quantum | Basico, Intermedio, Avanzado | Basico, Intermedio, Avanzado | Basico, Intermedio, Avanzado |
| Vertex | Basico, Intermedio, Avanzado, Olimpico | Basico, Intermedio, Avanzado, Olimpico | Basico, Intermedio, Avanzado |
| Pulsar | Basico, Intermedio, Avanzado, Olimpico | Basico, Intermedio, Avanzado, Olimpico | Basico, Intermedio, Avanzado |

**Reglas de ubicacion:**

- Edad determina casa BASE
- Test puede BAJARTE si no das el nivel
- NO podes SUBIR de casa por ser crack
- Pulsar solo puede bajar a Vertex (nunca a Quantum)
- Al bajar de casa, entras al nivel ALTO de esa casa

**Competencia:**

- NO hay competencia entre casas
- Competencia es INTERNA por casa (Quantum vs Quantum, etc.)

**Design System (Paleta Profesional/Tech):**

Quantum:

- Primary: #F472B6
- Secondary: #F9A8D4
- Accent: #FCE7F3
- Dark: #DB2777
- Gradient: linear-gradient(135deg, #F472B6 0%, #FB923C 100%)

Vertex:

- Primary: #38BDF8
- Secondary: #7DD3FC
- Accent: #E0F2FE
- Dark: #0284C7
- Gradient: linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)

Pulsar:

- Primary: #6366F1
- Secondary: #8B5CF6
- Accent: #6C7086
- Dark: #11111B
- Gradient: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)

### Tareas Backend

| #    | Tarea                                                         | Tests     | Estado    |
| ---- | ------------------------------------------------------------- | --------- | --------- |
| 1.1  | Renombrar modelo Equipo -> Casa en schema                     | Pendiente | Pendiente |
| 1.2  | Crear enum CasaTipo (QUANTUM, VERTEX, PULSAR)                 | Pendiente | Pendiente |
| 1.3  | Crear enum NivelCasa (BASICO, INTERMEDIO, AVANZADO, OLIMPICO) | Pendiente | Pendiente |
| 1.4  | Agregar campos edadMinima, edadMaxima a Casa                  | Pendiente | Pendiente |
| 1.5  | Agregar colores al modelo (primary, secondary, etc.)          | Pendiente | Pendiente |
| 1.6  | Crear CasaRepository                                          | Pendiente | Pendiente |
| 1.7  | Crear CasaService con logica de asignacion                    | Pendiente | Pendiente |
| 1.8  | Crear CasaController                                          | Pendiente | Pendiente |
| 1.9  | Crear DTOs (CreateCasaDto, AsignarCasaDto, etc.)              | Pendiente | Pendiente |
| 1.10 | Implementar endpoint GET /casas                               | Pendiente | Pendiente |
| 1.11 | Implementar endpoint GET /casas/:id                           | Pendiente | Pendiente |
| 1.12 | Implementar endpoint POST /casas/asignar                      | Pendiente | Pendiente |
| 1.13 | Implementar endpoint GET /casas/:id/ranking                   | Pendiente | Pendiente |
| 1.14 | Implementar regla anti-frustracion (solo baja)                | Pendiente | Pendiente |
| 1.15 | Actualizar relacion Estudiante.casa_id                        | Pendiente | Pendiente |
| 1.16 | Crear migracion Prisma                                        | Pendiente | Pendiente |
| 1.17 | Actualizar seeds con 3 casas y colores                        | Pendiente | Pendiente |

### Tareas Frontend

| #    | Tarea                                          | Tests     | Estado    |
| ---- | ---------------------------------------------- | --------- | --------- |
| 1.18 | Crear store de casas (Zustand/Context)         | Pendiente | Pendiente |
| 1.19 | Crear componente CasaCard                      | Pendiente | Pendiente |
| 1.20 | Crear componente CasaBadge                     | Pendiente | Pendiente |
| 1.21 | Crear componente RankingCasa                   | Pendiente | Pendiente |
| 1.22 | Crear pagina /estudiante/mi-casa               | Pendiente | Pendiente |
| 1.23 | Integrar colores de casa en theme              | Pendiente | Pendiente |
| 1.24 | Actualizar referencias de Equipo -> Casa en UI | Pendiente | Pendiente |

### Verificacion Final Slice 1

```bash
# Tests especificos de casas
npm run test -- --testPathPattern="casa"

# Build completo
npm run build

# Coverage del slice
npm run test:cov -- --collectCoverageFrom="**/casa*/**"
```

**Criterios de completitud:**

- [ ] Todos los tests de Casa pasando
- [ ] Coverage del slice > 80%
- [ ] Build sin errores
- [ ] Endpoints funcionando (probados con curl/Postman)
- [ ] UI mostrando casas correctamente
- [ ] Commit realizado

---

## SLICE 2: MUNDOS

### Alcance

Renombrar Sector -> Mundo. 3 mundos: Matematica, Programacion, Ciencias.

### Tareas Backend

| #   | Tarea                                                     | Estado    |
| --- | --------------------------------------------------------- | --------- |
| 2.1 | Renombrar Sector -> Mundo en schema                       | Pendiente |
| 2.2 | Crear enum MundoTipo (MATEMATICA, PROGRAMACION, CIENCIAS) | Pendiente |
| 2.3 | Agregar iconos y colores por mundo                        | Pendiente |
| 2.4 | Crear MundoService                                        | Pendiente |
| 2.5 | Crear MundoController                                     | Pendiente |
| 2.6 | Implementar restriccion de mundos por tier                | Pendiente |
| 2.7 | Actualizar relaciones con planificaciones                 | Pendiente |
| 2.8 | Migracion y seeds                                         | Pendiente |

### Tareas Frontend

| #    | Tarea                                  | Estado    |
| ---- | -------------------------------------- | --------- |
| 2.9  | Crear store de mundos                  | Pendiente |
| 2.10 | Crear componente MundoCard             | Pendiente |
| 2.11 | Actualizar referencias Sector -> Mundo | Pendiente |

---

## SLICE 3: TIERS

### Alcance

Sistema de 3 tiers: ARCADE ($30k), ARCADE+ ($60k), PRO ($75k).

### Tareas Backend

| #   | Tarea                                      | Estado    |
| --- | ------------------------------------------ | --------- |
| 3.1 | Crear enum TierSuscripcion                 | Pendiente |
| 3.2 | Agregar tier a Membresia y Tutor           | Pendiente |
| 3.3 | Crear TierService                          | Pendiente |
| 3.4 | Implementar restriccion de mundos por tier | Pendiente |
| 3.5 | Implementar flag tieneDocente (solo PRO)   | Pendiente |
| 3.6 | Implementar upgrade/downgrade de tier      | Pendiente |
| 3.7 | Implementar descuentos familiares          | Pendiente |
| 3.8 | Integrar con MercadoPago existente         | Pendiente |

### Tareas Frontend

| #    | Tarea                             | Estado    |
| ---- | --------------------------------- | --------- |
| 3.9  | Crear componente TierSelector     | Pendiente |
| 3.10 | Crear pagina de pricing           | Pendiente |
| 3.11 | El estudiante NO debe ver su tier | Pendiente |

---

## SLICES 4-10

(Detalle a completar cuando lleguemos a cada slice)

---

## REGISTRO DE PROGRESO

### Semana 1 (27 Nov - 3 Dic)

| Fecha | Slice  | Avance                                          | Bloqueantes |
| ----- | ------ | ----------------------------------------------- | ----------- |
| 27/11 | Setup  | FASE 1 y 1.5 completadas                        | -           |
| 28/11 | CASAS  | Rename equipo→casa, fix 83 errores TS, 41 tests | -           |
| 28/11 | CASAS  | ✅ COMPLETADO - Indice pin, tests verdes        | -           |
| 28/11 | MUNDOS | ✅ COMPLETADO - Modelo, Service, Controller     | -           |

### Metricas por Slice Completado

| Slice     | Tests Agregados | Errores TS Resueltos | Fecha Completado |
| --------- | --------------- | -------------------- | ---------------- |
| 1. Casas  | 41              | 83                   | 28/11/2025       |
| 2. Mundos | 21              | 0                    | 28/11/2025       |
| 3. Tiers  | -               | -                    | -                |

---

## COMANDOS UTILES

```bash
# Ver estado de tests
npm run test

# Coverage completo
npm run test:cov

# Coverage de un slice especifico
npm run test:cov -- --collectCoverageFrom="**/casas/**"

# Build
npm run build

# Lint
npm run lint

# Generar migracion
npx prisma migrate dev --name nombre_migracion

# Ver schema actual
npx prisma studio
```

---

## SI ALGO SALE MAL

```bash
# Volver al estado pre-refactor
git reset --hard pre-refactor-2026

# Volver a un slice especifico
git log --oneline  # buscar el commit
git reset --hard <commit-hash>
```

---

**Ultima actualizacion:** 2025-11-28
**Proximo slice:** 3. TIERS
