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
    xs: 'w-14 sm:w-16 md:w-20 p-1 pb-1.5 sm:p-1.5 sm:pb-2.5',
    sm: 'w-16 sm:w-20 md:w-24 p-1 pb-2 sm:p-1.5 sm:pb-3',
    md: 'w-20 sm:w-26 md:w-30 p-1.5 pb-2.5 sm:p-2 sm:pb-3.5',
    lg: 'w-26 sm:w-34 md:w-40 p-2 pb-3 sm:p-2.5 sm:pb-5',
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

      {/* Handwritten caption - crisp, legible, and cleanly truncated */}
      {caption && (
        <p
          className="mt-1 text-center font-hand text-pencil-graphite text-[11px] sm:text-xs font-medium truncate px-0.5"
          title={caption}
        >
          {caption}
        </p>
      )}
    </div>
  );
};
