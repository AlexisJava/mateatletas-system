'use client';

import React, { ReactElement, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { PreviewComponentProps, PreviewDefinition, PropDocumentation } from '../types';

/**
 * Datos de ejemplo tipados para ImageGallery
 */
interface ImageGalleryImage {
  id: string;
  src: string;
  alt: string;
  titulo?: string;
  descripcion?: string;
}

interface ImageGalleryExampleData {
  instruccion: string;
  imagenes: ImageGalleryImage[];
  mostrarMiniaturas?: boolean;
  permitirZoom?: boolean;
  autoplay?: boolean;
  intervaloAutoplay?: number;
}

/**
 * Preview interactivo del componente ImageGallery
 */
function ImageGalleryPreviewComponent({
  exampleData,
  interactive,
}: PreviewComponentProps): ReactElement {
  const data = exampleData as ImageGalleryExampleData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = data.imagenes[currentIndex];

  const handlePrevious = useCallback(() => {
    if (!interactive) return;
    setCurrentIndex((prev) => (prev === 0 ? data.imagenes.length - 1 : prev - 1));
  }, [interactive, data.imagenes.length]);

  const handleNext = useCallback(() => {
    if (!interactive) return;
    setCurrentIndex((prev) => (prev === data.imagenes.length - 1 ? 0 : prev + 1));
  }, [interactive, data.imagenes.length]);

  const handleThumbnailClick = useCallback(
    (index: number) => {
      if (!interactive) return;
      setCurrentIndex(index);
    },
    [interactive],
  );

  const handleZoomToggle = useCallback(() => {
    if (!interactive || !data.permitirZoom) return;
    setIsZoomed((prev) => !prev);
  }, [interactive, data.permitirZoom]);

  const handleCloseZoom = useCallback(() => {
    setIsZoomed(false);
  }, []);

  return (
    <div className="relative">
      {/* Instruction */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{data.instruccion}</h2>
      </div>

      {/* Main Image Container */}
      <div className="relative bg-slate-800 rounded-xl overflow-hidden">
        {/* Image */}
        <div
          className="relative aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center cursor-pointer"
          onClick={handleZoomToggle}
        >
          {/* Placeholder for image */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="w-24 h-24 bg-slate-600 rounded-lg mb-2 flex items-center justify-center">
              <ZoomIn className="w-10 h-10" />
            </div>
            <span className="text-sm">{currentImage?.alt || 'Imagen'}</span>
          </div>

          {/* Zoom indicator */}
          {data.permitirZoom && interactive && (
            <div className="absolute bottom-3 right-3 bg-black/50 rounded-lg px-2 py-1 flex items-center gap-1">
              <ZoomIn className="w-4 h-4 text-white" />
              <span className="text-xs text-white">Click para zoom</span>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {data.imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!interactive}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!interactive}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-3 left-3 bg-black/50 rounded-lg px-3 py-1">
          <span className="text-sm text-white">
            {currentIndex + 1} / {data.imagenes.length}
          </span>
        </div>
      </div>

      {/* Image Info */}
      {(currentImage?.titulo || currentImage?.descripcion) && (
        <div className="mt-3 p-3 bg-slate-800 rounded-lg">
          {currentImage?.titulo && (
            <h3 className="text-white font-semibold">{currentImage.titulo}</h3>
          )}
          {currentImage?.descripcion && (
            <p className="text-slate-400 text-sm mt-1">{currentImage.descripcion}</p>
          )}
        </div>
      )}

      {/* Thumbnails */}
      {data.mostrarMiniaturas !== false && data.imagenes.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {data.imagenes.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              disabled={!interactive}
              className={`
                shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${index === currentIndex ? 'border-blue-500' : 'border-transparent hover:border-slate-500'}
                disabled:cursor-not-allowed
              `}
            >
              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                <span className="text-xs text-slate-400">{index + 1}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={handleCloseZoom}
        >
          <button
            type="button"
            onClick={handleCloseZoom}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[90vh] p-4">
            <div className="bg-slate-700 rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-slate-400">
                <ZoomIn className="w-16 h-16 mx-auto mb-2" />
                <span>{currentImage?.alt || 'Imagen ampliada'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Documentación de props para ImageGallery
 */
const propsDocumentation: PropDocumentation[] = [
  {
    name: 'instruccion',
    type: 'string',
    description: 'Texto de instrucción para el estudiante',
    required: true,
  },
  {
    name: 'imagenes',
    type: 'array',
    description: 'Array de imágenes con id, src, alt, titulo y descripcion',
    required: true,
  },
  {
    name: 'mostrarMiniaturas',
    type: 'boolean',
    description: 'Mostrar miniaturas de navegación',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'permitirZoom',
    type: 'boolean',
    description: 'Permitir ampliar la imagen al hacer click',
    required: false,
    defaultValue: 'true',
  },
  {
    name: 'autoplay',
    type: 'boolean',
    description: 'Cambiar automáticamente de imagen',
    required: false,
    defaultValue: 'false',
  },
  {
    name: 'intervaloAutoplay',
    type: 'number',
    description: 'Intervalo en milisegundos para el autoplay',
    required: false,
    defaultValue: '3000',
  },
];

/**
 * Datos de ejemplo para el preview
 */
const exampleData: ImageGalleryExampleData = {
  instruccion: 'Observa las imágenes del sistema solar',
  imagenes: [
    {
      id: 'img1',
      src: '/images/sol.jpg',
      alt: 'El Sol',
      titulo: 'El Sol',
      descripcion: 'Nuestra estrella, el centro del sistema solar.',
    },
    {
      id: 'img2',
      src: '/images/tierra.jpg',
      alt: 'La Tierra',
      titulo: 'La Tierra',
      descripcion: 'Nuestro planeta, el tercer planeta desde el Sol.',
    },
    {
      id: 'img3',
      src: '/images/luna.jpg',
      alt: 'La Luna',
      titulo: 'La Luna',
      descripcion: 'El único satélite natural de la Tierra.',
    },
    {
      id: 'img4',
      src: '/images/marte.jpg',
      alt: 'Marte',
      titulo: 'Marte',
      descripcion: 'El planeta rojo, cuarto planeta desde el Sol.',
    },
  ],
  mostrarMiniaturas: true,
  permitirZoom: true,
  autoplay: false,
};

/**
 * Definición del preview para el registry
 */
export const ImageGalleryPreview: PreviewDefinition = {
  component: ImageGalleryPreviewComponent,
  exampleData,
  propsDocumentation,
};
