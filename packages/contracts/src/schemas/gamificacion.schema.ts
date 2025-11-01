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

const equipoResumenSchema = z
  .object({
    id: z.string(),
    nombre: z.string(),
    color: z.string().optional(),
    color_primario: z.string().optional(),
    color_secundario: z.string().optional(),
  })
  .passthrough();

export type EquipoResumen = z.infer<typeof equipoResumenSchema>;

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
    avatar_gradient: z.number().int().min(0).max(9).default(0),
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
  equipoRanking: z.array(z.record(z.string(), z.unknown())),
  ultimasAsistencias: z.array(z.record(z.string(), z.unknown())),
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

  // CAMPOS DE RECOMPENSAS (del backend)
  monedas_recompensa: z.number().int().nonnegative().default(0),
  xp_recompensa: z.number().int().nonnegative().default(0),
  secreto: z.boolean().default(false),

  // CAMPOS ADICIONALES del backend
  codigo: z.string().optional(),
  titulo: z.string().optional(), // Título especial para logros desbloqueados
  criterio_tipo: z.string().optional(),
  criterio_valor: z.string().optional(),
  extras: z.record(z.string(), z.unknown()).optional(), // Metadata adicional
});

export type Logro = z.infer<typeof logroSchema>;

export const puntosSchema = z.object({
  total: z.number().int().nonnegative(),
  asistencia: z.number().int().nonnegative(),
  extras: z.number().int().nonnegative(),
  porRuta: z.record(z.string(), z.number()),
});

export type Puntos = z.infer<typeof puntosSchema>;

const rankingIntegranteSchema = personaBaseSchema
  .extend({
    avatar: z.string().nullable().optional(),
    puntos: z.number().int().nonnegative(),
  })
  .passthrough();

export type RankingIntegrante = z.infer<typeof rankingIntegranteSchema>;

const rankingGlobalItemSchema = rankingIntegranteSchema
  .extend({
    equipo: equipoResumenSchema.nullable().optional(),
    posicion: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export type RankingGlobalItem = z.infer<typeof rankingGlobalItemSchema>;

export const rankingSchema = z.object({
  equipoActual: equipoResumenSchema.nullable(),
  posicionEquipo: z.number().int().nonnegative(),
  posicionGlobal: z.number().int().nonnegative(),
  rankingEquipo: z.array(rankingIntegranteSchema),
  rankingGlobal: z.array(rankingGlobalItemSchema),
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

export type LogrosList = z.infer<typeof logrosListSchema>;
export type PuntosObtenidosList = z.infer<typeof puntosObtenidosListSchema>;
export type ProgresoRutaList = z.infer<typeof progresoRutaListSchema>;
export type AccionesPuntuablesList = z.infer<typeof accionesPuntuablesListSchema>;
