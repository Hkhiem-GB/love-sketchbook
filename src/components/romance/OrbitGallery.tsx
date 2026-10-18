import React from 'react';
import { PhotoItem } from '../../types';
import { ThreeGallery3D } from './ThreeGallery3D';

interface OrbitGalleryProps {
  photos: PhotoItem[];
  treeReady?: boolean;
  className?: string;
  onPhotoClick?: (photo: PhotoItem) => void;
}

/**
 * 3D Rotating Image Gallery powered by Three.js / WebGL
 */
export const OrbitGallery: React.FC<OrbitGalleryProps> = ({
  photos,
  treeReady = true,
  className = '',
  onPhotoClick,
}) => {
  return (
    <ThreeGallery3D
      photos={photos}
      treeReady={treeReady}
      className={className}
      onPhotoClick={onPhotoClick}
    />
  );
};

export { ThreeGallery3D };
