'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useGamificacionStore } from '@/store/gamificacion.store';
import {
  Brain,
  Target,
  Triangle,
  PieChart,
  Puzzle,
  BarChart3,
  Lock,
  Star,
  Trophy,
  Zap,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';

/**
 * Página de Estudiar - Juegos Educativos
 *
 * Portal para acceder a mini-juegos matemáticos gamificados.
 * Cada juego otorga puntos, tiene niveles de dificultad,
 * y algunos requieren nivel mínimo para desbloquearse.
 */

export default function EstudiarPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, isLoading } = useGamificacionStore();
  const [filtroCategoria, setFiltroCategoria] = useState('todos');

  useEffect(() => {
    if (user?.id && user?.role === 'estudiante') {
      fetchDashboard(user.id);
    }
  }, [user?.id]);

  // Estadísticas de juegos (mock - later connect to backend)
  const stats = {
    partidasJugadas: 88,
    racha: 12,
    puntosGanados: 3120,
  };

  // Lista de juegos educativos
  const juegos = [
    {
      id: 'calculo-mental',
      nombre: 'Cálculo Mental Rápido',
      descripcion: 'Resuelve operaciones antes de que se acabe el tiempo',
      icono: Brain,
      emoji: '🧮',
      dificultad: 'Fácil',
      puntos: 10,
      categoria: 'aritmetica',
      desbloqueado: true,
      partidasJugadas: 23,
      mejorPuntaje: 450,
      color: { bg: 'from-blue-500 to-cyan-500', border: 'blue-500' },
    },
    {
      id: 'algebra-challenge',
      nombre: 'Álgebra Challenge',
      descripcion: 'Despeja la incógnita y conquista ecuaciones',
      icono: Target,
      emoji: '🎯',
      dificultad: 'Media',
      puntos: 20,
      categoria: 'algebra',
      desbloqueado: true,
      partidasJugadas: 18,
      mejorPuntaje: 620,
      color: { bg: 'from-purple-500 to-pink-500', border: 'purple-500' },
    },
    {
      id: 'geometria-quiz',
      nombre: 'Geometría Quiz',
      descripcion: 'Identifica figuras, ángulos y propiedades',
      icono: Triangle,
      emoji: '📐',
      dificultad: 'Media',
      puntos: 15,
      categoria: 'geometria',
      desbloqueado: true,
      partidasJugadas: 15,
      mejorPuntaje: 380,
      color: { bg: 'from-green-500 to-emerald-500', border: 'green-500' },
    },
    {
      id: 'fracciones-master',
      nombre: 'Maestro de Fracciones',
      descripcion: 'Suma, resta, multiplica y divide fracciones',
      icono: PieChart,
      emoji: '🍰',
      dificultad: 'Media',
      puntos: 18,
      categoria: 'aritmetica',
      desbloqueado: true,
      partidasJugadas: 12,
      mejorPuntaje: 510,
      color: { bg: 'from-orange-500 to-amber-500', border: 'orange-500' },
    },
    {
      id: 'logica-matematica',
      nombre: 'Lógica Matemática',
      descripcion: 'Secuencias, patrones y razonamiento lógico',
      icono: Puzzle,
      emoji: '🧩',
      dificultad: 'Difícil',
      puntos: 30,
      categoria: 'logica',
      desbloqueado: false,
      requisito: 'Nivel 3',
      color: { bg: 'from-indigo-500 to-purple-500', border: 'indigo-500' },
    },
    {
      id: 'ecuaciones-cuadraticas',
      nombre: 'Ecuaciones Cuadráticas',
      descripcion: 'Resuelve ecuaciones de segundo grado',
      icono: BarChart3,
      emoji: '📊',
      dificultad: 'Difícil',
      puntos: 35,
      categoria: 'algebra',
      desbloqueado: false,
      requisito: 'Nivel 4',
      color: { bg: 'from-red-500 to-rose-500', border: 'red-500' },
    },
  ];

  const categorias = [
    { id: 'todos', nombre: 'Todos', icono: '🎮' },
    { id: 'aritmetica', nombre: 'Aritmética', icono: '🧮' },
    { id: 'algebra', nombre: 'Álgebra', icono: '🎯' },
    { id: 'geometria', nombre: 'Geometría', icono: '📐' },
    { id: 'logica', nombre: 'Lógica', icono: '🧩' },
  ];

  const dificultadColors = {
    Fácil: 'text-green-400',
    Media: 'text-yellow-400',
    Difícil: 'text-red-400',
  };

  const juegosFiltrados =
    filtroCategoria === 'todos'
      ? juegos
      : juegos.filter((j) => j.categoria === filtroCategoria);

  const handleJuegoClick = (juego: any) => {
    if (!juego.desbloqueado) {
      return;
    }
    // Navegar al juego específico
    router.push(`/estudiante/cursos/${juego.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Botón Volver */}
        <button
          onClick={() => router.push('/estudiante/dashboard')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Volver al Dashboard</span>
        </button>

        {/* Header con Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl shadow-2xl border-2 border-purple-400 p-4 md:p-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-50" />
              <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">Estudiar</h1>
              <p className="text-white/90 text-lg font-semibold">Juegos Educativos</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <p className="text-white/80 text-sm font-semibold">Partidas</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.partidasJugadas}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-orange-300" />
                <p className="text-white/80 text-sm font-semibold">Racha</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.racha} días</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-purple-300" />
                <p className="text-white/80 text-sm font-semibold">Puntos</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.puntosGanados}</p>
            </div>
          </div>
        </motion.div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap gap-2 md:gap-3">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFiltroCategoria(cat.id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filtroCategoria === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700 border border-purple-500/30'
              }`}
            >
              {cat.icono} {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grid de Juegos - Responsive con scroll natural */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-6">
          {juegosFiltrados.map((juego, index) => {
            const Icon = juego.icono;

            return (
              <motion.div
                key={juego.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={juego.desbloqueado ? { scale: 1.03, y: -4 } : {}}
                onClick={() => handleJuegoClick(juego)}
                className="relative group cursor-pointer"
              >
                {/* Glow Effect */}
                {juego.desbloqueado && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${juego.color.bg} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}
                  />
                )}

                {/* Card */}
                <div
                  className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 p-4 h-full flex flex-col ${
                    juego.desbloqueado
                      ? `border-${juego.color.border}/50 hover:border-${juego.color.border} transition-all`
                      : 'border-gray-700 opacity-60'
                  }`}
                >
                  {/* Lock overlay */}
                  {!juego.desbloqueado && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl z-10 gap-3">
                      <Lock className="w-16 h-16 text-gray-400" />
                      <div className="text-center px-4">
                        <p className="text-gray-300 font-bold text-sm">Requiere {juego.requisito}</p>
                      </div>
                    </div>
                  )}

                  <div className="relative z-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <motion.div
                        animate={
                          juego.desbloqueado ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}
                        }
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        className="text-4xl"
                      >
                        {juego.emoji}
                      </motion.div>

                      {/* Dificultad Badge */}
                      {juego.desbloqueado && (
                        <div
                          className={`px-3 py-1 rounded-lg text-xs font-bold bg-slate-700/50 backdrop-blur-sm border border-white/10 ${
                            dificultadColors[juego.dificultad as keyof typeof dificultadColors]
                          }`}
                        >
                          {juego.dificultad}
                        </div>
                      )}
                    </div>

                    {/* Nombre */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{juego.nombre}</h3>

                    {/* Descripción */}
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{juego.descripcion}</p>

                    {/* Stats (solo si desbloqueado) */}
                    {juego.desbloqueado && (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span className="font-semibold">+{juego.puntos}</span>
                          </div>
                          <div className="h-3 w-px bg-gray-700" />
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            <span className="font-semibold">{juego.partidasJugadas}</span>
                          </div>
                          <div className="h-3 w-px bg-gray-700" />
                          <div className="text-xs text-purple-300 font-bold">
                            🏆 {juego.mejorPuntaje}
                          </div>
                        </div>

                        {/* Botón de Jugar */}
                        <button
                          className={`w-full py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${juego.color.bg} hover:shadow-lg transition-all`}
                        >
                          ¡Jugar! 🎮
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
