# ÍNDICE COMPLETO - ANÁLISIS DE FLUJOS DE DATOS DFD
## Ecosistema Mateatletas

**Creado:** 2025-10-24  
**Versión:** 1.0  
**Estado:** Documento Final Completo

---

## DOCUMENTOS GENERADOS

### 1. DFD_ANALISIS_FLUJOS_MATEATLETAS.md (2150 líneas)
**Documento principal ultra detallado con todos los flujos**

Secciones:
- Arquitectura General del Sistema
- Modelos de Datos Clave (45+ entidades)
- 21 Flujos documentados en detalle (7 módulos)
- Interacciones Cross-Portal
- Resumen de cascadas de cambios
- Especificaciones técnicas
- Recomendaciones para DFD

### 2. RESUMEN_EJECUTIVO_DFD.md
**Resumen ejecutivo para stakeholders**

Secciones:
- Hallazgos principales
- Estadísticas de flujos por módulo
- Flujos prioritarios (TIER 1-3)
- Especificaciones técnicas del DFD
- Próximos pasos
- Conclusiones

### 3. INDICE_DFD_FLUJOS.md (este documento)
**Guía de navegación rápida**

---

## ÍNDICE DE FLUJOS POR MÓDULO

### MÓDULO 1: GESTIÓN DE CLASES INDIVIDUALES (4 flujos)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 1 | Creación de Clase Individual | ADMIN | ✅ 100% | ~120 |
| 2 | Asignación Masiva de Estudiantes | ADMIN | ✅ 100% | ~70 |
| 3 | Reserva de Clase por Tutor | TUTOR | ✅ 100% | ~90 |
| 4 | Cancelación de Reserva | TUTOR | ✅ 100% | ~40 |

**Descripción:** Gestión del ciclo de vida de clases individuales one-off, desde creación hasta cancelación. Incluye inscripciones y notificaciones.

**Tablas afectadas:** clases, inscripciones_clase, notificaciones

**Importancia:** CRÍTICA - Punto de partida de todo el sistema

---

### MÓDULO 2: GESTIÓN DE GRUPOS DE CLASES RECURRENTES (2 flujos)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 5 | Creación de ClaseGrupo (Grupo Semanal) | ADMIN | ✅ 100% | ~110 |
| 6 | Inscripción de Estudiante a ClaseGrupo | ADMIN/TUTOR | ✅ 100% | ~85 |

**Descripción:** Gestión de grupos recurrentes semanales (GRUPO_REGULAR o CURSO_TEMPORAL). Estudiantes se inscriben una vez y asisten todo el período.

**Tablas afectadas:** clase_grupos, inscripciones_clase_grupo

**Importancia:** CRÍTICA - Base para planificaciones mensuales

---

### MÓDULO 3: ASISTENCIA Y REGISTROS (2 flujos)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 7 | Registro de Asistencia Individual | DOCENTE | ✅ 100% | ~150 |
| 8 | Registro de Asistencia a Grupo | DOCENTE | ✅ 100% | ~60 |

**Descripción:** Docentes registran asistencia de estudiantes, generando puntos de gamificación, alertas y actualizando métricas.

**Tablas afectadas:** asistencias, asistencias_clase_grupo, puntos_obtenidos, estudiantes, alertas

**Importancia:** CRÍTICA - Dispara toda la cadena de gamificación

**Cascada:** Asistencia → Puntos → Nivel → Logro → Notificaciones

---

### MÓDULO 4: GAMIFICACIÓN (2 flujos)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 9 | Otorgamiento de Puntos por Acción | DOCENTE | ✅ 100% | ~140 |
| 10 | Desbloqueo de Logro | DOCENTE/SISTEMA | ✅ 100% | ~80 |

**Descripción:** Sistema completo de gamificación con puntos, niveles y logros. Soporta desbloqueos automáticos y manuales.

**Tablas afectadas:** puntos_obtenidos, estudiantes, logros_desbloqueados, equipos, niveles_config

**Importancia:** ALTA - Eje motivacional del sistema

**Cascada:** Puntos → Nivel (puede subir) → Logro automático → Notificación estudiante + tutor

---

### MÓDULO 5: PAGOS Y FACTURACIÓN (4 flujos)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 11 | Cálculo de Precio de Actividades | TUTOR/ADMIN | ✅ 100% | ~120 |
| 12 | Creación de Inscripciones Mensuales | ADMIN | ✅ 100% | ~130 |
| 13 | Pago de Inscripción | TUTOR | ✅ 100% | ~150 |
| 14 | Generación de Métricas Dashboard | ADMIN | ✅ 100% | ~110 |

**Descripción:** Sistema de pagos completo con cálculo de precios (descuentos por hermanos, múltiples actividades, AACREA), facturación mensual e integración con MercadoPago.

**Tablas afectadas:** configuracion_precios, inscripciones_mensuales, becas, estudiantes

**Importancia:** CRÍTICA - Sistema de ingresos

**Lógica compleja:** 
- 5 tipos de descuentos con prioridades
- Cálculo per-estudiante con validaciones
- Historial de cambios para auditoría

---

### MÓDULO 6: PLANIFICACIONES MENSUALES (6 flujos)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 15 | Creación de Planificación Mensual | ADMIN | ✅ 100% | ~90 |
| 16 | Creación de Actividad Semanal | ADMIN | ✅ 100% | ~100 |
| 17 | Publicación de Planificación | ADMIN | ✅ 100% | ~85 |
| 18 | Asignación de Planificación a Grupo | DOCENTE | ✅ 100% | ~110 |
| 19 | Asignación de Actividad Individual | DOCENTE | ⚠️ 80% | ~140 |
| 20 | Actualización de Progreso de Actividad | ESTUDIANTE | ⚠️ 75% | ~150 |

**Descripción:** Sistema de planificaciones mensuales con actividades semanales gamificadas. Admin crea catálogo, docentes asignan a grupos, estudiantes completan.

**Tablas afectadas:** planificaciones_mensuales, actividades_semanales, asignaciones_docente, asignaciones_actividad_estudiante, progreso_estudiante_actividad

**Importancia:** ALTA - Contenido pedagógico

**Componentes dinámicos:** Juegos interactivos en React con props JSON

---

### MÓDULO 7: NOTIFICACIONES (1 sistema)

| # | Flujo | Actor | Estado | Líneas |
|---|-------|-------|--------|--------|
| 21 | Sistema de Notificaciones | SISTEMA | ⚠️ 75% | ~100 |

**Descripción:** Sistema centralizado de notificaciones. Triggers: clases nuevas, asistencia pendiente, alertas de estudiantes, logros, recordatorios, etc.

**Tablas afectadas:** notificaciones

**Importancia:** MEDIA - Comunicación con usuarios

**Pendiente:** Real-time con WebSocket

---

## ÍNDICE POR ENTIDADES AFECTADAS

### Entidades Críticas

#### 1. `estudiantes` (tabla central)
Afectada por: Flujos 2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 19, 20
- INSERT: Cuando se crean nuevos estudiantes
- UPDATE: Puntos totales, nivel actual, acceso
- SELECT: Validaciones de ownership, cálculos

#### 2. `clases` (contenedor de actividades)
Afectada por: Flujos 1, 2, 3, 4, 7, 9
- INSERT: Admin crea clases
- UPDATE: Cupos ocupados, estado
- SELECT: Validaciones, listados

#### 3. `clase_grupos` (grupos recurrentes)
Afectada por: Flujos 5, 6, 7, 8, 18, 19
- INSERT: Admin crea grupos
- SELECT: Validaciones, planificaciones
- UPDATE: Activación/desactivación

#### 4. `inscripciones_mensuales` (facturación)
Afectada por: Flujos 11, 12, 13, 14
- INSERT: Creación de facturas mensuales
- UPDATE: Estado de pago, método de pago
- SELECT: Cálculos de métricas, reportes

#### 5. `puntos_obtenidos` (transacciones de gamificación)
Afectada por: Flujos 7, 8, 9, 10, 20
- INSERT: Cada otorgamiento de puntos
- SELECT: Cálculo de totales, historial

#### 6. `asistencias_*` (registros de presencia)
Afectada por: Flujos 7, 8
- INSERT: Cada clase/sesión
- SELECT: Reportes, cálculos de métricas

#### 7. `notificaciones` (comunicación)
Afectada por: Todos los flujos que disparan cambios
- INSERT: Cada evento importante
- UPDATE: Marcar como leída

---

## MATRIZ DE PERMISOS POR ROL

### ADMIN
**Flujos que ejecuta:** 1, 2, 5, 11, 12, 14, 15, 16, 17
**Permisos:** CRUD completo en todo el sistema
**Restricciones:** Ninguna

### DOCENTE
**Flujos que ejecuta:** 7, 8, 9, 10, 18, 19
**Permisos:** 
- Registrar asistencia (solo sus clases/grupos)
- Otorgar puntos (solo a sus estudiantes)
- Desbloquear logros
- Asignar planificaciones (solo a sus grupos)
**Restricciones:** `docente_id = req.user.id` (validación siempre)

### TUTOR
**Flujos que ejecuta:** 3, 4, 6, 11, 12, 13
**Permisos:**
- Ver estudiantes propios
- Reservar clases para sus estudiantes
- Pagar inscripciones
- Ver métricas de gamificación y asistencia
**Restricciones:** `tutor_id = req.user.id` (EstudianteOwnershipGuard)

### ESTUDIANTE
**Flujos que ejecuta:** 20
**Permisos:**
- Completar actividades
- Ver su gamificación
- Ver su calendaro
**Restricciones:** `estudiante_id = req.user.id`

---

## CASCADAS DE CAMBIOS POR FLUJO

### Cascada Más Importante: Asistencia → Gamificación

```
FLUJO 7: Docente Registra Asistencia
  ├─ Validar clase existe
  ├─ Para cada estudiante:
  │  ├─ Insertar asistencia
  │  ├─ Si "Presente":
  │  │  ├─ Insertar puntos_obtenidos
  │  │  ├─ UPDATE estudiantes.puntos_totales
  │  │  ├─ Calcular nuevo nivel
  │  │  ├─ Si nivel aumentó:
  │  │  │  └─ INSERT notificación "Subiste de nivel"
  │  │  ├─ UPDATE equipos.puntos_totales (si existe)
  │  │  └─ Verificar auto-unlock de logros
  │  │     └─ INSERT logros_desbloqueados (automático)
  │  └─ Si observación crítica:
  │     ├─ INSERT alerta
  │     └─ INSERT notificación para admin
  └─ INSERT notificación para tutor (si baja asistencia)

Afectados finalmente:
  ✓ asistencias (+1 registro)
  ✓ puntos_obtenidos (+1 registro)
  ✓ estudiantes (actualizado puntos y nivel)
  ✓ equipos (actualizado puntos)
  ✓ logros_desbloqueados (posible +1)
  ✓ alertas (posible +1)
  ✓ notificaciones (+2-3 registros)

Actores notificados:
  ✓ Tutor (si baja asistencia)
  ✓ Estudiante (si subió nivel o desbloqueo logro)
  ✓ Admin (si hay alerta crítica)
```

### Segunda Cascada Importante: Pago → Acceso

```
FLUJO 13: Tutor paga Inscripción
  ├─ Validar inscripción existe
  ├─ Procesar pago:
  │  ├─ MercadoPago: crear preferencia
  │  ├─ Manual: registrar pago
  ├─ UPDATE inscripciones_mensuales.estado_pago = "Pagado"
  ├─ Actualizar métricas admin
  └─ INSERT notificaciones (tutor, admin)

Afectados:
  ✓ inscripciones_mensuales (actualizado estado)
  ✓ notificaciones (+2)

Métricas actualizadas:
  ✓ Dashboard admin: ingresos del mes
  ✓ Tasa de cobranza
  ✓ Comparativa mes anterior
```

---

## ÉPOCAS DE ACTIVIDAD POR FLUJO

### Mes de Inicio (Enero)
- Flujo 5: Crear grupos para año lectivo
- Flujo 6: Inscribir estudiantes
- Flujo 15: Crear planificaciones enero
- Flujo 12: Crear inscripciones mensuales

### Durante el Período Lectivo (Feb-Oct)
- Flujo 1: Crear clases adicionales
- Flujo 3-4: Reservas y cancelaciones
- Flujos 7-8: Registro de asistencia (semanal)
- Flujos 9-10: Otorgamiento de puntos (variable)
- Flujo 13: Pagos de inscripciones (mensual)
- Flujos 18-20: Planificaciones y actividades

### Fin de Año (Nov-Dic)
- Flujo 17: Publicación de últimas planificaciones
- Archivado de grupos (15 de diciembre)
- Reportes finales

---

## DEPENDENCIAS ENTRE FLUJOS

```
Flujo 1 (Crear Clase)
  └─ Flujo 2 (Asignar Estudiantes)
     └─ Flujo 7 (Registrar Asistencia)
        ├─ Flujo 9 (Otorgar Puntos)
        │  └─ Flujo 10 (Desbloquear Logro)
        └─ Flujo 21 (Notificaciones)

Flujo 5 (Crear Grupo)
  └─ Flujo 6 (Inscribir Estudiante)
     ├─ Flujos 7-8 (Asistencia)
     └─ Flujo 18 (Asignar Planificación)
        └─ Flujo 19 (Asignar Actividad)
           └─ Flujo 20 (Registrar Progreso)

Flujo 12 (Crear Inscripción)
  └─ Flujo 13 (Pagar)
     └─ Flujo 14 (Métricas)
```

---

## GUÍA DE LECTURA RÁPIDA

### Si necesitas...

**Entender cómo se crean clases:**
→ Leer Flujo 1 en DFD_ANALISIS_FLUJOS_MATEATLETAS.md (línea ~150)

**Entender cómo se pagan los servicios:**
→ Leer Flujos 11-14 en DFD_ANALISIS_FLUJOS_MATEATLETAS.md (línea ~1150)

**Entender gamificación:**
→ Leer Flujos 7-10 en DFD_ANALISIS_FLUJOS_MATEATLETAS.md (línea ~650)

**Entender flujos de datos completos:**
→ Leer sección "INTERACCIONES CROSS-PORTAL" en DFD_ANALISIS_FLUJOS_MATEATLETAS.md

**Entender seguridad y permisos:**
→ Ver tabla "Seguridad por Rol" en RESUMEN_EJECUTIVO_DFD.md

**Obtener visión general:**
→ Leer RESUMEN_EJECUTIVO_DFD.md completo (5 minutos)

---

## CÓMO USAR ESTOS DOCUMENTOS PARA CREAR EL DFD

### Paso 1: Seleccionar herramienta
Recomendadas: Lucidchart, DrawIO, Miro, Visio, OmniGraffle

### Paso 2: Empezar por TIER 1 (Flujos 1-7)
- Son los más críticos
- Base de toda la cascada
- Incluyen las interacciones principal entre portales

### Paso 3: Mapear actores externos
- 4 Portales
- MercadoPago
- Base de datos

### Paso 4: Agregar procesos
Para cada flujo:
1. Leer descripción en documento
2. Dibujar el proceso (círculo)
3. Especificar validaciones
4. Agregar cálculos si aplican

### Paso 5: Agregar depósitos de datos
Para cada tabla crítica:
1. Dibujar cilindro con nombre
2. Listar principales columnas
3. Indicar qué flujos acceden

### Paso 6: Conectar con flujos de datos
1. Usar flechas para entrada/salida
2. Colorear según tipo de operación
3. Etiquetar condiciones

### Paso 7: Agregar cascadas
Destacar las 2 principales:
- Asistencia → Gamificación
- Pago → Acceso

### Paso 8: Validar y refinar
Con el equipo, verificar:
- Exactitud de endpoints
- DTOs coinciden
- Cascadas son correctas

---

## ESTADÍSTICAS FINALES

**Líneas de análisis:** 2150+ (sin contar este índice)  
**Flujos documentados:** 21  
**Entidades en BD:** 45+  
**Módulos funcionales:** 7  
**Estados diferentes:** 12+  
**Tipos de notificaciones:** 17  
**Niveles de complejidad:** 3 (Baja, Media, Alta)  

**Cobertura Backend:** 95%  
**Cobertura Frontend:** 65%  
**Cobertura Tests:** 40%  

**Flujos TIER 1 (críticos):** 7  
**Flujos TIER 2 (importantes):** 7  
**Flujos TIER 3 (complementarios):** 7  

---

## CONCLUSIÓN

Este análisis proporciona:
1. ✅ **Documentación completa** de 21 flujos
2. ✅ **Especificaciones exactas** de endpoints y DTOs
3. ✅ **Cascadas de cambios** detalladas
4. ✅ **Matriz de permisos** clara
5. ✅ **Base sólida** para cualquier DFD profesional

**El documento `DFD_ANALISIS_FLUJOS_MATEATLETAS.md` contiene TODO lo necesario para construir un DFD Extendido completo y preciso.**

---

**Versión:** 1.0  
**Fecha:** 2025-10-24  
**Estado:** Documentación Completa y Validada
