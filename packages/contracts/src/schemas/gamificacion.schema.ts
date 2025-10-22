import { z } from 'zod';

// =============================================================================
// GAMIFICACIÓN SCHEMAS
// =============================================================================

const personaBaseSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  apellido: z.string(),
});

const equipoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  color: z.string(),
});

export const proximaClaseSchema = z.object({
  id: z.string(),
  fecha_hora_inicio: z.string(),
  duracion_minutos: z.number().int().nonnegative(),
  ruta_curricular: z
    .object({
      nombre: z.string(),
      color: z.string(),
    })
    .strict(),
  docente: personaBaseSchema.pick({ nombre: true, apellido: true }),
});

export type ProximaClase = z.infer<typeof proximaClaseSchema>;

const siguienteNivelSchema = z
  .object({
    nivel: z.number().int().nonnegative(),
    nombre: z.string(),
    puntosRequeridos: z.number().int().nonnegative(),
  })
  .strict();

export const dashboardGamificacionSchema = z.object({
  estudiante: personaBaseSchema.extend({
    avatar_url: z.string().url().optional(),
    foto_url: z.string().url().optional(),
    equipo: equipoSchema,
  }),
  stats: z.object({
    puntosToales: z.number().int().nonnegative(),
    clasesAsistidas: z.number().int().nonnegative(),
    clasesTotales: z.number().int().nonnegative(),
    racha: z.number().int().nonnegative(),
  }),
  nivel: z.object({
    nivelActual: z.number().int().nonnegative(),
    nombre: z.string(),
    descripcion: z.string(),
    puntosActuales: z.number().int().nonnegative(),
    puntosMinimos: z.number().int().nonnegative(),
    puntosMaximos: z.number().int().nonnegative(),
    puntosParaSiguienteNivel: z.number().int().nonnegative(),
    porcentajeProgreso: z.number().min(0),
    color: z.string(),
    icono: z.string(),
    siguienteNivel: siguienteNivelSchema.nullable(),
  }),
  proximasClases: z.array(proximaClaseSchema),
  equipoRanking: z.array(z.unknown()),
  ultimasAsistencias: z.array(z.unknown()),
});

export type DashboardGamificacion = z.infer<typeof dashboardGamificacionSchema>;

export const logroSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  icono: z.string(),
  puntos: z.number().int().nonnegative(),
  categoria: z.string(),
  rareza: z.string().optional(),
  desbloqueado: z.boolean(),
  fecha_desbloqueo: z.union([z.string(), z.date()]).optional(),
});

export type Logro = z.infer<typeof logroSchema>;

export const puntosSchema = z.object({
  total: z.number().int().nonnegative(),
  asistencia: z.number().int().nonnegative(),
  extras: z.number().int().nonnegative(),
  porRuta: z.record(z.string(), z.number()),
});

export type Puntos = z.infer<typeof puntosSchema>;

const rankingEntrySchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    puntos: z.number().int().nonnegative(),
    posicion: z.number().int().nonnegative(),
  })
  .passthrough();

export const rankingSchema = z.object({
  equipoActual: rankingEntrySchema.nullable(),
  posicionEquipo: z.number().int().nonnegative(),
  posicionGlobal: z.number().int().nonnegative(),
  rankingEquipo: z.array(rankingEntrySchema),
  rankingGlobal: z.array(rankingEntrySchema),
});

export type Ranking = z.infer<typeof rankingSchema>;

export const progresoRutaSchema = z.object({
  ruta: z.string(),
  color: z.string(),
  clasesAsistidas: z.number().int().nonnegative(),
  clasesTotales: z.number().int().nonnegative(),
  porcentaje: z.number().min(0),
});

export type ProgresoRuta = z.infer<typeof progresoRutaSchema>;

export const accionPuntuableSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  puntos: z.number().int(),
  activo: z.boolean(),
});

export type AccionPuntuable = z.infer<typeof accionPuntuableSchema>;

export const puntoObtenidoSchema = z.object({
  id: z.string(),
  puntos: z.number().int(),
  contexto: z.string().optional(),
  fecha_otorgado: z.string(),
  accion: accionPuntuableSchema,
  docente: personaBaseSchema.pick({ nombre: true, apellido: true }),
  clase: z
    .object({
      id: z.string(),
      fecha_hora_inicio: z.string(),
      rutaCurricular: z
        .object({
          nombre: z.string(),
          color: z.string(),
        })
        .strict(),
    })
    .optional(),
});

export type PuntoObtenido = z.infer<typeof puntoObtenidoSchema>;

export const otorgarPuntosSchema = z.object({
  estudianteId: z.string(),
  accionId: z.string(),
  claseId: z.string().optional(),
  contexto: z.string().optional(),
});

export type OtorgarPuntosInput = z.infer<typeof otorgarPuntosSchema>;

export const logrosListSchema = z.array(logroSchema);
export const puntosObtenidosListSchema = z.array(puntoObtenidoSchema);
export const progresoRutaListSchema = z.array(progresoRutaSchema);
export const accionesPuntuablesListSchema = z.array(accionPuntuableSchema);

