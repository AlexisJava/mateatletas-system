import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { PaymentCommandService } from '../payment-command.service';
import { PaymentStateMapperService } from '../payment-state-mapper.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { EstadoPago } from '../../../domain/constants';

describe('PaymentCommandService', () => {
  let service: PaymentCommandService;
  let prismaService: jest.Mocked<PrismaService>;
  let stateMapper: jest.Mocked<PaymentStateMapperService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentCommandService,
        {
          provide: PrismaService,
          useValue: {
            inscripcionMensual: {
              findMany: jest.fn(),
              updateMany: jest.fn(),
              update: jest.fn(),
            },
            membresia: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: PaymentStateMapperService,
          useValue: {
            mapearEstadoMembresia: jest.fn(),
            mapearEstadoInscripcion: jest.fn(),
            esPagoExitoso: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentCommandService>(PaymentCommandService);
    prismaService = module.get(PrismaService);
    stateMapper = module.get(PaymentStateMapperService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registrarPagoManual', () => {
    it('debe registrar pago manual exitosamente', async () => {
      const dto = {
        estudianteId: 'EST001',
        tutorId: 'TUT001',
      };

      const mockInscripciones = [
        {
          id: 'INS001',
          estudiante_id: 'EST001',
          tutor_id: 'TUT001',
          periodo: '2025-01',
          estado_pago: 'Pendiente',
          precio_final: 100,
          estudiante: {
            nombre: 'Juan',
            apellido: 'Pérez',
          },
        },
        {
          id: 'INS002',
          estudiante_id: 'EST001',
          tutor_id: 'TUT001',
          periodo: '2025-01',
          estado_pago: 'Pendiente',
          precio_final: 150,
          estudiante: {
            nombre: 'Juan',
            apellido: 'Pérez',
          },
        },
      ];

      prismaService.inscripcionMensual.findMany.mockResolvedValue(
        mockInscripciones as any,
      );
      prismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 2,
      } as any);

      const result = await service.registrarPagoManual(dto);

      expect(result.success).toBe(true);
      expect(result.cantidadInscripciones).toBe(2);
      expect(result.montoTotal).toBe(250);
      expect(result.estudianteNombre).toBe('Juan Pérez');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'pago.registrado_manual',
        expect.objectContaining({
          estudianteId: 'EST001',
          tutorId: 'TUT001',
        }),
      );
    });

    it('debe lanzar BadRequestException si no hay inscripciones pendientes', async () => {
      const dto = {
        estudianteId: 'EST001',
        tutorId: 'TUT001',
      };

      prismaService.inscripcionMensual.findMany.mockResolvedValue([]);

      await expect(service.registrarPagoManual(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe usar método de pago personalizado si se proporciona', async () => {
      const dto = {
        estudianteId: 'EST001',
        tutorId: 'TUT001',
        metodoPago: 'Transferencia',
      };

      const mockInscripciones = [
        {
          id: 'INS001',
          estudiante_id: 'EST001',
          tutor_id: 'TUT001',
          periodo: '2025-01',
          estado_pago: 'Pendiente',
          precio_final: 100,
          estudiante: {
            nombre: 'María',
            apellido: 'López',
          },
        },
      ];

      prismaService.inscripcionMensual.findMany.mockResolvedValue(
        mockInscripciones as any,
      );
      prismaService.inscripcionMensual.updateMany.mockResolvedValue({
        count: 1,
      } as any);

      const result = await service.registrarPagoManual(dto);

      expect(result.metodoPago).toBe('Transferencia');
    });
  });

  describe('actualizarEstadoMembresia', () => {
    it('debe actualizar estado de membresía a Activa', async () => {
      const membresiaId = 'MEM001';
      const estadoPago = EstadoPago.PAGADO;

      stateMapper.mapearEstadoMembresia.mockReturnValue('Activa');

      const mockMembresia = {
        id: membresiaId,
        estado: 'Activa',
        fecha_inicio: new Date(),
        fecha_proximo_pago: new Date(),
      };

      prismaService.membresia.update.mockResolvedValue(mockMembresia as any);

      const result = await service.actualizarEstadoMembresia(
        membresiaId,
        estadoPago,
      );

      expect(result.estado).toBe('Activa');
      expect(stateMapper.mapearEstadoMembresia).toHaveBeenCalledWith(
        estadoPago,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'membresia.estado_actualizado',
        expect.objectContaining({
          membresiaId,
          estadoPago,
          estadoMembresia: 'Activa',
        }),
      );
    });

    it('debe actualizar estado de membresía a Pendiente', async () => {
      const membresiaId = 'MEM002';
      const estadoPago = EstadoPago.RECHAZADO;

      stateMapper.mapearEstadoMembresia.mockReturnValue('Pendiente');

      const mockMembresia = {
        id: membresiaId,
        estado: 'Pendiente',
      };

      prismaService.membresia.update.mockResolvedValue(mockMembresia as any);

      const result = await service.actualizarEstadoMembresia(
        membresiaId,
        estadoPago,
      );

      expect(result.estado).toBe('Pendiente');
    });
  });

  describe('actualizarEstadoInscripcion', () => {
    it('debe actualizar estado de inscripción a Pagado', async () => {
      const inscripcionId = 'INS001';
      const estadoPago = EstadoPago.PAGADO;

      stateMapper.mapearEstadoInscripcion.mockReturnValue('Pagado');
      stateMapper.esPagoExitoso.mockReturnValue(true);

      const mockInscripcion = {
        id: inscripcionId,
        estado_pago: 'Pagado',
        fecha_pago: new Date(),
      };

      prismaService.inscripcionMensual.update.mockResolvedValue(
        mockInscripcion as any,
      );

      const result = await service.actualizarEstadoInscripcion(
        inscripcionId,
        estadoPago,
      );

      expect(result.estado_pago).toBe('Pagado');
      expect(stateMapper.mapearEstadoInscripcion).toHaveBeenCalledWith(
        estadoPago,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'inscripcion.estado_actualizado',
        expect.objectContaining({
          inscripcionId,
          estadoPago,
          estadoInscripcion: 'Pagado',
        }),
      );
    });

    it('debe actualizar estado de inscripción a Pendiente sin fecha de pago', async () => {
      const inscripcionId = 'INS002';
      const estadoPago = EstadoPago.RECHAZADO;

      stateMapper.mapearEstadoInscripcion.mockReturnValue('Pendiente');
      stateMapper.esPagoExitoso.mockReturnValue(false);

      const mockInscripcion = {
        id: inscripcionId,
        estado_pago: 'Pendiente',
        fecha_pago: null,
      };

      prismaService.inscripcionMensual.update.mockResolvedValue(
        mockInscripcion as any,
      );

      const result = await service.actualizarEstadoInscripcion(
        inscripcionId,
        estadoPago,
      );

      expect(result.estado_pago).toBe('Pendiente');
      expect(result.fecha_pago).toBeNull();
    });
  });

  describe('actualizarMembresiaConPreferencia', () => {
    it('debe actualizar membresía con ID de preferencia', async () => {
      const membresiaId = 'MEM001';
      const preferenciaId = 'PREF123';

      const mockMembresia = {
        id: membresiaId,
        preferencia_id: preferenciaId,
      };

      prismaService.membresia.update.mockResolvedValue(mockMembresia as any);

      const result = await service.actualizarMembresiaConPreferencia(
        membresiaId,
        preferenciaId,
      );

      expect(result.preferencia_id).toBe(preferenciaId);
      expect(prismaService.membresia.update).toHaveBeenCalledWith({
        where: { id: membresiaId },
        data: { preferencia_id: preferenciaId },
      });
    });
  });
});
