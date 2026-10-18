import React from 'react';

interface HandDrawnFrameProps {
  src: string;
  alt?: string;
  caption?: string;
  rotation?: number;
  className?: string;
  tapeColor?: 'gold' | 'pink' | 'sage';
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const HandDrawnFrame: React.FC<HandDrawnFrameProps> = ({
  src,
  alt = 'Kỷ niệm',
  caption,
  rotation = 0,
  className = '',
  tapeColor = 'gold',
  onClick,
  size = 'md',
}) => {
  const tapeColorClass = {
    gold: 'washi-tape',
    pink: 'washi-tape washi-tape-pink',
    sage: 'washi-tape washi-tape-sage',
  }[tapeColor];

  const sizeClasses = {
    xs: 'w-20 sm:w-24 p-1.5 pb-3',
    sm: 'w-24 sm:w-32 p-2 pb-4',
    md: 'w-32 sm:w-40 p-2.5 pb-5',
    lg: 'w-48 sm:w-56 p-3 pb-7',
  }[size];

  return (
    <div
      onClick={onClick}
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity: 1, // 100% full opacity, no transparency or dimming
      }}
      className={`relative inline-block bg-paper-white sketch-border shadow-photo transition-transform duration-200 hover:scale-105 hover:z-40 cursor-pointer select-none flex-shrink-0 ${sizeClasses} ${className}`}
    >
      {/* Decorative Washi Tape */}
      <div className={tapeColorClass} />

      {/* Image container - 100% crisp, no blur, no mix-blend-mode */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6ED] border border-[#5E514B]/35 rounded-xs">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Handwritten caption - crisp and legible */}
      {caption && (
        <p className="mt-1.5 text-center font-hand text-pencil-graphite text-xs sm:text-sm font-medium truncate px-0.5">
          {caption}
        </p>
      )}
    </div>
  );
};
