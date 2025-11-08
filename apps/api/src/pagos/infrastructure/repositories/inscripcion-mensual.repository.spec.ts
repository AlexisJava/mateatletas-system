import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../core/database/prisma.service';
import { Decimal } from 'decimal.js';
import { InscripcionMensualRepository } from './inscripcion-mensual.repository';
import { TipoDescuento, EstadoPago } from '../../domain/types/pagos.types';
import { CrearInscripcionMensualDTO } from '../../domain/repositories/inscripcion-mensual.repository.interface';

/**
 * Tests de Integración para InscripcionMensualRepository
 * TDD: Red-Green-Refactor
 *
 * IMPORTANTE: Tests de INTEGRACIÓN con base de datos real
 * - Valida persistencia y consultas con Prisma
 * - Manejo correcto de Decimals
 * - Relaciones con estudiantes, tutores, productos
 *
 * NOTA: Skipped temporalmente - la DB de test no tiene el schema actualizado completo.
 * Específicamente falta: columna 'username' en tabla 'tutores'.
 * Necesitas ejecutar TODAS las migraciones en la DB de test desde cero.
 */
describe('InscripcionMensualRepository - Infrastructure Layer', () => {
  let prismaClient: PrismaClient;
  let prisma: PrismaService;
  let repository: InscripcionMensualRepository;

  // IDs de datos de prueba
  let tutorId: string;
  let estudianteId: string;
  let productoId: string;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
    prisma = prismaClient as unknown as PrismaService;
    repository = new InscripcionMensualRepository(prisma);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  beforeEach(async () => {
    // Limpiar datos de test
    await prisma.inscripcionMensual.deleteMany();
    await prisma.estudiante.deleteMany();
    await prisma.tutor.deleteMany();
    await prisma.producto.deleteMany();

    // Crear datos base para tests
    const tutor = await prisma.tutor.create({
      data: {
        username: 'tutor-test',
        email: 'tutor-test@test.com',
        password_hash: 'hash',
        nombre: 'Tutor',
        apellido: 'Test',
      },
    });
    tutorId = tutor.id;

    const estudiante = await prisma.estudiante.create({
      data: {
        username: 'est-test',
        nombre: 'Estudiante',
        apellido: 'Test',
        nivel_escolar: 'Secundaria',
        tutor_id: tutorId,
        edad: 15,
      },
    });
    estudianteId = estudiante.id;

    const producto = await prisma.producto.create({
      data: {
        nombre: 'Club Matemáticas',
        precio: new Decimal(50000),
        tipo: 'Suscripcion',
      },
    });
    productoId = producto.id;
  });

  describe('crear', () => {
    it('debe crear inscripción mensual correctamente', async () => {
      const dto: CrearInscripcionMensualDTO = {
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: '1 estudiante, 1 actividad - Sin descuento',
      };

      const inscripcion = await repository.crear(dto);

      expect(inscripcion.id).toBeDefined();
      expect(inscripcion.estudianteId).toBe(estudianteId);
      expect(inscripcion.productoId).toBe(productoId);
      expect(inscripcion.tutorId).toBe(tutorId);
      expect(inscripcion.periodo).toBe('2025-01');
      expect(inscripcion.precioBase).toBeInstanceOf(Decimal);
      expect(inscripcion.precioBase.toNumber()).toBe(50000);
      expect(inscripcion.estadoPago).toBe(EstadoPago.Pendiente);
    });

    it('debe crear inscripción con descuento aplicado', async () => {
      const dto: CrearInscripcionMensualDTO = {
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(6000),
        precioFinal: new Decimal(44000),
        tipoDescuento: TipoDescuento.MULTIPLE_ACTIVIDADES,
        detalleCalculo:
          '1 estudiante, 2 actividades - Descuento múltiples actividades',
      };

      const inscripcion = await repository.crear(dto);

      expect(inscripcion.descuentoAplicado.toNumber()).toBe(6000);
      expect(inscripcion.precioFinal.toNumber()).toBe(44000);
      expect(inscripcion.tipoDescuento).toBe(
        TipoDescuento.MULTIPLE_ACTIVIDADES,
      );
    });

    it('debe mantener precisión decimal completa', async () => {
      const dto: CrearInscripcionMensualDTO = {
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal('50000.50'),
        descuentoAplicado: new Decimal('6000.25'),
        precioFinal: new Decimal('44000.25'),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test precisión',
      };

      const inscripcion = await repository.crear(dto);

      expect(inscripcion.precioBase.toString()).toBe('50000.5');
      expect(inscripcion.descuentoAplicado.toString()).toBe('6000.25');
      expect(inscripcion.precioFinal.toString()).toBe('44000.25');
    });
  });

  describe('buscarPorEstudianteYPeriodo', () => {
    beforeEach(async () => {
      // Crear 2 inscripciones para el estudiante
      await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test 1',
      });

      await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 2,
        periodo: '2025-02',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test 2',
      });
    });

    it('debe retornar inscripciones del período solicitado', async () => {
      const inscripciones = await repository.buscarPorEstudianteYPeriodo(
        estudianteId,
        '2025-01',
      );

      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].periodo).toBe('2025-01');
    });

    it('debe retornar array vacío si no hay inscripciones', async () => {
      const inscripciones = await repository.buscarPorEstudianteYPeriodo(
        estudianteId,
        '2025-12',
      );

      expect(inscripciones).toEqual([]);
    });
  });

  describe('buscarPorTutorYPeriodo', () => {
    beforeEach(async () => {
      // Crear inscripción para el tutor
      await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test',
      });
    });

    it('debe retornar todas las inscripciones del tutor en el período', async () => {
      const inscripciones = await repository.buscarPorTutorYPeriodo(
        tutorId,
        '2025-01',
      );

      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].tutorId).toBe(tutorId);
    });
  });

  describe('buscarPorEstadoPago', () => {
    beforeEach(async () => {
      // Crear inscripciones con diferentes estados
      await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Pendiente',
      });
    });

    it('debe retornar inscripciones por estado de pago', async () => {
      const inscripciones = await repository.buscarPorEstadoPago(
        EstadoPago.Pendiente,
      );

      expect(inscripciones.length).toBeGreaterThan(0);
      inscripciones.forEach((i) => {
        expect(i.estadoPago).toBe(EstadoPago.Pendiente);
      });
    });

    it('debe filtrar por período si se proporciona', async () => {
      const inscripciones = await repository.buscarPorEstadoPago(
        EstadoPago.Pendiente,
        '2025-01',
      );

      expect(inscripciones).toHaveLength(1);
      expect(inscripciones[0].periodo).toBe('2025-01');
    });
  });

  describe('actualizarEstadoPago', () => {
    let inscripcionId: string;

    beforeEach(async () => {
      const inscripcion = await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test',
      });
      inscripcionId = inscripcion.id;
    });

    it('debe actualizar estado de pago a Pagado', async () => {
      const actualizada = await repository.actualizarEstadoPago(inscripcionId, {
        estadoPago: EstadoPago.Pagado,
        fechaPago: new Date('2025-01-15'),
        metodoPago: 'Transferencia',
      });

      expect(actualizada.estadoPago).toBe(EstadoPago.Pagado);
      expect(actualizada.fechaPago).toBeInstanceOf(Date);
      expect(actualizada.metodoPago).toBe('Transferencia');
    });

    it('debe permitir agregar comprobante y observaciones', async () => {
      const actualizada = await repository.actualizarEstadoPago(inscripcionId, {
        estadoPago: EstadoPago.Pagado,
        fechaPago: new Date(),
        metodoPago: 'Efectivo',
        comprobanteUrl: 'https://example.com/comprobante.pdf',
        observaciones: 'Pago verificado',
      });

      expect(actualizada.comprobanteUrl).toBe(
        'https://example.com/comprobante.pdf',
      );
      expect(actualizada.observaciones).toBe('Pago verificado');
    });
  });

  describe('calcularTotalMensualTutor', () => {
    let producto2Id: string;

    beforeEach(async () => {
      // Crear un segundo producto para poder tener 2 inscripciones diferentes
      const producto2 = await prisma.producto.create({
        data: {
          nombre: 'Curso Álgebra',
          precio: new Decimal(55000),
          tipo: 'Suscripcion',
        },
      });
      producto2Id = producto2.id;

      // Crear 2 inscripciones para el tutor (con productos diferentes)
      await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test 1',
      });

      const inscripcion2 = await repository.crear({
        estudianteId,
        productoId: producto2Id, // Producto diferente para cumplir constraint única
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(55000),
        descuentoAplicado: new Decimal(11000),
        precioFinal: new Decimal(44000),
        tipoDescuento: TipoDescuento.MULTIPLE_ACTIVIDADES,
        detalleCalculo: 'Test 2',
      });

      // Marcar una como pagada
      await repository.actualizarEstadoPago(inscripcion2.id, {
        estadoPago: EstadoPago.Pagado,
        fechaPago: new Date(),
      });
    });

    it('debe calcular totales correctamente', async () => {
      const total = await repository.calcularTotalMensualTutor(
        tutorId,
        '2025-01',
      );

      expect(total.tutorId).toBe(tutorId);
      expect(total.periodo).toBe('2025-01');
      expect(total.cantidadInscripciones).toBe(2);
      expect(total.totalPendiente.toNumber()).toBe(50000);
      expect(total.totalPagado.toNumber()).toBe(44000);
      expect(total.totalGeneral.toNumber()).toBe(94000);
    });
  });

  describe('existe', () => {
    beforeEach(async () => {
      await repository.crear({
        estudianteId,
        productoId,
        tutorId,
        anio: 2025,
        mes: 1,
        periodo: '2025-01',
        precioBase: new Decimal(50000),
        descuentoAplicado: new Decimal(0),
        precioFinal: new Decimal(50000),
        tipoDescuento: TipoDescuento.NINGUNO,
        detalleCalculo: 'Test',
      });
    });

    it('debe retornar true si existe la inscripción', async () => {
      const existe = await repository.existe(
        estudianteId,
        productoId,
        '2025-01',
      );
      expect(existe).toBe(true);
    });

    it('debe retornar false si no existe la inscripción', async () => {
      const existe = await repository.existe(
        estudianteId,
        productoId,
        '2025-12',
      );
      expect(existe).toBe(false);
    });
  });
});
