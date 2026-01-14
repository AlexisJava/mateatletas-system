/**
 * Unit Tests - VerificacionMorosidadService
 *
 * REQUISITOS DE NEGOCIO:
 * - Un estudiante es moroso si tiene inscripciones pendientes con fecha vencida
 * - La fecha de vencimiento es el día 9 del mes de la inscripción
 * - Un estudiante moroso NO puede acceder a la plataforma
 * - El tutor puede ver el detalle de deudas de sus estudiantes
 */

import { Test, TestingModule } from '@nestjs/testing';
import { VerificacionMorosidadService } from '../verificacion-morosidad.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('VerificacionMorosidadService', () => {
  let service: VerificacionMorosidadService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      inscripcionMensual: {
        findMany: jest.fn(),
      },
      estudiante: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificacionMorosidadService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<VerificacionMorosidadService>(
      VerificacionMorosidadService,
    );
    prisma = module.get(PrismaService);
  });

  describe('esEstudianteMoroso', () => {
    it('debe retornar true si tiene inscripciones pendientes vencidas', async () => {
      // Periodo de hace 3 meses (seguro vencido)
      const fechaPasada = new Date();
      fechaPasada.setMonth(fechaPasada.getMonth() - 3);
      const periodoVencido = `${fechaPasada.getFullYear()}-${String(fechaPasada.getMonth() + 1).padStart(2, '0')}`;

      prisma.inscripcionMensual.findMany.mockResolvedValue([
        { periodo: periodoVencido },
      ]);

      const resultado = await service.esEstudianteMoroso('estudiante-1');

      expect(resultado).toBe(true);
    });

    it('debe retornar false si no tiene inscripciones pendientes', async () => {
      prisma.inscripcionMensual.findMany.mockResolvedValue([]);

      const resultado = await service.esEstudianteMoroso('estudiante-1');

      expect(resultado).toBe(false);
    });

    it('debe retornar false si las inscripciones pendientes no están vencidas', async () => {
      // Periodo futuro (no vencido)
      const fechaFutura = new Date();
      fechaFutura.setMonth(fechaFutura.getMonth() + 1);
      const periodoFuturo = `${fechaFutura.getFullYear()}-${String(fechaFutura.getMonth() + 1).padStart(2, '0')}`;

      prisma.inscripcionMensual.findMany.mockResolvedValue([
        { periodo: periodoFuturo },
      ]);

      const resultado = await service.esEstudianteMoroso('estudiante-1');

      expect(resultado).toBe(false);
    });
  });

  describe('verificarMorosidadTutor', () => {
    it('debe retornar tieneMorosidad: false si no hay inscripciones pendientes', async () => {
      prisma.inscripcionMensual.findMany.mockResolvedValue([]);

      const resultado = await service.verificarMorosidadTutor('tutor-1');

      expect(resultado.tieneMorosidad).toBe(false);
      expect(resultado.cantidadCuotasVencidas).toBe(0);
      expect(resultado.totalAdeudado).toBe(0);
    });

    it('debe calcular correctamente el total adeudado', async () => {
      const fechaPasada = new Date();
      fechaPasada.setMonth(fechaPasada.getMonth() - 2);
      const periodoVencido = `${fechaPasada.getFullYear()}-${String(fechaPasada.getMonth() + 1).padStart(2, '0')}`;

      prisma.inscripcionMensual.findMany.mockResolvedValue([
        {
          id: 'insc-1',
          periodo: periodoVencido,
          precio_final: 10000,
          estado_pago: 'Pendiente',
          estudiante_id: 'est-1',
          tutor_id: 'tutor-1',
          estudiante: { id: 'est-1', nombre: 'Juan', apellido: 'Pérez' },
          tutor: {
            id: 'tutor-1',
            nombre: 'María',
            apellido: 'García',
            email: 'maria@test.com',
            telefono: '123456789',
          },
        },
        {
          id: 'insc-2',
          periodo: periodoVencido,
          precio_final: 15000,
          estado_pago: 'Pendiente',
          estudiante_id: 'est-2',
          tutor_id: 'tutor-1',
          estudiante: { id: 'est-2', nombre: 'Ana', apellido: 'Pérez' },
          tutor: {
            id: 'tutor-1',
            nombre: 'María',
            apellido: 'García',
            email: 'maria@test.com',
            telefono: '123456789',
          },
        },
      ]);

      const resultado = await service.verificarMorosidadTutor('tutor-1');

      expect(resultado.tieneMorosidad).toBe(true);
      expect(resultado.cantidadCuotasVencidas).toBe(2);
      expect(resultado.totalAdeudado).toBe(25000);
      expect(resultado.estudiantesAfectados).toBe(2);
    });

    it('debe calcular días vencido correctamente', async () => {
      // Periodo de hace 2 meses exactos
      const fechaPasada = new Date();
      fechaPasada.setMonth(fechaPasada.getMonth() - 2);
      const periodoVencido = `${fechaPasada.getFullYear()}-${String(fechaPasada.getMonth() + 1).padStart(2, '0')}`;

      prisma.inscripcionMensual.findMany.mockResolvedValue([
        {
          id: 'insc-1',
          periodo: periodoVencido,
          precio_final: 10000,
          estado_pago: 'Pendiente',
          estudiante_id: 'est-1',
          tutor_id: 'tutor-1',
          estudiante: { id: 'est-1', nombre: 'Juan', apellido: 'Pérez' },
          tutor: {
            id: 'tutor-1',
            nombre: 'María',
            apellido: 'García',
            email: null,
            telefono: null,
          },
        },
      ]);

      const resultado = await service.verificarMorosidadTutor('tutor-1');

      expect(resultado.detalleEstudiantes[0].diasVencido).toBeGreaterThan(0);
    });
  });

  describe('obtenerEstudiantesMorosos', () => {
    it('debe retornar lista vacía si no hay morosos', async () => {
      prisma.estudiante.findMany.mockResolvedValue([]);

      const resultado = await service.obtenerEstudiantesMorosos();

      expect(resultado).toHaveLength(0);
    });

    it('debe filtrar estudiantes sin deudas vencidas', async () => {
      // Solo periodos futuros (no vencidos)
      const fechaFutura = new Date();
      fechaFutura.setMonth(fechaFutura.getMonth() + 1);
      const periodoFuturo = `${fechaFutura.getFullYear()}-${String(fechaFutura.getMonth() + 1).padStart(2, '0')}`;

      prisma.estudiante.findMany.mockResolvedValue([
        {
          id: 'est-1',
          nombre: 'Juan',
          apellido: 'Pérez',
          edad: 10,
          tutor: {
            id: 'tutor-1',
            nombre: 'María',
            apellido: 'García',
            email: 'maria@test.com',
            telefono: '123',
          },
          inscripciones_mensuales: [
            {
              id: 'insc-1',
              periodo: periodoFuturo,
              precio_final: 10000,
              estado_pago: 'Pendiente',
            },
          ],
        },
      ]);

      const resultado = await service.obtenerEstudiantesMorosos();

      // No debe aparecer porque el periodo no está vencido
      expect(resultado).toHaveLength(0);
    });

    it('debe incluir estudiantes con deudas vencidas', async () => {
      const fechaPasada = new Date();
      fechaPasada.setMonth(fechaPasada.getMonth() - 2);
      const periodoVencido = `${fechaPasada.getFullYear()}-${String(fechaPasada.getMonth() + 1).padStart(2, '0')}`;

      prisma.estudiante.findMany.mockResolvedValue([
        {
          id: 'est-1',
          nombre: 'Juan',
          apellido: 'Pérez',
          edad: 10,
          tutor: {
            id: 'tutor-1',
            nombre: 'María',
            apellido: 'García',
            email: 'maria@test.com',
            telefono: '123456789',
          },
          inscripciones_mensuales: [
            {
              id: 'insc-1',
              periodo: periodoVencido,
              precio_final: 10000,
              estado_pago: 'Pendiente',
            },
          ],
        },
      ]);

      const resultado = await service.obtenerEstudiantesMorosos();

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe('est-1');
      expect(resultado[0].cuotasVencidas).toBe(1);
      expect(resultado[0].totalAdeudado).toBe(10000);
    });
  });

  describe('verificarAccesoEstudiante', () => {
    it('debe permitir acceso si estudiante no es moroso', async () => {
      prisma.inscripcionMensual.findMany.mockResolvedValue([]);

      const resultado = await service.verificarAccesoEstudiante('est-1');

      expect(resultado.permitirAcceso).toBe(true);
      expect(resultado.mensaje).toContain('al día');
    });

    it('debe bloquear acceso si estudiante es moroso', async () => {
      const fechaPasada = new Date();
      fechaPasada.setMonth(fechaPasada.getMonth() - 2);
      const periodoVencido = `${fechaPasada.getFullYear()}-${String(fechaPasada.getMonth() + 1).padStart(2, '0')}`;

      // Primera llamada: esEstudianteMoroso
      prisma.inscripcionMensual.findMany
        .mockResolvedValueOnce([{ periodo: periodoVencido }])
        // Segunda llamada: verificarAccesoEstudiante
        .mockResolvedValueOnce([
          {
            id: 'insc-1',
            periodo: periodoVencido,
            precio_final: 10000,
          },
        ]);

      const resultado = await service.verificarAccesoEstudiante('est-1');

      expect(resultado.permitirAcceso).toBe(false);
      expect(resultado.mensaje).toContain('bloqueado');
      expect(resultado.detalles?.totalAdeudado).toBe(10000);
    });

    it('debe incluir detalle de todas las cuotas vencidas', async () => {
      const fechaPasada1 = new Date();
      fechaPasada1.setMonth(fechaPasada1.getMonth() - 3);
      const periodo1 = `${fechaPasada1.getFullYear()}-${String(fechaPasada1.getMonth() + 1).padStart(2, '0')}`;

      const fechaPasada2 = new Date();
      fechaPasada2.setMonth(fechaPasada2.getMonth() - 2);
      const periodo2 = `${fechaPasada2.getFullYear()}-${String(fechaPasada2.getMonth() + 1).padStart(2, '0')}`;

      // Primera llamada: esEstudianteMoroso
      prisma.inscripcionMensual.findMany
        .mockResolvedValueOnce([{ periodo: periodo1 }, { periodo: periodo2 }])
        // Segunda llamada: verificarAccesoEstudiante
        .mockResolvedValueOnce([
          { id: 'insc-1', periodo: periodo1, precio_final: 10000 },
          { id: 'insc-2', periodo: periodo2, precio_final: 15000 },
        ]);

      const resultado = await service.verificarAccesoEstudiante('est-1');

      expect(resultado.permitirAcceso).toBe(false);
      expect(resultado.detalles?.cuotasVencidas).toBe(2);
      expect(resultado.detalles?.totalAdeudado).toBe(25000);
      expect(resultado.detalles?.periodos).toHaveLength(2);
    });
  });
});
