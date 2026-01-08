/**
 * ============================================================================
 * INTEGRATION TESTS - EstudianteAulaService
 * ============================================================================
 *
 * FASE 6: Tests de integración del Aula Virtual para estudiantes
 *
 * Estos tests corren contra una base de datos REAL (PostgreSQL de test).
 * NO HAY MOCKS - todas las operaciones son reales.
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPattern="estudiante-aula"
 *
 * Métodos testeados:
 * - getMiAula() - Resumen del aula con planificaciones
 * - getPlanificacionDetalle() - Detalle de una planificación
 * - getContenidoClase() - Contenido de teoría/práctica
 * - completarLeccion() - Marcar lección completada
 * - getMisTareas() - Listar tareas asignadas
 * - iniciarTarea() - Iniciar una tarea
 * - completarTarea() - Completar una tarea
 * - getLeaderboard() - Ranking del grupo
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppModule } from '../../../app.module';
import { EstudianteAulaService } from '../estudiante-aula.service';
import { NotFoundException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { EstadoTarea } from '@prisma/client';

describe('[INTEGRATION] EstudianteAulaService', () => {
  let service: EstudianteAulaService;
  let prisma: PrismaService;

  // IDs de entidades creadas en tests (para cleanup)
  const createdIds = {
    planificaciones: [] as string[],
    claseGrupos: [] as string[],
    grupos: [] as string[],
    docentes: [] as string[],
    estudiantes: [] as string[],
    tutores: [] as string[],
    contenidos: [] as string[],
    admins: [] as string[],
  };

  // ============================================================================
  // Setup
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleFixture.get<EstudianteAulaService>(EstudianteAulaService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  }, 60000);

  // ============================================================================
  // Cleanup
  // ============================================================================
  afterEach(async () => {
    // Limpiar en orden correcto (hijos primero)
    await prisma.progresoTareaEstudiante.deleteMany({
      where: {
        tareaAsignada: {
          asignacion: {
            planificacion_id: { in: createdIds.planificaciones },
          },
        },
      },
    });
    await prisma.progresoClaseEstudiante.deleteMany({
      where: {
        clase: {
          planificacion_id: { in: createdIds.planificaciones },
        },
      },
    });
    await prisma.tareaAsignada.deleteMany({
      where: {
        asignacion: {
          planificacion_id: { in: createdIds.planificaciones },
        },
      },
    });
    await prisma.estadoClaseGrupo.deleteMany({
      where: {
        asignacion: {
          planificacion_id: { in: createdIds.planificaciones },
        },
      },
    });
    await prisma.asignacionPlanificacion.deleteMany({
      where: { planificacion_id: { in: createdIds.planificaciones } },
    });
    await prisma.tareaClase.deleteMany({
      where: {
        clase: {
          planificacion_id: { in: createdIds.planificaciones },
        },
      },
    });
    await prisma.clasePlanificacion.deleteMany({
      where: { planificacion_id: { in: createdIds.planificaciones } },
    });
    await prisma.planificacion.deleteMany({
      where: { id: { in: createdIds.planificaciones } },
    });
    await prisma.inscripcionClaseGrupo.deleteMany({
      where: { clase_grupo_id: { in: createdIds.claseGrupos } },
    });
    await prisma.claseGrupo.deleteMany({
      where: { id: { in: createdIds.claseGrupos } },
    });
    await prisma.grupo.deleteMany({
      where: { id: { in: createdIds.grupos } },
    });
    await prisma.recursosEstudiante.deleteMany({
      where: { estudiante_id: { in: createdIds.estudiantes } },
    });
    await prisma.estudiante.deleteMany({
      where: { id: { in: createdIds.estudiantes } },
    });
    await prisma.tutor.deleteMany({
      where: { id: { in: createdIds.tutores } },
    });
    await prisma.docente.deleteMany({
      where: { id: { in: createdIds.docentes } },
    });
    await prisma.contenido.deleteMany({
      where: { id: { in: createdIds.contenidos } },
    });
    await prisma.admin.deleteMany({
      where: { id: { in: createdIds.admins } },
    });

    // Reset arrays
    Object.keys(createdIds).forEach((key) => {
      createdIds[key as keyof typeof createdIds] = [];
    });
  });

  // ============================================================================
  // HELPERS
  // ============================================================================
  async function crearAdmin(suffix = '') {
    const uniqueId = createId();
    const admin = await prisma.admin.create({
      data: {
        email: `admin-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-admin-123',
        nombre: 'Admin',
        apellido: `Test${suffix}`,
        roles: JSON.stringify(['admin']),
      },
    });
    createdIds.admins.push(admin.id);
    return admin;
  }

  async function crearDocente(suffix = '') {
    const uniqueId = createId();
    const docente = await prisma.docente.create({
      data: {
        email: `docente-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-docente-123',
        nombre: 'Docente',
        apellido: `Test${suffix}`,
      },
    });
    createdIds.docentes.push(docente.id);
    return docente;
  }

  async function crearGrupoConClase(docenteId: string, suffix = '') {
    const uniqueId = createId();
    const grupo = await prisma.grupo.create({
      data: {
        codigo: `GP-${uniqueId}`,
        nombre: `Grupo Test ${suffix}`,
        activo: true,
      },
    });
    createdIds.grupos.push(grupo.id);

    const claseGrupo = await prisma.claseGrupo.create({
      data: {
        codigo: `CG-${uniqueId}`,
        nombre: `Clase Grupo ${suffix}`,
        tipo: 'GRUPO_REGULAR',
        dia_semana: 'LUNES',
        hora_inicio: '19:30',
        hora_fin: '21:00',
        fecha_inicio: new Date(),
        fecha_fin: new Date('2026-12-15'),
        anio_lectivo: 2026,
        cupo_maximo: 15,
        grupo_id: grupo.id,
        docente_id: docenteId,
      },
    });
    createdIds.claseGrupos.push(claseGrupo.id);

    return { grupo, claseGrupo };
  }

  async function crearEstudiante(claseGrupoId: string, suffix = '') {
    const uniqueId = createId();

    const tutor = await prisma.tutor.create({
      data: {
        email: `tutor-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-tutor-123',
        nombre: 'Tutor',
        apellido: `Test${suffix}`,
      },
    });
    createdIds.tutores.push(tutor.id);

    const estudiante = await prisma.estudiante.create({
      data: {
        username: `est-${uniqueId}${suffix}`,
        email: `est-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-est-123',
        nombre: 'Estudiante',
        apellido: `Test${suffix}`,
        nivelEscolar: 'Primaria',
        edad: 8,
        tutor_id: tutor.id,
      },
    });
    createdIds.estudiantes.push(estudiante.id);

    await prisma.inscripcionClaseGrupo.create({
      data: {
        clase_grupo_id: claseGrupoId,
        estudiante_id: estudiante.id,
        tutor_id: tutor.id,
      },
    });

    // Crear recursos para XP
    await prisma.recursosEstudiante.create({
      data: {
        estudiante_id: estudiante.id,
        xp_total: 0,
      },
    });

    return { estudiante, tutor };
  }

  async function crearContenido(adminId: string, tipo: string, suffix = '') {
    const uniqueId = createId();
    const contenido = await prisma.contenido.create({
      data: {
        titulo: `Contenido ${tipo} ${suffix}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
        estado: 'PUBLICADO',
        tipo: 'LECCION',
        creadorId: adminId,
        descripcion: `Contenido de ${tipo}`,
      },
    });
    createdIds.contenidos.push(contenido.id);
    return contenido;
  }

  async function crearPlanificacionConClases(
    adminId: string,
    cantidadClases = 2,
    suffix = '',
  ) {
    const uniqueId = createId();

    // Crear contenidos para cada clase
    const clasesData = [];
    for (let i = 1; i <= cantidadClases; i++) {
      const teoria = await crearContenido(adminId, 'teoria', `${suffix}-c${i}`);
      const practica = await crearContenido(
        adminId,
        'practica',
        `${suffix}-c${i}`,
      );
      clasesData.push({
        numero: i,
        titulo: `Clase ${i}${suffix}`,
        descripcion: `Descripción de clase ${i}`,
        teoria_id: teoria.id,
        practica_id: practica.id,
      });
    }

    const planificacion = await prisma.planificacion.create({
      data: {
        titulo: `Planificación Test ${uniqueId}${suffix}`,
        descripcion: 'Planificación para tests',
        cantidad_clases: cantidadClases,
        duracion_clase_dias: 7,
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
        estado: 'PUBLICADO',
        clases: {
          create: clasesData,
        },
      },
      include: {
        clases: {
          orderBy: { numero: 'asc' },
          include: { teoria: true, practica: true },
        },
      },
    });
    createdIds.planificaciones.push(planificacion.id);

    return planificacion;
  }

  async function crearAsignacionConEstados(
    planificacionId: string,
    claseGrupoId: string,
    docenteId: string,
    activarClases: number[] = [],
  ) {
    const asignacion = await prisma.asignacionPlanificacion.create({
      data: {
        planificacion_id: planificacionId,
        clase_grupo_id: claseGrupoId,
        docente_id: docenteId,
        activa: true,
      },
    });

    // Obtener clases de la planificación
    const clases = await prisma.clasePlanificacion.findMany({
      where: { planificacion_id: planificacionId },
      orderBy: { numero: 'asc' },
    });

    // Activar las clases indicadas
    for (const numero of activarClases) {
      const clase = clases.find((c) => c.numero === numero);
      if (clase) {
        await prisma.estadoClaseGrupo.create({
          data: {
            asignacion_id: asignacion.id,
            clase_id: clase.id,
            teoria_activa: true,
            practica_activa: true,
            activada_en: new Date(),
          },
        });
      }
    }

    return asignacion;
  }

  // ============================================================================
  // TESTS: getMiAula
  // ============================================================================
  describe('getMiAula', () => {
    it('should_return_empty_when_estudiante_has_no_inscripciones', async () => {
      // Arrange - Estudiante sin grupo
      const uniqueId = createId();
      const tutor = await prisma.tutor.create({
        data: {
          email: `tutor-solo-${uniqueId}@test.com`,
          password_hash: 'hash',
          nombre: 'Tutor',
          apellido: 'Solo',
        },
      });
      createdIds.tutores.push(tutor.id);

      const estudiante = await prisma.estudiante.create({
        data: {
          username: `est-solo-${uniqueId}`,
          email: `est-solo-${uniqueId}@test.com`,
          password_hash: 'hash',
          nombre: 'Sin',
          apellido: 'Grupo',
          nivelEscolar: 'Primaria',
          edad: 8,
          tutor_id: tutor.id,
        },
      });
      createdIds.estudiantes.push(estudiante.id);

      // Act
      const result = await service.getMiAula(estudiante.id);

      // Assert
      expect(result.sectores).toEqual([]);
      expect(result.resumen.total_planificaciones).toBe(0);
    });

    it('should_return_planificaciones_with_progress', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 3);
      await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1, 2], // Activar clases 1 y 2
      );

      // Act
      const result = await service.getMiAula(estudiante.id);

      // Assert
      expect(result.resumen.total_planificaciones).toBe(1);
      expect(result.resumen.total_clases_activas).toBe(2);
    });

    it('should_calculate_progress_correctly', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1, 2],
      );

      // Completar clase 1
      await prisma.progresoClaseEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          clase_id: planificacion.clases[0].id,
          teoria_completada: true,
          practica_completada: true,
        },
      });

      // Act
      const result = await service.getMiAula(estudiante.id);

      // Assert
      expect(result.resumen.total_clases_completadas).toBe(1);
    });
  });

  // ============================================================================
  // TESTS: getPlanificacionDetalle
  // ============================================================================
  describe('getPlanificacionDetalle', () => {
    it('should_throw_NotFoundException_when_no_access', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo: grupo1 } = await crearGrupoConClase(docente.id, '-1');
      const { claseGrupo: grupo2 } = await crearGrupoConClase(docente.id, '-2');
      const { estudiante } = await crearEstudiante(grupo1.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      // Asignar a grupo2, no a grupo1
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        grupo2.id,
        docente.id,
        [1],
      );

      // Act & Assert
      await expect(
        service.getPlanificacionDetalle(estudiante.id, asignacion.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_return_only_activated_clases', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 3);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1], // Solo activar clase 1
      );

      // Act
      const result = await service.getPlanificacionDetalle(
        estudiante.id,
        asignacion.id,
      );

      // Assert
      expect(result.clases).toHaveLength(1);
      expect(result.clases[0].numero).toBe(1);
    });

    it('should_include_progreso_in_clases', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Crear progreso
      await prisma.progresoClaseEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          clase_id: planificacion.clases[0].id,
          teoria_completada: true,
          practica_completada: false,
        },
      });

      // Act
      const result = await service.getPlanificacionDetalle(
        estudiante.id,
        asignacion.id,
      );

      // Assert
      expect(result.clases[0].teoria?.completada).toBe(true);
      expect(result.clases[0].practica?.completada).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: getContenidoClase
  // ============================================================================
  describe('getContenidoClase', () => {
    it('should_throw_NotFoundException_when_content_not_activated', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [], // Sin activar
      );

      // Act & Assert
      await expect(
        service.getContenidoClase(
          estudiante.id,
          asignacion.id,
          planificacion.clases[0].id,
          'teoria',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_return_content_when_activated', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      const result = await service.getContenidoClase(
        estudiante.id,
        asignacion.id,
        planificacion.clases[0].id,
        'teoria',
      );

      // Assert
      expect(result.contenido).toBeDefined();
      expect(result.tipo).toBe('teoria');
    });

    it('should_create_progreso_if_not_exists', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      await service.getContenidoClase(
        estudiante.id,
        asignacion.id,
        planificacion.clases[0].id,
        'teoria',
      );

      // Assert
      const progreso = await prisma.progresoClaseEstudiante.findUnique({
        where: {
          estudiante_id_clase_id: {
            estudiante_id: estudiante.id,
            clase_id: planificacion.clases[0].id,
          },
        },
      });
      expect(progreso).toBeDefined();
    });
  });

  // ============================================================================
  // TESTS: completarLeccion
  // ============================================================================
  describe('completarLeccion', () => {
    it('should_mark_teoria_as_completed', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      const result = await service.completarLeccion(
        estudiante.id,
        asignacion.id,
        planificacion.clases[0].id,
        'teoria',
        600,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.progreso.teoria_completada).toBe(true);
      expect(result.xp_ganado).toBeGreaterThan(0);
    });

    it('should_mark_practica_as_completed', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      const result = await service.completarLeccion(
        estudiante.id,
        asignacion.id,
        planificacion.clases[0].id,
        'practica',
        800,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.progreso.practica_completada).toBe(true);
    });

    it('should_accumulate_tiempo_when_called_multiple_times', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      await service.completarLeccion(
        estudiante.id,
        asignacion.id,
        planificacion.clases[0].id,
        'teoria',
        300,
      );
      await service.completarLeccion(
        estudiante.id,
        asignacion.id,
        planificacion.clases[0].id,
        'teoria',
        300,
      );

      // Assert
      const progreso = await prisma.progresoClaseEstudiante.findUnique({
        where: {
          estudiante_id_clase_id: {
            estudiante_id: estudiante.id,
            clase_id: planificacion.clases[0].id,
          },
        },
      });
      expect(progreso?.tiempo_teoria_segundos).toBe(600);
    });
  });

  // ============================================================================
  // TESTS: getMisTareas
  // ============================================================================
  describe('getMisTareas', () => {
    it('should_return_empty_when_no_tareas_assigned', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);

      // Act
      const result = await service.getMisTareas(estudiante.id);

      // Assert
      expect(result.tareas).toHaveLength(0);
      expect(result.resumen.total).toBe(0);
    });

    it('should_filter_pendientes', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Crear tarea de clase y asignarla
      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-t1');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });

      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // Una tarea completada
      await prisma.progresoTareaEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          tarea_asignada_id: tareaAsignada.id,
          estado: EstadoTarea.COMPLETADA,
        },
      });

      // Act
      const resultPendientes = await service.getMisTareas(
        estudiante.id,
        'pendientes',
      );

      // Assert
      expect(resultPendientes.tareas).toHaveLength(0);
    });
  });

  // ============================================================================
  // TESTS: getLeaderboard
  // ============================================================================
  describe('getLeaderboard', () => {
    it('should_throw_NotFoundException_when_no_access', async () => {
      // Arrange
      const fakeAsignacionId = createId();
      const fakeEstudianteId = createId();

      // Act & Assert
      await expect(
        service.getLeaderboard(fakeEstudianteId, fakeAsignacionId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_return_leaderboard_with_all_students', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante: est1 } = await crearEstudiante(claseGrupo.id, '-1');
      const { estudiante: est2 } = await crearEstudiante(claseGrupo.id, '-2');
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      const result = await service.getLeaderboard(est1.id, asignacion.id);

      // Assert
      expect(result.total_participantes).toBe(2);
      expect(result.leaderboard).toHaveLength(2);
    });

    it('should_order_by_puntos_planificacion_desc', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante: est1 } = await crearEstudiante(claseGrupo.id, '-1');
      const { estudiante: est2 } = await crearEstudiante(claseGrupo.id, '-2');
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1, 2],
      );

      // est2 completa más clases
      await prisma.progresoClaseEstudiante.create({
        data: {
          estudiante_id: est2.id,
          clase_id: planificacion.clases[0].id,
          teoria_completada: true,
          practica_completada: true,
        },
      });

      // Act
      const result = await service.getLeaderboard(est1.id, asignacion.id);

      // Assert
      expect(result.leaderboard[0].estudiante.id).toBe(est2.id);
      expect(result.leaderboard[0].posicion).toBe(1);
    });

    it('should_mark_es_yo_correctly', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante: est1 } = await crearEstudiante(claseGrupo.id, '-1');
      await crearEstudiante(claseGrupo.id, '-2');
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Act
      const result = await service.getLeaderboard(est1.id, asignacion.id);

      // Assert
      const miEntrada = result.leaderboard.find((e) => e.es_yo);
      expect(miEntrada?.estudiante.id).toBe(est1.id);
    });

    it('should_count_tareas_completadas_in_progress', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante: est1 } = await crearEstudiante(claseGrupo.id, '-1');
      const { estudiante: est2 } = await crearEstudiante(claseGrupo.id, '-2');
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Crear tarea y asignarla
      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-lb');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });
      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // est2 completa la tarea
      await prisma.progresoTareaEstudiante.create({
        data: {
          estudiante_id: est2.id,
          tarea_asignada_id: tareaAsignada.id,
          estado: EstadoTarea.COMPLETADA,
        },
      });

      // Act
      const result = await service.getLeaderboard(est1.id, asignacion.id);

      // Assert - est2 tiene más puntos por completar tarea
      expect(result.leaderboard[0].estudiante.id).toBe(est2.id);
      expect(result.leaderboard[0].progreso.tareas_completadas).toBe(1);
    });
  });

  // ============================================================================
  // TESTS: iniciarTarea
  // ============================================================================
  describe('iniciarTarea', () => {
    it('should_throw_NotFoundException_when_tarea_not_found', async () => {
      // Arrange
      const fakeEstudianteId = createId();
      const fakeTareaId = createId();

      // Act & Assert
      await expect(
        service.iniciarTarea(fakeEstudianteId, fakeTareaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_create_progreso_and_return_contenido', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Crear tarea y asignarla
      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-init');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });
      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // Act
      const result = await service.iniciarTarea(
        estudiante.id,
        tareaAsignada.id,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.progreso.estado).toBe(EstadoTarea.EN_PROGRESO);
      expect(result.contenido).toBeDefined();
    });

    it('should_increment_intentos_on_second_start', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-retry');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: false,
        },
      });
      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // Act - iniciar dos veces
      await service.iniciarTarea(estudiante.id, tareaAsignada.id);
      const result = await service.iniciarTarea(
        estudiante.id,
        tareaAsignada.id,
      );

      // Assert
      expect(result.progreso.intentos).toBe(2);
    });
  });

  // ============================================================================
  // TESTS: completarTarea
  // ============================================================================
  describe('completarTarea', () => {
    it('should_throw_NotFoundException_when_tarea_not_accessible', async () => {
      // Arrange
      const fakeEstudianteId = createId();
      const fakeTareaId = createId();

      // Act & Assert
      await expect(
        service.completarTarea(fakeEstudianteId, fakeTareaId, 300),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_complete_tarea_and_calculate_xp', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-comp');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });
      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // Act
      const result = await service.completarTarea(
        estudiante.id,
        tareaAsignada.id,
        300,
        85,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.progreso.estado).toBe(EstadoTarea.COMPLETADA);
      expect(result.xp_ganado).toBeGreaterThan(0);
      expect(result.desglose_xp?.base).toBe(100); // obligatoria
    });

    it('should_return_already_completed_when_tarea_done', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-done');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: false,
        },
      });
      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // Completar primero
      await service.completarTarea(estudiante.id, tareaAsignada.id, 300);

      // Act - intentar completar de nuevo
      const result = await service.completarTarea(
        estudiante.id,
        tareaAsignada.id,
        200,
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.mensaje).toContain('ya fue completada');
      expect(result.xp_ganado).toBe(0);
    });

    it('should_give_bonus_for_optional_tarea', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      const contenidoTarea = await crearContenido(admin.id, 'tarea', '-opt');
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: false, // Opcional
        },
      });
      const tareaAsignada = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
          activa: true,
        },
      });

      // Act
      const result = await service.completarTarea(
        estudiante.id,
        tareaAsignada.id,
        300,
      );

      // Assert
      expect(result.desglose_xp?.base).toBe(75); // No obligatoria = 75 XP base
    });
  });

  // ============================================================================
  // TESTS: getMisTareas filtro completadas
  // ============================================================================
  describe('getMisTareas - filtro completadas', () => {
    it('should_filter_completadas', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const { claseGrupo } = await crearGrupoConClase(docente.id);
      const { estudiante } = await crearEstudiante(claseGrupo.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacionConEstados(
        planificacion.id,
        claseGrupo.id,
        docente.id,
        [1],
      );

      // Crear dos tareas
      const contenido1 = await crearContenido(admin.id, 'tarea', '-fc1');
      const contenido2 = await crearContenido(admin.id, 'tarea', '-fc2');

      const tareaClase1 = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenido1.id,
          orden: 1,
          obligatoria: true,
        },
      });
      const tareaClase2 = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenido2.id,
          orden: 2,
          obligatoria: false,
        },
      });

      const ta1 = await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase1.id,
          activa: true,
        },
      });
      await prisma.tareaAsignada.create({
        data: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase2.id,
          activa: true,
        },
      });

      // Completar solo la primera tarea
      await prisma.progresoTareaEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          tarea_asignada_id: ta1.id,
          estado: EstadoTarea.COMPLETADA,
        },
      });

      // Act
      const result = await service.getMisTareas(estudiante.id, 'completadas');

      // Assert
      expect(result.tareas).toHaveLength(1);
      expect(result.resumen.completadas).toBe(1);
      expect(result.resumen.pendientes).toBe(1);
    });
  });
});
