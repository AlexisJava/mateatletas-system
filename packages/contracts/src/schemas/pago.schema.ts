import { z } from 'zod';

/**
 * Estados de membresía disponibles para los tutores.
 */
export const estadoMembresiaEnum = z.enum([
  'Pendiente',
  'Activa',
  'Vencida',
  'Cancelada',
]);

export type EstadoMembresia = z.infer<typeof estadoMembresiaEnum>;

/**
 * Estados de inscripción a cursos individuales.
 */
export const estadoInscripcionEnum = z.enum([
  'PreInscrito',
  'Inscrito',
  'Cancelado',
]);

export type EstadoInscripcion = z.infer<typeof estadoInscripcionEnum>;

const isoDate = z.union([z.string().datetime(), z.date()]);

/**
 * Información de un producto desde el punto de vista de pagos.
 */
export const productoPagoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});

/**
 * Schema de membresía activa.
 */
export const membresiaSchema = z.object({
  id: z.string(),
  tutor_id: z.string(),
  producto_id: z.string(),
  estado: estadoMembresiaEnum,
  fecha_inicio: isoDate.nullable(),
  fecha_vencimiento: isoDate.nullable(),
  pago_id: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
  producto: productoPagoSchema.optional(),
});

export type Membresia = z.infer<typeof membresiaSchema>;

/**
 * Schema de inscripción a curso.
 */
export const inscripcionCursoSchema = z.object({
  id: z.string(),
  estudiante_id: z.string(),
  producto_id: z.string(),
  estado: estadoInscripcionEnum,
  fecha_inscripcion: isoDate.nullable(),
  pago_id: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
  producto: productoPagoSchema.optional(),
});

export type InscripcionCurso = z.infer<typeof inscripcionCursoSchema>;

/**
 * Schema de preferencia de pago (MercadoPago).
 */
export const preferenciaPagoSchema = z.object({
  id: z.string(),
  init_point: z.string().url(),
  sandbox_init_point: z.string().url().optional(),
});

export type PreferenciaPago = z.infer<typeof preferenciaPagoSchema>;

/**
 * Request para crear preferencia de suscripción mensual.
 */
export const crearPreferenciaSuscripcionSchema = z.object({
  producto_id: z.string(),
});

export type CrearPreferenciaSuscripcionRequest = z.infer<
  typeof crearPreferenciaSuscripcionSchema
>;

/**
 * Request para crear preferencia de pago por curso.
 */
export const crearPreferenciaCursoSchema = z.object({
  producto_id: z.string(),
  estudiante_id: z.string(),
});

export type CrearPreferenciaCursoRequest = z.infer<
  typeof crearPreferenciaCursoSchema
>;

/**
 * Estado actual de la membresía de un tutor.
 */
export const estadoMembresiaResponseSchema = z.object({
  tiene_membresia: z.boolean(),
  membresia: membresiaSchema.nullable(),
});

export type EstadoMembresiaResponse = z.infer<typeof estadoMembresiaResponseSchema>;

/**
 * Métricas agregadas del dashboard de pagos.
 */
export const metricasGeneralesSchema = z.object({
  ingresosMesActual: z.string(),
  pagosPendientes: z.string(),
  inscripcionesActivas: z.number().int().nonnegative(),
  tasaCobroActual: z.string(),
  comparacionMesAnterior: z.object({
    ingresosCambio: z.string(),
    pendientesCambio: z.string(),
    inscripcionesCambio: z.number().int(),
    tasaCobroCambio: z.string(),
  }),
});

export const evolucionMensualSchema = z.object({
  periodo: z.string(),
  ingresos: z.string(),
  pendientes: z.string(),
  totalEsperado: z.string(),
});

export const distribucionEstadoPagoSchema = z.object({
  estado: z.string(),
  cantidad: z.number().int().nonnegative(),
  monto: z.string(),
  porcentaje: z.string(),
});

export const metricasDashboardResponseSchema = z.object({
  periodo: z.string(),
  metricas: metricasGeneralesSchema,
  evolucionMensual: z.array(evolucionMensualSchema),
  distribucionEstados: z.array(distribucionEstadoPagoSchema),
});

export type MetricasDashboardResponse = z.infer<
  typeof metricasDashboardResponseSchema
>;

/**
 * Configuración de precios editable por administradores.
 */
export const configuracionPreciosSchema = z.object({
  precioClubMatematicas: z.string(),
  precioCursosEspecializados: z.string(),
  precioMultipleActividades: z.string(),
  precioHermanosBasico: z.string(),
  precioHermanosMultiple: z.string(),
  descuentoAacreaPorcentaje: z.string(),
  descuentoAacreaActivo: z.boolean(),
});

export type ConfiguracionPrecios = z.infer<typeof configuracionPreciosSchema>;

/**
 * Historial de cambios de precios.
 */
export const historialCambioPreciosSchema = z.object({
  id: z.string(),
  valoresAnteriores: z.record(z.string()),
  valoresNuevos: z.record(z.string()),
  adminId: z.string(),
  motivoCambio: z.string().nullable(),
  fechaCambio: isoDate,
});

export type HistorialCambioPrecios = z.infer<
  typeof historialCambioPreciosSchema
>;

/**
 * Inscripción mensual con relaciones (vista administrativa).
 */
export const inscripcionMensualSchema = z.object({
  id: z.string(),
  estudianteId: z.string(),
  productoId: z.string(),
  tutorId: z.string(),
  periodo: z.string(),
  precioBase: z.string(),
  descuentoAplicado: z.string(),
  precioFinal: z.string(),
  tipoDescuento: z.string(),
  estadoPago: z.string(),
  fechaPago: isoDate.nullable(),
  estudiante: z.object({
    id: z.string(),
    nombre: z.string(),
    apellido: z.string(),
  }),
  producto: productoPagoSchema,
});

export type InscripcionMensualConRelaciones = z.infer<
  typeof inscripcionMensualSchema
>;

/**
 * Resumen de estudiantes con descuentos aplicados.
 */
export const estudianteConDescuentoSchema = z.object({
  estudianteId: z.string(),
  estudianteNombre: z.string(),
  tutorId: z.string(),
  tipoDescuento: z.string(),
  totalDescuento: z.string(),
  cantidadInscripciones: z.number().int().nonnegative(),
  precioOriginal: z.string(),
  precioFinal: z.string(),
});

export type EstudianteConDescuento = z.infer<
  typeof estudianteConDescuentoSchema
>;

/**
 * Request para actualizar configuración de precios.
 */
export const actualizarConfiguracionPreciosSchema = z.object({
  adminId: z.string(),
  precioClubMatematicas: z.number().optional(),
  precioCursosEspecializados: z.number().optional(),
  precioMultipleActividades: z.number().optional(),
  precioHermanosBasico: z.number().optional(),
  precioHermanosMultiple: z.number().optional(),
  descuentoAacreaPorcentaje: z.number().optional(),
  descuentoAacreaActivo: z.boolean().optional(),
  diaVencimiento: z.number().int().min(1).max(31).optional(),
  diasAntesRecordatorio: z.number().int().nonnegative().optional(),
  notificacionesActivas: z.boolean().optional(),
  motivoCambio: z.string().optional(),
});

export type ActualizarConfiguracionPreciosInput = z.infer<
  typeof actualizarConfiguracionPreciosSchema
>;
