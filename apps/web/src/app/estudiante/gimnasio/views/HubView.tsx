'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Gamepad2,
  BookOpen,
  Trophy,
  ShoppingBag,
  Users,
  MessageCircle,
  Settings,
  Bell,
  Flame,
  Star,
  Coins,
  Gem,
  Zap,
  Target
} from 'lucide-react';

interface HubViewProps {
  onNavigate: (vista: string) => void;
  estudiante: {
    nombre: string;
    apellido: string;
    nivel_actual: number;
    puntos_totales: number;
    avatar_url?: string | null;
  };
}

interface NavButton {
  id: string;
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
    label: 'INICIO',
    description: 'Tu gimnasio personal',
    icon: <Home className="w-7 h-7" />,
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    glowColor: 'cyan',
    badge: 0,
  },
  {
    id: 'juegos',
    label: 'JUEGOS',
    description: 'Desafíos matemáticos',
    icon: <Gamepad2 className="w-7 h-7" />,
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    glowColor: 'orange',
    badge: 3,
    pulse: true,
  },
  {
    id: 'cursos',
    label: 'CURSOS',
    description: 'Rutas de aprendizaje',
    icon: <BookOpen className="w-7 h-7" />,
    gradient: 'from-purple-500 via-violet-500 to-indigo-600',
    glowColor: 'purple',
    badge: 0,
  },
  {
    id: 'logros',
    label: 'LOGROS',
    description: 'Medallas y trofeos',
    icon: <Trophy className="w-7 h-7" />,
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    glowColor: 'yellow',
    badge: 2,
    pulse: true,
  },
  {
    id: 'tienda',
    label: 'TIENDA',
    description: 'Compra power-ups',
    icon: <ShoppingBag className="w-7 h-7" />,
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    glowColor: 'green',
    badge: 0,
  },
];

const NAV_RIGHT: NavButton[] = [
  {
    id: 'amigos',
    label: 'AMIGOS',
    description: 'Compite con amigos',
    icon: <Users className="w-7 h-7" />,
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    glowColor: 'cyan',
    badge: 5,
    pulse: true,
  },
  {
    id: 'chat',
    label: 'CHAT',
    description: 'Habla con tu equipo',
    icon: <MessageCircle className="w-7 h-7" />,
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    glowColor: 'pink',
    badge: 12,
    pulse: true,
  },
  {
    id: 'notificaciones',
    label: 'ALERTAS',
    description: 'Novedades importantes',
    icon: <Bell className="w-7 h-7" />,
    gradient: 'from-red-500 via-orange-500 to-amber-600',
    glowColor: 'red',
    badge: 7,
    pulse: true,
  },
  {
    id: 'settings',
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
  const modelRef = useRef<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hook para animaciones del avatar
  const triggerAnimation = useCallback((animName: string, duration?: number) => {
    const model = modelRef.current;
    if (!model) return;

    model.animationName = animName;
    model.currentTime = 0;
    model.play({ repetitions: 1 });

    if (duration) {
      setTimeout(() => {
        model.animationName = 'idle';
        model.play();
      }, duration);
    }
  }, []);

  // Valores por defecto para recursos
  const monedas = 168;
  const gemas = 0;
  const racha_dias = 3;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 flex flex-col">
      {/* Gradiente animado de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 animate-pulse"
             style={{ animationDuration: '4s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-yellow-500/10 via-transparent to-cyan-500/10 animate-pulse"
             style={{ animationDuration: '6s', animationDelay: '1s' }}
        />
      </div>

      {/* Textura de fondo estilo Brawl Stars */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-[1]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2%, transparent 2%),
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 2%, transparent 2%)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Brillos sutiles flotantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                ['rgba(255,255,255,0.15)', 'rgba(255,255,0,0.1)', 'rgba(0,255,255,0.1)', 'rgba(255,0,255,0.1)'][i % 4]
              }, transparent)`,
              filter: 'blur(40px)',
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
              ],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
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
                setActiveView(item.id);
                onNavigate(item.id);
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
                setActiveView(item.id);
                onNavigate(item.id);
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
            <span className="text-white font-bold text-lg">
              {estudiante.nombre.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-white font-bold text-base uppercase tracking-wide">
              {estudiante.nombre.split(' ')[0]}
            </div>
            <div className="text-xs text-white/70 flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              Nivel {estudiante.nivel_actual}
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
          <ResourcePill icon={<Coins className="w-5 h-5" />} value={monedas} gradient="from-yellow-400 to-amber-500" borderColor="yellow-600" />
          <ResourcePill icon={<Gem className="w-5 h-5" />} value={gemas} gradient="from-purple-500 to-violet-600" borderColor="purple-700" />
          <ResourcePill icon={<Flame className="w-5 h-5" />} value={racha_dias} gradient="from-orange-500 to-red-600" borderColor="red-700" />
        </motion.div>
      </header>

      {/* ========== CENTRO DIVIDIDO: 50% AVATAR | 50% INFO ========== */}
      <div className="flex-1 flex items-center justify-center px-32 py-8">
        <div className="w-full max-w-7xl flex gap-8 h-full">

          {/* ========== COLUMNA IZQUIERDA - AVATAR 3D GIGANTE ========== */}
          <div className="w-1/2 relative flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Plataforma 3D circular */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-96 h-16">
                <div
                  className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 blur-2xl"
                  style={{
                    transform: 'perspective(600px) rotateX(75deg)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Ring giratorio */}
              <div
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full border-4 border-cyan-400/30"
                style={{
                  animation: 'spin 8s linear infinite',
                  transform: 'perspective(600px) rotateX(75deg)',
                }}
              />

              {/* Efecto de racha de fuego */}
              {racha_dias >= 3 && (
                <>
                  <motion.div
                    className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Flame className="w-16 h-16 text-orange-500 fill-orange-500 drop-shadow-lg" />
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 bg-gradient-radial from-orange-500/30 to-transparent rounded-full pointer-events-none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </>
              )}

              {/* Avatar 3D */}
              <div className="relative z-20 w-full h-full">
                {isMounted && estudiante.avatar_url && (
                  <model-viewer
                    ref={modelRef}
                    src={estudiante.avatar_url}
                    alt="Avatar 3D"
                    camera-controls
                    camera-orbit="0deg 85deg 3.5m"
                    min-camera-orbit="auto auto 2m"
                    max-camera-orbit="auto auto 6m"
                    field-of-view="45deg"
                    shadow-intensity="1"
                    shadow-softness="0.8"
                    exposure="1"
                    environment-image="neutral"
                    autoplay
                    animation-name="idle"
                    className="w-full h-full"
                    style={{ backgroundColor: 'transparent' }}
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
                  <div className="text-white text-6xl font-black">
                    {estudiante.nivel_actual}
                  </div>
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
                  Progreso al Nivel {estudiante.nivel_actual + 1}
                </span>
                <span className="text-white/80 text-sm font-bold">
                  {estudiante.puntos_totales} / 1000 XP
                </span>
              </div>
              <div className="w-full h-6 bg-black/40 rounded-full overflow-hidden border-2 border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(estudiante.puntos_totales / 1000) * 100}%` }}
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
                gradient="from-orange-500 to-red-600"
                glowColor="orange"
                onClick={() => triggerAnimation('victory', 2000)}
              />
              <StatCard3D
                icon={<Trophy className="w-6 h-6" />}
                value="12/50"
                label="LOGROS"
                gradient="from-yellow-500 to-amber-600"
                glowColor="yellow"
                onClick={() => triggerAnimation('victory', 2000)}
              />
              <StatCard3D
                icon={<Target className="w-6 h-6" />}
                value="#42"
                label="RANKING"
                gradient="from-purple-500 to-pink-600"
                glowColor="purple"
                onClick={() => triggerAnimation('victory', 2000)}
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
                onClick={() => onNavigate('entrenamientos')}
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
                  <div className="text-white text-5xl font-black uppercase tracking-wider drop-shadow-lg">
                    JUGAR
                  </div>
                  <div className="text-white/90 text-sm font-bold uppercase tracking-wide">
                    Comenzar Entrenamiento
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
        {item.badge > 0 && (
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
              {item.badge > 99 ? '99+' : item.badge}
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
            <div className="bg-gradient-to-br from-slate-900 to-slate-800
                           backdrop-blur-xl
                           rounded-2xl p-4
                           border-2 border-white/20
                           shadow-2xl
                           min-w-[200px]">
              {/* Label principal */}
              <div className="text-white text-lg font-black uppercase tracking-wide">
                {item.label}
              </div>

              {/* Descripción */}
              <div className="text-white/70 text-sm font-medium mt-1">
                {item.description}
              </div>

              {/* Badge info */}
              {item.badge > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-bold">
                    {item.badge} {item.badge === 1 ? 'nuevo' : 'nuevos'}
                  </span>
                </div>
              )}

              {/* Flecha hacia el botón */}
              <div className={`absolute ${side === 'left' ? 'right-full mr-[-8px]' : 'left-full ml-[-8px]'} top-1/2 -translate-y-1/2`}>
                <div className={`w-4 h-4 bg-slate-900 border-2 border-white/20 rotate-45 ${
                  side === 'left' ? 'border-r-0 border-t-0' : 'border-l-0 border-b-0'
                }`} />
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
    <div className={`bg-gradient-to-br ${gradient} rounded-xl px-4 py-2 flex items-center gap-2 border-2 border-${borderColor} shadow-lg`}>
      <div className="text-white">{icon}</div>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function StatCard3D({
  icon,
  value,
  label,
  gradient,
  glowColor,
  onClick,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
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
        <div className="flex items-center justify-center mb-2 text-white">
          {icon}
        </div>
        <div className="text-white text-2xl font-black">{value}</div>
        <div className="text-white/80 text-xs font-bold uppercase tracking-wide">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

