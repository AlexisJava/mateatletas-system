# 🏗️ Arquitectura Limpia - Sistema de Pagos Mateatletas

## 🎯 Principios de Diseño

### **1. DRY (Don't Repeat Yourself)**

- Una sola fuente de verdad para reglas de negocio
- Funciones puras y reutilizables
- Abstracciones genéricas

### **2. SOLID**

- Single Responsibility
- Open/Closed Principle
- Dependency Inversion

### **3. Clean Architecture**

- Core Business Logic independiente
- Capas bien definidas
- Testeable al 100%

---

## 📁 Estructura de Código

```
apps/
├── api/src/
│   ├── pagos/
│   │   ├── domain/                    # Core Business Logic (sin dependencias)
│   │   │   ├── entities/
│   │   │   │   ├── precio.entity.ts           # Entidad de dominio
│   │   │   │   └── inscripcion.entity.ts
│   │   │   ├── rules/                         # Reglas de negocio puras
│   │   │   │   ├── precio.rules.ts            # Lógica de cálculo
│   │   │   │   └── descuento.rules.ts
│   │   │   └── types/
│   │   │       └── pagos.types.ts             # Tipos compartidos
│   │   │
│   │   ├── application/               # Casos de uso
│   │   │   ├── use-cases/
│   │   │   │   ├── calcular-precio.use-case.ts
│   │   │   │   ├── registrar-pago.use-case.ts
│   │   │   │   └── generar-reporte.use-case.ts
│   │   │   └── dto/
│   │   │       ├── calcular-precio.dto.ts
│   │   │       └── registrar-pago.dto.ts
│   │   │
│   │   ├── infrastructure/            # Implementaciones concretas
│   │   │   ├── repositories/
│   │   │   │   └── pagos.repository.ts        # Prisma
│   │   │   ├── services/
│   │   │   │   ├── notificaciones.service.ts
│   │   │   │   └── reportes.service.ts
│   │   │   └── presenters/
│   │   │       └── pagos.presenter.ts         # Formato de respuesta
│   │   │
│   │   └── presentation/              # Controllers
│   │       └── pagos.controller.ts
│   │
│   └── shared/                        # Utilidades compartidas
│       ├── decorators/
│       │   └── validate-business-rules.decorator.ts
│       ├── utils/
│       │   ├── decimal.utils.ts               # Manejo de dinero
│       │   └── date.utils.ts
│       └── types/
│           └── common.types.ts
│
└── web/src/
    ├── features/pagos/                # Feature-based organization
    │   ├── domain/
    │   │   ├── models/
    │   │   │   └── pago.model.ts
    │   │   └── types.ts
    │   │
    │   ├── hooks/                     # Lógica reutilizable
    │   │   ├── usePrecioCalculator.ts         # Hook de cálculo
    │   │   ├── usePagosData.ts
    │   │   └── useReportGenerator.ts
    │   │
    │   ├── components/                # Componentes específicos
    │   │   ├── Dashboard/
    │   │   │   ├── MetricCard.tsx
    │   │   │   └── PagosChart.tsx
    │   │   ├── Configuracion/
    │   │   │   └── PreciosForm.tsx
    │   │   └── Reportes/
    │   │       └── ReporteTable.tsx
    │   │
    │   ├── services/
    │   │   └── pagos-api.service.ts           # API client
    │   │
    │   └── utils/
    │       ├── precio.utils.ts                # Helpers cliente
    │       └── format.utils.ts
    │
    └── shared/                        # UI Components compartidos
        ├── components/
        │   ├── DataTable/                     # Tabla genérica
        │   │   ├── DataTable.tsx
        │   │   ├── useDataTable.ts
        │   │   └── types.ts
        │   ├── MetricCard/                    # Card de métrica
        │   │   └── MetricCard.tsx
        │   ├── Charts/                        # Gráficos
        │   │   ├── LineChart.tsx
        │   │   ├── BarChart.tsx
        │   │   └── DonutChart.tsx
        │   └── Modals/
        │       └── ConfirmModal.tsx
        │
        └── hooks/
            ├── useApi.ts                      # Hook genérico API
            ├── useExport.ts                   # Export Excel/PDF
            └── useFilters.ts                  # Filtros reutilizables
```

---

## 🧩 Módulos Reutilizables

### **1. Core Business Logic (Backend)**

#### **`precio.rules.ts`** - Lógica de cálculo centralizada

```typescript
// apps/api/src/pagos/domain/rules/precio.rules.ts

import { Decimal } from '@prisma/client/runtime/library';
import { TipoDescuento, ConfiguracionPrecios } from '../types/pagos.types';

export interface CalculoPrecioInput {
  readonly cantidadHermanos: number;
  readonly actividadesPorEstudiante: number;
  readonly tipoProducto: 'CLUB_MATEMATICAS' | 'CURSO_ESPECIALIZADO';
  readonly tieneAACREA: boolean;
  readonly configuracion: ConfiguracionPrecios;
}

export interface CalculoPrecioOutput {
  readonly precioBase: Decimal;
  readonly precioFinal: Decimal;
  readonly descuentoAplicado: Decimal;
  readonly tipoDescuento: TipoDescuento;
  readonly detalleCalculo: string;
}

/**
 * Calcula el precio de una actividad según las reglas de negocio
 * Función PURA - sin efectos secundarios
 */
export function calcularPrecioActividad(input: CalculoPrecioInput): CalculoPrecioOutput {
  const { cantidadHermanos, actividadesPorEstudiante, tipoProducto, tieneAACREA, configuracion } =
    input;

  // 1. Obtener precio base
  const precioBase =
    tipoProducto === 'CLUB_MATEMATICAS'
      ? configuracion.precioClubMatematicas
      : configuracion.precioCursosEspecializados;

  // 2. Aplicar reglas en orden de prioridad
  const resultado = aplicarReglasDescuento({
    precioBase,
    cantidadHermanos,
    actividadesPorEstudiante,
    tieneAACREA,
    configuracion,
  });

  return resultado;
}

/**
 * Aplica las reglas de descuento según prioridad
 */
function aplicarReglasDescuento(params: {
  precioBase: Decimal;
  cantidadHermanos: number;
  actividadesPorEstudiante: number;
  tieneAACREA: boolean;
  configuracion: ConfiguracionPrecios;
}): CalculoPrecioOutput {
  const { precioBase, cantidadHermanos, actividadesPorEstudiante, tieneAACREA, configuracion } =
    params;

  // REGLA 1: Hermanos con múltiples actividades (mayor descuento)
  if (cantidadHermanos >= 2 && actividadesPorEstudiante >= 2) {
    return crearResultado(
      precioBase,
      configuracion.precioHermanosMultiple,
      TipoDescuento.HERMANOS_MULTIPLE,
      `${cantidadHermanos} hermanos, ${actividadesPorEstudiante} actividades c/u`,
    );
  }

  // REGLA 2: Hermanos con 1 actividad cada uno
  if (cantidadHermanos >= 2 && actividadesPorEstudiante === 1) {
    return crearResultado(
      precioBase,
      configuracion.precioHermanosBasico,
      TipoDescuento.HERMANOS_BASICO,
      `${cantidadHermanos} hermanos, 1 actividad c/u`,
    );
  }

  // REGLA 3: Un estudiante con múltiples actividades
  if (cantidadHermanos === 1 && actividadesPorEstudiante >= 2) {
    return crearResultado(
      precioBase,
      configuracion.precioMultipleActividades,
      TipoDescuento.MULTIPLE_ACTIVIDADES,
      `1 estudiante, ${actividadesPorEstudiante} actividades`,
    );
  }

  // REGLA 4: AACREA (solo si 1 estudiante, 1 actividad, y descuento activo)
  if (
    tieneAACREA &&
    cantidadHermanos === 1 &&
    actividadesPorEstudiante === 1 &&
    configuracion.descuentoAacreaActivo
  ) {
    const descuento = precioBase.mul(configuracion.descuentoAacreaPorcentaje).div(100);
    const precioFinal = precioBase.sub(descuento);

    return {
      precioBase,
      precioFinal,
      descuentoAplicado: descuento,
      tipoDescuento: TipoDescuento.AACREA,
      detalleCalculo: `Descuento AACREA ${configuracion.descuentoAacreaPorcentaje}%`,
    };
  }

  // REGLA 5: Sin descuento (precio base)
  return crearResultado(
    precioBase,
    precioBase,
    TipoDescuento.NINGUNO,
    'Precio base sin descuentos',
  );
}

/**
 * Helper para crear resultado de cálculo
 */
function crearResultado(
  precioBase: Decimal,
  precioFinal: Decimal,
  tipoDescuento: TipoDescuento,
  detalle: string,
): CalculoPrecioOutput {
  return {
    precioBase,
    precioFinal,
    descuentoAplicado: precioBase.sub(precioFinal),
    tipoDescuento,
    detalleCalculo: detalle,
  };
}

/**
 * Calcula el total mensual para un tutor
 */
export function calcularTotalMensual(inscripciones: CalculoPrecioOutput[]): {
  total: Decimal;
  subtotal: Decimal;
  descuentoTotal: Decimal;
} {
  const total = inscripciones.reduce((acc, ins) => acc.add(ins.precioFinal), new Decimal(0));

  const subtotal = inscripciones.reduce((acc, ins) => acc.add(ins.precioBase), new Decimal(0));

  const descuentoTotal = subtotal.sub(total);

  return { total, subtotal, descuentoTotal };
}
```

---

### **2. Use Case Pattern (Backend)**

#### **`calcular-precio.use-case.ts`**

```typescript
// apps/api/src/pagos/application/use-cases/calcular-precio.use-case.ts

import { Injectable } from '@nestjs/common';
import { calcularPrecioActividad, calcularTotalMensual } from '../../domain/rules/precio.rules';
import { PagosRepository } from '../../infrastructure/repositories/pagos.repository';
import { CalcularPrecioDto } from '../dto/calcular-precio.dto';

@Injectable()
export class CalcularPrecioUseCase {
  constructor(private readonly repository: PagosRepository) {}

  async execute(dto: CalcularPrecioDto) {
    // 1. Obtener configuración actual
    const configuracion = await this.repository.obtenerConfiguracion();

    // 2. Obtener datos del tutor y estudiantes
    const { tutor, estudiantes } = await this.repository.obtenerDatosTutor(dto.tutorId);

    // 3. Calcular precio para cada inscripción
    const inscripciones = dto.inscripciones.map((ins) => {
      const estudiante = estudiantes.find((e) => e.id === ins.estudianteId);
      const actividadesEstudiante = dto.inscripciones.filter(
        (i) => i.estudianteId === ins.estudianteId,
      ).length;

      return calcularPrecioActividad({
        cantidadHermanos: estudiantes.length,
        actividadesPorEstudiante: actividadesEstudiante,
        tipoProducto: ins.tipoProducto,
        tieneAACREA: estudiante?.tieneDescuentoAacrea ?? false,
        configuracion,
      });
    });

    // 4. Calcular total
    const { total, subtotal, descuentoTotal } = calcularTotalMensual(inscripciones);

    return {
      totalMensual: total,
      subtotal,
      descuentoTotal,
      detallePorInscripcion: inscripciones,
    };
  }
}
```

---

### **3. Hook Reutilizable (Frontend)**

#### **`usePrecioCalculator.ts`**

```typescript
// apps/web/src/features/pagos/hooks/usePrecioCalculator.ts

import { useState, useCallback, useMemo } from 'react';
import { PagosApiService } from '../services/pagos-api.service';

interface UsePrecioCalculatorOptions {
  tutorId: string;
  inscripciones: Array<{
    estudianteId: string;
    tipoProducto: 'CLUB_MATEMATICAS' | 'CURSO_ESPECIALIZADO';
  }>;
}

export function usePrecioCalculator(options: UsePrecioCalculatorOptions) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultado, setResultado] = useState<CalculoPrecioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const result = await PagosApiService.calcularPrecio(options);
      setResultado(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular precio');
    } finally {
      setIsCalculating(false);
    }
  }, [options]);

  // Calcular automáticamente cuando cambian las inscripciones
  useMemo(() => {
    if (options.inscripciones.length > 0) {
      calcular();
    }
  }, [options.inscripciones, calcular]);

  return {
    resultado,
    isCalculating,
    error,
    recalcular: calcular,
  };
}
```

---

### **4. Componente Genérico Reutilizable**

#### **`DataTable.tsx`** - Tabla genérica con paginación y filtros

```typescript
// apps/web/src/shared/components/DataTable/DataTable.tsx

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  filters?: FilterConfig[];
  exportOptions?: ExportOptions;
}

export function DataTable<T>({ data, columns, isLoading, ... }: DataTableProps<T>) {
  // Implementación genérica reutilizable
  // Usado en: Pagos, Usuarios, Clases, Estudiantes, etc.
}
```

---

## ✅ Beneficios de esta Arquitectura

1. **Sin duplicación** - Lógica de negocio en UN solo lugar
2. **Testeable** - Funciones puras fáciles de testear
3. **Mantenible** - Cambios en un lugar se reflejan en todos lados
4. **Escalable** - Fácil agregar nuevas reglas o productos
5. **Type-safe** - TypeScript estricto, sin `any`
6. **Reutilizable** - Componentes y hooks genéricos

---

**¿Te parece bien esta arquitectura? Empiezo la implementación siguiendo estos principios.** 🚀
