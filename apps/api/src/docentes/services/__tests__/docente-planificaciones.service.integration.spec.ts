/**
 * Tests de Integración: DocentePlanificacionesService
 *
 * Métodos testeados:
 * - getMisAsignaciones() - Obtener asignaciones del docente
 * - activarTeoria() / desactivarTeoria() - Toggle teoría
 * - activarPractica() / desactivarPractica() - Toggle práctica
 * - activarClase() / desactivarClase() - Toggle completo
 * - getProgresoEstudiantes() - Progreso de estudiantes
 * - getTareasClase() - Tareas disponibles
 * - asignarTarea() / desasignarTarea() - Asignar/desasignar tareas
 * - actualizarFechaLimiteTarea() - Fecha límite
 * - getProgresoTareas() - Progreso tareas
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocentePlanificacionesService } from '../docente-planificaciones.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppModule } from '../../../app.module';
import { createId } from '@paralleldrive/cuid2';

describe('[INTEGRATION] DocentePlanificacionesService', () => {
  let service: DocentePlanificacionesService;
  let prisma: PrismaService;

  // IDs para cleanup
  const createdIds = {
    admins: [] as string[],
    docentes: [] as string[],
    grupos: [] as string[],
    claseGrupos: [] as string[],
    planificaciones: [] as string[],
    asignaciones: [] as string[],
    estudiantes: [] as string[],
    tutores: [] as string[],
    contenidos: [] as string[],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<DocentePlanificacionesService>(
      DocentePlanificacionesService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Cleanup en orden inverso de dependencias

    // 1. Eliminar progresos de estudiantes (dependen de clases y tareas)
    if (createdIds.estudiantes.length > 0) {
      await prisma.progresoTareaEstudiante.deleteMany({
        where: { estudiante_id: { in: createdIds.estudiantes } },
      });
      await prisma.progresoClaseEstudiante.deleteMany({
        where: { estudiante_id: { in: createdIds.estudiantes } },
      });
    }

    // 2. Eliminar tareas asignadas (dependen de asignaciones)
    if (createdIds.asignaciones.length > 0) {
      await prisma.tareaAsignada.deleteMany({
        where: { asignacion_id: { in: createdIds.asignaciones } },
      });
      await prisma.asignacionPlanificacion.deleteMany({
        where: { id: { in: createdIds.asignaciones } },
      });
      createdIds.asignaciones = [];
    }

    // 3. Eliminar planificaciones (cascade elimina clases)
    if (createdIds.planificaciones.length > 0) {
      await prisma.planificacion.deleteMany({
        where: { id: { in: createdIds.planificaciones } },
      });
      createdIds.planificaciones = [];
    }

    // 4. Eliminar estudiantes
    if (createdIds.estudiantes.length > 0) {
      await prisma.inscripcionClaseGrupo.deleteMany({
        where: { estudiante_id: { in: createdIds.estudiantes } },
      });
      await prisma.estudiante.deleteMany({
        where: { id: { in: createdIds.estudiantes } },
      });
      createdIds.estudiantes = [];
    }

    if (createdIds.tutores.length > 0) {
      await prisma.tutor.deleteMany({
        where: { id: { in: createdIds.tutores } },
      });
      createdIds.tutores = [];
    }

    if (createdIds.claseGrupos.length > 0) {
      await prisma.claseGrupo.deleteMany({
        where: { id: { in: createdIds.claseGrupos } },
      });
      createdIds.claseGrupos = [];
    }

    if (createdIds.grupos.length > 0) {
      await prisma.grupoPedagogico.deleteMany({
        where: { id: { in: createdIds.grupos } },
      });
      createdIds.grupos = [];
    }

    if (createdIds.docentes.length > 0) {
      await prisma.docente.deleteMany({
        where: { id: { in: createdIds.docentes } },
      });
      createdIds.docentes = [];
    }

    if (createdIds.contenidos.length > 0) {
      await prisma.contenido.deleteMany({
        where: { id: { in: createdIds.contenidos } },
      });
      createdIds.contenidos = [];
    }

    if (createdIds.admins.length > 0) {
      await prisma.contenido.deleteMany({
        where: { creadorId: { in: createdIds.admins } },
      });
      await prisma.admin.deleteMany({
        where: { id: { in: createdIds.admins } },
      });
      createdIds.admins = [];
    }
  });

  // ============================================================================
  // HELPERS
  // ============================================================================
  async function crearAdmin(suffix = '') {
    const uniqueId = createId();
    const admin = await prisma.admin.create({
      data: {
        email: `admin-doc-${uniqueId}${suffix}@test.com`,
        password_hash: 'hashed_password',
        nombre: `Admin ${uniqueId}`,
        apellido: 'Test',
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
        password_hash: 'hashed_password',
        nombre: `Docente ${uniqueId}`,
        apellido: 'Test',
      },
    });
    createdIds.docentes.push(docente.id);
    return docente;
  }

  async function crearClaseGrupo(docenteId: string, suffix = '') {
    const uniqueId = createId();

    // Primero crear el Grupo
    const grupo = await prisma.grupoPedagogico.create({
      data: {
        codigo: `GP-${uniqueId}`,
        nombre: `Grupo Padre ${uniqueId}${suffix}`,
        activo: true,
      },
    });
    createdIds.grupos.push(grupo.id);

    const claseGrupo = await prisma.claseGrupo.create({
      data: {
        nombre: `Grupo Test ${uniqueId}${suffix}`,
        codigo: `GT-${uniqueId}`,
        docente_id: docenteId,
        grupo_id: grupo.id,
        dia_semana: 'LUNES',
        hora_inicio: '15:00',
        hora_fin: '16:30',
        fecha_inicio: new Date('2026-01-01'),
        fecha_fin: new Date('2026-12-15'),
        anio_lectivo: 2026,
        cupo_maximo: 30,
      },
    });
    createdIds.claseGrupos.push(claseGrupo.id);
    return claseGrupo;
  }

  async function crearPlanificacionConClases(adminId: string, numClases = 2) {
    const uniqueId = createId();

    // Crear contenidos para teoría y práctica de cada clase
    const clasesData = [];
    for (let i = 1; i <= numClases; i++) {
      const teoria = await prisma.contenido.create({
        data: {
          titulo: `Teoría Clase ${i} ${uniqueId}`,
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
          estado: 'PUBLICADO',
          tipo: 'LECCION',
          creadorId: adminId,
        },
      });

      const practica = await prisma.contenido.create({
        data: {
          titulo: `Práctica Clase ${i} ${uniqueId}`,
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
          estado: 'PUBLICADO',
          tipo: 'TAREA',
          creadorId: adminId,
        },
      });

      clasesData.push({
        numero: i,
        titulo: `Clase ${i}`,
        teoria_id: teoria.id,
        practica_id: practica.id,
      });
    }

    const planificacion = await prisma.planificacion.create({
      data: {
        titulo: `Planificación Test ${uniqueId}`,
        cantidad_clases: numClases,
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
        },
      },
    });

    createdIds.planificaciones.push(planificacion.id);
    return planificacion;
  }

  async function crearAsignacion(
    planificacionId: string,
    claseGrupoId: string,
    docenteId: string,
  ) {
    const asignacion = await prisma.asignacionPlanificacion.create({
      data: {
        planificacion_id: planificacionId,
        clase_grupo_id: claseGrupoId,
        docente_id: docenteId,
      },
    });
    createdIds.asignaciones.push(asignacion.id);
    return asignacion;
  }

  async function crearTutor(suffix = '') {
    const uniqueId = createId();
    const tutor = await prisma.tutor.create({
      data: {
        email: `tutor-doc-${uniqueId}${suffix}@test.com`,
        password_hash: 'hashed_password',
        nombre: `Tutor ${uniqueId}`,
        apellido: 'Test',
      },
    });
    createdIds.tutores.push(tutor.id);
    return tutor;
  }

  async function crearEstudiante(
    claseGrupoId: string,
    tutorId: string,
    suffix = '',
  ) {
    const uniqueId = createId();
    const estudiante = await prisma.estudiante.create({
      data: {
        username: `est-doc-${uniqueId}${suffix}`,
        password_hash: 'hashed_password',
        nombre: `Estudiante ${uniqueId}`,
        apellido: 'Test',
        nivelEscolar: 'Primaria',
        edad: 10,
        tutor_id: tutorId,
      },
    });
    createdIds.estudiantes.push(estudiante.id);

    // Crear inscripción al claseGrupo
    await prisma.inscripcionClaseGrupo.create({
      data: {
        clase_grupo_id: claseGrupoId,
        estudiante_id: estudiante.id,
        tutor_id: tutorId,
      },
    });

    return estudiante;
  }

  async function crearContenidoTarea(adminId: string, suffix = '') {
    const uniqueId = createId();
    const contenido = await prisma.contenido.create({
      data: {
        titulo: `Tarea ${uniqueId}${suffix}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
        estado: 'PUBLICADO',
        tipo: 'TAREA',
        creadorId: adminId,
      },
    });
    createdIds.contenidos.push(contenido.id);
    return contenido;
  }

  // ============================================================================
  // TESTS: getMisAsignaciones
  // ============================================================================
  describe('getMisAsignaciones', () => {
    it('should_return_empty_when_no_asignaciones', async () => {
      // Arrange
      const docente = await crearDocente();

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result).toEqual([]);
    });

    it('should_return_asignaciones_with_clases', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 3);
      await crearAsignacion(planificacion.id, claseGrupo.id, docente.id);

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].planificacion.titulo).toContain('Planificación Test');
      expect(result[0].clases).toHaveLength(3);
      expect(result[0].claseGrupo.nombre).toContain('Grupo Test');
    });

    it('should_return_multiple_asignaciones', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo1 = await crearClaseGrupo(docente.id, '-1');
      const claseGrupo2 = await crearClaseGrupo(docente.id, '-2');
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      await crearAsignacion(planificacion.id, claseGrupo1.id, docente.id);
      await crearAsignacion(planificacion.id, claseGrupo2.id, docente.id);

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  // ============================================================================
  // TESTS: activarTeoria / desactivarTeoria
  // ============================================================================
  describe('activarTeoria / desactivarTeoria', () => {
    it('should_activate_teoria_for_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act
      await service.activarTeoria(asignacion.id, claseId, docente.id);

      // Assert
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado?.teoria_activa).toBe(true);
    });

    it('should_deactivate_teoria_for_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Activar primero
      await service.activarTeoria(asignacion.id, claseId, docente.id);

      // Act
      await service.desactivarTeoria(asignacion.id, claseId, docente.id);

      // Assert
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado?.teoria_activa).toBe(false);
    });

    it('should_throw_NotFoundException_when_asignacion_not_found', async () => {
      // Arrange
      const fakeAsignacionId = createId();
      const fakeClaseId = createId();
      const fakeDocenteId = createId();

      // Act & Assert
      await expect(
        service.activarTeoria(fakeAsignacionId, fakeClaseId, fakeDocenteId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_ForbiddenException_when_not_owner', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente1 = await crearDocente('-1');
      const docente2 = await crearDocente('-2');
      const claseGrupo = await crearClaseGrupo(docente1.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente1.id,
      );

      // Act & Assert - docente2 intenta activar la asignación de docente1
      await expect(
        service.activarTeoria(
          asignacion.id,
          planificacion.clases[0].id,
          docente2.id,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should_throw_NotFoundException_when_clase_not_in_planificacion', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const fakeClaseId = createId();

      // Act & Assert
      await expect(
        service.activarTeoria(asignacion.id, fakeClaseId, docente.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: activarPractica / desactivarPractica
  // ============================================================================
  describe('activarPractica / desactivarPractica', () => {
    it('should_activate_practica_for_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act
      await service.activarPractica(asignacion.id, claseId, docente.id);

      // Assert
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado?.practica_activa).toBe(true);
    });

    it('should_deactivate_practica_for_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Activar primero
      await service.activarPractica(asignacion.id, claseId, docente.id);

      // Act
      await service.desactivarPractica(asignacion.id, claseId, docente.id);

      // Assert
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado?.practica_activa).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: activarClase / desactivarClase
  // ============================================================================
  describe('activarClase / desactivarClase', () => {
    it('should_activate_both_teoria_and_practica', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act
      await service.activarClase(asignacion.id, claseId, docente.id);

      // Assert
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado?.teoria_activa).toBe(true);
      expect(estado?.practica_activa).toBe(true);
    });

    it('should_deactivate_both_teoria_and_practica', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Activar primero
      await service.activarClase(asignacion.id, claseId, docente.id);

      // Act
      await service.desactivarClase(asignacion.id, claseId, docente.id);

      // Assert
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });
      expect(estado?.teoria_activa).toBe(false);
      expect(estado?.practica_activa).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: getProgresoEstudiantes
  // ============================================================================
  describe('getProgresoEstudiantes', () => {
    it('should_return_empty_progresos_when_no_students', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Act
      const result = await service.getProgresoEstudiantes(
        asignacion.id,
        docente.id,
      );

      // Assert
      expect(result.progresos).toEqual([]);
    });

    it('should_return_progreso_for_students', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const tutor = await crearTutor();
      const estudiante = await crearEstudiante(claseGrupo.id, tutor.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Crear progreso
      await prisma.progresoClaseEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          clase_id: planificacion.clases[0].id,
          teoria_completada: true,
          practica_completada: false,
          tiempo_teoria_segundos: 600,
          tiempo_practica_segundos: 0,
        },
      });

      // Act
      const result = await service.getProgresoEstudiantes(
        asignacion.id,
        docente.id,
      );

      // Assert
      expect(result.progresos).toHaveLength(1);
      expect(result.progresos[0].teoria_completada).toBe(true);
      expect(result.progresos[0].practica_completada).toBe(false);
    });

    it('should_throw_NotFoundException_when_asignacion_not_exists', async () => {
      // Arrange
      const docente = await crearDocente();
      const fakeAsignacionId = createId();

      // Act & Assert
      await expect(
        service.getProgresoEstudiantes(fakeAsignacionId, docente.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: getTareasClase
  // ============================================================================
  describe('getTareasClase', () => {
    it('should_return_empty_tareas_when_none', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Act
      const result = await service.getTareasClase(
        asignacion.id,
        planificacion.clases[0].id,
        docente.id,
      );

      // Assert
      expect(result.tareas).toEqual([]);
    });

    it('should_return_tareas_with_assignment_status', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Crear tarea en la clase
      const contenidoTarea = await crearContenidoTarea(admin.id);
      await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });

      // Act
      const result = await service.getTareasClase(
        asignacion.id,
        planificacion.clases[0].id,
        docente.id,
      );

      // Assert
      expect(result.tareas).toHaveLength(1);
      expect(result.tareas[0].asignada).toBe(false);
      expect(result.tareas[0].obligatoria).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: asignarTarea / desasignarTarea
  // ============================================================================
  describe('asignarTarea / desasignarTarea', () => {
    it('should_assign_tarea_to_group', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Crear tarea en la clase
      const contenidoTarea = await crearContenidoTarea(admin.id);
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });

      // Act
      const result = await service.asignarTarea(
        asignacion.id,
        tareaClase.id,
        docente.id,
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.tarea_asignada_id).toBeDefined();
    });

    it('should_assign_tarea_with_fecha_limite', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      const contenidoTarea = await crearContenidoTarea(admin.id);
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: false,
        },
      });

      const fechaLimite = new Date('2026-12-31');

      // Act
      await service.asignarTarea(
        asignacion.id,
        tareaClase.id,
        docente.id,
        fechaLimite,
      );

      // Assert
      const tareaAsignada = await prisma.tareaAsignada.findFirst({
        where: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
        },
      });
      expect(tareaAsignada?.fecha_limite).toEqual(fechaLimite);
    });

    it('should_unassign_tarea', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      const contenidoTarea = await crearContenidoTarea(admin.id);
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });

      // Asignar primero
      await service.asignarTarea(asignacion.id, tareaClase.id, docente.id);

      // Act
      const result = await service.desasignarTarea(
        asignacion.id,
        tareaClase.id,
        docente.id,
      );

      // Assert
      expect(result.success).toBe(true);

      const tareaAsignada = await prisma.tareaAsignada.findFirst({
        where: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
        },
      });
      expect(tareaAsignada?.activa).toBe(false);
    });

    it('should_throw_NotFoundException_when_tarea_not_found', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const fakeTareaId = createId();

      // Act & Assert
      await expect(
        service.asignarTarea(asignacion.id, fakeTareaId, docente.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: actualizarFechaLimiteTarea
  // ============================================================================
  describe('actualizarFechaLimiteTarea', () => {
    it('should_update_fecha_limite', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      const contenidoTarea = await crearContenidoTarea(admin.id);
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });

      // Asignar primero
      await service.asignarTarea(asignacion.id, tareaClase.id, docente.id);

      const nuevaFecha = new Date('2027-01-15');

      // Act
      const result = await service.actualizarFechaLimiteTarea(
        asignacion.id,
        tareaClase.id,
        docente.id,
        nuevaFecha,
      );

      // Assert
      expect(result.success).toBe(true);

      const tareaAsignada = await prisma.tareaAsignada.findFirst({
        where: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
        },
      });
      expect(tareaAsignada?.fecha_limite).toEqual(nuevaFecha);
    });

    it('should_remove_fecha_limite_when_null', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      const contenidoTarea = await crearContenidoTarea(admin.id);
      const tareaClase = await prisma.tareaClase.create({
        data: {
          clase_id: planificacion.clases[0].id,
          contenido_id: contenidoTarea.id,
          orden: 1,
          obligatoria: true,
        },
      });

      // Asignar con fecha límite
      await service.asignarTarea(
        asignacion.id,
        tareaClase.id,
        docente.id,
        new Date('2026-12-31'),
      );

      // Act - Quitar fecha límite
      await service.actualizarFechaLimiteTarea(
        asignacion.id,
        tareaClase.id,
        docente.id,
        null,
      );

      // Assert
      const tareaAsignada = await prisma.tareaAsignada.findFirst({
        where: {
          asignacion_id: asignacion.id,
          tarea_clase_id: tareaClase.id,
        },
      });
      expect(tareaAsignada?.fecha_limite).toBeNull();
    });
  });

  // ============================================================================
  // TESTS: getProgresoTareas
  // ============================================================================
  describe('getProgresoTareas', () => {
    it('should_return_empty_when_no_progresos', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Act
      const result = await service.getProgresoTareas(asignacion.id, docente.id);

      // Assert
      expect(result.progresos).toEqual([]);
    });

    it('should_return_progreso_tareas_for_estudiantes', async () => {
      // Arrange
      const admin = await crearAdmin();
      const docente = await crearDocente();
      const claseGrupo = await crearClaseGrupo(docente.id);
      const tutor = await crearTutor();
      const estudiante = await crearEstudiante(claseGrupo.id, tutor.id);
      const planificacion = await crearPlanificacionConClases(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Crear tarea y asignarla
      const contenidoTarea = await crearContenidoTarea(admin.id);
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

      // Crear progreso del estudiante
      await prisma.progresoTareaEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          tarea_asignada_id: tareaAsignada.id,
          estado: 'COMPLETADA',
          completada_en: new Date(),
          calificacion: 85,
        },
      });

      // Act
      const result = await service.getProgresoTareas(asignacion.id, docente.id);

      // Assert
      expect(result.progresos).toHaveLength(1);
      expect(result.progresos[0].completada).toBe(true);
      expect(result.progresos[0].calificacion).toBe(85);
    });

    it('should_throw_NotFoundException_when_asignacion_not_exists', async () => {
      // Arrange
      const docente = await crearDocente();
      const fakeAsignacionId = createId();

      // Act & Assert
      await expect(
        service.getProgresoTareas(fakeAsignacionId, docente.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
