import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../core/database/prisma.service';
import { AccesoEstudianteService } from '../acceso-estudiante.service';
import { BadRequestException } from '@nestjs/common';

/**
 * Tests TDD para AccesoEstudianteService
 *
 * Sistema de acceso flexible que determina si un estudiante puede:
 * 1. Acceder a la plataforma (por plan, suscripción tutor, o comisión)
 * 2. Entrar a una clase específica (según tipo de clase y permisos)
 */
describe('AccesoEstudianteService', () => {
  let service: AccesoEstudianteService;
  let prisma: PrismaService;

  // IDs de prueba
  let tutorId: string;
  let estudianteId: string;
  let docenteId: string;
  let planLibrosId: string;
  let planAsincId: string;
  let planSincId: string;
  let comisionId: string;
  let claseGrupoId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [AccesoEstudianteService, PrismaService],
    }).compile();

    service = module.get<AccesoEstudianteService>(AccesoEstudianteService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Limpiar datos de prueba antes de cada test
    await prisma.historialAccesoEstudiante.deleteMany({});
    await prisma.inscripcionComision.deleteMany({});
    await prisma.inscripcionClaseGrupo.deleteMany({});
    await prisma.comision.deleteMany({});
    await prisma.claseGrupo.deleteMany({});
    await prisma.suscripcion.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.planSuscripcion.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.sector.deleteMany({});

    // Crear planes de suscripción
    const planLibros = await prisma.planSuscripcion.create({
      data: {
        nombre: 'STEAM_LIBROS',
        descripcion: 'Plan básico con acceso a libros',
        precio_base: 45000,
      },
    });
    planLibrosId = planLibros.id;

    const planAsinc = await prisma.planSuscripcion.create({
      data: {
        nombre: 'STEAM_ASINCRONICO',
        descripcion: 'Plan con contenido asincrónico',
        precio_base: 65000,
      },
    });
    planAsincId = planAsinc.id;

    const planSinc = await prisma.planSuscripcion.create({
      data: {
        nombre: 'STEAM_SINCRONICO',
        descripcion: 'Plan completo con clases en vivo',
        precio_base: 95000,
      },
    });
    planSincId = planSinc.id;

    // Crear tutor
    const tutor = await prisma.tutor.create({
      data: {
        nombre: 'Tutor',
        apellido: 'Test',
        email: `tutor-${Date.now()}@test.com`,
        password_hash: 'hash123',
      },
    });
    tutorId = tutor.id;

    // Crear docente
    const docente = await prisma.docente.create({
      data: {
        nombre: 'Docente',
        apellido: 'Test',
        email: `docente-${Date.now()}@test.com`,
        password_hash: 'hash123',
      },
    });
    docenteId = docente.id;

    // Crear estudiante base (sin plan)
    const estudiante = await prisma.estudiante.create({
      data: {
        username: `estudiante-${Date.now()}`,
        nombre: 'Estudiante',
        apellido: 'Test',
        nivelEscolar: 'Primaria',
        edad: 10,
        tutor_id: tutorId,
      },
    });
    estudianteId = estudiante.id;

    // Crear sector para grupos
    const sector = await prisma.sector.create({
      data: {
        nombre: 'Matemática',
        descripcion: 'Sector de matemáticas',
        color: '#FF5733',
        icono: '📐',
      },
    });

    // Crear grupo
    const grupo = await prisma.grupo.create({
      data: {
        codigo: 'B1',
        nombre: 'Grupo B1 Test',
        descripcion: 'Grupo de prueba',
        sector_id: sector.id,
      },
    });

    // Crear ClaseGrupo
    const claseGrupo = await prisma.claseGrupo.create({
      data: {
        codigo: 'CG-TEST',
        nombre: `ClaseGrupo Test ${Date.now()}`,
        dia_semana: 'LUNES',
        hora_inicio: '18:00',
        hora_fin: '19:30',
        fecha_inicio: new Date('2026-01-01'),
        fecha_fin: new Date('2026-12-15'),
        anio_lectivo: 2026,
        cupo_maximo: 15,
        grupo_id: grupo.id,
        docente_id: docenteId,
        sector_id: sector.id,
      },
    });
    claseGrupoId = claseGrupo.id;

    // Crear producto para comisión
    const producto = await prisma.producto.create({
      data: {
        nombre: 'Colonia Verano 2026',
        descripcion: 'Colonia de verano',
        precio: 150000,
        tipo: 'Curso',
        activo: true,
      },
    });

    // Crear comisión activa (fechas incluyen hoy)
    const hoy = new Date();
    const comision = await prisma.comision.create({
      data: {
        nombre: 'Turno Mañana',
        producto_id: producto.id,
        docente_id: docenteId,
        fecha_inicio: new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        fecha_fin: new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000), // En 30 días
        activo: true,
      },
    });
    comisionId = comision.id;
  });

  afterAll(async () => {
    // Limpiar todo al finalizar
    await prisma.historialAccesoEstudiante.deleteMany({});
    await prisma.inscripcionComision.deleteMany({});
    await prisma.inscripcionClaseGrupo.deleteMany({});
    await prisma.comision.deleteMany({});
    await prisma.claseGrupo.deleteMany({});
    await prisma.suscripcion.deleteMany({});
    await prisma.estudiante.deleteMany({});
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.planSuscripcion.deleteMany({});
    await prisma.producto.deleteMany({});
    await prisma.grupo.deleteMany({});
    await prisma.sector.deleteMany({});
    await prisma.$disconnect();
  });

  // ============================================================================
  // verificarAccesoEstudiante - Sin acceso
  // ============================================================================
  describe('verificarAccesoEstudiante', () => {
    describe('Sin acceso', () => {
      it('should_return_SIN_ACCESO_when_no_plan_no_subscription_no_comision', async () => {
        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
        expect(result.motivo).toBe('SIN_ACCESO');
        expect(result.permisos.accesoClasesVivo).toBe(false);
        expect(result.mensaje).toBeDefined();
      });
    });

    // ============================================================================
    // verificarAccesoEstudiante - Plan directo
    // ============================================================================
    describe('Plan directo', () => {
      it('should_return_PLAN_DIRECTO_with_accesoClasesVivo_false_for_STEAM_LIBROS', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('PLAN_DIRECTO');
        expect(result.permisos.accesoClasesVivo).toBe(false);
        expect(result.detalles.planDirecto?.nombre).toBe('STEAM_LIBROS');
      });

      it('should_return_PLAN_DIRECTO_with_accesoClasesVivo_false_for_STEAM_ASINCRONICO', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planAsincId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('PLAN_DIRECTO');
        expect(result.permisos.accesoClasesVivo).toBe(false);
        expect(result.detalles.planDirecto?.nombre).toBe('STEAM_ASINCRONICO');
      });

      it('should_return_PLAN_DIRECTO_with_accesoClasesVivo_true_for_STEAM_SINCRONICO', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planSincId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('PLAN_DIRECTO');
        expect(result.permisos.accesoClasesVivo).toBe(true);
        expect(result.detalles.planDirecto?.nombre).toBe('STEAM_SINCRONICO');
      });

      it('should_return_SIN_ACCESO_when_plan_directo_expired', async () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: {
            plan_id: planSincId,
            fecha_vencimiento_plan: ayer,
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
        expect(result.motivo).toBe('SIN_ACCESO');
      });
    });

    // ============================================================================
    // verificarAccesoEstudiante - Suscripción tutor
    // ============================================================================
    describe('Suscripción tutor', () => {
      it('should_inherit_plan_from_tutor_ACTIVA_subscription_when_no_direct_plan', async () => {
        await prisma.suscripcion.create({
          data: {
            tutor_id: tutorId,
            plan_id: planSincId,
            estado: 'ACTIVA',
            precio_final: 95000,
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('SUSCRIPCION_TUTOR');
        expect(result.permisos.accesoClasesVivo).toBe(true);
        expect(result.detalles.suscripcionTutor?.planNombre).toBe(
          'STEAM_SINCRONICO',
        );
      });

      it('should_inherit_plan_from_tutor_EN_GRACIA_subscription', async () => {
        await prisma.suscripcion.create({
          data: {
            tutor_id: tutorId,
            plan_id: planSincId,
            estado: 'EN_GRACIA',
            precio_final: 95000,
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('SUSCRIPCION_TUTOR');
        expect(result.detalles.suscripcionTutor?.estado).toBe('EN_GRACIA');
      });

      it('should_NOT_inherit_from_tutor_CANCELADA_subscription', async () => {
        await prisma.suscripcion.create({
          data: {
            tutor_id: tutorId,
            plan_id: planSincId,
            estado: 'CANCELADA',
            precio_final: 95000,
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
        expect(result.motivo).toBe('SIN_ACCESO');
      });
    });

    // ============================================================================
    // verificarAccesoEstudiante - Comisión
    // ============================================================================
    describe('Comisión', () => {
      it('should_return_COMISION_ACTIVA_with_accesoClasesVivo_true_when_has_active_comision', async () => {
        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('COMISION_ACTIVA');
        expect(result.permisos.accesoClasesVivo).toBe(true);
        expect(result.detalles.comisionesActivas).toHaveLength(1);
      });

      it('should_return_COMISION_ACTIVA_even_with_plan_LIBROS', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        // Tiene plan directo, pero también comisión activa
        expect(result.puedeAcceder).toBe(true);
        expect(result.permisos.accesoClasesVivo).toBe(true); // Por la comisión
        expect(result.detalles.comisionesActivas).toHaveLength(1);
      });

      it('should_ignore_comision_when_fecha_fin_passed', async () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        const comisionVencida = await prisma.comision.create({
          data: {
            nombre: 'Comisión Vencida',
            producto_id: (await prisma.producto.findFirst())!.id,
            fecha_inicio: new Date('2025-01-01'),
            fecha_fin: ayer,
            activo: true,
          },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionVencida.id,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
        expect(result.detalles.comisionesActivas).toHaveLength(0);
      });

      it('should_ignore_comision_when_fecha_inicio_in_future', async () => {
        const manana = new Date();
        manana.setDate(manana.getDate() + 1);

        const comisionFutura = await prisma.comision.create({
          data: {
            nombre: 'Comisión Futura',
            producto_id: (await prisma.producto.findFirst())!.id,
            fecha_inicio: manana,
            fecha_fin: new Date('2026-12-31'),
            activo: true,
          },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionFutura.id,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
        expect(result.detalles.comisionesActivas).toHaveLength(0);
      });

      it('should_accept_comision_without_fecha_fin_as_permanent', async () => {
        const hoy = new Date();
        const comisionPermanente = await prisma.comision.create({
          data: {
            nombre: 'Comisión Permanente',
            producto_id: (await prisma.producto.findFirst())!.id,
            fecha_inicio: new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000),
            fecha_fin: null, // Sin fecha fin = permanente
            activo: true,
          },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionPermanente.id,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.motivo).toBe('COMISION_ACTIVA');
      });

      it('should_list_multiple_active_comisiones', async () => {
        const hoy = new Date();
        const producto = await prisma.producto.findFirst();

        const comision2 = await prisma.comision.create({
          data: {
            nombre: 'Turno Tarde',
            producto_id: producto!.id,
            fecha_inicio: new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000),
            fecha_fin: new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000),
            activo: true,
          },
        });

        await prisma.inscripcionComision.createMany({
          data: [
            {
              estudiante_id: estudianteId,
              comision_id: comisionId,
              estado: 'Confirmada',
            },
            {
              estudiante_id: estudianteId,
              comision_id: comision2.id,
              estado: 'Confirmada',
            },
          ],
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.detalles.comisionesActivas).toHaveLength(2);
      });
    });

    // ============================================================================
    // verificarAccesoEstudiante - Combinaciones
    // ============================================================================
    describe('Combinaciones', () => {
      it('should_have_accesoClasesVivo_true_with_plan_LIBROS_plus_active_comision', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
        expect(result.permisos.accesoClasesVivo).toBe(true);
      });

      it('should_have_puedeAcceder_true_accesoClasesVivo_false_with_plan_LIBROS_plus_expired_comision', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        const comisionVencida = await prisma.comision.create({
          data: {
            nombre: 'Comisión Vencida',
            producto_id: (await prisma.producto.findFirst())!.id,
            fecha_inicio: new Date('2025-01-01'),
            fecha_fin: ayer,
            activo: true,
          },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionVencida.id,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true); // Por el plan LIBROS
        expect(result.permisos.accesoClasesVivo).toBe(false); // Comisión vencida no da acceso
      });

      it('should_have_puedeAcceder_false_with_only_expired_comision', async () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        const comisionVencida = await prisma.comision.create({
          data: {
            nombre: 'Comisión Vencida',
            producto_id: (await prisma.producto.findFirst())!.id,
            fecha_inicio: new Date('2025-01-01'),
            fecha_fin: ayer,
            activo: true,
          },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionVencida.id,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
      });
    });

    // ============================================================================
    // verificarAccesoEstudiante - Estados especiales
    // ============================================================================
    describe('Estados especiales', () => {
      it('should_return_SIN_ACCESO_when_estado_acceso_SUSPENDIDO_even_with_plan', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: {
            plan_id: planSincId,
            estado_acceso: 'SUSPENDIDO',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
        expect(result.mensaje).toContain('suspendid');
      });

      it('should_grant_access_when_acceso_override_true_without_plan', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: {
            acceso_override: true,
            acceso_override_motivo: 'Prueba gratuita',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(true);
      });

      it('should_ignore_override_when_acceso_override_hasta_passed', async () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: {
            acceso_override: true,
            acceso_override_hasta: ayer,
            acceso_override_motivo: 'Prueba vencida',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.puedeAcceder).toBe(false);
      });
    });

    // ============================================================================
    // verificarAccesoEstudiante - Permisos específicos
    // ============================================================================
    describe('Permisos específicos', () => {
      it('should_have_accesoLibros_true_for_any_active_plan', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.permisos.accesoLibros).toBe(true);
      });

      it('should_have_accesoPlanificaciones_true_for_ASYNC_plan', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planAsincId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.permisos.accesoPlanificaciones).toBe(true);
      });

      it('should_have_accesoPlanificaciones_true_for_SYNC_plan', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planSincId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.permisos.accesoPlanificaciones).toBe(true);
      });

      it('should_have_accesoPlanificaciones_true_for_active_comision', async () => {
        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Confirmada',
          },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.permisos.accesoPlanificaciones).toBe(true);
      });

      it('should_have_accesoPlanificaciones_false_for_LIBROS_without_comision', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        const result = await service.verificarAccesoEstudiante(estudianteId);

        expect(result.permisos.accesoPlanificaciones).toBe(false);
      });
    });
  });

  // ============================================================================
  // puedeEntrarAClase - Clase de comisión
  // ============================================================================
  describe('puedeEntrarAClase', () => {
    describe('Clase de comisión', () => {
      it('should_allow_comision_class_when_enrolled_and_comision_active', async () => {
        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Confirmada',
          },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          undefined,
          comisionId,
        );

        expect(result.puedeEntrar).toBe(true);
        expect(result.motivo).toBe('COMISION_INSCRIPTO');
      });

      it('should_reject_comision_class_when_not_enrolled', async () => {
        const result = await service.puedeEntrarAClase(
          estudianteId,
          undefined,
          comisionId,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('SIN_INSCRIPCION');
      });

      it('should_reject_comision_class_when_comision_expired', async () => {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        const comisionVencida = await prisma.comision.create({
          data: {
            nombre: 'Comisión Vencida',
            producto_id: (await prisma.producto.findFirst())!.id,
            fecha_inicio: new Date('2025-01-01'),
            fecha_fin: ayer,
            activo: true,
          },
        });

        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionVencida.id,
            estado: 'Confirmada',
          },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          undefined,
          comisionVencida.id,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('COMISION_VENCIDA');
      });

      it('should_reject_comision_class_when_inscription_cancelled', async () => {
        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Cancelada',
          },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          undefined,
          comisionId,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('SIN_INSCRIPCION');
      });
    });

    // ============================================================================
    // puedeEntrarAClase - Clase de grupo
    // ============================================================================
    describe('Clase de grupo', () => {
      beforeEach(async () => {
        // Inscribir estudiante en el grupo para estos tests
        await prisma.inscripcionClaseGrupo.create({
          data: {
            estudiante_id: estudianteId,
            clase_grupo_id: claseGrupoId,
            tutor_id: tutorId,
          },
        });
      });

      it('should_allow_grupo_class_when_has_STEAM_SINCRONICO', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planSincId },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          claseGrupoId,
          undefined,
        );

        expect(result.puedeEntrar).toBe(true);
        expect(result.motivo).toBe('PLAN_SINCRONICO');
      });

      it('should_reject_grupo_class_when_has_STEAM_LIBROS', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planLibrosId },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          claseGrupoId,
          undefined,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('SIN_PERMISO');
      });

      it('should_reject_grupo_class_when_has_STEAM_ASINCRONICO', async () => {
        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planAsincId },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          claseGrupoId,
          undefined,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('SIN_PERMISO');
      });

      it('should_reject_grupo_class_when_not_enrolled_in_grupo', async () => {
        // Eliminar la inscripción del beforeEach
        await prisma.inscripcionClaseGrupo.deleteMany({
          where: { estudiante_id: estudianteId },
        });

        await prisma.estudiante.update({
          where: { id: estudianteId },
          data: { plan_id: planSincId },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          claseGrupoId,
          undefined,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('SIN_INSCRIPCION');
      });

      it('should_reject_grupo_class_even_with_active_comision', async () => {
        // Solo tiene comisión, no plan sincrónico
        await prisma.inscripcionComision.create({
          data: {
            estudiante_id: estudianteId,
            comision_id: comisionId,
            estado: 'Confirmada',
          },
        });

        const result = await service.puedeEntrarAClase(
          estudianteId,
          claseGrupoId,
          undefined,
        );

        expect(result.puedeEntrar).toBe(false);
        expect(result.motivo).toBe('SIN_PERMISO');
        // La comisión da acceso a clases de comisión, no a clases de grupo
      });
    });

    describe('Validaciones', () => {
      it('should_throw_when_no_id_provided', async () => {
        await expect(
          service.puedeEntrarAClase(estudianteId, undefined, undefined),
        ).rejects.toThrow(BadRequestException);
      });

      it('should_throw_when_both_ids_provided', async () => {
        await expect(
          service.puedeEntrarAClase(estudianteId, claseGrupoId, comisionId),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  // ============================================================================
  // registrarHistorialAcceso
  // ============================================================================
  describe('registrarHistorialAcceso', () => {
    it('should_create_record_with_all_required_fields', async () => {
      await service.registrarHistorialAcceso({
        estudianteId,
        accion: 'PLAN_ASIGNADO',
        origen: 'PLAN_DIRECTO',
        origenId: planSincId,
        ejecutadoPor: 'admin-123',
      });

      const historial = await prisma.historialAccesoEstudiante.findFirst({
        where: { estudiante_id: estudianteId },
      });

      expect(historial).toBeDefined();
      expect(historial!.accion).toBe('PLAN_ASIGNADO');
      expect(historial!.origen).toBe('PLAN_DIRECTO');
      expect(historial!.origen_id).toBe(planSincId);
      expect(historial!.ejecutado_por).toBe('admin-123');
    });

    it('should_save_estado_anterior_and_estado_nuevo_as_JSON', async () => {
      const estadoAnterior = { plan: null, acceso: false };
      const estadoNuevo = { plan: 'STEAM_SINCRONICO', acceso: true };

      await service.registrarHistorialAcceso({
        estudianteId,
        accion: 'PLAN_ASIGNADO',
        origen: 'PLAN_DIRECTO',
        estadoAnterior,
        estadoNuevo,
      });

      const historial = await prisma.historialAccesoEstudiante.findFirst({
        where: { estudiante_id: estudianteId },
      });

      expect(historial!.estado_anterior).toEqual(estadoAnterior);
      expect(historial!.estado_nuevo).toEqual(estadoNuevo);
    });

    it('should_save_ejecutado_por_correctly', async () => {
      await service.registrarHistorialAcceso({
        estudianteId,
        accion: 'OVERRIDE_ACTIVADO',
        origen: 'OVERRIDE',
        ejecutadoPor: 'admin-456',
        metadata: { motivo: 'Prueba gratuita' },
      });

      const historial = await prisma.historialAccesoEstudiante.findFirst({
        where: { estudiante_id: estudianteId },
      });

      expect(historial!.ejecutado_por).toBe('admin-456');
      expect(historial!.metadata).toEqual({ motivo: 'Prueba gratuita' });
    });
  });
});
