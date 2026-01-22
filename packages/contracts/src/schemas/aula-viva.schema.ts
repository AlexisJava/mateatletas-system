import { z } from 'zod';

// ============================================================================
// AULA VIVA SCHEMAS - Tipos compartidos para WebSocket
// ============================================================================

// ----------------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------------

export const tipoMuteoEnum = z.enum(['chat', 'audio', 'ambos']);
export type TipoMuteo = z.infer<typeof tipoMuteoEnum>;

export const rolUsuarioEnum = z.enum(['DOCENTE', 'ESTUDIANTE', 'ADMIN']);
export type RolUsuario = z.infer<typeof rolUsuarioEnum>;

export const connectionStateEnum = z.enum(['disconnected', 'connecting', 'connected', 'error']);
export type ConnectionState = z.infer<typeof connectionStateEnum>;

// ----------------------------------------------------------------------------
// PARTICIPANTE
// ----------------------------------------------------------------------------

export const participanteSchema = z.object({
  odidentidadUsuario: z.string(),
  odidentidadSala: z.string(),
  socketId: z.string(),
  nombre: z.string(),
  rol: rolUsuarioEnum,
  conectadoEn: z.string().datetime(),
});

export type Participante = z.infer<typeof participanteSchema>;

// ----------------------------------------------------------------------------
// MANOS LEVANTADAS
// ----------------------------------------------------------------------------

export const manoLevantadaSchema = z.object({
  odooId: z.string(),
  nombre: z.string(),
  timestamp: z.string().datetime(),
});

export type ManoLevantada = z.infer<typeof manoLevantadaSchema>;

// Eventos emitidos por el servidor
export const manoLevantadaEventSchema = z.object({
  odooId: z.string(),
  nombre: z.string(),
  timestamp: z.string(),
});

export const manoBajadaEventSchema = z.object({
  odooId: z.string(),
});

export const palabraOtorgadaEventSchema = z.object({
  odooId: z.string(),
  nombre: z.string(),
});

export type ManoLevantadaEvent = z.infer<typeof manoLevantadaEventSchema>;
export type ManoBajadaEvent = z.infer<typeof manoBajadaEventSchema>;
export type PalabraOtorgadaEvent = z.infer<typeof palabraOtorgadaEventSchema>;

// ----------------------------------------------------------------------------
// MODERACIÓN
// ----------------------------------------------------------------------------

export const participanteMuteadoEventSchema = z.object({
  odooId: z.string(),
  tipo: tipoMuteoEnum,
});

export const participanteDesmuteadoEventSchema = z.object({
  odooId: z.string(),
});

export const todosMuteadosEventSchema = z.object({
  tipo: tipoMuteoEnum,
  excepto: z.array(z.string()),
  muteados: z.array(z.string()),
});

export const todosDesmuteadosEventSchema = z.object({
  desmuteados: z.array(z.string()),
});

export const participanteExpulsadoEventSchema = z.object({
  motivo: z.string(),
});

export const alguienExpulsadoEventSchema = z.object({
  odooId: z.string(),
  nombre: z.string(),
});

export type ParticipanteMuteadoEvent = z.infer<typeof participanteMuteadoEventSchema>;
export type ParticipanteDesmuteadoEvent = z.infer<typeof participanteDesmuteadoEventSchema>;
export type TodosMuteadosEvent = z.infer<typeof todosMuteadosEventSchema>;
export type TodosDesmuteadosEvent = z.infer<typeof todosDesmuteadosEventSchema>;
export type ParticipanteExpulsadoEvent = z.infer<typeof participanteExpulsadoEventSchema>;
export type AlguienExpulsadoEvent = z.infer<typeof alguienExpulsadoEventSchema>;

// ----------------------------------------------------------------------------
// INDICADOR HABLANDO
// ----------------------------------------------------------------------------

export const usuarioHablandoEventSchema = z.object({
  odooId: z.string(),
  activo: z.boolean(),
});

export type UsuarioHablandoEvent = z.infer<typeof usuarioHablandoEventSchema>;

// ----------------------------------------------------------------------------
// REACCIONES EN TIEMPO REAL
// ----------------------------------------------------------------------------

export const tipoReaccionEnum = z.enum(['thumbsUp', 'heart', 'laugh', 'celebrate', 'thinking']);
export type TipoReaccion = z.infer<typeof tipoReaccionEnum>;

export const EMOJI_MAP: Record<TipoReaccion, string> = {
  thumbsUp: '\u{1F44D}',
  heart: '\u{2764}\u{FE0F}',
  laugh: '\u{1F602}',
  celebrate: '\u{1F389}',
  thinking: '\u{1F914}',
};

export const reaccionAgregadaSchema = z.object({
  tipo: tipoReaccionEnum,
  emoji: z.string(),
  contador: z.number().int().positive(),
  ultimosUsuarios: z.array(
    z.object({
      odooId: z.string(),
      nombre: z.string(),
    }),
  ),
});

export type ReaccionAgregada = z.infer<typeof reaccionAgregadaSchema>;

export const enviarReaccionPayloadSchema = z.object({
  salaId: z.string().min(1),
  tipo: tipoReaccionEnum,
});

export type EnviarReaccionPayload = z.infer<typeof enviarReaccionPayloadSchema>;

// ----------------------------------------------------------------------------
// PULSO DE ATENCIÓN (ENCUESTAS RÁPIDAS)
// ----------------------------------------------------------------------------

/**
 * Pulso creado por el docente
 * Emitido cuando se crea un nuevo pulso
 */
export const pulsoCreadoEventSchema = z.object({
  id: z.string(),
  pregunta: z.string(),
  opciones: z.array(z.string()),
});

export type PulsoCreadoEvent = z.infer<typeof pulsoCreadoEventSchema>;

/**
 * Estadísticas actualizadas de un pulso
 * Emitido cuando hay nuevas respuestas
 */
export const pulsoStatsSchema = z.object({
  id: z.string(),
  pregunta: z.string(),
  opciones: z.array(z.string()),
  activo: z.boolean(),
  conteos: z.array(z.number().int().nonnegative()),
  totalRespuestas: z.number().int().nonnegative(),
  porcentajes: z.array(z.number().int().min(0).max(100)),
});

export type PulsoStats = z.infer<typeof pulsoStatsSchema>;

/**
 * Payloads para operaciones de pulso
 */
export const crearPulsoPayloadSchema = z.object({
  salaId: z.string().min(1),
  pregunta: z.string().min(1).max(200),
  opciones: z.array(z.string().min(1).max(100)).min(2).max(6),
});

export const responderPulsoPayloadSchema = z.object({
  salaId: z.string().min(1),
  pulsoId: z.string().min(1),
  opcionIndex: z.number().int().nonnegative(),
});

export const cerrarPulsoPayloadSchema = z.object({
  salaId: z.string().min(1),
  pulsoId: z.string().min(1),
});

export type CrearPulsoPayload = z.infer<typeof crearPulsoPayloadSchema>;
export type ResponderPulsoPayload = z.infer<typeof responderPulsoPayloadSchema>;
export type CerrarPulsoPayload = z.infer<typeof cerrarPulsoPayloadSchema>;

// ----------------------------------------------------------------------------
// CHAT
// ----------------------------------------------------------------------------

export const mensajeChatSchema = z.object({
  id: z.string(),
  visibleIdUsuario: z.string(),
  nombreUsuario: z.string(),
  rol: rolUsuarioEnum,
  contenido: z.string(),
  timestamp: z.string(),
  salaId: z.string(),
});

export type MensajeChat = z.infer<typeof mensajeChatSchema>;

export const chatToggleEventSchema = z.object({
  salaId: z.string(),
  habilitado: z.boolean(),
  mensaje: z.string(),
});

export type ChatToggleEvent = z.infer<typeof chatToggleEventSchema>;

// ----------------------------------------------------------------------------
// RESPUESTAS DEL SERVIDOR
// ----------------------------------------------------------------------------

export const baseResponseSchema = z.object({
  exito: z.boolean(),
  error: z.string().optional(),
});

export const unirseSalaResponseSchema = baseResponseSchema.extend({
  salaId: z.string().optional(),
  participantes: z.array(participanteSchema).optional(),
});

export const enviarMensajeResponseSchema = baseResponseSchema.extend({
  mensaje: mensajeChatSchema.optional(),
});

export type BaseResponse = z.infer<typeof baseResponseSchema>;
export type UnirseSalaResponse = z.infer<typeof unirseSalaResponseSchema>;
export type EnviarMensajeResponse = z.infer<typeof enviarMensajeResponseSchema>;

// ----------------------------------------------------------------------------
// PAYLOADS CLIENTE -> SERVIDOR
// ----------------------------------------------------------------------------

export const unirseSalaPayloadSchema = z
  .object({
    claseGrupoId: z.string().optional(),
    comisionId: z.string().optional(),
  })
  .refine((data) => data.claseGrupoId || data.comisionId, {
    message: 'Se requiere claseGrupoId o comisionId',
  });

export const salaIdPayloadSchema = z.object({
  salaId: z.string().min(1),
});

export const darPalabraPayloadSchema = z.object({
  salaId: z.string().min(1),
  odooIdEstudiante: z.string().min(1),
});

export const mutearParticipantePayloadSchema = z.object({
  salaId: z.string().min(1),
  odooIdEstudiante: z.string().min(1),
  tipo: tipoMuteoEnum,
});

export const mutearTodosPayloadSchema = z.object({
  salaId: z.string().min(1),
  tipo: tipoMuteoEnum,
  excepto: z.array(z.string()).optional(),
});

export const expulsarParticipantePayloadSchema = z.object({
  salaId: z.string().min(1),
  odooIdEstudiante: z.string().min(1),
  motivo: z.string().max(500).optional(),
});

export const enviarMensajePayloadSchema = z.object({
  salaId: z.string().min(1),
  contenido: z.string().min(1).max(2000),
});

export const toggleChatPayloadSchema = z.object({
  salaId: z.string().min(1),
  habilitado: z.boolean(),
});

export const hablandoPayloadSchema = z.object({
  salaId: z.string().min(1),
  activo: z.boolean(),
});

export type UnirseSalaPayload = z.infer<typeof unirseSalaPayloadSchema>;
export type SalaIdPayload = z.infer<typeof salaIdPayloadSchema>;
export type DarPalabraPayload = z.infer<typeof darPalabraPayloadSchema>;
export type MutearParticipantePayload = z.infer<typeof mutearParticipantePayloadSchema>;
export type MutearTodosPayload = z.infer<typeof mutearTodosPayloadSchema>;
export type ExpulsarParticipantePayload = z.infer<typeof expulsarParticipantePayloadSchema>;
export type EnviarMensajePayload = z.infer<typeof enviarMensajePayloadSchema>;
export type ToggleChatPayload = z.infer<typeof toggleChatPayloadSchema>;
export type HablandoPayload = z.infer<typeof hablandoPayloadSchema>;
