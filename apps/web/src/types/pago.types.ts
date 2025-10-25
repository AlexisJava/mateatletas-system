import {
  estadoMembresiaEnum,
  estadoInscripcionEnum,
  membresiaSchema,
  inscripcionCursoSchema,
  preferenciaPagoSchema,
  crearPreferenciaSuscripcionSchema,
  crearPreferenciaCursoSchema,
  estadoMembresiaResponseSchema,
  metricasDashboardResponseSchema,
  configuracionPreciosSchema,
  historialCambioPreciosSchema,
  inscripcionMensualSchema,
  estudianteConDescuentoSchema,
  actualizarConfiguracionPreciosSchema,
  type EstadoMembresia as SharedEstadoMembresia,
  type EstadoInscripcion as SharedEstadoInscripcion,
  type Membresia as SharedMembresia,
  type InscripcionCurso as SharedInscripcionCurso,
  type PreferenciaPago as SharedPreferenciaPago,
  type CrearPreferenciaSuscripcionRequest as SharedCrearPreferenciaSuscripcionRequest,
  type CrearPreferenciaCursoRequest as SharedCrearPreferenciaCursoRequest,
  type EstadoMembresiaResponse as SharedEstadoMembresiaResponse,
  type MetricasDashboardResponse as SharedMetricasDashboardResponse,
  type ConfiguracionPrecios as SharedConfiguracionPrecios,
  type HistorialCambioPrecios as SharedHistorialCambioPrecios,
  type InscripcionMensualConRelaciones as SharedInscripcionMensualConRelaciones,
  type EstudianteConDescuento as SharedEstudianteConDescuento,
  type ActualizarConfiguracionPreciosInput,
} from '@mateatletas/shared';
import { z } from 'zod';

export { estadoMembresiaEnum, estadoInscripcionEnum };

export type EstadoMembresia = SharedEstadoMembresia;
export type EstadoInscripcion = SharedEstadoInscripcion;
export type Membresia = SharedMembresia;
export type InscripcionCurso = SharedInscripcionCurso;
export type PreferenciaPago = SharedPreferenciaPago;
export type CrearPreferenciaSuscripcionRequest = SharedCrearPreferenciaSuscripcionRequest;
export type CrearPreferenciaCursoRequest = SharedCrearPreferenciaCursoRequest;
export type EstadoMembresiaResponse = SharedEstadoMembresiaResponse;
export type MetricasDashboardResponse = SharedMetricasDashboardResponse;
export type ConfiguracionPrecios = SharedConfiguracionPrecios;
export type HistorialCambioPrecios = SharedHistorialCambioPrecios;
export type InscripcionMensualConRelaciones = SharedInscripcionMensualConRelaciones;
export type EstudianteConDescuento = SharedEstudianteConDescuento;
export type ActualizarConfiguracionRequest = ActualizarConfiguracionPreciosInput;

export const membresiaSchemaClient = membresiaSchema;
export const inscripcionCursoSchemaClient = inscripcionCursoSchema;
export const preferenciaPagoSchemaClient = preferenciaPagoSchema;
export const crearPreferenciaSuscripcionSchemaClient = crearPreferenciaSuscripcionSchema;
export const crearPreferenciaCursoSchemaClient = crearPreferenciaCursoSchema;
export const estadoMembresiaResponseSchemaClient = estadoMembresiaResponseSchema;
export const metricasDashboardResponseSchemaClient = metricasDashboardResponseSchema;
export const configuracionPreciosSchemaClient = configuracionPreciosSchema;
export const historialCambioPreciosSchemaClient = historialCambioPreciosSchema;
export const inscripcionMensualSchemaClient = inscripcionMensualSchema;
export const estudianteConDescuentoSchemaClient = estudianteConDescuentoSchema;
export const actualizarConfiguracionPreciosSchemaClient = actualizarConfiguracionPreciosSchema;

export const membresiaListSchema = z.array(membresiaSchemaClient);
export const inscripcionesCursoListSchema = z.array(inscripcionCursoSchemaClient);
