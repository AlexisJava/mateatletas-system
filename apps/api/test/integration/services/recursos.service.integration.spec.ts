/**
 * ============================================================================
 * INTEGRATION TESTS - RecursosService (Gamificación)
 * ============================================================================
 *
 * Tests de integración REALES contra PostgreSQL de test.
 * Sin mocks de Prisma ni servicios.
 *
 * Verifica:
 * - XP se agrega correctamente a la DB
 * - Eventos xp.ganado y estudiante.nivel-up se emiten con payload correcto
 * - Transacciones de recursos se registran
 * - Cálculo de niveles funciona correctamente
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="..." npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPatterns="recursos.service"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecursosService } from '../../../src/gamificacion/services/recursos.service';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanGamificationTables } from '../../helpers/db-cleanup';
import { createTestEstudiante, createTestTutor } from '../fixtures/factories';

describe('[INTEGRATION] RecursosService - Eventos de Gamificación', () => {
  let app: INestApplication;
  let service: RecursosService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;
  let estudianteId: string;
  let tutorId: string;

  // ============================================================================
  // Setup: Crear módulo con DB real (usa AppModule completo)
  // ============================================================================
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = app.get<RecursosService>(RecursosService);
    prisma = app.get<PrismaService>(PrismaService);
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  // ============================================================================
  // Cleanup: Limpiar DB antes de cada test
  // ============================================================================
  beforeEach(async () => {
    // Limpiar listeners previos para evitar acumulación
    eventEmitter.removeAllListeners('xp.ganado');
    eventEmitter.removeAllListeners('estudiante.nivel-up');

    await cleanGamificationTables(prisma);
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});

    // Crear tutor y estudiante de prueba
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;
    const { estudiante } = await createTestEstudiante(prisma, { tutorId });
    estudianteId = estudiante.id;
  });

  // ============================================================================
  // TEST 1: Emitir evento xp.ganado con payload correcto
  // ============================================================================
  describe('agregarXP - evento xp.ganado', () => {
    it('debe emitir evento xp.ganado con payload correcto', async () => {
      // Arrange
      const eventHandler = jest.fn();
      eventEmitter.on('xp.ganado', eventHandler);

      // Act
      await service.agregarXP(estudianteId, 100, 'Test XP', { test: true });

      // Assert - Evento emitido
      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId,
          xpGanado: 100,
          razon: 'Test XP',
        }),
      );

      // Assert - DB actualizada
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(recursos?.xp_total).toBe(100);
    });

    it('debe acumular XP correctamente en múltiples llamadas', async () => {
      // Arrange
      const eventHandler = jest.fn();
      eventEmitter.on('xp.ganado', eventHandler);

      // Act
      await service.agregarXP(estudianteId, 50, 'Primera ganancia');
      await service.agregarXP(estudianteId, 75, 'Segunda ganancia');

      // Assert
      expect(eventHandler).toHaveBeenCalledTimes(2);

      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(recursos?.xp_total).toBe(125);
    });
  });

  // ============================================================================
  // TEST 2: Emitir evento estudiante.nivel-up cuando sube de nivel
  // ============================================================================
  describe('agregarXP - evento estudiante.nivel-up', () => {
    it('debe emitir estudiante.nivel-up cuando alcanza siguiente nivel', async () => {
      // Arrange
      const xpEventHandler = jest.fn();
      const nivelEventHandler = jest.fn();
      eventEmitter.on('xp.ganado', xpEventHandler);
      eventEmitter.on('estudiante.nivel-up', nivelEventHandler);

      // Fórmula: nivel = floor(sqrt(xp / 100)) + 1
      // Nivel 2 requiere xp >= 100 (sqrt(100/100) = 1, +1 = 2)
      // Con 0 XP inicial, dar 100 XP sube a nivel 2

      // Act
      await service.agregarXP(estudianteId, 100, 'Level up test');

      // Assert - Evento nivel-up emitido
      expect(nivelEventHandler).toHaveBeenCalledTimes(1);
      expect(nivelEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId,
          nivelAnterior: 1,
          nivelNuevo: 2,
        }),
      );
    });

    it('NO debe emitir nivel-up si no alcanza el siguiente nivel', async () => {
      // Arrange
      const nivelEventHandler = jest.fn();
      eventEmitter.on('estudiante.nivel-up', nivelEventHandler);

      // Act - 50 XP no es suficiente para nivel 2
      await service.agregarXP(estudianteId, 50, 'No level up');

      // Assert
      expect(nivelEventHandler).not.toHaveBeenCalled();
    });

    it('debe detectar múltiples subidas de nivel en una operación', async () => {
      // Arrange
      const nivelEventHandler = jest.fn();
      eventEmitter.on('estudiante.nivel-up', nivelEventHandler);

      // Fórmula: nivel = floor(sqrt(xp / 100)) + 1
      // Nivel 3 = floor(sqrt(400/100)) + 1 = 3
      // Con 500 XP: floor(sqrt(500/100)) + 1 = floor(2.236) + 1 = 3

      // Act
      await service.agregarXP(estudianteId, 500, 'Multi level up');

      // Assert - Sube de nivel 1 a nivel 3
      expect(nivelEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          nivelAnterior: 1,
          nivelNuevo: 3,
        }),
      );
    });
  });

  // ============================================================================
  // TEST 3: Crear TransaccionRecurso en la DB
  // ============================================================================
  describe('agregarXP - registro de transacciones', () => {
    it('debe crear TransaccionRecurso en la DB', async () => {
      // Act
      await service.agregarXP(estudianteId, 75, 'Transaction test', {
        source: 'test',
      });

      // Assert
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });

      const transacciones = await prisma.transaccionRecurso.findMany({
        where: { recursos_estudiante_id: recursos?.id },
      });

      expect(transacciones).toHaveLength(1);
      expect(transacciones[0]).toMatchObject({
        tipo_recurso: 'XP',
        cantidad: 75,
        razon: 'Transaction test',
      });
    });

    it('debe crear múltiples transacciones para múltiples operaciones', async () => {
      // Act
      await service.agregarXP(estudianteId, 10, 'Primera');
      await service.agregarXP(estudianteId, 20, 'Segunda');
      await service.agregarXP(estudianteId, 30, 'Tercera');

      // Assert
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });

      const transacciones = await prisma.transaccionRecurso.findMany({
        where: { recursos_estudiante_id: recursos?.id },
        orderBy: { fecha: 'asc' },
      });

      expect(transacciones).toHaveLength(3);
      expect(transacciones.map((t) => t.cantidad)).toEqual([10, 20, 30]);
    });
  });

  // ============================================================================
  // TEST 4: obtenerRecursosConNivel - cálculos correctos
  // ============================================================================
  describe('obtenerRecursosConNivel', () => {
    it('debe calcular nivel y progreso correctamente', async () => {
      // Arrange - Dar XP suficiente para nivel 2 con progreso
      await service.agregarXP(estudianteId, 150, 'Test XP');

      // Act
      const recursosConNivel =
        await service.obtenerRecursosConNivel(estudianteId);

      // Assert
      // 150 XP = nivel 2 (sqrt(150/100) = 1.22, floor = 1, +1 = 2)
      // XP para nivel 2 = (2-1)² × 100 = 100
      // XP para nivel 3 = (3-1)² × 100 = 400
      // Progreso = 150 - 100 = 50
      // Necesario = 400 - 100 = 300
      // Porcentaje = floor(50/300 * 100) = 16%

      expect(recursosConNivel.xp_total).toBe(150);
      expect(recursosConNivel.nivel).toBe(2);
      expect(recursosConNivel.xp_progreso).toBe(50);
      expect(recursosConNivel.xp_necesario).toBe(300);
      expect(recursosConNivel.porcentaje_nivel).toBe(16);
    });

    it('debe crear recursos si no existen', async () => {
      // Arrange - Crear estudiante sin recursos
      const nuevoEstudiante = await prisma.estudiante.create({
        data: {
          nombre: 'Sin',
          apellido: 'Recursos',
          username: `sin_recursos_${Date.now()}`,
          password_hash: 'hash',
          estado_acceso: 'ACTIVO',
          nivelEscolar: '1ro Primaria',
          edad: 10,
          tutor_id: tutorId,
        },
      });

      // Act
      const recursos = await service.obtenerRecursos(nuevoEstudiante.id);

      // Assert
      expect(recursos).toBeDefined();
      expect(recursos.xp_total).toBe(0);
      expect(recursos.estudiante_id).toBe(nuevoEstudiante.id);
    });
  });

  // ============================================================================
  // TEST 5: Edge cases
  // ============================================================================
  describe('Edge cases', () => {
    it('debe manejar XP = 0 sin emitir evento nivel-up', async () => {
      // Arrange
      const xpEventHandler = jest.fn();
      const nivelEventHandler = jest.fn();
      eventEmitter.on('xp.ganado', xpEventHandler);
      eventEmitter.on('estudiante.nivel-up', nivelEventHandler);

      // Act
      await service.agregarXP(estudianteId, 0, 'Zero XP');

      // Assert - Evento de XP se emite (aunque sea 0)
      expect(xpEventHandler).toHaveBeenCalledTimes(1);
      // Pero no sube de nivel
      expect(nivelEventHandler).not.toHaveBeenCalled();
    });

    it('debe manejar estudiante con XP existente', async () => {
      // Arrange - Actualizar XP inicial
      await prisma.recursosEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: { xp_total: 80 },
      });

      const nivelEventHandler = jest.fn();
      eventEmitter.on('estudiante.nivel-up', nivelEventHandler);

      // Act - Agregar 30 XP (total 110, pasa a nivel 2)
      await service.agregarXP(estudianteId, 30, 'Nivel up desde 80');

      // Assert
      expect(nivelEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          nivelAnterior: 1,
          nivelNuevo: 2,
        }),
      );

      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(recursos?.xp_total).toBe(110);
    });
  });
});
