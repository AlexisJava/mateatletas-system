import { Test, TestingModule } from '@nestjs/testing';
import { PinGeneratorService } from '../pin-generator.service';
import { PrismaService } from '../../../core/database/prisma.service';

describe('PinGeneratorService', () => {
  let service: PinGeneratorService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinGeneratorService,
        {
          provide: PrismaService,
          useValue: {
            estudiante: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PinGeneratorService>(PinGeneratorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUniquePin', () => {
    it('debe generar un PIN de 4 dígitos', async () => {
      const existsCheck = jest.fn().mockResolvedValue(null);

      const pin = await service.generateUniquePin('estudiante', existsCheck);

      expect(pin).toMatch(/^\d{4}$/);
      expect(existsCheck).toHaveBeenCalledWith(pin);
    });

    it('debe generar un PIN único cuando el primero colisiona', async () => {
      let attempts = 0;
      const existsCheck = jest.fn().mockImplementation((pin: string) => {
        attempts++;
        // Primera llamada retorna un registro (colisión), segunda retorna null (PIN único)
        return attempts === 1 ? { id: '123', pin } : null;
      });

      const pin = await service.generateUniquePin('estudiante', existsCheck);

      expect(pin).toMatch(/^\d{4}$/);
      expect(existsCheck).toHaveBeenCalledTimes(2); // Primera colisionó, segunda fue exitosa
    });

    it('debe lanzar error si no puede generar PIN único después de MAX_RETRIES', async () => {
      const existsCheck = jest.fn().mockResolvedValue({ id: '123', pin: '1234' });

      await expect(
        service.generateUniquePin('estudiante', existsCheck),
      ).rejects.toThrow('Failed to generate unique PIN for estudiante after 10 attempts');

      expect(existsCheck).toHaveBeenCalledTimes(10);
    });

    it('debe verificar unicidad contra la base de datos', async () => {
      const mockEstudiante = { id: '123', nombre: 'Juan', pin: '1234' };
      const existsCheck = jest.fn()
        .mockResolvedValueOnce(mockEstudiante) // Primera llamada: PIN existe
        .mockResolvedValueOnce(null); // Segunda llamada: PIN único

      const pin = await service.generateUniquePin('estudiante', existsCheck);

      expect(pin).toMatch(/^\d{4}$/);
      expect(pin).not.toBe('1234'); // No debe ser el PIN que colisionó
      expect(existsCheck).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateMultiplePins', () => {
    it('debe generar múltiples PINs únicos', async () => {
      const existsCheck = jest.fn().mockResolvedValue(null);

      const pins = await service.generateMultiplePins(3, 'estudiante', existsCheck);

      expect(pins).toHaveLength(3);
      pins.forEach(pin => {
        expect(pin).toMatch(/^\d{4}$/);
      });

      // Verificar que todos los PINs sean únicos
      const uniquePins = new Set(pins);
      expect(uniquePins.size).toBe(3);
    });

    it('debe generar PINs únicos incluso cuando algunos colisionan en la base de datos', async () => {
      const usedPins = new Set(['1234', '5678']);
      const existsCheck = jest.fn().mockImplementation((pin: string) => {
        if (usedPins.has(pin)) {
          return { id: '123', pin }; // PIN existe
        }
        return null; // PIN único
      });

      const pins = await service.generateMultiplePins(3, 'estudiante', existsCheck);

      expect(pins).toHaveLength(3);
      pins.forEach(pin => {
        expect(pin).toMatch(/^\d{4}$/);
        expect(usedPins.has(pin)).toBe(false); // No debe incluir PINs usados
      });

      // Verificar que todos los PINs sean únicos entre sí
      const uniquePins = new Set(pins);
      expect(uniquePins.size).toBe(3);
    });

    it('debe lanzar error si no puede generar el conjunto completo de PINs', async () => {
      // Simular que todos los PINs colisionan
      const existsCheck = jest.fn().mockResolvedValue({ id: '123', pin: '1234' });

      await expect(
        service.generateMultiplePins(2, 'estudiante', existsCheck),
      ).rejects.toThrow('Failed to generate unique PIN for estudiante after 10 attempts');
    });

    it('debe evitar duplicados dentro del mismo conjunto generado', async () => {
      // Mock que retorna null (PIN único) pero puede generar el mismo número aleatoriamente
      const existsCheck = jest.fn().mockResolvedValue(null);

      const pins = await service.generateMultiplePins(5, 'estudiante', existsCheck);

      expect(pins).toHaveLength(5);

      // Verificar que no hay duplicados
      const uniquePins = new Set(pins);
      expect(uniquePins.size).toBe(5);
    });
  });
});
