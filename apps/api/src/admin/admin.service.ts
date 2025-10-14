import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { Role } from '../auth/decorators/roles.decorator';
import { AdminStatsService } from './services/admin-stats.service';
import { AdminAlertasService } from './services/admin-alertas.service';
import { AdminUsuariosService } from './services/admin-usuarios.service';

type TutorRecordWithRelations = Prisma.TutorGetPayload<{
  include: {
    _count: {
      select: {
        estudiantes: true;
        membresias: true;
        inscripciones_clase: true;
      },
    },
  },
}>;

type DocenteRecordWithRelations = Prisma.DocenteGetPayload<{
  include: {
    _count: {
      select: {
        clases: true;
      },
    },
  },
}>;

type UserRecordWithDependencies =
  | { role: Role.Tutor; record: TutorRecordWithRelations }
  | { role: Role.Docente; record: DocenteRecordWithRelations }
  | { role: Role.Admin; record: Prisma.AdminGetPayload<{}> };

/**
 * Servicio principal de administración
 * REFACTORIZADO: Delega operaciones específicas a servicios especializados
 * Mantiene compatibilidad con controlador existente actuando como facade
 */
@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private statsService: AdminStatsService,
    private alertasService: AdminAlertasService,
    private usuariosService: AdminUsuariosService,
  ) {}

  /**
   * Obtener estadísticas del dashboard administrativo
   */
  async getDashboardStats() {
    // Obtener fecha de inicio del día de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Contar suscripciones activas
    const activeMemberships = await this.prisma.membresia.count({
      where: { estado: 'Activa' },
    });

    // Contar clases programadas desde hoy en adelante
    const upcomingClasses = await this.prisma.clase.count({
      where: {
        estado: 'Programada',
        fecha_hora_inicio: {
          gte: today,
        },
      },
    });

    // Contar alertas pendientes (no resueltas)
    const openAlerts = await this.prisma.alerta.count({
      where: { resuelta: false },
    });

    // Estadísticas adicionales
    const totalEstudiantes = await this.prisma.estudiante.count();
    const totalDocentes = await this.prisma.docente.count();
    const totalTutores = await this.prisma.tutor.count();

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
   * Obtener estadísticas agregadas para el panel administrativo
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
      this.prisma.admin.count(),
      this.prisma.estudiante.count(),
      this.prisma.clase.count(),
      this.prisma.clase.count({
        where: { estado: 'Programada' },
      }),
      this.prisma.producto.count(),
      this.prisma.membresia.findMany({
        include: {
          producto: {
            select: {
              precio: true,
            },
          },
        },
      }),
    ]);

    const ingresosTotal = membresias.reduce((acumulado, membresia) => {
      const precio = membresia.producto?.precio;
      return acumulado + (precio ? Number(precio) : 0);
    }, 0);

    return {
      totalUsuarios: totalTutores + totalDocentes + totalAdmins,
      totalTutores,
      totalDocentes,
      totalEstudiantes,
      totalClases,
      clasesActivas,
      totalProductos,
      ingresosTotal,
    };
  }

  /**
   * Listar alertas pendientes (no resueltas)
   */
  async listarAlertas() {
    const alertas = await this.prisma.alerta.findMany({
      where: { resuelta: false },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            nivel_escolar: true,
          },
        },
        clase: {
          select: {
            id: true,
            fecha_hora_inicio: true,
            duracion_minutos: true,
            rutaCurricular: {
              select: {
                nombre: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return alertas.map((alerta) => ({
      id: alerta.id,
      descripcion: alerta.descripcion,
      fecha: alerta.fecha,
      resuelta: alerta.resuelta,
      estudiante: alerta.estudiante,
      clase: {
        id: alerta.clase.id,
        fecha_hora_inicio: alerta.clase.fecha_hora_inicio,
        duracion_minutos: alerta.clase.duracion_minutos,
        rutaCurricular: alerta.clase.rutaCurricular.nombre,
        color: alerta.clase.rutaCurricular.color,
      },
      createdAt: alerta.createdAt,
    }));
  }

  /**
   * Marcar una alerta como resuelta
   */
  async resolverAlerta(id: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
    });

    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    await this.prisma.alerta.update({
      where: { id },
      data: { resuelta: true },
    });

    return {
      message: 'Alerta marcada como resuelta',
      alertaId: id,
    };
  }

  /**
   * Generar sugerencia para resolver una alerta
   * Por ahora retorna una sugerencia estática
   * TODO: Integrar con OpenAI para sugerencias dinámicas
   */
  async sugerirSolucion(alertaId: string) {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id: alertaId },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
            nivel_escolar: true,
          },
        },
        clase: {
          select: {
            rutaCurricular: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // TODO: Integrar con OpenAI API
    // Por ahora retornamos una sugerencia estática basada en el contexto
    const sugerencia = this.generarSugerenciaEstatica(alerta);

    return {
      alertaId: alerta.id,
      estudiante: `${alerta.estudiante.nombre} ${alerta.estudiante.apellido}`,
      problema: alerta.descripcion,
      sugerencia,
    };
  }

  /**
   * Listar usuarios para el panel administrativo
   */
  async listarUsuarios() {
    const [tutores, docentes, admins] = await Promise.all([
      this.prisma.tutor.findMany({
        include: {
          _count: {
            select: {
              estudiantes: true,
            },
          },
        },
      }),
      this.prisma.docente.findMany({
        include: {
          _count: {
            select: {
              clases: true,
            },
          },
        },
      }),
      this.prisma.admin.findMany(),
    ]);

    const tutorUsers = tutores.map((tutor) => ({
      id: tutor.id,
      email: tutor.email,
      nombre: tutor.nombre,
      apellido: tutor.apellido,
      role: Role.Tutor,
      activo: true,
      createdAt: tutor.createdAt,
      updatedAt: tutor.updatedAt,
      _count: {
        estudiantes: tutor._count.estudiantes,
        equipos: 0,
        clases: 0,
      },
    }));

    const docenteUsers = docentes.map((docente) => ({
      id: docente.id,
      email: docente.email,
      nombre: docente.nombre,
      apellido: docente.apellido,
      role: Role.Docente,
      activo: true,
      createdAt: docente.createdAt,
      updatedAt: docente.updatedAt,
      _count: {
        estudiantes: 0,
        equipos: 0,
        clases: docente._count.clases,
      },
    }));

    const adminUsers = admins.map((admin) => ({
      id: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      apellido: admin.apellido,
      role: Role.Admin,
      activo: true,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      _count: {
        estudiantes: 0,
        equipos: 0,
        clases: 0,
      },
    }));

    return [...tutorUsers, ...docenteUsers, ...adminUsers];
  }

  /**
   * Obtener un usuario por ID desde cualquier tabla
   */
  private async findUserById(id: string) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            estudiantes: true,
          },
        },
      },
    });

    if (tutor) {
      return {
        id: tutor.id,
        email: tutor.email,
        nombre: tutor.nombre,
        apellido: tutor.apellido,
        role: Role.Tutor,
        activo: true,
        createdAt: tutor.createdAt,
        updatedAt: tutor.updatedAt,
        _count: {
          estudiantes: tutor._count.estudiantes,
          equipos: 0,
          clases: 0,
        },
      };
    }

    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clases: true,
          },
        },
      },
    });

    if (docente) {
      return {
        id: docente.id,
        email: docente.email,
        nombre: docente.nombre,
        apellido: docente.apellido,
        role: Role.Docente,
        activo: true,
        createdAt: docente.createdAt,
        updatedAt: docente.updatedAt,
        _count: {
          estudiantes: 0,
          equipos: 0,
          clases: docente._count.clases,
        },
      };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (admin) {
      return {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        apellido: admin.apellido,
        role: Role.Admin,
        activo: true,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
        _count: {
          estudiantes: 0,
          equipos: 0,
          clases: 0,
        },
      };
    }

    throw new NotFoundException('Usuario no encontrado');
  }

  /**
   * Cambiar el rol de un usuario gestionado por el panel administrativo
   * Realiza migraciones entre tablas (tutor, docente, admin) cuando es seguro hacerlo.
   */
  async changeUserRole(id: string, role: Role) {
    const current = await this.getUserRecordWithDependencies(id);

    if (current.role === role) {
      return this.findUserById(id);
    }

    switch (current.role) {
      case Role.Tutor:
        return this.changeRoleFromTutor(current.record, role);
      case Role.Docente:
        return this.changeRoleFromDocente(current.record, role);
      case Role.Admin:
        return this.changeRoleFromAdmin(current.record, role);
      default:
        throw new ConflictException('Rol actual no soportado');
    }
  }

  private async changeRoleFromTutor(
    record: TutorRecordWithRelations,
    target: Role,
  ) {
    this.ensureTutorConvertible(record, target);

    if (target === Role.Docente) {
      await this.assertEmailAvailable(record.email, Role.Docente, record.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.docente.create({
          data: {
            id: record.id,
            email: record.email,
            password_hash: record.password_hash,
            nombre: record.nombre,
            apellido: record.apellido,
            titulo: null,
            bio: null,
          },
        });

        await tx.tutor.delete({
          where: { id: record.id },
        });
      });

      return this.findUserById(record.id);
    }

    if (target === Role.Admin) {
      await this.assertEmailAvailable(record.email, Role.Admin, record.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.admin.create({
          data: {
            id: record.id,
            email: record.email,
            password_hash: record.password_hash,
            nombre: record.nombre,
            apellido: record.apellido,
            fecha_registro: record.fecha_registro ?? new Date(),
          },
        });

        await tx.tutor.delete({
          where: { id: record.id },
        });
      });

      return this.findUserById(record.id);
    }

    throw new ConflictException(
      `No es posible convertir un tutor al rol ${target}`,
    );
  }

  private async changeRoleFromDocente(
    record: DocenteRecordWithRelations,
    target: Role,
  ) {
    this.ensureDocenteConvertible(record, target);

    if (target === Role.Tutor) {
      await this.assertEmailAvailable(record.email, Role.Tutor, record.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.tutor.create({
          data: {
            id: record.id,
            email: record.email,
            password_hash: record.password_hash,
            nombre: record.nombre,
            apellido: record.apellido,
            dni: null,
            telefono: null,
            fecha_registro: new Date(),
            ha_completado_onboarding: false,
          },
        });

        await tx.docente.delete({
          where: { id: record.id },
        });
      });

      return this.findUserById(record.id);
    }

    if (target === Role.Admin) {
      await this.assertEmailAvailable(record.email, Role.Admin, record.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.admin.create({
          data: {
            id: record.id,
            email: record.email,
            password_hash: record.password_hash,
            nombre: record.nombre,
            apellido: record.apellido,
            fecha_registro: new Date(),
          },
        });

        await tx.docente.delete({
          where: { id: record.id },
        });
      });

      return this.findUserById(record.id);
    }

    throw new ConflictException(
      `No es posible convertir un docente al rol ${target}`,
    );
  }

  private async changeRoleFromAdmin(
    record: Prisma.AdminGetPayload<{}>,
    target: Role,
  ) {
    if (target === Role.Tutor) {
      await this.assertEmailAvailable(record.email, Role.Tutor, record.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.tutor.create({
          data: {
            id: record.id,
            email: record.email,
            password_hash: record.password_hash,
            nombre: record.nombre,
            apellido: record.apellido,
            dni: null,
            telefono: null,
            fecha_registro: record.fecha_registro ?? new Date(),
            ha_completado_onboarding: false,
          },
        });

        await tx.admin.delete({
          where: { id: record.id },
        });
      });

      return this.findUserById(record.id);
    }

    if (target === Role.Docente) {
      await this.assertEmailAvailable(record.email, Role.Docente, record.id);
      await this.prisma.$transaction(async (tx) => {
        await tx.docente.create({
          data: {
            id: record.id,
            email: record.email,
            password_hash: record.password_hash,
            nombre: record.nombre,
            apellido: record.apellido,
            titulo: null,
            bio: null,
          },
        });

        await tx.admin.delete({
          where: { id: record.id },
        });
      });

      return this.findUserById(record.id);
    }

    throw new ConflictException(
      `No es posible convertir un admin al rol ${target}`,
    );
  }

  private ensureTutorConvertible(
    record: TutorRecordWithRelations,
    target: Role,
  ) {
    if (target === Role.Tutor) {
      return;
    }

    const { estudiantes, membresias, inscripciones_clase } = record._count;

    if (estudiantes > 0 || membresias > 0 || inscripciones_clase > 0) {
      throw new ConflictException(
        'No se puede cambiar el rol de un tutor con estudiantes, membresías o reservas activas',
      );
    }
  }

  private ensureDocenteConvertible(
    record: DocenteRecordWithRelations,
    target: Role,
  ) {
    if (target === Role.Docente) {
      return;
    }

    if (record._count.clases > 0) {
      throw new ConflictException(
        'No se puede cambiar el rol de un docente con clases asignadas',
      );
    }
  }

  private async assertEmailAvailable(
    email: string,
    target: Role,
    currentId: string,
  ) {
    if (target === Role.Tutor) {
      const existing = await this.prisma.tutor.findUnique({
        where: { email },
      });

      if (existing && existing.id !== currentId) {
        throw new ConflictException(
          'Ya existe un tutor con este correo electrónico',
        );
      }
    }

    if (target === Role.Docente) {
      const existing = await this.prisma.docente.findUnique({
        where: { email },
      });

      if (existing && existing.id !== currentId) {
        throw new ConflictException(
          'Ya existe un docente con este correo electrónico',
        );
      }
    }

    if (target === Role.Admin) {
      const existing = await this.prisma.admin.findUnique({
        where: { email },
      });

      if (existing && existing.id !== currentId) {
        throw new ConflictException(
          'Ya existe un admin con este correo electrónico',
        );
      }
    }
  }

  private async getUserRecordWithDependencies(
    id: string,
  ): Promise<UserRecordWithDependencies> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            estudiantes: true,
            membresias: true,
            inscripciones_clase: true,
          },
        },
      },
    });

    if (tutor) {
      return { role: Role.Tutor, record: tutor };
    }

    const docente = await this.prisma.docente.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            clases: true,
          },
        },
      },
    });

    if (docente) {
      return { role: Role.Docente, record: docente };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (admin) {
      return { role: Role.Admin, record: admin };
    }

    throw new NotFoundException('Usuario no encontrado');
  }

  /**
   * Eliminar usuario de la plataforma
   */
  async deleteUser(id: string) {
    try {
      const deletedTutor = await this.prisma.tutor.delete({
        where: { id },
      });

      return {
        message: 'Tutor eliminado correctamente',
        id: deletedTutor.id,
        role: Role.Tutor,
      };
    } catch (error: any) {
      if (error?.code !== 'P2025') {
        throw error;
      }
    }

    try {
      const deletedDocente = await this.prisma.docente.delete({
        where: { id },
      });

      return {
        message: 'Docente eliminado correctamente',
        id: deletedDocente.id,
        role: Role.Docente,
      };
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new ConflictException(
          'El docente tiene clases asociadas y no puede eliminarse',
        );
      }

      if (error?.code !== 'P2025') {
        throw error;
      }
    }

    try {
      const deletedAdmin = await this.prisma.admin.delete({
        where: { id },
      });

      return {
        message: 'Admin eliminado correctamente',
        id: deletedAdmin.id,
        role: Role.Admin,
      };
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }

      throw error;
    }
  }

  /**
   * Generar sugerencia estática basada en keywords
   * TODO: Reemplazar con llamada a OpenAI
   */
  private generarSugerenciaEstatica(alerta: any): string {
    const descripcion = alerta.descripcion.toLowerCase();
    const estudiante = `${alerta.estudiante.nombre} ${alerta.estudiante.apellido}`;
    const ruta = alerta.clase.rutaCurricular.nombre;

    // Detectar keywords y generar sugerencias contextuales
    if (
      descripcion.includes('distraid') ||
      descripcion.includes('concentra') ||
      descripcion.includes('atenci')
    ) {
      return `**Problema de atención/concentración en ${ruta}**

**Sugerencias:**
1. **Contactar al tutor** para verificar si hay factores externos que afecten la concentración (sueño, alimentación, contexto familiar).
2. **Evaluación especializada**: Considerar evaluación psicopedagógica si el patrón persiste.
3. **Estrategias pedagógicas**:
   - Dividir la clase en segmentos más cortos
   - Utilizar técnicas de gamificación para mantener engagement
   - Asignar un rol activo al estudiante durante la clase
4. **Seguimiento**: Monitorear en las próximas 3-4 clases para identificar patrones.`;
    }

    if (
      descripcion.includes('dificult') ||
      descripcion.includes('confund') ||
      descripcion.includes('entiend')
    ) {
      return `**Dificultad de comprensión en ${ruta}**

**Sugerencias:**
1. **Refuerzo individual**: Ofrecer una clase de repaso 1-on-1 sin costo adicional.
2. **Materiales complementarios**: Enviar videos explicativos o ejercicios adicionales al tutor.
3. **Cambio de enfoque**: El docente podría probar explicaciones con diferentes métodos (visual, kinestésico, etc.).
4. **Evaluar nivel**: Verificar si ${estudiante} está en el nivel adecuado o necesita fundamentos previos.`;
    }

    if (
      descripcion.includes('conduct') ||
      descripcion.includes('comporta') ||
      descripcion.includes('disciplina')
    ) {
      return `**Problema de conducta/comportamiento**

**Sugerencias:**
1. **Reunión tripartita**: Agendar reunión virtual con tutor, docente y coordinador académico.
2. **Establecer acuerdos**: Definir expectativas claras de comportamiento con el estudiante.
3. **Sistema de incentivos**: Implementar sistema de puntos positivos por buen comportamiento.
4. **Contexto familiar**: Investigar si hay cambios recientes en el entorno familiar que expliquen el comportamiento.`;
    }

    if (
      descripcion.includes('ausent') ||
      descripcion.includes('falt') ||
      descripcion.includes('inasistencia')
    ) {
      return `**Patrón de inasistencias**

**Sugerencias:**
1. **Contacto inmediato** con el tutor para entender razones de las ausencias.
2. **Flexibilidad de horarios**: Ofrecer cambio de horario si hay conflicto con otras actividades.
3. **Clases de recuperación**: Ofrecer reprogramación sin costo.
4. **Verificar membresía**: Confirmar que el tutor valora el servicio y no está considerando cancelar.`;
    }

    // Sugerencia genérica si no hay keywords específicas
    return `**Observación registrada sobre ${estudiante}**

**Sugerencias generales:**
1. **Contactar al tutor** para discutir la observación del docente.
2. **Reunión de seguimiento**: Agendar llamada con tutor y docente para evaluar situación.
3. **Documentar evolución**: Solicitar al docente actualizaciones en las próximas 2-3 clases.
4. **Recursos adicionales**: Ofrecer materiales de apoyo específicos para ${ruta}.
5. **Evaluación integral**: Si persiste, considerar evaluación más profunda del estudiante.

*Esta alerta fue generada automáticamente. Usa tu criterio profesional para decidir las acciones apropiadas.*`;
  }

  /**
   * Crear una alerta manualmente (para testing)
   */
  async crearAlerta(
    estudianteId: string,
    claseId: string,
    descripcion: string,
  ) {
    const alerta = await this.prisma.alerta.create({
      data: {
        estudiante_id: estudianteId,
        clase_id: claseId,
        descripcion,
      },
      include: {
        estudiante: {
          select: {
            nombre: true,
            apellido: true,
          },
        },
        clase: {
          select: {
            rutaCurricular: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    return alerta;
  }
}
