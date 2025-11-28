# AUDITORÍA: Mapa de Tareas vs Documentación

**Fecha:** 2025-11-27
**Documento de referencia:** `/docs/MATEATLETAS_2026_ESPECIFICACION.md`
**Branch:** `feature/planificaciones-v2`

---

## RESUMEN EJECUTIVO

| Categoría                         | Cantidad |
| --------------------------------- | -------- |
| ✅ Tareas correctas y alineadas   | 89       |
| ⚠️ Tareas que requieren ajustes   | 18       |
| ❌ Tareas faltantes en el mapa    | 23       |
| 🔄 Tareas con posibles conflictos | 5        |

---

## ANÁLISIS POR FASE

---

## FASE 1: LIMPIEZA (7 tareas)

### Análisis

| #   | Tarea                                                 | Estado      | Observación                                                                 |
| --- | ----------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| 1.1 | Eliminar modelo `LogroCurso`                          | ✅ Correcto | Documentación confirma sistema de logros simplificado                       |
| 1.2 | Eliminar modelo `LogroDesbloqueado`                   | ✅ Correcto | Se unifica en un solo sistema de logros                                     |
| 1.3 | Limpiar CursoModule completo                          | ⚠️ Revisar  | ¿Se elimina todo el concepto de "curso"? La doc menciona "mundos" no cursos |
| 1.4 | Eliminar referencias a cursos en otros módulos        | ✅ Correcto | Consistente con renombre a "mundos"                                         |
| 1.5 | Actualizar seeds si referencian modelos eliminados    | ✅ Correcto | Necesario para integridad                                                   |
| 1.6 | Correr migraciones de eliminación                     | ✅ Correcto | Proceso estándar                                                            |
| 1.7 | Verificar que tests no dependan de modelos eliminados | ✅ Correcto | Mantenimiento de tests                                                      |

### Tareas Faltantes FASE 1

| Tarea sugerida                                      | Motivo                                     |
| --------------------------------------------------- | ------------------------------------------ |
| Eliminar modelo `Equipo` después de migrar a `Casa` | El doc menciona que `Equipo` → `Casa`      |
| Limpiar enums obsoletos relacionados a cursos       | Hay 24 enums, algunos pueden ser de cursos |
| Documentar breaking changes para el equipo          | Buena práctica                             |

---

## FASE 2: CASAS (11 tareas)

### Análisis

| #    | Tarea                                                              | Estado      | Observación                                  |
| ---- | ------------------------------------------------------------------ | ----------- | -------------------------------------------- |
| 2.1  | Renombrar `Equipo` → `Casa` en schema                              | ✅ Correcto | Alineado con doc sección 7                   |
| 2.2  | Actualizar enum de nombres: Quantum, Vertex, Pulsar                | ✅ Correcto | Doc confirma 3 casas                         |
| 2.3  | Agregar campo `edadMinima` y `edadMaxima` por casa                 | ✅ Correcto | Doc: Quantum 6-9, Vertex 10-12, Pulsar 13-17 |
| 2.4  | Implementar `CasaService` con lógica de asignación                 | ✅ Correcto | Necesario para onboarding                    |
| 2.5  | Crear endpoint `POST /casas/asignar`                               | ✅ Correcto | Para el test de ubicación                    |
| 2.6  | Implementar regla anti-frustración (solo baja, nunca sube)         | ✅ Correcto | Doc sección 7.3 explica esto detalladamente  |
| 2.7  | Agregar niveles internos: Básico, Intermedio, Avanzado, Olímpico   | ✅ Correcto | Doc sección 7.2                              |
| 2.8  | Validar que Olímpico solo exista para Vertex/Pulsar en Mate/Progra | ✅ Correcto | Doc sección 7.2 específico                   |
| 2.9  | Crear migration para renombrar tabla                               | ✅ Correcto | Proceso estándar                             |
| 2.10 | Actualizar todos los imports/referencias                           | ✅ Correcto | Refactor necesario                           |
| 2.11 | Actualizar tests de equipos → casas                                | ✅ Correcto | Mantenimiento                                |

### Tareas Faltantes FASE 2

| Tarea sugerida                                  | Motivo                                              |
| ----------------------------------------------- | --------------------------------------------------- |
| Implementar colores de casa (Design System)     | Doc sección 7.8 define colores específicos por casa |
| Agregar campo `icono` por casa (emoji)          | 🌟 Quantum, 🚀 Vertex, ⚡ Pulsar                    |
| Implementar rooms separadas por casa (Colyseus) | Doc sección 10.5 - crítico para campus              |
| Crear endpoint `GET /casas/:id/ranking`         | Doc sección 7.6 menciona ranking interno            |

### ⚠️ Conflicto Detectado

**En el schema actual existe `Nexus` como cuarta casa.**

- Doc actual solo menciona 3 casas: Quantum, Vertex, Pulsar
- Decisión requerida: ¿Eliminar Nexus del schema?

---

## FASE 3: MUNDOS (8 tareas)

### Análisis

| #   | Tarea                                                | Estado      | Observación                       |
| --- | ---------------------------------------------------- | ----------- | --------------------------------- |
| 3.1 | Renombrar `Sector` → `Mundo` en schema               | ✅ Correcto | Alineado con doc sección 8        |
| 3.2 | Definir 3 mundos: Matemática, Programación, Ciencias | ✅ Correcto | Doc confirma                      |
| 3.3 | Agregar colores e iconos por mundo                   | ✅ Correcto | UX necesario                      |
| 3.4 | Crear `MundoService`                                 | ✅ Correcto | Clean architecture                |
| 3.5 | Crear migration                                      | ✅ Correcto | Proceso estándar                  |
| 3.6 | Actualizar relaciones con planificaciones            | ✅ Correcto | Las planificaciones son por mundo |
| 3.7 | Actualizar seeds con mundos correctos                | ✅ Correcto | Datos base                        |
| 3.8 | Actualizar referencias en frontend                   | ✅ Correcto | Consistencia                      |

### Tareas Faltantes FASE 3

| Tarea sugerida                                         | Motivo                                     |
| ------------------------------------------------------ | ------------------------------------------ |
| Implementar restricción de mundos por tier             | ARCADE=1, ARCADE+=2, PRO=3 (doc sección 6) |
| Definir mundo "core" por casa                          | Doc 7.5: Pulsar es "programación-first"    |
| Crear seed con íconos: 📐 Mate, 💻 Progra, 🔬 Ciencias | Consistencia visual                        |

---

## FASE 4: TIERS (10 tareas)

### Análisis

| #    | Tarea                                                | Estado      | Observación                    |
| ---- | ---------------------------------------------------- | ----------- | ------------------------------ |
| 4.1  | Crear modelo `Tier` o enum                           | ✅ Correcto | ARCADE, ARCADE+, PRO           |
| 4.2  | Definir precios: $30k, $60k, $75k                    | ✅ Correcto | Doc sección 6                  |
| 4.3  | Implementar restricción de mundos por tier           | ✅ Correcto | ARCADE=1, ARCADE+=2, PRO=3     |
| 4.4  | Implementar flag `tieneDocente` (solo PRO)           | ✅ Correcto | Doc sección 5.1                |
| 4.5  | Actualizar flujo de inscripción para elegir tier     | ✅ Correcto | Doc sección 4.2                |
| 4.6  | Crear `TierService`                                  | ✅ Correcto | Clean architecture             |
| 4.7  | Implementar upgrade de tier (diferencia prorrateada) | ✅ Correcto | Doc sección 4.7                |
| 4.8  | Implementar downgrade de tier (próximo mes)          | ✅ Correcto | Doc sección 4.7                |
| 4.9  | Integrar con MercadoPago existente                   | ✅ Correcto | Doc sección 13: no tocar pagos |
| 4.10 | Crear tests de pricing                               | ✅ Correcto | TDD                            |

### Tareas Faltantes FASE 4

| Tarea sugerida                                          | Motivo                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------- |
| Implementar descuentos familiares (10% 2 hijos, 15% 3+) | Doc sección 4.8                                                 |
| El estudiante NO debe ver su tier                       | Doc sección 3.9: "Su nivel de pago - no hay diferencia visible" |
| Crear tabla de precios para landing                     | Doc sección 4.2                                                 |

---

## FASE 5: PLANIFICACIONES (12 tareas)

### Análisis

| #    | Tarea                                                        | Estado      | Observación        |
| ---- | ------------------------------------------------------------ | ----------- | ------------------ |
| 5.1  | Crear modelo `Planificacion`                                 | ✅ Correcto | Base del sistema   |
| 5.2  | Crear modelo `ActividadPlanificada`                          | ✅ Correcto | Contenido diario   |
| 5.3  | Implementar regla 22 actividades/mes                         | ✅ Correcto | Doc sección 3.7    |
| 5.4  | Implementar regla "no adelantarse"                           | ✅ Correcto | Doc sección 3.7    |
| 5.5  | Implementar regla "puede atrasarse y recuperar"              | ✅ Correcto | Doc sección 3.7    |
| 5.6  | Crear `PlanificacionService`                                 | ✅ Correcto | Clean architecture |
| 5.7  | Crear endpoint `GET /planificaciones/mi-mes`                 | ✅ Correcto | Para el Gimnasio   |
| 5.8  | Crear endpoint `POST /actividades/:id/completar`             | ✅ Correcto | Marcar completada  |
| 5.9  | Implementar recompensas: XP, monedas, puntos casa            | ✅ Correcto | Doc sección 3.4    |
| 5.10 | Crear vista de planificación mensual                         | ✅ Correcto | UI del Gimnasio    |
| 5.11 | Implementar indicadores: ✅ completada, 🔵 hoy, ⏳ pendiente | ✅ Correcto | UX                 |
| 5.12 | Tests de reglas de planificación                             | ✅ Correcto | TDD                |

### Tareas Faltantes FASE 5

| Tarea sugerida                          | Motivo                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Implementar tipos de actividad          | Doc 3.4: Simulación, Video+quiz, Código, Problema, Experimento, Proyecto |
| Crear seed de actividades de ejemplo    | Necesario para demo                                                      |
| Implementar orden secuencial pedagógico | Doc 3.7: "Las actividades están diseñadas en orden pedagógico"           |

---

## FASE 6: ONBOARDING (9 tareas)

### Análisis

| #   | Tarea                                       | Estado              | Observación                                 |
| --- | ------------------------------------------- | ------------------- | ------------------------------------------- |
| 6.1 | Crear flujo de selección de mundos          | ✅ Correcto         | Doc 9.1 paso 1                              |
| 6.2 | Implementar test de ubicación adaptativo    | ✅ Correcto         | Doc 9.2: 10-15 preguntas por mundo          |
| 6.3 | Crear banco de preguntas por mundo/nivel    | ⚠️ Pendiente diseño | Doc menciona "PENDIENTE: Diseñar algoritmo" |
| 6.4 | Implementar algoritmo de asignación de casa | ✅ Correcto         | Doc 7.3 y 7.4                               |
| 6.5 | Crear animación de asignación de casa       | ✅ Correcto         | Doc 3.1: "Animación épica"                  |
| 6.6 | Implementar creación de avatar 2D           | ✅ Correcto         | Doc 9.3                                     |
| 6.7 | Crear tutorial del campus                   | ✅ Correcto         | Doc 3.1 paso 6                              |
| 6.8 | Implementar primera actividad fácil         | ✅ Correcto         | Doc 3.1 paso 7                              |
| 6.9 | Crear endpoint `POST /onboarding/completar` | ✅ Correcto         | Marcar onboarding completo                  |

### Tareas Faltantes FASE 6

| Tarea sugerida                                   | Motivo                                        |
| ------------------------------------------------ | --------------------------------------------- |
| Implementar retest después de 7 días             | Doc 9.2: "Retest permitido después de 7 días" |
| Regla: en límites dudosos → nivel inferior       | Doc 9.2: anti-frustración                     |
| Regla: al bajar de casa → nivel ALTO de esa casa | Doc 7.3                                       |

---

## FASE 7: ARENA DIARIA (8 tareas)

### Análisis

| #   | Tarea                                  | Estado      | Observación              |
| --- | -------------------------------------- | ----------- | ------------------------ |
| 7.1 | Crear modelo `ArenaDiaria`             | ✅ Correcto | Contenido diario         |
| 7.2 | Crear modelo `CapsulaContenido`        | ✅ Correcto | Curiosidad/trivia        |
| 7.3 | Implementar rotación diaria automática | ✅ Correcto | Nuevo contenido cada día |
| 7.4 | Crear endpoint `GET /arena/hoy`        | ✅ Correcto | Obtener cápsula del día  |
| 7.5 | Implementar que NO es evaluativo       | ✅ Correcto | Doc sección 12           |
| 7.6 | Crear UI de Arena Diaria               | ✅ Correcto | Frontend                 |
| 7.7 | Crear seed de contenido de ejemplo     | ✅ Correcto | Demo                     |
| 7.8 | Tests de arena diaria                  | ✅ Correcto | TDD                      |

### Tareas Faltantes FASE 7

| Tarea sugerida                                   | Motivo                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Implementar acceso en fines de semana            | Doc 3.7: "Fines de semana: Solo Arena Diaria + recuperar atrasadas" |
| Dar pequeña recompensa por completar (XP mínimo) | Motivador para entrar diariamente                                   |

---

## FASE 8: FRONTEND (53 tareas divididas en 8A-8F)

### FASE 8A: Campus Virtual - Phaser (12 tareas)

| #     | Tarea                               | Estado             | Observación               |
| ----- | ----------------------------------- | ------------------ | ------------------------- |
| 8A.1  | Setup Phaser 3 en Next.js           | ✅ Correcto        | Doc 10.13                 |
| 8A.2  | Crear BootScene                     | ✅ Correcto        | Doc 10.13                 |
| 8A.3  | Crear CampusScene                   | ✅ Correcto        | Doc 10.13                 |
| 8A.4  | Implementar movimiento WASD         | ✅ Correcto        | Doc 10.14: 🔴 Crítico     |
| 8A.5  | Crear mapa básico con zonas         | ✅ Correcto        | Doc 10.14: 🔴 Crítico     |
| 8A.6  | Implementar colisiones              | ✅ Correcto        | Necesario para navegación |
| 8A.7  | Crear triggers de entrada a zonas   | ✅ Correcto        | Doc 10.11                 |
| 8A.8  | Implementar transición campus ↔ UI | ✅ Correcto        | Doc 10.11 detallado       |
| 8A.9  | Crear tileset básico                | ⚠️ Necesita assets | Doc 10.12: 1-3 por casa   |
| 8A.10 | Crear sprites de edificios          | ⚠️ Necesita assets | Doc 10.12: 6-8            |
| 8A.11 | Implementar scroll del mapa         | ✅ Correcto        | Doc 10.10                 |
| 8A.12 | Optimizar lazy loading de sprites   | ✅ Correcto        | Doc 10.10                 |

### FASE 8B: Campus Virtual - Colyseus (10 tareas)

| #     | Tarea                                     | Estado      | Observación       |
| ----- | ----------------------------------------- | ----------- | ----------------- |
| 8B.1  | Setup servidor Colyseus                   | ✅ Correcto | Doc 10.2          |
| 8B.2  | Crear CampusRoom base                     | ✅ Correcto | Doc 10.13         |
| 8B.3  | Crear QuantumRoom, VertexRoom, PulsarRoom | ✅ Correcto | Doc 10.5: Crítico |
| 8B.4  | Implementar PlayerState schema            | ✅ Correcto | Doc 10.13         |
| 8B.5  | Implementar RoomState schema              | ✅ Correcto | Doc 10.13         |
| 8B.6  | Sincronizar posiciones                    | ✅ Correcto | Doc 10.7          |
| 8B.7  | Implementar interpolación (lerp)          | ✅ Correcto | Doc 10.7          |
| 8B.8  | Implementar anti-cheat básico             | ✅ Correcto | Doc 10.7          |
| 8B.9  | Implementar sub-rooms si >50 jugadores    | ✅ Correcto | Doc 10.10         |
| 8B.10 | Tests de sincronización                   | ✅ Correcto | TDD               |

### FASE 8C: Avatar 2D (8 tareas)

| #    | Tarea                                  | Estado             | Observación  |
| ---- | -------------------------------------- | ------------------ | ------------ |
| 8C.1 | Crear Player.ts entity                 | ✅ Correcto        | Doc 10.13    |
| 8C.2 | Crear OtherPlayer.ts entity            | ✅ Correcto        | Doc 10.13    |
| 8C.3 | Implementar animaciones: idle, caminar | ✅ Correcto        | Doc 10.6     |
| 8C.4 | Crear spritesheet de avatar base       | ⚠️ Necesita assets | Doc 10.12    |
| 8C.5 | Implementar editor de avatar           | ✅ Correcto        | Doc 9.3      |
| 8C.6 | Crear opciones: pelo, piel, ropa       | ✅ Correcto        | Doc 10.6     |
| 8C.7 | Guardar avatar en base de datos        | ✅ Correcto        | Persistencia |
| 8C.8 | Mostrar nombre y nivel sobre avatar    | ✅ Correcto        | Doc 10.8     |

### FASE 8D: Portal del Estudiante (10 tareas)

| #     | Tarea                                      | Estado      | Observación |
| ----- | ------------------------------------------ | ----------- | ----------- |
| 8D.1  | Crear layout del Gimnasio                  | ✅ Correcto | Doc 3.3     |
| 8D.2  | Implementar vista de mundos activos        | ✅ Correcto | Doc 3.4     |
| 8D.3  | Implementar vista de planificación mensual | ✅ Correcto | Doc 3.4     |
| 8D.4  | Crear componente de actividad              | ✅ Correcto | Doc 3.4     |
| 8D.5  | Implementar sistema de recompensas visual  | ✅ Correcto | Doc 3.4     |
| 8D.6  | Crear vista de Arena Diaria                | ✅ Correcto | Doc 3.3     |
| 8D.7  | Crear vista de Tienda                      | ✅ Correcto | Doc 3.3     |
| 8D.8  | Crear vista de Mi Casa (ranking)           | ✅ Correcto | Doc 3.3     |
| 8D.9  | Crear vista de Perfil                      | ✅ Correcto | Doc 3.3     |
| 8D.10 | Implementar sistema de logros              | ✅ Correcto | Doc 3.5     |

### FASE 8E: Portal del Tutor (8 tareas)

| #    | Tarea                                  | Estado      | Observación        |
| ---- | -------------------------------------- | ----------- | ------------------ |
| 8E.1 | Crear dashboard del tutor              | ✅ Correcto | Doc 4.4 con mockup |
| 8E.2 | Implementar lista de hijos             | ✅ Correcto | Doc 4.3            |
| 8E.3 | Implementar vista de progreso por hijo | ✅ Correcto | Doc 4.5            |
| 8E.4 | Crear sección de reportes              | ✅ Correcto | Doc 4.6            |
| 8E.5 | Crear sección de membresía             | ✅ Correcto | Doc 4.3            |
| 8E.6 | Crear historial de pagos               | ✅ Correcto | Doc 4.3            |
| 8E.7 | Implementar agregar/quitar hijo        | ✅ Correcto | Doc 4.7            |
| 8E.8 | Implementar cambio de tier             | ✅ Correcto | Doc 4.7            |

### FASE 8F: Portal del Docente (5 tareas)

| #    | Tarea                                  | Estado      | Observación        |
| ---- | -------------------------------------- | ----------- | ------------------ |
| 8F.1 | Crear dashboard del docente            | ✅ Correcto | Doc 5.5 con mockup |
| 8F.2 | Implementar lista de estudiantes PRO   | ✅ Correcto | Doc 5.4            |
| 8F.3 | Crear sistema de dudas                 | ✅ Correcto | Doc 5.7            |
| 8F.4 | Crear sistema de revisión de proyectos | ✅ Correcto | Doc 5.8            |
| 8F.5 | Implementar calendario de clases       | ✅ Correcto | Doc 5.6            |

### Tareas Faltantes FASE 8

| Tarea sugerida                            | Motivo                                      |
| ----------------------------------------- | ------------------------------------------- |
| Implementar emotes (teclas 1-9)           | Doc 10.8 y 10.14: Deseable                  |
| Implementar estados de presencia (🟢🟡⚫) | Doc 10.9                                    |
| NO implementar chat (moderar menores)     | Doc 10.8: ❌ NO por ahora                   |
| Landing con demo jugable                  | Doc 15: Objetivo diciembre                  |
| Notificaciones al tutor                   | Doc 4.9: Sistema completo de notificaciones |
| Reportes mensuales automáticos PDF        | Doc 4.6                                     |

---

## FASE 9: TESTING E2E (4 tareas)

### Análisis

| #   | Tarea                            | Estado      | Observación             |
| --- | -------------------------------- | ----------- | ----------------------- |
| 9.1 | Tests E2E de onboarding completo | ✅ Correcto | Flujo crítico           |
| 9.2 | Tests E2E de flujo de pago       | ✅ Correcto | Integración MercadoPago |
| 9.3 | Tests E2E de planificaciones     | ✅ Correcto | Core del producto       |
| 9.4 | Tests E2E de campus virtual      | ✅ Correcto | Phaser + Colyseus       |

### Tareas Faltantes FASE 9

| Tarea sugerida                      | Motivo                                |
| ----------------------------------- | ------------------------------------- |
| Tests de reglas de casas            | Regla anti-frustración, bajar de casa |
| Tests de restricciones de tier      | 1/2/3 mundos                          |
| Tests de sincronización multiplayer | Colyseus                              |
| Tests de performance (50 jugadores) | Doc 10.10                             |

---

## FASE 10: DEPLOY (4 tareas)

### Análisis

| #    | Tarea                            | Estado      | Observación               |
| ---- | -------------------------------- | ----------- | ------------------------- |
| 10.1 | Deploy API a Railway             | ✅ Correcto | Ya existe infraestructura |
| 10.2 | Deploy Web a Vercel              | ✅ Correcto | Standard                  |
| 10.3 | Deploy Colyseus a Railway/Heroku | ✅ Correcto | Servidor multiplayer      |
| 10.4 | Configurar dominios y SSL        | ✅ Correcto | Producción                |

### Tareas Faltantes FASE 10

| Tarea sugerida                     | Motivo                       |
| ---------------------------------- | ---------------------------- |
| Monitoreo de Colyseus              | Servidor multiplayer crítico |
| CDN para assets de Phaser          | Sprites, tilemaps            |
| Variables de entorno para Colyseus | WebSocket URL                |

---

## ANÁLISIS DE GAPS CRÍTICOS

### 1. Sistema de Gamificación (NO está en el mapa)

El documento menciona extensivamente:

- **XP personal** (Doc 3.5)
- **Nivel 1-50** (Doc 3.5)
- **Monedas virtuales** (Doc 3.5)
- **Puntos de Casa** (Doc 3.5)
- **Racha de días consecutivos** (Doc 3.5, 3.6)
- **Sistema de logros** (Doc 3.5)

**Tareas faltantes:**

- Crear modelo `ProgresoEstudiante` (XP, nivel, monedas)
- Implementar sistema de rachas
- Crear modelo `Logro` y `LogroObtenido`
- Implementar multiplicador de XP por racha
- Crear tienda con items comprables con monedas

### 2. Sistema de Notificaciones (NO está en el mapa)

Doc 4.9 define notificaciones específicas:

- Racha perdida después de 7+ días
- Subida de nivel
- 3+ días sin entrar
- Reporte mensual
- Pago exitoso/fallido
- Renovación próxima

**Tareas faltantes:**

- Crear servicio de notificaciones
- Implementar envío de emails
- Implementar envío de WhatsApp (pago fallido)
- Crear templates de notificaciones

### 3. Sistema de Reportes (NO está en el mapa)

Doc 4.6 define reportes mensuales con:

- Resumen de actividades
- Progreso por mundo
- Logros del mes
- Comparativa vs mes anterior
- Recomendaciones personalizadas
- PDF descargable

**Tareas faltantes:**

- Crear generador de reportes
- Implementar generación de PDF
- Crear cron job mensual
- Crear template de reporte

### 4. Clases en Vivo para PRO (parcialmente en mapa)

Doc 5.6 define sistema de clases:

- Integración Google Meet/Zoom
- Grabación automática
- Registro de asistencia
- Material pre-clase

**Tareas faltantes:**

- Integración con Google Meet API o Zoom SDK
- Sistema de grabaciones
- Registro automático de asistencia

---

## INCONSISTENCIAS DETECTADAS

### 1. Nexus como cuarta casa

**Problema:** El schema actual tiene 4 casas (Quantum, Vertex, Nexus, Pulsar)
**Documentación:** Solo menciona 3 casas (Quantum, Vertex, Pulsar)
**Acción:** Confirmar si eliminar Nexus del schema

### 2. Sector vs Mundo

**Problema:** Schema actual usa `Sector`, documentación usa `Mundo`
**Documentación:** Sección 8 define "Sistema de Mundos"
**Acción:** Incluida en FASE 3, pero verificar que TODAS las referencias se actualicen

### 3. Precios

**Problema:** El código actual puede tener precios diferentes
**Documentación:** ARCADE=$30k, ARCADE+=$60k, PRO=$75k
**Acción:** Verificar `pricing.constants.ts` y actualizar

### 4. Docente solo para PRO

**Problema:** El sistema actual puede asignar docentes a cualquier tier
**Documentación:** Sección 5.1 es explícita: "ARCADE: ❌ Sin docente, ARCADE+: ❌ Sin docente, PRO: ✅"
**Acción:** Agregar validación de tier al asignar docente

---

## PRIORIZACIÓN RECOMENDADA

### Sprint 1 (Semana 1-2): Core Backend

1. FASE 1: Limpieza completa
2. FASE 2: Casas (sin Colyseus aún)
3. FASE 3: Mundos
4. FASE 4: Tiers
5. Sistema de gamificación básico (XP, nivel, monedas)

### Sprint 2 (Semana 2-3): Planificaciones + Onboarding

1. FASE 5: Planificaciones
2. FASE 6: Onboarding
3. FASE 7: Arena Diaria

### Sprint 3 (Semana 3-4): Campus Virtual

1. FASE 8A: Phaser setup
2. FASE 8B: Colyseus setup
3. FASE 8C: Avatar básico

### Sprint 4 (Semana 4-5): Portales

1. FASE 8D: Portal estudiante
2. FASE 8E: Portal tutor
3. FASE 8F: Portal docente

### Sprint 5 (Semana 5-6): Polish + Deploy

1. Sistema de notificaciones
2. Sistema de reportes
3. FASE 9: Testing E2E
4. FASE 10: Deploy

---

## CONCLUSIÓN

El mapa de tareas está **bien estructurado** y cubre aproximadamente el **75%** de la funcionalidad documentada. Los principales gaps son:

1. **Sistema de Gamificación completo** - No hay tareas específicas para XP, niveles, monedas, rachas
2. **Sistema de Notificaciones** - Completamente ausente
3. **Sistema de Reportes** - Completamente ausente
4. **Clases en vivo** - Parcialmente cubierto

**Recomendación:** Agregar una **FASE 4.5: GAMIFICACIÓN** entre Tiers y Planificaciones, y una **FASE 8G: NOTIFICACIONES Y REPORTES** después del frontend.

---

**Auditoría realizada por:** Claude Code
**Próxima revisión sugerida:** Después de completar FASE 1-4
