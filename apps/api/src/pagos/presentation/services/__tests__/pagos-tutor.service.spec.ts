import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PagosTutorService } from '../pagos-tutor.service';

const productoSuscripcion = {
  id: 'prod-subs-1',
  tipo: 'Suscripcion',
  nombre: 'Plan Premium',
  descripcion: 'Acceso ilimitado',
  precio: 1000,
};

const productoCurso = {
  id: 'prod-curso-1',
  tipo: 'Curso',
  nombre: 'Curso Matemática',
  descripcion: 'Nivel avanzado',
  precio: 3500,
};

const tutorBasico = {
  id: 'tutor-1',
  email: 'tutor@test.com',
  nombre: 'Tutor',
  apellido: 'Test',
};

describe('PagosTutorService', () => {
  let prisma: any;
  let productosService: any;
  let mercadoPagoService: any;
  let configValues: Record<string, string>;
  let configService: ConfigService;
  let service: PagosTutorService;

  beforeEach(() => {
    prisma = {
      tutor: { findUnique: jest.fn().mockResolvedValue(tutorBasico) },
      estudiante: { findFirst: jest.fn() },
      membresia: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findFirst: jest.fn(),
      },
      inscripcionCurso: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };

    productosService = {
      findById: jest.fn(),
      findSuscripciones: jest.fn().mockResolvedValue([productoSuscripcion]),
    };

    mercadoPagoService = {
      isMockMode: jest.fn().mockReturnValue(true),
      createPreference: jest.fn(),
      buildMembershipPreferenceData: jest.fn(),
      buildCoursePreferenceData: jest.fn(),
    };

    configValues = {
      FRONTEND_URL: 'http://frontend.test',
      BACKEND_URL: 'http://api.test',
      NODE_ENV: 'test',
    };

    configService = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as ConfigService;

    service = new PagosTutorService(
      prisma,
      productosService,
      mercadoPagoService,
      configService,
    );
  });

  describe('crearPreferenciaSuscripcion', () => {
    it('crea una preferencia en modo mock y actualiza la membresía', async () => {
      productosService.findById.mockResolvedValue(productoSuscripcion);
      prisma.membresia.create.mockResolvedValue({
        id: 'memb-1',
        tutor_id: 'tutor-1',
        producto_id: 'prod-subs-1',
      });
      prisma.membresia.update.mockResolvedValue({});

      const preferencia = await service.crearPreferenciaSuscripcion(
        'tutor-1',
        'prod-subs-1',
      );

      expect(preferencia.id).toContain('mock-membresia-memb-1');
      expect(preferencia.init_point).toContain('http://frontend.test');
      expect(mercadoPagoService.createPreference).not.toHaveBeenCalled();
      expect(prisma.membresia.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'memb-1' },
          data: { preferencia_id: expect.any(String) },
        }),
      );
    });
  });

  describe('crearPreferenciaCurso', () => {
    it('lanza NotFound cuando el estudiante no pertenece al tutor', async () => {
      productosService.findById.mockResolvedValue(productoCurso);
      prisma.estudiante.findFirst.mockResolvedValue(null);

      await expect(
        service.crearPreferenciaCurso('tutor-1', 'est-1', 'prod-curso-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('obtenerMembresiaActual', () => {
    it('devuelve null cuando el tutor no tiene membresía', async () => {
      prisma.membresia.findFirst.mockResolvedValue(null);

      const result = await service.obtenerMembresiaActual('tutor-1');
      expect(result).toBeNull();
    });
  });

  describe('activarMembresiaManual', () => {
    it('rechaza la activación en producción cuando no está en modo mock', async () => {
      mercadoPagoService.isMockMode.mockReturnValue(false);
      configValues.NODE_ENV = 'production';

      await expect(
        service.activarMembresiaManual('tutor-1', 'memb-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('activa la membresía y calcula la próxima fecha de pago', async () => {
      const fecha = new Date('2024-01-01T00:00:00.000Z');
      mercadoPagoService.isMockMode.mockReturnValue(true);
      prisma.membresia.findFirst.mockResolvedValue({
        id: 'memb-1',
        tutor_id: 'tutor-1',
        producto_id: 'prod-subs-1',
        producto: { ...productoSuscripcion, duracion_meses: 2 },
      });
      prisma.membresia.update.mockResolvedValue({
        id: 'memb-1',
        tutor_id: 'tutor-1',
        producto_id: 'prod-subs-1',
        estado: 'Activa',
        fecha_inicio: fecha,
        fecha_proximo_pago: new Date('2024-03-01T00:00:00.000Z'),
        preferencia_id: 'pref-1',
        createdAt: fecha,
        updatedAt: fecha,
        producto: { ...productoSuscripcion, precio: productoSuscripcion.precio },
      });

      const result = await service.activarMembresiaManual('tutor-1', 'memb-1');

      expect(result.estado).toBe('Activa');
      expect(result.fecha_inicio).toBe(fecha.toISOString());
      expect(result.fecha_proximo_pago).toBe('2024-03-01T00:00:00.000Z');
    });
  });
});
