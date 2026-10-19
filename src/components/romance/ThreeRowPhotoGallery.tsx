import React, { useState, useEffect } from 'react';
import { PhotoItem } from '../../types';
import { HandDrawnFrame } from '../ui/HandDrawnFrame';
import { ZoomIn } from 'lucide-react';
import { PhotoLightboxModal } from '../ui/PhotoLightboxModal';

interface ThreeRowPhotoGalleryProps {
  photos: PhotoItem[];
  treeReady: boolean;
  className?: string;
}

// Stable deterministic rotation per photo to ensure handmade feel without collision
const DETERMINISTIC_ROTATIONS = [-1.5, 1.8, -1.2, 1.5, -2.0, 1.2, -1.8, 1.4];

import { distributePhotosToThreeRows } from '../../utils/photoDistribution';

export const ThreeRowPhotoGallery: React.FC<ThreeRowPhotoGalleryProps> = ({
  photos,
  treeReady,
  className = '',
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  // Staged appearance state: Cây trước, ảnh sau
  // Stage 1 & 2: tree is drawing -> no photos visible
  // Stage 3: Row 1 appears -> Row 2 appears -> Row 3 appears
  const [row1Visible, setRow1Visible] = useState(false);
  const [row2Visible, setRow2Visible] = useState(false);
  const [row3Visible, setRow3Visible] = useState(false);

  useEffect(() => {
    if (!treeReady) {
      setRow1Visible(false);
      setRow2Visible(false);
      setRow3Visible(false);
      return;
    }

    // Sequence of appearance:
    // 1. Row 1 appears after 200ms
    const timer1 = setTimeout(() => {
      setRow1Visible(true);
    }, 200);

    // 2. Row 2 appears 450ms later
    const timer2 = setTimeout(() => {
      setRow2Visible(true);
    }, 650);

    // 3. Row 3 appears 450ms later
    const timer3 = setTimeout(() => {
      setRow3Visible(true);
    }, 1100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [treeReady]);

  // Distribute photos into 3 rows
  const [row1, row2, row3] = React.useMemo(
    () => distributePhotosToThreeRows(photos),
    [photos]
  );

  // Pick optimal frame size based on photos count in row
  const getFrameSize = (count: number): 'xs' | 'sm' | 'md' => {
    if (count <= 3) return 'md';
    if (count <= 6) return 'sm';
    return 'xs';
  };

  const renderRow = (
    items: PhotoItem[],
    rowIndex: number,
    isVisible: boolean,
    tapeColor: 'gold' | 'pink' | 'sage'
  ) => {
    if (items.length === 0) return null;

    const frameSize = getFrameSize(items.length);
    const isMidRow = rowIndex === 1;
    const midIndex = Math.floor(items.length / 2);

    return (
      <div
        className={`w-full transition-all duration-700 ease-out flex items-center justify-center ${
          isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className={`flex items-center justify-center gap-2 sm:gap-4 md:gap-7 px-2 sm:px-3 py-1.5 sm:py-2 w-full max-w-full overflow-x-auto scrollbar-none select-none ${
            // Slight horizontal stagger offset between rows for organic sketchbook feel
            rowIndex === 1 ? 'sm:translate-x-2' : rowIndex === 2 ? 'sm:-translate-x-2' : ''
          }`}
        >
          {items.map((photo, i) => {
            const rot = DETERMINISTIC_ROTATIONS[(rowIndex * 4 + i) % DETERMINISTIC_ROTATIONS.length];
            const delay = `${i * 90}ms`;
            const needsCenterSpacer = isMidRow && items.length >= 2 && i === midIndex;

            return (
              <React.Fragment key={photo.id || `${rowIndex}-${i}`}>
                {needsCenterSpacer && (
                  <div
                    key="center-tree-gap"
                    aria-hidden="true"
                    className="w-16 sm:w-28 md:w-36 flex-shrink-0 pointer-events-none"
                  />
                )}
                <div
                  style={{
                    transitionDelay: isVisible ? delay : '0ms',
                  }}
                  className={`transition-all duration-500 ease-out transform ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                  }`}
                >
                  <HandDrawnFrame
                    src={photo.url}
                    caption={photo.caption}
                    rotation={rot}
                    tapeColor={tapeColor}
                    size={frameSize}
                    onClick={() => setSelectedPhoto(photo)}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative w-full h-full flex flex-col justify-between py-2 sm:py-6 ${className}`}>
      {/* ======================================================== */}
      {/* HÀNG 1: QUỸ ĐẠO TRÊN (Row 1) */}
      {/* ======================================================== */}
      <div className="z-10">
        {renderRow(row1, 0, row1Visible, 'gold')}
      </div>

      {/* ======================================================== */}
      {/* HÀNG 2: QUỸ ĐẠO GIỮA (Row 2 - Khung hai bên thân cây) */}
      {/* ======================================================== */}
      <div className="z-25 my-auto">
        {renderRow(row2, 1, row2Visible, 'pink')}
      </div>

      {/* ======================================================== */}
      {/* HÀNG 3: QUỸ ĐẠO DƯỚI (Row 3) */}
      {/* ======================================================== */}
      <div className="z-30">
        {renderRow(row3, 2, row3Visible, 'sage')}
      </div>

      {/* Light touch hint once all photos are visible */}
      {row3Visible && (
        <div className="text-center font-hand text-pencil-lead text-xs sm:text-sm tracking-wide opacity-80 flex items-center justify-center gap-1.5 pointer-events-none mt-2">
          <ZoomIn size={14} />
          <span>Chạm vào ảnh để mở xem chi tiết cuốn sổ kỷ niệm</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* LIGHTBOX MODAL: Xem ảnh lớn dạng scrapbook */}
      {/* ======================================================== */}
      <PhotoLightboxModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
};
