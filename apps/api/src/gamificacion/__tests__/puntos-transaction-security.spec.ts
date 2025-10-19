import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PuntosService } from '../puntos.service';
import { PrismaService } from '../../core/database/prisma.service';

describe('PuntosService - Transaction Security', () => {
  let service: PuntosService;
  let prisma: PrismaService;

  const mockAccion = {
    id: 'accion-1',
    nombre: 'Respuesta Brillante',
    descripcion: 'Respondió correctamente pregunta difícil',
    puntos: 50,
    activo: true,
  };

  const mockEstudiante = {
    id: 'est-1',
    nombre: 'Juan',
    apellido: 'Pérez',
    puntos_totales: 100,
  };

  const mockDocente = {
    id: 'doc-1',
    nombre: 'María',
    apellido: 'García',
  };

  const mockClase = {
    id: 'clase-1',
    inscripciones: [{ estudiante_id: 'est-1' }],
  };

  const mockPuntoObtenido = {
    id: 'punto-1',
    estudiante_id: 'est-1',
    docente_id: 'doc-1',
    accion_id: 'accion-1',
    clase_id: 'clase-1',
    puntos: 50,
    contexto: 'Test',
    fecha_otorgado: new Date(),
    accion: mockAccion,
    estudiante: mockEstudiante,
    docente: mockDocente,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PuntosService,
        {
          provide: PrismaService,
          useValue: {
            accionPuntuable: {
              findUnique: jest.fn(),
            },
            estudiante: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            docente: {
              findUnique: jest.fn(),
            },
            clase: {
              findUnique: jest.fn(),
            },
            puntoObtenido: {
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PuntosService>(PuntosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('SECURITY: Atomicity of otorgarPuntos', () => {
    it('should use transaction to ensure punto creation and estudiante update are atomic', async () => {
      // ✅ TEST: Verificar que se usa $transaction
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(mockAccion as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      // Mock transaction
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          puntoObtenido: {
            create: jest.fn().mockResolvedValue(mockPuntoObtenido),
          },
          estudiante: {
            update: jest.fn().mockResolvedValue({
              ...mockEstudiante,
              puntos_totales: 150,
            }),
          },
        });
      });

      await service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test');

      // Verificar que $transaction fue llamado
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback both operations if punto creation fails inside transaction', async () => {
      // ✅ TEST: Si falla la creación del punto, no se actualiza el estudiante
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(mockAccion as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      // Mock transaction que falla en la creación del punto
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        const txMock = {
          puntoObtenido: {
            create: jest.fn().mockRejectedValue(new Error('Database error')),
          },
          estudiante: {
            update: jest.fn(),
          },
        };
        return callback(txMock);
      });

      // Debe lanzar error y NO actualizar estudiante
      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow('Database error');

      // Verificar que la transacción fue llamada pero falló
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should rollback both operations if estudiante update fails inside transaction', async () => {
      // ✅ TEST: Si falla la actualización del estudiante, se revierte el punto creado
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(mockAccion as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      // Mock transaction que falla en la actualización del estudiante
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        const txMock = {
          puntoObtenido: {
            create: jest.fn().mockResolvedValue(mockPuntoObtenido),
          },
          estudiante: {
            update: jest.fn().mockRejectedValue(new Error('Update failed')),
          },
        };
        return callback(txMock);
      });

      // Debe lanzar error y NO dejar punto huérfano
      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow('Update failed');

      // Verificar que la transacción fue llamada pero falló
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should validate all entities BEFORE starting transaction', async () => {
      // ✅ TEST: Validaciones deben estar FUERA de la transacción (para performance)
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(null);

      // No debe llamar $transaction si falla validación previa
      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-invalid', 'clase-1', 'Test')
      ).rejects.toThrow(NotFoundException);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('REGRESSION: Existing Functionality Must Not Break', () => {
    it('should still validate accion exists and is active', async () => {
      // ✅ Test de regresión
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue({
        ...mockAccion,
        activo: false,
      } as any);

      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow('Acción puntuable no encontrada o inactiva');
    });

    it('should still validate estudiante exists', async () => {
      // ✅ Test de regresión
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(mockAccion as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(null);

      await expect(
        service.otorgarPuntos('doc-1', 'est-123', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.otorgarPuntos('doc-1', 'est-123', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow('Estudiante no encontrado');
    });

    it('should still validate estudiante is enrolled in clase when claseId provided', async () => {
      // ✅ Test de regresión
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(mockAccion as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue({
        id: 'clase-1',
        inscripciones: [], // Estudiante NO inscrito
      } as any);

      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test')
      ).rejects.toThrow('El estudiante no está inscrito en esta clase');
    });

    it('should successfully award points and return success message', async () => {
      // ✅ Test de regresión: flujo normal debe funcionar
      jest.spyOn(prisma.accionPuntuable, 'findUnique').mockResolvedValue(mockAccion as any);
      jest.spyOn(prisma.estudiante, 'findUnique').mockResolvedValue(mockEstudiante as any);
      jest.spyOn(prisma.docente, 'findUnique').mockResolvedValue(mockDocente as any);
      jest.spyOn(prisma.clase, 'findUnique').mockResolvedValue(mockClase as any);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          puntoObtenido: {
            create: jest.fn().mockResolvedValue(mockPuntoObtenido),
          },
          estudiante: {
            update: jest.fn().mockResolvedValue({
              ...mockEstudiante,
              puntos_totales: 150,
            }),
          },
        });
      });

      const result = await service.otorgarPuntos('doc-1', 'est-1', 'accion-1', 'clase-1', 'Test');

      expect(result.success).toBe(true);
      expect(result.mensaje).toContain('50 puntos');
      expect(result.mensaje).toContain('Juan Pérez');
      expect(result.puntoObtenido).toBeDefined();
    });
  });
});
