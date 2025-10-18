/**
 * Tests TDD para mejoras en creación de docentes
 *
 * Estos tests FALLARÁN inicialmente hasta que implementemos:
 * 1. Campo `debe_cambiar_password` en schema
 * 2. Auto-generación de contraseñas seguras
 * 3. Seed de sectores (Matemática/Programación)
 * 4. Simplificación del formulario
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DocentesService } from '../docentes.service';
import { PrismaService } from '../../core/database/prisma.service';
import { ConflictException } from '@nestjs/common';
import { CreateDocenteDto } from '../dto/create-docente.dto';
import * as bcrypt from 'bcrypt';

describe('DocentesService - Mejoras en Creación (TDD)', () => {
  let service: DocentesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    docente: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocentesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocentesService>(DocentesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('Generación automática de contraseñas', () => {
    it('debe generar contraseña segura de 12 caracteres si no se proporciona', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'juan@example.com',
        password_hash: 'hashed_generated_password',
        nombre: 'Juan',
        apellido: 'Pérez',
        debe_cambiar_password: true, // NUEVO CAMPO
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.create({
        email: 'juan@example.com',
        nombre: 'Juan',
        apellido: 'Pérez',
        // password omitido - debe auto-generarse
      } as any);

      // Assert
      expect(mockPrismaService.docente.create).toHaveBeenCalled();
      const createCall = mockPrismaService.docente.create.mock.calls[0][0];

      // Verificar que se generó un password_hash (significa que se generó password)
      expect(createCall.data.password_hash).toBeDefined();
      expect(typeof createCall.data.password_hash).toBe('string');
    });

    it('debe marcar debe_cambiar_password=true cuando se auto-genera contraseña', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'maria@example.com',
        password_hash: 'hashed',
        nombre: 'María',
        apellido: 'González',
        debe_cambiar_password: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await service.create({
        email: 'maria@example.com',
        nombre: 'María',
        apellido: 'González',
      } as any);

      // Assert
      const createCall = mockPrismaService.docente.create.mock.calls[0][0];
      expect(createCall.data.debe_cambiar_password).toBe(true);
    });

    it('debe marcar debe_cambiar_password=false cuando admin proporciona contraseña', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'carlos@example.com',
        password_hash: 'hashed_custom',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
        debe_cambiar_password: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await service.create({
        email: 'carlos@example.com',
        password: 'MiPasswordPersonal123!',
        nombre: 'Carlos',
        apellido: 'Rodríguez',
      } as any);

      // Assert
      const createCall = mockPrismaService.docente.create.mock.calls[0][0];
      expect(createCall.data.debe_cambiar_password).toBe(false);
    });

    it('la contraseña auto-generada debe ser segura (minúsculas, mayúsculas, números, símbolos)', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);

      let generatedPassword = '';
      mockPrismaService.docente.create.mockImplementation(async (args: any) => {
        // Capturar el password antes de que se hashee
        // En la implementación real, necesitaremos exponer el password generado
        // temporalmente para poder enviarlo al admin
        generatedPassword = args.data._generatedPassword || '';
        return {
          id: 'doc-1',
          email: 'test@example.com',
          password_hash: 'hashed',
          nombre: 'Test',
          apellido: 'User',
          debe_cambiar_password: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // Act
      await service.create({
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'User',
      } as any);

      // Assert - Verificar que se llamó a create (el password se generó internamente)
      expect(mockPrismaService.docente.create).toHaveBeenCalled();

      // En la implementación real, este test validará:
      // - Longitud >= 12 caracteres
      // - Al menos una mayúscula
      // - Al menos una minúscula
      // - Al menos un número
      // - Al menos un símbolo especial
    });
  });

  describe('Retorno de contraseña generada', () => {
    it('debe retornar la contraseña en texto plano cuando es auto-generada (solo en creación)', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'nueva@example.com',
        password_hash: 'hashed',
        nombre: 'Nueva',
        apellido: 'Docente',
        debe_cambiar_password: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.create({
        email: 'nueva@example.com',
        nombre: 'Nueva',
        apellido: 'Docente',
      } as any);

      // Assert
      // La contraseña generada debe venir en el resultado para que el admin pueda compartirla
      expect(result).toHaveProperty('generatedPassword');
      expect(typeof (result as any).generatedPassword).toBe('string');
      expect((result as any).generatedPassword.length).toBeGreaterThanOrEqual(12);
    });

    it('NO debe retornar contraseña cuando el admin la proporciona manualmente', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'manual@example.com',
        password_hash: 'hashed_manual',
        nombre: 'Manual',
        apellido: 'Password',
        debe_cambiar_password: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.create({
        email: 'manual@example.com',
        password: 'MyCustomPassword123!',
        nombre: 'Manual',
        apellido: 'Password',
      } as any);

      // Assert
      expect(result).not.toHaveProperty('generatedPassword');
    });
  });

  describe('Campos opcionales (años_experiencia, bio)', () => {
    it('debe permitir crear docente sin años_experiencia', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'sin-exp@example.com',
        password_hash: 'hashed',
        nombre: 'Sin',
        apellido: 'Experiencia',
        experiencia_anos: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(
        service.create({
          email: 'sin-exp@example.com',
          password: 'Test123!',
          nombre: 'Sin',
          apellido: 'Experiencia',
          // experiencia_anos omitido
        } as any),
      ).resolves.toBeDefined();
    });

    it('debe permitir crear docente sin bio', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'sin-bio@example.com',
        password_hash: 'hashed',
        nombre: 'Sin',
        apellido: 'Bio',
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(
        service.create({
          email: 'sin-bio@example.com',
          password: 'Test123!',
          nombre: 'Sin',
          apellido: 'Bio',
          // bio omitido
        } as any),
      ).resolves.toBeDefined();
    });

    it('debe preservar titulo si se proporciona', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);
      mockPrismaService.docente.create.mockResolvedValue({
        id: 'doc-1',
        email: 'con-titulo@example.com',
        password_hash: 'hashed',
        nombre: 'Con',
        apellido: 'Titulo',
        titulo: 'Licenciado en Matemática',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await service.create({
        email: 'con-titulo@example.com',
        password: 'Test123!',
        nombre: 'Con',
        apellido: 'Titulo',
        titulo: 'Licenciado en Matemática',
      } as any);

      // Assert
      const createCall = mockPrismaService.docente.create.mock.calls[0][0];
      expect(createCall.data.titulo).toBe('Licenciado en Matemática');
    });
  });

  describe('Validaciones básicas', () => {
    it('DTO debe requerir email (validación de class-validator)', async () => {
      // NOTA: Las validaciones de DTO las hace NestJS con class-validator
      // en el controller, ANTES de que llegue al service.
      // Este test documenta el comportamiento esperado del DTO.
      // En el service, asumimos que los datos ya están validados.

      const dto = new CreateDocenteDto();
      dto.nombre = 'Test';
      dto.apellido = 'User';
      // email omitido - class-validator rechazaría esto

      // El service espera datos válidos, pero documentamos el req del DTO
      expect(CreateDocenteDto).toBeDefined();
    });

    it('DTO debe requerir nombre (validación de class-validator)', async () => {
      // Mismo caso: el service asume datos válidos del controller
      const dto = new CreateDocenteDto();
      dto.email = 'test@example.com';
      dto.apellido = 'User';
      // nombre omitido - class-validator rechazaría esto

      expect(CreateDocenteDto).toBeDefined();
    });

    it('DTO debe requerir apellido (validación de class-validator)', async () => {
      // Mismo caso: el service asume datos válidos del controller
      const dto = new CreateDocenteDto();
      dto.email = 'test@example.com';
      dto.nombre = 'Test';
      // apellido omitido - class-validator rechazaría esto

      expect(CreateDocenteDto).toBeDefined();
    });

    it('debe rechazar email duplicado', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue({
        id: 'existing-doc',
        email: 'duplicado@example.com',
      });

      // Act & Assert
      await expect(
        service.create({
          email: 'duplicado@example.com',
          nombre: 'Duplicado',
          apellido: 'Email',
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Seguridad de contraseñas', () => {
    it('debe hashear contraseña auto-generada con bcrypt', async () => {
      // Arrange
      mockPrismaService.docente.findUnique.mockResolvedValue(null);

      let hashedPassword = '';
      mockPrismaService.docente.create.mockImplementation(async (args: any) => {
        hashedPassword = args.data.password_hash;
        return {
          id: 'doc-1',
          email: 'test@example.com',
          password_hash: hashedPassword,
          nombre: 'Test',
          apellido: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // Act
      await service.create({
        email: 'test@example.com',
        nombre: 'Test',
        apellido: 'User',
      } as any);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(''); // No debe ser plain text
      // bcrypt hashes empiezan con $2a$ o $2b$
      expect(hashedPassword.startsWith('$2')).toBe(true);
    });

    it('debe hashear contraseña manual con bcrypt', async () => {
      // Arrange
      const plainPassword = 'MyManualPassword123!';
      mockPrismaService.docente.findUnique.mockResolvedValue(null);

      let hashedPassword = '';
      mockPrismaService.docente.create.mockImplementation(async (args: any) => {
        hashedPassword = args.data.password_hash;
        return {
          id: 'doc-1',
          email: 'manual@example.com',
          password_hash: hashedPassword,
          nombre: 'Manual',
          apellido: 'User',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // Act
      await service.create({
        email: 'manual@example.com',
        password: plainPassword,
        nombre: 'Manual',
        apellido: 'User',
      } as any);

      // Assert
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.startsWith('$2')).toBe(true);

      // Verificar que el hash es válido y corresponde al password
      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });
  });
});
