/**
 * Domain Events para Event-Driven Architecture
 *
 * Estos eventos permiten desacoplar módulos y eliminar dependencias circulares.
 * Por ejemplo: AuthModule emite eventos que GamificacionModule escucha,
 * sin que AuthModule necesite importar GamificacionModule.
 *
 * Patrones usados:
 * - Event-Driven Architecture
 * - Domain Events Pattern
 * - Publish-Subscribe Pattern
 *
 * @see https://docs.nestjs.com/techniques/events
 */

/**
 * Evento: Usuario se registró exitosamente
 *
 * Se emite cuando:
 * - Un tutor completa el registro
 *
 * Listeners:
 * - GamificacionModule: Asignar casa inicial y otorgar logro de bienvenida
 */
export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly userType: 'tutor' | 'docente' | 'admin',
    public readonly email: string,
    public readonly nombre: string,
    public readonly apellido: string,
  ) {}
}

/**
 * Evento: Usuario hizo login exitosamente
 *
 * Se emite cuando:
 * - Un usuario (tutor, docente, admin, estudiante) se autentica exitosamente
 *
 * Listeners:
 * - GamificacionModule: Otorgar XP por login diario, actualizar racha
 */
export class UserLoggedInEvent {
  constructor(
    public readonly userId: string,
    public readonly userType: 'tutor' | 'docente' | 'admin' | 'estudiante',
    public readonly email: string | null,
    public readonly esPrimerLogin: boolean,
  ) {}
}

/**
 * Evento: Estudiante hizo login por primera vez
 *
 * Se emite cuando:
 * - Un estudiante hace su primer login (no tiene logros desbloqueados)
 *
 * Listeners:
 * - GamificacionModule: Otorgar logro "PRIMER_INGRESO"
 */
export class EstudiantePrimerLoginEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly username: string,
  ) {}
}

/**
 * Evento: Estudiante completó una actividad
 *
 * Se emite cuando:
 * - Un estudiante completa un quiz, ejercicio, o lección
 *
 * Listeners:
 * - GamificacionModule: Otorgar XP y verificar logros
 */
export class EstudianteActividadCompletadaEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly tipoActividad: 'quiz' | 'ejercicio' | 'leccion',
    public readonly actividadId: string,
    public readonly puntajeObtenido: number,
  ) {}
}

/**
 * Evento: XP fue otorgado a un estudiante
 *
 * Se emite cuando:
 * - Un estudiante recibe XP por cualquier razón
 *
 * Listeners:
 * - GamificacionModule: Verificar si subió de nivel, verificar logros de XP
 * - NotificacionesModule: Notificar al estudiante sobre XP ganado
 */
export class XpGainedEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly xpGanado: number,
    public readonly razon: string,
    public readonly metadatos?: Record<string, unknown>,
  ) {}
}

/**
 * Evento: Estudiante subió de nivel
 *
 * Se emite cuando:
 * - Un estudiante acumula suficiente XP y sube de nivel
 *
 * Listeners:
 * - GamificacionModule: Otorgar recompensas de nivel
 * - NotificacionesModule: Enviar notificación de felicitación
 */
export class EstudianteNivelUpEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly nivelAnterior: number,
    public readonly nivelNuevo: number,
    public readonly recompensas: {
      xp?: number;
    },
  ) {}
}

/**
 * Evento: Logro fue desbloqueado por un estudiante
 *
 * Se emite cuando:
 * - Un estudiante desbloquea un logro/badge por primera vez
 *
 * Listeners:
 * - NotificacionesModule: Enviar notificación de nuevo logro
 * - GamificacionModule: Otorgar recompensas del logro (XP)
 */
export class LogroDesbloqueadoEvent {
  constructor(
    public readonly estudianteId: string,
    public readonly logroCodigo: string,
    public readonly logroNombre: string,
    public readonly recompensas: {
      xp?: number;
    },
  ) {}
}

/**
 * Evento: Usuario cambió su contraseña
 *
 * Se emite cuando:
 * - Un usuario cambia su contraseña exitosamente
 *
 * Listeners:
 * - AuthModule: Invalidar tokens anteriores (TokenBlacklist)
 * - NotificacionesModule: Enviar email de confirmación de cambio
 */
export class PasswordChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly userType: 'tutor' | 'docente' | 'admin' | 'estudiante',
    public readonly email: string,
    public readonly timestamp: Date,
  ) {}
}
