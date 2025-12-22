import { Test, TestingModule } from '@nestjs/testing';
import { GamificacionService } from '../gamificacion.service';
import { PrismaService } from '../../core/database/prisma.service';
import { PuntosService } from '../puntos.service';
import { LogrosService } from '../logros.service';
import { RankingService } from '../ranking.service';
import { RecursosService } from '../services/recursos.service';

/**
 * GamificacionService - getProgresoEstudiante Tests
 *
 * NOTA: El sistema de rutas curriculares fue eliminado.
 * getProgresoEstudiante ahora retorna array vacío hasta que se implemente
 * el nuevo sistema de progreso basado en clases.
 *
 * Estos tests verifican el comportamiento actual (retorna []).
 */

describe('GamificacionService - getProgresoEstudiante', () => {
  let service: GamificacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificacionService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: PuntosService,
          useValue: {},
        },
        {
          provide: LogrosService,
          useValue: {},
        },
        {
          provide: RankingService,
          useValue: {},
        },
        {
          provide: RecursosService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GamificacionService>(GamificacionService);
  });

  describe('getProgresoEstudiante', () => {
    it('should return empty array (rutas curriculares system removed)', () => {
      // Act - método es síncrono ahora
      const result = service.getProgresoEstudiante('est-123');

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array for any student ID', () => {
      const result1 = service.getProgresoEstudiante('est-1');
      const result2 = service.getProgresoEstudiante('est-999');

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('should be a synchronous method', () => {
      // Verificar que el método no retorna una Promise
      const result = service.getProgresoEstudiante('est-123');

      // Si fuera async, sería una Promise
      expect(result).not.toBeInstanceOf(Promise);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
