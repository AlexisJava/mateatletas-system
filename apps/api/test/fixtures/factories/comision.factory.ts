/**
 * ============================================================================
 * COMISION FACTORY - Factories para Productos y Comisiones
 * ============================================================================
 *
 * Factories para crear productos (Colonia, Taller) y comisiones en tests.
 */

import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  TipoProducto,
  EstadoInscripcionComision,
  TipoAccesoInscripcion,
} from '@prisma/client';

// ============================================================================
// HELPERS
// ============================================================================

function generateUniqueSuffix(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// FACTORY: PRODUCTO
// ============================================================================

export interface CreateTestProductoOptions {
  nombre?: string;
  tipo?: TipoProducto;
  precio?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  cupoMaximo?: number;
}

/**
 * Crea un producto (Colonia, Taller, etc.)
 */
export async function createTestProducto(
  prisma: PrismaService,
  options?: CreateTestProductoOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();

  return prisma.producto.create({
    data: {
      nombre: options?.nombre ?? `Producto_${uniqueSuffix}`,
      tipo: options?.tipo ?? TipoProducto.Curso,
      precio: options?.precio ?? 10000,
      fechaInicio: options?.fechaInicio,
      fechaFin: options?.fechaFin,
      cupoMaximo: options?.cupoMaximo,
      activo: true,
    },
  });
}

// ============================================================================
// FACTORY: COMISION
// ============================================================================

export interface CreateComisionOptions {
  productoId: string;
  docenteId?: string;
  casaId?: string;
  nombre?: string;
  horario?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  cupoMaximo?: number;
  activo?: boolean;
  modalidad?: TipoAccesoInscripcion;
}

/**
 * Crea una comisión de producto
 */
export async function createTestComision(
  prisma: PrismaService,
  options: CreateComisionOptions,
) {
  const uniqueSuffix = generateUniqueSuffix();

  return prisma.comision.create({
    data: {
      nombre: options.nombre ?? `Comision_${uniqueSuffix}`,
      productoId: options.productoId,
      docenteId: options.docenteId,
      casaId: options.casaId,
      horario: options.horario ?? 'Lun-Vie 9:00-12:00',
      fechaInicio: options.fechaInicio,
      fechaFin: options.fechaFin,
      cupoMaximo: options.cupoMaximo,
      activo: options.activo ?? true,
      modalidad: options.modalidad ?? TipoAccesoInscripcion.SINCRONICO,
    },
  });
}

// ============================================================================
// FACTORY: INSCRIPCIÓN COMISION
// ============================================================================

/**
 * Inscribe un estudiante en una comisión
 */
export async function createTestInscripcionComision(
  prisma: PrismaService,
  estudianteId: string,
  comisionId: string,
  estado: EstadoInscripcionComision = EstadoInscripcionComision.Confirmada,
) {
  return prisma.inscripcionComision.create({
    data: {
      comisionId,
      estudianteId,
      estado,
    },
  });
}
