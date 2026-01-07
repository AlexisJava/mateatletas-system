/**
 * ============================================================================
 * INTEGRATION TESTS - DocentePlanificacionesService
 * ============================================================================
 *
 * FASE 1.5: Tests de integración del sistema de planificaciones para docentes
 *
 * Estos tests corren contra una base de datos REAL (PostgreSQL de test).
 * NO HAY MOCKS - todas las operaciones son reales.
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- --testPathPattern="docente-planificaciones"
 *
 * Modelo de datos testeado:
 *   Planificacion → ClasePlanificacion[] (cada clase tiene teoria_id y practica_id)
 *   AsignacionPlanificacion → EstadoClaseGrupo[] (qué está activo por grupo)
 *   ProgresoClaseEstudiante (progreso individual por clase)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppModule } from '../../../app.module';
import { DocentePlanificacionesService } from '../docente-planificaciones.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

describe('[INTEGRATION] DocentePlanificacionesService', () => {
  let service: DocentePlanificacionesService;
  let prisma: PrismaService;

  // ============================================================================
  // IDs de entidades creadas en tests (para cleanup)
  // ============================================================================
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
  // Setup: Levantar aplicación con DB real
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = moduleFixture.get<DocentePlanificacionesService>(
      DocentePlanificacionesService,
    );
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  }, 60000);

  // ============================================================================
  // Cleanup: Limpiar datos de test después de cada test
  // ============================================================================
  afterEach(async () => {
    // Limpiar en orden correcto (hijos primero)
    // 1. Progresos
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

    // 2. Tareas asignadas y estados
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

    // 3. Asignaciones
    await prisma.asignacionPlanificacion.deleteMany({
      where: { planificacion_id: { in: createdIds.planificaciones } },
    });

    // 4. Tareas de clase y clases
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

    // 5. Planificaciones
    await prisma.planificacion.deleteMany({
      where: { id: { in: createdIds.planificaciones } },
    });

    // 6. Inscripciones y ClaseGrupos
    await prisma.inscripcionClaseGrupo.deleteMany({
      where: { clase_grupo_id: { in: createdIds.claseGrupos } },
    });
    await prisma.claseGrupo.deleteMany({
      where: { id: { in: createdIds.claseGrupos } },
    });

    // 7. Grupos pedagógicos
    await prisma.grupo.deleteMany({
      where: { id: { in: createdIds.grupos } },
    });

    // 8. Estudiantes
    await prisma.estudiante.deleteMany({
      where: { id: { in: createdIds.estudiantes } },
    });

    // 9. Tutores
    await prisma.tutor.deleteMany({
      where: { id: { in: createdIds.tutores } },
    });

    // 10. Docentes
    await prisma.docente.deleteMany({
      where: { id: { in: createdIds.docentes } },
    });

    // 11. Contenidos
    await prisma.contenido.deleteMany({
      where: { id: { in: createdIds.contenidos } },
    });

    // 12. Admins
    await prisma.admin.deleteMany({
      where: { id: { in: createdIds.admins } },
    });

    // Reset arrays
    Object.keys(createdIds).forEach((key) => {
      createdIds[key as keyof typeof createdIds] = [];
    });
  });

  // ============================================================================
  // HELPERS: Crear datos de prueba
  // ============================================================================

  /**
   * Crea un docente con un ClaseGrupo asignado
   */
  async function crearDocenteConGrupo(suffix: string = '') {
    const uniqueId = createId();

    // 1. Crear docente
    const docente = await prisma.docente.create({
      data: {
        email: `docente-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-test-123',
        nombre: 'Docente',
        apellido: `Test${suffix}`,
      },
    });
    createdIds.docentes.push(docente.id);

    // 2. Crear grupo pedagógico
    const grupo = await prisma.grupo.create({
      data: {
        codigo: `GP-${uniqueId}`,
        nombre: `Grupo Pedagógico ${uniqueId}`,
        activo: true,
      },
    });
    createdIds.grupos.push(grupo.id);

    // 3. Crear ClaseGrupo
    const claseGrupo = await prisma.claseGrupo.create({
      data: {
        codigo: `CG-${uniqueId}`,
        nombre: `Clase Grupo ${uniqueId}${suffix}`,
        tipo: 'GRUPO_REGULAR',
        dia_semana: 'LUNES',
        hora_inicio: '19:30',
        hora_fin: '21:00',
        fecha_inicio: new Date(),
        fecha_fin: new Date('2026-12-15'),
        anio_lectivo: 2026,
        cupo_maximo: 15,
        grupo_id: grupo.id,
        docente_id: docente.id,
      },
    });
    createdIds.claseGrupos.push(claseGrupo.id);

    return { docente, grupo, claseGrupo };
  }

  /**
   * Crea un admin para contenidos
   */
  async function crearAdmin(suffix: string = '') {
    const uniqueId = createId();
    const admin = await prisma.admin.create({
      data: {
        email: `admin-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-admin-123',
        nombre: 'Admin',
        apellido: `Test${suffix}`,
        roles: JSON.stringify(['admin', 'super_admin']),
      },
    });
    createdIds.admins.push(admin.id);
    return admin;
  }

  /**
   * Crea un contenido (teoría o práctica)
   */
  async function crearContenido(
    adminId: string,
    tipo: string,
    suffix: string = '',
  ) {
    const uniqueId = createId();
    const contenido = await prisma.contenido.create({
      data: {
        titulo: `Contenido ${tipo} ${suffix}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
        estado: 'PUBLICADO',
        tipo: 'LECCION',
        creadorId: adminId,
        descripcion: `Contenido de ${tipo} para tests`,
      },
    });
    createdIds.contenidos.push(contenido.id);
    return contenido;
  }

  /**
   * Crea una planificación completa con clases, teoría y práctica
   */
  async function crearPlanificacionCompleta(
    adminId: string,
    cantidadClases: number = 4,
    suffix: string = '',
  ) {
    const uniqueId = createId();

    // Crear contenidos para cada clase (teoría + práctica)
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

    // Crear planificación con clases
    const planificacion = await prisma.planificacion.create({
      data: {
        titulo: `Planificación Test ${uniqueId}${suffix}`,
        descripcion: 'Planificación para tests de integración',
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
        },
      },
    });
    createdIds.planificaciones.push(planificacion.id);

    return planificacion;
  }

  /**
   * Crea una asignación de planificación a un grupo
   */
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
        activa: true,
      },
    });
    return asignacion;
  }

  /**
   * Crea un estudiante inscrito en un grupo
   */
  async function crearEstudiante(claseGrupoId: string, suffix: string = '') {
    const uniqueId = createId();

    // 1. Crear tutor
    const tutor = await prisma.tutor.create({
      data: {
        email: `tutor-${uniqueId}${suffix}@test.com`,
        password_hash: 'hash-tutor-123',
        nombre: 'Tutor',
        apellido: `Test${suffix}`,
      },
    });
    createdIds.tutores.push(tutor.id);

    // 2. Crear estudiante
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

    // 3. Inscribir en el grupo
    await prisma.inscripcionClaseGrupo.create({
      data: {
        clase_grupo_id: claseGrupoId,
        estudiante_id: estudiante.id,
        tutor_id: tutor.id,
      },
    });

    return { estudiante, tutor };
  }

  // ============================================================================
  // TESTS: getMisAsignaciones
  // ============================================================================
  describe('getMisAsignaciones', () => {
    it('should return empty array when docente has no asignaciones', async () => {
      // Arrange
      const { docente } = await crearDocenteConGrupo();

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return asignaciones with planificacion, clases and estados', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 3);
      await crearAsignacion(planificacion.id, claseGrupo.id, docente.id);

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        planificacion: {
          id: planificacion.id,
          titulo: planificacion.titulo,
          cantidad_clases: 3,
        },
        claseGrupo: {
          id: claseGrupo.id,
          nombre: claseGrupo.nombre,
        },
      });
      expect(result[0].clases).toHaveLength(3);
      expect(result[0].clases[0]).toHaveProperty('id');
      expect(result[0].clases[0]).toHaveProperty('numero', 1);
      expect(result[0].clases[0]).toHaveProperty('titulo');
    });

    it('should return multiple asignaciones for docente with many groups', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo: grupo1 } = await crearDocenteConGrupo('-1');

      // Crear segundo grupo para el mismo docente
      const uniqueId = createId();
      const grupo2Data = await prisma.grupo.create({
        data: {
          codigo: `GP2-${uniqueId}`,
          nombre: `Grupo Pedagógico 2 ${uniqueId}`,
          activo: true,
        },
      });
      createdIds.grupos.push(grupo2Data.id);

      const grupo2 = await prisma.claseGrupo.create({
        data: {
          codigo: `CG2-${uniqueId}`,
          nombre: `Clase Grupo 2 ${uniqueId}`,
          tipo: 'GRUPO_REGULAR',
          dia_semana: 'MIERCOLES',
          hora_inicio: '17:00',
          hora_fin: '18:30',
          fecha_inicio: new Date(),
          fecha_fin: new Date('2026-12-15'),
          anio_lectivo: 2026,
          cupo_maximo: 15,
          grupo_id: grupo2Data.id,
          docente_id: docente.id,
        },
      });
      createdIds.claseGrupos.push(grupo2.id);

      const plan1 = await crearPlanificacionCompleta(admin.id, 2, '-p1');
      const plan2 = await crearPlanificacionCompleta(admin.id, 4, '-p2');

      await crearAsignacion(plan1.id, grupo1.id, docente.id);
      await crearAsignacion(plan2.id, grupo2.id, docente.id);

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result).toHaveLength(2);
    });

    it('should not return asignaciones from other docentes', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente: docente1, claseGrupo: grupo1 } =
        await crearDocenteConGrupo('-d1');
      const { docente: docente2, claseGrupo: grupo2 } =
        await crearDocenteConGrupo('-d2');

      const plan1 = await crearPlanificacionCompleta(admin.id, 2, '-p1');
      const plan2 = await crearPlanificacionCompleta(admin.id, 3, '-p2');

      await crearAsignacion(plan1.id, grupo1.id, docente1.id);
      await crearAsignacion(plan2.id, grupo2.id, docente2.id);

      // Act
      const result1 = await service.getMisAsignaciones(docente1.id);
      const result2 = await service.getMisAsignaciones(docente2.id);

      // Assert
      expect(result1).toHaveLength(1);
      expect(result1[0].planificacion.id).toBe(plan1.id);
      expect(result2).toHaveLength(1);
      expect(result2[0].planificacion.id).toBe(plan2.id);
    });
  });

  // ============================================================================
  // TESTS: activarTeoria / activarPractica
  // ============================================================================
  describe('activarTeoria', () => {
    it('should create EstadoClaseGrupo with teoria_activa=true for first activation', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
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

      expect(estado).toBeDefined();
      expect(estado!.teoria_activa).toBe(true);
      expect(estado!.practica_activa).toBe(false);
      expect(estado!.activada_en).toBeDefined();
    });

    it('should update existing EstadoClaseGrupo when already exists', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Pre-create estado with practica_activa=true
      await prisma.estadoClaseGrupo.create({
        data: {
          asignacion_id: asignacion.id,
          clase_id: claseId,
          teoria_activa: false,
          practica_activa: true,
        },
      });

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

      expect(estado!.teoria_activa).toBe(true);
      expect(estado!.practica_activa).toBe(true); // Should preserve practica_activa
    });

    it('should throw NotFoundException for non-existent asignacion', async () => {
      // Arrange
      const { docente } = await crearDocenteConGrupo();
      const fakeAsignacionId = createId();
      const fakeClaseId = createId();

      // Act & Assert
      await expect(
        service.activarTeoria(fakeAsignacionId, fakeClaseId, docente.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when docente is not owner', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente: docente1, claseGrupo } =
        await crearDocenteConGrupo('-d1');
      const { docente: docente2 } = await crearDocenteConGrupo('-d2');
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente1.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act & Assert
      await expect(
        service.activarTeoria(asignacion.id, claseId, docente2.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when clase does not belong to planificacion', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const plan1 = await crearPlanificacionCompleta(admin.id, 2, '-p1');
      const plan2 = await crearPlanificacionCompleta(admin.id, 2, '-p2');
      const asignacion = await crearAsignacion(
        plan1.id,
        claseGrupo.id,
        docente.id,
      );
      const claseDeOtraPlanificacion = plan2.clases[0].id;

      // Act & Assert
      await expect(
        service.activarTeoria(
          asignacion.id,
          claseDeOtraPlanificacion,
          docente.id,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('activarPractica', () => {
    it('should create EstadoClaseGrupo with practica_activa=true for first activation', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
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

      expect(estado).toBeDefined();
      expect(estado!.teoria_activa).toBe(false);
      expect(estado!.practica_activa).toBe(true);
    });

    it('should throw ForbiddenException when docente is not owner', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente: docente1, claseGrupo } =
        await crearDocenteConGrupo('-d1');
      const { docente: docente2 } = await crearDocenteConGrupo('-d2');
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente1.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act & Assert
      await expect(
        service.activarPractica(asignacion.id, claseId, docente2.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // TESTS: desactivarTeoria / desactivarPractica
  // ============================================================================
  describe('desactivarTeoria', () => {
    it('should set teoria_activa=false on existing estado', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Pre-activate
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

      expect(estado!.teoria_activa).toBe(false);
    });

    it('should create estado with teoria_activa=false if not exists', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act - desactivar sin haber activado nunca
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

      expect(estado).toBeDefined();
      expect(estado!.teoria_activa).toBe(false);
      expect(estado!.practica_activa).toBe(false);
    });
  });

  describe('desactivarPractica', () => {
    it('should set practica_activa=false on existing estado', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Pre-activate both
      await service.activarClase(asignacion.id, claseId, docente.id);

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

      expect(estado!.teoria_activa).toBe(true); // Preserved
      expect(estado!.practica_activa).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: activarClase / desactivarClase
  // ============================================================================
  describe('activarClase', () => {
    it('should set both teoria_activa and practica_activa to true', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
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

      expect(estado!.teoria_activa).toBe(true);
      expect(estado!.practica_activa).toBe(true);
      expect(estado!.activada_en).toBeDefined();
    });
  });

  describe('desactivarClase', () => {
    it('should set both teoria_activa and practica_activa to false', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Pre-activate
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

      expect(estado!.teoria_activa).toBe(false);
      expect(estado!.practica_activa).toBe(false);
    });
  });

  // ============================================================================
  // TESTS: getProgresoEstudiantes
  // ============================================================================
  describe('getProgresoEstudiantes', () => {
    it('should return empty progresos when no students have progress', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Create a student but no progress
      await crearEstudiante(claseGrupo.id);

      // Act
      const result = await service.getProgresoEstudiantes(
        asignacion.id,
        docente.id,
      );

      // Assert
      expect(result).toHaveProperty('progresos');
      expect(result.progresos).toEqual([]);
    });

    it('should return progresos when students have completed classes', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const { estudiante } = await crearEstudiante(claseGrupo.id);

      // Create progress for first clase
      const claseId = planificacion.clases[0].id;
      await prisma.progresoClaseEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          clase_id: claseId,
          teoria_completada: true,
          teoria_completada_en: new Date(),
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
      expect(result.progresos[0]).toMatchObject({
        estudiante: {
          nombre: 'Estudiante',
          apellido: expect.stringContaining('Test'),
        },
        clase_numero: 1,
        teoria_completada: true,
        practica_completada: false,
        tiempo_teoria_segundos: 600,
      });
    });

    it('should throw NotFoundException for non-existent asignacion', async () => {
      // Arrange
      const { docente } = await crearDocenteConGrupo();
      const fakeAsignacionId = createId();

      // Act & Assert
      await expect(
        service.getProgresoEstudiantes(fakeAsignacionId, docente.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when docente is not owner', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente: docente1, claseGrupo } =
        await crearDocenteConGrupo('-d1');
      const { docente: docente2 } = await crearDocenteConGrupo('-d2');
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente1.id,
      );

      // Act & Assert
      await expect(
        service.getProgresoEstudiantes(asignacion.id, docente2.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should only return progresos for students in the group', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo: grupo1 } = await crearDocenteConGrupo('-g1');
      const { claseGrupo: grupo2 } = await crearDocenteConGrupo('-g2');

      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        grupo1.id,
        docente.id,
      );

      // Student in grupo1 (should be included)
      const { estudiante: est1 } = await crearEstudiante(grupo1.id, '-e1');
      // Student in grupo2 (should NOT be included)
      const { estudiante: est2 } = await crearEstudiante(grupo2.id, '-e2');

      const claseId = planificacion.clases[0].id;

      // Both students have progress in the same clase
      await prisma.progresoClaseEstudiante.createMany({
        data: [
          {
            estudiante_id: est1.id,
            clase_id: claseId,
            teoria_completada: true,
          },
          {
            estudiante_id: est2.id,
            clase_id: claseId,
            teoria_completada: true,
          },
        ],
      });

      // Act
      const result = await service.getProgresoEstudiantes(
        asignacion.id,
        docente.id,
      );

      // Assert - Only est1 should appear
      expect(result.progresos).toHaveLength(1);
      expect(result.progresos[0].estudiante!.apellido).toContain('-e1');
    });
  });

  // ============================================================================
  // TESTS: Edge Cases & Models
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle activating same clase multiple times (idempotent)', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // Act - activate multiple times
      await service.activarTeoria(asignacion.id, claseId, docente.id);
      await service.activarTeoria(asignacion.id, claseId, docente.id);
      await service.activarTeoria(asignacion.id, claseId, docente.id);

      // Assert - should still work without errors
      const estado = await prisma.estadoClaseGrupo.findUnique({
        where: {
          asignacion_id_clase_id: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
          },
        },
      });

      expect(estado!.teoria_activa).toBe(true);
    });

    it('should handle estados for multiple clases independently', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 4);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Act - activate different combinations for each clase
      await service.activarTeoria(
        asignacion.id,
        planificacion.clases[0].id,
        docente.id,
      );
      await service.activarPractica(
        asignacion.id,
        planificacion.clases[1].id,
        docente.id,
      );
      await service.activarClase(
        asignacion.id,
        planificacion.clases[2].id,
        docente.id,
      );
      // clase[3] remains inactive

      // Assert
      const estados = await prisma.estadoClaseGrupo.findMany({
        where: { asignacion_id: asignacion.id },
        orderBy: { clase: { numero: 'asc' } },
      });

      expect(estados).toHaveLength(3);
      expect(estados[0]).toMatchObject({
        teoria_activa: true,
        practica_activa: false,
      });
      expect(estados[1]).toMatchObject({
        teoria_activa: false,
        practica_activa: true,
      });
      expect(estados[2]).toMatchObject({
        teoria_activa: true,
        practica_activa: true,
      });
    });

    it('should correctly reflect estados in getMisAsignaciones', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 3);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Activate first clase
      await service.activarClase(
        asignacion.id,
        planificacion.clases[0].id,
        docente.id,
      );

      // Act
      const result = await service.getMisAsignaciones(docente.id);

      // Assert
      expect(result[0].estados_clases).toHaveLength(1);
      expect(result[0].estados_clases[0]).toMatchObject({
        clase: {
          id: planificacion.clases[0].id,
          numero: 1,
        },
        teoria_activa: true,
        practica_activa: true,
      });
    });

    it('should not include students with fecha_baja in progreso queries', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      // Create students
      const { estudiante: activeStudent } = await crearEstudiante(
        claseGrupo.id,
        '-active',
      );
      const uniqueId = createId();

      // Create withdrawn student manually
      const tutorWithdrawn = await prisma.tutor.create({
        data: {
          email: `tutor-withdrawn-${uniqueId}@test.com`,
          password_hash: 'hash',
          nombre: 'Tutor',
          apellido: 'Withdrawn',
        },
      });
      createdIds.tutores.push(tutorWithdrawn.id);

      const withdrawnStudent = await prisma.estudiante.create({
        data: {
          username: `withdrawn-${uniqueId}`,
          email: `withdrawn-${uniqueId}@test.com`,
          password_hash: 'hash',
          nombre: 'Withdrawn',
          apellido: 'Student',
          nivelEscolar: 'Primaria',
          edad: 8,
          tutor_id: tutorWithdrawn.id,
        },
      });
      createdIds.estudiantes.push(withdrawnStudent.id);

      // Inscribe withdrawn student WITH fecha_baja
      await prisma.inscripcionClaseGrupo.create({
        data: {
          clase_grupo_id: claseGrupo.id,
          estudiante_id: withdrawnStudent.id,
          tutor_id: tutorWithdrawn.id,
          fecha_baja: new Date(), // Student withdrew
        },
      });

      const claseId = planificacion.clases[0].id;

      // Both have progress
      await prisma.progresoClaseEstudiante.createMany({
        data: [
          {
            estudiante_id: activeStudent.id,
            clase_id: claseId,
            teoria_completada: true,
          },
          {
            estudiante_id: withdrawnStudent.id,
            clase_id: claseId,
            teoria_completada: true,
          },
        ],
      });

      // Act
      const result = await service.getProgresoEstudiantes(
        asignacion.id,
        docente.id,
      );

      // Assert - Only active student should appear
      expect(result.progresos).toHaveLength(1);
      expect(result.progresos[0].estudiante!.apellido).toContain('-active');
    });
  });

  // ============================================================================
  // TESTS: Model Relations
  // ============================================================================
  describe('Model Relations', () => {
    it('should cascade delete EstadoClaseGrupo when AsignacionPlanificacion is deleted', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );

      await service.activarClase(
        asignacion.id,
        planificacion.clases[0].id,
        docente.id,
      );

      // Verify estado exists
      const estadosBefore = await prisma.estadoClaseGrupo.count({
        where: { asignacion_id: asignacion.id },
      });
      expect(estadosBefore).toBe(1);

      // Act - delete asignacion
      await prisma.asignacionPlanificacion.delete({
        where: { id: asignacion.id },
      });

      // Assert - estados should be cascade deleted
      const estadosAfter = await prisma.estadoClaseGrupo.count({
        where: { asignacion_id: asignacion.id },
      });
      expect(estadosAfter).toBe(0);
    });

    it('should cascade delete ClasePlanificacion when Planificacion is deleted', async () => {
      // Arrange
      const admin = await crearAdmin();
      const planificacion = await crearPlanificacionCompleta(admin.id, 3);

      const clasesBefore = await prisma.clasePlanificacion.count({
        where: { planificacion_id: planificacion.id },
      });
      expect(clasesBefore).toBe(3);

      // Act - delete planificacion
      await prisma.planificacion.delete({
        where: { id: planificacion.id },
      });

      // Remove from tracking since we deleted manually
      createdIds.planificaciones = createdIds.planificaciones.filter(
        (id) => id !== planificacion.id,
      );

      // Assert - clases should be cascade deleted
      const clasesAfter = await prisma.clasePlanificacion.count({
        where: { planificacion_id: planificacion.id },
      });
      expect(clasesAfter).toBe(0);
    });

    it('should enforce unique constraint on AsignacionPlanificacion (planificacion_id, clase_grupo_id)', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);

      // First asignacion - should work
      await crearAsignacion(planificacion.id, claseGrupo.id, docente.id);

      // Act & Assert - Second asignacion with same combo should fail
      await expect(
        prisma.asignacionPlanificacion.create({
          data: {
            planificacion_id: planificacion.id,
            clase_grupo_id: claseGrupo.id,
            docente_id: docente.id,
          },
        }),
      ).rejects.toThrow();
    });

    it('should enforce unique constraint on EstadoClaseGrupo (asignacion_id, clase_id)', async () => {
      // Arrange
      const admin = await crearAdmin();
      const { docente, claseGrupo } = await crearDocenteConGrupo();
      const planificacion = await crearPlanificacionCompleta(admin.id, 2);
      const asignacion = await crearAsignacion(
        planificacion.id,
        claseGrupo.id,
        docente.id,
      );
      const claseId = planificacion.clases[0].id;

      // First estado - should work
      await prisma.estadoClaseGrupo.create({
        data: {
          asignacion_id: asignacion.id,
          clase_id: claseId,
          teoria_activa: true,
          practica_activa: false,
        },
      });

      // Act & Assert - Second estado with same combo should fail
      await expect(
        prisma.estadoClaseGrupo.create({
          data: {
            asignacion_id: asignacion.id,
            clase_id: claseId,
            teoria_activa: false,
            practica_activa: true,
          },
        }),
      ).rejects.toThrow();
    });
  });
});
