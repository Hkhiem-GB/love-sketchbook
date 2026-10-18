import React from 'react';
import { DoodleHeart, DoodleFlower } from './DoodleDecorations';

interface HandwrittenNoteProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  tapeColor?: 'gold' | 'pink' | 'sage';
  rotation?: number;
  lined?: boolean;
}

export const HandwrittenNote: React.FC<HandwrittenNoteProps> = ({
  children,
  title,
  className = '',
  tapeColor = 'pink',
  rotation = -1,
  lined = true,
}) => {
  const tapeClass = {
    gold: 'washi-tape',
    pink: 'washi-tape washi-tape-pink',
    sage: 'washi-tape washi-tape-sage',
  }[tapeColor];

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`relative bg-paper-white sketch-border shadow-sketch p-5 pt-7 transition-transform duration-200 hover:rotate-0 ${lined ? 'lined-paper' : ''} ${className}`}
    >
      <div className={tapeClass} />

      {title && (
        <div className="flex items-center justify-between border-b border-pencil-graphite/30 pb-2 mb-3">
          <h4 className="font-serif italic font-bold text-lg text-pencil-rose flex items-center gap-2">
            <span>{title}</span>
            <DoodleHeart size={16} fill="#DDA0A5" />
          </h4>
          <DoodleFlower size={18} petalColor="#A9B99A" centerColor="#E1C17A" />
        </div>
      )}

      <div className="font-hand text-pencil-graphite text-lg tracking-wide leading-relaxed">
        {children}
      </div>
    </div>
  );
};
