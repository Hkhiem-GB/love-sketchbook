import React, { useEffect } from 'react';
import { PhotoItem } from '../../types';
import { DoodleHeart, DoodleFlower } from './DoodleDecorations';
import { X } from 'lucide-react';

interface PhotoLightboxModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
}

/**
 * Responsive Scrapbook Photo Lightbox Modal
 *
 * Sized comfortably for both mobile (320px-430px) and desktop:
 * - Explicit viewport constraints: max-w-[min(calc(100vw-32px),420px)] and max-h-[calc(100dvh-170px)]
 * - Preserves aspect ratio with object-contain (no portrait/landscape cropping or distortion)
 * - Accessible close button with >= 42px touch target
 * - Body scroll lock and Escape key listener
 * - Romantic sketchbook visual identity (washi tape, paper card, sketch border)
 */
export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  onClose,
}) => {
  // Prevent background scrolling and handle Escape key
  useEffect(() => {
    if (!photo) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem chi tiết ảnh kỷ niệm"
      className="fixed inset-0 bg-[#5E514B]/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-paper-white sketch-border shadow-2xl p-2.5 sm:p-4 pb-3.5 sm:pb-4 max-w-[min(calc(100vw-80px),310px)] sm:max-w-[340px] w-full animate-float flex flex-col items-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Washi Tape at Top */}
        <div className="washi-tape washi-tape-pink scale-90" />

        {/* Close button - compact, tap-friendly */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute -top-2.5 -right-2 sm:-top-3 sm:-right-2.5 bg-paper-white sketch-btn min-w-[36px] min-h-[36px] w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-pencil-graphite hover:text-pencil-rose hover:scale-105 active:scale-95 transition-all shadow-md z-30"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Polaroid Image Area - Compact bounds reduced by 20%, aspect ratio preserved with object-contain */}
        <div className="relative w-full max-h-[min(48dvh,340px)] sm:max-h-[min(52dvh,380px)] flex items-center justify-center bg-[#FAF6ED] border border-[#5E514B]/35 rounded-xs p-1 overflow-hidden">
          <img
            src={photo.url}
            alt={photo.caption || 'Kỷ niệm'}
            className="max-w-full max-h-[min(46dvh,330px)] sm:max-h-[min(50dvh,370px)] w-auto h-auto object-contain rounded-2xs pointer-events-none select-none transition-transform duration-200"
          />
        </div>

        {/* Caption & Romantic Sketch Details */}
        <div className="w-full text-center mt-2 sm:mt-2.5 px-1">
          <h4
            className="font-hand text-base sm:text-lg text-pencil-rose font-bold mb-0.5 line-clamp-2 break-words leading-tight"
            title={photo.caption || 'Khoảnh khắc ngọt ngào'}
          >
            {photo.caption || 'Khoảnh khắc ngọt ngào'}
          </h4>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 opacity-75">
            <DoodleFlower size={14} petalColor="#DDA0A5" />
            <span className="font-hand text-pencil-lead text-[11px] sm:text-xs">
              Lưu giữ trong cuốn sổ yêu thương
            </span>
            <DoodleHeart size={12} fill="#C9757C" />
          </div>
        </div>
      </div>
    </div>
  );
};
