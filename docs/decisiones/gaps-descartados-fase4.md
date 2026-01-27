# Gaps Descartados - FASE 4

> **Fecha**: 2026-01-27
> **Contexto**: Auditoría de flujo de datos entre portales
> **Decisión por**: Análisis de costo/beneficio y arquitectura

---

## Resumen

Durante la auditoría FASE 3 se identificaron varios gaps en el flujo de datos entre portales. Después del análisis, se decidió implementar algunos y descartar otros. Este documento justifica los gaps descartados.

---

## Gaps Descartados

### 1. Observaciones → Tutor (Originalmente marcado como CRÍTICO)

**Descripción**: Los tutores no pueden ver las observaciones que los docentes hacen sobre sus hijos.

**Justificación del descarte**:

- Las observaciones son notas internas del docente para seguimiento pedagógico
- Muchas observaciones son notas de trabajo que no están redactadas para consumo externo
- Exponer observaciones sin filtrado podría generar malentendidos
- El flujo correcto es: Docente → Observación → Notificación selectiva → Tutor

**Alternativa implementada**:

- Los docentes pueden enviar notificaciones específicas a tutores
- Las observaciones "publicables" se canalizan via el sistema de notificaciones

**Impacto**: Bajo - El flujo de comunicación docente-tutor existe via notificaciones

---

### 2. Asistencia Detallada → Tutor

**Descripción**: Los tutores solo ven porcentaje de asistencia, no el detalle clase por clase.

**Justificación del descarte**:

- El porcentaje de asistencia es suficiente para el propósito de monitoreo parental
- El detalle clase por clase agrega complejidad sin valor proporcional
- Las alertas de asistencia baja (<70%) ya notifican problemas

**Alternativa existente**:

- `GET /tutor/dashboard-resumen` → incluye `asistenciaPromedio` por hijo
- Alertas automáticas cuando la asistencia cae debajo del umbral

**Impacto**: Bajo - El caso de uso está cubierto por alertas

---

### 3. Asistencia Detallada → Estudiante

**Descripción**: Los estudiantes no ven su historial de asistencia detallado.

**Justificación del descarte**:

- El portal estudiante está enfocado en gamificación y aprendizaje
- Mostrar historial de asistencia distrae del objetivo principal
- La asistencia es responsabilidad del tutor/docente, no del estudiante

**Alternativa existente**:

- Los estudiantes ven su XP y progreso en contenidos
- El sistema de gamificación recompensa la participación

**Impacto**: Nulo - Fuera del alcance del portal estudiante

---

### 4. Contenidos → Docente (visibilidad)

**Descripción**: Los docentes no tienen acceso directo al módulo de contenidos.

**Justificación del descarte**:

- Los contenidos se gestionan exclusivamente desde Admin
- Los docentes acceden a contenidos via planificaciones asignadas
- Dar acceso directo duplicaría funcionalidad y complicaría permisos

**Alternativa existente**:

- Admin crea planificaciones con contenidos
- Admin asigna planificaciones a grupos con docente
- Docente ve y gestiona las planificaciones asignadas via `/docentes/me/asignaciones`

**Impacto**: Nulo - El flujo via planificaciones es el correcto

---

### 5. Productos/Catálogo → Estudiante

**Descripción**: Los estudiantes no ven el catálogo de productos disponibles.

**Justificación del descarte**:

- Las decisiones de inscripción las toma el tutor, no el estudiante
- Mostrar catálogo a estudiantes podría generar presión hacia los tutores
- El portal estudiante está enfocado en contenido ya inscripto

**Alternativa existente**:

- Tutores ven catálogo y gestionan inscripciones
- Estudiantes acceden directamente a contenidos de sus inscripciones

**Impacto**: Nulo - Decisión de diseño consciente

---

## Gaps Implementados en FASE 4

Para referencia, estos gaps SÍ fueron implementados:

| Gap                              | Endpoint Creado                                  | Justificación                            |
| -------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| Comisiones → Docente             | `GET /docentes/me/comisiones`                    | **Ya existía** - Verificado en auditoría |
| Progreso Contenidos → Tutor      | `GET /tutor/estudiantes/:id/contenidos/progreso` | Permite monitoreo del avance educativo   |
| Comisiones → Tutor (vista hijos) | Agregado a `HijoInfo` en dashboard               | Contexto necesario para los tutores      |

---

## Criterios de Decisión

Los gaps se evaluaron según:

1. **Valor para el usuario**: ¿Mejora significativamente la experiencia?
2. **Costo de implementación**: ¿Cuánto esfuerzo requiere?
3. **Alternativas existentes**: ¿Hay otra forma de lograr el objetivo?
4. **Coherencia arquitectónica**: ¿Encaja con el diseño del sistema?
5. **Riesgos**: ¿Introduce problemas de seguridad o UX?

---

## Revisión Futura

Estos gaps pueden reconsiderarse si:

- Hay feedback explícito de usuarios solicitando la funcionalidad
- Cambian los requerimientos de negocio
- Se implementa un sistema de observaciones "publicables" con workflow de aprobación
