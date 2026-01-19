/**
 * ============================================================================
 * INTEGRATION TESTS - NotificacionesService
 * ============================================================================
 *
 * Tests de integración BLACK BOX contra PostgreSQL de test.
 *
 * REQUISITOS BAJO TEST:
 * 1. Crear notificaciones para cada tipo de destinatario (polimórfico)
 * 2. Validar que exactamente un destinatario esté presente
 * 3. Obtener notificaciones con filtros y paginación
 * 4. Marcar notificaciones como leídas
 * 5. Eliminar notificaciones respetando ownership
 * 6. Métodos de conveniencia por entidad (facade)
 * 7. Métodos de notificación automática (pagos, logros, etc.)
 * 8. Limpieza de notificaciones expiradas
 *
 * CLASES DE EQUIVALENCIA:
 * - Destinatario: tutor | estudiante | docente | admin
 * - Prioridad: BAJA | MEDIA | ALTA | CRITICA
 * - Estado: leida=true | leida=false
 * - Filtro: soloNoLeidas=true | soloNoLeidas=false
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="..." npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPattern="notificaciones.service"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { NotificacionesService } from '../../../src/notificaciones/notificaciones.service';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
  createTestAdmin,
} from '../../fixtures/factories';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';

describe('[INTEGRATION] NotificacionesService - Sistema Polimórfico', () => {
  let app: INestApplication;
  let service: NotificacionesService;
  let prisma: PrismaService;

  // IDs de entidades de prueba
  let tutorId: string;
  let estudianteId: string;
  let docenteId: string;
  let adminId: string;

  // ============================================================================
  // Setup
  // ============================================================================
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = app.get<NotificacionesService>(NotificacionesService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
    // Limpiar notificaciones también
    await prisma.notificacion.deleteMany({});

    // Crear entidades de prueba
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;

    const { estudiante } = await createTestEstudiante(prisma, { tutorId });
    estudianteId = estudiante.id;

    const { docente } = await createTestDocente(prisma);
    docenteId = docente.id;

    const admin = await createTestAdmin(prisma);
    adminId = admin.id;
  });

  // ============================================================================
  // TEST 1: Crear notificación genérica (polimórfico)
  // ============================================================================
  describe('create - Validación de destinatario único', () => {
    it('debe crear notificación para tutor correctamente', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Pago exitoso',
        mensaje: 'Tu pago fue procesado',
        tutorId,
      });

      // Assert
      expect(notificacion).toBeDefined();
      expect(notificacion.tutor_id).toBe(tutorId);
      expect(notificacion.estudiante_id).toBeNull();
      expect(notificacion.docente_id).toBeNull();
      expect(notificacion.admin_id).toBeNull();
      expect(notificacion.leida).toBe(false);
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.MEDIA);
    });

    it('debe crear notificación para estudiante correctamente', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.ESTUDIANTE_LOGRO_DESBLOQUEADO,
        titulo: 'Logro desbloqueado',
        mensaje: 'Felicitaciones por tu logro',
        estudianteId,
      });

      // Assert
      expect(notificacion.estudiante_id).toBe(estudianteId);
      expect(notificacion.tutor_id).toBeNull();
    });

    it('debe crear notificación para docente correctamente', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        titulo: 'Clase próxima',
        mensaje: 'Tu clase comienza en 1 hora',
        docenteId,
      });

      // Assert
      expect(notificacion.docente_id).toBe(docenteId);
      expect(notificacion.tutor_id).toBeNull();
    });

    it('debe crear notificación para admin correctamente', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.ADMIN_NUEVO_PAGO,
        titulo: 'Nuevo pago',
        mensaje: 'Se recibió un pago',
        adminId,
      });

      // Assert
      expect(notificacion.admin_id).toBe(adminId);
      expect(notificacion.tutor_id).toBeNull();
    });

    it('debe lanzar error si no hay destinatario', async () => {
      // Act & Assert
      await expect(
        service.create({
          tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
          titulo: 'Test',
          mensaje: 'Test',
          // Sin destinatario
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar error si hay múltiples destinatarios', async () => {
      // Act & Assert
      await expect(
        service.create({
          tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
          titulo: 'Test',
          mensaje: 'Test',
          tutorId,
          estudianteId, // Dos destinatarios
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe respetar prioridad especificada', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_FALLIDO,
        titulo: 'Pago fallido',
        mensaje: 'Error en el pago',
        prioridad: PrioridadNotificacion.CRITICA,
        tutorId,
      });

      // Assert
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.CRITICA);
    });

    it('debe guardar metadata correctamente', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Pago exitoso',
        mensaje: 'Tu pago fue procesado',
        tutorId,
        metadata: { monto: 5000, transaccion_id: 'TX123' },
      });

      // Assert
      expect(notificacion.metadata).toEqual({
        monto: 5000,
        transaccion_id: 'TX123',
      });
    });
  });

  // ============================================================================
  // TEST 2: findAll con paginación y filtros
  // ============================================================================
  describe('findAll - Paginación y filtros', () => {
    beforeEach(async () => {
      // Crear 5 notificaciones: 3 leídas, 2 no leídas
      for (let i = 0; i < 5; i++) {
        await prisma.notificacion.create({
          data: {
            tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
            titulo: `Notificación ${i + 1}`,
            mensaje: `Mensaje ${i + 1}`,
            tutor_id: tutorId,
            leida: i < 3, // Primeras 3 leídas
            prioridad:
              i === 4
                ? PrioridadNotificacion.CRITICA
                : PrioridadNotificacion.MEDIA,
          },
        });
      }
    });

    it('debe retornar todas las notificaciones del tutor', async () => {
      // Act
      const result = await service.findAll('tutor', tutorId);

      // Assert
      expect(result.data).toHaveLength(5);
      expect(result.meta.total).toBe(5);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('debe filtrar solo no leídas cuando soloNoLeidas=true', async () => {
      // Act
      const result = await service.findAll('tutor', tutorId, true);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every((n) => n.leida === false)).toBe(true);
    });

    it('debe ordenar por prioridad DESC y createdAt DESC', async () => {
      // Act
      const result = await service.findAll('tutor', tutorId);

      // Assert - CRITICA primero
      expect(result.data[0].prioridad).toBe(PrioridadNotificacion.CRITICA);
    });

    it('debe aplicar paginación correctamente', async () => {
      // Act - Página 1 con limit 2
      const page1 = await service.findAll('tutor', tutorId, false, 1, 2);
      const page2 = await service.findAll('tutor', tutorId, false, 2, 2);

      // Assert
      expect(page1.data).toHaveLength(2);
      expect(page1.meta.totalPages).toBe(3);
      expect(page2.data).toHaveLength(2);
      expect(page1.data[0].id).not.toBe(page2.data[0].id);
    });

    it('debe retornar array vacío si no hay notificaciones', async () => {
      // Arrange - Nuevo tutor sin notificaciones
      const { tutor: nuevoTutor } = await createTestTutor(prisma, {
        email: 'nuevo@test.com',
      });

      // Act
      const result = await service.findAll('tutor', nuevoTutor.id);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('debe separar notificaciones por destinatario (ownership)', async () => {
      // Arrange - Notificación para otro tutor
      const { tutor: otroTutor } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });
      await service.createParaTutor(otroTutor.id, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Otro tutor',
        mensaje: 'Para otro tutor',
      });

      // Act - Buscar del tutor original
      const result = await service.findAll('tutor', tutorId);

      // Assert - Solo 5 del tutor original
      expect(result.meta.total).toBe(5);
    });
  });

  // ============================================================================
  // TEST 3: countNoLeidas
  // ============================================================================
  describe('countNoLeidas', () => {
    it('debe contar correctamente notificaciones no leídas', async () => {
      // Arrange - 3 no leídas, 2 leídas
      for (let i = 0; i < 5; i++) {
        await service.create({
          tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
          titulo: `Test ${i}`,
          mensaje: `Mensaje ${i}`,
          tutorId,
        });
      }
      // Marcar 2 como leídas
      const todas = await prisma.notificacion.findMany({
        where: { tutor_id: tutorId },
        take: 2,
      });
      await prisma.notificacion.updateMany({
        where: { id: { in: todas.map((n) => n.id) } },
        data: { leida: true },
      });

      // Act
      const count = await service.countNoLeidas('tutor', tutorId);

      // Assert
      expect(count).toBe(3);
    });

    it('debe retornar 0 si todas están leídas', async () => {
      // Arrange
      await prisma.notificacion.create({
        data: {
          tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
          titulo: 'Test',
          mensaje: 'Test',
          tutor_id: tutorId,
          leida: true,
        },
      });

      // Act
      const count = await service.countNoLeidas('tutor', tutorId);

      // Assert
      expect(count).toBe(0);
    });
  });

  // ============================================================================
  // TEST 4: marcarComoLeida
  // ============================================================================
  describe('marcarComoLeida', () => {
    it('debe marcar notificación como leída', async () => {
      // Arrange
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test',
        mensaje: 'Test',
        tutorId,
      });
      expect(notificacion.leida).toBe(false);

      // Act
      const actualizada = await service.marcarComoLeida(
        notificacion.id,
        'tutor',
        tutorId,
      );

      // Assert
      expect(actualizada.leida).toBe(true);

      // Verificar en DB
      const enDb = await prisma.notificacion.findUnique({
        where: { id: notificacion.id },
      });
      expect(enDb?.leida).toBe(true);
    });

    it('debe lanzar error si la notificación no existe', async () => {
      // Act & Assert
      await expect(
        service.marcarComoLeida('id-inexistente', 'tutor', tutorId),
      ).rejects.toThrow('Notificación no encontrada');
    });

    it('debe lanzar error si la notificación es de otro usuario (ownership)', async () => {
      // Arrange - Notificación de otro tutor
      const { tutor: otroTutor } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });
      const notificacion = await service.createParaTutor(otroTutor.id, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Otro',
        mensaje: 'Otro',
      });

      // Act & Assert - Intentar marcar como tutorId original
      await expect(
        service.marcarComoLeida(notificacion.id, 'tutor', tutorId),
      ).rejects.toThrow('Notificación no encontrada');
    });
  });

  // ============================================================================
  // TEST 5: marcarTodasComoLeidas
  // ============================================================================
  describe('marcarTodasComoLeidas', () => {
    it('debe marcar todas las no leídas como leídas', async () => {
      // Arrange - 5 no leídas
      for (let i = 0; i < 5; i++) {
        await service.create({
          tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
          titulo: `Test ${i}`,
          mensaje: `Mensaje ${i}`,
          tutorId,
        });
      }

      // Act
      const result = await service.marcarTodasComoLeidas('tutor', tutorId);

      // Assert
      expect(result.count).toBe(5);

      const noLeidas = await service.countNoLeidas('tutor', tutorId);
      expect(noLeidas).toBe(0);
    });

    it('no debe afectar notificaciones de otros usuarios', async () => {
      // Arrange
      const { tutor: otroTutor } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });
      await service.createParaTutor(otroTutor.id, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Otro',
        mensaje: 'Otro',
      });
      await service.createParaTutor(tutorId, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Mio',
        mensaje: 'Mio',
      });

      // Act
      await service.marcarTodasComoLeidas('tutor', tutorId);

      // Assert - La del otro sigue no leída
      const countOtro = await service.countNoLeidas('tutor', otroTutor.id);
      expect(countOtro).toBe(1);
    });
  });

  // ============================================================================
  // TEST 6: remove
  // ============================================================================
  describe('remove', () => {
    it('debe eliminar notificación correctamente', async () => {
      // Arrange
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test',
        mensaje: 'Test',
        tutorId,
      });

      // Act
      await service.remove(notificacion.id, 'tutor', tutorId);

      // Assert
      const enDb = await prisma.notificacion.findUnique({
        where: { id: notificacion.id },
      });
      expect(enDb).toBeNull();
    });

    it('debe lanzar error si la notificación no existe', async () => {
      // Act & Assert
      await expect(
        service.remove('id-inexistente', 'tutor', tutorId),
      ).rejects.toThrow('Notificación no encontrada');
    });

    it('debe respetar ownership - no permitir eliminar de otro usuario', async () => {
      // Arrange
      const { tutor: otroTutor } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });
      const notificacion = await service.createParaTutor(otroTutor.id, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Otro',
        mensaje: 'Otro',
      });

      // Act & Assert
      await expect(
        service.remove(notificacion.id, 'tutor', tutorId),
      ).rejects.toThrow('Notificación no encontrada');
    });
  });

  // ============================================================================
  // TEST 7: Métodos facade por entidad
  // ============================================================================
  describe('Métodos facade - createParaXxx', () => {
    it('createParaTutor debe crear notificación para tutor', async () => {
      // Act
      const notificacion = await service.createParaTutor(tutorId, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test',
        mensaje: 'Test',
      });

      // Assert
      expect(notificacion.tutor_id).toBe(tutorId);
    });

    it('createParaEstudiante debe crear notificación para estudiante', async () => {
      // Act
      const notificacion = await service.createParaEstudiante(estudianteId, {
        tipo: TipoNotificacion.ESTUDIANTE_BIENVENIDA,
        titulo: 'Bienvenido',
        mensaje: 'Bienvenido a la plataforma',
      });

      // Assert
      expect(notificacion.estudiante_id).toBe(estudianteId);
    });

    it('createParaDocente debe crear notificación para docente', async () => {
      // Act
      const notificacion = await service.createParaDocente(docenteId, {
        tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        titulo: 'Clase',
        mensaje: 'Tu clase comienza pronto',
      });

      // Assert
      expect(notificacion.docente_id).toBe(docenteId);
    });

    it('createParaAdmin debe crear notificación para admin', async () => {
      // Act
      const notificacion = await service.createParaAdmin(adminId, {
        tipo: TipoNotificacion.ADMIN_ALERTA_SISTEMA,
        titulo: 'Alerta',
        mensaje: 'Alerta del sistema',
      });

      // Assert
      expect(notificacion.admin_id).toBe(adminId);
    });
  });

  describe('Métodos facade - findAllXxx y countNoLeidasXxx', () => {
    beforeEach(async () => {
      // Crear notificaciones para cada tipo
      await service.createParaTutor(tutorId, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Tutor',
        mensaje: 'Mensaje tutor',
      });
      await service.createParaEstudiante(estudianteId, {
        tipo: TipoNotificacion.ESTUDIANTE_BIENVENIDA,
        titulo: 'Estudiante',
        mensaje: 'Mensaje estudiante',
      });
      await service.createParaDocente(docenteId, {
        tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        titulo: 'Docente',
        mensaje: 'Mensaje docente',
      });
      await service.createParaAdmin(adminId, {
        tipo: TipoNotificacion.ADMIN_NUEVO_PAGO,
        titulo: 'Admin',
        mensaje: 'Mensaje admin',
      });
    });

    it('findAllTutor retorna solo notificaciones del tutor', async () => {
      const result = await service.findAllTutor(tutorId);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].titulo).toBe('Tutor');
    });

    it('findAllEstudiante retorna solo notificaciones del estudiante', async () => {
      const result = await service.findAllEstudiante(estudianteId);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].titulo).toBe('Estudiante');
    });

    it('findAllDocente retorna solo notificaciones del docente', async () => {
      const result = await service.findAllDocente(docenteId);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].titulo).toBe('Docente');
    });

    it('findAllAdmin retorna solo notificaciones del admin', async () => {
      const result = await service.findAllAdmin(adminId);
      expect(result.meta.total).toBe(1);
      expect(result.data[0].titulo).toBe('Admin');
    });

    it('countNoLeidasTutor cuenta correctamente', async () => {
      const count = await service.countNoLeidasTutor(tutorId);
      expect(count).toBe(1);
    });

    it('countNoLeidasEstudiante cuenta correctamente', async () => {
      const count = await service.countNoLeidasEstudiante(estudianteId);
      expect(count).toBe(1);
    });

    it('countNoLeidasDocente cuenta correctamente', async () => {
      const count = await service.countNoLeidasDocente(docenteId);
      expect(count).toBe(1);
    });

    it('countNoLeidasAdmin cuenta correctamente', async () => {
      const count = await service.countNoLeidasAdmin(adminId);
      expect(count).toBe(1);
    });
  });

  // ============================================================================
  // TEST 8: Métodos de notificación automática
  // ============================================================================
  describe('Notificaciones automáticas - Docentes', () => {
    it('notificarClaseProxima crea notificación con formato correcto', async () => {
      // Act
      const notificacion = await service.notificarClaseProxima(
        docenteId,
        'clase-123',
        'Matemáticas Nivel 1',
        new Date('2026-01-20T14:30:00'),
      );

      // Assert
      expect(notificacion.tipo).toBe(TipoNotificacion.DOCENTE_CLASE_PROXIMA);
      expect(notificacion.titulo).toBe('Clase próxima');
      expect(notificacion.mensaje).toContain('Matemáticas Nivel 1');
      expect(notificacion.mensaje).toContain('14:30');
      expect(notificacion.metadata).toEqual({ clase_id: 'clase-123' });
    });

    it('notificarAsistenciaPendiente crea notificación correctamente', async () => {
      // Act
      const notificacion = await service.notificarAsistenciaPendiente(
        docenteId,
        'clase-456',
        'Física Avanzada',
      );

      // Assert
      expect(notificacion.tipo).toBe(
        TipoNotificacion.DOCENTE_ASISTENCIA_PENDIENTE,
      );
      expect(notificacion.mensaje).toContain('Física Avanzada');
    });

    it('notificarEstudianteAlerta crea notificación con prioridad ALTA', async () => {
      // Act
      const notificacion = await service.notificarEstudianteAlerta(
        docenteId,
        estudianteId,
        'Juan Pérez',
        'Bajo rendimiento en últimas clases',
      );

      // Assert
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.ALTA);
      expect(notificacion.mensaje).toContain('Juan Pérez');
      expect(notificacion.metadata).toEqual({ estudiante_id: estudianteId });
    });

    it('notificarClaseCancelada incluye motivo si está presente', async () => {
      // Act
      const sinMotivo = await service.notificarClaseCancelada(
        docenteId,
        'clase-1',
        'Clase A',
      );
      const conMotivo = await service.notificarClaseCancelada(
        docenteId,
        'clase-2',
        'Clase B',
        'Feriado nacional',
      );

      // Assert
      expect(sinMotivo.mensaje).not.toContain(':');
      expect(conMotivo.mensaje).toContain('Feriado nacional');
    });

    it('notificarLogroEstudiante crea notificación correctamente', async () => {
      // Act
      const notificacion = await service.notificarLogroEstudiante(
        docenteId,
        estudianteId,
        'María García',
        'Primer Paso',
      );

      // Assert
      expect(notificacion.tipo).toBe(TipoNotificacion.DOCENTE_LOGRO_ESTUDIANTE);
      expect(notificacion.mensaje).toContain('María García');
      expect(notificacion.mensaje).toContain('Primer Paso');
    });
  });

  describe('Notificaciones automáticas - Tutores', () => {
    it('notificarPagoExitoso formatea monto en AR', async () => {
      // Act
      const notificacion = await service.notificarPagoExitoso(
        tutorId,
        15000,
        'Suscripción Premium',
      );

      // Assert
      expect(notificacion.tipo).toBe(TipoNotificacion.TUTOR_PAGO_EXITOSO);
      // Formato AR: 15.000 o 15,000 dependiendo de locale
      expect(notificacion.mensaje).toContain('15');
      expect(notificacion.mensaje).toContain('Suscripción Premium');
    });

    it('notificarPagoFallido tiene prioridad ALTA', async () => {
      // Act
      const notificacion = await service.notificarPagoFallido(
        tutorId,
        5000,
        'Tarjeta rechazada',
      );

      // Assert
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.ALTA);
      expect(notificacion.mensaje).toContain('Tarjeta rechazada');
    });

    it('notificarSuscripcionProximaVencer ajusta prioridad según días', async () => {
      // Act - Más de 3 días
      const lejana = await service.notificarSuscripcionProximaVencer(
        tutorId,
        7,
      );
      // Act - 3 días o menos
      const cercana = await service.notificarSuscripcionProximaVencer(
        tutorId,
        2,
      );

      // Assert
      expect(lejana.prioridad).toBe(PrioridadNotificacion.MEDIA);
      expect(cercana.prioridad).toBe(PrioridadNotificacion.ALTA);
    });

    it('notificarLogroHijo incluye nombre del hijo y logro', async () => {
      // Act
      const notificacion = await service.notificarLogroHijo(
        tutorId,
        'Pedro',
        estudianteId,
        'Campeón de Matemáticas',
      );

      // Assert
      expect(notificacion.titulo).toContain('Pedro');
      expect(notificacion.mensaje).toContain('Campeón de Matemáticas');
      expect(notificacion.metadata).toEqual({
        estudiante_id: estudianteId,
        logro_titulo: 'Campeón de Matemáticas',
      });
    });
  });

  describe('Notificaciones automáticas - Estudiantes', () => {
    it('notificarLogroDesbloqueado incluye XP ganado', async () => {
      // Act
      const notificacion = await service.notificarLogroDesbloqueado(
        estudianteId,
        'Explorador',
        50,
      );

      // Assert
      expect(notificacion.tipo).toBe(
        TipoNotificacion.ESTUDIANTE_LOGRO_DESBLOQUEADO,
      );
      expect(notificacion.mensaje).toContain('50 XP');
      expect(notificacion.metadata).toEqual({
        logro_titulo: 'Explorador',
        xp_ganado: 50,
      });
    });

    it('notificarNivelSubido tiene prioridad ALTA', async () => {
      // Act
      const notificacion = await service.notificarNivelSubido(estudianteId, 5);

      // Assert
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.ALTA);
      expect(notificacion.mensaje).toContain('nivel 5');
    });

    it('notificarRachaEnRiesgo tiene prioridad ALTA', async () => {
      // Act
      const notificacion = await service.notificarRachaEnRiesgo(
        estudianteId,
        10,
      );

      // Assert
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.ALTA);
      expect(notificacion.mensaje).toContain('10 días');
    });

    it('notificarBienvenida incluye nombre del estudiante', async () => {
      // Act
      const notificacion = await service.notificarBienvenida(
        estudianteId,
        'Lucía',
      );

      // Assert
      expect(notificacion.titulo).toContain('Lucía');
    });
  });

  describe('Notificaciones automáticas - Admins', () => {
    it('notificarNuevoPago incluye nombre del tutor y monto', async () => {
      // Act
      const notificacion = await service.notificarNuevoPago(
        adminId,
        'Carlos López',
        25000,
      );

      // Assert
      expect(notificacion.tipo).toBe(TipoNotificacion.ADMIN_NUEVO_PAGO);
      expect(notificacion.mensaje).toContain('Carlos López');
      expect(notificacion.mensaje).toContain('25');
    });

    it('notificarAlertaSistema tiene prioridad CRITICA', async () => {
      // Act
      const notificacion = await service.notificarAlertaSistema(
        adminId,
        'Error crítico',
        'Base de datos al 95% de capacidad',
      );

      // Assert
      expect(notificacion.prioridad).toBe(PrioridadNotificacion.CRITICA);
      expect(notificacion.titulo).toBe('Error crítico');
    });
  });

  // ============================================================================
  // TEST 9: Limpieza de notificaciones expiradas
  // ============================================================================
  describe('limpiarExpiradas', () => {
    it('debe eliminar notificaciones con fecha de expiración pasada', async () => {
      // Arrange - 2 expiradas, 1 vigente
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);

      const manana = new Date();
      manana.setDate(manana.getDate() + 1);

      await prisma.notificacion.createMany({
        data: [
          {
            tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
            titulo: 'Expirada 1',
            mensaje: 'Ya expiró',
            tutor_id: tutorId,
            expiraEn: ayer,
          },
          {
            tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
            titulo: 'Expirada 2',
            mensaje: 'Ya expiró también',
            tutor_id: tutorId,
            expiraEn: ayer,
          },
          {
            tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
            titulo: 'Vigente',
            mensaje: 'Todavía vigente',
            tutor_id: tutorId,
            expiraEn: manana,
          },
        ],
      });

      // Act
      const eliminadas = await service.limpiarExpiradas();

      // Assert
      expect(eliminadas).toBe(2);

      const restantes = await prisma.notificacion.findMany({
        where: { tutor_id: tutorId },
      });
      expect(restantes).toHaveLength(1);
      expect(restantes[0].titulo).toBe('Vigente');
    });

    it('no debe eliminar notificaciones sin fecha de expiración', async () => {
      // Arrange
      await prisma.notificacion.create({
        data: {
          tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
          titulo: 'Sin expiración',
          mensaje: 'Esta no expira',
          tutor_id: tutorId,
          // Sin expiraEn
        },
      });

      // Act
      const eliminadas = await service.limpiarExpiradas();

      // Assert
      expect(eliminadas).toBe(0);
      const count = await prisma.notificacion.count({
        where: { tutor_id: tutorId },
      });
      expect(count).toBe(1);
    });
  });

  // ============================================================================
  // TEST 10: Edge cases y boundary testing
  // ============================================================================
  describe('Edge cases', () => {
    it('debe manejar títulos y mensajes con caracteres especiales', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: '¡Pago éxitoso! 🎉',
        mensaje: "Tu pago de $10.000 por 'Plan Premium' fue procesado",
        tutorId,
      });

      // Assert
      expect(notificacion.titulo).toBe('¡Pago éxitoso! 🎉');
      expect(notificacion.mensaje).toContain("'Plan Premium'");
    });

    it('debe manejar metadata vacío', async () => {
      // Act
      const notificacion = await service.create({
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test',
        mensaje: 'Test',
        tutorId,
        metadata: {},
      });

      // Assert
      expect(notificacion.metadata).toEqual({});
    });

    it('debe manejar paginación con página mayor al total', async () => {
      // Arrange - Solo 2 notificaciones
      await service.createParaTutor(tutorId, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test 1',
        mensaje: 'Test 1',
      });
      await service.createParaTutor(tutorId, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test 2',
        mensaje: 'Test 2',
      });

      // Act - Pedir página 10
      const result = await service.findAllTutor(tutorId, false, 10, 20);

      // Assert
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(10);
    });

    it('marcarComoLeida debe ser idempotente', async () => {
      // Arrange
      const notificacion = await service.createParaTutor(tutorId, {
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        titulo: 'Test',
        mensaje: 'Test',
      });

      // Act - Marcar dos veces
      await service.marcarComoLeida(notificacion.id, 'tutor', tutorId);
      const segundaVez = await service.marcarComoLeida(
        notificacion.id,
        'tutor',
        tutorId,
      );

      // Assert - No debe fallar y sigue leída
      expect(segundaVez.leida).toBe(true);
    });
  });
});
