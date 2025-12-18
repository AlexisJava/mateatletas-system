import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminAlertasService } from './admin-alertas.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('AdminAlertasService', () => {
  let service: AdminAlertasService;
  let prisma: PrismaService;

  const mockAlerta = {
    id: 'alerta-1',
    descripcion: 'Estudiante distraído en clase',
    fecha: new Date('2025-10-15'),
    resuelta: false,
    createdAt: new Date('2025-10-15'),
    estudiante_id: 'est-1',
    clase_id: 'clase-1',
    estudiante: {
      id: 'est-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      nivelEscolar: '5to Primaria',
    },
    clase: {
      id: 'clase-1',
      nombre: 'Álgebra Básica',
      fecha_hora_inicio: new Date('2025-10-15T10:00:00Z'),
      duracion_minutos: 60,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAlertasService,
        {
          provide: PrismaService,
          useValue: {
            alerta: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AdminAlertasService>(AdminAlertasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listarAlertas', () => {
    it('should return list of pending alerts', async () => {
      // Arrange
      const mockAlertas = [mockAlerta, { ...mockAlerta, id: 'alerta-2' }];
      jest
        .spyOn(prisma.alerta, 'findMany')
        .mockResolvedValue(mockAlertas as any);

      // Act
      const result = await service.listarAlertas();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'alerta-1');
      expect(result[0]).toHaveProperty('estudiante');
      expect(result[0].clase).toHaveProperty('nombre', 'Álgebra Básica');
    });

    it('should filter only unresolved alerts', async () => {
      // Arrange
      const findManySpy = jest
        .spyOn(prisma.alerta, 'findMany')
        .mockResolvedValue([]);

      // Act
      await service.listarAlertas();

      // Assert
      expect(findManySpy).toHaveBeenCalledWith({
        where: { resuelta: false },
        include: expect.any(Object),
        orderBy: { fecha: 'desc' },
      });
    });

    it('should order alerts by date descending', async () => {
      // Arrange
      const findManySpy = jest
        .spyOn(prisma.alerta, 'findMany')
        .mockResolvedValue([]);

      // Act
      await service.listarAlertas();

      // Assert
      expect(findManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { fecha: 'desc' },
        }),
      );
    });

    it('should return empty array when no alerts', async () => {
      // Arrange
      jest.spyOn(prisma.alerta, 'findMany').mockResolvedValue([]);

      // Act
      const result = await service.listarAlertas();

      // Assert
      expect(result).toEqual([]);
    });

    it('should map response with correct structure', async () => {
      // Arrange
      jest
        .spyOn(prisma.alerta, 'findMany')
        .mockResolvedValue([mockAlerta] as any);

      // Act
      const result = await service.listarAlertas();

      // Assert
      expect(result[0]).toEqual({
        id: 'alerta-1',
        descripcion: 'Estudiante distraído en clase',
        fecha: expect.any(Date),
        resuelta: false,
        estudiante: mockAlerta.estudiante,
        clase: {
          id: 'clase-1',
          nombre: 'Álgebra Básica',
          fecha_hora_inicio: expect.any(Date),
          duracion_minutos: 60,
        },
        createdAt: expect.any(Date),
      });
    });
  });

  describe('resolverAlerta', () => {
    it('should mark alert as resolved', async () => {
      // Arrange
      jest
        .spyOn(prisma.alerta, 'findUnique')
        .mockResolvedValue(mockAlerta as any);
      const updateSpy = jest.spyOn(prisma.alerta, 'update').mockResolvedValue({
        ...mockAlerta,
        resuelta: true,
      } as any);

      // Act
      const result = await service.resolverAlerta('alerta-1');

      // Assert
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'alerta-1' },
        data: { resuelta: true },
      });
      expect(result).toHaveProperty('message', 'Alerta marcada como resuelta');
      expect(result).toHaveProperty('alertaId', 'alerta-1');
    });

    it('should throw NotFoundException when alert does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.alerta, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.resolverAlerta('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.resolverAlerta('non-existent')).rejects.toThrow(
        'Alerta no encontrada',
      );
    });
  });

  describe('sugerirSolucion', () => {
    it('should return suggestion for valid alert', async () => {
      // Arrange
      jest
        .spyOn(prisma.alerta, 'findUnique')
        .mockResolvedValue(mockAlerta as any);

      // Act
      const result = await service.sugerirSolucion('alerta-1');

      // Assert
      expect(result).toHaveProperty('alertaId', 'alerta-1');
      expect(result).toHaveProperty('estudiante', 'Juan Pérez');
      expect(result).toHaveProperty('problema', mockAlerta.descripcion);
      expect(result).toHaveProperty('sugerencia');
      expect(typeof result.sugerencia).toBe('string');
    });

    it('should throw NotFoundException when alert does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.alerta, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.sugerirSolucion('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should generate appropriate suggestion for attention issues', async () => {
      // Arrange
      const alertaAtencion = {
        ...mockAlerta,
        descripcion: 'Estudiante muy distraído y sin concentración',
      };
      jest
        .spyOn(prisma.alerta, 'findUnique')
        .mockResolvedValue(alertaAtencion as any);

      // Act
      const result = await service.sugerirSolucion('alerta-1');

      // Assert
      expect(result.sugerencia).toBeTruthy();
      expect(result.sugerencia.length).toBeGreaterThan(50); // Sugerencia detallada
    });

    it('should generate appropriate suggestion for comprehension difficulties', async () => {
      // Arrange
      const alertaDificultad = {
        ...mockAlerta,
        descripcion: 'Estudiante con dificultad para entender los conceptos',
      };
      jest
        .spyOn(prisma.alerta, 'findUnique')
        .mockResolvedValue(alertaDificultad as any);

      // Act
      const result = await service.sugerirSolucion('alerta-1');

      // Assert
      expect(result.sugerencia).toBeTruthy();
      expect(result.sugerencia).toContain('Revisar'); // Contiene sugerencia de revisión
    });

    it('should generate appropriate suggestion for behavior issues', async () => {
      // Arrange
      const alertaConducta = {
        ...mockAlerta,
        descripcion: 'Problemas de comportamiento en clase',
      };
      jest
        .spyOn(prisma.alerta, 'findUnique')
        .mockResolvedValue(alertaConducta as any);

      // Act
      const result = await service.sugerirSolucion('alerta-1');

      // Assert
      expect(result.sugerencia).toBeTruthy();
      expect(result.sugerencia).toContain('reunión'); // Contiene sugerencia de reunión
    });

    it('should generate generic suggestion for unknown issues', async () => {
      // Arrange
      const alertaGenerica = {
        ...mockAlerta,
        descripcion: 'Situación particular del estudiante',
      };
      jest
        .spyOn(prisma.alerta, 'findUnique')
        .mockResolvedValue(alertaGenerica as any);

      // Act
      const result = await service.sugerirSolucion('alerta-1');

      // Assert
      expect(result.sugerencia).toBeTruthy();
      expect(typeof result.sugerencia).toBe('string');
    });
  });

  describe('crearAlerta', () => {
    it('should create new alert successfully', async () => {
      // Arrange
      const createDto = {
        estudiante_id: 'est-1',
        clase_id: 'clase-1',
        descripcion: 'Nueva alerta de prueba',
      };

      const createdAlerta = {
        id: 'new-alerta',
        ...createDto,
        fecha: new Date(),
        resuelta: false,
        createdAt: new Date(),
        estudiante: mockAlerta.estudiante,
        clase: mockAlerta.clase,
      };

      const createSpy = jest
        .spyOn(prisma.alerta, 'create')
        .mockResolvedValue(createdAlerta as any);

      // Act
      const result = await service.crearAlerta(
        createDto.estudiante_id,
        createDto.clase_id,
        createDto.descripcion,
      );

      // Assert
      expect(createSpy).toHaveBeenCalledWith({
        data: {
          estudiante_id: 'est-1',
          clase_id: 'clase-1',
          descripcion: 'Nueva alerta de prueba',
        },
        include: expect.any(Object),
      });
      expect(result).toHaveProperty('id', 'new-alerta');
      expect(result).toHaveProperty('descripcion', 'Nueva alerta de prueba');
    });

    it('should include estudiante and clase in created alert', async () => {
      // Arrange
      const createSpy = jest.spyOn(prisma.alerta, 'create').mockResolvedValue({
        id: 'new-alerta',
        estudiante_id: 'est-1',
        clase_id: 'clase-1',
        descripcion: 'Test',
        fecha: new Date(),
        resuelta: false,
        createdAt: new Date(),
        estudiante: mockAlerta.estudiante,
        clase: mockAlerta.clase,
      } as any);

      // Act
      await service.crearAlerta('est-1', 'clase-1', 'Test');

      // Assert
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            estudiante: {
              select: {
                nombre: true,
                apellido: true,
              },
            },
            clase: {
              select: {
                nombre: true,
              },
            },
          },
        }),
      );
    });
  });
});
