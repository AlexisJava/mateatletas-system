import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserLookupService } from '../user-lookup.service';
import { UserProfileService } from '../user-profile.service';
import { UserUpdateService } from '../user-update.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('UserLookupService', () => {
  let service: UserLookupService;
  let prisma: PrismaService;
  let profileService: typeof mockProfileService;
  let updateService: typeof mockUpdateService;

  const mockTutor = {
    id: 'tutor-123',
    email: 'tutor@test.com',
    username: 'tutor.test',
    nombre: 'Juan',
    apellido: 'Perez',
    password_hash: '$2b$12$hashedpassword',
    ha_completado_onboarding: true,
    dni: '12345678',
    telefono: '1234567890',
    fecha_registro: new Date(),
    roles: JSON.stringify(['tutor']),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDocente = {
    id: 'docente-123',
    email: 'docente@test.com',
    nombre: 'Maria',
    apellido: 'Garcia',
    password_hash: '$2b$12$hashedpassword',
    titulo: 'Profesora de Matematicas',
    bio: 'Experta en algebra',
    roles: JSON.stringify(['docente']),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@test.com',
    nombre: 'Carlos',
    apellido: 'Lopez',
    password_hash: '$2b$12$hashedpassword',
    fecha_registro: new Date(),
    dni: '87654321',
    telefono: '0987654321',
    mfa_enabled: false,
    mfa_secret: null,
    mfa_backup_codes: [],
    roles: JSON.stringify(['admin']),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEstudiante = {
    id: 'estudiante-123',
    username: 'estudiante.test',
    email: 'estudiante@test.com',
    nombre: 'Pedro',
    apellido: 'Martinez',
    password_hash: '$2b$12$hashedpassword',
    edad: 12,
    nivelEscolar: 'Primaria',
    tutor_id: 'tutor-123',
    equipoId: null,
    xp_total: 100,
    nivel_actual: 2,
    roles: JSON.stringify(['estudiante']),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfileService = {
    getProfile: jest.fn(),
  };

  const mockUpdateService = {
    updatePasswordHash: jest.fn(),
    updatePasswordData: jest.fn(),
    updateAdminMfaBackupCodes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLookupService,
        {
          provide: PrismaService,
          useValue: {
            tutor: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            docente: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            admin: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            estudiante: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: UserProfileService,
          useValue: mockProfileService,
        },
        {
          provide: UserUpdateService,
          useValue: mockUpdateService,
        },
      ],
    }).compile();

    service = module.get<UserLookupService>(UserLookupService);
    prisma = module.get<PrismaService>(PrismaService);
    profileService = mockProfileService;
    updateService = mockUpdateService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find tutor by email', async () => {
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as never);

      const result = await service.findByEmail('tutor@test.com');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('tutor');
      expect(result?.user.id).toBe('tutor-123');
      expect(result?.adminRef).toBeNull();
    });

    it('should find docente by email if tutor not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as never);

      const result = await service.findByEmail('docente@test.com');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('docente');
      expect(result?.user.id).toBe('docente-123');
      expect(result?.adminRef).toBeNull();
    });

    it('should find admin by email if tutor and docente not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.admin, 'findUnique')
        .mockResolvedValue(mockAdmin as never);

      const result = await service.findByEmail('admin@test.com');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('admin');
      expect(result?.user.id).toBe('admin-123');
      expect(result?.adminRef).not.toBeNull();
      expect(result?.adminRef?.id).toBe('admin-123');
    });

    it('should return null if no user found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@test.com');

      expect(result).toBeNull();
    });
  });

  describe('findEstudianteByUsername', () => {
    it('should find estudiante by username with relations', async () => {
      const estudianteWithRelations = {
        ...mockEstudiante,
        tutor: {
          id: 'tutor-123',
          nombre: 'Juan',
          apellido: 'Perez',
          email: 'tutor@test.com',
        },
        equipo: {
          id: 'equipo-1',
          nombre: 'Fenix',
          color_primario: '#FF0000',
          color_secundario: '#FFA500',
        },
      };

      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(estudianteWithRelations as never);

      const result = await service.findEstudianteByUsername('estudiante.test');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('estudiante-123');
      expect(result?.tutor).toBeDefined();
      expect(result?.equipo).toBeDefined();
    });

    it('should return null if estudiante not found', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      const result = await service.findEstudianteByUsername('noexiste');

      expect(result).toBeNull();
    });
  });

  describe('findTutorByUsername', () => {
    it('should find tutor by username', async () => {
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as never);

      const result = await service.findTutorByUsername('tutor.test');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('tutor-123');
    });

    it('should return null if tutor not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      const result = await service.findTutorByUsername('noexiste');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find estudiante first by username', async () => {
      jest
        .spyOn(prisma.estudiante, 'findUnique')
        .mockResolvedValue(mockEstudiante as never);

      const result = await service.findByUsername('estudiante.test');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('estudiante');
    });

    it('should find tutor by username if estudiante not found', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as never);

      const result = await service.findByUsername('tutor.test');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('tutor');
    });

    it('should return null if no user found by username', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      const result = await service.findByUsername('noexiste');

      expect(result).toBeNull();
    });
  });

  describe('findByIdForPasswordChange', () => {
    it('should find estudiante by ID', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'estudiante-123',
        password_hash: '$2b$12$hash',
      } as never);

      const result = await service.findByIdForPasswordChange('estudiante-123');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('estudiante');
    });

    it('should find tutor by ID if estudiante not found', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue({
        id: 'tutor-123',
        password_hash: '$2b$12$hash',
      } as never);

      const result = await service.findByIdForPasswordChange('tutor-123');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('tutor');
    });

    it('should find docente by ID if estudiante and tutor not found', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        password_hash: '$2b$12$hash',
      } as never);

      const result = await service.findByIdForPasswordChange('docente-123');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('docente');
    });

    it('should find admin by ID if others not found', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue({
        id: 'admin-123',
        password_hash: '$2b$12$hash',
      } as never);

      const result = await service.findByIdForPasswordChange('admin-123');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('admin');
    });

    it('should return null if no user found by ID', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      const result = await service.findByIdForPasswordChange('noexiste');

      expect(result).toBeNull();
    });
  });

  describe('findAdminById', () => {
    it('should find admin by ID', async () => {
      jest
        .spyOn(prisma.admin, 'findUnique')
        .mockResolvedValue(mockAdmin as never);

      const result = await service.findAdminById('admin-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('admin-123');
    });

    it('should return null if admin not found', async () => {
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(null);

      const result = await service.findAdminById('noexiste');

      expect(result).toBeNull();
    });
  });

  describe('findTutorById', () => {
    it('should find tutor by ID', async () => {
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue(mockTutor as never);

      const result = await service.findTutorById('tutor-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('tutor-123');
    });

    it('should return null if tutor not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      const result = await service.findTutorById('noexiste');

      expect(result).toBeNull();
    });
  });

  describe('getProfile (delegated to UserProfileService)', () => {
    it('should delegate to profileService and return result', async () => {
      const mockProfile = {
        id: 'tutor-123',
        email: 'tutor@test.com',
        nombre: 'Juan',
        apellido: 'Perez',
        role: 'tutor',
      };
      profileService.getProfile.mockResolvedValue(mockProfile);

      const result = await service.getProfile('tutor-123', 'tutor');

      expect(profileService.getProfile).toHaveBeenCalledWith(
        'tutor-123',
        'tutor',
      );
      expect(result).toEqual(mockProfile);
    });

    it('should propagate NotFoundException from profileService', async () => {
      profileService.getProfile.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await expect(service.getProfile('noexiste', 'tutor')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePasswordHash (delegated to UserUpdateService)', () => {
    it('should delegate to updateService', async () => {
      await service.updatePasswordHash('user-123', 'tutor', '$2b$12$newhash');

      expect(updateService.updatePasswordHash).toHaveBeenCalledWith(
        'user-123',
        'tutor',
        '$2b$12$newhash',
      );
    });
  });

  describe('updatePasswordData (delegated to UserUpdateService)', () => {
    it('should delegate to updateService', async () => {
      const updateData = {
        password_hash: '$2b$12$newhash',
        fecha_ultimo_cambio: new Date(),
      };

      await service.updatePasswordData('user-123', 'tutor', updateData);

      expect(updateService.updatePasswordData).toHaveBeenCalledWith(
        'user-123',
        'tutor',
        updateData,
      );
    });
  });

  describe('updateAdminMfaBackupCodes (delegated to UserUpdateService)', () => {
    it('should delegate to updateService', async () => {
      const newCodes = ['code1', 'code2', 'code3'];

      await service.updateAdminMfaBackupCodes('admin-123', newCodes);

      expect(updateService.updateAdminMfaBackupCodes).toHaveBeenCalledWith(
        'admin-123',
        newCodes,
      );
    });
  });

  describe('emailExistsForTutor', () => {
    it('should return true if email exists', async () => {
      jest
        .spyOn(prisma.tutor, 'findUnique')
        .mockResolvedValue({ id: 'tutor-123' } as never);

      const result = await service.emailExistsForTutor('tutor@test.com');

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      const result = await service.emailExistsForTutor('noexiste@test.com');

      expect(result).toBe(false);
    });
  });
});
