import { useState } from 'react';
import Image from 'next/image';
import { getUnsplashImageUrl } from '@/lib/utils/game-helpers';

interface CaseImageProps {
  itemName: string;
  imageSearch: string;
}

export default function CaseImage({ itemName, imageSearch }: CaseImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUrl = getUnsplashImageUrl(imageSearch);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700">
      {isLoading && <div className="absolute inset-0 animate-pulse bg-slate-700" />}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-slate-300 text-xl font-semibold">{itemName}</p>
        </div>
      ) : (
        <Image
          src={imageUrl}
          alt={itemName}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          unoptimized
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center">{itemName}</h2>
      </div>
    </div>
  );
}
