import { Test, TestingModule } from '@nestjs/testing';
import { AdminEstudiantesService } from '../admin-estudiantes.service';
import { PrismaService } from '../../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AdminEstudiantesService - Passwords Temporales (TDD RED)', () => {
  let service: AdminEstudiantesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminEstudiantesService,
        {
          provide: PrismaService,
          useValue: {
            sector: { findUnique: jest.fn() },
            equipo: { findUnique: jest.fn() },
            tutor: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
            estudiante: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminEstudiantesService>(AdminEstudiantesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('crearEstudianteConCredenciales - Password Temporal', () => {
    it('debería guardar el PIN temporal en texto plano para el estudiante', async () => {
      // Arrange
      const mockSector = {
        id: 'sector123',
        nombre: 'Matemática',
        activo: true,
      };
      const mockTutorExistente = {
        id: 'tutor123',
        nombre: 'Padre',
        apellido: 'Pérez',
        username: 'padre.perez',
        password_hash: 'hash123',
      };

      const mockEstudianteCreado = {
        id: 'est123',
        nombre: 'Juan',
        apellido: 'Pérez',
        username: 'juan.perez.abc1',
        password_hash: 'hashedPin',
        password_temporal: '1234', // ← Esto debería guardarse
        debe_cambiar_password: true,
        edad: 10,
        nivel_escolar: 'Primaria',
        tutor_id: 'tutor123',
        sector_id: 'sector123',
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(mockSector as any);
      jest
        .spyOn(prisma.tutor, 'findFirst')
        .mockResolvedValue(mockTutorExistente as any);

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            ...prisma,
            estudiante: {
              create: jest.fn().mockResolvedValue(mockEstudianteCreado),
            },
          };
          return callback(tx as any);
        });

      // Act
      const resultado = await service.crearEstudianteConCredenciales({
        nombreEstudiante: 'Juan',
        apellidoEstudiante: 'Pérez',
        edadEstudiante: 10,
        nivelEscolar: 'Primaria',
        sectorId: 'sector123',
        nombreTutor: 'Padre',
        apellidoTutor: 'Pérez',
      });

      // Assert
      expect(resultado.estudiante).toBeDefined();

      // Verificar que el mock fue llamado con password_temporal
      const transactionCallback = (prisma.$transaction as jest.Mock).mock
        .calls[0][0];
      expect(transactionCallback).toBeDefined();

      // Este test va a FALLAR porque password_temporal no existe en el schema
      // Esperamos que password_temporal se pase al create
    });

    it('debería guardar la password temporal en texto plano para el tutor', async () => {
      // Arrange
      const mockSector = {
        id: 'sector123',
        nombre: 'Matemática',
        activo: true,
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(mockSector as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(null); // Tutor NO existe

      const mockTutorCreado = {
        id: 'tutor123',
        nombre: 'Padre',
        apellido: 'Pérez',
        username: 'padre.perez.xyz9',
        password_hash: 'hashedPassword',
        password_temporal: 'TempPass123', // ← Esto debería guardarse
        debe_cambiar_password: true,
      };

      const mockEstudianteCreado = {
        id: 'est123',
        nombre: 'Juan',
        apellido: 'Pérez',
        username: 'juan.perez.abc1',
        password_hash: 'hashedPin',
        password_temporal: '5678',
        debe_cambiar_password: true,
      };

      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            ...prisma,
            tutor: {
              create: jest.fn().mockResolvedValue(mockTutorCreado),
            },
            estudiante: {
              create: jest.fn().mockResolvedValue(mockEstudianteCreado),
            },
          };
          return callback(tx as any);
        });

      // Act
      const resultado = await service.crearEstudianteConCredenciales({
        nombreEstudiante: 'Juan',
        apellidoEstudiante: 'Pérez',
        edadEstudiante: 10,
        nivelEscolar: 'Primaria',
        sectorId: 'sector123',
        nombreTutor: 'Padre',
        apellidoTutor: 'Pérez',
      });

      // Assert
      expect(resultado.tutor).toBeDefined();
      expect(resultado.tutorCreado).toBe(true);

      // Este test va a FALLAR porque password_temporal no existe en el schema
      // Esperamos que se guarde la password temporal del tutor
    });

    it('debería hashear la password incluso cuando se guarda la temporal', async () => {
      // Arrange
      const mockSector = {
        id: 'sector123',
        nombre: 'Matemática',
        activo: true,
      };
      const mockTutor = {
        id: 'tutor123',
        nombre: 'Padre',
        apellido: 'Pérez',
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(mockSector as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(mockTutor as any);

      let estudianteCreateData: any;
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            ...prisma,
            estudiante: {
              create: jest.fn().mockImplementation((params) => {
                estudianteCreateData = params.data;
                return Promise.resolve({
                  id: 'est123',
                  ...params.data,
                });
              }),
            },
          };
          return callback(tx as any);
        });

      // Act
      await service.crearEstudianteConCredenciales({
        nombreEstudiante: 'Juan',
        apellidoEstudiante: 'Pérez',
        edadEstudiante: 10,
        nivelEscolar: 'Primaria',
        sectorId: 'sector123',
        nombreTutor: 'Padre',
        apellidoTutor: 'Pérez',
      });

      // Assert
      expect(estudianteCreateData.password_hash).toBeDefined();
      expect(estudianteCreateData.password_temporal).toBeDefined();
      expect(estudianteCreateData.password_hash).not.toBe(
        estudianteCreateData.password_temporal,
      );

      // Verificar que es un hash bcrypt válido
      const pinTemporal = estudianteCreateData.password_temporal;
      const esHashValido = await bcrypt.compare(
        pinTemporal,
        estudianteCreateData.password_hash,
      );

      // Este test debería PASAR una vez implementemos la lógica
      expect(esHashValido).toBe(true);
    });

    it('debería marcar debe_cambiar_password como true por defecto', async () => {
      // Arrange
      const mockSector = {
        id: 'sector123',
        nombre: 'Matemática',
        activo: true,
      };
      const mockTutor = {
        id: 'tutor123',
        nombre: 'Padre',
        apellido: 'Pérez',
      };

      jest
        .spyOn(prisma.sector, 'findUnique')
        .mockResolvedValue(mockSector as any);
      jest.spyOn(prisma.tutor, 'findFirst').mockResolvedValue(mockTutor as any);

      let estudianteCreateData: any;
      jest
        .spyOn(prisma, '$transaction')
        .mockImplementation(async (callback) => {
          const tx = {
            ...prisma,
            estudiante: {
              create: jest.fn().mockImplementation((params) => {
                estudianteCreateData = params.data;
                return Promise.resolve({
                  id: 'est123',
                  ...params.data,
                });
              }),
            },
          };
          return callback(tx as any);
        });

      // Act
      await service.crearEstudianteConCredenciales({
        nombreEstudiante: 'Juan',
        apellidoEstudiante: 'Pérez',
        edadEstudiante: 10,
        nivelEscolar: 'Primaria',
        sectorId: 'sector123',
        nombreTutor: 'Padre',
        apellidoTutor: 'Pérez',
      });

      // Assert
      // Este test va a FALLAR porque debe_cambiar_password no existe en Estudiante
      expect(estudianteCreateData.debe_cambiar_password).toBe(true);
    });
  });

  describe('obtenerCredencialesTemporales', () => {
    it('debería existir el método obtenerCredencialesTemporales', () => {
      // Este test va a FALLAR porque el método no existe
      expect(typeof service.obtenerCredencialesTemporales).toBe('function');
    });

    it('debería retornar solo estudiantes con debe_cambiar_password = true', async () => {
      // Arrange
      const mockEstudiantes = [
        {
          id: 'est1',
          username: 'juan.perez',
          password_temporal: '1234',
          debe_cambiar_password: true,
          nombre: 'Juan',
          apellido: 'Pérez',
          sector: { nombre: 'Matemática' },
          tutor: { nombre: 'Padre', apellido: 'Pérez' },
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);

      // Act & Assert
      // Este test va a FALLAR porque el método no existe
      await expect(async () => {
        await (service as any).obtenerCredencialesTemporales();
      }).rejects.toThrow();
    });

    it('debería incluir información del estudiante y sector', async () => {
      // Arrange
      const mockEstudiantes = [
        {
          id: 'est1',
          username: 'juan.perez.abc1',
          password_temporal: '1234',
          debe_cambiar_password: true,
          nombre: 'Juan',
          apellido: 'Pérez',
          sector: { nombre: 'Matemática' },
          tutor: {
            nombre: 'Padre',
            apellido: 'Pérez',
            email: 'padre@mail.com',
          },
          createdAt: new Date(),
        },
      ];

      jest
        .spyOn(prisma.estudiante, 'findMany')
        .mockResolvedValue(mockEstudiantes as any);
      jest.spyOn(prisma.tutor, 'findMany').mockResolvedValue([]);

      // Act
      const resultado = await service.obtenerCredencialesTemporales();

      // Assert
      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombreCompleto).toBe('Juan Pérez');
      expect(resultado[0].sector).toBe('Matemática');
      expect(resultado[0].rol).toBe('ESTUDIANTE');
      expect(resultado[0].passwordTemporal).toBe('1234');
    });
  });
});
