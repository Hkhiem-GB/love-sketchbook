import React, { useState } from 'react';
import { GiftData } from '../../types';
import { DrawnLoveTree } from './DrawnLoveTree';
import { ThreeGallery3D } from './ThreeGallery3D';
import { DoodleHeart, DoodleFlower, DoodleLeaf } from '../ui/DoodleDecorations';
import { PencilButton } from '../ui/PencilButton';
import { RotateCcw, FastForward } from 'lucide-react';

interface RomanceExperienceProps {
  gift: GiftData;
  onReplay?: () => void;
  skipTreeAnimation?: boolean;
}

export const RomanceExperience: React.FC<RomanceExperienceProps> = ({
  gift,
  onReplay,
  skipTreeAnimation = false,
}) => {
  const [treeDrawn, setTreeDrawn] = useState(skipTreeAnimation);

  const handleSkipAnimation = () => {
    setTreeDrawn(true);
  };

  const handleReplayAll = () => {
    setTreeDrawn(false);
    onReplay?.();
  };

  return (
    <div className="relative w-full h-full h-screen h-[100dvh] overflow-hidden select-none bg-paper">
      {/* Top Greeting Title Banner (Floating Header Overlay) */}
      <div className="absolute top-2 sm:top-4 left-0 right-0 z-30 flex flex-col items-center pointer-events-none px-4 text-center">
        <div className="pointer-events-auto inline-flex items-center gap-2 bg-paper-white/95 sketch-border shadow-sketch px-5 py-1.5 mb-1 transform rotate-0.5 backdrop-blur-xs">
          <DoodleFlower size={18} petalColor="#DDA0A5" />
          <h2 className="font-serif italic font-bold text-lg sm:text-2xl text-pencil-rose">
            Cây Tình Yêu Của {gift.recipient_name}
          </h2>
          <DoodleHeart size={16} fill="#C9757C" />
        </div>

        <p className="pointer-events-auto font-hand text-pencil-graphite text-xs sm:text-base max-w-lg mx-auto drop-shadow-xs">
          {gift.closing_message || 'Từng bức ảnh là một chiếc lá, từng nụ cười là một bông hoa nở rộ...'}
        </p>

        {/* Fast forward button during tree drawing */}
        {!treeDrawn && (
          <button
            onClick={handleSkipAnimation}
            className="pointer-events-auto mt-1 inline-flex items-center gap-1 font-hand text-xs text-pencil-lead hover:text-pencil-rose transition-colors py-0.5 px-2 bg-paper-white/80 sketch-border-subtle rounded-xs"
          >
            <FastForward size={12} />
            <span>Mở vòng ảnh 3D ngay</span>
          </button>
        )}
      </div>

      {/* Main Romance 3D Stage: 100% Fullscreen Viewport */}
      <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-center">
        {/* Stage 1: Live Pencil Drawing Animation */}
        {!treeDrawn && (
          <div className="flex items-center justify-center w-full h-full animate-sway">
            <DrawnLoveTree
              onAnimationComplete={() => setTreeDrawn(true)}
              skipAnimation={false}
              className="w-[340px] sm:w-[460px] md:w-[540px] aspect-square"
            />
          </div>
        )}

        {/* Stage 2, 3, 4: Interactive 3D WebGL Gallery with Real Depth Occlusion & Inertia */}
        {treeDrawn && (
          <ThreeGallery3D
            photos={gift.photos}
            treeReady={true}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Bottom Controls Overlay (Floating) */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 font-hand text-pencil-lead text-xs sm:text-sm bg-paper-white/85 sketch-border-subtle px-3 py-1 rounded-xs">
          <DoodleLeaf size={16} fill="#899873" />
          <span>Món quà 20/10 từ {gift.sender_name}</span>
        </div>

        {onReplay && (
          <div className="pointer-events-auto">
            <PencilButton
              variant="paper"
              size="sm"
              onClick={handleReplayAll}
              icon={<RotateCcw size={14} />}
            >
              Mở lại từ đầu
            </PencilButton>
          </div>
        )}
      </div>
    </div>
  );
};
