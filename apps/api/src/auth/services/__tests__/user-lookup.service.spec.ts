import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserLookupService } from '../user-lookup.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('UserLookupService', () => {
  let service: UserLookupService;
  let prisma: PrismaService;

  const mockTutor = {
    id: 'tutor-123',
    email: 'tutor@test.com',
    username: 'tutor.test',
    nombre: 'Juan',
    apellido: 'Perez',
    password_hash: '$2b$12$hashedpassword',
    password_temporal: null,
    debe_cambiar_password: false,
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
    password_temporal: null,
    debe_cambiar_password: false,
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
    password_temporal: null,
    debe_cambiar_password: false,
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
    password_temporal: null,
    debe_cambiar_password: false,
    edad: 12,
    nivelEscolar: 'Primaria',
    tutor_id: 'tutor-123',
    equipoId: null,
    puntos_totales: 100,
    nivel_actual: 2,
    roles: JSON.stringify(['estudiante']),
    createdAt: new Date(),
    updatedAt: new Date(),
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
      ],
    }).compile();

    service = module.get<UserLookupService>(UserLookupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find tutor by email', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as never);

      const result = await service.findByEmail('tutor@test.com');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('tutor');
      expect(result?.user.id).toBe('tutor-123');
      expect(result?.adminRef).toBeNull();
    });

    it('should find docente by email if tutor not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as never);

      const result = await service.findByEmail('docente@test.com');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('docente');
      expect(result?.user.id).toBe('docente-123');
      expect(result?.adminRef).toBeNull();
    });

    it('should find admin by email if tutor and docente not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(mockAdmin as never);

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
        tutor: { id: 'tutor-123', nombre: 'Juan', apellido: 'Perez', email: 'tutor@test.com' },
        equipo: { id: 'equipo-1', nombre: 'Fenix', color_primario: '#FF0000', color_secundario: '#FFA500' },
      };

      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(estudianteWithRelations as never);

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
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as never);

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
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as never);

      const result = await service.findByUsername('estudiante.test');

      expect(result).not.toBeNull();
      expect(result?.userType).toBe('estudiante');
    });

    it('should find tutor by username if estudiante not found', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as never);

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
        password_temporal: null,
        debe_cambiar_password: false,
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
        password_temporal: null,
        debe_cambiar_password: false,
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
        password_temporal: null,
        debe_cambiar_password: false,
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
        password_temporal: null,
        debe_cambiar_password: false,
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
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue(mockAdmin as never);

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
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(mockTutor as never);

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

  describe('getProfile', () => {
    it('should get tutor profile', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue({
        id: 'tutor-123',
        email: 'tutor@test.com',
        nombre: 'Juan',
        apellido: 'Perez',
        dni: '12345678',
        telefono: '1234567890',
        fecha_registro: new Date(),
        ha_completado_onboarding: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        debe_cambiar_password: false,
      } as never);

      const result = await service.getProfile('tutor-123', 'tutor');

      expect(result).toBeDefined();
      expect(result.role).toBe('tutor');
    });

    it('should get docente profile', async () => {
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue({
        id: 'docente-123',
        email: 'docente@test.com',
        nombre: 'Maria',
        apellido: 'Garcia',
        titulo: 'Profesora',
        bio: 'Bio',
        createdAt: new Date(),
        updatedAt: new Date(),
        debe_cambiar_password: false,
      } as never);

      const result = await service.getProfile('docente-123', 'docente');

      expect(result).toBeDefined();
      expect(result.role).toBe('docente');
    });

    it('should get admin profile', async () => {
      jest.spyOn(prisma.admin, 'findUnique').mockResolvedValue({
        id: 'admin-123',
        email: 'admin@test.com',
        nombre: 'Carlos',
        apellido: 'Lopez',
        fecha_registro: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const result = await service.getProfile('admin-123', 'admin');

      expect(result).toBeDefined();
      expect(result.role).toBe('admin');
    });

    it('should get estudiante profile', async () => {
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue({
        id: 'estudiante-123',
        email: 'estudiante@test.com',
        nombre: 'Pedro',
        apellido: 'Martinez',
        edad: 12,
        nivelEscolar: 'Primaria',
        fotoUrl: null,
        puntos_totales: 100,
        nivel_actual: 2,
        equipoId: null,
        tutor_id: 'tutor-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        debe_cambiar_password: false,
      } as never);

      const result = await service.getProfile('estudiante-123', 'estudiante');

      expect(result).toBeDefined();
      expect(result.role).toBe('estudiante');
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue(null);

      await expect(service.getProfile('noexiste', 'tutor')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePasswordHash', () => {
    it('should update estudiante password hash', async () => {
      const updateSpy = jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({} as never);

      await service.updatePasswordHash('estudiante-123', 'estudiante', '$2b$12$newhash');

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'estudiante-123' },
        data: { password_hash: '$2b$12$newhash' },
      });
    });

    it('should update tutor password hash', async () => {
      const updateSpy = jest.spyOn(prisma.tutor, 'update').mockResolvedValue({} as never);

      await service.updatePasswordHash('tutor-123', 'tutor', '$2b$12$newhash');

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
        data: { password_hash: '$2b$12$newhash' },
      });
    });

    it('should update docente password hash', async () => {
      const updateSpy = jest.spyOn(prisma.docente, 'update').mockResolvedValue({} as never);

      await service.updatePasswordHash('docente-123', 'docente', '$2b$12$newhash');

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
        data: { password_hash: '$2b$12$newhash' },
      });
    });

    it('should update admin password hash', async () => {
      const updateSpy = jest.spyOn(prisma.admin, 'update').mockResolvedValue({} as never);

      await service.updatePasswordHash('admin-123', 'admin', '$2b$12$newhash');

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: { password_hash: '$2b$12$newhash' },
      });
    });
  });

  describe('updatePasswordData', () => {
    const updateData = {
      password_hash: '$2b$12$newhash',
      password_temporal: null as null,
      debe_cambiar_password: false as false,
      fecha_ultimo_cambio: new Date(),
    };

    it('should update estudiante password data', async () => {
      const updateSpy = jest.spyOn(prisma.estudiante, 'update').mockResolvedValue({} as never);

      await service.updatePasswordData('estudiante-123', 'estudiante', updateData);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'estudiante-123' },
        data: updateData,
      });
    });

    it('should update tutor password data', async () => {
      const updateSpy = jest.spyOn(prisma.tutor, 'update').mockResolvedValue({} as never);

      await service.updatePasswordData('tutor-123', 'tutor', updateData);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
        data: updateData,
      });
    });
  });

  describe('updateAdminMfaBackupCodes', () => {
    it('should update admin MFA backup codes', async () => {
      const updateSpy = jest.spyOn(prisma.admin, 'update').mockResolvedValue({} as never);
      const newCodes = ['code1', 'code2', 'code3'];

      await service.updateAdminMfaBackupCodes('admin-123', newCodes);

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        data: { mfa_backup_codes: newCodes },
      });
    });
  });

  describe('emailExistsForTutor', () => {
    it('should return true if email exists', async () => {
      jest.spyOn(prisma.tutor, 'findUnique').mockResolvedValue({ id: 'tutor-123' } as never);

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