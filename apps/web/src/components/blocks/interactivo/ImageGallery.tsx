'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import type { ImageGalleryConfig, GalleryImage } from './types';
import type { StudioBlockProps } from '../types';

interface ThumbnailProps {
  image: GalleryImage;
  isActive: boolean;
  onClick: () => void;
}

function Thumbnail({ image, isActive, onClick }: ThumbnailProps): ReactElement {
  return (
    <button
      type="button"
      data-testid={`thumbnail-${image.id}`}
      onClick={onClick}
      className={`
        w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-150
        ${isActive ? 'active border-blue-500 ring-2 ring-blue-400' : 'border-slate-600 hover:border-slate-400'}
      `}
    >
      <img
        src={image.thumbnailUrl || image.url}
        alt={image.alt}
        className="w-full h-full object-cover"
      />
    </button>
  );
}

interface ZoomModalProps {
  image: GalleryImage;
  onClose: () => void;
}

function ZoomModal({ image, onClose }: ZoomModalProps): ReactElement {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      data-testid="zoom-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <div
        data-testid="zoom-modal-backdrop"
        className="absolute inset-0"
        onClick={handleBackdropClick}
      />
      <div className="relative z-10 max-w-[90vw] max-h-[90vh]">
        <img
          data-testid="zoomed-image"
          src={image.url}
          alt={image.alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          ✕
        </button>
        {image.titulo && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
            <h3 className="text-white font-medium">{image.titulo}</h3>
            {image.descripcion && (
              <p className="text-slate-300 text-sm mt-1">{image.descripcion}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ImageGallery({
  id,
  config,
  modo,
  onProgress,
}: StudioBlockProps<ImageGalleryConfig>): ReactElement {
  const { imagenes, disposicion = 'grid' } = config;
  const [imagenActual, setImagenActual] = useState(0);
  const [zoomAbierto, setZoomAbierto] = useState(false);

  // Early return if no images
  if (imagenes.length === 0) {
    return <div className="p-4 text-slate-400 text-center">No hay imágenes en la galería</div>;
  }

  const currentImage = imagenes[imagenActual]!;

  const handleNext = useCallback(() => {
    const nextIndex = (imagenActual + 1) % imagenes.length;
    setImagenActual(nextIndex);
    onProgress?.((nextIndex / imagenes.length) * 100);
  }, [imagenActual, imagenes.length, onProgress]);

  const handlePrevious = useCallback(() => {
    const prevIndex = imagenActual === 0 ? imagenes.length - 1 : imagenActual - 1;
    setImagenActual(prevIndex);
    onProgress?.((prevIndex / imagenes.length) * 100);
  }, [imagenActual, imagenes.length, onProgress]);

  const handleThumbnailClick = useCallback(
    (index: number) => {
      setImagenActual(index);
      onProgress?.((index / imagenes.length) * 100);
    },
    [imagenes.length, onProgress],
  );

  const handleZoomOpen = useCallback(() => {
    setZoomAbierto(true);
  }, []);

  const handleZoomClose = useCallback(() => {
    setZoomAbierto(false);
  }, []);

  // Editor mode
  if (modo === 'editor') {
    return (
      <div className="p-4 border-2 border-dashed border-slate-600 rounded-lg">
        <div data-testid="editor-mode-indicator" className="text-sm text-slate-400 mb-2">
          Modo Editor - ImageGallery
        </div>
        <h3 className="text-white font-medium">{config.instruccion}</h3>
        <div className="mt-2 text-slate-400 text-sm">
          <span>{imagenes.length} imágenes</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" data-testid={`image-gallery-${id}`}>
      {/* Title and instruction */}
      {config.titulo && <h2 className="text-lg font-semibold text-white mb-1">{config.titulo}</h2>}
      <p className="text-slate-300 mb-2">{config.instruccion}</p>
      {config.descripcion && <p className="text-sm text-slate-400 mb-4">{config.descripcion}</p>}

      {/* Main image */}
      <div className="relative mb-4">
        <div className="relative rounded-lg overflow-hidden bg-slate-800">
          <img
            data-testid="main-image"
            src={currentImage.url}
            alt={currentImage.alt}
            className="w-full h-64 object-contain cursor-zoom-in"
            onDoubleClick={handleZoomOpen}
          />

          {/* Navigation buttons */}
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            →
          </button>

          {/* Zoom button */}
          <button
            type="button"
            data-testid="zoom-button"
            onClick={handleZoomOpen}
            aria-label="Ampliar"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            🔍
          </button>

          {/* Counter */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/70 text-white text-sm">
            {imagenActual + 1} / {imagenes.length}
          </div>
        </div>

        {/* Image info */}
        <div className="mt-3">
          {currentImage.titulo && <h3 className="text-white font-medium">{currentImage.titulo}</h3>}
          {currentImage.descripcion && (
            <p className="text-slate-400 text-sm mt-1">{currentImage.descripcion}</p>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      <div
        data-testid="thumbnails-container"
        className={`
          flex gap-2 justify-center
          ${disposicion === 'grid' ? 'grid flex-wrap' : 'carousel overflow-x-auto'}
        `}
      >
        {imagenes.map((image, index) => (
          <Thumbnail
            key={image.id}
            image={image}
            isActive={index === imagenActual}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>

      {/* Autoplay button */}
      {config.autoplay && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            data-testid="autoplay-button"
            className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
          >
            ▶ Reproducir
          </button>
        </div>
      )}

      {/* Zoom modal */}
      {zoomAbierto && <ZoomModal image={currentImage} onClose={handleZoomClose} />}
    </div>
  );
}
