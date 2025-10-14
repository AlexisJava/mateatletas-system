/**
 * Types para el módulo de Pagos
 */

import { Producto } from './catalogo.types';

/**
 * Estados de membresía
 */
export enum EstadoMembresia {
  Pendiente = 'Pendiente',
  Activa = 'Activa',
  Vencida = 'Vencida',
  Cancelada = 'Cancelada',
}

/**
 * Estados de inscripción a curso
 */
export enum EstadoInscripcion {
  PreInscrito = 'PreInscrito',
  Inscrito = 'Inscrito',
  Cancelado = 'Cancelado',
}

/**
 * Membresía activa del tutor
 */
export interface Membresia {
  id: string;
  tutorId: string;
  productoId: string;
  estado: EstadoMembresia;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  pagoId: string;
  createdAt: string;
  updatedAt: string;
  producto?: Producto;
}

/**
 * Inscripción a curso
 */
export interface InscripcionCurso {
  id: string;
  estudianteId: string;
  productoId: string;
  estado: EstadoInscripcion;
  fechaInscripcion: string | null;
  pagoId: string;
  createdAt: string;
  updatedAt: string;
  producto?: Producto;
}

/**
 * Pago registrado
 */
export interface Pago {
  id: string;
  tutorId: string;
  monto: number;
  metodoPago: string;
  estadoPago: string;
  mercadoPagoId: string | null;
  mercadoPagoStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Preferencia de pago de MercadoPago
 */
export interface PreferenciaPago {
  id: string;
  init_point: string; // URL de MercadoPago para pagar
  sandbox_init_point?: string;
}

/**
 * Request para crear preferencia de suscripción
 */
export interface CrearPreferenciaSuscripcionRequest {
  producto_id: string;
}

/**
 * Request para crear preferencia de curso
 */
export interface CrearPreferenciaCursoRequest {
  producto_id: string;
  estudiante_id: string;
}

/**
 * Response de estado de membresía
 */
export interface EstadoMembresiaResponse {
  tieneMembresia: boolean;
  membresia: Membresia | null;
}
