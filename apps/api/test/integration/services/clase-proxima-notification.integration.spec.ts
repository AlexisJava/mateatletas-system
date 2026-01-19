/**
 * ============================================================================
 * INTEGRATION TESTS - ClaseProximaNotificationService
 * ============================================================================
 *
 * Tests de integración BLACK BOX contra PostgreSQL de test.
 *
 * REQUISITOS BAJO TEST:
 * 1. Notificar docentes sobre clases que ocurren mañana
 * 2. Notificar estudiantes inscritos sobre clases de mañana
 * 3. Notificar tutores sobre clases de sus hijos mañana
 * 4. Evitar notificaciones duplicadas (mismo día, mismo destinatario, misma clase)
 * 5. Respetar filtros: clases activas, dentro de rango de fechas, inscripciones activas
 *
 * CLASES DE EQUIVALENCIA:
 * - Clases: activas vs inactivas, con inscripciones vs sin inscripciones
 * - Fechas: dentro de rango vs fuera de rango
 * - Día semana: coincide con mañana vs no coincide
 * - Duplicados: primera vez vs ya notificado hoy
 *
 * NOTA: El método runManually() permite ejecutar el cron sin esperar la hora programada.
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: npm run test:integration -- --testPathPattern="clase-proxima-notification"
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClaseProximaNotificationService } from '../../../src/notificaciones/services/clase-proxima-notification.service';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
  createTestClaseGrupo,
  createTestInscripcionClaseGrupo,
} from '../../fixtures/factories';
import { DiaSemana, TipoNotificacion } from '@prisma/client';

/**
 * Obtiene el DiaSemana de Prisma para mañana
 */
function getDiaSemanaManana(): DiaSemana {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const dias: DiaSemana[] = [
    DiaSemana.DOMINGO,
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
    DiaSemana.SABADO,
  ];
  return dias[manana.getDay()];
}

describe('[INTEGRATION] ClaseProximaNotificationService', () => {
  let app: INestApplication;
  let service: ClaseProximaNotificationService;
  let prisma: PrismaService;

  // IDs de entidades de prueba
  let tutorId: string;
  let estudianteId: string;
  let docenteId: string;

  // ============================================================================
  // Setup
  // ============================================================================
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    service = app.get<ClaseProximaNotificationService>(
      ClaseProximaNotificationService,
    );
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
    await prisma.notificacion.deleteMany({});

    // Crear entidades de prueba
    const { tutor } = await createTestTutor(prisma);
    tutorId = tutor.id;

    const { estudiante } = await createTestEstudiante(prisma, { tutorId });
    estudianteId = estudiante.id;

    const { docente } = await createTestDocente(prisma);
    docenteId = docente.id;
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Crea una clase para mañana con el docente y rango de fechas válido
   */
  async function crearClaseParaManana(
    options: {
      nombre?: string;
      horaInicio?: string;
      activo?: boolean;
    } = {},
  ) {
    const hoy = new Date();
    const enUnMes = new Date();
    enUnMes.setMonth(enUnMes.getMonth() + 1);

    return createTestClaseGrupo(prisma, {
      docenteId,
      nombre: options.nombre ?? 'Clase de prueba',
      diaSemana: getDiaSemanaManana(),
      horaInicio: options.horaInicio ?? '14:00',
      horaFin: '15:00',
      fechaInicio: hoy,
      fechaFin: enUnMes,
      activo: options.activo ?? true,
    });
  }

  /**
   * Crea inscripción para el estudiante en la clase usando inscripcionUnificada
   */
  async function inscribirEstudiante(claseGrupoId: string) {
    // Factory usa parámetros posicionales: (prisma, estudianteId, claseGrupoId, tutorId)
    return createTestInscripcionClaseGrupo(
      prisma,
      estudianteId,
      claseGrupoId,
      tutorId,
    );
  }

  // ============================================================================
  // TEST 1: Notificar docentes
  // ============================================================================
  describe('Notificación a docentes', () => {
    it('debe notificar al docente de una clase programada para mañana', async () => {
      // Arrange
      await crearClaseParaManana({ nombre: 'Matemáticas Nivel 1' });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(1);

      const notificaciones = await prisma.notificacion.findMany({
        where: { docente_id: docenteId },
      });
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.DOCENTE_CLASE_PROXIMA,
      );
      expect(notificaciones[0].mensaje).toContain('Matemáticas Nivel 1');
    });

    it('debe notificar múltiples clases al mismo docente', async () => {
      // Arrange - 2 clases para mañana
      await crearClaseParaManana({ nombre: 'Clase A', horaInicio: '09:00' });
      await crearClaseParaManana({ nombre: 'Clase B', horaInicio: '14:00' });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(2);

      const notificaciones = await prisma.notificacion.findMany({
        where: {
          docente_id: docenteId,
          tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        },
      });
      expect(notificaciones).toHaveLength(2);
    });

    it('NO debe notificar si la clase está inactiva', async () => {
      // Arrange
      await crearClaseParaManana({ activo: false });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(0);
    });

    it('NO debe notificar si la clase es otro día de la semana', async () => {
      // Arrange - Clase con día diferente a mañana
      const hoy = new Date();
      const enUnMes = new Date();
      enUnMes.setMonth(enUnMes.getMonth() + 1);

      // Calcular un día que NO sea mañana
      const diasSemana: DiaSemana[] = [
        DiaSemana.DOMINGO,
        DiaSemana.LUNES,
        DiaSemana.MARTES,
        DiaSemana.MIERCOLES,
        DiaSemana.JUEVES,
        DiaSemana.VIERNES,
        DiaSemana.SABADO,
      ];
      const diaManana = getDiaSemanaManana();
      const otroDia =
        diasSemana.find((d) => d !== diaManana) ?? DiaSemana.LUNES;

      await createTestClaseGrupo(prisma, {
        docenteId,
        nombre: 'Clase otro día',
        diaSemana: otroDia,
        horaInicio: '14:00',
        horaFin: '15:00',
        fechaInicio: hoy,
        fechaFin: enUnMes,
        activo: true,
      });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(0);
    });

    it('NO debe notificar si la clase está fuera del rango de fechas', async () => {
      // Arrange - Clase que terminó ayer
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);

      await createTestClaseGrupo(prisma, {
        docenteId,
        nombre: 'Clase expirada',
        diaSemana: getDiaSemanaManana(),
        horaInicio: '14:00',
        horaFin: '15:00',
        fechaInicio: haceUnMes,
        fechaFin: ayer, // Ya terminó
        activo: true,
      });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(0);
    });
  });

  // ============================================================================
  // TEST 2: Notificar estudiantes
  // ============================================================================
  describe('Notificación a estudiantes', () => {
    it('debe notificar al estudiante inscrito en clase de mañana', async () => {
      // Arrange
      const clase = await crearClaseParaManana({ nombre: 'Física' });
      await inscribirEstudiante(clase.id);

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.estudiantes).toBe(1);

      const notificaciones = await prisma.notificacion.findMany({
        where: { estudiante_id: estudianteId },
      });
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.ESTUDIANTE_CLASE_PROXIMA,
      );
      expect(notificaciones[0].mensaje).toContain('Física');
    });

    it('debe notificar a múltiples estudiantes de la misma clase', async () => {
      // Arrange - 2 estudiantes inscritos
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId,
        username: 'estudiante2',
      });

      const clase = await crearClaseParaManana({ nombre: 'Clase grupal' });
      await inscribirEstudiante(clase.id);
      await createTestInscripcionClaseGrupo(prisma, est2.id, clase.id, tutorId);

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.estudiantes).toBe(2);
    });

    it('NO debe notificar si la inscripción no está ACTIVA', async () => {
      // Arrange - Inscripción cancelada (fecha_baja != null en la vista)
      const clase = await crearClaseParaManana();
      const inscripcion = await createTestInscripcionClaseGrupo(
        prisma,
        estudianteId,
        clase.id,
        tutorId,
      );
      // Setear fecha_baja para que estado = CANCELADA en la vista unificada
      await prisma.inscripcionClaseGrupo.update({
        where: { id: inscripcion.id },
        data: { fecha_baja: new Date() },
      });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.estudiantes).toBe(0);
    });
  });

  // ============================================================================
  // TEST 3: Notificar tutores
  // ============================================================================
  describe('Notificación a tutores', () => {
    it('debe notificar al tutor sobre clase del hijo mañana', async () => {
      // Arrange
      const clase = await crearClaseParaManana({ nombre: 'Química' });
      await inscribirEstudiante(clase.id);

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.tutores).toBe(1);

      const notificaciones = await prisma.notificacion.findMany({
        where: { tutor_id: tutorId },
      });
      expect(notificaciones).toHaveLength(1);
      expect(notificaciones[0].tipo).toBe(
        TipoNotificacion.TUTOR_CLASE_PROXIMA_HIJO,
      );
      expect(notificaciones[0].mensaje).toContain('Química');
    });

    it('debe notificar solo una vez al tutor aunque tenga varios hijos en la misma clase', async () => {
      // Arrange - 2 estudiantes del mismo tutor
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId,
        username: 'hijo2',
      });

      const clase = await crearClaseParaManana();
      await inscribirEstudiante(clase.id);
      await createTestInscripcionClaseGrupo(prisma, est2.id, clase.id, tutorId);

      // Act
      const resultado = await service.runManually();

      // Assert - Solo 1 notificación para el tutor (aunque 2 para estudiantes)
      expect(resultado.tutores).toBe(1);
      expect(resultado.estudiantes).toBe(2);
    });
  });

  // ============================================================================
  // TEST 4: Prevención de duplicados
  // ============================================================================
  describe('Prevención de notificaciones duplicadas', () => {
    it('NO debe enviar notificación duplicada al docente el mismo día', async () => {
      // Arrange
      const clase = await crearClaseParaManana({ nombre: 'Clase única' });

      // Primera ejecución
      await service.runManually();

      // Act - Segunda ejecución el mismo día
      const resultado2 = await service.runManually();

      // Assert
      expect(resultado2.docentes).toBe(0); // No duplicado

      const notificaciones = await prisma.notificacion.findMany({
        where: { docente_id: docenteId },
      });
      expect(notificaciones).toHaveLength(1); // Solo 1 notificación
    });

    it('NO debe enviar notificación duplicada al estudiante el mismo día', async () => {
      // Arrange
      const clase = await crearClaseParaManana();
      await inscribirEstudiante(clase.id);

      // Primera ejecución
      await service.runManually();

      // Act - Segunda ejecución
      const resultado2 = await service.runManually();

      // Assert
      expect(resultado2.estudiantes).toBe(0);

      const notificaciones = await prisma.notificacion.findMany({
        where: { estudiante_id: estudianteId },
      });
      expect(notificaciones).toHaveLength(1);
    });

    it('NO debe enviar notificación duplicada al tutor el mismo día', async () => {
      // Arrange
      const clase = await crearClaseParaManana();
      await inscribirEstudiante(clase.id);

      // Primera ejecución
      await service.runManually();

      // Act - Segunda ejecución
      const resultado2 = await service.runManually();

      // Assert
      expect(resultado2.tutores).toBe(0);

      const notificaciones = await prisma.notificacion.findMany({
        where: { tutor_id: tutorId },
      });
      expect(notificaciones).toHaveLength(1);
    });

    it('DEBE permitir notificación de DIFERENTE clase el mismo día', async () => {
      // Arrange - 2 clases diferentes
      const clase1 = await crearClaseParaManana({
        nombre: 'Clase A',
        horaInicio: '09:00',
      });
      const clase2 = await crearClaseParaManana({
        nombre: 'Clase B',
        horaInicio: '14:00',
      });
      await inscribirEstudiante(clase1.id);
      await inscribirEstudiante(clase2.id);

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(2); // Una por cada clase
      expect(resultado.estudiantes).toBe(2);
      expect(resultado.tutores).toBe(2);
    });
  });

  // ============================================================================
  // TEST 5: Casos sin clases
  // ============================================================================
  describe('Casos sin clases', () => {
    it('debe manejar correctamente cuando no hay clases para mañana', async () => {
      // Act - Sin crear ninguna clase
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(0);
      expect(resultado.estudiantes).toBe(0);
      expect(resultado.tutores).toBe(0);
    });

    it('debe manejar correctamente clases sin inscripciones', async () => {
      // Arrange - Clase sin inscripciones
      await crearClaseParaManana({ nombre: 'Clase vacía' });

      // Act
      const resultado = await service.runManually();

      // Assert
      expect(resultado.docentes).toBe(1); // Docente sí recibe
      expect(resultado.estudiantes).toBe(0); // Sin estudiantes
      expect(resultado.tutores).toBe(0); // Sin tutores
    });
  });

  // ============================================================================
  // TEST 6: Metadata en notificaciones
  // ============================================================================
  describe('Metadata de notificaciones', () => {
    it('debe incluir clase_id en metadata de notificación a docente', async () => {
      // Arrange
      const clase = await crearClaseParaManana();

      // Act
      await service.runManually();

      // Assert
      const notificacion = await prisma.notificacion.findFirst({
        where: { docente_id: docenteId },
      });
      expect(notificacion?.metadata).toHaveProperty('clase_id', clase.id);
    });

    it('debe incluir clase_id y estudiante_id en metadata de notificación a tutor', async () => {
      // Arrange
      const clase = await crearClaseParaManana();
      await inscribirEstudiante(clase.id);

      // Act
      await service.runManually();

      // Assert
      const notificacion = await prisma.notificacion.findFirst({
        where: { tutor_id: tutorId },
      });
      expect(notificacion?.metadata).toHaveProperty('clase_id', clase.id);
      expect(notificacion?.metadata).toHaveProperty(
        'estudiante_id',
        estudianteId,
      );
    });

    it('debe incluir hora de clase en el mensaje', async () => {
      // Arrange
      const clase = await crearClaseParaManana({ horaInicio: '10:30' });
      await inscribirEstudiante(clase.id);

      // Act
      await service.runManually();

      // Assert
      const notificacionEstudiante = await prisma.notificacion.findFirst({
        where: { estudiante_id: estudianteId },
      });
      expect(notificacionEstudiante?.mensaje).toContain('10:30');
    });
  });
});
