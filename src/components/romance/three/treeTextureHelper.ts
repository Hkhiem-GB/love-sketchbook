import * as THREE from 'three';

/**
 * Generates a high-resolution 1024x1024 CanvasTexture of the Hand-Drawn Love Tree
 * with exact graphite trunk, colored pencil heart canopy, leaves, and blossoms.
 * This texture has a crisp alpha channel so WebGL depth testing (alphaTest: 0.2)
 * accurately occludes photos orbiting behind the tree!
 */
export function createLoveTreeTexture(): { texture: THREE.CanvasTexture; canvas: HTMLCanvasElement } {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    const dummyTexture = new THREE.CanvasTexture(canvas);
    return { texture: dummyTexture, canvas };
  }

  // Draw Love Tree at 1024x1024 resolution (scaled from 600x600 coordinates)
  const scale = size / 600;
  ctx.save();
  ctx.scale(scale, scale);

  // 1. Faint Pencil Sketch Guide Lines
  ctx.save();
  ctx.strokeStyle = '#91877F';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  // Heart canopy guide
  ctx.moveTo(300, 530);
  ctx.bezierCurveTo(230, 440, 100, 320, 120, 180);
  ctx.bezierCurveTo(135, 70, 240, 65, 300, 150);
  ctx.bezierCurveTo(360, 65, 465, 70, 480, 180);
  ctx.bezierCurveTo(500, 320, 370, 440, 300, 530);
  ctx.stroke();
  ctx.restore();

  // 2. Trunk & Roots (Graphite #5E514B with dark border #3A322D)
  ctx.save();
  ctx.fillStyle = '#5E514B';
  ctx.strokeStyle = '#3A322D';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Roots
  ctx.beginPath();
  ctx.moveTo(300, 540);
  ctx.bezierCurveTo(280, 545, 250, 552, 220, 556);
  ctx.moveTo(300, 540);
  ctx.bezierCurveTo(320, 545, 350, 552, 380, 555);
  ctx.moveTo(300, 535);
  ctx.bezierCurveTo(290, 548, 275, 560, 260, 565);
  ctx.stroke();

  // Solid Trunk
  ctx.beginPath();
  ctx.moveTo(278, 540);
  ctx.bezierCurveTo(282, 470, 270, 410, 286, 350);
  ctx.bezierCurveTo(292, 320, 285, 280, 270, 240);
  ctx.bezierCurveTo(275, 235, 285, 245, 292, 260);
  ctx.bezierCurveTo(298, 280, 302, 305, 302, 325);
  ctx.bezierCurveTo(302, 305, 305, 275, 320, 240);
  ctx.bezierCurveTo(326, 245, 328, 255, 322, 275);
  ctx.bezierCurveTo(314, 310, 322, 345, 316, 400);
  ctx.bezierCurveTo(324, 460, 320, 500, 324, 540);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Trunk bark pencil hatch
  ctx.strokeStyle = '#FAF6ED';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(288, 510);
  ctx.quadraticCurveTo(293, 460, 290, 410);
  ctx.moveTo(302, 520);
  ctx.quadraticCurveTo(306, 470, 304, 420);
  ctx.moveTo(312, 505);
  ctx.quadraticCurveTo(315, 455, 311, 395);
  ctx.stroke();
  ctx.restore();

  // 3. Branches (Cành chính vươn lên dáng trái tim)
  ctx.save();
  ctx.strokeStyle = '#5E514B';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left boughs
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(284, 330);
  ctx.bezierCurveTo(240, 300, 200, 270, 180, 220);
  ctx.bezierCurveTo(165, 185, 175, 140, 215, 120);
  ctx.stroke();

  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(215, 280);
  ctx.bezierCurveTo(180, 260, 150, 225, 140, 185);
  ctx.bezierCurveTo(135, 160, 150, 140, 170, 135);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(180, 220);
  ctx.bezierCurveTo(185, 190, 200, 165, 235, 150);
  ctx.moveTo(245, 210);
  ctx.bezierCurveTo(235, 170, 245, 130, 270, 110);
  ctx.moveTo(270, 240);
  ctx.bezierCurveTo(270, 195, 280, 160, 295, 145);
  ctx.stroke();

  // Right boughs
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(314, 330);
  ctx.bezierCurveTo(360, 300, 400, 270, 420, 220);
  ctx.bezierCurveTo(435, 185, 425, 140, 385, 120);
  ctx.stroke();

  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(385, 280);
  ctx.bezierCurveTo(420, 260, 450, 225, 460, 185);
  ctx.bezierCurveTo(465, 160, 450, 140, 430, 135);
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(420, 220);
  ctx.bezierCurveTo(415, 190, 400, 165, 365, 150);
  ctx.moveTo(355, 210);
  ctx.bezierCurveTo(365, 170, 355, 130, 330, 110);
  ctx.moveTo(330, 240);
  ctx.bezierCurveTo(330, 195, 320, 160, 305, 145);
  ctx.stroke();

  // Center Cleavage
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 260);
  ctx.bezierCurveTo(298, 210, 300, 170, 300, 130);
  ctx.stroke();
  ctx.restore();

  // 4. Foliage Clouds (Colored Pencil Heart Canopy)
  // Left Lobe
  drawColoredCloud(ctx, 210, 170, 80, '#DDA0A5', '#C9757C');
  drawColoredCloud(ctx, 160, 210, 60, '#E1C17A', '#DDA0A5');
  drawColoredCloud(ctx, 255, 130, 70, '#A9B99A', '#899873');
  drawColoredCloud(ctx, 180, 260, 55, '#DDA0A5', '#C9757C');

  // Right Lobe
  drawColoredCloud(ctx, 390, 170, 80, '#DDA0A5', '#C9757C');
  drawColoredCloud(ctx, 440, 210, 60, '#E1C17A', '#DDA0A5');
  drawColoredCloud(ctx, 345, 130, 70, '#A9B99A', '#899873');
  drawColoredCloud(ctx, 420, 260, 55, '#DDA0A5', '#C9757C');

  // Center Lobe
  drawColoredCloud(ctx, 300, 200, 75, '#DDA0A5', '#C9757C');
  drawColoredCloud(ctx, 300, 140, 60, '#E1C17A', '#A9B99A');

  // 5. Leaves (Lá cây với gân chì)
  const leaves = [
    { x: 150, y: 170, r: -0.6, fill: '#A9B99A' },
    { x: 190, y: 130, r: 0.35, fill: '#899873' },
    { x: 230, y: 110, r: -0.25, fill: '#A9B99A' },
    { x: 270, y: 125, r: 0.7, fill: '#A9B99A' },
    { x: 330, y: 125, r: -0.7, fill: '#A9B99A' },
    { x: 370, y: 110, r: 0.25, fill: '#899873' },
    { x: 410, y: 130, r: -0.35, fill: '#A9B99A' },
    { x: 450, y: 170, r: 0.6, fill: '#899873' },
    { x: 430, y: 230, r: 1.0, fill: '#A9B99A' },
    { x: 170, y: 230, r: -1.0, fill: '#899873' },
    { x: 210, y: 260, r: 0.2, fill: '#A9B99A' },
    { x: 390, y: 260, r: -0.2, fill: '#A9B99A' },
  ];

  leaves.forEach((leaf) => {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.r);
    ctx.fillStyle = leaf.fill;
    ctx.strokeStyle = '#5E514B';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(8, -12, 24, -10, 28, 0);
    ctx.bezierCurveTo(24, 10, 8, 12, 0, 0);
    ctx.fill();
    ctx.stroke();

    // Center vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();
    ctx.restore();
  });

  // 6. Blossoms (Hoa 5 cánh chì màu hồng, tím, vàng)
  const flowers = [
    { x: 210, y: 165, s: 26, petal: '#DDA0A5', center: '#E1C17A' },
    { x: 250, y: 140, s: 22, petal: '#C9757C', center: '#FFFDF8' },
    { x: 170, y: 195, s: 24, petal: '#C8B4D4', center: '#E1C17A' },
    { x: 140, y: 220, s: 20, petal: '#DDA0A5', center: '#E1C17A' },
    { x: 300, y: 150, s: 28, petal: '#C9757C', center: '#FFFDF8' },
    { x: 350, y: 140, s: 22, petal: '#DDA0A5', center: '#E1C17A' },
    { x: 390, y: 165, s: 26, petal: '#C8B4D4', center: '#E1C17A' },
    { x: 430, y: 195, s: 24, petal: '#DDA0A5', center: '#FFFDF8' },
    { x: 460, y: 220, s: 20, petal: '#C9757C', center: '#E1C17A' },
    { x: 200, y: 240, s: 22, petal: '#E1C17A', center: '#5E514B' },
    { x: 400, y: 240, s: 22, petal: '#E1C17A', center: '#5E514B' },
  ];

  flowers.forEach((fl) => {
    drawBlossom(ctx, fl.x, fl.y, fl.s, fl.petal, fl.center);
  });

  // Little heart fruits
  drawMiniHeart(ctx, 180, 265, 18, '#C9757C');
  drawMiniHeart(ctx, 235, 185, 16, '#DDA0A5');
  drawMiniHeart(ctx, 300, 110, 22, '#C9757C');
  drawMiniHeart(ctx, 365, 185, 16, '#DDA0A5');
  drawMiniHeart(ctx, 420, 265, 18, '#C9757C');

  // 7. Grass Tufts at base
  ctx.save();
  ctx.strokeStyle = '#899873';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(230, 545);
  ctx.bezierCurveTo(228, 535, 220, 530, 215, 532);
  ctx.moveTo(230, 545);
  ctx.bezierCurveTo(232, 532, 236, 528, 238, 530);
  ctx.moveTo(350, 548);
  ctx.bezierCurveTo(348, 536, 342, 532, 338, 535);
  ctx.moveTo(350, 548);
  ctx.bezierCurveTo(353, 534, 358, 530, 362, 533);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // scale

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  texture.needsUpdate = true;

  return { texture, canvas };
}

// Helper: draw colored pencil cloud
function drawColoredCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  colorStart: string,
  colorEnd: string
) {
  ctx.save();
  const grad = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  grad.addColorStop(0, colorStart);
  grad.addColorStop(1, colorEnd);

  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.95;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Graphite sketch contour
  ctx.strokeStyle = '#5E514B';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;
  ctx.stroke();
  ctx.restore();
}

// Helper: draw 5-petal blossom
function drawBlossom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  petalColor: string,
  centerColor: string
) {
  ctx.save();
  ctx.translate(x, y);

  const r = size * 0.32;
  ctx.fillStyle = petalColor;
  ctx.strokeStyle = '#5E514B';
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const px = Math.cos(angle) * (r * 0.85);
    const py = Math.sin(angle) * (r * 0.85);

    ctx.beginPath();
    ctx.arc(px, py, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Center
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Helper: draw little heart fruit
function drawMiniHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  const s = size / 30;
  ctx.scale(s, s);

  ctx.fillStyle = color;
  ctx.strokeStyle = '#5E514B';
  ctx.lineWidth = 1.8;

  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-15, -5, -15, -20, 0, -10);
  ctx.bezierCurveTo(15, -20, 15, -5, 0, 10);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
