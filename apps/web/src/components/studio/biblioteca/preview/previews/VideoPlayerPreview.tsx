'use client';

import React, { ReactElement, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para VideoPlayer
 */
interface VideoPlayerExampleData {
  titulo: string;
  descripcion?: string;
  thumbnailUrl: string;
  duracion: string;
  autoplay: boolean;
  showControls: boolean;
  allowFullscreen: boolean;
}

/**
 * Preview del componente VideoPlayer
 * Nota: Es un mock visual, no reproduce video real
 */
function VideoPlayerPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as VideoPlayerExampleData;
  const [isPlaying, setIsPlaying] = useState(data.autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayPause = (): void => {
    if (!interactive) return;
    setIsPlaying(!isPlaying);
  };

  const handleMute = (): void => {
    if (!interactive) return;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setProgress(Math.min(100, Math.max(0, percentage)));
  };

  // Simulate progress when playing
  React.useEffect(() => {
    if (!isPlaying || !interactive) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, interactive]);

  return (
    <div className="space-y-3">
      {/* Video container */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
        {/* Thumbnail/Preview */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center"
          style={{
            backgroundImage: `url(${data.thumbnailUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Play overlay when paused */}
          {!isPlaying && (
            <button
              type="button"
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-orange-500/90 hover:bg-orange-500 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          )}

          {/* Playing indicator */}
          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 20}px`,
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls overlay */}
        {data.showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Progress bar */}
            <div
              className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-orange-500 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  disabled={!interactive}
                >
                  <SkipBack className="w-4 h-4 text-white/70" />
                </button>

                <button
                  type="button"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  disabled={!interactive}
                >
                  <SkipForward className="w-4 h-4 text-white/70" />
                </button>

                <button
                  type="button"
                  onClick={handleMute}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white/70" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                <span className="text-xs text-white/60 font-mono">
                  {formatTime(progress)} / {data.duracion}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {data.allowFullscreen && (
                  <button
                    type="button"
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    disabled={!interactive}
                  >
                    <Maximize2 className="w-4 h-4 text-white/70" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video info */}
      <div>
        <h3 className="text-white font-medium">{data.titulo}</h3>
        {data.descripcion && <p className="text-sm text-white/50 mt-1">{data.descripcion}</p>}
      </div>
    </div>
  );
}

/**
 * Formatea el progreso como tiempo mm:ss
 */
function formatTime(progress: number): string {
  const totalSeconds = Math.floor((progress / 100) * 180); // Asumiendo 3 min video
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Documentación de props para VideoPlayer
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'titulo',
    type: 'string',
    description: 'Título del video',
    required: true,
  },
  {
    name: 'descripcion',
    type: 'string',
    description: 'Descripción opcional del video',
    required: false,
  },
  {
    name: 'videoUrl',
    type: 'string',
    description: 'URL del archivo de video',
    required: true,
  },
  {
    name: 'thumbnailUrl',
    type: 'string',
    description: 'URL de la imagen de miniatura',
    required: false,
  },
  {
    name: 'autoplay',
    type: 'boolean',
    description: 'Si el video inicia automáticamente',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'showControls',
    type: 'boolean',
    description: 'Si se muestran los controles de reproducción',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'allowFullscreen',
    type: 'boolean',
    description: 'Si se permite pantalla completa',
    required: false,
    defaultValue: 'true',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: VideoPlayerExampleData = {
  titulo: 'Introducción a las fracciones',
  descripcion: 'Aprende los conceptos básicos de las fracciones de forma divertida.',
  thumbnailUrl: '/api/placeholder/640/360',
  duracion: '3:00',
  autoplay: false,
  showControls: true,
  allowFullscreen: true,
};

/**
 * Definición del preview para el registry
 */
export const VideoPlayerPreview: PreviewDefinition = {
  component: VideoPlayerPreviewComponent,
  exampleData,
  propsDocumentation,
};
