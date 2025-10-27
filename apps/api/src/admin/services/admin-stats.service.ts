import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

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
      _membresias,
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
      this.prisma.membresia.groupBy({
        by: ['estado'],
        _count: true,
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
}
