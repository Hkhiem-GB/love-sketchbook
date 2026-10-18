import React from 'react';
import { DoodleFlower, DoodleLeaf, DoodleHeart } from './DoodleDecorations';

interface SketchbookPaperProps {
  children: React.ReactNode;
  className?: string;
  showSpirals?: boolean;
  showDoodles?: boolean;
  paperColor?: 'cream' | 'white';
}

export const SketchbookPaper: React.FC<SketchbookPaperProps> = ({
  children,
  className = '',
  showSpirals = true,
  showDoodles = true,
  paperColor = 'white',
}) => {
  const bgClass = paperColor === 'white' ? 'bg-paper-white' : 'bg-paper';

  return (
    <div className={`relative ${bgClass} sketch-border shadow-sketch-lg p-6 sm:p-10 transition-all ${className}`}>
      {/* Top Sketchbook Wire Spiral Rings */}
      {showSpirals && (
        <div className="absolute -top-3.5 left-8 right-8 flex justify-between pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Metal wire ring */}
              <div className="w-2.5 h-6 rounded-full border-[1.5px] border-pencil-graphite bg-[#EBE3D5] shadow-xs transform -rotate-6"></div>
              {/* Hole punch */}
              <div className="w-2 h-2 rounded-full bg-paper-border -mt-1 opacity-70"></div>
            </div>
          ))}
        </div>
      )}

      {/* Decorative Hand-drawn Corner Details */}
      {showDoodles && (
        <>
          <div className="absolute top-4 left-4 pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
            <DoodleLeaf size={24} className="-rotate-45" />
          </div>
          <div className="absolute top-4 right-4 pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
            <DoodleFlower size={22} petalColor="#DDA0A5" />
          </div>
          <div className="absolute bottom-4 left-4 pointer-events-none opacity-30 hover:opacity-70 transition-opacity">
            <DoodleHeart size={20} fill="#C8B4D4" />
          </div>
          <div className="absolute bottom-4 right-4 pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
            <DoodleLeaf size={22} fill="#899873" className="rotate-90" />
          </div>
        </>
      )}

      {children}
    </div>
  );
};
