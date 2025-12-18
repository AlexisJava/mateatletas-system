'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBestImage } from '@/lib/services/nasa-api';
import Image from 'next/image';

interface NASAImageProps {
  objectName: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  showCaption?: boolean;
  priority?: boolean;
  fallbackEmoji?: string;
}

/**
 * Componente para mostrar imágenes de NASA con loading y fallback
 */
export default function NASAImage({
  objectName,
  alt,
  width = 400,
  height = 300,
  className = '',
  showCaption = false,
  priority = false,
  fallbackEmoji = '🪐',
}: NASAImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchImage() {
      setLoading(true);
      setError(false);

      try {
        const url = await getBestImage(objectName);

        if (isMounted) {
          if (url) {
            setImageUrl(url);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        console.error('Error loading NASA image:', err);
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [objectName]);

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl"
              >
                🛰️
              </motion.div>
              <p className="text-xs text-gray-400">Cargando desde NASA...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-lg border-2 border-slate-700"
          >
            <div className="text-center p-4">
              <div className="text-6xl mb-2">{fallbackEmoji}</div>
              {showCaption && <p className="text-xs text-gray-400">{objectName}</p>}
            </div>
          </motion.div>
        )}

        {!error && imageUrl && (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-lg overflow-hidden"
          >
            <Image
              src={imageUrl}
              alt={alt || objectName}
              fill
              className="object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={priority}
              unoptimized // NASA URLs son externas
            />

            {showCaption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-xs text-white font-semibold">{alt || objectName}</p>
                <p className="text-[10px] text-gray-300">Imagen: NASA</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
