/**
 * Componente de reproductor de video básico
 * Estética Brawl Stars pura
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import type { ContenidoVideo } from '../../types/actividad.types';

export interface VideoPlayerProps {
  contenido: ContenidoVideo;
  onCompletado?: () => void;
}

export function VideoPlayer({ contenido, onCompletado }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Por ahora, simulamos funcionalidad básica
  // En producción, usarías un player real como react-player o video.js

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implementar lógica real de play/pause
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implementar lógica real de mute
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-video bg-black border-[6px] border-black rounded-3xl overflow-hidden shadow-[0_12px_0_rgba(0,0,0,0.6)]"
      >
        {/* Thumbnail o Video */}
        <div className="relative w-full h-full bg-gradient-to-br from-purple-900 to-indigo-950 flex items-center justify-center">
          {contenido.thumbnail ? (
            <img
              src={contenido.thumbnail}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/20 text-9xl">🎥</div>
          )}

          {/* Overlay de Play (cuando está pausado) */}
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="
                absolute
                top-1/2 left-1/2
                -translate-x-1/2 -translate-y-1/2
                bg-gradient-to-b from-green-500 to-emerald-600
                border-[6px] border-black
                rounded-full
                w-32 h-32
                flex items-center justify-center
                shadow-[0_8px_0_rgba(0,0,0,0.6)]
                hover:shadow-[0_12px_0_rgba(0,0,0,0.6)]
              "
              style={{ transition: 'none' }}
            >
              <Play className="w-16 h-16 text-white ml-2" strokeWidth={3} fill="white" />
            </motion.button>
          )}

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4">
            {/* Barra de progreso */}
            <div className="relative h-3 bg-black/60 border-2 border-white/30 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between">
              {/* Play/Pause + Volumen */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  className="
                    bg-white/20 hover:bg-white/30
                    border-2 border-white/40
                    rounded-xl
                    w-10 h-10
                    flex items-center justify-center
                  "
                  style={{ transition: 'none' }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" strokeWidth={3} />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" strokeWidth={3} />
                  )}
                </button>

                <button
                  onClick={handleMute}
                  className="
                    bg-white/20 hover:bg-white/30
                    border-2 border-white/40
                    rounded-xl
                    w-10 h-10
                    flex items-center justify-center
                  "
                  style={{ transition: 'none' }}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" strokeWidth={3} />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" strokeWidth={3} />
                  )}
                </button>

                {/* Tiempo */}
                <span
                  className="text-white font-bold text-sm"
                  style={{ textShadow: '0 2px 0 rgba(0,0,0,0.6)' }}
                >
                  {formatTime(Math.floor((contenido.duracion * progress) / 100))} /{' '}
                  {formatTime(contenido.duracion)}
                </span>
              </div>

              {/* Fullscreen */}
              <button
                className="
                  bg-white/20 hover:bg-white/30
                  border-2 border-white/40
                  rounded-xl
                  w-10 h-10
                  flex items-center justify-center
                "
                style={{ transition: 'none' }}
              >
                <Maximize className="w-5 h-5 text-white" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info del video */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            <span
              className="text-lg font-black text-white"
              style={{
                textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                WebkitTextStroke: '1px black',
              }}
            >
              {formatTime(contenido.duracion)}
            </span>
          </div>

          {contenido.subtitulos && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <span
                className="text-sm font-black text-cyan-300"
                style={{
                  textShadow: '0 2px 0 rgba(0,0,0,0.4)',
                  WebkitTextStroke: '1px black',
                }}
              >
                SUBTÍTULOS
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Nota: Video placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center"
      >
        <div
          className="
            bg-gradient-to-br from-yellow-600/20 to-orange-600/20
            border-3 border-yellow-500/40
            rounded-2xl
            p-4
          "
        >
          <p
            className="text-sm font-bold text-yellow-300"
            style={{
              textShadow: '0 2px 0 rgba(0,0,0,0.4)',
            }}
          >
            ℹ️ Reproductor de video en desarrollo. URL del video: {contenido.url}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
