import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { TutorCreationService, CreateTutorData } from '../tutor-creation.service';
import { PrismaService } from '../../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('TutorCreationService', () => {
  let service: TutorCreationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorCreationService,
        {
          provide: PrismaService,
          useValue: {
            tutor: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TutorCreationService>(TutorCreationService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
  });

  describe('validateUniqueEmail', () => {
    it('debe pasar si el email no existe', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      await expect(
        service.validateUniqueEmail('nuevo@example.com'),
      ).resolves.not.toThrow();

      expect(prisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'nuevo@example.com' },
      });
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const existingTutor = {
        id: '123',
        email: 'existente@example.com',
        nombre: 'Juan Pérez',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(existingTutor as any);

      await expect(
        service.validateUniqueEmail('existente@example.com'),
      ).rejects.toThrow(ConflictException);

      await expect(
        service.validateUniqueEmail('existente@example.com'),
      ).rejects.toThrow('El email ya está registrado');
    });
  });

  describe('generateUsername', () => {
    it('debe generar username desde email (lowercase)', () => {
      expect(service.generateUsername('Juan.Perez@Example.com')).toBe('juan.perez');
    });

    it('debe extraer la parte local del email', () => {
      expect(service.generateUsername('usuario123@dominio.com')).toBe('usuario123');
    });

    it('debe convertir a lowercase', () => {
      expect(service.generateUsername('USUARIO@EXAMPLE.COM')).toBe('usuario');
    });

    it('debe manejar emails con múltiples puntos', () => {
      expect(service.generateUsername('juan.carlos.perez@example.com')).toBe('juan.carlos.perez');
    });
  });

  describe('hashPassword', () => {
    it('debe hashear contraseña con bcrypt', async () => {
      const password = 'SecurePass123';
      const hash = await service.hashPassword(password);

      expect(hash).toBe('$2b$10$hashedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('createTutor', () => {
    const mockTx = {
      tutor: {
        create: jest.fn(),
      },
    };

    const tutorData: CreateTutorData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '1234567890',
      cuil: '20123456789',
      dni: '12345678',
      password: 'SecurePass123',
      ciudad: 'Buenos Aires',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
    });

    it('debe crear tutor con datos normalizados', async () => {
      const mockCreatedTutor = {
        id: 'tutor-123',
        ...tutorData,
        email: tutorData.email.toLowerCase(),
        username: 'juan',
        password: '$2b$10$hashedPassword',
        rol: 'TUTOR',
      };

      mockTx.tutor.create.mockResolvedValue(mockCreatedTutor);

      const result = await service.createTutor(mockTx as any, tutorData);

      expect(mockTx.tutor.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          username: 'juan',
          password: '$2b$10$hashedPassword',
          telefono: '1234567890',
          cuil: '20123456789',
          dni: '12345678',
          ciudad: 'Buenos Aires',
          rol: 'TUTOR',
        },
      });

      expect(result).toEqual(mockCreatedTutor);
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123', 10);
    });

    it('debe normalizar email a lowercase', async () => {
      const dataWithUppercaseEmail = {
        ...tutorData,
        email: 'JUAN@EXAMPLE.COM',
      };

      mockTx.tutor.create.mockResolvedValue({});

      await service.createTutor(mockTx as any, dataWithUppercaseEmail);

      expect(mockTx.tutor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'juan@example.com',
          }),
        }),
      );
    });

    it('debe generar username desde email', async () => {
      mockTx.tutor.create.mockResolvedValue({});

      await service.createTutor(mockTx as any, tutorData);

      expect(mockTx.tutor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'juan',
          }),
        }),
      );
    });

    it('debe asignar rol TUTOR', async () => {
      mockTx.tutor.create.mockResolvedValue({});

      await service.createTutor(mockTx as any, tutorData);

      expect(mockTx.tutor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            rol: 'TUTOR',
          }),
        }),
      );
    });

    it('debe manejar datos opcionales (dni, ciudad)', async () => {
      const dataWithoutOptionals = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '1234567890',
        cuil: '20123456789',
        password: 'SecurePass123',
      };

      mockTx.tutor.create.mockResolvedValue({});

      await service.createTutor(mockTx as any, dataWithoutOptionals);

      expect(mockTx.tutor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dni: undefined,
            ciudad: undefined,
          }),
        }),
      );
    });
  });

  describe('findOrCreateTutor', () => {
    const mockTx = {
      tutor: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const tutorData: CreateTutorData = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      telefono: '1234567890',
      cuil: '20123456789',
      password: 'SecurePass123',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedPassword');
    });

    it('debe retornar tutor existente si ya existe', async () => {
      const existingTutor = {
        id: 'tutor-123',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        username: 'juan',
        telefono: '1234567890',
        cuil: '20123456789',
        rol: 'TUTOR',
      };

      mockTx.tutor.findUnique.mockResolvedValue(existingTutor);

      const result = await service.findOrCreateTutor(mockTx as any, tutorData);

      expect(result).toEqual(existingTutor);
      expect(mockTx.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'juan@example.com' },
      });
      expect(mockTx.tutor.create).not.toHaveBeenCalled();
    });

    it('debe crear tutor nuevo si no existe', async () => {
      const newTutor = {
        id: 'tutor-456',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        username: 'juan',
        password: '$2b$10$hashedPassword',
        telefono: '1234567890',
        cuil: '20123456789',
        rol: 'TUTOR',
      };

      mockTx.tutor.findUnique.mockResolvedValue(null);
      mockTx.tutor.create.mockResolvedValue(newTutor);

      const result = await service.findOrCreateTutor(mockTx as any, tutorData);

      expect(result).toEqual(newTutor);
      expect(mockTx.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'juan@example.com' },
      });
      expect(mockTx.tutor.create).toHaveBeenCalled();
    });

    it('debe normalizar email a lowercase en búsqueda', async () => {
      const dataWithUppercaseEmail = {
        ...tutorData,
        email: 'JUAN@EXAMPLE.COM',
      };

      mockTx.tutor.findUnique.mockResolvedValue(null);
      mockTx.tutor.create.mockResolvedValue({});

      await service.findOrCreateTutor(mockTx as any, dataWithUppercaseEmail);

      expect(mockTx.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'juan@example.com' },
      });
    });
  });
});
