# 💰 Módulo de Pagos y Contabilidad - Mateatletas

## 🎯 Visión General

Dashboard financiero completo para gestionar TODA la contabilidad del club, con métricas en tiempo real, seguimiento de pagos, notificaciones automáticas y reportes exportables.

---

## 📊 Secciones del Módulo `/admin/pagos`

### **1. Dashboard Principal - Vista Resumen** 📈

**Métricas Clave (Cards superiores):**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Ingresos Mes │ Pagos Pend.  │ Tasa Cobro   │ Morosidad    │
│  $1.234.000  │    $340.000  │     78%      │     22%      │
│  +12% ↑      │    15 tutores│  +5% ↑       │  -3% ↓       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Ingresos Año │ Estudiantes  │ Ing. Estimado│ Diferencia   │
│  $14.500.000 │  Activos: 42 │  $1.500.000  │  -$266.000   │
│  Promedio/mes│  Becados: 3  │  Próx. mes   │  Por cobrar  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Gráficos:**

1. **Gráfico de Línea: Ingresos vs Esperados (últimos 12 meses)**
   - Línea verde: Ingresos reales
   - Línea punteada azul: Ingresos estimados
   - Área roja: Diferencia (faltante)

2. **Gráfico de Barras: Ingresos por Producto**
   - Club Matemáticas
   - Robótica
   - Programación
   - Ciencias
   - Divulgación

3. **Gráfico de Dona: Distribución de Estado de Pagos**
   - Pagados (verde)
   - Pendientes (amarillo)
   - Vencidos (rojo)
   - Becados (azul)

---

### **2. Gestión de Pagos Mensuales** 💳

**Vista de Tabla Completa:**

| Tutor | Estudiantes | Actividades | Total Mes | Pagado | Pendiente | Estado | Acciones |
|-------|-------------|-------------|-----------|--------|-----------|--------|----------|
| Juan Pérez | 2 (Hermanos) | 4 total | $152.000 | $152.000 | $0 | ✅ Pagado | Ver detalle |
| María López | 1 | 2 | $88.000 | $44.000 | $44.000 | ⚠️ Parcial | Registrar pago |
| Carlos Gómez | 1 (AACREA) | 1 | $40.000 | $0 | $40.000 | 🔴 Vencido | Enviar recordatorio |

**Filtros:**
- Por mes/año
- Por estado (Todos, Pagados, Pendientes, Vencidos, Becados)
- Por tutor (búsqueda)
- Por producto

**Acciones masivas:**
- Enviar recordatorios seleccionados
- Marcar como pagado
- Generar reporte Excel/PDF
- Exportar comprobantes

---

### **3. Configuración de Precios** ⚙️

**Panel de Configuración:**

```
┌─────────────────────────────────────────────────────┐
│ Precios Base                                        │
├─────────────────────────────────────────────────────┤
│ Club de Matemáticas:              $ [50.000]       │
│ Cursos Especializados:            $ [55.000]       │
│                                                     │
│ Descuentos Especiales                              │
├─────────────────────────────────────────────────────┤
│ Múltiples Actividades (1 estudiante): $ [44.000]  │
│ Hermanos Básico (1 act c/u):          $ [44.000]  │
│ Hermanos Múltiple (2+ act c/u):       $ [38.000]  │
│                                                     │
│ Convenio AACREA                                     │
├─────────────────────────────────────────────────────┤
│ [✓] Activo                                          │
│ Descuento:                            [20] %        │
│                                                     │
│ [Simular Precios] [Ver Historial] [Guardar]       │
└─────────────────────────────────────────────────────┘
```

**Simulador de Precios:**
- Selector: Cantidad de hermanos
- Selector: Actividades por hermano
- Checkbox: Tiene AACREA
- **Output en tiempo real**: Precio total calculado

**Historial de Cambios:**
| Fecha | Admin | Cambios | Motivo | Antes | Después |
|-------|-------|---------|--------|-------|---------|
| 2025-01-15 | Admin | Club Mat | Ajuste inflación | $45.000 | $50.000 |

---

### **4. Detalle de Pago Individual** 📄

**Modal/Página de Detalle por Tutor:**

```
┌─────────────────────────────────────────────────────┐
│ Detalle de Pago - Juan Pérez                       │
│ Período: Enero 2025                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Estudiante 1: Martín Pérez                         │
│ ├─ Club Matemáticas         $38.000                │
│ └─ Robótica                  $38.000                │
│                                                     │
│ Estudiante 2: Lucía Pérez                          │
│ ├─ Club Matemáticas         $38.000                │
│ └─ Programación              $38.000                │
│                                                     │
│ Descuento aplicado: Hermanos con múltiples act.    │
│                                                     │
│ SUBTOTAL:                   $152.000                │
│ Descuentos:                 $68.000                 │
│ TOTAL A PAGAR:             $152.000                │
│                                                     │
│ Estado: ✅ Pagado el 05/01/2025                     │
│ Método: Transferencia bancaria                      │
│ Comprobante: [Ver imagen]                           │
│                                                     │
│ [Generar Comprobante PDF] [Enviar por Email]       │
└─────────────────────────────────────────────────────┘
```

---

### **5. Notificaciones de Pago** 🔔

**Sistema Automatizado:**

**Triggers:**
1. **Inicio de mes**: "Tu cuota de [mes] está disponible"
2. **Día 10**: "Recordatorio: Tu cuota vence en 5 días"
3. **Día 15**: "⚠️ Tu cuota vence hoy"
4. **Día 16+**: "🔴 Tu cuota está vencida"
5. **Pago recibido**: "✅ Pago confirmado. Gracias!"

**Configuración:**
```
┌─────────────────────────────────────────────────────┐
│ Configuración de Notificaciones                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Fecha de vencimiento:         [15] de cada mes     │
│                                                     │
│ Recordatorios automáticos:                         │
│ [✓] Inicio de mes (día 1)                          │
│ [✓] 5 días antes (día 10)                          │
│ [✓] Día de vencimiento (día 15)                    │
│ [✓] Después del vencimiento (diario)               │
│                                                     │
│ Canales:                                            │
│ [✓] Email                                           │
│ [✓] Notificación in-app                            │
│ [ ] WhatsApp (próximamente)                        │
│                                                     │
│ Plantillas de mensajes:                            │
│ [Editar recordatorio] [Editar vencimiento]         │
│                                                     │
│ [Guardar Configuración]                            │
└─────────────────────────────────────────────────────┘
```

**Vista de Notificaciones Enviadas:**
| Fecha | Tutor | Tipo | Canal | Estado |
|-------|-------|------|-------|--------|
| 2025-01-10 | Juan Pérez | Recordatorio | Email | ✅ Enviado |
| 2025-01-15 | María López | Vencimiento | Email + App | ✅ Leído |

---

### **6. Reportes Financieros** 📊

**Reportes Disponibles:**

**A. Reporte Mensual:**
- Total facturado
- Total cobrado
- Total pendiente
- Detalle por estudiante
- Detalle por producto
- Exportar: Excel, PDF

**B. Reporte Anual:**
- Ingresos por mes
- Comparativa año anterior
- Proyección próximos meses
- Gráficos de tendencia

**C. Reporte de Morosidad:**
- Tutores con pagos vencidos
- Días de atraso
- Monto total adeudado
- Historial de pagos

**D. Reporte de Descuentos:**
- Total de descuentos aplicados
- Por tipo (hermanos, múltiples, AACREA)
- Impacto en ingresos
- Estudiantes beneficiados

**E. Reporte por Producto:**
- Ingresos por Club Matemáticas
- Ingresos por Cursos
- Estudiantes por producto
- Rentabilidad

---

### **7. Gestión de Comprobantes** 📑

**Subir/Ver Comprobantes:**

```
┌─────────────────────────────────────────────────────┐
│ Comprobantes de Pago - Enero 2025                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Juan Pérez]                                        │
│ └─ 📎 comprobante_enero.jpg (Subido 05/01)         │
│    [Ver] [Descargar] [Eliminar]                    │
│                                                     │
│ [María López]                                       │
│ └─ ⚠️ Sin comprobante                              │
│    [Solicitar] [Subir manualmente]                 │
│                                                     │
│ [Búsqueda de comprobantes]                         │
└─────────────────────────────────────────────────────┘
```

---

### **8. Proyecciones e Ingresos Estimados** 📈

**Dashboard de Proyecciones:**

```
┌─────────────────────────────────────────────────────┐
│ Proyección de Ingresos                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Mes Actual (Enero):                                │
│ ├─ Estimado:        $1.500.000                     │
│ ├─ Real:            $1.234.000                     │
│ └─ Diferencia:      -$266.000 (82% cobrado)       │
│                                                     │
│ Próximo Mes (Febrero):                             │
│ ├─ Estimado:        $1.550.000 (+3%)              │
│ └─ Nuevas inscripciones: +2 estudiantes            │
│                                                     │
│ Proyección Trimestral:                             │
│ ├─ Enero-Marzo:     $4.500.000                     │
│ └─ Basado en: 42 estudiantes activos               │
│                                                     │
│ Gráfico de proyección (6 meses)                    │
│ [Gráfico de línea con proyección]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

### **9. Becas y Casos Especiales** 🎓

**Gestión de Becas:**

| Estudiante | Tipo Beca | Descuento | Producto | Fecha Inicio | Fecha Fin | Estado |
|------------|-----------|-----------|----------|--------------|-----------|--------|
| Ana García | Mérito Académico | 100% | Club Mat | 01/01/2025 | 31/12/2025 | ✅ Activa |
| Luis Torres | Beca Social | 50% | Robótica | 01/09/2024 | 31/08/2025 | ✅ Activa |

**Crear Nueva Beca:**
```
┌─────────────────────────────────────────────────────┐
│ Crear Beca Especial                                │
├─────────────────────────────────────────────────────┤
│ Estudiante:     [Seleccionar]                      │
│ Tipo de Beca:   [Mérito/Social/Otra]              │
│ Descuento:      [___] %  o  $ [_____] fijo        │
│ Productos:      [✓] Club Mat [ ] Cursos           │
│ Vigencia:       [01/01/2025] a [31/12/2025]       │
│ Motivo:         [_________________________]        │
│                                                     │
│ [Crear Beca]                                       │
└─────────────────────────────────────────────────────┘
```

---

### **10. Análisis y Estadísticas Avanzadas** 📊

**Dashboards Adicionales:**

**A. Tasa de Retención:**
- % de estudiantes que renuevan mes a mes
- Estudiantes que abandonaron
- Motivos de abandono

**B. Valor de Vida del Cliente (LTV):**
- Promedio de meses que permanece un estudiante
- Ingreso total promedio por estudiante
- Productos más rentables

**C. Análisis de Descuentos:**
- Impacto de descuentos en ingresos
- Descuentos más utilizados
- Eficiencia de convenios (AACREA)

**D. Comparativa Temporal:**
- Mes vs mes anterior
- Año vs año anterior
- Tendencias estacionales

---

## 🎨 Diseño Visual - Mateatletas OS

**Paleta de Colores:**
- 💰 Verde: Pagos confirmados, ingresos positivos
- ⚠️ Amarillo: Pagos pendientes, recordatorios
- 🔴 Rojo: Pagos vencidos, morosidad
- 💙 Azul: Becas, descuentos especiales
- 🔵 Índigo: Proyecciones, estimados

**Componentes Reutilizables:**
- Cards con glassmorphism
- Tablas con paginación y búsqueda
- Gráficos con Chart.js
- Modales para acciones
- Badges de estado
- Progress bars para porcentajes

---

## 🔧 Tecnología Backend

### **Endpoints API Necesarios:**

```typescript
// Configuración de precios
GET    /admin/pagos/configuracion-precios
PUT    /admin/pagos/configuracion-precios

// Dashboard y métricas
GET    /admin/pagos/dashboard
GET    /admin/pagos/metricas-mensuales?anio=2025&mes=1
GET    /admin/pagos/metricas-anuales?anio=2025

// Gestión de pagos
GET    /admin/pagos/inscripciones-mensuales?periodo=2025-01
POST   /admin/pagos/registrar-pago
PUT    /admin/pagos/inscripciones/:id
DELETE /admin/pagos/inscripciones/:id

// Notificaciones
GET    /admin/pagos/notificaciones/configuracion
PUT    /admin/pagos/notificaciones/configuracion
POST   /admin/pagos/enviar-recordatorio/:tutorId

// Reportes
GET    /admin/pagos/reportes/mensual?anio=2025&mes=1
GET    /admin/pagos/reportes/anual?anio=2025
GET    /admin/pagos/reportes/morosidad
GET    /admin/pagos/reportes/descuentos
POST   /admin/pagos/reportes/exportar (Excel/PDF)

// Comprobantes
POST   /admin/pagos/comprobantes/upload
GET    /admin/pagos/comprobantes/:id
DELETE /admin/pagos/comprobantes/:id

// Becas
GET    /admin/pagos/becas
POST   /admin/pagos/becas
PUT    /admin/pagos/becas/:id
DELETE /admin/pagos/becas/:id

// Proyecciones
GET    /admin/pagos/proyecciones/mes-actual
GET    /admin/pagos/proyecciones/trimestral
GET    /admin/pagos/proyecciones/anual
```

---

## ✅ Criterios de Éxito

- [ ] Dashboard muestra métricas en tiempo real
- [ ] Cálculo automático de precios según reglas
- [ ] Notificaciones automáticas funcionando
- [ ] Reportes exportables (Excel/PDF)
- [ ] Comprobantes subidos y almacenados
- [ ] Proyecciones precisas basadas en datos reales
- [ ] UI intuitiva y responsive
- [ ] Sin `any` ni `unknown` en código
- [ ] Tests con cobertura > 90%
- [ ] Performance < 2s para cargar dashboard

---

## 🚀 Fases de Implementación

### **Fase 1: Core (Esencial para v1)** ⭐
1. Schema de precios configurables
2. Cálculo automático de precios
3. Dashboard principal con métricas
4. Tabla de gestión de pagos
5. Panel de configuración de precios
6. Registro manual de pagos

### **Fase 2: Automatización** ⭐⭐
7. Sistema de notificaciones automáticas
8. Reportes básicos (mensual, anual)
9. Exportación Excel/PDF
10. Comprobantes de pago

### **Fase 3: Análisis Avanzado** ⭐⭐⭐
11. Proyecciones e ingresos estimados
12. Análisis de retención
13. Gestión de becas
14. Estadísticas avanzadas
15. Comparativas temporales

---

## 📋 Sugerencias Adicionales

**¿Qué más podrías necesitar?**

1. **Integración con MercadoPago** - Pagos online automáticos
2. **Generación de facturas** - PDF automático con número de factura
3. **Recordatorios por WhatsApp** - Integración con API de WhatsApp Business
4. **Dashboard para tutores** - Que vean sus pagos y adeudos
5. **Historial de pagos** - Ver todos los pagos históricos de un tutor
6. **Planes de pago** - Permitir pagos en cuotas
7. **Descuentos por pago anticipado** - Ej: 10% si pagan 3 meses juntos
8. **Alertas tempranas** - Predecir qué tutores podrían no pagar
9. **Integración contable** - Exportar a software contable (ej: Bejerman)
10. **Multi-moneda** - Por si expanden internacionalmente

---

¿Te gusta este diseño completo? ¿Empiezo con la Fase 1? 🚀
