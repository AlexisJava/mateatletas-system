'use client';

/// <reference path="../../../../types/model-viewer.d.ts" />

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useOverlay } from '../contexts/OverlayStackProvider';
import type { OverlayConfig } from '../types/overlay.types';
import { recursosApi } from '@/lib/api/tienda.api';
import type { RecursosEstudiante } from '@mateatletas/contracts';
import { AnimatedAvatar3D } from '@/components/3d/AnimatedAvatar3D';
import { useStudentAnimations } from '@/hooks/useStudentAnimations';
import { useAuthStore } from '@/store/auth.store';
import { ProximaClaseCard } from '@/components/dashboard/ProximaClaseCard';
import { estudiantesApi } from '@/lib/api/estudiantes.api';
import { useRachaAutomatica } from '@/hooks/useRachaAutomatica';
import { useDeviceType } from '@/hooks/useDeviceType';

// Type compatible con sistema antiguo
type OverlayType = OverlayConfig['type'] | null;
import {
  Home,
  BookOpen,
  Trophy,
  ShoppingBag,
  Users,
  Bell,
  Flame,
  Star,
  Coins,
  Gem,
  Brain,
  BarChart3,
  Sparkles,
  LogOut,
  Calendar,
} from 'lucide-react';

interface HubViewProps {
  onNavigate: (_view: string) => void;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    nivel_actual: number;
    puntos_totales: number;
    avatar_url?: string | null;
    animacion_idle_url?: string | null;
  };
}

interface NavButton {
  id: string;
  overlayId: OverlayType;
  label: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  glowColor: string;
  badge?: number;
  pulse?: boolean;
}

type ProximaClase = Awaited<ReturnType<typeof estudiantesApi.getProximaClase>>;

const FALLBACK_IDLE_ANIMATION_URL =
  'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_001.glb';
const FALLBACK_ACTIVE_ANIMATION_URL =
  'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_Variations_005.glb';

const NAV_LEFT: NavButton[] = [
  {
    id: 'hub',
    overlayId: null,
    label: 'HUB',
    description: 'Tu espacio personal',
    icon: <Home className="w-7 h-7" />,
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    glowColor: 'cyan',
    badge: 0,
  },
  {
    id: 'entrenamientos',
    overlayId: 'entrenamientos',
    label: 'ENTRENAMIENTOS',
    description: 'Juegos y desafíos mentales',
    icon: <Brain className="w-7 h-7" />,
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    glowColor: 'pink',
    badge: 0,
    pulse: false,
  },
  {
    id: 'tareas-asignadas',
    overlayId: 'tareas-asignadas',
    label: 'TAREAS ASIGNADAS',
    description: 'Actividades pendientes',
    icon: <BookOpen className="w-7 h-7" />,
    gradient: 'from-purple-500 via-violet-500 to-indigo-600',
    glowColor: 'purple',
    badge: 4,
    pulse: true,
  },
  {
    id: 'mis-logros',
    overlayId: 'mis-logros',
    label: 'MIS LOGROS',
    description: 'Tus logros personales',
    icon: <Trophy className="w-7 h-7" />,
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    glowColor: 'yellow',
    badge: 2,
    pulse: true,
  },
  {
    id: 'tienda',
    overlayId: 'tienda',
    label: 'TIENDA',
    description: 'Mejoras y avatares',
    icon: <ShoppingBag className="w-7 h-7" />,
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    glowColor: 'green',
    badge: 0,
  },
];

const NAV_RIGHT: NavButton[] = [
  {
    id: 'animaciones',
    overlayId: 'animaciones',
    label: 'ANIMACIONES',
    description: 'Personaliza tu avatar',
    icon: <Sparkles className="w-7 h-7" />,
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    glowColor: 'purple',
    badge: 0,
    pulse: false,
  },
  {
    id: 'mi-grupo',
    overlayId: 'mi-grupo',
    label: 'MI GRUPO',
    description: 'Tu comunidad de estudio',
    icon: <Users className="w-7 h-7" />,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    glowColor: 'cyan',
    badge: 0,
  },
  {
    id: 'mi-progreso',
    overlayId: 'mi-progreso',
    label: 'MI PROGRESO',
    description: 'Tu evolución personal',
    icon: <BarChart3 className="w-7 h-7" />,
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    glowColor: 'green',
    badge: 0,
  },
  {
    id: 'notificaciones',
    overlayId: 'notificaciones',
    label: 'NOTIFICACIONES',
    description: 'Novedades y alertas',
    icon: <Bell className="w-7 h-7" />,
    gradient: 'from-red-500 via-orange-500 to-amber-600',
    glowColor: 'red',
    badge: 0,
  },
  {
    id: 'cerrar-sesion',
    overlayId: null, // No abre overlay, abre modal
    label: 'SALIR',
    description: 'Cerrar sesión',
    icon: <LogOut className="w-7 h-7" />,
    gradient: 'from-red-500 via-pink-500 to-red-600',
    glowColor: 'red',
    badge: 0,
  },
];

export function HubView({ onNavigate, estudiante }: HubViewProps) {
  const [activeView, setActiveView] = useState('hub');
  const [isMounted, setIsMounted] = useState(false);
  const [recursos, setRecursos] = useState<RecursosEstudiante | null>(null);
  const [proximaClase, setProximaClase] = useState<ProximaClase>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | undefined>(undefined);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showClaseNoComenzModal, setShowClaseNoComenzModal] = useState(false);
  const [minutosRestantes, setMinutosRestantes] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // const _modelRef = useRef<unknown>(null); // TODO: usar para controlar el modelo 3D
  const { openOverlay } = useOverlay();
  const { logout } = useAuthStore();
  const router = useRouter();

  // Hook de detección de dispositivo
  const { deviceType } = useDeviceType();

  const studentGender = useMemo<'masculine' | 'feminine' | undefined>(() => {
    if (!estudiante.avatar_url) return undefined;
    return estudiante.avatar_url.includes('/feminine/') ? 'feminine' : 'masculine';
  }, [estudiante.avatar_url]);

  // Hook de animaciones
  const { getRandomAnimation, animationsByCategory } = useStudentAnimations({
    studentPoints: estudiante.puntos_totales,
    gender: studentGender,
  });

  const defaultIdleAnimationUrl = useMemo(() => {
    const idleAnimations = animationsByCategory?.idle ?? [];

    if (studentGender) {
      const genderMatched = idleAnimations.find((animation) => animation.gender === studentGender);
      if (genderMatched) {
        return genderMatched.url;
      }
    }

    return idleAnimations[0]?.url ?? FALLBACK_IDLE_ANIMATION_URL;
  }, [animationsByCategory, studentGender]);

  // Hook de racha automática - registra actividad del día al entrar
  const { racha: rachaData } = useRachaAutomatica(estudiante.id);

  useEffect(() => {
    setIsMounted(true);

    // Cargar animación con prioridad:
    // 1. animacion_idle_url del backend (viene del login)
    // 2. localStorage (selección temporal)
    // 3. default idle animation
    const storedAnimation =
      typeof window !== 'undefined' ? window.localStorage.getItem('selected_idle_animation') : null;
    const animacionInicial =
      estudiante.animacion_idle_url ?? storedAnimation ?? defaultIdleAnimationUrl;

    setCurrentAnimation(animacionInicial);

    // Escuchar cambios de animación desde AnimacionesView
    const handleAnimationSelected = (event: Event) => {
      const customEvent = event as CustomEvent<{ animationUrl?: string }>;
      if (customEvent.detail?.animationUrl) {
        setCurrentAnimation(customEvent.detail.animationUrl);
      } else {
        setCurrentAnimation(defaultIdleAnimationUrl);
      }
    };

    window.addEventListener('animation-selected', handleAnimationSelected);

    return () => {
      window.removeEventListener('animation-selected', handleAnimationSelected);
    };
  }, [estudiante.animacion_idle_url, defaultIdleAnimationUrl]);

  // Cargar recursos del estudiante
  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        const data = await recursosApi.obtenerRecursos(estudiante.id);
        setRecursos(data);
      } catch (error) {
        console.error('Error cargando recursos:', error);
      }
    };

    if (estudiante.id) {
      cargarRecursos();
    }
  }, [estudiante.id]);

  // Cargar próxima clase del estudiante
  useEffect(() => {
    const cargarProximaClase = async () => {
      try {
        const data = await estudiantesApi.getProximaClase();
        setProximaClase(data);
      } catch (err) {
        // Si es 403 o 404, simplemente no hay clase - no es un error crítico
        const error = err as { response?: { status?: number } };
        if (error?.response?.status === 403 || error?.response?.status === 404) {
          console.log('ℹ️ No hay próxima clase programada para este estudiante');
          setProximaClase(null);
        } else {
          console.error('Error cargando próxima clase:', err);
        }
      }
    };

    if (estudiante.id) {
      cargarProximaClase();
    }
  }, [estudiante.id]);

  // Hook para animaciones del avatar - triggers manuales
  const triggerAnimation = useCallback(
    (animationUrl?: string | null, returnToIdleAfter?: number) => {
      try {
        const nextAnimation = animationUrl ?? defaultIdleAnimationUrl;
        setCurrentAnimation(nextAnimation);

        if (returnToIdleAfter) {
          setTimeout(() => {
            setCurrentAnimation(defaultIdleAnimationUrl);
          }, returnToIdleAfter);
        }
      } catch (error) {
        console.debug('Animation error:', error);
      }
    },
    [defaultIdleAnimationUrl],
  );

  // NO rotar animaciones automáticamente - mantener idle continuo
  // Solo cambiar cuando el usuario interactúa

  // Calcular si la próxima clase es HOY
  const esHoy = useMemo(() => {
    if (!proximaClase || !proximaClase.fecha_hora_inicio) return false;

    const fechaClase = new Date(proximaClase.fecha_hora_inicio);
    const hoy = new Date();

    return (
      fechaClase.getFullYear() === hoy.getFullYear() &&
      fechaClase.getMonth() === hoy.getMonth() &&
      fechaClase.getDate() === hoy.getDate()
    );
  }, [proximaClase]);

  // Helper para formatear tiempo en formato amigable
  const formatearTiempoRestante = useCallback((minutos: number): string => {
    if (minutos < 60) {
      return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (minutosRestantes === 0) {
      return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }

    return `${horas} ${horas === 1 ? 'hora' : 'horas'} y ${minutosRestantes} ${minutosRestantes === 1 ? 'minuto' : 'minutos'}`;
  }, []);

  // Handler para intentar ingresar a la clase
  const handleIngresarClase = useCallback(() => {
    if (!proximaClase || !proximaClase.fecha_hora_inicio) return;

    const ahora = new Date();
    const fechaClase = new Date(proximaClase.fecha_hora_inicio);
    const minutosRestantes = Math.floor((fechaClase.getTime() - ahora.getTime()) / (1000 * 60));

    // Si faltan más de 5 minutos, mostrar modal
    if (minutosRestantes > 5) {
      setMinutosRestantes(minutosRestantes);
      setShowClaseNoComenzModal(true);
      return;
    }

    // Si faltan 5 minutos o menos, o ya empezó (pero no pasó mucho tiempo), permitir acceso
    // Animación energética antes de navegar
    const energeticUrl =
      getRandomAnimation('expression')?.url ??
      getRandomAnimation('idle')?.url ??
      FALLBACK_ACTIVE_ANIMATION_URL;
    triggerAnimation(energeticUrl, 2000);

    setTimeout(() => {
      // TODO: Navegar a la vista de clase sincrónica
      console.log('🎓 Ingresando a clase:', proximaClase);
      // onNavigate('clase-sincronica'); // Implementar cuando exista la vista
    }, 1800);
  }, [getRandomAnimation, proximaClase, triggerAnimation]);

  // Valores de recursos (del backend o fallback si está cargando)
  const monedas = recursos?.monedas_total ?? 0;
  const gemas = recursos?.gemas_total ?? 0;
  const xp_total = recursos?.xp_total ?? 0;
  const racha_dias = rachaData?.racha_actual ?? 0;

  // Calcular nivel basado en XP (fórmula: nivel = floor(sqrt(XP / 100)) + 1)
  const nivelCalculado = Math.floor(Math.sqrt(xp_total / 100)) + 1;

  // Calcular XP necesario para el siguiente nivel
  const xpNivelActual = (nivelCalculado - 1) * (nivelCalculado - 1) * 100;
  const xpNivelSiguiente = nivelCalculado * nivelCalculado * 100;
  const xpEnNivelActual = xp_total - xpNivelActual;
  const xpNecesarioParaSiguienteNivel = xpNivelSiguiente - xpNivelActual;
  const porcentajeProgresoNivel = (xpEnNivelActual / xpNecesarioParaSiguienteNivel) * 100;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col">
      {/* Fondo con gradientes animados "Deep Space" + hexágonos visibles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradiente base espacial animado - Púrpuras neón, cyans brillantes */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.25) 25%, rgba(99, 102, 241, 0.3) 50%, rgba(79, 70, 229, 0.25) 75%, rgba(67, 56, 202, 0.3) 100%)',
              'linear-gradient(225deg, rgba(67, 56, 202, 0.3) 0%, rgba(79, 70, 229, 0.25) 25%, rgba(99, 102, 241, 0.3) 50%, rgba(168, 85, 247, 0.25) 75%, rgba(139, 92, 246, 0.3) 100%)',
              'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.25) 25%, rgba(99, 102, 241, 0.3) 50%, rgba(79, 70, 229, 0.25) 75%, rgba(67, 56, 202, 0.3) 100%)',
            ],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Capa de acentos radiales neón que se mueven - Cyans y magentas */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 25% 25%, rgba(6, 182, 212, 0.4) 0%, transparent 40%), radial-gradient(ellipse at 75% 75%, rgba(236, 72, 153, 0.35) 0%, transparent 40%)',
              'radial-gradient(ellipse at 75% 25%, rgba(236, 72, 153, 0.4) 0%, transparent 40%), radial-gradient(ellipse at 25% 75%, rgba(6, 182, 212, 0.35) 0%, transparent 40%)',
              'radial-gradient(ellipse at 25% 25%, rgba(6, 182, 212, 0.4) 0%, transparent 40%), radial-gradient(ellipse at 75% 75%, rgba(236, 72, 153, 0.35) 0%, transparent 40%)',
            ],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />

        {/* Capa extra de destellos azules eléctricos */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 35%)',
              'radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 35%)',
              'radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.25) 0%, transparent 35%)',
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 35%)',
            ],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Hexágonos flotantes MÁS VISIBLES */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + (i % 4) * 25}%`,
              top: `${20 + Math.floor(i / 4) * 50}%`,
              width: '90px',
              height: '90px',
              opacity: 0.4, // Opacidad aumentada
            }}
            animate={{
              rotate: [0, 360],
              y: [0, -35, 0],
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.2,
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon
                points="50 1 95 25 95 75 50 99 5 75 5 25"
                fill="none"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
        ))}

        {/* Hexágonos grandes adicionales MÁS VISIBLES */}
        <motion.div
          className="absolute"
          style={{
            left: '10%',
            top: '60%',
            width: '130px',
            height: '130px',
            opacity: 0.35, // Opacidad aumentada
          }}
          animate={{
            rotate: [0, -360],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50 1 95 25 95 75 50 99 5 75 5 25"
              fill="none"
              stroke="rgba(168, 85, 247, 0.65)"
              strokeWidth="2"
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute"
          style={{
            right: '12%',
            top: '15%',
            width: '110px',
            height: '110px',
            opacity: 0.35, // Opacidad aumentada
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50 1 95 25 95 75 50 99 5 75 5 25"
              fill="none"
              stroke="rgba(34, 211, 238, 0.7)"
              strokeWidth="2"
            />
          </svg>
        </motion.div>
      </div>

      {/* ========== NAVEGACIÓN LATERAL IZQUIERDA - SOLO DESKTOP ========== */}
      {(deviceType === 'desktop' || deviceType === 'ultrawide') && (
        <nav className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
          {NAV_LEFT.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavButtonUltra
                item={item}
                isActive={activeView === item.id}
                onClick={() => {
                  if (item.overlayId) {
                    openOverlay(item.overlayId);
                  } else {
                    setActiveView(item.id);
                  }
                }}
                side="left"
              />
            </motion.div>
          ))}
        </nav>
      )}

      {/* ========== NAVEGACIÓN LATERAL DERECHA - SOLO DESKTOP ========== */}
      {(deviceType === 'desktop' || deviceType === 'ultrawide') && (
        <nav className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
          {NAV_RIGHT.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavButtonUltra
                item={item}
                isActive={activeView === item.id}
                onClick={() => {
                  if (item.id === 'cerrar-sesion') {
                    // Abrir modal de confirmación
                    setShowLogoutModal(true);
                  } else if (item.overlayId) {
                    openOverlay(item.overlayId);
                  } else {
                    setActiveView(item.id);
                  }
                }}
                side="right"
              />
            </motion.div>
          ))}
        </nav>
      )}

      {/* ========== HEADER ========== */}
      <header
        className={`relative z-30 flex items-center justify-between ${
          deviceType === 'mobile' ? 'h-[12vh] px-4 pt-3' : 'h-[14vh] px-8 pt-4'
        }`}
      >
        {/* Logo MATEATLETAS CLUB STEAM - IZQUIERDA Desktop */}
        {(deviceType === 'desktop' || deviceType === 'ultrawide') && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-white font-black text-3xl md:text-4xl uppercase tracking-wider drop-shadow-2xl text-left font-[family-name:var(--font-lilita)]">
              Mateatletas Club{' '}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                STEAM
              </span>
            </div>
          </motion.div>
        )}

        {/* BARRA DE PROGRESO XP - IZQUIERDA Mobile/Tablet - ULTRA ZARPADA Y OBSESIVA */}
        {(deviceType === 'mobile' || deviceType === 'tablet') && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={
              deviceType === 'mobile' ? 'flex-1 max-w-[200px] mr-2' : 'flex-1 max-w-sm mr-3'
            }
          >
            {/* Wrapper con glow exterior violeta - OBSESIVO */}
            <div className="relative">
              {/* Blur violeta exterior - capa 1 */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-purple-600/40 rounded-xl blur-md" />

              {/* Blur violeta exterior - capa 2 (más amplio y sutil) */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Contenedor principal */}
              <div
                className={`relative h-[48px] bg-gradient-to-br from-purple-900/70 via-indigo-900/70 to-purple-900/70 backdrop-blur-md rounded-xl border-2 border-purple-400/40 shadow-2xl flex flex-col justify-center overflow-hidden ${
                  deviceType === 'mobile' ? 'px-3 py-1.5' : 'px-4 py-2'
                }`}
              >
                {/* Brillo sutil interno que recorre */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/10 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                />

                {/* Contenido */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Star
                          className={`fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)] ${deviceType === 'mobile' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
                        />
                      </motion.div>
                      <span
                        className={`text-white font-black drop-shadow-md ${deviceType === 'mobile' ? 'text-xs' : 'text-sm'}`}
                      >
                        NIVEL {nivelCalculado}
                      </span>
                    </div>
                    <span
                      className={`text-yellow-300/90 font-bold drop-shadow-sm ${deviceType === 'mobile' ? 'text-[9px]' : 'text-[10px]'}`}
                    >
                      {xpEnNivelActual}/{xpNecesarioParaSiguienteNivel}
                    </span>
                  </div>

                  {/* Barra de progreso con efectos zarpados */}
                  <div className="relative w-full bg-black/60 rounded-full overflow-hidden border-2 border-purple-500/40 h-2 shadow-inner">
                    {/* Barra principal con gradiente */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(porcentajeProgresoNivel, 100)}%` }}
                      transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                      className="relative h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/70"
                    >
                      {/* Brillo superior en la barra */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
                    </motion.div>

                    {/* Brillo animado que recorre la barra */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* RECURSOS + BARRA PROGRESO + MENÚ - DERECHA */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`flex items-center ${deviceType === 'mobile' ? 'gap-3' : 'gap-4'}`}
        >
          {/* BARRA DE PROGRESO XP - DERECHA Desktop - MEGA PRO */}
          {(deviceType === 'desktop' || deviceType === 'ultrawide') && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-[420px] mr-2"
            >
              {/* Wrapper con glow exterior violeta - OBSESIVO */}
              <div className="relative">
                {/* Blur violeta exterior - capa 1 */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/40 via-indigo-600/40 to-purple-600/40 rounded-xl blur-md" />

                {/* Blur violeta exterior - capa 2 (más amplio y sutil) */}
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl blur-xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Contenedor principal */}
                <div className="relative h-[64px] bg-gradient-to-br from-purple-900/70 via-indigo-900/70 to-purple-900/70 backdrop-blur-md rounded-2xl border-2 border-purple-400/40 shadow-2xl flex flex-col justify-center overflow-hidden px-6 py-3">
                  {/* Brillo sutil interno que recorre */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                  />

                  {/* Contenido */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3,
                          }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]" />
                        </motion.div>
                        <span className="text-white font-black drop-shadow-md text-base">
                          NIVEL {nivelCalculado}
                        </span>
                      </div>
                      <span className="text-yellow-300/90 font-bold drop-shadow-sm text-xs">
                        {xpEnNivelActual}/{xpNecesarioParaSiguienteNivel}
                      </span>
                    </div>

                    {/* Barra de progreso con efectos zarpados */}
                    <div className="relative w-full bg-black/60 rounded-full overflow-hidden border-2 border-purple-500/40 h-2.5 shadow-inner">
                      {/* Barra principal con gradiente */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(porcentajeProgresoNivel, 100)}%` }}
                        transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                        className="relative h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/70"
                      >
                        {/* Brillo superior en la barra */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
                      </motion.div>

                      {/* Brillo animado que recorre la barra */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <ResourcePill
            icon={<Coins className={deviceType === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'} />}
            value={monedas}
            gradient="from-yellow-400 to-amber-500"
            borderColor="yellow-600"
          />
          <ResourcePill
            icon={<Gem className={deviceType === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'} />}
            value={gemas}
            gradient="from-sky-400 to-indigo-500"
            borderColor="sky-600"
          />
          <ResourcePill
            icon={<Flame className={deviceType === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'} />}
            value={racha_dias}
            gradient="from-orange-500 to-red-600"
            borderColor="red-700"
          />

          {/* Botón NOTIFICACIONES - Flotante fuera del menú */}
          {(deviceType === 'mobile' || deviceType === 'tablet') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openOverlay('notificaciones')}
              className={`relative bg-gradient-to-br from-red-500 via-orange-500 to-amber-600 rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden ${
                deviceType === 'mobile' ? 'w-[56px] h-[48px]' : 'w-[64px] h-[48px]'
              }`}
            >
              {/* Blur de fondo */}
              <div className="absolute inset-0 bg-red-600/40 blur-xl" />

              {/* Glow pulsante FUERTE para llamar atención */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-red-400/40 to-orange-400/40"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Brillo que recorre */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />

              {/* Icono de campana */}
              <motion.div
                className="relative z-10"
                animate={{
                  rotate: [0, -15, 15, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Bell className={`text-white ${deviceType === 'mobile' ? 'w-6 h-6' : 'w-7 h-7'}`} />
              </motion.div>
            </motion.button>
          )}

          {/* Botón MENÚ hamburguesa - ÚLTIMO elemento (para los nenes) - ÉPICO */}
          {(deviceType === 'mobile' || deviceType === 'tablet') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(true)}
              className={`relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg overflow-hidden ${
                deviceType === 'mobile' ? 'w-[56px] h-[48px]' : 'w-[64px] h-[48px]'
              }`}
            >
              {/* Blur violeta de fondo - OBSESIVO */}
              <div className="absolute inset-0 bg-purple-600/40 blur-xl" />

              {/* Glow pulsante */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Brillo sutil que recorre */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />

              {/* Hamburguesa - Relativo para estar encima */}
              <div className="relative flex flex-col gap-1 z-10">
                <div
                  className={`bg-white rounded-full shadow-sm ${deviceType === 'mobile' ? 'w-6 h-0.5' : 'w-7 h-0.5'}`}
                />
                <div
                  className={`bg-white rounded-full shadow-sm ${deviceType === 'mobile' ? 'w-6 h-0.5' : 'w-7 h-0.5'}`}
                />
                <div
                  className={`bg-white rounded-full shadow-sm ${deviceType === 'mobile' ? 'w-6 h-0.5' : 'w-7 h-0.5'}`}
                />
              </div>
            </motion.button>
          )}
        </motion.div>
      </header>

      {/* ========== CENTRO DIVIDIDO: 50% AVATAR | 50% INFO ========== */}
      <div
        className={`flex-1 flex items-center justify-center relative z-10 ${
          deviceType === 'mobile'
            ? 'px-2 py-1'
            : deviceType === 'tablet'
              ? 'px-6 py-4'
              : 'px-32 py-8'
        }`}
      >
        <div
          className={`w-full flex h-full ${
            deviceType === 'mobile'
              ? 'gap-1 max-w-full px-2'
              : deviceType === 'tablet'
                ? 'gap-4 max-w-5xl px-4'
                : 'gap-8 max-w-7xl px-8'
          }`}
        >
          {/* ========== COLUMNA IZQUIERDA - AVATAR 3D GIGANTE ========== */}
          <div className="w-1/2 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Resplandor/Glow detrás del avatar - responsive */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  width:
                    deviceType === 'mobile' ? '250px' : deviceType === 'tablet' ? '350px' : '500px',
                  height:
                    deviceType === 'mobile' ? '250px' : deviceType === 'tablet' ? '350px' : '500px',
                  background:
                    'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(99, 102, 241, 0.3) 25%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
                  filter:
                    deviceType === 'mobile'
                      ? 'blur(20px)'
                      : deviceType === 'tablet'
                        ? 'blur(30px)'
                        : 'blur(40px)',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Segundo anillo de resplandor - más amplio y sutil - Solo Desktop/Tablet */}
              {(deviceType === 'desktop' ||
                deviceType === 'ultrawide' ||
                deviceType === 'tablet') && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    width: deviceType === 'tablet' ? '450px' : '650px',
                    height: deviceType === 'tablet' ? '450px' : '650px',
                    background:
                      'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 65%)',
                    filter: deviceType === 'tablet' ? 'blur(35px)' : 'blur(50px)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                />
              )}

              {/* Avatar 3D Animado - CLICKEABLE PARA ANIMAR */}
              <div
                className="relative z-20 cursor-pointer w-full h-full"
                onClick={() => {
                  const clickAnimationUrl =
                    getRandomAnimation('dance')?.url ??
                    getRandomAnimation('expression')?.url ??
                    FALLBACK_ACTIVE_ANIMATION_URL;
                  triggerAnimation(clickAnimationUrl, 4000);
                }}
              >
                {isMounted && estudiante.avatar_url && (
                  <AnimatedAvatar3D
                    avatarUrl={estudiante.avatar_url}
                    animationUrl={currentAnimation}
                    width="100%"
                    height="100%"
                    cameraPosition={
                      deviceType === 'mobile'
                        ? [-1, 1.5, 1] // Mobile: SÚPER CERCA - cinematic chest + face
                        : deviceType === 'tablet'
                          ? [-0.3, 1.6, 1.2] // Tablet: más cerca que antes
                          : [0, 0.6, 2.4] // Desktop: normal
                    }
                    cameraFov={deviceType === 'mobile' ? 42 : 50} // FOV más abierto para ver cabeza
                    scale={
                      deviceType === 'mobile'
                        ? 1.3 // Mobile: ajustado para ver más
                        : deviceType === 'tablet'
                          ? 1.25
                          : 1.15
                    }
                    position={
                      deviceType === 'mobile'
                        ? [-0.25, -0.55, 0] // Mobile: avatar MÁS ABAJO para ver cabeza completa
                        : deviceType === 'tablet'
                          ? [-0.3, -0.3, 0]
                          : [-0.3, -0.45, 0]
                    }
                    rotation={[0, 0.26, 0]}
                    enableControls={false}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* ========== COLUMNA DERECHA - INFO + STATS + CTA ========== */}
          <div
            className={`w-1/2 flex flex-col justify-center pb-20 ${
              deviceType === 'mobile' ? 'gap-2' : deviceType === 'tablet' ? 'gap-4' : 'gap-8'
            }`}
          >
            {/* Saludo personalizado al estudiante - ALINEADO A LA IZQUIERDA */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, type: 'spring' }}
              className="text-left"
            >
              <h2
                className={`font-[family-name:var(--font-lilita)] font-black uppercase text-white leading-tight ${
                  deviceType === 'mobile'
                    ? 'text-xl'
                    : deviceType === 'tablet'
                      ? 'text-2xl'
                      : 'text-4xl'
                }`}
                style={{
                  textShadow: '0 0 30px rgba(255,255,255,0.3), 0 4px 0 rgba(0,0,0,0.3)',
                }}
              >
                ¡Hola, {estudiante.nombre.split(' ')[0]}!
              </h2>
              <motion.p
                className={`text-cyan-300 font-bold uppercase tracking-wider ${
                  deviceType === 'mobile'
                    ? 'text-[10px] mt-0.5'
                    : deviceType === 'tablet'
                      ? 'text-xs mt-1'
                      : 'text-base mt-2'
                }`}
                style={{
                  textShadow: '0 2px 10px rgba(6,182,212,0.5)',
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Detectar género por avatar_url (masculine/feminine) */}
                {estudiante.animacion_idle_url?.includes('/feminine/')
                  ? '¡Lista para entrenar!'
                  : '¡Listo para entrenar!'}
              </motion.p>
            </motion.div>

            {/* Próxima Clase Card */}
            {proximaClase && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.42 }}
              >
                <ProximaClaseCard
                  clase={{
                    ...proximaClase,
                    ruta_curricular: proximaClase.ruta_curricular
                      ? {
                          nombre: proximaClase.ruta_curricular.nombre,
                          color: '#3B82F6', // Color por defecto azul
                        }
                      : undefined,
                  }}
                  delay={0.42}
                />
              </motion.div>
            )}

            {/* Botón CTA GIGANTE - Condicional según clase de hoy */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring' }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={() => {
                  // Si hay clase hoy, intentar ingresar
                  if (esHoy && proximaClase) {
                    handleIngresarClase();
                  } else {
                    // Caso default: entrenar matemáticas
                    const energeticUrl =
                      getRandomAnimation('expression')?.url ??
                      getRandomAnimation('idle')?.url ??
                      FALLBACK_ACTIVE_ANIMATION_URL;
                    triggerAnimation(energeticUrl, 2000);
                    setTimeout(() => {
                      onNavigate('entrenamientos');
                    }, 1800);
                  }
                }}
                className={`
                  w-full
                  ${deviceType === 'mobile' ? 'h-12 rounded-xl' : deviceType === 'tablet' ? 'h-16 rounded-2xl' : 'h-24 rounded-3xl'}
                  ${
                    esHoy && proximaClase
                      ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 border-green-600'
                      : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 border-yellow-600'
                  }
                  ${
                    deviceType === 'mobile'
                      ? 'shadow-[0_4px_0_rgba(0,0,0,0.3)] hover:shadow-[0_3px_0_rgba(0,0,0,0.3)] active:shadow-[0_1px_0_rgba(0,0,0,0.3)]'
                      : 'shadow-[0_12px_0_rgba(0,0,0,0.3)] hover:shadow-[0_8px_0_rgba(0,0,0,0.3)] active:shadow-[0_2px_0_rgba(0,0,0,0.3)]'
                  }
                  ${deviceType === 'mobile' ? 'border-2' : 'border-4'}
                  relative overflow-hidden
                  transition-all
                `}
              >
                {/* Brillo animado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />

                <div className="relative z-10 text-center">
                  <div
                    className={`text-white font-black uppercase tracking-wider drop-shadow-lg ${
                      deviceType === 'mobile'
                        ? 'text-sm'
                        : deviceType === 'tablet'
                          ? 'text-xl'
                          : 'text-4xl'
                    }`}
                  >
                    {esHoy && proximaClase ? '¡INGRESAR A CLASE!' : '¡ENTRENAR MATEMÁTICAS!'}
                  </div>
                  {(deviceType === 'desktop' ||
                    deviceType === 'ultrawide' ||
                    deviceType === 'tablet') && (
                    <div className="text-white/90 text-sm font-bold uppercase tracking-wide">
                      {esHoy && proximaClase
                        ? '¡Tu equipo te espera!'
                        : 'Resolvé desafíos y dominá números'}
                    </div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========== MODAL MENÚ MOBILE/TABLET ========== */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-slate-900/95
                         backdrop-blur-xl rounded-3xl
                         p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto
                         shadow-[0_0_80px_rgba(99,102,241,0.4)]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-white text-2xl font-black mb-6 text-center font-[family-name:var(--font-lilita)]">
                MENÚ
              </h2>

              <div className="space-y-3">
                {[...NAV_LEFT, ...NAV_RIGHT].map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (item.id === 'cerrar-sesion') {
                        setShowMobileMenu(false);
                        setShowLogoutModal(true);
                      } else if (item.overlayId) {
                        setShowMobileMenu(false);
                        openOverlay(item.overlayId);
                      } else {
                        setShowMobileMenu(false);
                        setActiveView(item.id);
                      }
                    }}
                    className={`w-full bg-gradient-to-r ${item.gradient} rounded-2xl p-4 flex items-center gap-4
                               border-2 border-white/20 shadow-lg relative`}
                  >
                    <div className="text-white">{item.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-black text-sm uppercase">{item.label}</div>
                      <div className="text-white/70 text-xs">{item.description}</div>
                    </div>
                    {(item.badge ?? 0) > 0 && (
                      <div className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">
                        {item.badge}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileMenu(false)}
                className="mt-6 w-full bg-white/10 text-white font-bold py-3 rounded-2xl"
              >
                CERRAR
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MODAL DE CONFIRMACIÓN DE LOGOUT - ULTRA PREMIUM ========== */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => !isLoggingOut && setShowLogoutModal(false)}
          >
            {/* Partículas flotantes de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`particle-logout-${i}`}
                  className="absolute w-1 h-1 bg-red-400/30 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: [null, Math.random() * -100 - 50],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 50, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 50, rotateX: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-slate-900/95 via-red-950/95 to-slate-900/95
                         backdrop-blur-xl rounded-2xl sm:rounded-3xl
                         p-6 sm:p-8 md:p-12 max-w-md w-full mx-3 sm:mx-4
                         shadow-[0_0_80px_rgba(239,68,68,0.4)]
                         overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
                border: '2px solid transparent',
                backgroundImage:
                  'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(236,72,153,0.1) 100%)',
                backgroundClip: 'padding-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Borde animado con gradiente */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, #ef4444, #ec4899, #ef4444)',
                  backgroundSize: '200% 100%',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '200% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Icono con resplandor pulsante - RESPONSIVE */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-4 sm:mb-6 relative"
              >
                {/* Resplandor pulsante */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 40px 10px rgba(239,68,68,0.4)',
                      '0 0 60px 20px rgba(239,68,68,0.6)',
                      '0 0 40px 10px rgba(239,68,68,0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-500 via-pink-600 to-red-700
                               flex items-center justify-center z-10
                               shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                >
                  <LogOut
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    strokeWidth={3}
                  />
                </div>
              </motion.div>

              {/* Título con efecto holográfico - RESPONSIVE */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl font-black text-white text-center mb-3 sm:mb-4
                           font-[family-name:var(--font-lilita)]"
                style={{
                  textShadow: '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(236,72,153,0.4)',
                }}
              >
                ¿SALIR DEL GIMNASIO?
              </motion.h2>

              {/* Mensaje - RESPONSIVE */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-center text-base sm:text-lg mb-6 sm:mb-8 font-medium"
              >
                ¿Estás seguro que querés cerrar sesión?
                <br />
                <span className="text-white/60 text-sm sm:text-base">
                  Podrás volver cuando quieras
                </span>
              </motion.p>

              {/* Botones con efecto 3D - RESPONSIVE */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-3 sm:gap-4"
              >
                {/* Botón Cancelar - RESPONSIVE */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  onClick={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                  className="flex-1 bg-white/10 hover:bg-white/20
                             text-white font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl
                             border-2 border-white/30 hover:border-white/50
                             transition-all disabled:opacity-50
                             shadow-[0_4px_0_rgba(255,255,255,0.1)]
                             hover:shadow-[0_6px_20px_rgba(255,255,255,0.2)]
                             active:shadow-[0_2px_0_rgba(255,255,255,0.1)]"
                >
                  CANCELAR
                </motion.button>

                {/* Botón Confirmar - RESPONSIVE */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  onClick={async () => {
                    try {
                      setIsLoggingOut(true);
                      await logout();
                      router.push('/login');
                    } catch (error) {
                      console.error('Error al cerrar sesión:', error);
                      setIsLoggingOut(false);
                    }
                  }}
                  disabled={isLoggingOut}
                  className="flex-1 bg-gradient-to-r from-red-500 via-pink-600 to-red-600
                             hover:from-red-600 hover:via-pink-700 hover:to-red-700
                             text-white font-black text-base sm:text-lg py-3 sm:py-4 rounded-xl sm:rounded-2xl
                             border-2 border-red-400/50
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-[0_4px_0_rgba(220,38,38,0.8),0_0_40px_rgba(239,68,68,0.3)]
                             hover:shadow-[0_6px_20px_rgba(239,68,68,0.6)]
                             active:shadow-[0_2px_0_rgba(220,38,38,0.8)]"
                >
                  {isLoggingOut ? 'SALIENDO...' : 'SÍ, SALIR'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MODAL: CLASE AÚN NO COMIENZA - ULTRA PREMIUM ========== */}
      <AnimatePresence>
        {showClaseNoComenzModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setShowClaseNoComenzModal(false)}
          >
            {/* Partículas flotantes de fondo cyan/azul */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`particle-clase-${i}`}
                  className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: [null, Math.random() * -100 - 50],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 50, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 50, rotateX: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-slate-900/95 via-cyan-950/95 to-slate-900/95
                         backdrop-blur-xl rounded-2xl sm:rounded-3xl
                         p-6 sm:p-8 md:p-12 max-w-md w-full mx-3 sm:mx-4
                         shadow-[0_0_80px_rgba(34,211,238,0.4)]
                         overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
                border: '2px solid transparent',
                backgroundImage:
                  'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(59,130,246,0.1) 100%)',
                backgroundClip: 'padding-box',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Borde animado con gradiente cyan-azul */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, #22d3ee, #3b82f6, #22d3ee)',
                  backgroundSize: '200% 100%',
                  padding: '2px',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '200% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Icono con resplandor pulsante - RESPONSIVE */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-4 sm:mb-6 relative"
              >
                {/* Resplandor pulsante cyan */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: [
                      '0 0 40px 10px rgba(34,211,238,0.4)',
                      '0 0 60px 20px rgba(34,211,238,0.6)',
                      '0 0 40px 10px rgba(34,211,238,0.4)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-600
                               flex items-center justify-center z-10
                               shadow-[0_0_40px_rgba(34,211,238,0.6)]"
                >
                  <Calendar
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    strokeWidth={3}
                  />
                </div>
              </motion.div>

              {/* Título con efecto holográfico - RESPONSIVE */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl font-black text-white text-center mb-3 sm:mb-4
                           font-[family-name:var(--font-lilita)]"
                style={{
                  textShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(59,130,246,0.4)',
                }}
              >
                ¡TODAVÍA NO ES HORA!
              </motion.h2>

              {/* Mensaje - RESPONSIVE */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-center text-base sm:text-lg mb-1.5 sm:mb-2 font-medium"
              >
                Tu clase aún no comienza.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="text-cyan-300 text-center text-xl sm:text-2xl font-black mb-6 sm:mb-8"
                style={{
                  textShadow: '0 0 15px rgba(34,211,238,0.6)',
                }}
              >
                Volvé en {formatearTiempoRestante(minutosRestantes)}
              </motion.p>

              {/* Botón OK con efecto 3D - RESPONSIVE */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={() => setShowClaseNoComenzModal(false)}
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500
                           hover:from-cyan-500 hover:via-blue-600 hover:to-cyan-600
                           text-white font-black text-lg sm:text-xl py-3 sm:py-4 rounded-xl sm:rounded-2xl
                           border-2 border-cyan-300/50
                           transition-all
                           shadow-[0_4px_0_rgba(6,182,212,0.8),0_0_40px_rgba(34,211,238,0.3)]
                           hover:shadow-[0_6px_20px_rgba(34,211,238,0.6)]
                           active:shadow-[0_2px_0_rgba(6,182,212,0.8)]"
              >
                ENTENDIDO
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

function NavButtonUltra({
  item,
  isActive,
  onClick,
  side = 'left',
}: {
  item: NavButton;
  isActive: boolean;
  onClick: () => void;
  side?: 'left' | 'right';
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Glow pulsante cuando hay notificaciones */}
      {item.pulse && (
        <motion.div
          className={`absolute inset-0 bg-${item.glowColor}-500/50 rounded-2xl blur-xl`}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}

      {/* Botón principal */}
      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative w-20 h-20 rounded-3xl
          bg-gradient-to-br ${item.gradient}
          shadow-2xl
          border-4 border-white/30
          flex items-center justify-center
          transition-all duration-300
          ${isActive ? 'ring-4 ring-white ring-offset-4 ring-offset-transparent' : ''}
        `}
      >
        {/* Icono */}
        <motion.div
          animate={
            isActive
              ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          <div className="text-white drop-shadow-lg">{item.icon}</div>
        </motion.div>

        {/* Badge de notificaciones */}
        {(item.badge ?? 0) > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2
                       w-8 h-8 rounded-full
                       bg-gradient-to-br from-red-500 to-pink-600
                       border-4 border-white
                       flex items-center justify-center
                       shadow-xl"
          >
            <span className="text-white text-xs font-black">
              {(item.badge ?? 0) > 99 ? '99+' : item.badge}
            </span>
          </motion.div>
        )}

        {/* Brillo animado en hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>

      {/* Tooltip expandido */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: side === 'left' ? -10 : 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: side === 'left' ? -10 : 10, scale: 0.9 }}
            className={`absolute ${side === 'left' ? 'left-24' : 'right-24'} top-1/2 -translate-y-1/2 z-50`}
          >
            <div
              className="bg-gradient-to-br from-slate-900 to-slate-800
                           backdrop-blur-xl
                           rounded-2xl p-4
                           border-2 border-white/20
                           shadow-2xl
                           min-w-[200px]"
            >
              {/* Label principal */}
              <div className="text-white text-lg font-black uppercase tracking-wide">
                {item.label}
              </div>

              {/* Descripción */}
              <div className="text-white/70 text-sm font-medium mt-1">{item.description}</div>

              {/* Badge info */}
              {(item.badge ?? 0) > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-bold">
                    {item.badge} {item.badge === 1 ? 'nuevo' : 'nuevos'}
                  </span>
                </div>
              )}

              {/* Flecha hacia el botón */}
              <div
                className={`absolute ${side === 'left' ? 'right-full mr-[-8px]' : 'left-full ml-[-8px]'} top-1/2 -translate-y-1/2`}
              >
                <div
                  className={`w-4 h-4 bg-slate-900 border-2 border-white/20 rotate-45 ${
                    side === 'left' ? 'border-r-0 border-t-0' : 'border-l-0 border-b-0'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de activo (barra lateral) */}
      {isActive && (
        <motion.div
          layoutId={`active-indicator-${side}`}
          className={`absolute ${side === 'left' ? '-right-3' : '-left-3'} top-1/2 -translate-y-1/2
                     w-2 h-12 rounded-full
                     bg-white shadow-lg`}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </div>
  );
}

function ResourcePill({
  icon,
  value,
  gradient,
  borderColor,
}: {
  icon: ReactNode;
  value: number;
  gradient: string;
  borderColor: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-${borderColor} shadow-lg h-[64px] min-w-[120px] justify-center`}
    >
      <div className="text-white scale-125">{icon}</div>
      <span className="text-white font-black text-2xl">{value}</span>
    </div>
  );
}
