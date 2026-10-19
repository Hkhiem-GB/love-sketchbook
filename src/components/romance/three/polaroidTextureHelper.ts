import * as THREE from 'three';
import { PhotoItem } from '../../../types';

const TAPE_COLORS = [
  'rgba(225, 193, 122, 0.85)', // Gold tape
  'rgba(221, 160, 165, 0.85)', // Pink tape
  'rgba(169, 185, 154, 0.85)', // Sage tape
];

/**
 * Creates an authentic 512x640 Polaroid scrapbook texture on Canvas
 * with washi tape, graphite borders, and handwritten caption.
 */
export function createPolaroidTexture(
  photo: PhotoItem,
  index: number,
  onTextureReady?: (tex: THREE.CanvasTexture) => void
): THREE.CanvasTexture {
  const width = 512;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;

  const tapeColor = TAPE_COLORS[index % TAPE_COLORS.length];

  const renderFrame = (img: HTMLImageElement | null) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Polaroid White Paper Card
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(16, 24, width - 32, height - 48);

    // 2. Graphite Sketch Border (imperfect hand-drawn look)
    ctx.strokeStyle = '#5E514B';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(16, 24, width - 32, height - 48);

    // Inner subtle guide
    ctx.strokeStyle = '#91877F';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 28, width - 40, height - 56);

    // 3. Photo Image Area (Square polaroid crop)
    const imgX = 36;
    const imgY = 48;
    const imgW = width - 72;
    const imgH = width - 72;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(imgX, imgY, imgW, imgH);
      ctx.clip();

      // Cover crop calculation
      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW = imgW;
      let drawH = imgH;
      let drawX = imgX;
      let drawY = imgY;

      if (aspect > 1) {
        drawW = imgH * aspect;
        drawX = imgX - (drawW - imgW) / 2;
      } else {
        drawH = imgW / aspect;
        drawY = imgY - (drawH - imgH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else {
      // Fallback warm sketchbook colored pencil placeholder
      ctx.fillStyle = '#FAF6ED';
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.fillStyle = '#DDA0A5';
      ctx.font = '28px "Patrick Hand", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Kỷ niệm ngọt ngào', width / 2, imgY + imgH / 2 - 10);
      ctx.fillStyle = '#91877F';
      ctx.font = '20px "Patrick Hand", cursive, sans-serif';
      ctx.fillText('❤️', width / 2, imgY + imgH / 2 + 30);
    }

    // Photo border
    ctx.strokeStyle = '#5E514B';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // 4. Decorative Washi Tape at Top
    ctx.save();
    ctx.translate(width / 2, 24);
    ctx.rotate(-0.03);
    ctx.fillStyle = tapeColor;
    ctx.fillRect(-65, -14, 130, 28);
    ctx.strokeStyle = '#5E514B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-65, -14, 130, 28);
    ctx.restore();

    // 5. Handwritten Caption Below Photo
    const captionText = photo.caption || `Kỷ niệm #${index + 1}`;
    ctx.fillStyle = '#5E514B';
    ctx.font = 'bold 30px "Patrick Hand", "Caveat", cursive, sans-serif';
    ctx.textAlign = 'center';

    // Ensure caption fits gracefully without text overflow
    let displayCaption = captionText;
    const maxCaptionWidth = width - 100;
    if (ctx.measureText(displayCaption).width > maxCaptionWidth) {
      while (displayCaption.length > 2 && ctx.measureText(displayCaption + '...').width > maxCaptionWidth) {
        displayCaption = displayCaption.slice(0, -1);
      }
      displayCaption += '...';
    }
    ctx.fillText(displayCaption, width / 2, height - 70);

    // Little heart or flower doodle at bottom right
    ctx.fillStyle = '#C9757C';
    ctx.font = '22px sans-serif';
    ctx.fillText('❤️', width - 60, height - 45);

    texture.needsUpdate = true;
    onTextureReady?.(texture);
  };

  // Initial draw with placeholder
  renderFrame(null);

  // Load actual photo
  if (photo.url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      renderFrame(img);
    };
    img.onerror = () => {
      // Fallback: retry without crossOrigin if data URL or local
      const localImg = new Image();
      localImg.onload = () => renderFrame(localImg);
      localImg.src = photo.url;
    };
    img.src = photo.url;
  }

  return texture;
}
