import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstudianteCommandService } from '../services/estudiante-command.service';
import { EstudianteBusinessValidator } from '../validators/estudiante-business.validator';
import { PrismaService } from '../../core/database/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

/**
 * TDD: Crear estudiante(s) con tutor en un sector específico
 *
 * FUNCIONALIDAD:
 * - Crear uno o múltiples estudiantes (hermanos) en un solo request
 * - Asociar estudiantes a un sector específico
 * - Crear o vincular un tutor existente
 * - Generar credenciales automáticas para estudiantes y tutor
 * - Validar que un estudiante pueda estar en múltiples sectores
 */
describe('EstudianteCommandService - Crear con Tutor y Sector', () => {
  let service: EstudianteCommandService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstudianteCommandService,
        EstudianteBusinessValidator,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
            tutor: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            sector: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            emitAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EstudianteCommandService>(EstudianteCommandService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();

    (prisma.$transaction as jest.Mock).mockImplementation(
      async (fn: (tx: typeof prisma) => Promise<void>) => fn(prisma),
    );

    (prisma.estudiante.create as jest.Mock).mockImplementation(
      async (args: any) => ({
        id: 'estudiante-id',
        nombre: args.data.nombre,
        apellido: args.data.apellido,
        edad: args.data.edad,
        nivel_escolar: args.data.nivel_escolar,
        tutor: { id: args.data.tutor_id },
        sector: { id: args.data.sector_id },
      }),
    );

    (prisma.tutor.create as jest.Mock).mockImplementation(
      async (args: any) => ({
        id: 'tutor-id',
        nombre: args.data.nombre,
        apellido: args.data.apellido,
        email: args.data.email,
        username: args.data.username,
        telefono: args.data.telefono,
      }),
    );

    (prisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.estudiante.findUnique as jest.Mock).mockResolvedValue(null);
  });

  describe('RED - Test 1: Crear un estudiante con tutor nuevo en un sector', () => {
    it('debería crear un estudiante, su tutor y usuarios con credenciales automáticas', async () => {
      // Arrange
      const sectorId = 'sector-matematica-id';
      const dto = {
        estudiantes: [
          {
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '12345678',
            fechaNacimiento: '2010-05-15',
            telefono: '1234567890',
            edad: 10,
            nivel_escolar: 'Primaria',
          },
        ],
        tutor: {
          nombre: 'María',
          apellido: 'Pérez',
          dni: '87654321',
          email: 'maria.perez@example.com',
          telefono: '0987654321',
        },
        sectorId,
      };

      const mockSector = { id: sectorId, nombre: 'Matemática' };
      const mockTutor = {
        id: 'tutor-id',
        nombre: 'María',
        apellido: 'Pérez',
        user: {
          id: 'tutor-user-id',
          username: 'maria.perez',
          email: 'maria.perez@example.com',
        },
      };
      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(mockSector as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null); // Tutor no existe

      // Act
      const result = await service.crearEstudiantesConTutor(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.estudiantes).toHaveLength(1);
      expect(result.estudiantes[0]).toBeDefined();
      expect(result.estudiantes[0]?.nombre).toBe('Juan');
      expect(result.tutor).toBeDefined();
      expect(result.tutor?.nombre).toBe('María');
      expect(result.credenciales).toBeDefined();
      expect(result.credenciales.tutor).toEqual({
        username: 'maria.perez',
        password: expect.any(String),
      });
      expect(result.credenciales.estudiantes).toHaveLength(1);
      expect(result.credenciales.estudiantes[0]).toEqual({
        nombre: 'Juan Pérez',
        username: 'juan.perez',
        password: expect.any(String),
      });
    });
  });

  describe('RED - Test 2: Crear múltiples hermanos con el mismo tutor', () => {
    it('debería crear varios estudiantes asociados al mismo tutor', async () => {
      // Arrange
      const dto = {
        estudiantes: [
          {
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '12345678',
            fechaNacimiento: '2010-05-15',
            edad: 12,
            nivel_escolar: 'Primaria',
          },
          {
            nombre: 'Ana',
            apellido: 'Pérez',
            dni: '12345679',
            fechaNacimiento: '2012-08-20',
            edad: 10,
            nivel_escolar: 'Primaria',
          },
        ],
        tutor: {
          nombre: 'María',
          apellido: 'Pérez',
          dni: '87654321',
          email: 'maria.perez@example.com',
        },
        sectorId: 'sector-id',
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: 'sector-id' } as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null);

      // Act
      const result = await service.crearEstudiantesConTutor(dto);

      // Assert
      expect(result.estudiantes).toHaveLength(2);
      expect(result.estudiantes[0]?.nombre).toBe('Juan');
      expect(result.estudiantes[1]?.nombre).toBe('Ana');
      expect(result.credenciales.estudiantes).toHaveLength(2);
    });
  });

  describe('RED - Test 3: Vincular estudiantes a tutor existente', () => {
    it('debería usar un tutor existente si el email ya está registrado', async () => {
      // Arrange
      const dto = {
        estudiantes: [
          {
            nombre: 'Carlos',
            apellido: 'Pérez',
            dni: '12345680',
            fechaNacimiento: '2011-03-10',
            edad: 11,
            nivel_escolar: 'Primaria',
          },
        ],
        tutor: {
          nombre: 'María',
          apellido: 'Pérez',
          dni: '87654321',
          email: 'maria.perez@example.com',
        },
        sectorId: 'sector-id',
      };

      const tutorExistente = {
        id: 'tutor-existente-id',
        nombre: 'María',
        apellido: 'Pérez',
        user: { id: 'user-id', email: 'maria.perez@example.com' },
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: 'sector-id' } as any);
      jest
        .spyOn(prisma.tutor, 'findFirst')
        .mockResolvedValue(tutorExistente as any);

      // Act
      const result = await service.crearEstudiantesConTutor(dto);

      // Assert
      expect(result.tutor?.id).toBe('tutor-existente-id');
      expect(result.credenciales.tutor).toBeUndefined(); // No se generan nuevas credenciales
      expect(result.estudiantes[0]?.tutor?.id).toBe('tutor-existente-id');
    });
  });

  describe('RED - Test 4: Validación de sector existente', () => {
    it('debería lanzar NotFoundException si el sector no existe', async () => {
      // Arrange
      const dto = {
        estudiantes: [
          {
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '12345678',
            fechaNacimiento: '2010-05-15',
            edad: 10,
            nivel_escolar: 'Primaria',
          },
        ],
        tutor: {
          nombre: 'María',
          apellido: 'Pérez',
          dni: '87654321',
          email: 'maria@example.com',
        },
        sectorId: 'sector-inexistente',
      };

      jest.spyOn(prisma.sector, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.crearEstudiantesConTutor(dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.crearEstudiantesConTutor(dto)).rejects.toThrow(
        'Sector no encontrado',
      );
    });
  });

  describe('RED - Test 6: Generación automática de username', () => {
    it('debería generar username único basado en nombre.apellido', async () => {
      // Arrange
      const dto = {
        estudiantes: [
          {
            nombre: 'Juan Pablo',
            apellido: 'Pérez García',
            dni: '12345678',
            fechaNacimiento: '2010-05-15',
            edad: 12,
            nivel_escolar: 'Secundaria',
          },
        ],
        tutor: {
          nombre: 'María Elena',
          apellido: 'Pérez García',
          dni: '87654321',
          email: 'maria@example.com',
        },
        sectorId: 'sector-id',
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: 'sector-id' } as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn((prisma as any).user, 'findUnique')
        .mockResolvedValueOnce({ id: 'existing-user' } as any) // juan.perez ya existe
        .mockResolvedValueOnce(null); // juan.perez2 disponible

      // Act
      const result = await service.crearEstudiantesConTutor(dto);

      // Assert
      expect(result.credenciales.estudiantes[0]).toBeDefined();
      expect(result.credenciales.estudiantes[0]?.username).toMatch(
        /^[a-z]+\.[a-z]+\d*$/,
      );
      expect(result.credenciales.tutor).toBeDefined();
      expect(result.credenciales.tutor?.username).toMatch(
        /^[a-z]+\.[a-z]+\d*$/,
      );
    });
  });

  describe('RED - Test 7: Generación de contraseña temporal segura', () => {
    it('debería generar contraseña temporal de 8 caracteres alfanuméricos', async () => {
      // Arrange
      const dto = {
        estudiantes: [
          {
            nombre: 'Juan',
            apellido: 'Pérez',
            dni: '12345678',
            fechaNacimiento: '2010-05-15',
            edad: 10,
            nivel_escolar: 'Primaria',
          },
        ],
        tutor: {
          nombre: 'María',
          apellido: 'Pérez',
          dni: '87654321',
          email: 'maria@example.com',
        },
        sectorId: 'sector-id',
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue({ id: 'sector-id' } as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null);

      // Act
      const result = await service.crearEstudiantesConTutor(dto);

      // Assert
      expect(result.credenciales.estudiantes[0]).toBeDefined();
      expect(result.credenciales.estudiantes[0]?.password).toHaveLength(8);
      expect(result.credenciales.estudiantes[0]?.password).toMatch(
        /^[A-Za-z0-9]{8}$/,
      );
      expect(result.credenciales.tutor).toBeDefined();
      expect(result.credenciales.tutor?.password).toHaveLength(8);
      expect(result.credenciales.tutor?.password).toMatch(/^[A-Za-z0-9]{8}$/);
    });
  });
});
