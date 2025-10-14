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
      activeMemberships,
      upcomingClasses,
      openAlerts,
      totalEstudiantes,
      totalDocentes,
      totalTutores,
    ] = await Promise.all([
      this.prisma.membresia.count({
        where: { estado: 'Activa' },
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
      activeMemberships,
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
      membresias,
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

    // Convertir membresías agrupadas a objeto clave-valor
    const membresiasPorEstado: Record<string, number> = {};
    membresias.forEach((m) => {
      membresiasPorEstado[m.estado] = m._count;
    });

    return {
      usuarios: {
        tutores: totalTutores,
        docentes: totalDocentes,
        admins: totalAdmins,
        estudiantes: totalEstudiantes,
      },
      clases: {
        total: totalClases,
        activas: clasesActivas,
      },
      productos: {
        total: totalProductos,
      },
      membresias: membresiasPorEstado,
      fecha: new Date(),
    };
  }
}
