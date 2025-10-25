import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, EstadoPlanificacion } from '@prisma/client';
import { PrismaPlanificacionRepository } from '../../infrastructure/prisma-planificacion.repository';
import { PrismaService } from '../../../core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PrismaPlanificacionRepository (Integration)', () => {
  let repository: PrismaPlanificacionRepository;
  let prisma: PrismaService;
  let testAdminId: string;
  let testGrupoId: string;
  let testGrupoCodigo: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaPlanificacionRepository, PrismaService],
    }).compile();

    repository = module.get<PrismaPlanificacionRepository>(PrismaPlanificacionRepository);
    prisma = module.get<PrismaService>(PrismaService);

    // Create test admin user
    const admin = await prisma.admin.create({
      data: {
        nombre: 'Admin',
        apellido: 'Test',
        email: `admin-test-${Date.now()}@test.com`,
        password_hash: 'hashed',
      },
    });
    testAdminId = admin.id;

    // Create test group
    const grupo = await prisma.grupo.create({
      data: {
        codigo: `TEST-GRP-${Date.now()}`,
        nombre: 'Grupo Test Planificaciones',
        descripcion: 'Grupo temporal para pruebas de planificaciones',
      },
    });
    testGrupoId = grupo.id;
    testGrupoCodigo = grupo.codigo;
  });

  afterAll(async () => {
    // Cleanup
    if (testAdminId) {
      await prisma.planificacionMensual.deleteMany({
        where: { created_by_admin_id: testAdminId },
      });
      await prisma.admin.delete({ where: { id: testAdminId } });
    }

    if (testGrupoId) {
      await prisma.grupo.delete({ where: { id: testGrupoId } });
    }
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean planifications after each test
    await prisma.planificacionMensual.deleteMany({
      where: { created_by_admin_id: testAdminId },
    });
  });

  describe('create', () => {
    it('should create a new planification', async () => {
      // Arrange
      const data = {
        grupoId: testGrupoId,
        mes: 11,
        anio: 2025,
        titulo: 'Test Planificación',
        descripcion: 'Descripción de prueba',
        tematicaPrincipal: 'Suma y resta',
        objetivosAprendizaje: ['Objetivo 1', 'Objetivo 2'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      };

      // Act
      const result = await repository.create(data);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.grupoId).toBe(testGrupoId);
      expect(result.mes).toBe(11);
      expect(result.anio).toBe(2025);
      expect(result.estado).toBe(EstadoPlanificacion.BORRADOR);
      expect(result.objetivosAprendizaje).toEqual(['Objetivo 1', 'Objetivo 2']);
    });

    it('should fail when creating duplicate (codigo_grupo, mes, anio)', async () => {
      // Arrange
      const data = {
        grupoId: testGrupoId,
        mes: 11,
        anio: 2025,
        titulo: 'Test 1',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj 1'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      };

      await repository.create(data);

      // Act & Assert
      await expect(
        repository.create({ ...data, titulo: 'Test 2' }),
      ).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find a planification by ID', async () => {
      // Arrange
      const created = await repository.create({
        grupoId: testGrupoId,
        mes: 12,
        anio: 2025,
        titulo: 'Test Find By ID',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj 1'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      // Act
      const result = await repository.findById(created.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.titulo).toBe('Test Find By ID');
    });

    it('should throw NotFoundException when ID not found', async () => {
      // Act & Assert
      await expect(repository.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdOptional', () => {
    it('should return null when ID not found', async () => {
      // Act
      const result = await repository.findByIdOptional('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should return entity when found', async () => {
      // Arrange
      const created = await repository.create({
        grupoId: testGrupoId,
        mes: 10,
        anio: 2025,
        titulo: 'Test Optional',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj 1'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      // Act
      const result = await repository.findByIdOptional(created.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(created.id);
    });
  });

  describe('findByPeriod', () => {
    it('should find planification by codigo_grupo, mes, anio', async () => {
      // Arrange
      await repository.create({
        grupoId: testGrupoId,
        mes: 9,
        anio: 2025,
        titulo: 'Test Period',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj 1'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      // Act
      const result = await repository.findByPeriod(testGrupoId, 9, 2025);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.grupoId).toBe(testGrupoId);
      expect(result?.mes).toBe(9);
      expect(result?.anio).toBe(2025);
    });

    it('should return null when period not found', async () => {
      // Act
      const result = await repository.findByPeriod('X99', 13, 2099);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test data
      await repository.create({
        grupoId: testGrupoId,
        mes: 11,
        anio: 2025,
        titulo: 'Plan 1',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.PUBLICADA,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      await repository.create({
        grupoId: testGrupoId,
        mes: 11,
        anio: 2025,
        titulo: 'Plan 2',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      await repository.create({
        grupoId: testGrupoId,
        mes: 12,
        anio: 2025,
        titulo: 'Plan 3',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.PUBLICADA,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });
    });

    it('should return all planifications without filters', async () => {
      // Act
      const result = await repository.findAll({}, { page: 1, limit: 10 });

      // Assert
      expect(result.data.length).toBeGreaterThanOrEqual(3);
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by codigo_grupo', async () => {
      // Act
      const result = await repository.findAll(
        { codigoGrupo: testGrupoCodigo },
        { page: 1, limit: 10 },
      );

      // Assert
      expect(result.data.length).toBe(2);
      expect(result.data.every((p) => p.codigoGrupo === testGrupoCodigo)).toBe(true);
    });

    it('should filter by estado', async () => {
      // Act
      const result = await repository.findAll(
        { estado: EstadoPlanificacion.PUBLICADA },
        { page: 1, limit: 10 },
      );

      // Assert
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.data.every((p) => p.estado === EstadoPlanificacion.PUBLICADA)).toBe(true);
    });

    it('should apply pagination correctly', async () => {
      // Act
      const result = await repository.findAll({}, { page: 1, limit: 2 });

      // Assert
      expect(result.data.length).toBeLessThanOrEqual(2);
      expect(result.limit).toBe(2);
      expect(result.page).toBe(1);
    });
  });

  describe('update', () => {
    it('should update a planification', async () => {
      // Arrange
      const created = await repository.create({
        grupoId: testGrupoId,
        mes: 11,
        anio: 2025,
        titulo: 'Original Title',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      // Act
      const updated = await repository.update(created.id, {
        titulo: 'Updated Title',
        estado: EstadoPlanificacion.PUBLICADA,
      });

      // Assert
      expect(updated.titulo).toBe('Updated Title');
      expect(updated.estado).toBe(EstadoPlanificacion.PUBLICADA);
    });
  });

  describe('delete', () => {
    it('should delete a planification', async () => {
      // Arrange
      const created = await repository.create({
        grupoId: testGrupoId,
        mes: 11,
        anio: 2025,
        titulo: 'To Delete',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.BORRADOR,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      // Act
      await repository.delete(created.id);

      // Assert
      const result = await repository.findByIdOptional(created.id);
      expect(result).toBeNull();
    });
  });

  describe('count', () => {
    it('should count planifications matching filters', async () => {
      // Arrange
      await repository.create({
        grupoId: testGrupoId,
        mes: 1,
        anio: 2025,
        titulo: 'Count 1',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.PUBLICADA,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      await repository.create({
        grupoId: testGrupoId,
        mes: 2,
        anio: 2025,
        titulo: 'Count 2',
        descripcion: 'Desc',
        tematicaPrincipal: 'Tema',
        objetivosAprendizaje: ['Obj'],
        estado: EstadoPlanificacion.PUBLICADA,
        createdByAdminId: testAdminId,
        notasDocentes: null,
      });

      // Act
      const count = await repository.count({ grupoId: testGrupoId });

      // Assert
      expect(count).toBe(2);
    });
  });
});
