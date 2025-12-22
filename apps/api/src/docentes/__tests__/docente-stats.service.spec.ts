import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DocenteStatsService } from '../services/docente-stats.service';
import { DocenteBusinessValidator } from '../validators/docente-business.validator';
import { PrismaService } from '../../core/database/prisma.service';
import { DiaSemana } from '@prisma/client';

describe('DocenteStatsService', () => {
  let service: DocenteStatsService;
  let prisma: PrismaService;
  let validator: DocenteBusinessValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocenteStatsService,
        {
          provide: PrismaService,
          useValue: {
            docente: {
              findUnique: jest.fn(),
            },
            claseGrupo: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
            inscripcionClaseGrupo: {
              findMany: jest.fn(),
            },
            asistenciaClaseGrupo: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
            },
            puntoObtenido: {
              findMany: jest.fn(),
            },
            estudiante: {
              findMany: jest.fn(),
            },
            progresoEstudiantePlanificacion: {
              findMany: jest.fn(),
            },
            progresoEstudianteActividad: {
              findMany: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: DocenteBusinessValidator,
          useValue: {
            validarDocenteExiste: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocenteStatsService>(DocenteStatsService);
    prisma = module.get<PrismaService>(PrismaService);
    validator = module.get<DocenteBusinessValidator>(DocenteBusinessValidator);
  });

  describe('getDashboard', () => {
    it('should return dashboard with complete structure', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.claseGrupo, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.claseGrupo, 'count').mockResolvedValue(0);
      jest
        .spyOn(prisma.inscripcionClaseGrupo, 'findMany')
        .mockResolvedValue([]);
      jest.spyOn(prisma.asistenciaClaseGrupo, 'findMany').mockResolvedValue([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboard('docente-123');

      expect(result).toHaveProperty('claseInminente');
      expect(result).toHaveProperty('clasesHoy');
      expect(result).toHaveProperty('misGrupos');
      expect(result).toHaveProperty('estudiantesConFaltas');
      expect(result).toHaveProperty('alertas');
      expect(result).toHaveProperty('stats');
    });

    it('should return null for claseInminente if no classes today', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.claseGrupo, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.claseGrupo, 'count').mockResolvedValue(0);
      jest
        .spyOn(prisma.inscripcionClaseGrupo, 'findMany')
        .mockResolvedValue([]);
      jest.spyOn(prisma.asistenciaClaseGrupo, 'findMany').mockResolvedValue([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboard('docente-123');

      expect(result.claseInminente).toBeNull();
    });

    it('should calculate stats correctly', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.claseGrupo, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.claseGrupo, 'count')
        .mockResolvedValueOnce(2) // clasesHoy
        .mockResolvedValueOnce(5); // clasesEstaSemana
      jest
        .spyOn(prisma.inscripcionClaseGrupo, 'findMany')
        .mockResolvedValue([
          { estudiante_id: 'est-1' },
          { estudiante_id: 'est-2' },
          { estudiante_id: 'est-3' },
        ] as any);
      jest
        .spyOn(prisma.asistenciaClaseGrupo, 'findMany')
        .mockResolvedValueOnce([
          { estado: 'Presente' },
          { estado: 'Presente' },
          { estado: 'Ausente' },
        ] as any)
        .mockResolvedValueOnce([
          { estado: 'Presente' },
          { estado: 'Ausente' },
        ] as any);
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await service.getDashboard('docente-123');

      expect(result.stats.clasesHoy).toBe(2);
      expect(result.stats.clasesEstaSemana).toBe(5);
      expect(result.stats.estudiantesTotal).toBe(3);
      // asistenciaPromedio: 2/3 = 66.67 → 67%
      expect(result.stats.asistenciaPromedio).toBe(67);
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest
        .spyOn(validator, 'validarDocenteExiste')
        .mockRejectedValue(new NotFoundException('Docente no encontrado'));

      await expect(service.getDashboard('docente-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getEstadisticasCompletas', () => {
    it('should return complete statistics structure', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest
        .spyOn(prisma.inscripcionClaseGrupo, 'findMany')
        .mockResolvedValue([]);
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.claseGrupo, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.puntoObtenido, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.asistenciaClaseGrupo, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.progresoEstudiantePlanificacion, 'findMany')
        .mockResolvedValue([]);
      jest
        .spyOn(prisma.progresoEstudianteActividad, 'findMany')
        .mockResolvedValue([]);

      const result = await service.getEstadisticasCompletas('docente-123');

      expect(result).toHaveProperty('topEstudiantesPorPuntos');
      expect(result).toHaveProperty('estudiantesAsistenciaPerfecta');
      expect(result).toHaveProperty('estudiantesSinTareas');
      expect(result).toHaveProperty('rankingGruposPorPuntos');
    });

    it('should return top 10 estudiantes by puntos', async () => {
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.inscripcionClaseGrupo, 'findMany').mockResolvedValue([
        { estudiante_id: 'est-1', clase_grupo_id: 'grupo-1' },
        { estudiante_id: 'est-2', clase_grupo_id: 'grupo-1' },
      ] as never);
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([
        { id: 'est-1', nombre: 'Juan', apellido: 'Perez', fotoUrl: null },
        { id: 'est-2', nombre: 'Maria', apellido: 'Gomez', fotoUrl: null },
      ] as never);
      jest
        .spyOn(prisma.claseGrupo, 'findMany')
        .mockResolvedValue([
          { id: 'grupo-1', nombre: 'Grupo A', codigo: 'GA', cupo_maximo: 10 },
        ] as never);
      jest.spyOn(prisma.puntoObtenido, 'findMany').mockResolvedValue([
        { estudiante_id: 'est-1', puntos: 100 },
        { estudiante_id: 'est-1', puntos: 50 },
        { estudiante_id: 'est-2', puntos: 80 },
      ] as never);
      jest.spyOn(prisma.asistenciaClaseGrupo, 'findMany').mockResolvedValue([]);
      // Mock groupBy para las optimizaciones N+1
      jest.spyOn(prisma.asistenciaClaseGrupo, 'groupBy').mockResolvedValue([]);
      jest
        .spyOn(prisma.progresoEstudiantePlanificacion, 'findMany')
        .mockResolvedValue([]);
      jest
        .spyOn(prisma.progresoEstudianteActividad, 'findMany')
        .mockResolvedValue([]);

      const result = await service.getEstadisticasCompletas('docente-123');

      expect(result.topEstudiantesPorPuntos).toHaveLength(2);
      // est-1: 100 + 50 = 150 puntos (primero)
      expect(result.topEstudiantesPorPuntos[0].nombre).toBe('Juan');
      expect(result.topEstudiantesPorPuntos[0].xp_total).toBe(150);
      // est-2: 80 puntos (segundo)
      expect(result.topEstudiantesPorPuntos[1].nombre).toBe('Maria');
      expect(result.topEstudiantesPorPuntos[1].xp_total).toBe(80);
    });

    it('should return empty estudiantesSinTareas (tareas system not implemented)', async () => {
      // Sistema de tareas (Planificaciones) no implementado
      // calcularEstudiantesSinTareas retorna array vacío
      jest.spyOn(validator, 'validarDocenteExiste').mockResolvedValue();
      jest.spyOn(prisma.inscripcionClaseGrupo, 'findMany').mockResolvedValue([
        { estudiante_id: 'est-1', clase_grupo_id: 'grupo-1' },
        { estudiante_id: 'est-2', clase_grupo_id: 'grupo-1' },
      ] as never);
      jest.spyOn(prisma.estudiante, 'findMany').mockResolvedValue([
        { id: 'est-1', nombre: 'Juan', apellido: 'Perez', fotoUrl: null },
        { id: 'est-2', nombre: 'Maria', apellido: 'Gomez', fotoUrl: null },
      ] as never);
      jest
        .spyOn(prisma.claseGrupo, 'findMany')
        .mockResolvedValue([
          { id: 'grupo-1', nombre: 'Grupo A', codigo: 'GA', cupo_maximo: 10 },
        ] as never);
      jest.spyOn(prisma.puntoObtenido, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.asistenciaClaseGrupo, 'findMany').mockResolvedValue([]);
      // Mock groupBy para las optimizaciones N+1
      jest.spyOn(prisma.asistenciaClaseGrupo, 'groupBy').mockResolvedValue([]);
      jest
        .spyOn(prisma.progresoEstudiantePlanificacion, 'findMany')
        .mockResolvedValue([]);
      jest
        .spyOn(prisma.progresoEstudianteActividad, 'findMany')
        .mockResolvedValue([]);

      const result = await service.getEstadisticasCompletas('docente-123');

      // Sistema de tareas no implementado - retorna array vacío
      expect(result.estudiantesSinTareas).toEqual([]);
    });

    it('should throw NotFoundException if docente does not exist', async () => {
      jest
        .spyOn(validator, 'validarDocenteExiste')
        .mockRejectedValue(new NotFoundException('Docente no encontrado'));

      await expect(
        service.getEstadisticasCompletas('docente-999'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
