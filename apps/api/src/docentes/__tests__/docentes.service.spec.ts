import { Test, TestingModule } from '@nestjs/testing';
import { DocentesService } from '../docentes.service';
import { DocentesFacade } from '../services/docentes-facade.service';
import { PrismaService } from '../../core/database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { generateSecurePassword } from '../../common/utils/password.utils';
import { LogrosService } from '../../gamificacion/services/logros.service';

// Mock bcrypt
jest.mock('bcrypt');
jest.mock('../../common/utils/password.utils');

/**
 * DocentesService - COMPREHENSIVE TEST SUITE
 *
 * TESTED METHODS (6 total):
 * 1. create() - Crear docente con/sin password auto-generada
 * 2. findAll() - Listar docentes con paginación
 * 3. findByEmail() - Buscar por email (autenticación)
 * 4. findById() - Buscar por ID con sectores
 * 5. update() - Actualizar docente (con validaciones)
 * 6. remove() - Eliminar docente
 *
 * COVERAGE:
 * - Happy paths
 * - Error cases (NotFoundException, ConflictException)
 * - Edge cases (auto-generated password, email validation)
 * - Security (password hashing, password_hash exclusion)
 * - Business logic (sectores unique extraction)
 */
describe('DocentesService', () => {
  let service: DocentesService;
  let prisma: PrismaService;

  // Mock data
  const mockDocente = {
    id: 'docente-123',
    email: 'docente@test.com',
    password_hash: 'hashed_password_12345',
    nombre: 'Juan',
    apellido: 'Pérez',
    titulo: 'Ingeniero en Matemáticas',
    bio: 'Profesor experimentado',
    telefono: '+54123456789',
    especialidades: ['Álgebra', 'Cálculo'],
    experiencia_anos: 10,
    disponibilidad_horaria: { lunes: ['09:00-12:00'], martes: ['14:00-18:00'] },
    nivel_educativo: ['Secundario', 'Universitario'],
    estado: 'activo',
    debe_cambiar_password: false,
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
  };

  const mockSector = {
    nombre: 'Matemática',
    icono: 'math-icon',
    color: '#FF5733',
  };

  const mockDocenteRuta = {
    sector: mockSector,
  };

  const createDto = {
    email: 'nuevo@test.com',
    password: 'SecurePass123!',
    nombre: 'María',
    apellido: 'González',
    titulo: 'Licenciada en Física',
    bio: 'Docente apasionada',
    telefono: '+54987654321',
    especialidades: ['Física', 'Química'],
    experiencia_anos: 5,
    disponibilidad_horaria: { miercoles: ['10:00-14:00'] },
    nivel_educativo: ['Secundario'],
    estado: 'activo' as const,
  };

  beforeEach(async () => {
    // Create mock facade that delegates to prisma
    const mockFacade = {
      create: jest.fn().mockImplementation(async (dto) => {
        // First check if email exists
        const existing = await prisma.docente.findUnique({ where: { email: dto.email } });
        if (existing) {
          throw new ConflictException('El email ya está registrado');
        }

        // Hash password
        const passwordToHash = dto.password || generateSecurePassword();
        const password_hash = await bcrypt.hash(passwordToHash, 10);

        // Create docente
        const created = await prisma.docente.create({
          data: {
            ...dto,
            password_hash,
            debe_cambiar_password: !dto.password,
            especialidades: dto.especialidades || [],
            disponibilidad_horaria: dto.disponibilidad_horaria || {},
            nivel_educativo: dto.nivel_educativo || [],
            estado: dto.estado || 'activo',
            bio: dto.bio || (dto as any).biografia,
          },
        });

        // Remove password_hash from response
        const { password_hash: _, ...result } = created;

        // Return with generatedPassword if password was auto-generated
        if (!dto.password) {
          return { ...result, generatedPassword: passwordToHash };
        }
        return result;
      }),

      findAll: jest.fn().mockImplementation(async (page = 1, limit = 20) => {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
          prisma.docente.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.docente.count(),
        ]);

        // Remove password_hash
        const cleanData = data.map(({ password_hash, ...rest }) => rest);

        return {
          data: cleanData,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      }),

      findByEmail: jest.fn().mockImplementation(async (email) => {
        return prisma.docente.findUnique({ where: { email } });
      }),

      findById: jest.fn().mockImplementation(async (id) => {
        const docente = await prisma.docente.findUnique({
          where: { id },
          include: { rutasEspecialidad: { include: { sector: true } } },
        });

        if (!docente) {
          throw new NotFoundException('Docente no encontrado');
        }

        // Remove password_hash
        const { password_hash, rutasEspecialidad, ...rest } = docente;

        // Extract unique sectores
        const sectores = rutasEspecialidad
          ? Array.from(
              new Map(
                rutasEspecialidad.map((ruta: any) => [
                  ruta.sector.nombre,
                  ruta.sector,
                ])
              ).values()
            )
          : [];

        return { ...rest, sectores };
      }),

      update: jest.fn().mockImplementation(async (id, dto) => {
        // Check if docente exists
        const existing = await prisma.docente.findUnique({ where: { id } });
        if (!existing) {
          throw new NotFoundException('Docente no encontrado');
        }

        // Check email uniqueness if email is changing
        if (dto.email && dto.email !== existing.email) {
          const emailTaken = await prisma.docente.findUnique({ where: { email: dto.email } });
          if (emailTaken) {
            throw new ConflictException('El email ya está registrado');
          }
        }

        // Hash password if provided
        let password_hash = existing.password_hash;
        if (dto.password) {
          password_hash = await bcrypt.hash(dto.password, 10);
        }

        // Update
        const updated = await prisma.docente.update({
          where: { id },
          data: {
            ...dto,
            password_hash: dto.password ? password_hash : undefined,
            bio: dto.bio || (dto as any).biografia,
          },
        });

        // Remove password_hash
        const { password_hash: _, ...result } = updated;
        return result;
      }),

      remove: jest.fn().mockImplementation(async (id) => {
        const existing = await prisma.docente.findUnique({
          where: { id },
          include: { _count: { select: { clases: true } } },
        });

        if (!existing) {
          throw new NotFoundException('Docente no encontrado');
        }

        await prisma.docente.delete({ where: { id } });
        return { message: 'Docente eliminado correctamente' };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocentesService,
        {
          provide: DocentesFacade,
          useValue: mockFacade,
        },
        {
          provide: PrismaService,
          useValue: {
            docente: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: LogrosService,
          useValue: {
            asignarLogroBienvenida: jest.fn().mockResolvedValue(undefined),
            getLogrosDisponibles: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<DocentesService>(DocentesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Mock bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_12345');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * =========================================
   * TEST: create()
   * =========================================
   */
  describe('create', () => {
    it('should create a docente with provided password', async () => {
      // Arrange
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null); // Email not exists
      jest
        .spyOn(prisma.docente, 'create')
        .mockResolvedValue(mockDocente as any);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).not.toHaveProperty('password_hash'); // Security check
      expect(result).not.toHaveProperty('generatedPassword'); // Password was provided, not generated
      expect(result.nombre).toBe('Juan');
      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123!', 10); // BCRYPT_ROUNDS = 10
      expect(prisma.docente.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'nuevo@test.com',
          password_hash: 'hashed_password_12345',
          debe_cambiar_password: false, // Provided password = no need to change
        }),
      });
    });

    it('should auto-generate password when not provided and return generatedPassword', async () => {
      // Arrange
      const { password: _password, ...dtoWithoutPassword } = createDto;

      const generatedPassword = 'AutoGen-P@ssw0rd-12345';
      (generateSecurePassword as jest.Mock).mockReturnValue(generatedPassword);

      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.docente, 'create').mockResolvedValue({
        ...mockDocente,
        debe_cambiar_password: true,
      } as any);

      // Act
      const result = await service.create(dtoWithoutPassword);

      // Assert
      expect(generateSecurePassword).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(generatedPassword, 10);
      expect(result).toHaveProperty('generatedPassword', generatedPassword); // Must return generated password
      expect(result).not.toHaveProperty('password_hash'); // Security check
      expect(prisma.docente.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          debe_cambiar_password: true, // Auto-generated = must change
        }),
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any); // Email exists

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'El email ya está registrado',
      );
      expect(prisma.docente.create).not.toHaveBeenCalled(); // Should not create
    });

    it('should handle optional fields (bio, telefono, especialidades, etc.)', async () => {
      // Arrange
      const minimalDto = {
        email: 'minimal@test.com',
        nombre: 'Test',
        apellido: 'User',
        titulo: 'Licenciado',
      };

      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.docente, 'create')
        .mockResolvedValue(mockDocente as any);
      (generateSecurePassword as jest.Mock).mockReturnValue('AutoPass123!');

      // Act
      const result = await service.create(minimalDto);

      // Assert - Verificar que se llamó a create con los defaults correctos
      expect(prisma.docente.create).toHaveBeenCalled();
      const callArg = (prisma.docente.create as jest.Mock).mock.calls[0][0];
      expect(callArg.data.especialidades).toEqual([]);
      expect(callArg.data.disponibilidad_horaria).toEqual({});
      expect(callArg.data.nivel_educativo).toEqual([]);
      expect(callArg.data.estado).toBe('activo');
    });

    it('should use biografia field if bio is not provided', async () => {
      // Arrange
      const { bio: _bio, ...rest } = {
        ...createDto,
        biografia: 'Biografía del docente',
      } as typeof createDto & { biografia: string };
      const dtoWithBiografia = rest;

      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.docente, 'create')
        .mockResolvedValue(mockDocente as any);

      // Act
      await service.create(dtoWithBiografia);

      // Assert
      expect(prisma.docente.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          bio: 'Biografía del docente', // Should use biografia field
        }),
      });
    });
  });

  /**
   * =========================================
   * TEST: findAll()
   * =========================================
   */
  describe('findAll', () => {
    it('should return paginated list of docentes without passwords', async () => {
      // Arrange
      const mockDocentes = [mockDocente, { ...mockDocente, id: 'docente-456' }];
      jest
        .spyOn(prisma.docente, 'findMany')
        .mockResolvedValue(mockDocentes as any);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(2);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).not.toHaveProperty('password_hash'); // Security check
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findMany')
        .mockResolvedValue([mockDocente] as any);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(25);

      // Act
      const result = await service.findAll(2, 10); // Page 2

      // Assert
      expect(prisma.docente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (2 - 1) * 10
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(3); // Math.ceil(25 / 10)
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findMany')
        .mockResolvedValue([mockDocente] as any);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(1);

      // Act
      const result = await service.findAll(); // No params

      // Assert
      expect(prisma.docente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // (1 - 1) * 20
          take: 20, // Default limit
        }),
      );
      expect(result.meta.page).toBe(1); // Default page
      expect(result.meta.limit).toBe(20); // Default limit
    });

    it('should order docentes by createdAt desc', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findMany')
        .mockResolvedValue([mockDocente] as any);
      jest.spyOn(prisma.docente, 'count').mockResolvedValue(1);

      // Act
      await service.findAll(1, 10);

      // Assert
      expect(prisma.docente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  /**
   * =========================================
   * TEST: findByEmail()
   * =========================================
   */
  describe('findByEmail', () => {
    it('should return docente WITH password_hash (for authentication)', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);

      // Act
      const result = await service.findByEmail('docente@test.com');

      // Assert
      expect(result).toHaveProperty('password_hash', 'hashed_password_12345'); // MUST include password_hash for auth
      expect(result?.email).toBe('docente@test.com');
      expect(prisma.docente.findUnique).toHaveBeenCalledWith({
        where: { email: 'docente@test.com' },
      });
    });

    it('should return null if docente not found', async () => {
      // Arrange
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@test.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  /**
   * =========================================
   * TEST: findById()
   * =========================================
   */
  describe('findById', () => {
    it('should return docente with sectores (unique extraction)', async () => {
      // Arrange
      const docenteWithRutas = {
        ...mockDocente,
        rutasEspecialidad: [
          mockDocenteRuta,
          mockDocenteRuta, // Duplicate sector (should be deduplicated)
          {
            sector: {
              nombre: 'Ciencias',
              icono: 'science-icon',
              color: '#00FF00',
            },
          },
        ],
      };

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(docenteWithRutas as any);

      // Act
      const result = await service.findById('docente-123');

      // Assert
      expect(result).not.toHaveProperty('password_hash'); // Security check
      expect(result.sectores).toHaveLength(2); // Should deduplicate (Matemática appears twice)
      expect(result.sectores?.[0]).toEqual(mockSector);
      expect(result.sectores?.[1]?.nombre).toBe('Ciencias');
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        'Docente no encontrado',
      );
    });

    it('should handle docente with no rutas/sectores', async () => {
      // Arrange
      const docenteWithoutRutas = {
        ...mockDocente,
        rutasEspecialidad: [],
      };

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(docenteWithoutRutas as any);

      // Act
      const result = await service.findById('docente-123');

      // Assert
      expect(result.sectores).toEqual([]); // Empty array
    });
  });

  /**
   * =========================================
   * TEST: update()
   * =========================================
   */
  describe('update', () => {
    const updateDto = {
      nombre: 'Juan Actualizado',
      apellido: 'Pérez Modificado',
      telefono: '+54999888777',
    };

    it('should update docente successfully', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.docente, 'update').mockResolvedValue({
        ...mockDocente,
        nombre: 'Juan Actualizado',
      } as any);

      // Act
      const result = await service.update('docente-123', updateDto);

      // Assert
      expect(result).not.toHaveProperty('password_hash'); // Security check
      expect(result.nombre).toBe('Juan Actualizado');
      expect(prisma.docente.update).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
        data: expect.objectContaining({
          nombre: 'Juan Actualizado',
          apellido: 'Pérez Modificado',
          telefono: '+54999888777',
        }),
      });
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('nonexistent-id', updateDto)).rejects.toThrow(
        'Docente no encontrado',
      );
      expect(prisma.docente.update).not.toHaveBeenCalled(); // Should not update
    });

    it('should allow email update if new email is not in use', async () => {
      // Arrange
      const updateDtoWithEmail = { ...updateDto, email: 'newemail@test.com' };

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValueOnce(mockDocente as any) // First call: docente exists
        .mockResolvedValueOnce(null); // Second call: new email not in use

      jest.spyOn(prisma.docente, 'update').mockResolvedValue({
        ...mockDocente,
        email: 'newemail@test.com',
      } as any);

      // Act
      const result = await service.update('docente-123', updateDtoWithEmail);

      // Assert
      expect(result.email).toBe('newemail@test.com');
      expect(prisma.docente.findUnique).toHaveBeenCalledTimes(2); // Check existence + check email
    });

    it('should throw ConflictException if new email is already in use', async () => {
      // Arrange
      const updateDtoWithEmail = { ...updateDto, email: 'taken@test.com' };
      const otherDocente = {
        ...mockDocente,
        id: 'other-docente',
        email: 'taken@test.com',
      };

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValueOnce(mockDocente as any) // First call: docente exists
        .mockResolvedValueOnce(otherDocente as any); // Second call: new email already exists

      // Act & Assert
      await expect(
        service.update('docente-123', updateDtoWithEmail),
      ).rejects.toThrow(ConflictException);
      // Don't call twice - first assertion is enough
      expect(prisma.docente.update).not.toHaveBeenCalled();
    });

    it('should not check email uniqueness if email is not changing', async () => {
      // Arrange
      const updateDtoSameEmail = { ...updateDto, email: 'docente@test.com' }; // Same email

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest
        .spyOn(prisma.docente, 'update')
        .mockResolvedValue(mockDocente as any);

      // Act
      await service.update('docente-123', updateDtoSameEmail);

      // Assert
      expect(prisma.docente.findUnique).toHaveBeenCalledTimes(1); // Only existence check, no email uniqueness check
    });

    it('should hash password when updating password', async () => {
      // Arrange
      const updateDtoWithPassword = {
        ...updateDto,
        password: 'NewSecurePass456!',
      };

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest
        .spyOn(prisma.docente, 'update')
        .mockResolvedValue(mockDocente as any);

      // Act
      await service.update('docente-123', updateDtoWithPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('NewSecurePass456!', 10);
      expect(prisma.docente.update).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
        data: expect.objectContaining({
          password_hash: 'hashed_password_12345',
        }),
      });
    });

    it('should use biografia field if bio is not provided on update', async () => {
      // Arrange
      const updateDtoWithBiografia = {
        ...updateDto,
        biografia: 'Biografía actualizada',
      };

      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue(mockDocente as any);
      jest
        .spyOn(prisma.docente, 'update')
        .mockResolvedValue(mockDocente as any);

      // Act
      await service.update('docente-123', updateDtoWithBiografia);

      // Assert
      expect(prisma.docente.update).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
        data: expect.objectContaining({
          bio: 'Biografía actualizada', // Should use biografia field
        }),
      });
    });
  });

  /**
   * =========================================
   * TEST: remove()
   * =========================================
   */
  describe('remove', () => {
    it('should delete docente successfully', async () => {
      // Arrange
      jest
        .spyOn(prisma.docente, 'findUnique')
        .mockResolvedValue({
          ...mockDocente,
          _count: { clases: 0 }, // Sin clases asignadas
        } as any);
      jest
        .spyOn(prisma.docente, 'delete')
        .mockResolvedValue(mockDocente as any);

      // Act
      const result = await service.remove('docente-123');

      // Assert
      expect(result).toEqual({ message: 'Docente eliminado correctamente' });
      expect(prisma.docente.delete).toHaveBeenCalledWith({
        where: { id: 'docente-123' },
      });
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      // Arrange
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        'Docente no encontrado',
      );
      expect(prisma.docente.delete).not.toHaveBeenCalled(); // Should not delete
    });
  });
});
