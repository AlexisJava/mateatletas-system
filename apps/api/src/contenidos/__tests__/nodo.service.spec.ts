import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { PrismaClient, EstadoContenido } from '@prisma/client';
import { NodoService } from '../services/nodo.service';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * TESTS PARA NodoService - Verificación de correcciones de bugs
 *
 * Estos tests verifican que los bugs identificados en la auditoría
 * de seguridad y performance fueron corregidos.
 *
 * Bugs cubiertos:
 * 1. N+1 queries en esDescendiente() - Issue #4 [CORREGIDO]
 * 2. reordenar() no valida contenidoId - Issue #17 (seguridad) [CORREGIDO]
 * 3. getArbol() no valida existencia del contenido - Issue #18 [CORREGIDO]
 */
describe('NodoService - Bug Detection Tests', () => {
  let service: NodoService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const mockPrisma = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodoService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<NodoService>(NodoService);
    prisma = module.get(PrismaService) as DeepMockProxy<PrismaClient>;
  });

  afterEach(() => {
    mockReset(prisma);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUG #4: esDescendiente() hace N+1 queries en árbol profundo [CORREGIDO]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('BUG #4: moverNodo - Optimización de detección de ciclos', () => {
    /**
     * CORRECCIÓN IMPLEMENTADA:
     * El método esDescendiente() ahora carga todos los nodos del contenido
     * en una sola query (findMany) y verifica descendencia en memoria.
     *
     * ESTE TEST DEBERÍA PASAR:
     * - findUnique se llama máximo 3 veces (nodo a mover, nuevo padre, nodo en esDescendiente)
     * - findMany se llama 1 vez para cargar todos los nodos
     */
    it('debería usar findMany para verificar descendencia eficientemente', async () => {
      // Arrange: Simular un nodo a mover
      const nodoAMover = {
        id: 'nodo-a-mover',
        contenidoId: 'contenido-1',
        bloqueado: false,
        titulo: 'Nodo A',
        parentId: null,
        orden: 0,
        contenidoJson: null,
      };

      // Simular nuevo padre (que es descendiente de nodoAMover - crearía ciclo)
      // Cadena: nivel-10 -> nivel-9 -> ... -> nivel-1 -> nodo-a-mover
      const createChain = (depth: number) => {
        const chain: Array<{
          id: string;
          parentId: string | null;
          contenidoId: string;
        }> = [];
        for (let i = depth; i >= 1; i--) {
          chain.push({
            id: `nivel-${i}`,
            parentId: i === 1 ? 'nodo-a-mover' : `nivel-${i - 1}`,
            contenidoId: 'contenido-1',
          });
        }
        return chain;
      };

      const chain = createChain(10);

      // Mock: findUnique para nodos específicos
      prisma.nodoContenido.findUnique.mockImplementation(({ where }) => {
        if (where.id === 'nodo-a-mover') {
          return Promise.resolve(nodoAMover as never);
        }
        if (where.id === 'nivel-10') {
          return Promise.resolve({
            id: 'nivel-10',
            contenidoId: 'contenido-1',
            parentId: 'nivel-9',
            titulo: 'Nivel 10',
            bloqueado: false,
            orden: 0,
            contenidoJson: null,
          } as never);
        }
        return Promise.resolve(null as never);
      });

      // Mock: findMany retorna todos los nodos del contenido (optimización)
      prisma.nodoContenido.findMany.mockResolvedValue([
        { ...nodoAMover, id: 'nodo-a-mover', parentId: null },
        ...chain.map((n) => ({
          id: n.id,
          parentId: n.parentId,
          contenidoId: 'contenido-1',
          titulo: n.id,
          bloqueado: false,
          orden: 0,
          contenidoJson: null,
        })),
      ] as never);

      // Mock: contenido existe y está en BORRADOR
      prisma.contenido.findUnique.mockResolvedValue({
        id: 'contenido-1',
        estado: EstadoContenido.BORRADOR,
        titulo: 'Test Contenido',
      } as never);

      // Mock: findFirst para obtener último orden
      prisma.nodoContenido.findFirst.mockResolvedValue(null as never);

      // Act: Intentar mover nodo-a-mover a nivel-10 (crearía ciclo)
      await expect(
        service.moverNodo('nodo-a-mover', 'nivel-10'),
      ).rejects.toThrow(BadRequestException);

      // Assert: findUnique se llama máximo 3 veces (no N veces)
      const findUniqueCalls = prisma.nodoContenido.findUnique.mock.calls.length;
      expect(findUniqueCalls).toBeLessThanOrEqual(3);

      // Assert: findMany se usó para cargar nodos en batch
      expect(prisma.nodoContenido.findMany).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUG #17: reordenar() no valida que los nodos pertenezcan al contenido [CORREGIDO]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('BUG #17: reordenar - Validación de seguridad', () => {
    /**
     * CORRECCIÓN IMPLEMENTADA:
     * El método reordenar() ahora valida que TODOS los nodos pertenezcan
     * al contenidoId especificado antes de ejecutar cualquier update.
     *
     * ESTE TEST DEBERÍA PASAR:
     * Lanza BadRequestException cuando un nodo pertenece a otro contenido.
     */
    it('debería RECHAZAR nodos que pertenecen a otro contenido', async () => {
      // Arrange: contenido-A es el que queremos reordenar
      const contenidoA = {
        id: 'contenido-A',
        estado: EstadoContenido.BORRADOR,
        titulo: 'Contenido A',
      };

      // Pero el atacante envía nodoId de contenido-B
      const nodoDeOtroContenido = {
        id: 'nodo-malicioso',
        contenidoId: 'contenido-B', // ← Pertenece a OTRO contenido
      };

      // Mock: contenido-A existe y está en BORRADOR
      prisma.contenido.findUnique.mockResolvedValue(contenidoA as never);

      // Mock: findMany retorna el nodo con contenidoId diferente
      // (La nueva validación busca los nodos antes de actualizar)
      prisma.nodoContenido.findMany.mockResolvedValue([
        nodoDeOtroContenido,
      ] as never);

      // Act & Assert: Debe lanzar BadRequestException
      await expect(
        service.reordenar('contenido-A', {
          orden: [{ nodoId: 'nodo-malicioso', orden: 0 }],
        }),
      ).rejects.toThrow(BadRequestException);

      // Verificar que NO se ejecutó ningún update
      expect(prisma.nodoContenido.update).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería ACEPTAR nodos que pertenecen al contenido correcto', async () => {
      // Arrange
      const contenidoA = {
        id: 'contenido-A',
        estado: EstadoContenido.BORRADOR,
        titulo: 'Contenido A',
      };

      const nodoValido = {
        id: 'nodo-valido',
        contenidoId: 'contenido-A', // ← Pertenece al contenido correcto
      };

      // Mock: contenido existe
      prisma.contenido.findUnique.mockResolvedValue(contenidoA as never);

      // Mock: findMany retorna el nodo con contenidoId correcto
      prisma.nodoContenido.findMany.mockResolvedValue([nodoValido] as never);

      // Mock: transaction ejecuta updates
      prisma.$transaction.mockResolvedValue([nodoValido] as never);

      // Act
      const result = await service.reordenar('contenido-A', {
        orden: [{ nodoId: 'nodo-valido', orden: 0 }],
      });

      // Assert: La operación se completó (getArbol agrega propiedad 'hijos')
      expect(result).toEqual([{ ...nodoValido, hijos: [] }]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUG #18: getArbol() no valida existencia del contenido [CORREGIDO]
  // ═══════════════════════════════════════════════════════════════════════════
  describe('BUG #18: getArbol - Validación de existencia del contenido', () => {
    /**
     * CORRECCIÓN IMPLEMENTADA:
     * getArbol() ahora valida que el contenido existe antes de buscar nodos.
     * Si no existe, lanza NotFoundException.
     *
     * ESTE TEST DEBERÍA PASAR:
     * Lanza NotFoundException para contenido inexistente.
     */
    it('debería lanzar NotFoundException si el contenido no existe', async () => {
      // Arrange: El contenido NO existe
      prisma.contenido.findUnique.mockResolvedValue(null);

      // findMany retorna [] porque no hay nodos con ese contenidoId
      prisma.nodoContenido.findMany.mockResolvedValue([]);

      // Act & Assert
      /**
       * ⚠️ ESTE TEST DEBERÍA FALLAR
       *
       * Actualmente el código:
       * 1. Hace findMany con WHERE contenidoId = 'no-existe'
       * 2. Obtiene []
       * 3. Retorna [] (árbol vacío)
       *
       * El código CORRECTO debería:
       * 1. Primero verificar que el contenido existe
       * 2. Si no existe, lanzar NotFoundException
       */
      await expect(service.getArbol('contenido-no-existe')).rejects.toThrow(
        NotFoundException,
      );

      // Si este test PASA, el bug está arreglado
      // Si este test FALLA (retorna [] en lugar de lanzar), el bug existe
    });

    it('debería retornar árbol vacío si el contenido EXISTE pero no tiene nodos', async () => {
      // Arrange: El contenido SÍ existe
      prisma.contenido.findUnique.mockResolvedValue({
        id: 'contenido-existente',
        estado: EstadoContenido.BORRADOR,
        titulo: 'Contenido Vacío',
      } as never);

      // Pero no tiene nodos
      prisma.nodoContenido.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getArbol('contenido-existente');

      // Assert: Esto SÍ debería retornar [] porque el contenido existe
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TEST ADICIONAL: Verificar comportamiento correcto de removeNodo
  // ═══════════════════════════════════════════════════════════════════════════
  describe('removeNodo - Cascade delete behavior', () => {
    /**
     * Este test verifica el comportamiento actual de cascade delete.
     * NO es un bug, pero documenta el comportamiento.
     */
    it('debería eliminar nodo con todos sus descendientes (cascade)', async () => {
      // Arrange
      const nodoConHijos = {
        id: 'nodo-padre',
        contenidoId: 'contenido-1',
        titulo: 'Nodo con hijos',
        bloqueado: false,
        parentId: null,
        orden: 0,
        contenidoJson: null,
      };

      prisma.nodoContenido.findUnique.mockResolvedValue(nodoConHijos as never);
      prisma.contenido.findUnique.mockResolvedValue({
        id: 'contenido-1',
        estado: EstadoContenido.BORRADOR,
        titulo: 'Test',
      } as never);
      prisma.nodoContenido.delete.mockResolvedValue(nodoConHijos as never);

      // Act
      const result = await service.removeNodo('nodo-padre');

      // Assert: La operación completó (Prisma hace cascade delete)
      expect(result.success).toBe(true);
      expect(prisma.nodoContenido.delete).toHaveBeenCalledWith({
        where: { id: 'nodo-padre' },
      });

      // NOTA: Este test documenta que NO hay confirmación de cascade
      // El frontend debería advertir antes de eliminar nodos con hijos
    });
  });
});

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * RESUMEN DE CORRECCIONES IMPLEMENTADAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Todos los bugs han sido corregidos. Al ejecutar estos tests, esperamos:
 *
 * ✅ PASS: "debería usar findMany para verificar descendencia eficientemente"
 *    → findUnique ≤3, findMany usado para batch
 *
 * ✅ PASS: "debería RECHAZAR nodos que pertenecen a otro contenido"
 *    → Lanza BadRequestException correctamente
 *
 * ✅ PASS: "debería ACEPTAR nodos que pertenecen al contenido correcto"
 *    → Permite operación válida
 *
 * ✅ PASS: "debería lanzar NotFoundException si el contenido no existe"
 *    → Lanza NotFoundException correctamente
 *
 * ✅ PASS: "debería retornar árbol vacío si el contenido EXISTE"
 *    → Comportamiento esperado
 *
 * ✅ PASS: "debería eliminar nodo con todos sus descendientes"
 *    → Comportamiento documentado
 */
