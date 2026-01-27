import { z } from 'zod';

/**
 * Schemas Zod para Portal Tutor
 * Basados en /apps/api/src/tutor/types/tutor-dashboard.types.ts
 */

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export const tipoAlertaSchema = z.enum([
  'pagoVencido',
  'pagoPorVencer',
  'claseHoy',
  'asistenciaBaja',
]);
export const prioridadAlertaSchema = z.enum(['alta', 'media', 'baja']);
export const estadoPagoFilterSchema = z.enum(['Pendiente', 'Pagado', 'Vencido']);
export const estadoClaseSchema = z.enum(['Programada', 'EnVivo', 'Finalizada', 'Cancelada']);

// ============================================
// DASHBOARD TUTOR - Schemas
// ============================================

/**
 * Schema para alerta del dashboard
 */
export const alertaDashboardSchema = z.object({
  id: z.string(),
  tipo: tipoAlertaSchema,
  prioridad: prioridadAlertaSchema,
  titulo: z.string(),
  mensaje: z.string(),
  accion: z
    .object({
      label: z.string(),
      url: z.string(),
    })
    .optional(),
  metadata: z
    .object({
      estudianteId: z.string().optional(),
      estudianteNombre: z.string().optional(),
      monto: z.number().optional(),
      fechaVencimiento: z.string().optional(),
      claseId: z.string().optional(),
      claseHora: z.string().optional(),
      porcentajeAsistencia: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema para métricas del dashboard
 */
export const metricasDashboardSchema = z.object({
  totalHijos: z.number(),
  clasesDelMes: z.number(),
  totalPagadoAnio: z.number(),
  asistenciaPromedio: z.number(),
});

/**
 * Schema para información de hijo
 */
export const hijoInfoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  edad: z.number().nullable(),
  nivelEscolar: z.string().nullable(),
  casa: z.string().nullable(),
  xpTotal: z.number(),
  asistenciaPromedio: z.number(),
  avatarUrl: z.string().nullable(),
});

/**
 * Schema para pago pendiente
 */
export const pagoPendienteSchema = z.object({
  id: z.string(),
  monto: z.number(),
  concepto: z.string(),
  fechaVencimiento: z.string(),
  diasParaVencer: z.number(),
  estudianteId: z.string(),
  estudianteNombre: z.string(),
  estaVencido: z.boolean(),
});

/**
 * Schema para clase de hoy
 */
export const claseHoySchema = z.object({
  id: z.string(),
  hora: z.string(),
  nombreClase: z.string(),
  estudianteId: z.string(),
  estudianteNombre: z.string(),
  docenteNombre: z.string(),
  fechaHoraInicio: z.string(),
  urlReunion: z.string().optional(),
  puedeUnirse: z.boolean(),
});

/**
 * Schema para respuesta del dashboard completo
 */
export const dashboardResumenResponseSchema = z.object({
  metricas: metricasDashboardSchema,
  hijos: z.array(hijoInfoSchema),
  alertas: z.array(alertaDashboardSchema),
  pagosPendientes: z.array(pagoPendienteSchema),
  clasesHoy: z.array(claseHoySchema),
});

// ============================================
// PRÓXIMAS CLASES - Schemas
// ============================================

/**
 * Schema para clase próxima
 */
export const claseProximaSchema = z.object({
  id: z.string(),
  fechaHoraInicio: z.string(),
  fechaHoraFin: z.string(),
  duracionMinutos: z.number(),
  nombre: z.string(),
  docente: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
  }),
  estudiante: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
  }),
  estado: estadoClaseSchema,
  urlReunion: z.string().optional(),
  puedeUnirse: z.boolean(),
  esHoy: z.boolean(),
  esManana: z.boolean(),
  labelFecha: z.string(),
});

/**
 * Schema para respuesta de próximas clases
 */
export const proximasClasesResponseSchema = z.object({
  clases: z.array(claseProximaSchema),
  total: z.number(),
});

/**
 * Schema para respuesta de alertas
 */
export const alertasResponseSchema = z.object({
  alertas: z.array(alertaDashboardSchema),
  total: z.number(),
  hayAlertas: z.boolean(),
});

// ============================================
// INSCRIPCIONES - Schemas
// ============================================

/**
 * Schema para inscripción mensual
 * Nota: precioBase, descuentoAplicado, precioFinal son string (Decimal serializado)
 */
export const inscripcionMensualSchema = z.object({
  id: z.string(),
  tutorId: z.string(),
  estudianteId: z.string(),
  productoId: z.string(),
  periodo: z.string(),
  anio: z.number(),
  mes: z.number(),
  precioBase: z.string(), // Decimal serializado
  descuentoAplicado: z.string(), // Decimal serializado
  precioFinal: z.string(), // Decimal serializado
  tipoDescuento: z.string(),
  detalleCalculo: z.string(),
  estadoPago: estadoPagoFilterSchema,
  fechaPago: z.string().nullable(),
  metodoPago: z.string().nullable(),
  comprobanteUrl: z.string().nullable(),
  observaciones: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  estudiante: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
  }),
  producto: z.object({
    id: z.string(),
    nombre: z.string(),
  }),
});

/**
 * Schema para respuesta de mis inscripciones
 */
export const misInscripcionesResponseSchema = z.object({
  inscripciones: z.array(inscripcionMensualSchema),
  resumen: z.object({
    totalPendiente: z.number(),
    totalPagado: z.number(),
    cantidadInscripciones: z.number(),
    estudiantesUnicos: z.number(),
  }),
});

// ============================================
// CREAR HIJO - Schemas
// ============================================

/**
 * Schema para estudiante creado
 */
export const estudianteCreadoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  edad: z.number(),
  nivelEscolar: z.string(),
  casaId: z.string().nullable(),
});

/**
 * Schema para respuesta de crear hijo
 */
export const crearHijoResponseSchema = z.object({
  estudiante: estudianteCreadoSchema,
  credenciales: z.object({
    codigoAcceso: z.string(),
    password: z.string(),
  }),
});

// ============================================
// TIPOS DERIVADOS
// ============================================

export type TipoAlerta = z.infer<typeof tipoAlertaSchema>;
export type PrioridadAlerta = z.infer<typeof prioridadAlertaSchema>;
export type AlertaDashboardFromSchema = z.infer<typeof alertaDashboardSchema>;
export type HijoInfoFromSchema = z.infer<typeof hijoInfoSchema>;
export type DashboardResumenResponse = z.infer<typeof dashboardResumenResponseSchema>;
export type ProximasClasesResponse = z.infer<typeof proximasClasesResponseSchema>;
export type AlertasResponse = z.infer<typeof alertasResponseSchema>;
export type MisInscripcionesResponse = z.infer<typeof misInscripcionesResponseSchema>;
export type CrearHijoResponse = z.infer<typeof crearHijoResponseSchema>;
