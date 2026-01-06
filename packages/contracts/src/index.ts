/**
 * @mateatletas/contracts
 * Shared contracts with Zod schemas for type-safe API communication
 */

// Auth
export * from './schemas/auth.schema';

// Estudiante
export * from './schemas/estudiante.schema';

// Equipo
export * from './schemas/equipo.schema';

// Notificación
export * from './schemas/notificacion.schema';

// Producto (Catálogo)
export * from './schemas/producto.schema';

// Clase
export * from './schemas/clase.schema';

// Gamificación
export * from './schemas/gamificacion.schema';

// Admin
export * from './schemas/admin.schema';

// Planificaciones
export * from './schemas/planificacion.schema';

// Pagos
export * from './schemas/pago.schema';

// Progreso de Actividades
export * from './schemas/progreso-actividad.schema';

// Enums compartidos (sincronizados con Prisma)
export * from './schemas/enums.schema';
