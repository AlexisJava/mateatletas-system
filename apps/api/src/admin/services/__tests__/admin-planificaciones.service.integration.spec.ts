/**
 * Tests de Integración: AdminPlanificacionesService
 *
 * Métodos testeados:
 * - crear() - Crear planificación con N clases
 * - obtenerPorId() - Obtener planificación por ID
 * - listar() - Listar con paginación y filtros
 * - actualizar() - Actualizar metadata
 * - actualizarClase() - Actualizar clase específica
 * - agregarTarea() - Agregar tarea a clase
 * - eliminarTarea() - Eliminar tarea de clase
 * - publicar() - Publicar planificación
 * - eliminar() - Eliminar planificación borrador
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminPlanificacionesService } from '../admin-planificaciones.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { AppModule } from '../../../app.module';
import { createId } from '@paralleldrive/cuid2';

describe('[INTEGRATION] AdminPlanificacionesService', () => {
  let service: AdminPlanificacionesService;
  let prisma: PrismaService;

  // IDs para cleanup
  const createdIds = {
    planificaciones: [] as string[],
    usuarios: [] as string[],
    contenidos: [] as string[],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<AdminPlanificacionesService>(
      AdminPlanificacionesService,
    );
    prisma = module.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Cleanup en orden inverso de dependencias
    // 1. Eliminar planificaciones (cascade elimina clases y contenidos asociados)
    if (createdIds.planificaciones.length > 0) {
      await prisma.planificacion.deleteMany({
        where: { id: { in: createdIds.planificaciones } },
      });
      createdIds.planificaciones = [];
    }

    // 2. Eliminar contenidos creados manualmente
    if (createdIds.contenidos.length > 0) {
      await prisma.contenido.deleteMany({
        where: { id: { in: createdIds.contenidos } },
      });
      createdIds.contenidos = [];
    }

    // 3. Eliminar contenidos huérfanos creados por el servicio (referenciados por admin)
    if (createdIds.usuarios.length > 0) {
      await prisma.contenido.deleteMany({
        where: { creadorId: { in: createdIds.usuarios } },
      });
      await prisma.admin.deleteMany({
        where: { id: { in: createdIds.usuarios } },
      });
      createdIds.usuarios = [];
    }
  });

  // ============================================================================
  // HELPERS
  // ============================================================================
  async function crearAdmin(suffix = '') {
    const uniqueId = createId();
    const admin = await prisma.admin.create({
      data: {
        email: `admin-test-${uniqueId}${suffix}@test.com`,
        password_hash: 'hashed_password',
        nombre: `Admin ${uniqueId}`,
        apellido: 'Test',
      },
    });
    createdIds.usuarios.push(admin.id);
    return admin;
  }

  async function crearContenido(
    adminId: string,
    tipo:
      | 'LECCION'
      | 'TAREA'
      | 'MICROLECCION'
      | 'EVALUACION'
      | 'JUEGO'
      | 'SIMULACION'
      | 'RECURSO' = 'LECCION',
    suffix = '',
  ) {
    const uniqueId = createId();
    const contenido = await prisma.contenido.create({
      data: {
        titulo: `Contenido Test ${uniqueId}${suffix}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
        estado: 'PUBLICADO',
        tipo,
        creadorId: adminId,
      },
    });
    createdIds.contenidos.push(contenido.id);
    return contenido;
  }

  // ============================================================================
  // TESTS: crear
  // ============================================================================
  describe('crear', () => {
    it('should_create_planificacion_with_clases', async () => {
      // Arrange
      const admin = await crearAdmin();
      const dto = {
        titulo: 'Matemáticas Básicas',
        descripcion: 'Curso introductorio',
        cantidad_clases: 3,
        casa_tipo: 'QUANTUM' as const,
        mundo_tipo: 'MATEMATICA' as const,
      };

      // Act
      const result = await service.crear(dto, admin.id);
      createdIds.planificaciones.push(result.id);

      // Assert
      expect(result.titulo).toBe('Matemáticas Básicas');
      expect(result.descripcion).toBe('Curso introductorio');
      expect(result.cantidad_clases).toBe(3);
      expect(result.estado).toBe('BORRADOR');
      expect(result.clases).toHaveLength(3);
      expect(result.clases[0].numero).toBe(1);
      expect(result.clases[0].teoria).toBeDefined();
      expect(result.clases[0].practica).toBeDefined();
    });

    it('should_create_planificacion_without_descripcion', async () => {
      // Arrange
      const admin = await crearAdmin();
      const dto = {
        titulo: 'Sin Descripción',
        cantidad_clases: 2,
        casa_tipo: 'VERTEX' as const,
        mundo_tipo: 'PROGRAMACION' as const,
      };

      // Act
      const result = await service.crear(dto, admin.id);
      createdIds.planificaciones.push(result.id);

      // Assert
      expect(result.descripcion).toBeNull();
      expect(result.clases).toHaveLength(2);
    });

    it('should_create_contenidos_for_each_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const dto = {
        titulo: 'Con Contenidos',
        cantidad_clases: 2,
        casa_tipo: 'QUANTUM' as const,
        mundo_tipo: 'MATEMATICA' as const,
      };

      // Act
      const result = await service.crear(dto, admin.id);
      createdIds.planificaciones.push(result.id);

      // Assert - verificar que se crearon contenidos de teoría y práctica
      const clase1 = result.clases[0];
      expect(clase1.teoria?.titulo).toContain('Clase 1 (Teoría)');
      expect(clase1.practica?.titulo).toContain('Clase 1 (Práctica)');
    });
  });

  // ============================================================================
  // TESTS: obtenerPorId
  // ============================================================================
  describe('obtenerPorId', () => {
    it('should_return_planificacion_with_clases', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Para Obtener',
          cantidad_clases: 2,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      // Act
      const result = await service.obtenerPorId(created.id);

      // Assert
      expect(result.id).toBe(created.id);
      expect(result.titulo).toBe('Para Obtener');
      expect(result.clases).toHaveLength(2);
    });

    it('should_throw_NotFoundException_when_not_found', async () => {
      // Arrange
      const fakeId = createId();

      // Act & Assert
      await expect(service.obtenerPorId(fakeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================================================
  // TESTS: listar
  // ============================================================================
  describe('listar', () => {
    it('should_return_paginated_list', async () => {
      // Arrange
      const admin = await crearAdmin();
      const p1 = await service.crear(
        {
          titulo: 'Lista 1',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      const p2 = await service.crear(
        {
          titulo: 'Lista 2',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(p1.id, p2.id);

      // Act
      const result = await service.listar({ page: 1, limit: 10 });

      // Assert
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should_filter_by_estado', async () => {
      // Arrange
      const admin = await crearAdmin();
      const p1 = await service.crear(
        {
          titulo: 'Borrador',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(p1.id);

      // Act
      const result = await service.listar({ estado: 'BORRADOR' });

      // Assert
      expect(result.data.every((p) => p.estado === 'BORRADOR')).toBe(true);
    });

    it('should_filter_by_casa_tipo', async () => {
      // Arrange
      const admin = await crearAdmin();
      const p1 = await service.crear(
        {
          titulo: 'Vertex',
          cantidad_clases: 1,
          casa_tipo: 'VERTEX' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(p1.id);

      // Act
      const result = await service.listar({ casa_tipo: 'VERTEX' });

      // Assert
      expect(result.data.every((p) => p.casa_tipo === 'VERTEX')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS: actualizar
  // ============================================================================
  describe('actualizar', () => {
    it('should_update_titulo_and_descripcion', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Original',
          descripcion: 'Desc original',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      // Act
      const result = await service.actualizar(created.id, {
        titulo: 'Actualizado',
        descripcion: 'Desc nueva',
      });

      // Assert
      expect(result.titulo).toBe('Actualizado');
      expect(result.descripcion).toBe('Desc nueva');
    });

    it('should_throw_NotFoundException_when_not_found', async () => {
      // Arrange
      const fakeId = createId();

      // Act & Assert
      await expect(
        service.actualizar(fakeId, { titulo: 'Nuevo' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_BadRequestException_when_not_borrador', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Para Publicar',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      // Cambiar estado directamente
      await prisma.planificacion.update({
        where: { id: created.id },
        data: { estado: 'PUBLICADO' },
      });

      // Act & Assert
      await expect(
        service.actualizar(created.id, { titulo: 'Cambio' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // TESTS: actualizarClase
  // ============================================================================
  describe('actualizarClase', () => {
    it('should_update_clase_titulo', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Con Clases',
          cantidad_clases: 2,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);
      const claseId = created.clases[0].id;

      // Act
      const result = await service.actualizarClase(claseId, {
        titulo: 'Clase Actualizada',
      });

      // Assert
      expect(result.clases[0].titulo).toBe('Clase Actualizada');
    });

    it('should_throw_NotFoundException_when_clase_not_found', async () => {
      // Arrange
      const fakeClaseId = createId();

      // Act & Assert
      await expect(
        service.actualizarClase(fakeClaseId, { titulo: 'Nuevo' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_when_planificacion_not_borrador', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'No Borrador',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      await prisma.planificacion.update({
        where: { id: created.id },
        data: { estado: 'PUBLICADO' },
      });

      // Act & Assert
      await expect(
        service.actualizarClase(created.clases[0].id, { titulo: 'Cambio' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // TESTS: agregarTarea
  // ============================================================================
  describe('agregarTarea', () => {
    it('should_add_tarea_to_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Con Tareas',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);
      const contenido = await crearContenido(admin.id, 'TAREA');

      // Act
      const result = await service.agregarTarea(created.clases[0].id, {
        contenido_id: contenido.id,
        obligatoria: true,
      });

      // Assert
      expect(result.clases[0].tareas).toHaveLength(1);
      expect(result.clases[0].tareas?.[0].obligatoria).toBe(true);
    });

    it('should_throw_when_contenido_not_found', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Sin Contenido',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      // Act & Assert
      await expect(
        service.agregarTarea(created.clases[0].id, {
          contenido_id: createId(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should_throw_when_tarea_already_exists', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Duplicada',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);
      const contenido = await crearContenido(admin.id, 'TAREA');

      // Agregar primera vez
      await service.agregarTarea(created.clases[0].id, {
        contenido_id: contenido.id,
      });

      // Act & Assert - Agregar segunda vez
      await expect(
        service.agregarTarea(created.clases[0].id, {
          contenido_id: contenido.id,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // TESTS: eliminarTarea
  // ============================================================================
  describe('eliminarTarea', () => {
    it('should_remove_tarea_from_clase', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Eliminar Tarea',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);
      const contenido = await crearContenido(admin.id, 'TAREA');

      const conTarea = await service.agregarTarea(created.clases[0].id, {
        contenido_id: contenido.id,
      });
      const tareaId = conTarea.clases[0].tareas![0].id;

      // Act
      const result = await service.eliminarTarea(created.clases[0].id, tareaId);

      // Assert
      expect(result.clases[0].tareas).toHaveLength(0);
    });

    it('should_throw_when_tarea_not_found', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Sin Tarea',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      // Act & Assert
      await expect(
        service.eliminarTarea(created.clases[0].id, createId()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // TESTS: publicar
  // ============================================================================
  describe('publicar', () => {
    it('should_throw_when_planificacion_not_found', async () => {
      // Arrange
      const fakeId = createId();

      // Act & Assert
      await expect(service.publicar(fakeId)).rejects.toThrow(NotFoundException);
    });

    it('should_throw_when_already_published', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Ya Publicada',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      await prisma.planificacion.update({
        where: { id: created.id },
        data: { estado: 'PUBLICADO' },
      });

      // Act & Assert
      await expect(service.publicar(created.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should_throw_when_clase_has_insufficient_nodes', async () => {
      // Arrange - El servicio valida que teoría/práctica tengan al menos 3 nodos
      // La planificación se crea con nodos, pero podemos verificar la validación
      // creando una planificación y verificando que falla si no tiene suficientes nodos
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Sin Nodos Suficientes',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      // Eliminar nodos de teoría para que tenga menos de 3
      await prisma.nodoContenido.deleteMany({
        where: { contenidoId: created.clases[0].teoria_id },
      });

      // Act & Assert
      await expect(service.publicar(created.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ============================================================================
  // TESTS: eliminar
  // ============================================================================
  describe('eliminar', () => {
    it('should_delete_borrador_planificacion', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Para Eliminar',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      // No agregar a cleanup porque lo eliminamos manualmente

      // Act
      const result = await service.eliminar(created.id);

      // Assert
      expect(result.success).toBe(true);

      // Verificar que no existe
      await expect(service.obtenerPorId(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should_throw_when_not_found', async () => {
      // Arrange
      const fakeId = createId();

      // Act & Assert
      await expect(service.eliminar(fakeId)).rejects.toThrow(NotFoundException);
    });

    it('should_throw_when_not_borrador', async () => {
      // Arrange
      const admin = await crearAdmin();
      const created = await service.crear(
        {
          titulo: 'Publicada',
          cantidad_clases: 1,
          casa_tipo: 'QUANTUM' as const,
          mundo_tipo: 'MATEMATICA' as const,
        },
        admin.id,
      );
      createdIds.planificaciones.push(created.id);

      await prisma.planificacion.update({
        where: { id: created.id },
        data: { estado: 'PUBLICADO' },
      });

      // Act & Assert
      await expect(service.eliminar(created.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
