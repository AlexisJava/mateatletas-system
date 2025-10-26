import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { Decimal } from 'decimal.js';
import { ConfiguracionPreciosRepository } from './configuracion-precios.repository';
import { ConfiguracionPrecios } from '../../domain/types/pagos.types';

/**
 * Tests de Integración para ConfiguracionPreciosRepository
 * TDD: Red-Green-Refactor
 *
 * IMPORTANTE: Estos son tests de INTEGRACIÓN (no unitarios)
 * - Requieren base de datos real
 * - Usan Prisma Client real
 * - Validan persistencia y consultas reales
 *
 * Clean Architecture:
 * - Infrastructure Layer implementa interfaces del Domain
 * - Convierte entre tipos de Prisma y tipos del Domain
 * - Maneja la persistencia con Decimal correctamente
 */
describe('ConfiguracionPreciosRepository - Infrastructure Layer', () => {
  let prismaClient: PrismaClient;
  let prisma: PrismaService;
  let repository: ConfiguracionPreciosRepository;

  beforeAll(async () => {
    // Inicializar Prisma con base de datos de test
    prismaClient = new PrismaClient();
    prisma = prismaClient as unknown as PrismaService;
    repository = new ConfiguracionPreciosRepository(prisma);
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await prismaClient.$disconnect();
  });

  beforeEach(async () => {
    // Limpiar datos de test antes de cada test
    await prisma.historialCambioPrecios.deleteMany();
    await prisma.configuracionPrecios.deleteMany();
  });

  describe('obtenerConfiguracion', () => {
    it('debe retornar null si no existe configuración', async () => {
      const config = await repository.obtenerConfiguracion();
      expect(config).toBeNull();
    });

    it('debe retornar la configuración singleton existente', async () => {
      // Crear configuración en la DB
      await prisma.configuracionPrecios.create({
        data: {
          id: 'singleton',
          precio_club_matematicas: new Decimal(50000),
          precio_cursos_especializados: new Decimal(55000),
          precio_multiple_actividades: new Decimal(44000),
          precio_hermanos_basico: new Decimal(44000),
          precio_hermanos_multiple: new Decimal(38000),
          descuento_aacrea_porcentaje: new Decimal(20),
          descuento_aacrea_activo: true,
        },
      });

      const config = await repository.obtenerConfiguracion();

      expect(config).not.toBeNull();
      expect(config!.precioClubMatematicas).toBeInstanceOf(Decimal);
      expect(config!.precioClubMatematicas.toNumber()).toBe(50000);
      expect(config!.precioCursosEspecializados.toNumber()).toBe(55000);
      expect(config!.precioMultipleActividades.toNumber()).toBe(44000);
      expect(config!.descuentoAacreaPorcentaje.toNumber()).toBe(20);
      expect(config!.descuentoAacreaActivo).toBe(true);
    });

    it('debe convertir correctamente tipos de Prisma a tipos del Domain', async () => {
      await prisma.configuracionPrecios.create({
        data: {
          id: 'singleton',
          precio_club_matematicas: new Decimal(50000),
          precio_cursos_especializados: new Decimal(55000),
          precio_multiple_actividades: new Decimal(44000),
          precio_hermanos_basico: new Decimal(44000),
          precio_hermanos_multiple: new Decimal(38000),
          descuento_aacrea_porcentaje: new Decimal(20),
          descuento_aacrea_activo: true,
        },
      });

      const config = await repository.obtenerConfiguracion();

      // Verificar que todos los Decimals sean instancias de Decimal
      expect(config!.precioClubMatematicas).toBeInstanceOf(Decimal);
      expect(config!.precioCursosEspecializados).toBeInstanceOf(Decimal);
      expect(config!.precioMultipleActividades).toBeInstanceOf(Decimal);
      expect(config!.precioHermanosBasico).toBeInstanceOf(Decimal);
      expect(config!.precioHermanosMultiple).toBeInstanceOf(Decimal);
      expect(config!.descuentoAacreaPorcentaje).toBeInstanceOf(Decimal);
    });
  });

  describe('actualizarConfiguracion', () => {
    beforeEach(async () => {
      // Crear configuración inicial
      await prisma.configuracionPrecios.create({
        data: {
          id: 'singleton',
          precio_club_matematicas: new Decimal(50000),
          precio_cursos_especializados: new Decimal(55000),
          precio_multiple_actividades: new Decimal(44000),
          precio_hermanos_basico: new Decimal(44000),
          precio_hermanos_multiple: new Decimal(38000),
          descuento_aacrea_porcentaje: new Decimal(20),
          descuento_aacrea_activo: true,
        },
      });
    });

    it('debe actualizar precio de Club Matemáticas', async () => {
      const actualizacion: Partial<ConfiguracionPrecios> = {
        precioClubMatematicas: new Decimal(52000),
      };

      const resultado = await repository.actualizarConfiguracion(
        actualizacion,
        'admin-1',
        'Ajuste inflacionario',
      );

      expect(resultado.precioClubMatematicas.toNumber()).toBe(52000);
      // Verificar que otros valores no cambiaron
      expect(resultado.precioCursosEspecializados.toNumber()).toBe(55000);
    });

    it('debe actualizar múltiples campos a la vez', async () => {
      const actualizacion: Partial<ConfiguracionPrecios> = {
        precioClubMatematicas: new Decimal(52000),
        precioCursosEspecializados: new Decimal(57000),
        descuentoAacreaPorcentaje: new Decimal(25),
      };

      const resultado = await repository.actualizarConfiguracion(
        actualizacion,
        'admin-1',
        'Actualización múltiple',
      );

      expect(resultado.precioClubMatematicas.toNumber()).toBe(52000);
      expect(resultado.precioCursosEspecializados.toNumber()).toBe(57000);
      expect(resultado.descuentoAacreaPorcentaje.toNumber()).toBe(25);
    });

    it('debe crear registro en historial de cambios', async () => {
      const actualizacion: Partial<ConfiguracionPrecios> = {
        precioClubMatematicas: new Decimal(52000),
      };

      await repository.actualizarConfiguracion(
        actualizacion,
        'admin-1',
        'Test de auditoría',
      );

      const historial = await prisma.historialCambioPrecios.findMany();
      expect(historial).toHaveLength(1);
      expect(historial[0].admin_id).toBe('admin-1');
      expect(historial[0].motivo_cambio).toBe('Test de auditoría');
      expect(historial[0].valores_anteriores).toBeDefined();
      expect(historial[0].valores_nuevos).toBeDefined();
    });

    it('debe guardar valores anteriores y nuevos en historial', async () => {
      const actualizacion: Partial<ConfiguracionPrecios> = {
        precioClubMatematicas: new Decimal(52000),
      };

      await repository.actualizarConfiguracion(
        actualizacion,
        'admin-1',
        'Test',
      );

      const historial = await prisma.historialCambioPrecios.findFirst();
      const valoresAnteriores = historial!.valores_anteriores as any;
      const valoresNuevos = historial!.valores_nuevos as any;

      expect(valoresAnteriores.precio_club_matematicas).toBe('50000');
      expect(valoresNuevos.precio_club_matematicas).toBe('52000');
    });

    it('debe permitir actualizar sin motivo (opcional)', async () => {
      const actualizacion: Partial<ConfiguracionPrecios> = {
        precioClubMatematicas: new Decimal(52000),
      };

      const resultado = await repository.actualizarConfiguracion(
        actualizacion,
        'admin-1',
      );

      expect(resultado.precioClubMatematicas.toNumber()).toBe(52000);

      const historial = await prisma.historialCambioPrecios.findFirst();
      expect(historial!.motivo_cambio).toBeNull();
    });

    it('debe persistir cambios correctamente en la base de datos', async () => {
      const actualizacion: Partial<ConfiguracionPrecios> = {
        precioClubMatematicas: new Decimal(52000),
        descuentoAacreaActivo: false,
      };

      await repository.actualizarConfiguracion(actualizacion, 'admin-1');

      // Re-obtener desde DB para verificar persistencia
      const configPersistida = await prisma.configuracionPrecios.findUnique({
        where: { id: 'singleton' },
      });

      expect(configPersistida!.precio_club_matematicas.toNumber()).toBe(52000);
      expect(configPersistida!.descuento_aacrea_activo).toBe(false);
    });
  });

  describe('obtenerHistorialCambios', () => {
    beforeEach(async () => {
      // Crear configuración inicial
      await prisma.configuracionPrecios.create({
        data: {
          id: 'singleton',
          precio_club_matematicas: new Decimal(50000),
          precio_cursos_especializados: new Decimal(55000),
          precio_multiple_actividades: new Decimal(44000),
          precio_hermanos_basico: new Decimal(44000),
          precio_hermanos_multiple: new Decimal(38000),
          descuento_aacrea_porcentaje: new Decimal(20),
          descuento_aacrea_activo: true,
        },
      });
    });

    it('debe retornar historial vacío si no hay cambios', async () => {
      const historial = await repository.obtenerHistorialCambios();
      expect(historial).toEqual([]);
    });

    it('debe retornar historial de cambios ordenado por fecha descendente', async () => {
      // Hacer varios cambios
      await repository.actualizarConfiguracion(
        { precioClubMatematicas: new Decimal(51000) },
        'admin-1',
        'Cambio 1',
      );
      await new Promise((resolve) => setTimeout(resolve, 10)); // Esperar para diferencia de tiempo

      await repository.actualizarConfiguracion(
        { precioClubMatematicas: new Decimal(52000) },
        'admin-1',
        'Cambio 2',
      );

      const historial = await repository.obtenerHistorialCambios();

      expect(historial).toHaveLength(2);
      // El más reciente primero
      expect(historial[0].motivoCambio).toBe('Cambio 2');
      expect(historial[1].motivoCambio).toBe('Cambio 1');
    });

    it('debe respetar el límite de registros', async () => {
      // Crear 5 cambios
      for (let i = 1; i <= 5; i++) {
        await repository.actualizarConfiguracion(
          { precioClubMatematicas: new Decimal(50000 + i * 1000) },
          'admin-1',
          `Cambio ${i}`,
        );
      }

      const historial = await repository.obtenerHistorialCambios(3);
      expect(historial).toHaveLength(3);
    });

    it('debe incluir todos los campos necesarios del historial', async () => {
      await repository.actualizarConfiguracion(
        { precioClubMatematicas: new Decimal(52000) },
        'admin-1',
        'Test completo',
      );

      const historial = await repository.obtenerHistorialCambios();

      expect(historial[0]).toMatchObject({
        id: expect.any(String),
        adminId: 'admin-1',
        motivoCambio: 'Test completo',
        fechaCambio: expect.any(Date),
      });
      expect(historial[0].valoresAnteriores).toBeDefined();
      expect(historial[0].valoresNuevos).toBeDefined();
    });
  });

  describe('Manejo de Decimals', () => {
    it('debe mantener precisión decimal completa', async () => {
      await prisma.configuracionPrecios.create({
        data: {
          id: 'singleton',
          precio_club_matematicas: new Decimal('50000.50'),
          precio_cursos_especializados: new Decimal('55000.75'),
          precio_multiple_actividades: new Decimal(44000),
          precio_hermanos_basico: new Decimal(44000),
          precio_hermanos_multiple: new Decimal(38000),
          descuento_aacrea_porcentaje: new Decimal('20.50'),
          descuento_aacrea_activo: true,
        },
      });

      const config = await repository.obtenerConfiguracion();

      expect(config!.precioClubMatematicas.toString()).toBe('50000.5');
      expect(config!.precioCursosEspecializados.toString()).toBe('55000.75');
      expect(config!.descuentoAacreaPorcentaje.toString()).toBe('20.5');
    });
  });
});
