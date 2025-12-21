/**
 * Error de Optimistic Locking
 *
 * Se lanza cuando un update falla porque la versión del registro
 * no coincide con la esperada (alguien más lo modificó).
 */
import { Prisma } from '@prisma/client';

export class OptimisticLockError extends Error {
  readonly code = 'OPTIMISTIC_LOCK_FAILED';
  readonly entityId: string;
  readonly expectedVersion: number;

  constructor(entityId: string, expectedVersion: number) {
    super(
      `Conflicto de concurrencia: el registro ${entityId} fue modificado por otro proceso. ` +
        `Versión esperada: ${expectedVersion}`,
    );
    this.name = 'OptimisticLockError';
    this.entityId = entityId;
    this.expectedVersion = expectedVersion;

    // Mantener el stack trace correcto en V8
    Error.captureStackTrace(this, OptimisticLockError);
  }
}

/**
 * Verifica si un error es de tipo OptimisticLock
 *
 * Detecta tanto OptimisticLockError como Prisma P2025 (Record not found)
 * que ocurre cuando el WHERE con version no encuentra el registro.
 */
export function isOptimisticLockError(error: unknown): boolean {
  // Es nuestro error custom
  if (error instanceof OptimisticLockError) {
    return true;
  }

  // Es error de Prisma P2025 (Record to update not found)
  // Esto ocurre cuando el WHERE incluye version y no coincide
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2025';
  }

  return false;
}

/**
 * Convierte un error de Prisma P2025 a OptimisticLockError
 */
export function toOptimisticLockError(
  prismaError: Prisma.PrismaClientKnownRequestError,
  entityId: string,
  expectedVersion: number,
): OptimisticLockError {
  return new OptimisticLockError(entityId, expectedVersion);
}
