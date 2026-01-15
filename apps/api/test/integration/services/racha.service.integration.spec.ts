/**
 * ============================================================================
 * INTEGRATION TESTS - RachaService (Gamificación)
 * ============================================================================
 *
 * Tests de integración REALES contra PostgreSQL de test.
 *
 * Verifica:
 * - Registro de actividad diaria
 * - Incremento/reset de rachas
 * - Evento racha.actualizada se emite correctamente
 * - Lógica de días consecutivos
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="..." npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPatterns="racha.service"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RachaService } from '../../../src/gamificacion/services/racha.service';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../helpers/db-cleanup';
import { createTestEstudiante, createTestTutor } from '../fixtures/factories';

describe('[INTEGRATION] RachaService - Eventos de Gamificación', () => {
  let app: INestApplication;
  let service: RachaService;
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

    service = app.get<RachaService>(RachaService);
    prisma = app.get<PrismaService>(PrismaService);
    eventEmitter = app.get<EventEmitter2>(EventEmitter2);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    eventEmitter.removeAllListeners('racha.actualizada');

    await cleanAllTestTables(prisma);

    // Crear tutor y estudiante de prueba
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;
    const { estudiante } = await createTestEstudiante(prisma, { tutorId });
    estudianteId = estudiante.id;
  });

  // ============================================================================
  // TEST 1: Primera actividad del día
  // ============================================================================
  describe('registrarActividad - primera actividad', () => {
    it('debe emitir racha.actualizada cuando es primera actividad', async () => {
      // Arrange
      const eventHandler = jest.fn();
      eventEmitter.on('racha.actualizada', eventHandler);

      // Act
      await service.registrarActividad(estudianteId);

      // Assert - Evento emitido
      expect(eventHandler).toHaveBeenCalledTimes(1);
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          estudianteId,
          rachaActual: 1,
          esNuevaRacha: true,
          rompioRacha: false,
        }),
      );

      // Assert - DB actualizada
      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(racha?.racha_actual).toBe(1);
      expect(racha?.total_dias_activos).toBe(1);
    });

    it('debe establecer ultima_actividad correctamente', async () => {
      // Act
      const antes = new Date();
      await service.registrarActividad(estudianteId);
      const despues = new Date();

      // Assert
      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });

      expect(racha?.ultima_actividad).toBeDefined();
      expect(racha!.ultima_actividad!.getTime()).toBeGreaterThanOrEqual(
        antes.getTime(),
      );
      expect(racha!.ultima_actividad!.getTime()).toBeLessThanOrEqual(
        despues.getTime(),
      );
    });
  });

  // ============================================================================
  // TEST 2: Actividad consecutiva (día siguiente)
  // ============================================================================
  describe('registrarActividad - días consecutivos', () => {
    it('debe incrementar racha cuando es día consecutivo', async () => {
      // Arrange - Simular actividad de ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      ayer.setHours(12, 0, 0, 0);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 3,
          racha_maxima: 5,
          ultima_actividad: ayer,
          total_dias_activos: 10,
        },
      });

      const eventHandler = jest.fn();
      eventEmitter.on('racha.actualizada', eventHandler);

      // Act
      await service.registrarActividad(estudianteId);

      // Assert
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          rachaActual: 4,
          rachaMaxima: 5,
          esNuevaRacha: true,
          rompioRacha: false,
        }),
      );

      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(racha?.racha_actual).toBe(4);
      expect(racha?.total_dias_activos).toBe(11);
    });

    it('debe actualizar racha_maxima si supera el récord', async () => {
      // Arrange - Racha actual = máxima = 5, ayer hubo actividad
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      ayer.setHours(12, 0, 0, 0);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 5,
          racha_maxima: 5,
          ultima_actividad: ayer,
        },
      });

      // Act
      await service.registrarActividad(estudianteId);

      // Assert
      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(racha?.racha_actual).toBe(6);
      expect(racha?.racha_maxima).toBe(6);
    });
  });

  // ============================================================================
  // TEST 3: Racha rota (más de 1 día sin actividad)
  // ============================================================================
  describe('registrarActividad - racha rota', () => {
    it('debe resetear racha cuando pasaron más de 1 día', async () => {
      // Arrange - Última actividad hace 3 días
      const hace3Dias = new Date();
      hace3Dias.setDate(hace3Dias.getDate() - 3);
      hace3Dias.setHours(12, 0, 0, 0);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 7,
          racha_maxima: 10,
          ultima_actividad: hace3Dias,
          total_dias_activos: 20,
        },
      });

      const eventHandler = jest.fn();
      eventEmitter.on('racha.actualizada', eventHandler);

      // Act
      await service.registrarActividad(estudianteId);

      // Assert
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          rachaActual: 1,
          rachaMaxima: 10, // Máxima se mantiene
          esNuevaRacha: false, // No es "nueva" porque hubo actividad previa
          rompioRacha: true,
        }),
      );

      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(racha?.racha_actual).toBe(1);
      expect(racha?.racha_maxima).toBe(10); // No cambia
      expect(racha?.total_dias_activos).toBe(21); // Incrementa
    });

    it('debe marcar rompioRacha=true solo si había racha previa', async () => {
      // Arrange - Sin racha previa (racha_actual = 0)
      const hace3Dias = new Date();
      hace3Dias.setDate(hace3Dias.getDate() - 3);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 0,
          racha_maxima: 5,
          ultima_actividad: hace3Dias,
        },
      });

      const eventHandler = jest.fn();
      eventEmitter.on('racha.actualizada', eventHandler);

      // Act
      await service.registrarActividad(estudianteId);

      // Assert - No se "rompió" porque no había racha
      expect(eventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          rompioRacha: false,
        }),
      );
    });
  });

  // ============================================================================
  // TEST 4: Misma día - no incrementar
  // ============================================================================
  describe('registrarActividad - mismo día', () => {
    it('NO debe incrementar racha si ya hubo actividad hoy', async () => {
      // Arrange - Actividad hace 1 hora
      const haceUnaHora = new Date();
      haceUnaHora.setHours(haceUnaHora.getHours() - 1);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 5,
          racha_maxima: 5,
          ultima_actividad: haceUnaHora,
          total_dias_activos: 15,
        },
      });

      const eventHandler = jest.fn();
      eventEmitter.on('racha.actualizada', eventHandler);

      // Act
      const result = await service.registrarActividad(estudianteId);

      // Assert - No emite evento (o emite con esNuevaRacha: false)
      // Verificar retorno
      expect(result.racha_actual).toBe(5);
      expect(result.es_nueva_racha).toBe(false);

      // Verificar DB no cambió
      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(racha?.racha_actual).toBe(5);
      expect(racha?.total_dias_activos).toBe(15); // No incrementó
    });
  });

  // ============================================================================
  // TEST 5: verificarRacha - actualizar si expiró
  // ============================================================================
  describe('verificarRacha', () => {
    it('debe resetear racha si pasaron más de 1 día', async () => {
      // Arrange
      const hace2Dias = new Date();
      hace2Dias.setDate(hace2Dias.getDate() - 2);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 10,
          racha_maxima: 15,
          ultima_actividad: hace2Dias,
        },
      });

      // Act
      const racha = await service.verificarRacha(estudianteId);

      // Assert
      expect(racha.racha_actual).toBe(0);
      expect(racha.racha_maxima).toBe(15); // Se mantiene
    });

    it('NO debe resetear si está dentro del período válido', async () => {
      // Arrange - Actividad de ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      ayer.setHours(12, 0, 0, 0);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 5,
          racha_maxima: 5,
          ultima_actividad: ayer,
        },
      });

      // Act
      const racha = await service.verificarRacha(estudianteId);

      // Assert
      expect(racha.racha_actual).toBe(5);
    });
  });

  // ============================================================================
  // TEST 6: obtenerEstadisticas
  // ============================================================================
  describe('obtenerEstadisticas', () => {
    it('debe retornar estadísticas correctas', async () => {
      // Arrange
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 7,
          racha_maxima: 14,
          total_dias_activos: 30,
          ultima_actividad: ayer,
        },
      });

      // Act
      const stats = await service.obtenerEstadisticas(estudianteId);

      // Assert
      expect(stats).toMatchObject({
        racha_actual: 7,
        racha_maxima: 14,
        total_dias_activos: 30,
        dias_consecutivos: 7,
      });
      expect(stats.ultima_actividad).toBeDefined();
    });
  });

  // ============================================================================
  // TEST 7: Edge cases
  // ============================================================================
  describe('Edge cases', () => {
    it('debe crear racha si no existe', async () => {
      // Arrange - Crear estudiante sin racha
      const nuevoEstudiante = await prisma.estudiante.create({
        data: {
          nombre: 'Sin',
          apellido: 'Racha',
          username: `sin_racha_${Date.now()}`,
          password_hash: 'hash',
          estado_acceso: 'ACTIVO',
          nivelEscolar: '1ro Primaria',
          edad: 10,
          tutor_id: tutorId,
        },
      });

      // Act
      const racha = await service.obtenerRacha(nuevoEstudiante.id);

      // Assert
      expect(racha).toBeDefined();
      expect(racha.racha_actual).toBe(0);
      expect(racha.estudiante_id).toBe(nuevoEstudiante.id);
    });

    it('debe manejar actividad en el límite de medianoche', async () => {
      // Arrange - Actividad justo antes de medianoche ayer
      const ayerNoche = new Date();
      ayerNoche.setDate(ayerNoche.getDate() - 1);
      ayerNoche.setHours(23, 59, 59, 0);

      await prisma.rachaEstudiante.update({
        where: { estudiante_id: estudianteId },
        data: {
          racha_actual: 3,
          ultima_actividad: ayerNoche,
        },
      });

      // Act - Actividad hoy temprano (debería ser consecutivo)
      await service.registrarActividad(estudianteId);

      // Assert
      const racha = await prisma.rachaEstudiante.findUnique({
        where: { estudiante_id: estudianteId },
      });
      expect(racha?.racha_actual).toBe(4);
    });
  });
});
