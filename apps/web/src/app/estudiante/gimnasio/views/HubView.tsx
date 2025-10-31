'use client';

/// <reference path="../../../../types/model-viewer.d.ts" />

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOverlay, useOverlayStack } from '../contexts/OverlayStackProvider';
import { recursosApi } from '@/lib/api/tienda.api';
import type { RecursosEstudiante } from '@mateatletas/contracts';
import { AnimatedAvatar3D } from '@/components/3d/AnimatedAvatar3D';
import { useStudentAnimations } from '@/hooks/useStudentAnimations';

// Type compatible con sistema antiguo
type OverlayType = string | null;
import {
  Home,
  BookOpen,
  Trophy,
  ShoppingBag,
  Users,
  Settings,
  Bell,
  Flame,
  Star,
  Coins,
  Gem,
  Zap,
  Target,
  BarChart3,
  Sparkles,
} from 'lucide-react';

interface HubViewProps {
  onNavigate: (vista: string) => void;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    nivel_actual: number;
    puntos_totales: number;
    avatar_url?: string | null;
  };
}

interface NavButton {
  id: string;
  overlayId: OverlayType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  badge?: number;
  pulse?: boolean;
}

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
    description: 'Práctica y ejercicios',
    icon: <Zap className="w-7 h-7" />,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'orange',
    badge: 3,
    pulse: true,
  },
  {
    id: 'tareas-asignadas',
    overlayId: 'planificacion',
    label: 'TAREAS ASIGNADAS',
    description: 'Mes de la Ciencia',
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
];

const NAV_RIGHT: NavButton[] = [
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
    badge: 7,
    pulse: true,
  },
  {
    id: 'ajustes',
    overlayId: 'ajustes',
    label: 'AJUSTES',
    description: 'Configuración',
    icon: <Settings className="w-7 h-7" />,
    gradient: 'from-slate-600 via-gray-600 to-slate-700',
    glowColor: 'slate',
    badge: 0,
  },
];

export function HubView({ onNavigate, estudiante }: HubViewProps) {
  const [activeView, setActiveView] = useState('hub');
  const [isMounted, setIsMounted] = useState(false);
  const [recursos, setRecursos] = useState<RecursosEstudiante | null>(null);
  const [currentAnimation, setCurrentAnimation] = useState<string | undefined>(undefined);
  const modelRef = useRef<any>(null);
  const { openOverlay } = useOverlay();
  const { push } = useOverlayStack();

  // Hook de animaciones
  const { getRandomAnimation, animationsByCategory } = useStudentAnimations({
    studentPoints: estudiante.puntos_totales,
  });

  useEffect(() => {
    setIsMounted(true);

    // Usar M_Standing_Idle_001 que tiene loop suave y continuo
    const smoothIdleUrl =
      'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_001.glb';
    setCurrentAnimation(smoothIdleUrl);
  }, []);

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

  // Hook para animaciones del avatar - triggers manuales
  const triggerAnimation = useCallback(
    (animationUrl: string, returnToIdleAfter?: number) => {
      try {
        setCurrentAnimation(animationUrl);

        // Si se especifica duración, volver a idle después
        if (returnToIdleAfter) {
          setTimeout(() => {
            const idleUrl =
              'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_001.glb';
            setCurrentAnimation(idleUrl);
          }, returnToIdleAfter);
        }
      } catch (error) {
        console.debug('Animation error:', error);
      }
    },
    [],
  );

  // NO rotar animaciones automáticamente - mantener idle continuo
  // Solo cambiar cuando el usuario interactúa

  // Valores de recursos (del backend o fallback si está cargando)
  const monedas = recursos?.monedas_total ?? 0;
  const gemas = recursos?.gemas_total ?? 0;
  const xp_total = recursos?.xp_total ?? 0;
  const racha_dias = 3; // TODO: Obtener del backend cuando esté implementado

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

      {/* ========== NAVEGACIÓN LATERAL IZQUIERDA - ULTRA GAMIFICADA ========== */}
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
                // ENTRENAMIENTOS y TAREAS ASIGNADAS abren directamente el Mes de la Ciencia
                if (item.id === 'entrenamientos' || item.id === 'tareas-asignadas') {
                  push({
                    type: 'planificacion',
                    codigo: '2025-11-mes-ciencia',
                    tema: 'quimica',
                  });
                } else if (item.overlayId) {
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

      {/* ========== NAVEGACIÓN LATERAL DERECHA - ULTRA GAMIFICADA ========== */}
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
                if (item.overlayId) {
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

      {/* ========== HEADER - 10vh ========== */}
      <header className="relative z-30 h-[10vh] px-8 flex items-center justify-between">
        {/* Avatar pequeño + nombre (izquierda) */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-2 border-2 border-white/20"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{estudiante.nombre.charAt(0)}</span>
          </div>
          <div>
            <div className="text-white font-bold text-base uppercase tracking-wide">
              {estudiante.nombre.split(' ')[0]}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                Nivel {nivelCalculado}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                🔥 <span>Grupo Fénix</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logo/Texto Mateatletas Club STEAM - CENTRO */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
        >
          <div className="text-white font-black text-3xl md:text-4xl uppercase tracking-wider drop-shadow-2xl text-center font-[family-name:var(--font-lilita)]">
            Mateatletas Club{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              STEAM
            </span>
          </div>
        </motion.div>

        {/* Recursos (derecha) */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2"
        >
          <ResourcePill
            icon={<Coins className="w-5 h-5" />}
            value={monedas}
            gradient="from-yellow-400 to-amber-500"
            borderColor="yellow-600"
          />
          <ResourcePill
            icon={<Gem className="w-5 h-5" />}
            value={gemas}
            gradient="from-purple-500 to-violet-600"
            borderColor="purple-700"
          />
          <ResourcePill
            icon={<Flame className="w-5 h-5" />}
            value={racha_dias}
            gradient="from-orange-500 to-red-600"
            borderColor="red-700"
          />
        </motion.div>
      </header>

      {/* ========== CENTRO DIVIDIDO: 50% AVATAR | 50% INFO ========== */}
      <div className="flex-1 flex items-center justify-center px-32 py-8 relative z-10">
        <div className="w-full max-w-7xl flex gap-8 h-full">
          {/* ========== COLUMNA IZQUIERDA - AVATAR 3D GIGANTE ========== */}
          <div className="w-1/2 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Resplandor/Glow detrás del avatar */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  width: '500px',
                  height: '500px',
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(99, 102, 241, 0.3) 25%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
                  filter: 'blur(40px)',
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

              {/* Segundo anillo de resplandor - más amplio y sutil */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  width: '650px',
                  height: '650px',
                  background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 65%)',
                  filter: 'blur(50px)',
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

              {/* Avatar 3D Animado - CLICKEABLE PARA ANIMAR */}
              <div
                className="relative z-20 cursor-pointer w-full h-full"
                onClick={() => {
                  // Variations_005 (la más dinámica) al hacer click
                  const clickUrl =
                    'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_Variations_005.glb';
                  triggerAnimation(clickUrl, 4000);
                }}
              >
                {isMounted && estudiante.avatar_url && (
                  <AnimatedAvatar3D
                    avatarUrl={estudiante.avatar_url}
                    animationUrl={currentAnimation}
                    width="100%"
                    height="100%"
                    cameraPosition={[0, 0.6, 2.4]}
                    cameraFov={50}
                    scale={1.15}
                    position={[-0.3, -0.45, 0]}
                    rotation={[0, 0.26, 0]}
                    enableControls={false}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* ========== COLUMNA DERECHA - INFO + STATS + CTA ========== */}
          <div className="w-1/2 flex flex-col justify-center gap-8">
            {/* Badge de nivel */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex justify-center"
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl px-8 py-4 border-4 border-white shadow-2xl">
                <div className="text-center">
                  <div className="text-white/80 text-sm font-bold uppercase tracking-wider">
                    Nivel
                  </div>
                  <div className="text-white text-6xl font-black">{estudiante.nivel_actual}</div>
                </div>
              </div>
            </motion.div>

            {/* Barra XP */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-bold">
                  Progreso al Nivel {nivelCalculado + 1}
                </span>
                <span className="text-white/80 text-sm font-bold">
                  {xpEnNivelActual} / {xpNecesarioParaSiguienteNivel} XP
                </span>
              </div>
              <div className="w-full h-6 bg-black/40 rounded-full overflow-hidden border-2 border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(porcentajeProgresoNivel, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/50"
                />
              </div>
            </motion.div>

            {/* Stats verticales */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4"
            >
              <StatCard3D
                icon={<Zap className="w-6 h-6" />}
                value={`${racha_dias} días`}
                label="RACHA"
                subtitle="¡Sigue así!"
                gradient="from-orange-500 to-red-600"
                glowColor="orange"
                onClick={() =>
                  triggerAnimation(
                    'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_001.glb',
                    3000,
                  )
                }
              />
              <StatCard3D
                icon={<Trophy className="w-6 h-6" />}
                value="12/50"
                label="LOGROS"
                subtitle="Desbloqueados"
                gradient="from-yellow-500 to-amber-600"
                glowColor="yellow"
                onClick={() =>
                  triggerAnimation(
                    'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_Variations_002.glb',
                    3000,
                  )
                }
              />
              <StatCard3D
                icon={<Target className="w-6 h-6" />}
                value="85%"
                label="ÁLGEBRA"
                subtitle="¡Casi maestro!"
                gradient="from-purple-500 to-pink-600"
                glowColor="purple"
                onClick={() =>
                  triggerAnimation(
                    'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_Variations_005.glb',
                    3500,
                  )
                }
              />
            </motion.div>

            {/* Botón CTA GIGANTE */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: 'spring' }}
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95, y: 0 }}
                onClick={() => {
                  // Animación energética antes de navegar
                  const energeticUrl =
                    'https://bx0qberriuipqy7z.public.blob.vercel-storage.com/animations/masculine/idle/M_Standing_Idle_Variations_005.glb';
                  triggerAnimation(energeticUrl, 2000);
                  setTimeout(() => {
                    onNavigate('entrenamientos');
                  }, 1800);
                }}
                className="
                  w-full h-24
                  bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500
                  rounded-3xl
                  shadow-[0_12px_0_rgba(0,0,0,0.3)]
                  hover:shadow-[0_8px_0_rgba(0,0,0,0.3)]
                  active:shadow-[0_2px_0_rgba(0,0,0,0.3)]
                  border-4 border-yellow-600
                  relative overflow-hidden
                  transition-all
                "
              >
                {/* Brillo animado */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />

                <div className="relative z-10 text-center">
                  <div className="text-white text-4xl font-black uppercase tracking-wider drop-shadow-lg">
                    ¡ENTRENAR MATEMÁTICAS!
                  </div>
                  <div className="text-white/90 text-sm font-bold uppercase tracking-wide">
                    Resolvé desafíos y dominá números
                  </div>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
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
  icon: React.ReactNode;
  value: number;
  gradient: string;
  borderColor: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-xl px-4 py-2 flex items-center gap-2 border-2 border-${borderColor} shadow-lg`}
    >
      <div className="text-white">{icon}</div>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function StatCard3D({
  icon,
  value,
  label,
  subtitle,
  gradient,
  glowColor,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  subtitle?: string;
  gradient: string;
  glowColor: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        rotateY: 5,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative bg-gradient-to-br ${gradient}
        rounded-2xl p-4
        shadow-[0_8px_0_rgba(0,0,0,0.3)]
        hover:shadow-[0_6px_0_rgba(0,0,0,0.3)]
        active:shadow-[0_2px_0_rgba(0,0,0,0.3)]
        border-4 border-white/20
        cursor-pointer
        transition-all
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-${glowColor}-500/50 blur-xl -z-10 rounded-2xl`} />

      <div className="text-center">
        <div className="flex items-center justify-center mb-2 text-white">{icon}</div>
        <div className="text-white text-2xl font-black">{value}</div>
        <div className="text-white/80 text-xs font-bold uppercase tracking-wide">{label}</div>
        {subtitle && <div className="text-white/60 text-xs mt-1 font-medium">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
