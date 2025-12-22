import { Test, TestingModule } from '@nestjs/testing';
import { AdminEstudiantesService } from '../admin-estudiantes.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

// Mock de las funciones de generación de credenciales
jest.mock('../../../common/utils/credential-generator', () => ({
  generateTutorUsername: jest.fn(() => 'carlos.perez.abc1'),
  generateEstudianteUsername: jest.fn(() => 'juan.perez.xyz2'),
  generateTutorPassword: jest.fn(() => 'Tutor-P@ss-test1234'),
  generateEstudiantePin: jest.fn(() => '1234'),
}));

describe('AdminEstudiantesService - crearEstudianteConCredenciales', () => {
  let service: AdminEstudiantesService;
  let prisma: PrismaService;

  const mockSector = {
    id: 'sector-matematica-id',
    nombre: 'Matemática',
    descripcion: 'Sector de matemáticas',
    color: '#3b82f6',
    icono: '🧮',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCasa = {
    id: 'equipo-quantum-id',
    nombre: 'Quantum',
    color_primario: '#10B981',
    color_secundario: '#34D399',
    icono_url: null,
    xp_total: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTutor = {
    id: 'tutor-id-123',
    nombre: 'Carlos',
    apellido: 'Pérez',
    username: 'carlos.perez.abc1',
    email: 'carlos@test.com',
    telefono: '+5491123456789',
    dni: '12345678',
    password_hash: 'hashed-password',
    debe_completar_perfil: false,
    roles: ['tutor'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudiante = {
    id: 'estudiante-id-456',
    nombre: 'Juan',
    apellido: 'Pérez',
    username: 'juan.perez.xyz2',
    edad: 10,
    nivel_escolar: 'Primaria',
    xp_total: 100,
    nivel_actual: 2,
    tutor_id: 'tutor-id-123',
    password_hash: 'hashed-pin',
    avatar_url: null,
    equipo_id: 'equipo-fenix-id',
    sector_id: 'sector-matematica-id',
    foto_url: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminEstudiantesService,
        {
          provide: PrismaService,
          useValue: {
            sector: {
              findUnique: jest.fn(),
            },
            casa: {
              findUnique: jest.fn(),
            },
            tutor: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            estudiante: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminEstudiantesService>(AdminEstudiantesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TDD: crearEstudianteConCredenciales', () => {
    const validDto = {
      nombreEstudiante: 'Juan',
      apellidoEstudiante: 'Pérez',
      edadEstudiante: 10,
      nivelEscolar: 'Primaria' as const,
      sectorId: 'sector-matematica-id',
      puntosIniciales: 100,
      nivelInicial: 2,
      casaId: 'equipo-fenix-id',
      nombreTutor: 'Carlos',
      apellidoTutor: 'Pérez',
      emailTutor: 'carlos@test.com',
      telefonoTutor: '+5491123456789',
      dniTutor: '12345678',
    };

    it('debería lanzar NotFoundException si el sector no existe', async () => {
      // Arrange
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.crearEstudianteConCredenciales(validDto),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.sector.findUnique).toHaveBeenCalledWith({
        where: { id: 'sector-matematica-id' },
      });
    });

    it('debería lanzar NotFoundException si el equipo no existe (cuando se proporciona)', async () => {
      // Arrange
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(mockSector);
      jest.spyOn(prisma.casa, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.crearEstudianteConCredenciales(validDto),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.casa.findUnique).toHaveBeenCalledWith({
        where: { id: 'equipo-fenix-id' },
      });
    });

    it('debería crear estudiante con tutor EXISTENTE y NO generar credenciales de tutor', async () => {
      // Arrange
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(mockSector);
      jest.spyOn(prisma.casa, 'findUnique').mockResolvedValue(mockCasa);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(mockTutor as any);

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          return callback({
            tutor: { create: jest.fn() },
            estudiante: { create: jest.fn().mockResolvedValue(mockEstudiante) },
          });
        });

      // Act
      const result = await service.crearEstudianteConCredenciales(validDto);

      // Assert
      expect(result.tutorCreado).toBe(false);
      expect(result.credencialesTutor).toBeNull();
      expect(result.credencialesEstudiante).toEqual({
        username: 'juan.perez.xyz2',
        pin: '1234',
      });
      expect(result.estudiante).toBeDefined();
      expect(result.tutor).toBeDefined();
    });

    it('debería crear estudiante con tutor NUEVO y generar credenciales para ambos', async () => {
      // Arrange
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(mockSector);
      jest.spyOn(prisma.casa, 'findUnique').mockResolvedValue(mockCasa);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null); // Tutor NO existe

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          return callback({
            tutor: { create: jest.fn().mockResolvedValue(mockTutor as any) },
            estudiante: { create: jest.fn().mockResolvedValue(mockEstudiante) },
          });
        });

      // Act
      const result = await service.crearEstudianteConCredenciales(validDto);

      // Assert
      expect(result.tutorCreado).toBe(true);
      expect(result.credencialesTutor).toEqual({
        username: 'carlos.perez.abc1',
        passwordTemporal: 'Tutor-P@ss-test1234',
      });
      expect(result.credencialesEstudiante).toEqual({
        username: 'juan.perez.xyz2',
        pin: '1234',
      });
    });

    it('debería crear estudiante SIN equipoId cuando no se proporciona', async () => {
      // Arrange
      const dtoSinEquipo = { ...validDto, casaId: undefined };
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(mockSector);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null);

      const mockEstudianteCreate = jest.fn().mockResolvedValue({
        ...mockEstudiante,
        casaId: null,
      });

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          return callback({
            tutor: { create: jest.fn().mockResolvedValue(mockTutor as any) },
            estudiante: { create: mockEstudianteCreate },
          });
        });

      // Act
      const result = await service.crearEstudianteConCredenciales(dtoSinEquipo);

      // Assert
      expect(result.estudiante.casaId).toBeNull();
      expect(mockEstudianteCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            casaId: null,
          }),
        }),
      );
    });

    it('debería usar valores por defecto para puntosIniciales y nivelInicial', async () => {
      // Arrange
      const dtoSinOpcionales = {
        nombreEstudiante: 'Juan',
        apellidoEstudiante: 'Pérez',
        edadEstudiante: 10,
        nivelEscolar: 'Primaria' as const,
        sectorId: 'sector-matematica-id',
        nombreTutor: 'Carlos',
        apellidoTutor: 'Pérez',
      };

      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(mockSector);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null);

      const mockEstudianteCreate = jest.fn().mockResolvedValue(mockEstudiante);

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          return callback({
            tutor: { create: jest.fn().mockResolvedValue(mockTutor as any) },
            estudiante: { create: mockEstudianteCreate },
          });
        });

      // Act
      await service.crearEstudianteConCredenciales(dtoSinOpcionales);

      // Assert
      // NOTA: xp_total ya NO está en Estudiante, está en RecursosEstudiante (SUB-FASE 1.3)
      // Solo verificamos nivel_actual que sí sigue en Estudiante
      expect(mockEstudianteCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nivel_actual: 1, // Default
          }),
        }),
      );
    });

    it('debería hashear el PIN del estudiante antes de guardarlo', async () => {
      // Arrange
      const dtoSinEquipo = { ...validDto, casaId: undefined };
      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(mockSector);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(mockTutor as any);

      const mockEstudianteCreate = jest.fn().mockResolvedValue(mockEstudiante);

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback: any) => {
          return callback({
            tutor: { create: jest.fn() },
            estudiante: { create: mockEstudianteCreate },
          });
        });

      // Act
      await service.crearEstudianteConCredenciales(dtoSinEquipo);

      // Assert
      // Verificar que se llamó a create con un password_hash (hasheado)
      expect(mockEstudianteCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password_hash: expect.any(String), // Debe tener un hash
          }),
        }),
      );

      // Verificar que el hash NO es el PIN en texto plano
      const callArg = mockEstudianteCreate.mock.calls[0][0];
      expect(callArg.data.password_hash).not.toBe('1234');
    });
  });
});
