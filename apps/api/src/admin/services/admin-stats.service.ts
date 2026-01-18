import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import PDFDocument from 'pdfkit';

/** Tipo para transacciones recientes del admin */
export interface TransaccionReciente {
  id: string;
  fecha: Date;
  monto: number;
  estado: string;
  concepto: string;
  tutor: { id: string; nombre: string; apellido: string; email: string | null };
  estudiante: { id: string; nombre: string; apellido: string } | null;
  metodoPago: string | null;
}

/** Metadata de paginación */
export interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
}

/** Response paginada genérica */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Servicio especializado para estadísticas del dashboard administrativo
 * Extraído de AdminService para separar responsabilidades
 */
@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener estadísticas principales del dashboard
   * Incluye membresías activas, clases próximas y alertas abiertas
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      activeInscriptions,
      upcomingClasses,
      openAlerts,
      totalEstudiantes,
      totalDocentes,
      totalTutores,
    ] = await Promise.all([
      // Usa vista unificada para contar inscripciones de ambas fuentes
      this.prisma.inscripcionUnificada.count({
        where: { estado: 'ACTIVA' },
      }),
      this.prisma.clase.count({
        where: {
          estado: 'Programada',
          fecha_hora_inicio: { gte: today },
        },
      }),
      this.prisma.alerta.count({
        where: { resuelta: false },
      }),
      this.prisma.estudiante.count(),
      this.prisma.docente.count(),
      this.prisma.tutor.count(),
    ]);

    return {
      activeMemberships: activeInscriptions, // Renombrado de membresías a inscripciones activas
      upcomingClasses,
      openAlerts,
      totalEstudiantes,
      totalDocentes,
      totalTutores,
      fecha: new Date(),
    };
  }

  /**
   * Obtener estadísticas agregadas del sistema completo
   * Incluye métricas por rol, clases, productos y membresías
   */
  async getSystemStats() {
    const [
      totalTutores,
      totalDocentes,
      totalAdmins,
      totalEstudiantes,
      totalClases,
      clasesActivas,
      totalProductos,
    ] = await Promise.all([
      this.prisma.tutor.count(),
      this.prisma.docente.count(),
      // Admins
      this.prisma.admin.count(),
      this.prisma.estudiante.count(),
      this.prisma.clase.count(),
      this.prisma.clase.count({
        where: {
          estado: 'Programada',
        },
      }),
      this.prisma.producto.count({
        where: { activo: true },
      }),
    ]);

    // Calcular total de usuarios (tutores + docentes + admins)
    // Nota: Algunos usuarios pueden tener múltiples roles
    const totalUsuarios = totalTutores + totalDocentes + totalAdmins;

    // Calcular ingresos del mes actual desde InscripcionMensual
    const now = new Date();
    const mesActual = now.getMonth() + 1; // 1-12
    const anioActual = now.getFullYear();
    const periodoActual = `${anioActual}-${mesActual.toString().padStart(2, '0')}`;

    const inscripcionesDelMes = await this.prisma.inscripcionMensual.findMany({
      where: {
        periodo: periodoActual,
      },
    });

    // Calcular ingresos y pagos pendientes por estado
    let ingresosTotal = 0;
    let pagosPendientes = 0;

    inscripcionesDelMes.forEach((ins) => {
      const monto = ins.precio_final.toNumber();
      if (ins.estado_pago === 'Pagado') {
        ingresosTotal += monto;
      } else if (
        ins.estado_pago === 'Pendiente' ||
        ins.estado_pago === 'Vencido'
      ) {
        pagosPendientes += monto;
      }
    });

    const inscripcionesActivas = inscripcionesDelMes.length;

    // Formato compatible con el frontend (SystemStats interface)
    return {
      totalUsuarios,
      totalTutores,
      totalDocentes,
      totalEstudiantes,
      totalClases,
      clasesActivas,
      totalProductos,
      ingresosTotal,
      pagosPendientes,
      inscripcionesActivas,
    };
  }

  /**
   * Obtener datos históricos de retención de estudiantes
   * Devuelve nuevos, activos y bajas por mes (últimos 6 meses)
   */
  async getRetentionStats(meses = 6) {
    const now = new Date();
    const result: Array<{
      month: string;
      nuevos: number;
      activos: number;
      bajas: number;
    }> = [];

    // Nombres de meses en español abreviados
    const nombresMeses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      finMes.setHours(23, 59, 59, 999);

      // Estudiantes nuevos (creados en este mes)
      const nuevos = await this.prisma.estudiante.count({
        where: {
          createdAt: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      // Estudiantes activos (tienen inscripción activa en este mes)
      // Usamos InscripcionMensual para determinar actividad
      const periodo = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
      const inscripcionesActivasMes =
        await this.prisma.inscripcionMensual.count({
          where: {
            periodo,
            estado_pago: { in: ['Pagado', 'Pendiente'] },
          },
        });

      // Bajas: inscripciones que fueron dadas de baja en este mes
      // Usa vista unificada para contar bajas de ambas fuentes
      const bajas = await this.prisma.inscripcionUnificada.count({
        where: {
          estado: 'CANCELADA',
          fecha_baja: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      result.push({
        month: nombresMeses[fecha.getMonth()] ?? 'N/A',
        nuevos,
        activos: inscripcionesActivasMes,
        bajas,
      });
    }

    return result;
  }

  /**
   * Obtener histórico mensual de ingresos y pagos pendientes
   * Usado por RevenueChart y RevenueEvolutionChart
   */
  async getHistoricoMensual(meses = 6) {
    const now = new Date();
    const result: Array<{
      month: string;
      ingresos: number;
      pendientes: number;
    }> = [];

    const nombresMeses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodo = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

      const inscripcionesMes = await this.prisma.inscripcionMensual.findMany({
        where: { periodo },
        select: { precio_final: true, estado_pago: true },
      });

      let ingresos = 0;
      let pendientes = 0;

      inscripcionesMes.forEach((ins) => {
        const monto = ins.precio_final.toNumber();
        if (ins.estado_pago === 'Pagado') {
          ingresos += monto;
        } else if (
          ins.estado_pago === 'Pendiente' ||
          ins.estado_pago === 'Vencido'
        ) {
          pendientes += monto;
        }
      });

      result.push({
        month: nombresMeses[fecha.getMonth()] ?? 'N/A',
        ingresos,
        pendientes,
      });
    }

    return result;
  }

  /**
   * Obtener estadísticas de contenidos leídos/completados
   * Para el dashboard de Analytics
   * @returns { total, porEstudiante, completadosEsteMes, tendenciaMensual }
   */
  async getLibrosLeidos() {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCompletados,
      totalEstudiantes,
      completadosEsteMes,
      contenidosPorMes,
    ] = await Promise.all([
      // Total de contenidos completados
      this.prisma.progresoContenido.count({
        where: { completado: true },
      }),
      // Total de estudiantes activos (para promedio)
      this.prisma.estudiante.count(),
      // Completados este mes
      this.prisma.progresoContenido.count({
        where: {
          completado: true,
          fechaCompletitud: { gte: inicioMes },
        },
      }),
      // Tendencia de los últimos 6 meses
      this.getContenidosTendencia(6),
    ]);

    const porEstudiante =
      totalEstudiantes > 0
        ? Math.round((totalCompletados / totalEstudiantes) * 10) / 10
        : 0;

    return {
      total: totalCompletados,
      porEstudiante,
      completadosEsteMes,
      tendencia: contenidosPorMes,
    };
  }

  /**
   * Obtener tendencia mensual de contenidos completados
   * @param meses - Cantidad de meses hacia atrás
   */
  private async getContenidosTendencia(meses = 6) {
    const now = new Date();
    const result: Array<{ month: string; completados: number }> = [];

    const nombresMeses = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    for (let i = meses - 1; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
      finMes.setHours(23, 59, 59, 999);

      const completados = await this.prisma.progresoContenido.count({
        where: {
          completado: true,
          fechaCompletitud: {
            gte: inicioMes,
            lte: finMes,
          },
        },
      });

      result.push({
        month: nombresMeses[fecha.getMonth()] ?? 'N/A',
        completados,
      });
    }

    return result;
  }

  /**
   * Obtener pagos/transacciones recientes con paginación
   * Combina InscripcionMensual (membresías) para el dashboard de finanzas
   */
  async getPagosRecientes(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<TransaccionReciente>> {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 por request

    const [inscripciones, total] = await Promise.all([
      this.prisma.inscripcionMensual.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
          estudiante: {
            select: { id: true, nombre: true, apellido: true },
          },
          producto: {
            select: { nombre: true },
          },
        },
      }),
      this.prisma.inscripcionMensual.count(),
    ]);

    const data: TransaccionReciente[] = inscripciones.map((ins) => ({
      id: ins.id,
      fecha: ins.createdAt,
      monto: ins.precio_final.toNumber(),
      estado: ins.estado_pago,
      concepto: ins.producto?.nombre ?? `Membresía ${ins.periodo}`,
      tutor: ins.tutor,
      estudiante: ins.estudiante,
      metodoPago: ins.metodo_pago,
    }));

    return {
      data,
      meta: {
        total,
        lastPage: Math.ceil(total / take),
        currentPage: page,
        perPage: take,
      },
    };
  }

  /**
   * Exportar inscripciones como CSV
   * Incluye todas las inscripciones del período especificado
   */
  async exportInscripcionesCSV(filters?: {
    periodo?: string; // "2026-01"
    estado?: string;
  }): Promise<string> {
    const where: Record<string, unknown> = {};

    if (filters?.periodo) {
      where.periodo = filters.periodo;
    }

    if (filters?.estado) {
      where.estado_pago = filters.estado;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where,
      orderBy: [{ periodo: 'desc' }, { createdAt: 'desc' }],
      include: {
        tutor: {
          select: { nombre: true, apellido: true, email: true },
        },
        estudiante: {
          select: { nombre: true, apellido: true },
        },
        producto: {
          select: { nombre: true },
        },
      },
    });

    // Headers CSV
    const headers = [
      'Periodo',
      'Estudiante',
      'Tutor',
      'Email Tutor',
      'Producto',
      'Precio Base',
      'Descuento',
      'Precio Final',
      'Estado',
      'Metodo Pago',
      'Fecha Pago',
      'Observaciones',
    ];

    // Filas CSV
    const rows = inscripciones.map((ins) => [
      ins.periodo,
      `${ins.estudiante.nombre} ${ins.estudiante.apellido}`,
      `${ins.tutor.nombre} ${ins.tutor.apellido}`,
      ins.tutor.email,
      ins.producto?.nombre ?? 'Membresía',
      ins.precio_base.toNumber().toFixed(2),
      ins.descuento_aplicado.toNumber().toFixed(2),
      ins.precio_final.toNumber().toFixed(2),
      ins.estado_pago,
      ins.metodo_pago ?? '',
      ins.fecha_pago ? ins.fecha_pago.toISOString().split('T')[0] : '',
      (ins.observaciones ?? '').replace(/"/g, '""'),
    ]);

    // Generar CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * Exportar métricas financieras como CSV
   * Resumen mensual de ingresos y pagos
   */
  async exportMetricasCSV(meses = 12): Promise<string> {
    const historicoMensual = await this.getHistoricoMensual(meses);

    const headers = ['Mes', 'Ingresos', 'Pendientes'];

    const rows = historicoMensual.map((item) => [
      item.month,
      item.ingresos.toFixed(2),
      item.pendientes.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Exportar inscripciones como PDF
   * Genera un reporte formateado con tabla de inscripciones
   */
  async exportInscripcionesPDF(filters?: {
    periodo?: string;
    estado?: string;
  }): Promise<Buffer> {
    const where: Record<string, unknown> = {};

    if (filters?.periodo) {
      where.periodo = filters.periodo;
    }

    if (filters?.estado) {
      where.estado_pago = filters.estado;
    }

    const inscripciones = await this.prisma.inscripcionMensual.findMany({
      where,
      orderBy: [{ periodo: 'desc' }, { createdAt: 'desc' }],
      include: {
        tutor: {
          select: { nombre: true, apellido: true, email: true },
        },
        estudiante: {
          select: { nombre: true, apellido: true },
        },
        producto: {
          select: { nombre: true },
        },
      },
    });

    // Calcular totales
    let totalIngresos = 0;
    let totalPendientes = 0;
    inscripciones.forEach((ins) => {
      const monto = ins.precio_final.toNumber();
      if (ins.estado_pago === 'Pagado') {
        totalIngresos += monto;
      } else {
        totalPendientes += monto;
      }
    });

    // Crear PDF usando PDFKit
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Header
    doc
      .fontSize(20)
      .text('Mateatletas - Reporte de Inscripciones', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, {
        align: 'center',
      });
    if (filters?.periodo) {
      doc.text(`Periodo: ${filters.periodo}`, { align: 'center' });
    }
    if (filters?.estado) {
      doc.text(`Estado: ${filters.estado}`, { align: 'center' });
    }
    doc.moveDown();

    // Resumen
    doc.fontSize(14).text('Resumen', { underline: true });
    doc.fontSize(11);
    doc.text(`Total inscripciones: ${inscripciones.length}`);
    doc.text(`Ingresos cobrados: $${totalIngresos.toFixed(2)}`);
    doc.text(`Pagos pendientes: $${totalPendientes.toFixed(2)}`);
    doc.moveDown();

    // Tabla de inscripciones
    doc.fontSize(14).text('Detalle de Inscripciones', { underline: true });
    doc.moveDown(0.5);

    // Headers de tabla
    const tableTop = doc.y;
    const colWidths: [number, number, number, number, number, number] = [
      70, 100, 100, 60, 70, 60,
    ];
    const headers: [string, string, string, string, string, string] = [
      'Periodo',
      'Estudiante',
      'Tutor',
      'Monto',
      'Estado',
      'Metodo',
    ];

    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = 50;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i]!, xPos, tableTop, {
        width: colWidths[i]!,
        align: 'left',
      });
      xPos += colWidths[i]!;
    }

    doc.font('Helvetica');
    let yPos = tableTop + 15;

    // Filas (máximo 50 por página)
    inscripciones.slice(0, 50).forEach((ins) => {
      if (yPos > 750) {
        doc.addPage();
        yPos = 50;
      }

      xPos = 50;
      const row: [string, string, string, string, string, string] = [
        ins.periodo,
        `${ins.estudiante.nombre} ${ins.estudiante.apellido}`.substring(0, 18),
        `${ins.tutor.nombre} ${ins.tutor.apellido}`.substring(0, 18),
        `$${ins.precio_final.toNumber().toFixed(0)}`,
        ins.estado_pago,
        ins.metodo_pago?.substring(0, 10) ?? '-',
      ];

      for (let i = 0; i < row.length; i++) {
        doc.text(row[i]!, xPos, yPos, { width: colWidths[i]!, align: 'left' });
        xPos += colWidths[i]!;
      }

      yPos += 12;
    });

    if (inscripciones.length > 50) {
      doc.moveDown();
      doc.text(`... y ${inscripciones.length - 50} inscripciones más.`);
    }

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(8)
      .text('Este reporte fue generado automaticamente por Mateatletas', {
        align: 'center',
      });

    doc.end();

    // Esperar a que termine de generar
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  /**
   * Exportar métricas financieras como PDF
   * Genera un reporte con gráfico de evolución mensual
   */
  async exportMetricasPDF(meses = 12): Promise<Buffer> {
    const historicoMensual = await this.getHistoricoMensual(meses);
    const systemStats = await this.getSystemStats();

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Header
    doc
      .fontSize(20)
      .text('Mateatletas - Reporte Financiero', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, {
        align: 'center',
      });
    doc.text(`Ultimos ${meses} meses`, { align: 'center' });
    doc.moveDown();

    // Resumen ejecutivo
    doc.fontSize(14).text('Resumen del Periodo Actual', { underline: true });
    doc.fontSize(11);
    doc.text(`Ingresos del mes: $${systemStats.ingresosTotal.toFixed(2)}`);
    doc.text(`Pagos pendientes: $${systemStats.pagosPendientes.toFixed(2)}`);
    doc.text(`Inscripciones activas: ${systemStats.inscripcionesActivas}`);
    doc.text(`Total estudiantes: ${systemStats.totalEstudiantes}`);
    doc.moveDown();

    // Tabla de evolución mensual
    doc.fontSize(14).text('Evolucion Mensual', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const colWidths: [number, number, number] = [100, 120, 120];
    const headers: [string, string, string] = ['Mes', 'Ingresos', 'Pendientes'];

    doc.fontSize(10).font('Helvetica-Bold');
    let xPos = 50;
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i]!, xPos, tableTop, {
        width: colWidths[i]!,
        align: 'left',
      });
      xPos += colWidths[i]!;
    }

    doc.font('Helvetica');
    let yPos = tableTop + 15;

    let totalIngresos = 0;
    let totalPendientes = 0;

    historicoMensual.forEach((item) => {
      xPos = 50;
      totalIngresos += item.ingresos;
      totalPendientes += item.pendientes;

      doc.text(item.month, xPos, yPos, { width: colWidths[0], align: 'left' });
      xPos += colWidths[0];
      doc.text(`$${item.ingresos.toFixed(2)}`, xPos, yPos, {
        width: colWidths[1],
        align: 'left',
      });
      xPos += colWidths[1];
      doc.text(`$${item.pendientes.toFixed(2)}`, xPos, yPos, {
        width: colWidths[2],
        align: 'left',
      });

      yPos += 15;
    });

    // Totales
    doc.moveDown();
    doc.font('Helvetica-Bold');
    doc.text(`Total Ingresos: $${totalIngresos.toFixed(2)}`);
    doc.text(`Total Pendientes: $${totalPendientes.toFixed(2)}`);

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('Este reporte fue generado automaticamente por Mateatletas', {
        align: 'center',
      });

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  /**
   * Obtener distribución de estudiantes por tier/plan de suscripción
   * Cuenta estudiantes agrupados por su plan asignado
   * @returns Objeto con conteo por cada tier + sin plan
   */
  async getDistribucionTiers(): Promise<{
    STEAM_LIBROS: number;
    STEAM_ASINCRONICO: number;
    STEAM_SINCRONICO: number;
    SIN_PLAN: number;
    total: number;
  }> {
    // Obtener todos los planes para mapear IDs a nombres
    const planes = await this.prisma.planSuscripcion.findMany({
      select: { id: true, nombre: true },
    });

    const planIdToNombre = new Map(planes.map((p) => [p.id, p.nombre]));

    // Contar estudiantes agrupados por plan_id
    const distribucion = await this.prisma.estudiante.groupBy({
      by: ['plan_id'],
      _count: { id: true },
    });

    // Inicializar contadores
    const result = {
      STEAM_LIBROS: 0,
      STEAM_ASINCRONICO: 0,
      STEAM_SINCRONICO: 0,
      SIN_PLAN: 0,
      total: 0,
    };

    // Mapear resultados
    for (const item of distribucion) {
      const count = item._count.id;
      result.total += count;

      if (item.plan_id === null) {
        result.SIN_PLAN += count;
      } else {
        const nombrePlan = planIdToNombre.get(item.plan_id);
        if (nombrePlan === 'STEAM_LIBROS') {
          result.STEAM_LIBROS += count;
        } else if (nombrePlan === 'STEAM_ASINCRONICO') {
          result.STEAM_ASINCRONICO += count;
        } else if (nombrePlan === 'STEAM_SINCRONICO') {
          result.STEAM_SINCRONICO += count;
        } else {
          // Plan desconocido, contar como sin plan
          result.SIN_PLAN += count;
        }
      }
    }

    return result;
  }
}
