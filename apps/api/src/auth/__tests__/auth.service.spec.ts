import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../core/database/prisma.service';
import { Role } from '../decorators/roles.decorator';

/**
 * AuthService - COMPREHENSIVE TESTS
 *
 * COVERAGE:
 * - register(): Happy path + duplicate email
 * - loginEstudiante(): Happy path + invalid credentials + missing password
 * - login(): Tutor, docente, admin + invalid credentials
 * - validateUser(): Valid + invalid password + non-existent
 * - getProfile(): All roles (tutor, docente, admin, estudiante)
 * - generateJwtToken(): Token structure validation
 *
 * SECURITY:
 * - Password hashing con bcrypt
 * - Exclusión de password_hash en responses
 * - Multi-rol support en JWT tokens
 */

// Mock bcrypt globally to avoid "Cannot redefine property" errors
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService - COMPREHENSIVE TESTS', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Mock data
  const mockTutor = {
    id: 'tutor-123',
    email: 'tutor@test.com',
    password_hash: 'hashed_password',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    telefono: '555-1234',
    fecha_registro: new Date('2025-01-01'),
    ha_completado_onboarding: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: null,
    debe_cambiar_password: false,
  };

  const mockDocente = {
    id: 'docente-123',
    email: 'docente@test.com',
    password_hash: 'hashed_password',
    nombre: 'María',
    apellido: 'González',
    titulo: 'Profesora de Matemáticas',
    bio: 'Especialista en álgebra',
    debe_cambiar_password: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: null,
  };

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@test.com',
    password_hash: 'hashed_password',
    nombre: 'Admin',
    apellido: 'Sistema',
    fecha_registro: new Date('2025-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: null,
  };

  const mockEstudiante = {
    id: 'est-123',
    email: 'estudiante@test.com',
    username: 'pedro.martinez',
    password_hash: 'hashed_password',
    nombre: 'Pedro',
    apellido: 'Martínez',
    edad: 10,
    nivel_escolar: '5to Primaria',
    foto_url: 'https://example.com/foto.jpg',
    puntos_totales: 150,
    nivel_actual: 5,
    tutor_id: 'tutor-123',
    equipo_id: 'equipo-123',
    tutor: {
      id: 'tutor-123',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'tutor@test.com',
    },
    equipo: {
      id: 'equipo-123',
      nombre: 'Los Tigres',
      color_primario: '#FF5722',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: null,
    debe_cambiar_password: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            tutor: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            docente: {
              findUnique: jest.fn(),
            },
            admin: {
              findUnique: jest.fn(),
            },
            estudiante: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_jwt_token'),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register - Registro de Tutores', () => {
    it('should register a new tutor successfully', async () => {
      // Arrange
      const registerDto = {
        email: 'nuevo@test.com',
        password: 'Password123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
        dni: '87654321',
        telefono: '555-9999',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      jest.spyOn(prisma.tutor, 'create').mockResolvedValue({
        id: 'new-tutor-id',
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        dni: registerDto.dni,
        telefono: registerDto.telefono,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.message).toBe('Tutor registrado exitosamente');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.nombre).toBe(registerDto.nombre);
      expect(result.user.role).toBe(Role.Tutor);
      expect(prisma.tutor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: registerDto.email,
            nombre: registerDto.nombre,
            apellido: registerDto.apellido,
          }),
        }),
      );
    });

    it('should hash password with bcrypt during registration', async () => {
      // Arrange
      const registerDto = {
        email: 'nuevo@test.com',
        password: 'PlainTextPassword123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      jest.spyOn(prisma.tutor, 'create').mockResolvedValue({
        id: 'new-tutor-id',
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      await service.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('PlainTextPassword123!', 10);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@test.com',
        password: 'Password123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
      };

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'El email ya está registrado',
      );
      expect(prisma.tutor.create).not.toHaveBeenCalled();
    });

    it('should handle optional fields (dni, telefono) correctly', async () => {
      // Arrange
      const registerDto = {
        email: 'nuevo@test.com',
        password: 'Password123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
        // dni y telefono omitidos
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      jest.spyOn(prisma.tutor, 'create').mockResolvedValue({
        id: 'new-tutor-id',
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        dni: null,
        telefono: null,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(prisma.tutor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dni: null,
            telefono: null,
          }),
        }),
      );
    });
  });

  describe('loginEstudiante - Login de Estudiantes', () => {
    it('should login estudiante successfully with valid credentials', async () => {
      // Arrange
      const loginDto = {
        email: 'estudiante@test.com',
        password: 'EstudiantePass123!',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.loginEstudiante(loginDto);

      // Assert
      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe(mockEstudiante.email);
      expect(result.user.nombre).toBe(mockEstudiante.nombre);
      expect(result.user.role).toBe(Role.Estudiante);
      expect(result.user.equipo).toEqual(mockEstudiante.equipo);
      expect(result.user.tutor).toEqual(mockEstudiante.tutor);
    });

    it('should throw UnauthorizedException when estudiante does not exist', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@test.com',
        password: 'Password123!',
      };

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.loginEstudiante(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.loginEstudiante(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    it('should throw UnauthorizedException when estudiante has no password configured', async () => {
      // Arrange
      const loginDto = {
        email: 'estudiante@test.com',
        password: 'Password123!',
      };

      const estudianteSinPassword = {
        ...mockEstudiante,
        password_hash: null, // No password configured
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudianteSinPassword as any);

      // Act & Assert
      await expect(service.loginEstudiante(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const loginDto = {
        email: 'estudiante@test.com',
        password: 'WrongPassword123!',
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.loginEstudiante(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use default role "estudiante" when roles array is empty', async () => {
      // Arrange
      const loginDto = {
        email: 'estudiante@test.com',
        password: 'EstudiantePass123!',
      };

      const estudianteConRolesVacios = {
        ...mockEstudiante,
        roles: '[]', // Empty roles array
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudianteConRolesVacios as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await service.loginEstudiante(loginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockEstudiante.id,
          email: mockEstudiante.username, // loginEstudiante uses username as email
          roles: [Role.Estudiante],
        }),
      );
    });
  });

  describe('login - Login de Tutor/Docente/Admin', () => {
    it('should login tutor successfully', async () => {
      // Arrange
      const loginDto = {
        email: 'tutor@test.com',
        password: 'TutorPass123!',
      };

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe(mockTutor.email);
      expect(result.user.role).toBe(Role.Tutor);
      expect('dni' in result.user && result.user.dni).toBe(mockTutor.dni);
    });

    it('should login docente successfully', async () => {
      // Arrange
      const loginDto = {
        email: 'docente@test.com',
        password: 'DocentePass123!',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe(mockDocente.email);
      expect(result.user.role).toBe(Role.Docente);
      expect('titulo' in result.user && result.user.titulo).toBe(
        mockDocente.titulo,
      );
    });

    it('should login admin successfully', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'AdminPass123!',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.admin, 'findUnique')
        .mockResolvedValue(mockAdmin as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe(mockAdmin.email);
      expect(result.user.role).toBe(Role.Admin);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@test.com',
        password: 'Password123!',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Arrange
      const loginDto = {
        email: 'tutor@test.com',
        password: 'WrongPassword123!',
      };

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should generate JWT with multi-role support', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'AdminPass123!',
      };

      const adminConMultiplesRoles = {
        ...mockAdmin,
        roles: '["admin", "docente"]', // Multiple roles
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.admin, 'findUnique')
        .mockResolvedValue(adminConMultiplesRoles as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await service.login(loginDto);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockAdmin.id,
          email: mockAdmin.email,
          roles: [Role.Admin, Role.Docente],
        }),
      );
    });
  });

  describe('validateUser - Validación Auxiliar', () => {
    it('should return tutor data (without password) when credentials are valid', async () => {
      // Arrange
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(
        'tutor@test.com',
        'CorrectPassword123!',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe(mockTutor.email);
      expect(result).not.toHaveProperty('password_hash'); // Security: no password in response
    });

    it('should return null when tutor does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.validateUser(
        'nonexistent@test.com',
        'Password123!',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      // Arrange
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(
        'tutor@test.com',
        'WrongPassword123!',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null and log error when database error occurs', async () => {
      // Arrange
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockRejectedValue(new Error('Database connection failed'));
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

      // Act
      const result = await service.validateUser(
        'tutor@test.com',
        'Password123!',
      );

      // Assert
      expect(result).toBeNull();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error en validateUser',
        expect.any(String),
      );

      loggerErrorSpy.mockRestore();
    });
  });

  describe('getProfile - Obtener Perfil por Rol', () => {
    it('should return tutor profile', async () => {
      // Arrange
      // Mock debe excluir password_hash (el servicio usa select en Prisma)
      const { password_hash, ...tutorSinPassword } = mockTutor;
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(tutorSinPassword as any);

      // Act
      const result = await service.getProfile('tutor-123', Role.Tutor);

      // Assert
      expect(result.email).toBe(mockTutor.email);
      expect(result.role).toBe(Role.Tutor);
      expect(result).not.toHaveProperty('password_hash'); // Security
    });

    it('should return docente profile', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);

      // Act
      const result = await service.getProfile('docente-123', Role.Docente);

      // Assert
      expect(result.email).toBe(mockDocente.email);
      expect(result.role).toBe(Role.Docente);
      expect((result as any).titulo).toBe(mockDocente.titulo);
    });

    it('should return admin profile', async () => {
      // Arrange
      jest
        .spyOn(prisma.admin, 'findUnique')
        .mockResolvedValue(mockAdmin as any);

      // Act
      const result = await service.getProfile('admin-123', Role.Admin);

      // Assert
      expect(result.email).toBe(mockAdmin.email);
      expect(result.role).toBe(Role.Admin);
    });

    it('should return estudiante profile', async () => {
      // Arrange
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as any);

      // Act
      const result = await service.getProfile('est-123', Role.Estudiante);

      // Assert
      expect(result.email).toBe(mockEstudiante.email);
      expect(result.role).toBe(Role.Estudiante);
      expect((result as any).puntos_totales).toBe(150);
    });

    it('should throw NotFoundException when tutor not found', async () => {
      // Arrange
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getProfile('nonexistent-id', Role.Tutor),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getProfile('nonexistent-id', Role.Tutor),
      ).rejects.toThrow('Tutor no encontrado');
    });

    it('should throw NotFoundException when docente not found', async () => {
      // Arrange
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getProfile('nonexistent-id', Role.Docente),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when admin not found', async () => {
      // Arrange
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getProfile('nonexistent-id', Role.Admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when estudiante not found', async () => {
      // Arrange
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getProfile('nonexistent-id', Role.Estudiante),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Security - Password Handling', () => {
    it('should NEVER return password_hash in register response', async () => {
      // Arrange
      const registerDto = {
        email: 'nuevo@test.com',
        password: 'Password123!',
        nombre: 'Nuevo',
        apellido: 'Usuario',
      };

      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      jest.spyOn(prisma.tutor, 'create').mockResolvedValue({
        id: 'new-tutor-id',
        email: registerDto.email,
        nombre: registerDto.nombre,
        apellido: registerDto.apellido,
        fecha_registro: new Date(),
        ha_completado_onboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should NEVER return password_hash in login response', async () => {
      // Arrange
      const loginDto = {
        email: 'tutor@test.com',
        password: 'TutorPass123!',
      };

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result.user).not.toHaveProperty('password_hash');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should use bcrypt.compare for password validation (not plain comparison)', async () => {
      // Arrange
      const loginDto = {
        email: 'tutor@test.com',
        password: 'TutorPass123!',
      };

      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      await service.login(loginDto);

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'TutorPass123!',
        mockTutor.password_hash,
      );
    });
  });
});
