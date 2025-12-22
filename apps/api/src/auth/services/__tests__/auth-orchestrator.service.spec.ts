import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthOrchestratorService } from '../auth-orchestrator.service';
import { TutorAuthService } from '../tutor-auth.service';
import { DocenteAuthService } from '../docente-auth.service';
import { AdminAuthService } from '../admin-auth.service';
import { EstudianteAuthService } from '../estudiante-auth.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { Role } from '../../decorators/roles.decorator';

describe('AuthOrchestratorService', () => {
  let service: AuthOrchestratorService;
  let prisma: jest.Mocked<PrismaService>;
  let tutorAuth: jest.Mocked<TutorAuthService>;
  let docenteAuth: jest.Mocked<DocenteAuthService>;
  let adminAuth: jest.Mocked<AdminAuthService>;
  let estudianteAuth: jest.Mocked<EstudianteAuthService>;

  const mockTutorLoginResult = {
    access_token: 'tutor-token',
    user: {
      id: 'tutor-123',
      email: 'tutor@test.com',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '12345678',
      telefono: '+5491123456789',
      fecha_registro: new Date(),
      ha_completado_onboarding: true,
      role: Role.TUTOR,
      roles: [Role.TUTOR],
    },
  };

  const mockDocenteLoginResult = {
    access_token: 'docente-token',
    user: {
      id: 'docente-123',
      email: 'docente@test.com',
      nombre: 'María',
      apellido: 'García',
      dni: '87654321',
      telefono: '+5491198765432',
      titulo: 'Licenciada en Matemáticas',
      bio: 'Profesora',
      fecha_registro: new Date(),
      role: Role.DOCENTE,
      roles: [Role.DOCENTE],
    },
  };

  const mockAdminLoginResult = {
    access_token: 'admin-token',
    user: {
      id: 'admin-123',
      email: 'admin@test.com',
      nombre: 'Admin',
      apellido: 'User',
      fecha_registro: new Date(),
      role: Role.ADMIN,
      roles: [Role.ADMIN],
    },
  };

  const mockEstudianteLoginResult = {
    access_token: 'estudiante-token',
    user: {
      id: 'estudiante-123',
      email: 'estudiante@test.com',
      nombre: 'Pedro',
      apellido: 'Martínez',
      edad: 12,
      nivelEscolar: 'Secundaria',
      fotoUrl: null,
      avatarUrl: null,
      animacion_idle_url: null,
      xp_total: 100,
      nivel_actual: 2,
      equipo: null,
      tutor: null,
      role: Role.ESTUDIANTE,
      roles: [Role.ESTUDIANTE],
    },
  };

  beforeEach(async () => {
    const mockPrisma = {
      tutor: {
        findUnique: jest.fn(),
      },
      docente: {
        findUnique: jest.fn(),
      },
      admin: {
        findUnique: jest.fn(),
      },
    };

    const mockTutorAuth = {
      login: jest.fn(),
    };

    const mockDocenteAuth = {
      login: jest.fn(),
    };

    const mockAdminAuth = {
      login: jest.fn(),
    };

    const mockEstudianteAuth = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthOrchestratorService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TutorAuthService, useValue: mockTutorAuth },
        { provide: DocenteAuthService, useValue: mockDocenteAuth },
        { provide: AdminAuthService, useValue: mockAdminAuth },
        { provide: EstudianteAuthService, useValue: mockEstudianteAuth },
      ],
    }).compile();

    service = module.get<AuthOrchestratorService>(AuthOrchestratorService);
    prisma = module.get(PrismaService);
    tutorAuth = module.get(TutorAuthService);
    docenteAuth = module.get(DocenteAuthService);
    adminAuth = module.get(AdminAuthService);
    estudianteAuth = module.get(EstudianteAuthService);

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should delegate to TutorAuthService when email belongs to tutor', async () => {
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-123' } as any);
      tutorAuth.login.mockResolvedValue(mockTutorLoginResult);

      const result = await service.login(
        { email: 'tutor@test.com', password: 'password123' },
        '127.0.0.1',
      );

      expect(prisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { email: 'tutor@test.com' },
        select: { id: true },
      });
      expect(tutorAuth.login).toHaveBeenCalledWith(
        'tutor@test.com',
        'password123',
        '127.0.0.1',
      );
      expect(result).toEqual(mockTutorLoginResult);
    });

    it('should delegate to DocenteAuthService when email belongs to docente', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null);
      prisma.docente.findUnique.mockResolvedValue({ id: 'docente-123' } as any);
      docenteAuth.login.mockResolvedValue(mockDocenteLoginResult);

      const result = await service.login(
        { email: 'docente@test.com', password: 'password123' },
        '127.0.0.1',
      );

      expect(prisma.docente.findUnique).toHaveBeenCalledWith({
        where: { email: 'docente@test.com' },
        select: { id: true },
      });
      expect(docenteAuth.login).toHaveBeenCalledWith(
        'docente@test.com',
        'password123',
        '127.0.0.1',
      );
      expect(result).toEqual(mockDocenteLoginResult);
    });

    it('should delegate to AdminAuthService when email belongs to admin', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null);
      prisma.docente.findUnique.mockResolvedValue(null);
      prisma.admin.findUnique.mockResolvedValue({ id: 'admin-123' } as any);
      adminAuth.login.mockResolvedValue(mockAdminLoginResult);

      const result = await service.login(
        { email: 'admin@test.com', password: 'password123' },
        '127.0.0.1',
      );

      expect(prisma.admin.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' },
        select: { id: true },
      });
      expect(adminAuth.login).toHaveBeenCalledWith(
        'admin@test.com',
        'password123',
        '127.0.0.1',
      );
      expect(result).toEqual(mockAdminLoginResult);
    });

    it('should throw UnauthorizedException when email not found in any table', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null);
      prisma.docente.findUnique.mockResolvedValue(null);
      prisma.admin.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'unknown@test.com', password: 'password123' },
          '127.0.0.1',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(tutorAuth.login).not.toHaveBeenCalled();
      expect(docenteAuth.login).not.toHaveBeenCalled();
      expect(adminAuth.login).not.toHaveBeenCalled();
    });

    it('should use default IP when not provided', async () => {
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-123' } as any);
      tutorAuth.login.mockResolvedValue(mockTutorLoginResult);

      await service.login({ email: 'tutor@test.com', password: 'password123' });

      expect(tutorAuth.login).toHaveBeenCalledWith(
        'tutor@test.com',
        'password123',
        'unknown',
      );
    });

    it('should prioritize tutor over docente if same email exists in both', async () => {
      // En caso de que un email exista en múltiples tablas, se busca primero en tutor
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-123' } as any);
      tutorAuth.login.mockResolvedValue(mockTutorLoginResult);

      const result = await service.login(
        { email: 'shared@test.com', password: 'password123' },
        '127.0.0.1',
      );

      expect(result).toEqual(mockTutorLoginResult);
      expect(prisma.docente.findUnique).not.toHaveBeenCalled();
      expect(prisma.admin.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('loginEstudiante', () => {
    it('should delegate to EstudianteAuthService', async () => {
      estudianteAuth.login.mockResolvedValue(mockEstudianteLoginResult);

      const result = await service.loginEstudiante(
        { username: 'pedro.martinez', password: 'password123' },
        '127.0.0.1',
      );

      expect(estudianteAuth.login).toHaveBeenCalledWith(
        'pedro.martinez',
        'password123',
        '127.0.0.1',
      );
      expect(result).toEqual(mockEstudianteLoginResult);
    });

    it('should use default IP when not provided', async () => {
      estudianteAuth.login.mockResolvedValue(mockEstudianteLoginResult);

      await service.loginEstudiante({
        username: 'pedro.martinez',
        password: 'password123',
      });

      expect(estudianteAuth.login).toHaveBeenCalledWith(
        'pedro.martinez',
        'password123',
        'unknown',
      );
    });
  });

  describe('requiresMfa', () => {
    it('should return true for MFA required response', () => {
      const mfaResponse = {
        requires_mfa: true as const,
        mfa_token: 'token',
        message: 'Se requiere verificación MFA',
      };

      expect(service.requiresMfa(mfaResponse)).toBe(true);
    });

    it('should return false for regular login response', () => {
      expect(service.requiresMfa(mockTutorLoginResult)).toBe(false);
      expect(service.requiresMfa(mockDocenteLoginResult)).toBe(false);
      expect(service.requiresMfa(mockAdminLoginResult)).toBe(false);
    });
  });
});
