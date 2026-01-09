/**
 * ============================================================================
 * INTEGRATION TESTS - ProgresoService (Contenidos)
 * ============================================================================
 *
 * Tests de integración REALES contra PostgreSQL de test.
 *
 * Verifica:
 * - Actualización de progreso en contenidos
 * - Evento leccion.completada se emite al completar
 * - Tracking de tiempo correcto
 * - No emitir evento si solo se actualiza porcentaje
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="..." npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPatterns="progreso.service"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProgresoService } from '../../src/contenidos/services/progreso.service';
import { PrismaService } from '../../src/core/database/prisma.service';
import { AppModule } from '../../src/app.module';
import {
  cleanAllTestTables,
  createTestEstudiante,
  createTestContenido,
  createTestTutor,
} from '../utils/db-cleanup.helper';

describe('[INTEGRATION] ProgresoService - Eventos de Gamificación', () => {
  let app: INestApplication;
  let service: ProgresoService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;
  let estudianteId: string;
  let tutorId: string;

  // ============================================================================
  // Setup
  // ============================================================================
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = app.get<ProgresoService>(ProgresoService);
    prisma = app.get<PrismaService>(PrismaService);
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    eventEmitter.removeAllListeners('leccion.completada');

    await cleanAllTestTables(prisma);

    // Crear tutor y estudiante de prueba
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;
    const { estudiante } = await createTestEstudiante(prisma, { tutorId });
    estudianteId = estudiante.id;
  });

  // ============================================================================
  // Helper: Crear progreso inicial
  // ============================================================================
  async function createProgreso(
    contenidoId: string,
    data?: { completado?: boolean; tiempoTotal?: number },
  ) {
    return prisma.progresoContenido.create({
      data: {
        estudianteId,
        contenidoId,
        completado: data?.completado ?? false,
        tiempoTotalSegundos: data?.tiempoTotal ?? 0,
      },
    });
  }

  // ============================================================================
  // TEST 1: Emitir evento al completar lección
  // ============================================================================
  describe('updateProgreso - evento leccion.completada', () => {
    it('debe emitir evento leccion.completada cuando se marca completado', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma, {
        titulo: 'Fracciones Básicas',
      });
      await createProgreso(contenido.id);

      const eventHandler = jest.fn();
      eventEmitter.on('leccion.completada', eventHandler);

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        completado: true,
      });

      // Assert
      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId,
          contenidoId: contenido.id,
          contenidoTitulo: 'Fracciones Básicas',
        }),
      );
    });

    it('debe incluir tiempo total en el evento', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { tiempoTotal: 300 });

      const eventHandler = jest.fn();
      eventEmitter.on('leccion.completada', eventHandler);

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        completado: true,
        tiempoAdicionalSegundos: 60,
      });

      // Assert
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          tiempoTotalSegundos: 360,
        }),
      );
    });

    it('debe establecer fechaCompletitud en la DB', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id);

      // Act
      const antes = new Date();
      await service.updateProgreso(estudianteId, contenido.id, {
        completado: true,
      });
      const despues = new Date();

      // Assert
      const progreso = await prisma.progresoContenido.findUnique({
        where: {
          estudianteId_contenidoId: {
            estudianteId,
            contenidoId: contenido.id,
          },
        },
      });

      expect(progreso?.completado).toBe(true);
      expect(progreso?.fechaCompletitud).toBeDefined();
      expect(progreso!.fechaCompletitud!.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(progreso!.fechaCompletitud!.getTime()).toBeLessThanOrEqual(
        despues.getTime(),
      );
    });
  });

  // ============================================================================
  // TEST 2: NO emitir evento si ya estaba completado
  // ============================================================================
  describe('updateProgreso - ya completado', () => {
    it('NO debe emitir evento si ya estaba completado', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { completado: true });

      const eventHandler = jest.fn();
      eventEmitter.on('leccion.completada', eventHandler);

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        completado: true,
      });

      // Assert
      expect(eventHandler).not.toHaveBeenCalled();
    });

    it('NO debe cambiar fechaCompletitud si ya estaba completado', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      const fechaOriginal = new Date('2024-01-01T12:00:00Z');

      await prisma.progresoContenido.create({
        data: {
          estudianteId,
          contenidoId: contenido.id,
          completado: true,
          fechaCompletitud: fechaOriginal,
          tiempoTotalSegundos: 100,
        },
      });

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        completado: true,
      });

      // Assert
      const progreso = await prisma.progresoContenido.findUnique({
        where: {
          estudianteId_contenidoId: {
            estudianteId,
            contenidoId: contenido.id,
          },
        },
      });

      expect(progreso?.fechaCompletitud?.getTime()).toBe(
        fechaOriginal.getTime(),
      );
    });
  });

  // ============================================================================
  // TEST 3: NO emitir evento si solo se actualiza nodo/tiempo
  // ============================================================================
  describe('updateProgreso - sin completar', () => {
    it('NO debe emitir evento si solo se actualiza nodoActualId', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id);

      // Crear un nodo para el contenido
      const nodo = await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo 1',
          orden: 0,
        },
      });

      const eventHandler = jest.fn();
      eventEmitter.on('leccion.completada', eventHandler);

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        nodoActualId: nodo.id,
      });

      // Assert
      expect(eventHandler).not.toHaveBeenCalled();
    });

    it('NO debe emitir evento si solo se agrega tiempo', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { tiempoTotal: 100 });

      const eventHandler = jest.fn();
      eventEmitter.on('leccion.completada', eventHandler);

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        tiempoAdicionalSegundos: 60,
      });

      // Assert
      expect(eventHandler).not.toHaveBeenCalled();

      // Pero el tiempo se actualizó
      const progreso = await prisma.progresoContenido.findUnique({
        where: {
          estudianteId_contenidoId: {
            estudianteId,
            contenidoId: contenido.id,
          },
        },
      });
      expect(progreso?.tiempoTotalSegundos).toBe(160);
    });
  });

  // ============================================================================
  // TEST 4: Acumulación de tiempo
  // ============================================================================
  describe('updateProgreso - acumulación de tiempo', () => {
    it('debe sumar tiempo adicional correctamente', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { tiempoTotal: 120 });

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        tiempoAdicionalSegundos: 45,
      });

      // Assert
      const progreso = await prisma.progresoContenido.findUnique({
        where: {
          estudianteId_contenidoId: {
            estudianteId,
            contenidoId: contenido.id,
          },
        },
      });
      expect(progreso?.tiempoTotalSegundos).toBe(165);
    });

    it('debe sumar tiempo y completar en la misma operación', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { tiempoTotal: 200 });

      const eventHandler = jest.fn();
      eventEmitter.on('leccion.completada', eventHandler);

      // Act
      await service.updateProgreso(estudianteId, contenido.id, {
        tiempoAdicionalSegundos: 50,
        completado: true,
      });

      // Assert
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          tiempoTotalSegundos: 250,
        }),
      );

      const progreso = await prisma.progresoContenido.findUnique({
        where: {
          estudianteId_contenidoId: {
            estudianteId,
            contenidoId: contenido.id,
          },
        },
      });
      expect(progreso?.tiempoTotalSegundos).toBe(250);
      expect(progreso?.completado).toBe(true);
    });
  });

  // ============================================================================
  // TEST 5: getProgreso - porcentaje calculado
  // ============================================================================
  describe('getProgreso', () => {
    it('debe calcular porcentaje basado en nodo actual', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);

      // Crear nodos
      const nodo1 = await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo 1',
          orden: 0,
        },
      });
      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo 2',
          orden: 1,
        },
      });
      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo 3',
          orden: 2,
        },
      });
      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo 4',
          orden: 3,
        },
      });

      await prisma.progresoContenido.create({
        data: {
          estudianteId,
          contenidoId: contenido.id,
          nodoActualId: nodo1.id, // En nodo 1 de 4 (orden 0)
          completado: false,
          tiempoTotalSegundos: 0,
        },
      });

      // Act
      const progreso = await service.getProgreso(estudianteId, contenido.id);

      // Assert
      // Nodo actual tiene orden 0, total 4 nodos
      // Porcentaje = (0 + 1) / 4 * 100 = 25%
      expect(progreso.porcentaje).toBe(25);
    });

    it('debe retornar 100% si está completado', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { completado: true });

      // Act
      const progreso = await service.getProgreso(estudianteId, contenido.id);

      // Assert
      expect(progreso.porcentaje).toBe(100);
    });

    it('debe lanzar error si progreso no existe', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);

      // Act & Assert
      await expect(
        service.getProgreso(estudianteId, contenido.id),
      ).rejects.toThrow('Progreso no encontrado');
    });
  });

  // ============================================================================
  // TEST 6: getAllProgresos
  // ============================================================================
  describe('getAllProgresos', () => {
    it('debe retornar todos los progresos del estudiante', async () => {
      // Arrange
      const contenido1 = await createTestContenido(prisma, { titulo: 'C1' });
      const contenido2 = await createTestContenido(prisma, { titulo: 'C2' });
      const contenido3 = await createTestContenido(prisma, { titulo: 'C3' });

      await createProgreso(contenido1.id);
      await createProgreso(contenido2.id, { completado: true });
      await createProgreso(contenido3.id);

      // Act
      const progresos = await service.getAllProgresos(estudianteId);

      // Assert
      expect(progresos).toHaveLength(3);
    });

    it('debe ordenar por ultimaActividad descendente', async () => {
      // Arrange
      const contenido1 = await createTestContenido(prisma, { titulo: 'Viejo' });
      const contenido2 = await createTestContenido(prisma, { titulo: 'Nuevo' });

      // Crear con fechas diferentes
      await prisma.progresoContenido.create({
        data: {
          estudianteId,
          contenidoId: contenido1.id,
          completado: false,
          tiempoTotalSegundos: 0,
          ultimaActividad: new Date('2024-01-01'),
        },
      });
      await prisma.progresoContenido.create({
        data: {
          estudianteId,
          contenidoId: contenido2.id,
          completado: false,
          tiempoTotalSegundos: 0,
          ultimaActividad: new Date('2024-06-01'),
        },
      });

      // Act
      const progresos = await service.getAllProgresos(estudianteId);

      // Assert - Más reciente primero
      expect(progresos[0].contenido.titulo).toBe('Nuevo');
      expect(progresos[1].contenido.titulo).toBe('Viejo');
    });
  });

  // ============================================================================
  // TEST 7: Edge cases
  // ============================================================================
  describe('Edge cases', () => {
    it('debe lanzar error si progreso no existe al actualizar', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      // No crear progreso

      // Act & Assert
      await expect(
        service.updateProgreso(estudianteId, contenido.id, {
          completado: true,
        }),
      ).rejects.toThrow('Progreso no encontrado');
    });

    it('debe manejar actualización con dto vacío', async () => {
      // Arrange
      const contenido = await createTestContenido(prisma);
      await createProgreso(contenido.id, { tiempoTotal: 100 });

      // Act - DTO sin cambios significativos
      await service.updateProgreso(estudianteId, contenido.id, {});

      // Assert - No debería fallar, valores se mantienen
      const progreso = await prisma.progresoContenido.findUnique({
        where: {
          estudianteId_contenidoId: {
            estudianteId,
            contenidoId: contenido.id,
          },
        },
      });
      expect(progreso?.tiempoTotalSegundos).toBe(100);
      expect(progreso?.completado).toBe(false);
    });
  });
});
