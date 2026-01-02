import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

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
      this.prisma.inscripcionClaseGrupo.count({
        where: { fecha_baja: null },
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
      const bajas = await this.prisma.inscripcionClaseGrupo.count({
        where: {
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
}
