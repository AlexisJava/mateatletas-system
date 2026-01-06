import { z } from 'zod';

// ============================================================================
// ENUMS COMPARTIDOS - Sincronizados con Prisma schema
// ============================================================================

// ----------------------------------------------------------------------------
// SISTEMA DE CASAS Y MUNDOS (2026)
// ----------------------------------------------------------------------------

/**
 * Tipos de casa del sistema 2026
 * Las casas agrupan estudiantes por rango de edad
 */
export const casaTipoEnum = z.enum(['QUANTUM', 'VERTEX', 'PULSAR']);

export type CasaTipo = z.infer<typeof casaTipoEnum>;

export const CASA_TIPO = {
  QUANTUM: 'QUANTUM', // 6-9 años - Exploradores
  VERTEX: 'VERTEX', // 10-12 años - Constructores
  PULSAR: 'PULSAR', // 13-17 años - Dominadores
} as const satisfies Record<CasaTipo, CasaTipo>;

/**
 * Tipos de mundo STEAM (2026)
 * Los mundos representan las 3 áreas de conocimiento principales
 */
export const mundoTipoEnum = z.enum(['MATEMATICA', 'PROGRAMACION', 'CIENCIAS']);

export type MundoTipo = z.infer<typeof mundoTipoEnum>;

export const MUNDO_TIPO = {
  MATEMATICA: 'MATEMATICA', // Mundo de matemáticas - naranja
  PROGRAMACION: 'PROGRAMACION', // Mundo de programación - verde
  CIENCIAS: 'CIENCIAS', // Mundo de ciencias - azul
} as const satisfies Record<MundoTipo, MundoTipo>;

// ----------------------------------------------------------------------------
// TIERS DE SUSCRIPCIÓN
// ----------------------------------------------------------------------------

/**
 * Nombres de tier de suscripción (2026)
 * Define los niveles de acceso a la plataforma STEAM
 */
export const tierNombreEnum = z.enum(['STEAM_LIBROS', 'STEAM_ASINCRONICO', 'STEAM_SINCRONICO']);

export type TierNombre = z.infer<typeof tierNombreEnum>;

export const TIER_NOMBRE = {
  STEAM_LIBROS: 'STEAM_LIBROS', // $40k - Plataforma completa
  STEAM_ASINCRONICO: 'STEAM_ASINCRONICO', // $65k - Todo + clases grabadas
  STEAM_SINCRONICO: 'STEAM_SINCRONICO', // $95k - Todo + clases en vivo
} as const satisfies Record<TierNombre, TierNombre>;

// ----------------------------------------------------------------------------
// ESTADOS DE SUSCRIPCIÓN Y ACCESO
// ----------------------------------------------------------------------------

/**
 * Estados de una suscripción
 * Mapeados desde MercadoPago PreApproval + estados de negocio
 */
export const estadoSuscripcionEnum = z.enum([
  'PENDIENTE',
  'ACTIVA',
  'EN_GRACIA',
  'MOROSA',
  'PAUSADA',
  'CANCELADA',
]);

export type EstadoSuscripcion = z.infer<typeof estadoSuscripcionEnum>;

export const ESTADO_SUSCRIPCION = {
  PENDIENTE: 'PENDIENTE', // Esperando primer pago
  ACTIVA: 'ACTIVA', // Pagos al día, acceso completo
  EN_GRACIA: 'EN_GRACIA', // Falló cobro, dentro de 3 días de gracia
  MOROSA: 'MOROSA', // Pasó grace period sin pago, acceso bloqueado
  PAUSADA: 'PAUSADA', // Pausada voluntariamente (máx 30 días)
  CANCELADA: 'CANCELADA', // Cancelada definitivamente
} as const satisfies Record<EstadoSuscripcion, EstadoSuscripcion>;

/**
 * Estado del acceso de un estudiante a la plataforma
 * Independiente del estado de pago del tutor
 */
export const estadoAccesoEstudianteEnum = z.enum(['ACTIVO', 'SUSPENDIDO', 'VENCIDO', 'BECA']);

export type EstadoAccesoEstudiante = z.infer<typeof estadoAccesoEstudianteEnum>;

export const ESTADO_ACCESO_ESTUDIANTE = {
  ACTIVO: 'ACTIVO', // Acceso normal según su plan
  SUSPENDIDO: 'SUSPENDIDO', // Suspendido temporalmente por admin
  VENCIDO: 'VENCIDO', // Plan venció
  BECA: 'BECA', // Acceso por beca
} as const satisfies Record<EstadoAccesoEstudiante, EstadoAccesoEstudiante>;

// ----------------------------------------------------------------------------
// DÍAS DE LA SEMANA
// ----------------------------------------------------------------------------

/**
 * Día de la semana para clases recurrentes
 */
export const diaSemanaEnum = z.enum([
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
]);

export type DiaSemana = z.infer<typeof diaSemanaEnum>;

export const DIA_SEMANA = {
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
  DOMINGO: 'DOMINGO',
} as const satisfies Record<DiaSemana, DiaSemana>;

// ----------------------------------------------------------------------------
// INSCRIPCIONES A COMISIONES
// ----------------------------------------------------------------------------

/**
 * Estado de inscripción a una comisión (colonia, taller, evento)
 */
export const estadoInscripcionComisionEnum = z.enum([
  'Pendiente',
  'Confirmada',
  'Cancelada',
  'ListaEspera',
]);

export type EstadoInscripcionComision = z.infer<typeof estadoInscripcionComisionEnum>;

export const ESTADO_INSCRIPCION_COMISION = {
  Pendiente: 'Pendiente',
  Confirmada: 'Confirmada',
  Cancelada: 'Cancelada',
  ListaEspera: 'ListaEspera',
} as const satisfies Record<EstadoInscripcionComision, EstadoInscripcionComision>;

// ----------------------------------------------------------------------------
// TIPOS DE CLASE GRUPO
// ----------------------------------------------------------------------------

/**
 * Tipo de clase grupo
 */
export const tipoClaseGrupoEnum = z.enum(['GRUPO_REGULAR', 'CURSO_TEMPORAL']);

export type TipoClaseGrupo = z.infer<typeof tipoClaseGrupoEnum>;

export const TIPO_CLASE_GRUPO = {
  GRUPO_REGULAR: 'GRUPO_REGULAR', // Clase permanente del año lectivo
  CURSO_TEMPORAL: 'CURSO_TEMPORAL', // Curso con fecha de fin específica
} as const satisfies Record<TipoClaseGrupo, TipoClaseGrupo>;

// ----------------------------------------------------------------------------
// ESTADOS DE PAGO
// ----------------------------------------------------------------------------

/**
 * Estados del pago
 */
export const estadoPagoEnum = z.enum(['Pendiente', 'Pagado', 'Vencido', 'Parcial']);

export type EstadoPago = z.infer<typeof estadoPagoEnum>;

export const ESTADO_PAGO = {
  Pendiente: 'Pendiente',
  Pagado: 'Pagado',
  Vencido: 'Vencido',
  Parcial: 'Parcial',
} as const satisfies Record<EstadoPago, EstadoPago>;

// ----------------------------------------------------------------------------
// INTERVALOS DE SUSCRIPCIÓN
// ----------------------------------------------------------------------------

/**
 * Intervalo de cobro para suscripciones
 */
export const intervaloSuscripcionEnum = z.enum(['DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL']);

export type IntervaloSuscripcion = z.infer<typeof intervaloSuscripcionEnum>;

export const INTERVALO_SUSCRIPCION = {
  DIARIO: 'DIARIO',
  SEMANAL: 'SEMANAL',
  MENSUAL: 'MENSUAL',
  ANUAL: 'ANUAL',
} as const satisfies Record<IntervaloSuscripcion, IntervaloSuscripcion>;
