/**
 * ============================================================================
 * INTEGRATION TESTS - LogrosService (Gamificación)
 * ============================================================================
 *
 * Tests de integración REALES contra PostgreSQL de test.
 *
 * Verifica:
 * - Desbloqueo de logros crea registro en DB
 * - Evento logro.desbloqueado se emite con payload correcto
 * - XP se otorga automáticamente al desbloquear
 * - Logros no se pueden desbloquear dos veces
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="..." npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPatterns="logros.service"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LogrosService } from '../../src/gamificacion/services/logros.service';
import { PrismaService } from '../../src/core/database/prisma.service';
import { AppModule } from '../../src/app.module';
import {
  cleanGamificationTables,
  createTestEstudiante,
  createTestLogro,
  createTestTutor,
} from '../utils/db-cleanup.helper';

describe('[INTEGRATION] LogrosService - Eventos de Gamificación', () => {
  let app: INestApplication;
  let service: LogrosService;
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

    service = app.get<LogrosService>(LogrosService);
    prisma = app.get<PrismaService>(PrismaService);
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    eventEmitter.removeAllListeners('logro.desbloqueado');
    eventEmitter.removeAllListeners('xp.ganado');
    eventEmitter.removeAllListeners('estudiante.nivel-up');

    await cleanGamificationTables(prisma);
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});

    // Crear tutor y estudiante de prueba
    const tutor = await createTestTutor(prisma);
    tutorId = tutor.id;
    const estudiante = await createTestEstudiante(prisma, { tutorId });
    estudianteId = estudiante.id;
  });

  // ============================================================================
  // TEST 1: Desbloquear logro y emitir evento
  // ============================================================================
  describe('desbloquearLogro - evento logro.desbloqueado', () => {
    it('debe emitir evento logro.desbloqueado con datos completos', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, {
        codigo: 'PRIMER_PASO',
        nombre: 'Primer Paso',
        xp_recompensa: 50,
        categoria: 'PARTICIPACION',
        rareza: 'COMUN',
      });

      const eventHandler = jest.fn();
      eventEmitter.on('logro.desbloqueado', eventHandler);

      // Act
      await service.desbloquearLogro(estudianteId, logro.codigo);

      // Assert
      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId,
          logroCodigo: 'PRIMER_PASO',
          logroNombre: 'Primer Paso',
          recompensas: { xp: 50 },
        }),
      );
    });

    it('debe crear LogroEstudiante en la DB', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, {
        codigo: 'TEST_LOGRO',
        nombre: 'Test Logro',
      });

      // Act
      await service.desbloquearLogro(estudianteId, logro.codigo);

      // Assert
      const logroEstudiante = await prisma.logroEstudiante.findUnique({
        where: {
          estudiante_id_logro_id: {
            estudiante_id: estudianteId,
            logro_id: logro.id,
          },
        },
      });

      expect(logroEstudiante).not.toBeNull();
      expect(logroEstudiante?.visto).toBe(false);
      expect(logroEstudiante?.fecha_desbloqueo).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 2: Otorgar XP automáticamente al desbloquear
  // ============================================================================
  describe('desbloquearLogro - otorgar XP', () => {
    it('debe otorgar XP automáticamente al desbloquear logro', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, {
        codigo: 'XP_LOGRO',
        xp_recompensa: 100,
      });

      const xpEventHandler = jest.fn();
      eventEmitter.on('xp.ganado', xpEventHandler);

      // Act
      await service.desbloquearLogro(estudianteId, logro.codigo);

      // Assert - XP evento emitido
      expect(xpEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId,
          xpGanado: 100,
        }),
      );

      // Assert - DB actualizada
      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(recursos?.xp_total).toBe(100);
    });

    it('debe retornar información de nivel si sube', async () => {
      // Arrange - Logro con suficiente XP para subir nivel
      const logro = await createTestLogro(prisma, {
        codigo: 'MEGA_XP',
        xp_recompensa: 150, // Suficiente para nivel 2
      });

      // Act
      const result = await service.desbloquearLogro(estudianteId, logro.codigo);

      // Assert
      expect(result.subio_nivel).toBe(true);
      expect(result.nivel_nuevo).toBe(2);
    });
  });

  // ============================================================================
  // TEST 3: No desbloquear dos veces
  // ============================================================================
  describe('desbloquearLogro - idempotencia', () => {
    it('debe retornar ya_desbloqueado=true si ya está desbloqueado', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, {
        codigo: 'UNICO',
        xp_recompensa: 50,
      });

      // Primera vez
      const firstResult = await service.desbloquearLogro(
        estudianteId,
        logro.codigo,
      );
      expect(firstResult.ya_desbloqueado).toBe(false);

      // Reset eventos
      const eventHandler = jest.fn();
      eventEmitter.removeAllListeners('logro.desbloqueado');
      eventEmitter.on('logro.desbloqueado', eventHandler);

      // Act - Segunda vez
      const secondResult = await service.desbloquearLogro(
        estudianteId,
        logro.codigo,
      );

      // Assert
      expect(secondResult.ya_desbloqueado).toBe(true);
      expect(eventHandler).not.toHaveBeenCalled(); // No emite evento
    });

    it('NO debe otorgar XP dos veces', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, {
        codigo: 'NO_DUPLICAR_XP',
        xp_recompensa: 100,
      });

      // Primera vez
      await service.desbloquearLogro(estudianteId, logro.codigo);

      const xpDespuesPrimera = (
        await prisma.recursosEstudiante.findUnique({
          where: { estudiante_id: estudianteId },
        })
      )?.xp_total;

      // Segunda vez
      await service.desbloquearLogro(estudianteId, logro.codigo);

      const xpDespuesSegunda = (
        await prisma.recursosEstudiante.findUnique({
          where: { estudiante_id: estudianteId },
        })
      )?.xp_total;

      // Assert - XP no cambió
      expect(xpDespuesSegunda).toBe(xpDespuesPrimera);
      expect(xpDespuesSegunda).toBe(100);
    });
  });

  // ============================================================================
  // TEST 4: Obtener logros de estudiante
  // ============================================================================
  describe('obtenerLogrosEstudiante', () => {
    it('debe retornar logros desbloqueados con detalles', async () => {
      // Arrange - Crear y desbloquear múltiples logros
      const logro1 = await createTestLogro(prisma, {
        codigo: 'LOGRO_1',
        nombre: 'Primer Logro',
      });
      const logro2 = await createTestLogro(prisma, {
        codigo: 'LOGRO_2',
        nombre: 'Segundo Logro',
      });

      await service.desbloquearLogro(estudianteId, logro1.codigo);
      await service.desbloquearLogro(estudianteId, logro2.codigo);

      // Act
      const logros = await service.obtenerLogrosEstudiante(estudianteId);

      // Assert
      expect(logros).toHaveLength(2);
      expect(logros.map((l) => l.logro.codigo)).toContain('LOGRO_1');
      expect(logros.map((l) => l.logro.codigo)).toContain('LOGRO_2');
    });

    it('debe retornar array vacío si no tiene logros', async () => {
      // Act
      const logros = await service.obtenerLogrosEstudiante(estudianteId);

      // Assert
      expect(logros).toHaveLength(0);
    });
  });

  // ============================================================================
  // TEST 5: Obtener progreso de logros
  // ============================================================================
  describe('obtenerProgresoLogros', () => {
    it('debe calcular porcentaje correctamente', async () => {
      // Arrange - Crear 4 logros, desbloquear 2
      await createTestLogro(prisma, { codigo: 'L1' });
      await createTestLogro(prisma, { codigo: 'L2' });
      await createTestLogro(prisma, { codigo: 'L3' });
      await createTestLogro(prisma, { codigo: 'L4' });

      await service.desbloquearLogro(estudianteId, 'L1');
      await service.desbloquearLogro(estudianteId, 'L2');

      // Act
      const progreso = await service.obtenerProgresoLogros(estudianteId);

      // Assert
      expect(progreso.desbloqueados).toBe(2);
      expect(progreso.totales).toBe(4);
      expect(progreso.porcentaje).toBe(50);
    });

    it('debe excluir logros secretos del total', async () => {
      // Arrange - 2 normales + 1 secreto
      await createTestLogro(prisma, { codigo: 'NORMAL_1' });
      await createTestLogro(prisma, { codigo: 'NORMAL_2' });
      await prisma.logro.create({
        data: {
          codigo: 'SECRETO',
          nombre: 'Secreto',
          descripcion: 'Logro secreto',
          categoria: 'ESPECIAL',
          rareza: 'LEGENDARIO',
          xp_recompensa: 500,
          icono: '🔒',
          secreto: true,
          criterio_tipo: 'manual',
          criterio_valor: '{}',
        },
      });

      await service.desbloquearLogro(estudianteId, 'NORMAL_1');

      // Act
      const progreso = await service.obtenerProgresoLogros(estudianteId);

      // Assert - Secreto no cuenta en totales
      expect(progreso.totales).toBe(2);
      expect(progreso.desbloqueados).toBe(1);
    });
  });

  // ============================================================================
  // TEST 6: Marcar logro como visto
  // ============================================================================
  describe('marcarLogroVisto', () => {
    it('debe marcar logro como visto', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, { codigo: 'PARA_VER' });
      await service.desbloquearLogro(estudianteId, logro.codigo);

      // Verificar que está en visto=false
      let logroEstudiante = await prisma.logroEstudiante.findFirst({
        where: { estudiante_id: estudianteId, logro_id: logro.id },
      });
      expect(logroEstudiante?.visto).toBe(false);

      // Act
      await service.marcarLogroVisto(estudianteId, logro.id);

      // Assert
      logroEstudiante = await prisma.logroEstudiante.findFirst({
        where: { estudiante_id: estudianteId, logro_id: logro.id },
      });
      expect(logroEstudiante?.visto).toBe(true);
    });
  });

  // ============================================================================
  // TEST 7: Logros no vistos
  // ============================================================================
  describe('obtenerLogrosNoVistos', () => {
    it('debe retornar solo logros no vistos', async () => {
      // Arrange
      const logro1 = await createTestLogro(prisma, { codigo: 'VISTO' });
      const logro2 = await createTestLogro(prisma, { codigo: 'NO_VISTO' });

      await service.desbloquearLogro(estudianteId, logro1.codigo);
      await service.desbloquearLogro(estudianteId, logro2.codigo);
      await service.marcarLogroVisto(estudianteId, logro1.id);

      // Act
      const noVistos = await service.obtenerLogrosNoVistos(estudianteId);

      // Assert
      expect(noVistos).toHaveLength(1);
      expect(noVistos[0].logro.codigo).toBe('NO_VISTO');
    });
  });

  // ============================================================================
  // TEST 8: Edge cases
  // ============================================================================
  describe('Edge cases', () => {
    it('debe lanzar error si logro no existe', async () => {
      // Act & Assert
      await expect(
        service.desbloquearLogro(estudianteId, 'LOGRO_INEXISTENTE'),
      ).rejects.toThrow();
    });

    it('debe manejar logros con XP = 0', async () => {
      // Arrange
      const logro = await createTestLogro(prisma, {
        codigo: 'SIN_XP',
        xp_recompensa: 0,
      });

      // Act
      const result = await service.desbloquearLogro(estudianteId, logro.codigo);

      // Assert - Se desbloquea pero sin XP
      expect(result.ya_desbloqueado).toBe(false);
      expect(result.recompensas.xp).toBe(0);

      const recursos = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(recursos?.xp_total).toBe(0);
    });
  });
});
