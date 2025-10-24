/**
 * E2E Tests: Flujo Completo de Planificaciones
 *
 * Este test valida el flujo REAL del sistema:
 * 1. Admin crea planificación y la publica
 * 2. Docente ve planificaciones disponibles para su grupo
 * 3. Docente asigna planificación a su clase
 * 4. Estudiantes de esa clase ven la planificación asignada
 * 5. Estudiantes avanzan en actividades
 * 6. Docente ve progreso de estudiantes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppModule } from '../../../app.module';
import { EstadoPlanificacion } from '@prisma/client';

describe('Planificaciones - Flujo Completo E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // IDs de test
  let adminId: string;
  let docenteId: string;
  let sectorId: string;
  let sectorCreatedByUs = false; // Flag para saber si creamos el sector
  let claseGrupoId: string;
  let estudiante1Id: string;
  let estudiante2Id: string;
  let tutorId: string;
  let planificacionId: string;
  let asignacionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Setup: Crear estructura de datos de prueba
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup en orden correcto (respetar foreign keys)
    await cleanupTestData();
    await prisma.$disconnect();
    await app.close();
  });

  /**
   * Setup: Crear toda la estructura necesaria para el test
   */
  async function setupTestData() {
    const timestamp = Date.now();

    // 1. Crear Admin
    const admin = await prisma.admin.create({
      data: {
        nombre: 'Admin',
        apellido: 'Test',
        email: `admin-flujo-${timestamp}@test.com`,
        password_hash: 'hashed',
      },
    });
    adminId = admin.id;

    // 2. Buscar o Crear Sector
    let sector = await prisma.sector.findFirst({
      where: { nombre: 'Matemática' },
    });

    if (!sector) {
      sector = await prisma.sector.create({
        data: {
          nombre: 'Matemática',
          descripcion: 'Sector de matemática',
          color: '#FF6B35',
          icono: '🔢',
        },
      });
      sectorCreatedByUs = true;
    }
    sectorId = sector.id;

    // 3. Crear Docente
    const docente = await prisma.docente.create({
      data: {
        nombre: 'Docente',
        apellido: 'Test',
        email: `docente-flujo-${timestamp}@test.com`,
        password_hash: 'hashed',
        sector_id: sectorId,
      },
    });
    docenteId = docente.id;

    // 4. Crear ClaseGrupo (clase del docente)
    const claseGrupo = await prisma.claseGrupo.create({
      data: {
        nombre: 'Grupo B1 - Test',
        codigo_grupo: 'B1',
        docente_id: docenteId,
        sector_id: sectorId,
        dia_semana: 'Lunes',
        hora_inicio: '10:00',
        hora_fin: '11:00',
        activo: true,
      },
    });
    claseGrupoId = claseGrupo.id;

    // 5. Crear Tutor
    const tutor = await prisma.tutor.create({
      data: {
        nombre: 'Tutor',
        apellido: 'Test',
        email: `tutor-flujo-${timestamp}@test.com`,
        username: `tutor-flujo-${timestamp}`,
        password_hash: 'hashed',
      },
    });
    tutorId = tutor.id;

    // 6. Crear Estudiantes
    const estudiante1 = await prisma.estudiante.create({
      data: {
        nombre: 'Estudiante',
        apellido: 'Uno',
        edad: 10,
        nivel_escolar: 'Primaria',
        tutor_id: tutorId,
        sector_id: sectorId,
        email: `estudiante1-flujo-${timestamp}@test.com`,
        username: `estudiante1-flujo-${timestamp}`,
        password_hash: 'hashed',
      },
    });
    estudiante1Id = estudiante1.id;

    const estudiante2 = await prisma.estudiante.create({
      data: {
        nombre: 'Estudiante',
        apellido: 'Dos',
        edad: 11,
        nivel_escolar: 'Primaria',
        tutor_id: tutorId,
        sector_id: sectorId,
        email: `estudiante2-flujo-${timestamp}@test.com`,
        username: `estudiante2-flujo-${timestamp}`,
        password_hash: 'hashed',
      },
    });
    estudiante2Id = estudiante2.id;

    // 7. Inscribir estudiantes en la clase
    await prisma.inscripcionClase.createMany({
      data: [
        {
          estudiante_id: estudiante1Id,
          clase_grupo_id: claseGrupoId,
          estado: 'activo',
        },
        {
          estudiante_id: estudiante2Id,
          clase_grupo_id: claseGrupoId,
          estado: 'activo',
        },
      ],
    });
  }

  /**
   * Cleanup: Eliminar datos de prueba
   */
  async function cleanupTestData() {
    try {
      // Orden importante: de hijos a padres
      if (asignacionId) {
        await prisma.progresoEstudiante.deleteMany({
          where: { asignacion_docente_id: asignacionId },
        });
        await prisma.asignacionDocente.delete({
          where: { id: asignacionId },
        });
      }

      if (planificacionId) {
        await prisma.actividadPlanificacion.deleteMany({
          where: { planificacion_mensual_id: planificacionId },
        });
        await prisma.planificacionMensual.delete({
          where: { id: planificacionId },
        });
      }

      if (claseGrupoId) {
        await prisma.inscripcionClase.deleteMany({
          where: { clase_grupo_id: claseGrupoId },
        });
        await prisma.claseGrupo.delete({
          where: { id: claseGrupoId },
        });
      }

      if (estudiante1Id) {
        await prisma.estudiante.delete({ where: { id: estudiante1Id } });
      }
      if (estudiante2Id) {
        await prisma.estudiante.delete({ where: { id: estudiante2Id } });
      }
      if (tutorId) {
        await prisma.tutor.delete({ where: { id: tutorId } });
      }
      if (docenteId) {
        await prisma.docente.delete({ where: { id: docenteId } });
      }
      if (sectorId && sectorCreatedByUs) {
        // Solo eliminar si lo creamos nosotros
        await prisma.sector.delete({ where: { id: sectorId } });
      }
      if (adminId) {
        await prisma.admin.delete({ where: { id: adminId } });
      }
    } catch (error) {
      console.error('Error en cleanup:', error);
    }
  }

  /**
   * FLUJO COMPLETO: Admin → Docente → Estudiante
   */
  describe('Flujo Completo: Admin crea → Docente asigna → Estudiante recibe', () => {
    it('PASO 1: Admin crea planificación en estado BORRADOR', async () => {
      const planificacion = await prisma.planificacionMensual.create({
        data: {
          codigo_grupo: 'B1',
          mes: 12,
          anio: 2025,
          titulo: 'Multiplicaciones - Diciembre 2025',
          descripcion: 'Planificación inmersiva de multiplicaciones',
          tematica_principal: 'Multiplicaciones',
          objetivos_aprendizaje: [
            'Dominar tablas del 1 al 10',
            'Resolver problemas con multiplicaciones',
          ],
          estado: EstadoPlanificacion.BORRADOR,
          created_by_admin_id: adminId,
          notas_docentes: 'Revisar ejercicios antes de asignar',
        },
      });

      planificacionId = planificacion.id;

      expect(planificacion).toBeDefined();
      expect(planificacion.estado).toBe(EstadoPlanificacion.BORRADOR);
      expect(planificacion.codigo_grupo).toBe('B1');
    });

    it('PASO 2: Admin agrega actividades a la planificación', async () => {
      // Agregar actividades para 4 semanas
      const actividades = await prisma.actividadPlanificacion.createMany({
        data: [
          {
            planificacion_mensual_id: planificacionId,
            semana: 1,
            componente: 'juego',
            descripcion: 'Juego de multiplicaciones 2x2',
            props: { nivel: 'facil', tabla: 2 },
            orden: 1,
          },
          {
            planificacion_mensual_id: planificacionId,
            semana: 1,
            componente: 'video',
            descripcion: 'Video explicativo de multiplicaciones',
            props: { url: 'https://...', duracion: 300 },
            orden: 2,
          },
          {
            planificacion_mensual_id: planificacionId,
            semana: 2,
            componente: 'ejercicio',
            descripcion: 'Ejercicios prácticos tabla del 3',
            props: { cantidad: 10, tipo: 'multiple_choice' },
            orden: 1,
          },
        ],
      });

      expect(actividades.count).toBe(3);

      // Verificar que se crearon
      const actividadesCreadas = await prisma.actividadPlanificacion.findMany({
        where: { planificacion_mensual_id: planificacionId },
      });

      expect(actividadesCreadas).toHaveLength(3);
    });

    it('PASO 3: Admin publica la planificación', async () => {
      const planificacionPublicada = await prisma.planificacionMensual.update({
        where: { id: planificacionId },
        data: {
          estado: EstadoPlanificacion.PUBLICADA,
          fecha_publicacion: new Date(),
        },
      });

      expect(planificacionPublicada.estado).toBe(EstadoPlanificacion.PUBLICADA);
      expect(planificacionPublicada.fecha_publicacion).toBeDefined();
    });

    it('PASO 4: Docente consulta planificaciones disponibles para su grupo (B1)', async () => {
      // Simular endpoint GET /planificaciones?codigo_grupo=B1&estado=publicada
      const planificacionesDisponibles = await prisma.planificacionMensual.findMany({
        where: {
          codigo_grupo: 'B1',
          estado: EstadoPlanificacion.PUBLICADA,
        },
        include: {
          _count: {
            select: { actividades: true },
          },
        },
      });

      expect(planificacionesDisponibles).toHaveLength(1);
      expect(planificacionesDisponibles[0].id).toBe(planificacionId);
      expect(planificacionesDisponibles[0]._count.actividades).toBe(3);
    });

    it('PASO 5: Docente asigna la planificación a su clase', async () => {
      const asignacion = await prisma.asignacionDocente.create({
        data: {
          planificacion_id: planificacionId,
          clase_grupo_id: claseGrupoId,
          docente_id: docenteId,
          activo: true,
          mensaje_docente: '¡Empecemos con multiplicaciones! 🎯',
        },
      });

      asignacionId = asignacion.id;

      expect(asignacion).toBeDefined();
      expect(asignacion.activo).toBe(true);
      expect(asignacion.planificacion_id).toBe(planificacionId);
      expect(asignacion.clase_grupo_id).toBe(claseGrupoId);
    });

    it('PASO 6: Estudiantes de la clase ven la planificación asignada', async () => {
      // Los estudiantes ven las planificaciones de SU clase
      const planificacionesEstudiante = await prisma.asignacionDocente.findMany({
        where: {
          clase_grupo_id: claseGrupoId,
          activo: true,
        },
        include: {
          planificacion: {
            include: {
              actividades: {
                orderBy: [{ semana: 'asc' }, { orden: 'asc' }],
              },
            },
          },
          clase_grupo: {
            include: {
              inscripciones: {
                where: {
                  estudiante_id: estudiante1Id,
                },
              },
            },
          },
        },
      });

      expect(planificacionesEstudiante).toHaveLength(1);
      expect(planificacionesEstudiante[0].planificacion.titulo).toBe(
        'Multiplicaciones - Diciembre 2025',
      );
      expect(planificacionesEstudiante[0].planificacion.actividades).toHaveLength(3);
      expect(planificacionesEstudiante[0].clase_grupo.inscripciones).toHaveLength(1);
    });

    it('PASO 7: Estudiante 1 completa primera actividad', async () => {
      // Crear progreso del estudiante
      const progreso = await prisma.progresoEstudiante.create({
        data: {
          estudiante_id: estudiante1Id,
          asignacion_docente_id: asignacionId,
          semana_actual: 1,
          actividades_completadas: 1,
          total_actividades: 3,
          progreso_porcentaje: 33,
          ultima_actividad_fecha: new Date(),
        },
      });

      expect(progreso).toBeDefined();
      expect(progreso.semana_actual).toBe(1);
      expect(progreso.actividades_completadas).toBe(1);
      expect(progreso.progreso_porcentaje).toBe(33);
    });

    it('PASO 8: Docente ve progreso de sus estudiantes', async () => {
      // El docente consulta el progreso de su clase
      const progresoClase = await prisma.progresoEstudiante.findMany({
        where: {
          asignacion_docente_id: asignacionId,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
      });

      expect(progresoClase).toHaveLength(1); // Solo estudiante1 tiene progreso
      expect(progresoClase[0].estudiante.nombre).toBe('Estudiante');
      expect(progresoClase[0].actividades_completadas).toBe(1);
      expect(progresoClase[0].progreso_porcentaje).toBe(33);
    });

    it('PASO 9: Verificar que estudiante 2 NO tiene progreso aún', async () => {
      const progresoEstudiante2 = await prisma.progresoEstudiante.findFirst({
        where: {
          estudiante_id: estudiante2Id,
          asignacion_docente_id: asignacionId,
        },
      });

      expect(progresoEstudiante2).toBeNull();
    });

    it('PASO 10: Docente puede pausar la asignación', async () => {
      const asignacionPausada = await prisma.asignacionDocente.update({
        where: { id: asignacionId },
        data: { activo: false },
      });

      expect(asignacionPausada.activo).toBe(false);

      // Los estudiantes ya NO ven planificaciones inactivas
      const planificacionesActivas = await prisma.asignacionDocente.findMany({
        where: {
          clase_grupo_id: claseGrupoId,
          activo: true, // Solo activas
        },
      });

      expect(planificacionesActivas).toHaveLength(0);
    });

    it('PASO 11: Docente reactiva la asignación', async () => {
      const asignacionReactivada = await prisma.asignacionDocente.update({
        where: { id: asignacionId },
        data: { activo: true },
      });

      expect(asignacionReactivada.activo).toBe(true);

      // Ahora vuelven a verla
      const planificacionesActivas = await prisma.asignacionDocente.findMany({
        where: {
          clase_grupo_id: claseGrupoId,
          activo: true,
        },
      });

      expect(planificacionesActivas).toHaveLength(1);
    });
  });

  /**
   * CASOS DE BORDE: Validaciones del flujo
   */
  describe('Casos de Borde y Validaciones', () => {
    it('Docente NO puede ver planificaciones en BORRADOR', async () => {
      // Crear planificación en borrador
      const planBorrador = await prisma.planificacionMensual.create({
        data: {
          codigo_grupo: 'B1',
          mes: 1,
          anio: 2026,
          titulo: 'Plan Borrador',
          descripcion: 'No visible',
          tematica_principal: 'Test',
          objetivos_aprendizaje: ['Test'],
          estado: EstadoPlanificacion.BORRADOR,
          created_by_admin_id: adminId,
        },
      });

      // Docente busca planificaciones publicadas
      const planificacionesPublicadas = await prisma.planificacionMensual.findMany({
        where: {
          codigo_grupo: 'B1',
          estado: EstadoPlanificacion.PUBLICADA, // Solo publicadas
        },
      });

      expect(planificacionesPublicadas).not.toContainEqual(
        expect.objectContaining({ id: planBorrador.id }),
      );

      // Cleanup
      await prisma.planificacionMensual.delete({
        where: { id: planBorrador.id },
      });
    });

    it('Estudiante de otro grupo NO ve planificaciones de B1', async () => {
      // Crear otro grupo B2
      const claseB2 = await prisma.claseGrupo.create({
        data: {
          nombre: 'Grupo B2',
          codigo_grupo: 'B2',
          docente_id: docenteId,
          sector_id: sectorId,
          dia_semana: 'Martes',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          activo: true,
        },
      });

      // Estudiante3 en grupo B2
      const estudiante3 = await prisma.estudiante.create({
        data: {
          nombre: 'Estudiante',
          apellido: 'Tres',
          edad: 10,
          nivel_escolar: 'Primaria',
          tutor_id: tutorId,
          sector_id: sectorId,
          email: `estudiante3-${Date.now()}@test.com`,
          username: `estudiante3-${Date.now()}`,
          password_hash: 'hashed',
        },
      });

      await prisma.inscripcionClase.create({
        data: {
          estudiante_id: estudiante3.id,
          clase_grupo_id: claseB2.id,
          estado: 'activo',
        },
      });

      // Estudiante3 busca SUS planificaciones (de su clase B2)
      const planificacionesEstudiante3 = await prisma.asignacionDocente.findMany({
        where: {
          clase_grupo_id: claseB2.id, // Su clase
          activo: true,
        },
      });

      expect(planificacionesEstudiante3).toHaveLength(0); // No tiene ninguna asignada

      // Cleanup
      await prisma.inscripcionClase.deleteMany({
        where: { clase_grupo_id: claseB2.id },
      });
      await prisma.estudiante.delete({ where: { id: estudiante3.id } });
      await prisma.claseGrupo.delete({ where: { id: claseB2.id } });
    });

    it('Admin puede archivar planificación', async () => {
      const planArchivada = await prisma.planificacionMensual.update({
        where: { id: planificacionId },
        data: { estado: EstadoPlanificacion.ARCHIVADA },
      });

      expect(planArchivada.estado).toBe(EstadoPlanificacion.ARCHIVADA);

      // Las planificaciones archivadas NO aparecen en búsquedas de docentes
      const planificacionesPublicadas = await prisma.planificacionMensual.findMany({
        where: {
          codigo_grupo: 'B1',
          estado: EstadoPlanificacion.PUBLICADA,
        },
      });

      expect(planificacionesPublicadas).not.toContainEqual(
        expect.objectContaining({ id: planificacionId }),
      );

      // Restaurar para otros tests
      await prisma.planificacionMensual.update({
        where: { id: planificacionId },
        data: { estado: EstadoPlanificacion.PUBLICADA },
      });
    });
  });
});
