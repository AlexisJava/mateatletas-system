import { VerificacionMorosidadService } from '../src/pagos/services/verificacion-morosidad.service';
import { PrismaService } from '../src/core/database/prisma.service';

type MockedPrisma = {
  inscripcionMensual: {
    findMany: jest.Mock;
  };
  estudiante: {
    findMany: jest.Mock;
  };
};

describe('VerificacionMorosidadService - cálculo de vencimientos', () => {
  let prisma: MockedPrisma;
  let service: VerificacionMorosidadService;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-04-15T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    prisma = {
      inscripcionMensual: {
        findMany: jest.fn(),
      },
      estudiante: {
        findMany: jest.fn(),
      },
    };

    service = new VerificacionMorosidadService(
      prisma as unknown as PrismaService,
    );
  });

  it('marca como moroso un periodo vencido sin fecha explícita', async () => {
    prisma.inscripcionMensual.findMany.mockResolvedValueOnce([
      { periodo: '2024-03', fecha_vencimiento: null },
    ]);

    const resultado = await service.esEstudianteMoroso('estudiante-1');

    expect(resultado).toBe(true);
    expect(prisma.inscripcionMensual.findMany).toHaveBeenCalledWith({
      where: {
        estudiante_id: 'estudiante-1',
        estado_pago: { in: ['Pendiente', 'Vencido'] },
      },
      select: {
        fecha_vencimiento: true,
        periodo: true,
      },
    });
  });

  it('mantiene al día un periodo actual sin fecha explícita', async () => {
    prisma.inscripcionMensual.findMany.mockResolvedValueOnce([
      { periodo: '2024-04', fecha_vencimiento: null },
    ]);

    const resultado = await service.esEstudianteMoroso('estudiante-2');

    expect(resultado).toBe(false);
    expect(prisma.inscripcionMensual.findMany).toHaveBeenCalledWith({
      where: {
        estudiante_id: 'estudiante-2',
        estado_pago: { in: ['Pendiente', 'Vencido'] },
      },
      select: {
        fecha_vencimiento: true,
        periodo: true,
      },
    });
  });

  it('detalle de acceso usa el helper para detectar cuotas vencidas', async () => {
    prisma.inscripcionMensual.findMany
      .mockResolvedValueOnce([{ periodo: '2024-03', fecha_vencimiento: null }])
      .mockResolvedValueOnce([
        { periodo: '2024-03', fecha_vencimiento: null, precio_final: 100 },
        { periodo: '2024-05', fecha_vencimiento: null, precio_final: 200 },
      ]);

    const resultado = await service.verificarAccesoEstudiante('estudiante-3');

    expect(prisma.inscripcionMensual.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        estudiante_id: 'estudiante-3',
        estado_pago: { in: ['Pendiente', 'Vencido'] },
      },
      select: {
        fecha_vencimiento: true,
        periodo: true,
      },
    });

    expect(prisma.inscripcionMensual.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        estudiante_id: 'estudiante-3',
        estado_pago: { in: ['Pendiente', 'Vencido'] },
      },
    });

    expect(resultado.permitirAcceso).toBe(false);
    expect(resultado.detalles?.periodos).toEqual(['2024-03']);
    expect(resultado.detalles?.cuotasVencidas).toBe(1);
    expect(resultado.detalles?.totalAdeudado).toBe(100);

    const fechaMasAntigua = resultado.detalles?.fechaVencimientoMasAntigua;
    expect(fechaMasAntigua).toBeInstanceOf(Date);
    expect(fechaMasAntigua?.getFullYear()).toBe(2024);
    expect(fechaMasAntigua?.getMonth()).toBe(2); // Marzo
    expect(fechaMasAntigua?.getDate()).toBe(31);
  });
});
