import { PrismaClient } from '@prisma/client';

export async function seedLogros(prisma: PrismaClient) {
  console.log('🎮 Seeding sistema completo de gamificación: 73 logros...');
  
  const logros = [
    // ========== CATEGORÍA 1: CONSISTENCIA (10 logros) ==========
    
    // COMUNES (4)
    { codigo: 'primer_paso', nombre: 'Primer Paso', descripcion: 'Completa tu primer ejercicio', categoria: 'consistencia', monedas_recompensa: 10, xp_recompensa: 20, criterio_tipo: 'ejercicios_completados', criterio_valor: '1', icono: '🎯', rareza: 'comun', secreto: false, orden: 1 },
    { codigo: 'un_dia_vez', nombre: 'Un Día a la Vez', descripcion: 'Mantén una racha de 1 día', categoria: 'consistencia', monedas_recompensa: 5, xp_recompensa: 10, criterio_tipo: 'racha_dias', criterio_valor: '1', icono: '🔥', rareza: 'comun', secreto: false, orden: 2 },
    { codigo: 'tres_multitud', nombre: 'Tres son Multitud', descripcion: 'Mantén una racha de 3 días consecutivos', categoria: 'consistencia', monedas_recompensa: 20, xp_recompensa: 50, criterio_tipo: 'racha_dias', criterio_valor: '3', icono: '🔥🔥', rareza: 'comun', secreto: false, orden: 3 },
    { codigo: 'segunda_semana', nombre: 'Segunda Semana', descripcion: 'Completa 7 días de actividad (no consecutivos)', categoria: 'consistencia', monedas_recompensa: 30, xp_recompensa: 80, criterio_tipo: 'dias_activos_total', criterio_valor: '7', icono: '📅', rareza: 'comun', secreto: false, orden: 4 },
    
    // RAROS (3)
    { codigo: 'racha_fuego', nombre: 'Racha de Fuego', descripcion: 'Mantén una racha de 7 días consecutivos', categoria: 'consistencia', monedas_recompensa: 50, xp_recompensa: 100, criterio_tipo: 'racha_dias', criterio_valor: '7', icono: '🔥🔥🔥', rareza: 'raro', secreto: false, animacion: 'aura_fuego', orden: 5 },
    { codigo: 'dos_semanas_imparables', nombre: 'Dos Semanas Imparables', descripcion: 'Mantén una racha de 14 días consecutivos', categoria: 'consistencia', monedas_recompensa: 80, xp_recompensa: 200, criterio_tipo: 'racha_dias', criterio_valor: '14', icono: '🔥🔥🔥', rareza: 'raro', secreto: false, orden: 6 },
    { codigo: 'veterano_gimnasio', nombre: 'Veterano del Gimnasio', descripcion: '30 días de actividad total (no consecutivos)', categoria: 'consistencia', monedas_recompensa: 60, xp_recompensa: 150, criterio_tipo: 'dias_activos_total', criterio_valor: '30', icono: '💪', rareza: 'raro', secreto: false, orden: 7 },
    
    // ÉPICOS (2)
    { codigo: 'imparable', nombre: 'Imparable', descripcion: 'Mantén una racha de 30 días consecutivos', categoria: 'consistencia', monedas_recompensa: 200, xp_recompensa: 500, criterio_tipo: 'racha_dias', criterio_valor: '30', icono: '🔥🔥🔥🔥', rareza: 'epico', secreto: false, animacion: 'fenix_ardiendo', orden: 8 },
    { codigo: 'dedicacion_hierro', nombre: 'Dedicación de Hierro', descripcion: 'Mantén una racha de 60 días consecutivos', categoria: 'consistencia', monedas_recompensa: 400, xp_recompensa: 1000, criterio_tipo: 'racha_dias', criterio_valor: '60', icono: '⚡', rareza: 'epico', secreto: false, titulo: 'Inquebrantable', orden: 9 },
    
    // LEGENDARIO (1)
    { codigo: 'leyenda_viviente', nombre: 'Leyenda Viviente', descripcion: 'Mantén una racha de 90 días consecutivos (trimestre)', categoria: 'consistencia', monedas_recompensa: 800, xp_recompensa: 2000, criterio_tipo: 'racha_dias', criterio_valor: '90', icono: '👑🔥', rareza: 'legendario', secreto: false, animacion: 'fenix_inmortal', titulo: 'Leyenda Viviente', extras: ['Avatar con llamas permanentes', 'Mención en Hall of Fame'], orden: 10 },

    // ========== CATEGORÍA 2: MAESTRÍA (12 logros) ==========
    
    // COMUNES (3)
    { codigo: 'primera_victoria', nombre: 'Primera Victoria', descripcion: 'Completa tu primer tema al 100%', categoria: 'maestria', monedas_recompensa: 30, xp_recompensa: 100, criterio_tipo: 'temas_completados', criterio_valor: '1', icono: '✅', rareza: 'comun', secreto: false, orden: 11 },
    { codigo: 'doble_nada', nombre: 'Doble o Nada', descripcion: 'Completa 2 temas al 100%', categoria: 'maestria', monedas_recompensa: 50, xp_recompensa: 150, criterio_tipo: 'temas_completados', criterio_valor: '2', icono: '✅✅', rareza: 'comun', secreto: false, orden: 12 },
    { codigo: 'trio_perfecto', nombre: 'Trío Perfecto', descripcion: 'Completa 3 temas al 100%', categoria: 'maestria', monedas_recompensa: 80, xp_recompensa: 200, criterio_tipo: 'temas_completados', criterio_valor: '3', icono: '✅✅✅', rareza: 'comun', secreto: false, orden: 13 },
    
    // RAROS (5)
    { codigo: 'completista', nombre: 'Completista', descripcion: 'Completa 5 temas al 100%', categoria: 'maestria', monedas_recompensa: 120, xp_recompensa: 300, criterio_tipo: 'temas_completados', criterio_valor: '5', icono: '🎯', rareza: 'raro', secreto: false, animacion: 'cerebrito', orden: 14 },
    { codigo: 'maestro_algebra', nombre: 'Maestro del Álgebra', descripcion: 'Completa módulo de Álgebra al 100%', categoria: 'maestria', monedas_recompensa: 300, xp_recompensa: 1000, criterio_tipo: 'modulo_completado', criterio_valor: 'algebra', icono: '🧮', rareza: 'raro', secreto: false, badge: 'Maestro Álgebra', orden: 15 },
    { codigo: 'maestro_geometria', nombre: 'Maestro de Geometría', descripcion: 'Completa módulo de Geometría al 100%', categoria: 'maestria', monedas_recompensa: 300, xp_recompensa: 1000, criterio_tipo: 'modulo_completado', criterio_valor: 'geometria', icono: '📐', rareza: 'raro', secreto: false, badge: 'Maestro Geometría', orden: 16 },
    { codigo: 'maestro_aritmetica', nombre: 'Maestro de Aritmética', descripcion: 'Completa módulo de Aritmética al 100%', categoria: 'maestria', monedas_recompensa: 300, xp_recompensa: 1000, criterio_tipo: 'modulo_completado', criterio_valor: 'aritmetica', icono: '➗', rareza: 'raro', secreto: false, badge: 'Maestro Aritmética', orden: 17 },
    { codigo: 'coleccionista', nombre: 'Coleccionista', descripcion: 'Completa 10 temas al 100%', categoria: 'maestria', monedas_recompensa: 250, xp_recompensa: 600, criterio_tipo: 'temas_completados', criterio_valor: '10', icono: '📚', rareza: 'raro', secreto: false, orden: 18 },
    
    // ÉPICOS (3)
    { codigo: 'polimata', nombre: 'Polímata', descripcion: 'Completa 3 módulos diferentes al 100%', categoria: 'maestria', monedas_recompensa: 500, xp_recompensa: 2000, criterio_tipo: 'modulos_completados', criterio_valor: '3', icono: '🌟', rareza: 'epico', secreto: false, titulo: 'Polímata', orden: 19 },
    { codigo: 'maestria_total', nombre: 'Maestría Total', descripcion: 'Completa 20 temas al 100%', categoria: 'maestria', monedas_recompensa: 600, xp_recompensa: 2500, criterio_tipo: 'temas_completados', criterio_valor: '20', icono: '🎓💯', rareza: 'epico', secreto: false, extras: ['Avatar con aura dorada académica'], orden: 20 },
    { codigo: 'dominio_absoluto', nombre: 'Dominio Absoluto', descripcion: 'Completa 5 módulos diferentes al 100%', categoria: 'maestria', monedas_recompensa: 1000, xp_recompensa: 3000, criterio_tipo: 'modulos_completados', criterio_valor: '5', icono: '👑', rareza: 'epico', secreto: false, extras: ['Marco avatar platino académico'], orden: 21 },
    
    // LEGENDARIO (1)
    { codigo: 'enciclopedia_viviente', nombre: 'Enciclopedia Viviente', descripcion: 'Completa TODOS los módulos de tu grado al 100%', categoria: 'maestria', monedas_recompensa: 2000, xp_recompensa: 5000, criterio_tipo: 'todos_modulos_grado', criterio_valor: '100', icono: '📖👑', rareza: 'legendario', secreto: false, animacion: 'explosion_conocimiento', titulo: 'Enciclopedia', extras: ['Certificado especial del director', 'Mención en Hall of Fame'], orden: 22 },

    // ========== CATEGORÍA 3: PRECISIÓN (8 logros) ==========

    // COMUNES (2)
    { codigo: 'primera_perfeccion', nombre: 'Primera Perfección', descripcion: 'Completa 1 ejercicio con 100% de precisión', categoria: 'precision', monedas_recompensa: 15, xp_recompensa: 30, criterio_tipo: 'ejercicios_perfectos', criterio_valor: '1', icono: '💯', rareza: 'comun', secreto: false, orden: 23 },
    { codigo: 'racha_perfecta', nombre: 'Racha Perfecta', descripcion: 'Completa 3 ejercicios perfectos consecutivos', categoria: 'precision', monedas_recompensa: 30, xp_recompensa: 60, criterio_tipo: 'ejercicios_perfectos_consecutivos', criterio_valor: '3', icono: '💯💯', rareza: 'comun', secreto: false, orden: 24 },

    // RAROS (3)
    { codigo: 'perfeccionista', nombre: 'Perfeccionista', descripcion: 'Completa 10 ejercicios con 100% de precisión', categoria: 'precision', monedas_recompensa: 100, xp_recompensa: 300, criterio_tipo: 'ejercicios_perfectos', criterio_valor: '10', icono: '💯🎯', rareza: 'raro', secreto: false, animacion: 'victoria_epica', orden: 25 },
    { codigo: 'ojo_halcon', nombre: 'Ojo de Halcón', descripcion: 'Completa 25 ejercicios con 100% de precisión', categoria: 'precision', monedas_recompensa: 200, xp_recompensa: 600, criterio_tipo: 'ejercicios_perfectos', criterio_valor: '25', icono: '🦅', rareza: 'raro', secreto: false, orden: 26 },
    { codigo: 'precision_mortal', nombre: 'Precisión Mortal', descripcion: '10 ejercicios perfectos en un solo día', categoria: 'precision', monedas_recompensa: 150, xp_recompensa: 400, criterio_tipo: 'ejercicios_perfectos_dia', criterio_valor: '10', icono: '🎯', rareza: 'raro', secreto: false, orden: 27 },

    // ÉPICOS (2)
    { codigo: 'francotirador', nombre: 'Francotirador', descripcion: 'Completa 50 ejercicios con 100% de precisión', categoria: 'precision', monedas_recompensa: 300, xp_recompensa: 800, criterio_tipo: 'ejercicios_perfectos', criterio_valor: '50', icono: '🎯🔥', rareza: 'epico', secreto: false, titulo: 'Francotirador', animacion: 'sniper_shot', orden: 28 },
    { codigo: 'perfeccion_absoluta', nombre: 'Perfección Absoluta', descripcion: '20 ejercicios perfectos consecutivos', categoria: 'precision', monedas_recompensa: 400, xp_recompensa: 1000, criterio_tipo: 'ejercicios_perfectos_consecutivos', criterio_valor: '20', icono: '💎', rareza: 'epico', secreto: false, extras: ['Efecto avatar: Destello al completar ejercicio'], orden: 29 },

    // LEGENDARIO (1)
    { codigo: 'mente_brillante', nombre: 'Mente Brillante', descripcion: 'Completa 100 ejercicios con 100% de precisión', categoria: 'precision', monedas_recompensa: 500, xp_recompensa: 2000, criterio_tipo: 'ejercicios_perfectos', criterio_valor: '100', icono: '🧠💎', rareza: 'legendario', secreto: false, animacion: 'explosion_mental', titulo: 'Mente Brillante', extras: ['Avatar con aura brillante permanente'], orden: 30 },

    // ========== CATEGORÍA 4: VELOCIDAD (6 logros) ==========

    // COMUNES (2)
    { codigo: 'primera_velocidad', nombre: 'Primera Velocidad', descripcion: 'Completa un ejercicio en menos de 30 segundos', categoria: 'velocidad', monedas_recompensa: 20, xp_recompensa: 40, criterio_tipo: 'ejercicio_rapido', criterio_valor: '30', icono: '⚡', rareza: 'comun', secreto: false, orden: 31 },
    { codigo: 'acelerado', nombre: 'Acelerado', descripcion: 'Completa 5 ejercicios en menos de 30s cada uno', categoria: 'velocidad', monedas_recompensa: 40, xp_recompensa: 80, criterio_tipo: 'ejercicios_rapidos', criterio_valor: '5', icono: '⚡⚡', rareza: 'comun', secreto: false, orden: 32 },

    // RAROS (2)
    { codigo: 'rapido_furioso', nombre: 'Rápido y Furioso', descripcion: 'Completa 10 ejercicios en menos de 30s cada uno', categoria: 'velocidad', monedas_recompensa: 80, xp_recompensa: 150, criterio_tipo: 'ejercicios_rapidos', criterio_valor: '10', icono: '🏎️', rareza: 'raro', secreto: false, animacion: 'flash', orden: 33 },
    { codigo: 'velocista', nombre: 'Velocista', descripcion: 'Completa 20 ejercicios rápidos (<30s)', categoria: 'velocidad', monedas_recompensa: 150, xp_recompensa: 300, criterio_tipo: 'ejercicios_rapidos', criterio_valor: '20', icono: '🏃', rareza: 'raro', secreto: false, orden: 34 },

    // ÉPICO (1)
    { codigo: 'velocidad_luz', nombre: 'Velocidad de la Luz', descripcion: 'Completa 50 ejercicios en menos de 30s cada uno', categoria: 'velocidad', monedas_recompensa: 300, xp_recompensa: 600, criterio_tipo: 'ejercicios_rapidos', criterio_valor: '50', icono: '⚡💫', rareza: 'epico', secreto: false, animacion: 'sonic', extras: ['Efecto: Estela de velocidad al responder'], orden: 35 },

    // LEGENDARIO (1)
    { codigo: 'taquion_humano', nombre: 'Taquión Humano', descripcion: 'Completa un tema entero en una sesión (<1 hora)', categoria: 'velocidad', monedas_recompensa: 500, xp_recompensa: 1000, criterio_tipo: 'tema_rapido', criterio_valor: '60', icono: '⚡👑', rareza: 'legendario', secreto: false, titulo: 'Taquión', extras: ['Efecto: Rayo permanente en avatar'], orden: 36 },

    // ========== CATEGORÍA 5: SOCIAL (8 logros) ==========

    // COMUNES (2)
    { codigo: 'primera_ayuda', nombre: 'Primera Ayuda', descripcion: 'Ayuda a un compañero', categoria: 'social', monedas_recompensa: 10, xp_recompensa: 20, criterio_tipo: 'ayudas_dadas', criterio_valor: '1', icono: '🤝', rareza: 'comun', secreto: false, orden: 37 },
    { codigo: 'mano_amiga', nombre: 'Mano Amiga', descripcion: 'Ayuda a 3 compañeros', categoria: 'social', monedas_recompensa: 30, xp_recompensa: 60, criterio_tipo: 'ayudas_dadas', criterio_valor: '3', icono: '🤝🤝', rareza: 'comun', secreto: false, orden: 38 },

    // RAROS (3)
    { codigo: 'buen_companero', nombre: 'Buen Compañero', descripcion: 'Ayuda a 10 estudiantes', categoria: 'social', monedas_recompensa: 80, xp_recompensa: 200, criterio_tipo: 'ayudas_dadas', criterio_valor: '10', icono: '🤝✨', rareza: 'raro', secreto: false, animacion: 'high_five', orden: 39 },
    { codigo: 'primer_recluta', nombre: 'Primer Recluta', descripcion: 'Invita a un amigo que se registra', categoria: 'social', monedas_recompensa: 50, xp_recompensa: 100, criterio_tipo: 'invitaciones_registradas', criterio_valor: '1', icono: '📣', rareza: 'raro', secreto: false, orden: 40 },
    { codigo: 'reclutador', nombre: 'Reclutador', descripcion: 'Invita a 2 amigos que completan 1 tema', categoria: 'social', monedas_recompensa: 200, xp_recompensa: 300, criterio_tipo: 'invitaciones_activas', criterio_valor: '2', icono: '📣📣', rareza: 'raro', secreto: false, orden: 41 },

    // ÉPICOS (2)
    { codigo: 'mentor', nombre: 'Mentor', descripcion: 'Ayuda a 25 estudiantes', categoria: 'social', monedas_recompensa: 300, xp_recompensa: 800, criterio_tipo: 'ayudas_dadas', criterio_valor: '25', icono: '👨‍🏫', rareza: 'epico', secreto: false, titulo: 'Mentor', animacion: 'maestro_shaolin', extras: ['Desbloquea: Puede dar ayuda oficial'], orden: 42 },
    { codigo: 'embajador', nombre: 'Embajador', descripcion: 'Invita 5 amigos activos (completaron 1 tema)', categoria: 'social', monedas_recompensa: 500, xp_recompensa: 1000, criterio_tipo: 'invitaciones_activas', criterio_valor: '5', icono: '🌟', rareza: 'epico', secreto: false, titulo: 'Embajador', badge: 'Badge especial en perfil', orden: 43 },

    // LEGENDARIO (1)
    { codigo: 'lider_nato', nombre: 'Líder Nato', descripcion: 'Invita 10 amigos activos + ayuda 50 estudiantes', categoria: 'social', monedas_recompensa: 1000, xp_recompensa: 2000, criterio_tipo: 'lider_completo', criterio_valor: JSON.stringify({ invitaciones: 10, ayudas: 50 }), icono: '👑🌟', rareza: 'legendario', secreto: false, animacion: 'lider_inspirador', titulo: 'Líder Nato', extras: ['Avatar con corona social', 'Puede crear equipos propios'], orden: 44 },

    // ========== CATEGORÍA 6: ASISTENCIA (6 logros) ==========

    // COMUNES (2)
    { codigo: 'primera_clase', nombre: 'Primera Clase', descripcion: 'Asiste a tu primera clase grupal', categoria: 'asistencia', monedas_recompensa: 10, xp_recompensa: 50, criterio_tipo: 'clases_asistidas', criterio_valor: '1', icono: '🎓', rareza: 'comun', secreto: false, orden: 45 },
    { codigo: 'alumno_regular', nombre: 'Alumno Regular', descripcion: 'Asiste a 3 clases', categoria: 'asistencia', monedas_recompensa: 30, xp_recompensa: 150, criterio_tipo: 'clases_asistidas', criterio_valor: '3', icono: '📚', rareza: 'comun', secreto: false, orden: 46 },

    // RAROS (2)
    { codigo: 'alumno_presente', nombre: 'Alumno Presente', descripcion: 'Asiste a 4 clases en un mes (completo)', categoria: 'asistencia', monedas_recompensa: 70, xp_recompensa: 300, criterio_tipo: 'clases_asistidas_mes', criterio_valor: '4', icono: '✅', rareza: 'raro', secreto: false, badge: 'Alumno del Mes', orden: 47 },
    { codigo: 'nunca_falta', nombre: 'Nunca Falta', descripcion: 'Asiste a 8 clases consecutivas', categoria: 'asistencia', monedas_recompensa: 150, xp_recompensa: 500, criterio_tipo: 'clases_consecutivas', criterio_valor: '8', icono: '📆', rareza: 'raro', secreto: false, orden: 48 },

    // ÉPICO (1)
    { codigo: 'asistencia_perfecta_mensual', nombre: 'Asistencia Perfecta Mensual', descripcion: '4 clases asistidas + 0 inasistencias en el mes', categoria: 'asistencia', monedas_recompensa: 200, xp_recompensa: 800, criterio_tipo: 'asistencia_perfecta_mes', criterio_valor: '4', icono: '🏆', rareza: 'epico', secreto: false, extras: ['Certificado digital de asistencia perfecta'], orden: 49 },

    // LEGENDARIO (1)
    { codigo: 'asistencia_perfecta_trimestral', nombre: 'Asistencia Perfecta Trimestral', descripcion: '12 clases asistidas + 0 inasistencias en trimestre', categoria: 'asistencia', monedas_recompensa: 500, xp_recompensa: 2000, criterio_tipo: 'asistencia_perfecta_trimestre', criterio_valor: '12', icono: '👑📅', rareza: 'legendario', secreto: false, titulo: 'Alumno Modelo', extras: ['Certificado físico del director', 'Mención en newsletter'], orden: 50 },

    // ========== CATEGORÍA 7: DESAFÍOS SEMANALES (5 logros) ==========

    { codigo: 'lunes_motivado', nombre: 'Lunes Motivado', descripcion: 'Completa 5 ejercicios un lunes', categoria: 'desafios_semanales', monedas_recompensa: 60, xp_recompensa: 150, criterio_tipo: 'ejercicios_dia_semana', criterio_valor: JSON.stringify({ dia: 1, cantidad: 5 }), icono: '🌅', rareza: 'raro', secreto: false, orden: 51 },
    { codigo: 'viernes_fuego', nombre: 'Viernes de Fuego', descripcion: 'Sesión de 1 hora un viernes', categoria: 'desafios_semanales', monedas_recompensa: 80, xp_recompensa: 200, criterio_tipo: 'sesion_dia_semana', criterio_valor: JSON.stringify({ dia: 5, minutos: 60 }), icono: '🔥', rareza: 'raro', secreto: false, orden: 52 },
    { codigo: 'fin_semana_warrior', nombre: 'Fin de Semana Warrior', descripcion: 'Completa 20 ejercicios sábado + domingo', categoria: 'desafios_semanales', monedas_recompensa: 150, xp_recompensa: 400, criterio_tipo: 'ejercicios_fin_semana', criterio_valor: '20', icono: '⚔️', rareza: 'epico', secreto: false, orden: 53 },
    { codigo: 'semana_perfecta', nombre: 'Semana Perfecta', descripcion: 'Actividad todos los días de lunes a domingo', categoria: 'desafios_semanales', monedas_recompensa: 200, xp_recompensa: 500, criterio_tipo: 'actividad_7_dias_semana', criterio_valor: '7', icono: '✨', rareza: 'epico', secreto: false, animacion: 'semana_perfecta', orden: 54 },
    { codigo: 'madrugador', nombre: 'Madrugador', descripcion: 'Completa 10 ejercicios antes de las 7 AM', categoria: 'desafios_semanales', monedas_recompensa: 200, xp_recompensa: 500, criterio_tipo: 'ejercicios_horario', criterio_valor: JSON.stringify({ cantidad: 10, hora_max: 7 }), icono: '🌅', rareza: 'epico', secreto: true, titulo: 'Madrugador', orden: 55 },

    // ========== CATEGORÍA 8: ESPECIALIZACIÓN (4 logros) ==========

    { codigo: 'as_multiplicacion', nombre: 'As de la Multiplicación', descripcion: '100% en 20 ejercicios de multiplicación', categoria: 'especializacion', monedas_recompensa: 150, xp_recompensa: 400, criterio_tipo: 'especializacion_tema', criterio_valor: JSON.stringify({ tema: 'multiplicacion', cantidad: 20, precision: 100 }), icono: '✖️', rareza: 'raro', secreto: false, badge: 'As Multiplicación', orden: 56 },
    { codigo: 'rey_fracciones', nombre: 'Rey de las Fracciones', descripcion: '100% en 20 ejercicios de fracciones', categoria: 'especializacion', monedas_recompensa: 150, xp_recompensa: 400, criterio_tipo: 'especializacion_tema', criterio_valor: JSON.stringify({ tema: 'fracciones', cantidad: 20, precision: 100 }), icono: '🎂', rareza: 'raro', secreto: false, badge: 'Rey Fracciones', orden: 57 },
    { codigo: 'maestro_ecuaciones', nombre: 'Maestro de Ecuaciones', descripcion: '100% en 20 ejercicios de ecuaciones', categoria: 'especializacion', monedas_recompensa: 200, xp_recompensa: 600, criterio_tipo: 'especializacion_tema', criterio_valor: JSON.stringify({ tema: 'ecuaciones', cantidad: 20, precision: 100 }), icono: '📊', rareza: 'epico', secreto: false, badge: 'Maestro Ecuaciones', orden: 58 },
    { codigo: 'genio_calculo_mental', nombre: 'Genio del Cálculo Mental', descripcion: '50 ejercicios sin usar calculadora', categoria: 'especializacion', monedas_recompensa: 300, xp_recompensa: 800, criterio_tipo: 'ejercicios_sin_calculadora', criterio_valor: '50', icono: '🧠', rareza: 'epico', secreto: false, titulo: 'Calculadora Humana', orden: 59 },

    // ========== CATEGORÍA 9: NIVELES (4 logros) ==========

    { codigo: 'nivel_5', nombre: 'Nivel 5', descripcion: 'Alcanza el nivel 5', categoria: 'niveles', monedas_recompensa: 100, xp_recompensa: 200, criterio_tipo: 'nivel_alcanzado', criterio_valor: '5', icono: '⭐⭐⭐⭐⭐', rareza: 'raro', secreto: false, badge: 'Nivel 5 dorado', orden: 60 },
    { codigo: 'nivel_7', nombre: 'Nivel 7', descripcion: 'Alcanza el nivel 7', categoria: 'niveles', monedas_recompensa: 200, xp_recompensa: 500, criterio_tipo: 'nivel_alcanzado', criterio_valor: '7', icono: '⭐⭐⭐⭐⭐⭐⭐', rareza: 'raro', secreto: false, extras: ['Marco avatar platino'], orden: 61 },
    { codigo: 'nivel_10', nombre: 'Nivel 10', descripcion: 'Alcanza el nivel 10', categoria: 'niveles', monedas_recompensa: 500, xp_recompensa: 1000, criterio_tipo: 'nivel_alcanzado', criterio_valor: '10', icono: '🌟', rareza: 'epico', secreto: false, extras: ['Avatar con aura legendaria', 'Acceso VIP completo'], orden: 62 },
    { codigo: 'maximo_nivel', nombre: 'Máximo Nivel', descripcion: 'Alcanza el nivel máximo del sistema (15+)', categoria: 'niveles', monedas_recompensa: 2000, xp_recompensa: 5000, criterio_tipo: 'nivel_alcanzado', criterio_valor: '15', icono: '👑💎', rareza: 'legendario', secreto: false, titulo: 'Leyenda Máxima', extras: ['Hall of Fame permanente', 'Placa física conmemorativa'], orden: 63 },

    // ========== CATEGORÍA 10: SECRETOS (10 logros) ==========

    { codigo: 'error_404', nombre: 'Error 404', descripcion: 'Responde incorrectamente un ejercicio fácil', categoria: 'secretos', monedas_recompensa: 50, xp_recompensa: 100, criterio_tipo: 'error_ejercicio_facil', criterio_valor: '1', icono: '🐛', rareza: 'comun', secreto: true, mensaje_desbloqueo: 'Hasta los genios se equivocan 😉', orden: 64 },
    { codigo: 'detective', nombre: 'Detective', descripcion: 'Revisa tu historial de progreso 10 veces', categoria: 'secretos', monedas_recompensa: 80, xp_recompensa: 150, criterio_tipo: 'revisar_historial', criterio_valor: '10', icono: '🔍', rareza: 'comun', secreto: true, badge: 'Detective', orden: 65 },
    { codigo: 'curioso', nombre: 'Curioso', descripcion: 'Abre todos los módulos para explorar', categoria: 'secretos', monedas_recompensa: 100, xp_recompensa: 200, criterio_tipo: 'explorar_todos_modulos', criterio_valor: '1', icono: '🤔', rareza: 'raro', secreto: true, titulo: 'Explorador', orden: 66 },
    { codigo: 'speedrunner', nombre: 'Speedrunner', descripcion: 'Completa un tema en menos de 30 minutos', categoria: 'secretos', monedas_recompensa: 300, xp_recompensa: 500, criterio_tipo: 'tema_muy_rapido', criterio_valor: '30', icono: '🏃💨', rareza: 'epico', secreto: true, animacion: 'speedrun', orden: 67 },
    { codigo: 'ninja', nombre: 'Ninja', descripcion: 'Completa 5 ejercicios sin hacer ningún error', categoria: 'secretos', monedas_recompensa: 200, xp_recompensa: 400, criterio_tipo: 'ejercicios_perfectos_sesion', criterio_valor: '5', icono: '🥷', rareza: 'epico', secreto: true, extras: ['Efecto: Sombras en avatar'], orden: 68 },
    { codigo: 'multitasker', nombre: 'Multitasker', descripcion: 'Trabaja en 3 temas diferentes en un día', categoria: 'secretos', monedas_recompensa: 150, xp_recompensa: 300, criterio_tipo: 'temas_diferentes_dia', criterio_valor: '3', icono: '🎯🎯', rareza: 'raro', secreto: true, orden: 69 },
    { codigo: 'comeback_kid', nombre: 'Comeback Kid', descripcion: 'Vuelve después de perder racha de 7+ días', categoria: 'secretos', monedas_recompensa: 100, xp_recompensa: 200, criterio_tipo: 'volver_despues_racha_perdida', criterio_valor: '7', icono: '💪', rareza: 'raro', secreto: true, mensaje_desbloqueo: '¡Bienvenido de vuelta! 🎉', orden: 70 },
    { codigo: 'perfeccionista_obsesivo', nombre: 'Perfeccionista Obsesivo', descripcion: 'Repite un ejercicio 100% tres veces más', categoria: 'secretos', monedas_recompensa: 50, xp_recompensa: 100, criterio_tipo: 'repetir_ejercicio_perfecto', criterio_valor: '3', icono: '😅', rareza: 'comun', secreto: true, mensaje_desbloqueo: 'Ya estaba perfecto... ¡pero bueno! 😄', orden: 71 },
    { codigo: 'social_butterfly', nombre: 'Social Butterfly', descripcion: 'Ayuda a 3 compañeros diferentes en un día', categoria: 'secretos', monedas_recompensa: 150, xp_recompensa: 250, criterio_tipo: 'ayudas_diferentes_dia', criterio_valor: '3', icono: '🦋', rareza: 'raro', secreto: true, orden: 72 },
    { codigo: 'noche_vela', nombre: 'Noche en Vela', descripcion: 'Completa 30 ejercicios entre 00:00-06:00', categoria: 'secretos', monedas_recompensa: 500, xp_recompensa: 800, criterio_tipo: 'ejercicios_madrugada', criterio_valor: JSON.stringify({ cantidad: 30, hora_min: 0, hora_max: 6 }), icono: '🌃', rareza: 'epico', secreto: true, titulo: 'Insomne Académico', orden: 73 }
  ];

  for (const logro of logros) {
    await prisma.logro.upsert({
      where: { codigo: logro.codigo },
      update: logro,
      create: logro,
    });
  }

  console.log(`✅ ${logros.length} logros creados exitosamente`);
  console.log('📊 Distribución:');
  console.log('  - Comunes:', logros.filter(l => l.rareza === 'comun').length);
  console.log('  - Raros:', logros.filter(l => l.rareza === 'raro').length);
  console.log('  - Épicos:', logros.filter(l => l.rareza === 'epico').length);
  console.log('  - Legendarios:', logros.filter(l => l.rareza === 'legendario').length);
  console.log('  - Secretos:', logros.filter(l => l.secreto).length);
}
