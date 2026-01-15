# Requisitos de Negocio - Portal Tutor

**Propósito:** Definir los requisitos de negocio ANTES de escribir tests.
**Metodología:** Black Box Testing - No mirar implementación.

---

## Contexto del Usuario

El **TUTOR** es el padre/madre/responsable legal de uno o más estudiantes.
Es quien PAGA las cuotas y necesita:

1. Ver el estado de sus hijos
2. Ver cuánto debe
3. Ver alertas importantes
4. Ver próximas clases de sus hijos

---

## ENDPOINT 1: GET /tutor/mis-inscripciones

### Requisito de Negocio

El tutor necesita ver todas las inscripciones mensuales de sus hijos con un resumen financiero.

### Comportamiento Esperado

**Autenticación:**

- Sin token → 401 Unauthorized
- Token de estudiante → 403 Forbidden
- Token de docente → 403 Forbidden
- Token de tutor válido → 200 OK

**Respuesta exitosa debe incluir:**

- Lista de inscripciones con: estudiante, período, monto, estado, fecha vencimiento
- Resumen financiero: total pendiente, total pagado, cantidad inscripciones

**Filtros opcionales:**

- `?periodo=2025-01` → Solo inscripciones de ese período
- `?estadoPago=Pendiente` → Solo pendientes
- `?estadoPago=Pagado` → Solo pagadas

### Clases de Equivalencia

| Clase                      | Descripción                         | Resultado Esperado        |
| -------------------------- | ----------------------------------- | ------------------------- |
| AUTH-VALIDO                | Tutor autenticado                   | 200 + datos               |
| AUTH-INVALIDO              | Sin token                           | 401                       |
| AUTH-ROL-INCORRECTO        | Estudiante/Docente                  | 403                       |
| DATOS-CON-INSCRIPCIONES    | Tutor con hijos inscritos           | Lista con N inscripciones |
| DATOS-SIN-INSCRIPCIONES    | Tutor sin hijos o sin inscripciones | Lista vacía, resumen en 0 |
| FILTRO-PERIODO-VALIDO      | Período existente                   | Solo ese período          |
| FILTRO-PERIODO-INEXISTENTE | Período sin datos                   | Lista vacía               |
| FILTRO-ESTADO-VALIDO       | Estado Pendiente/Pagado             | Solo ese estado           |

### Boundaries

| Boundary        | Valor                   | Resultado           |
| --------------- | ----------------------- | ------------------- |
| Período formato | `2025-01` (válido)      | OK                  |
| Período formato | `2025-1` (inválido)     | 400 o ignora filtro |
| Período formato | `enero-2025` (inválido) | 400 o ignora filtro |

---

## ENDPOINT 2: GET /tutor/dashboard-resumen

### Requisito de Negocio

El tutor necesita un resumen ejecutivo de su portal: métricas clave y alertas importantes.

### Comportamiento Esperado

**Autenticación:**

- Sin token → 401
- Rol incorrecto → 403
- Tutor válido → 200

**Respuesta debe incluir:**

- Métricas: cantidad de hijos, clases del mes, total pagado año, asistencia promedio
- Alertas: pagos vencidos, pagos por vencer (7 días), clases de hoy, asistencias bajas (<70%)
- Lista de pagos pendientes con fecha vencimiento
- Lista de clases de hoy

### Clases de Equivalencia

| Clase                | Descripción                      | Resultado                     |
| -------------------- | -------------------------------- | ----------------------------- |
| SIN-HIJOS            | Tutor sin estudiantes asociados  | Métricas en 0, alertas vacías |
| CON-HIJOS-SIN-CLASES | Hijos sin inscripciones a clases | clasesMes=0, clasesHoy=[]     |
| CON-HIJOS-CON-CLASES | Hijos con clases programadas     | clasesMes>0, clasesHoy si hay |
| CON-ALERTAS          | Pagos vencidos o por vencer      | alertas[] con items           |
| SIN-ALERTAS          | Todo al día                      | alertas[] vacío               |

### Filtros

| Filtro                         | Comportamiento                               |
| ------------------------------ | -------------------------------------------- |
| `?soloAlertas=true`            | Retorna solo alertas, sin métricas completas |
| `?soloAlertas=false` (default) | Retorna todo                                 |

---

## ENDPOINT 3: GET /tutor/proximas-clases

### Requisito de Negocio

El tutor necesita ver las próximas clases de TODOS sus hijos ordenadas cronológicamente.

### Comportamiento Esperado

**Autenticación:** Igual que anteriores (401/403/200)

**Respuesta por clase:**

- Información de la clase: fecha, hora, duración
- Estudiante asociado (nombre, apellido)
- Docente (nombre, apellido)
- Flags booleanos: `esHoy`, `esManana`, `puedeUnirse`
- Label amigable: "HOY", "MAÑANA", "LUN 15/02"

### Clases de Equivalencia

| Clase              | Descripción                      | Resultado                   |
| ------------------ | -------------------------------- | --------------------------- |
| SIN-CLASES         | Ningún hijo tiene clases futuras | Lista vacía                 |
| CON-CLASES-HOY     | Hay clases hoy                   | Items con esHoy=true        |
| CON-CLASES-MANANA  | Hay clases mañana                | Items con esManana=true     |
| CON-CLASES-FUTURAS | Clases en más de 2 días          | esHoy=false, esManana=false |

### Boundaries (limit)

| Valor     | Resultado                |
| --------- | ------------------------ |
| Sin limit | Usa default (5)          |
| limit=1   | Exactamente 1 clase      |
| limit=50  | Hasta 50 clases (máximo) |
| limit=51  | Error 400 o trunca a 50  |
| limit=0   | Error 400 o usa default  |
| limit=-1  | Error 400                |

---

## ENDPOINT 4: GET /tutor/alertas

### Requisito de Negocio

El tutor necesita ver todas las alertas activas ordenadas por prioridad (alta primero).

### Comportamiento Esperado

**Autenticación:** Igual que anteriores

**Tipos de alertas generadas:**

1. **PAGO_VENCIDO** (prioridad ALTA) - Cuota pasó fecha de vencimiento
2. **PAGO_POR_VENCER** (prioridad ALTA/MEDIA) - Cuota vence en próximos 7 días
3. **CLASE_HOY** (prioridad MEDIA) - Hay clase programada para hoy
4. **ASISTENCIA_BAJA** (prioridad ALTA/MEDIA) - Asistencia < 70%

**Estructura de alerta:**

- tipo: string (PAGO_VENCIDO, PAGO_POR_VENCER, etc.)
- prioridad: ALTA | MEDIA | BAJA
- mensaje: string descriptivo
- metadata: datos adicionales (estudianteId, monto, fechaVencimiento, etc.)

### Clases de Equivalencia

| Clase                  | Descripción                      | Resultado                                |
| ---------------------- | -------------------------------- | ---------------------------------------- |
| SIN-ALERTAS            | Todo al día, asistencia ok       | [] vacío                                 |
| ALERTA-PAGO-VENCIDO    | Cuota vencida                    | Alerta tipo PAGO_VENCIDO, prioridad ALTA |
| ALERTA-PAGO-POR-VENCER | Cuota vence en <7 días           | Alerta tipo PAGO_POR_VENCER              |
| ALERTA-CLASE-HOY       | Clase programada hoy             | Alerta tipo CLASE_HOY                    |
| ALERTA-ASISTENCIA-BAJA | Asistencia <70%                  | Alerta tipo ASISTENCIA_BAJA              |
| MULTIPLES-ALERTAS      | Varias alertas de diferente tipo | Ordenadas por prioridad ALTA primero     |

---

## Reglas de Negocio Transversales

### Aislamiento de Datos

- Un tutor SOLO puede ver datos de SUS hijos
- Un tutor NO puede ver datos de hijos de otro tutor
- El tutorId se obtiene del JWT, NUNCA del cliente

### Seguridad

- Todos los endpoints requieren autenticación
- Solo rol TUTOR puede acceder
- Rate limiting: 100 req/min (standard, no restrictivo como login)

### Consistencia

- Los montos siempre en la misma moneda (ARS)
- Las fechas siempre en timezone del servidor
- Los períodos siempre formato YYYY-MM

---

## Tests a Implementar

### Archivo: `tutor-portal.integration.spec.ts`

```
describe('GET /tutor/mis-inscripciones')
  - AUTH: should_return_401_when_not_authenticated
  - AUTH: should_return_403_when_estudiante_accesses
  - AUTH: should_return_403_when_docente_accesses
  - HAPPY: should_return_inscripciones_when_tutor_authenticated
  - EMPTY: should_return_empty_list_when_tutor_has_no_hijos
  - FILTER: should_filter_by_periodo
  - FILTER: should_filter_by_estadoPago
  - RESUMEN: should_include_financial_summary

describe('GET /tutor/dashboard-resumen')
  - AUTH: should_return_401_when_not_authenticated
  - HAPPY: should_return_dashboard_with_metrics_and_alertas
  - EMPTY: should_return_zero_metrics_when_no_hijos
  - ALERTAS: should_include_pago_vencido_alert
  - FILTER: should_return_only_alertas_when_soloAlertas_true

describe('GET /tutor/proximas-clases')
  - AUTH: should_return_401_when_not_authenticated
  - HAPPY: should_return_proximas_clases_ordered_by_date
  - FLAGS: should_mark_esHoy_true_for_today_classes
  - FLAGS: should_mark_esManana_true_for_tomorrow_classes
  - BOUNDARY: should_respect_limit_parameter
  - BOUNDARY: should_use_default_limit_when_not_provided

describe('GET /tutor/alertas')
  - AUTH: should_return_401_when_not_authenticated
  - HAPPY: should_return_alertas_ordered_by_priority
  - EMPTY: should_return_empty_when_no_alertas
  - PRIORITY: should_return_ALTA_priority_first
```
