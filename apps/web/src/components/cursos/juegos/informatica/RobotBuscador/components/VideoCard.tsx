import React from 'react';
import { motion } from 'framer-motion';
import { Play, Check } from 'lucide-react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  isComparing: boolean;
  isSwapping: boolean;
  isSorted: boolean;
  rank?: number;
  isDimmed?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isComparing,
  isSwapping,
  isSorted,
  rank,
  isDimmed,
}) => {
  const variants = {
    idle: { scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' },
    comparing: { scale: 1.05, y: -10, opacity: 1, filter: 'blur(0px)' },
    swapping: { scale: 1.05, y: -10, opacity: 1, filter: 'blur(0px)' },
    dimmed: { scale: 0.95, y: 0, opacity: 0.5, filter: 'grayscale(50%)' },
    sorted: { scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' },
  };

  const currentState = isSwapping
    ? 'swapping'
    : isComparing
      ? 'comparing'
      : isDimmed
        ? 'dimmed'
        : 'idle';

  // Relevance Color Logic
  let barColor = 'bg-red-400';
  let relevanceText = 'text-red-500';
  let glowColor = '';

  if (video.relevancia >= 80) {
    barColor = 'bg-green-400';
    relevanceText = 'text-green-600';
    glowColor = 'shadow-green-400/50';
  } else if (video.relevancia >= 50) {
    barColor = 'bg-yellow-400';
    relevanceText = 'text-yellow-600';
    glowColor = 'shadow-yellow-400/50';
  }

  // Card Container Styles
  let containerStyle = 'bg-white shadow-xl';
  if (isComparing || isSwapping) {
    containerStyle = `bg-white shadow-2xl ring-4 ring-offset-4 ring-blue-400 ${glowColor}`;
  } else if (isSorted || video.ordenado) {
    containerStyle = 'bg-white ring-2 ring-green-400 shadow-lg';
  }

  return (
    <motion.div
      layoutId={video.id}
      variants={variants}
      animate={currentState}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ position: 'relative', zIndex: isComparing || isSwapping ? 10 : 1 }}
      className={`
        relative flex flex-col p-3 rounded-2xl
        ${containerStyle}
        w-32 h-44 sm:w-36 sm:h-48
        overflow-hidden
        cursor-default select-none
        transition-shadow duration-300
      `}
    >
      {/* Rank Badge */}
      {rank && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center z-20 shadow-lg text-xs"
        >
          #{rank}
        </motion.div>
      )}

      {/* Sorted Checkmark */}
      {(isSorted || video.ordenado) && !isComparing && !rank && (
        <div className="absolute top-1.5 right-1.5 text-green-500 bg-green-100 rounded-full p-0.5">
          <Check className="w-4 h-4" />
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-full aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center relative group">
        <span className="text-3xl drop-shadow-sm transform transition-transform group-hover:scale-110">
          {video.emoji}
        </span>

        {/* Play Icon overlay */}
        <div className="absolute bottom-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
          <Play className="w-3 h-3 text-black fill-black ml-0.5" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <h3 className="text-xs font-bold text-gray-800 leading-tight line-clamp-2 text-center mb-1.5">
          {video.titulo}
        </h3>

        {/* Relevance Meter */}
        <div className="mt-auto">
          <div className="flex justify-between items-end mb-0.5 px-0.5">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              Relevancia
            </span>
            <span className={`text-sm font-black ${relevanceText}`}>{video.relevancia}%</span>
          </div>

          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${video.relevancia}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
