'use client';

import { motion } from 'framer-motion';
import { Lock, Star, Zap, Clock, TrendingUp } from 'lucide-react';

export interface CursoCatalogo {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  imagen_url: string;
  duracion_clases: number;
  nivel_requerido: number;
  precio_usd: number;
  precio_monedas: number;
  destacado: boolean;
  nuevo: boolean;
  activo: boolean;
  orden: number;
}

interface CursoCardProps {
  curso: CursoCatalogo;
  nivelActual: number;
  monedasActuales: number;
  onClick?: () => void;
}

/**
 * CursoCard - Tarjeta de curso del catálogo de tienda
 *
 * Features:
 * - Glassmorphism design con gradientes por categoría
 * - Badges para "Nuevo" y "Destacado"
 * - Indicador de nivel requerido
 * - Lock visual si no cumple requisitos
 * - Hover animation con scale
 * - Emoji por categoría
 * - Información de precio (USD + Monedas)
 */
export function CursoCard({ curso, nivelActual, monedasActuales, onClick }: CursoCardProps) {
  const bloqueadoPorNivel = nivelActual < curso.nivel_requerido;
  const bloqueadoPorMonedas = monedasActuales < curso.precio_monedas;
  const bloqueado = bloqueadoPorNivel || bloqueadoPorMonedas;

  const getCategoriaEmoji = (categoria: string): string => {
    const emojis: Record<string, string> = {
      ciencia: '🔬',
      programacion: '💻',
      robotica: '🤖',
      matematicas: '📐',
      diseno: '🎨',
      arte: '🖌️',
    };
    return emojis[categoria] || '📚';
  };

  const getCategoriaGradient = (categoria: string): string => {
    const gradients: Record<string, string> = {
      ciencia: 'from-blue-500/20 to-cyan-500/20',
      programacion: 'from-green-500/20 to-emerald-500/20',
      robotica: 'from-purple-500/20 to-pink-500/20',
      matematicas: 'from-orange-500/20 to-red-500/20',
      diseno: 'from-pink-500/20 to-rose-500/20',
      arte: 'from-yellow-500/20 to-amber-500/20',
    };
    return gradients[categoria] || 'from-gray-500/20 to-slate-500/20';
  };

  return (
    <motion.div
      whileHover={{ scale: bloqueado ? 1 : 1.03, y: bloqueado ? 0 : -4 }}
      whileTap={{ scale: bloqueado ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={bloqueado ? undefined : onClick}
      className={`relative bg-gradient-to-br ${getCategoriaGradient(curso.categoria)} backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden ${
        bloqueado ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {/* Badges superiores */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {curso.nuevo && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              ✨ NUEVO
            </span>
          )}
          {curso.destacado && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" fill="white" />
              POPULAR
            </span>
          )}
        </div>
        <div className="text-4xl">{getCategoriaEmoji(curso.categoria)}</div>
      </div>

      {/* Título y descripción */}
      <h3 className="text-white font-black text-xl mb-2 line-clamp-2">{curso.titulo}</h3>
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{curso.descripcion}</p>

      {/* Información del curso */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{curso.duracion_clases} clases</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Nivel {curso.nivel_requerido} requerido</span>
        </div>
      </div>

      {/* Precio */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-2xl font-bold">
              💰 {curso.precio_monedas.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="text-gray-400 text-xs mt-1">o ${curso.precio_usd} USD con tu tutor</div>
        </div>
      </div>

      {/* Estado y acción */}
      {bloqueado && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <Lock className="w-12 h-12 text-white/80 mx-auto mb-2" />
            <p className="text-white font-bold text-sm">
              {bloqueadoPorNivel && `Necesitas nivel ${curso.nivel_requerido}`}
              {bloqueadoPorNivel && bloqueadoPorMonedas && ' y '}
              {bloqueadoPorMonedas && <>{curso.precio_monedas - monedasActuales} monedas más</>}
            </p>
          </div>
        </div>
      )}

      {!bloqueado && (
        <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" fill="white" />
          ¡Canjear Ahora!
        </button>
      )}
    </motion.div>
  );
}
