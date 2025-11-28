import { Test, TestingModule } from '@nestjs/testing';
import { AdminStatsService } from './admin-stats.service';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoMembresia } from '@prisma/client';
import { LogrosService } from '../../gamificacion/services/logros.service';

describe('AdminStatsService', () => {
  let service: AdminStatsService;
  let prisma: PrismaService;

  // Mock data
  const _mockMembresias = [
    { id: '1', estado: 'Activa', producto: { precio: 100 } },
    { id: '2', estado: 'Activa', producto: { precio: 200 } },
  ];

  const mockClases = [
    {
      id: '1',
      estado: 'Programada',
      fecha_hora_inicio: new Date('2025-12-01'),
    },
    {
      id: '2',
      estado: 'Programada',
      fecha_hora_inicio: new Date('2025-12-02'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminStatsService,
        {
          provide: PrismaService,
          useValue: {
            membresia: {
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            inscripcionClaseGrupo: {
              count: jest.fn(),
            },
            inscripcionMensual: {
              findMany: jest.fn(),
            },
            clase: {
              count: jest.fn(),
            },
            alerta: {
              count: jest.fn(),
            },
            estudiante: {
              count: jest.fn(),
            },
            docente: {
              count: jest.fn(),
            },
            tutor: {
              count: jest.fn(),
            },
            admin: {
              count: jest.fn(),
            },
            producto: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminStatsService>(AdminStatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics with correct structure', async () => {
      // Arrange
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      jest.spyOn(prisma.inscripcionClaseGrupo, 'count').mockResolvedValue(5);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.alerta, 'count').mockResolvedValue(3);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(50);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(8);
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(25);

      // Act
      const result = await service.getDashboardStats();

      // Assert
      expect(result).toHaveProperty('activeMemberships', 5);
      expect(result).toHaveProperty('upcomingClasses', 10);
      expect(result).toHaveProperty('openAlerts', 3);
      expect(result).toHaveProperty('totalEstudiantes', 50);
      expect(result).toHaveProperty('totalDocentes', 8);
      expect(result).toHaveProperty('totalTutores', 25);
      expect(result).toHaveProperty('fecha');
      expect(result.fecha).toBeInstanceOf(Date);
    });

    it('should call Prisma with correct filters for active inscriptions', async () => {
      // Arrange
      const countSpy = jest
        .spyOn(prisma.inscripcionClaseGrupo, 'count')
        .mockResolvedValue(5);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.alerta, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(0);

      // Act
      await service.getDashboardStats();

      // Assert
      expect(countSpy).toHaveBeenCalledWith({
        where: { fecha_baja: null },
      });
    });

    it('should call Prisma with correct filters for upcoming classes', async () => {
      // Arrange
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      jest.spyOn(prisma.inscripcionClaseGrupo, 'count').mockResolvedValue(0);
      const claseSpy = jest.spyOn(prisma.clase, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.alerta, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(0);

      // Act
      await service.getDashboardStats();

      // Assert
      expect(claseSpy).toHaveBeenCalledWith({
        where: {
          estado: 'Programada',
          fecha_hora_inicio: { gte: expect.any(Date) },
        },
      });
    });

    it('should handle zero counts gracefully', async () => {
      // Arrange
      jest.spyOn(prisma.inscripcionClaseGrupo, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.alerta, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(0);

      // Act
      const result = await service.getDashboardStats();

      // Assert
      expect(result.activeMemberships).toBe(0);
      expect(result.upcomingClasses).toBe(0);
      expect(result.openAlerts).toBe(0);
      expect(result.totalEstudiantes).toBe(0);
      expect(result.totalDocentes).toBe(0);
      expect(result.totalTutores).toBe(0);
    });
  });

  describe('getSystemStats', () => {
    it('should return system statistics with correct structure', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(25);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(8);
      jest.spyOn(prisma.admin, 'count').mockResolvedValue(2);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(50);
      jest
        .spyOn(prisma.clase, 'count')
        .mockResolvedValueOnce(100) // Total clases
        .mockResolvedValueOnce(30); // Clases activas
      jest.spyOn(prisma.producto, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.inscripcionMensual, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.getSystemStats();

      // Assert - El servicio retorna estructura plana, no anidada
      expect(result).toHaveProperty('totalUsuarios', 35); // 25 + 8 + 2
      expect(result).toHaveProperty('totalTutores', 25);
      expect(result).toHaveProperty('totalDocentes', 8);
      expect(result).toHaveProperty('totalEstudiantes', 50);
      expect(result).toHaveProperty('totalClases', 100);
      expect(result).toHaveProperty('clasesActivas', 30);
      expect(result).toHaveProperty('totalProductos', 10);
      expect(result).toHaveProperty('ingresosTotal', 0);
      expect(result).toHaveProperty('pagosPendientes', 0);
      expect(result).toHaveProperty('inscripcionesActivas', 0);
    });

    it('should calculate inscripciones mensuales correctly', async () => {
      // Arrange
      const now = new Date();
      const periodo = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.admin, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.producto, 'count').mockResolvedValue(0);

      const findManySpy = jest
        .spyOn(prisma.inscripcionMensual, 'findMany')
        .mockResolvedValue([
          {
            id: '1',
            periodo,
            estado_pago: 'Pagado',
            precio_final: { toNumber: () => 1000 },
          },
          {
            id: '2',
            periodo,
            estado_pago: 'Pendiente',
            precio_final: { toNumber: () => 500 },
          },
        ] as any);

      // Act
      const result = await service.getSystemStats();

      // Assert
      expect(findManySpy).toHaveBeenCalledWith({
        where: { periodo },
      });
      expect(result).toHaveProperty('ingresosTotal', 1000);
      expect(result).toHaveProperty('pagosPendientes', 500);
      expect(result).toHaveProperty('inscripcionesActivas', 2);
    });

    it('should handle empty counts gracefully', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.admin, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.producto, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.inscripcionMensual, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.getSystemStats();

      // Assert - Servicio retorna estructura plana
      expect(result).toHaveProperty('totalUsuarios', 0);
      expect(result).toHaveProperty('totalTutores', 0);
      expect(result).toHaveProperty('totalDocentes', 0);
      expect(result).toHaveProperty('totalEstudiantes', 0);
      expect(result).toHaveProperty('totalClases', 0);
      expect(result).toHaveProperty('clasesActivas', 0);
      expect(result).toHaveProperty('totalProductos', 0);
      expect(result).toHaveProperty('ingresosTotal', 0);
      expect(result).toHaveProperty('pagosPendientes', 0);
      expect(result).toHaveProperty('inscripcionesActivas', 0);
    });

    it('should call count only for active products', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.admin, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.estudiante, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.clase, 'count').mockResolvedValue(0);
      jest.spyOn(prisma.inscripcionMensual, 'findMany').mockResolvedValue([]);

      const productoSpy = jest
        .spyOn(prisma.producto, 'count')
        .mockResolvedValue(5);

      // Act
      await service.getSystemStats();

      // Assert
      expect(productoSpy).toHaveBeenCalledWith({
        where: { activo: true },
      });
    });
  });
});
