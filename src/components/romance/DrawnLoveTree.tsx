import React, { useEffect, useRef, useState, useMemo } from 'react';
import { DoodleHeart } from '../ui/DoodleDecorations';

interface DrawnLoveTreeProps {
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
  className?: string;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  phase: number;
}

export const DrawnLoveTree: React.FC<DrawnLoveTreeProps> = ({
  onAnimationComplete,
  skipAnimation = false,
  className = '',
}) => {
  // Stages: 0: initial sketch, 1: trunk/main branches, 2: twigs & foliage, 3: full bloom & floating petals
  const [stage, setStage] = useState<number>(skipAnimation ? 3 : 0);
  const [trunkProgress, setTrunkProgress] = useState<number>(skipAnimation ? 1 : 0);
  const [branchesProgress, setBranchesProgress] = useState<number>(skipAnimation ? 1 : 0);
  const [bloomsProgress, setBloomsProgress] = useState<number>(skipAnimation ? 1 : 0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating petals colors (colored pencil tones)
  const petalColors = useMemo(
    () => ['#DDA0A5', '#C9757C', '#F4C2C6', '#E1C17A', '#C8B4D4', '#A9B99A'],
    []
  );

  // Staged drawing animation sequence
  useEffect(() => {
    if (skipAnimation) {
      setStage(3);
      setTrunkProgress(1);
      setBranchesProgress(1);
      setBloomsProgress(1);
      onAnimationComplete?.();
      return;
    }

    // Stage 1: Draw Trunk (0s - 1.8s)
    const t1 = setTimeout(() => {
      setStage(1);
      const start = Date.now();
      const dur = 1800;
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const p = Math.min(1, elapsed / dur);
        setTrunkProgress(p);
        if (p >= 1) clearInterval(interval);
      }, 16);
    }, 400);

    // Stage 2: Draw Branches & Guide lines (1.6s - 3.2s)
    const t2 = setTimeout(() => {
      setStage(2);
      const start = Date.now();
      const dur = 1600;
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const p = Math.min(1, elapsed / dur);
        setBranchesProgress(p);
        if (p >= 1) clearInterval(interval);
      }, 16);
    }, 1800);

    // Stage 3: Bloom leaves, flowers & heart canopy (3.2s - 4.8s)
    const t3 = setTimeout(() => {
      setStage(3);
      const start = Date.now();
      const dur = 1600;
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const p = Math.min(1, elapsed / dur);
        setBloomsProgress(p);
        if (p >= 1) {
          clearInterval(interval);
          onAnimationComplete?.();
        }
      }, 16);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [skipAnimation, onAnimationComplete]);

  // Canvas 2D: Falling & swirling floating petals when in Stage 3
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    // Spawn 28 romantic floating petals
    const petals: Petal[] = Array.from({ length: 28 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      size: 4 + Math.random() * 6,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      speedY: 0.6 + Math.random() * 1.0,
      speedX: (Math.random() - 0.45) * 0.8,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2.5,
      opacity: 0.4 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Only draw floating petals if stage >= 2
      if (stage >= 2) {
        petals.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(p.phase) * 0.6;
          p.rotation += p.rotSpeed;
          p.phase += 0.02;

          // Recycle petals to top
          if (p.y > height + 20) {
            p.y = -20;
            p.x = width * 0.3 + Math.random() * (width * 0.4);
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity * bloomsProgress;

          // Hand-drawn petal shape: curved droplet/heart petal
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.6, p.size * 0.9, p.size * 0.4, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.9, p.size * 0.4, -p.size * 0.8, -p.size * 0.6, 0, -p.size);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Subtle graphite outline for sketch effect
          ctx.strokeStyle = '#5E514B';
          ctx.lineWidth = 0.7;
          ctx.stroke();

          ctx.restore();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [stage, bloomsProgress, petalColors]);

  return (
    <div className={`relative w-full max-w-[620px] aspect-square mx-auto flex items-center justify-center select-none ${className}`}>
      {/* Background Soft Graphite Paper Aura */}
      <div className="absolute inset-0 rounded-full bg-radial from-pencil-pink/10 via-pencil-gold/5 to-transparent pointer-events-none -z-10" />

      {/* Main SVG: Hand-drawn Pencil & Colored Pencil Tree */}
      <svg
        viewBox="0 0 600 600"
        className="w-full h-full overflow-visible animate-sway"
        style={{ transformOrigin: 'bottom center' }}
      >
        <defs>
          {/* Colored pencil gradient for foliage heart clusters */}
          <linearGradient id="foliage-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDA0A5" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#C9757C" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="foliage-sage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A9B99A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#899873" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="foliage-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E1C17A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#DDA0A5" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* FAINT PENCIL SKETCH GUIDE LINES (Retained like real sketchbook) */}
        {/* ======================================================== */}
        <g stroke="#91877F" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" fill="none">
          {/* Subtle Heart Canopy Guide Arc */}
          <path d="M 300,530 C 230,440 100,320 120,180 C 135,70 240,65 300,150 C 360,65 465,70 480,180 C 500,320 370,440 300,530 Z" />
          {/* Ground sketch lines */}
          <path d="M 180,545 Q 300,535 420,545" />
          <path d="M 210,555 Q 300,548 390,555" />
        </g>

        {/* ======================================================== */}
        {/* GIAI ĐOẠN A: TRUNK & ROOTS (Bút chì graphite) */}
        {/* ======================================================== */}
        <g style={{ opacity: stage >= 1 ? 1 : 0, transition: 'opacity 0.4s' }}>
          {/* Roots branching into ground */}
          <path
            d="M 300,540 C 280,545 250,552 220,556 M 300,540 C 320,545 350,552 380,555 M 300,535 C 290,548 275,560 260,565"
            stroke="#5E514B"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 300 * (1 - trunkProgress),
            }}
          />

          {/* Main Solid Trunk with natural woody curve */}
          <path
            d="M 278,540 C 282,470 270,410 286,350 C 292,320 285,280 270,240
               C 275,235 285,245 292,260 C 298,280 302,305 302,325
               C 302,305 305,275 320,240 C 326,245 328,255 322,275
               C 314,310 322,345 316,400 C 324,460 320,500 324,540 Z"
            fill="#5E514B"
            stroke="#3A322D"
            strokeWidth="1.8"
            strokeLinejoin="round"
            style={{
              transform: `scaleY(${Math.max(0.01, trunkProgress)})`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.1s linear',
            }}
          />

          {/* Bark texture & graphite hatching inside trunk */}
          <g
            stroke="#FAF6ED"
            strokeWidth="0.8"
            opacity="0.35"
            strokeLinecap="round"
            style={{ opacity: trunkProgress > 0.6 ? 0.4 : 0 }}
          >
            <path d="M 288,510 Q 293,460 290,410" />
            <path d="M 302,520 Q 306,470 304,420" />
            <path d="M 312,505 Q 315,455 311,395" />
            <path d="M 292,400 Q 296,360 292,340" />
            <path d="M 308,390 Q 310,350 306,330" />
          </g>
        </g>

        {/* ======================================================== */}
        {/* GIAI ĐOẠN B: BRANCHES & BOUGHS (Cành chính & Cành phụ) */}
        {/* ======================================================== */}
        <g
          stroke="#5E514B"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            strokeDasharray: 400,
            strokeDashoffset: 400 * (1 - branchesProgress),
            transition: 'opacity 0.3s ease-in',
          }}
        >
          {/* Left Main Branch arching up toward heart lobe */}
          <path d="M 284,330 C 240,300 200,270 180,220 C 165,185 175,140 215,120" strokeWidth="3.5" />
          <path d="M 215,280 C 180,260 150,225 140,185 C 135,160 150,140 170,135" strokeWidth="2.2" />
          <path d="M 180,220 C 185,190 200,165 235,150" strokeWidth="2" />
          <path d="M 245,210 C 235,170 245,130 270,110" strokeWidth="1.8" />
          <path d="M 270,240 C 270,195 280,160 295,145" strokeWidth="2" />

          {/* Right Main Branch arching up toward heart lobe */}
          <path d="M 314,330 C 360,300 400,270 420,220 C 435,185 425,140 385,120" strokeWidth="3.5" />
          <path d="M 385,280 C 420,260 450,225 460,185 C 465,160 450,140 430,135" strokeWidth="2.2" />
          <path d="M 420,220 C 415,190 400,165 365,150" strokeWidth="2" />
          <path d="M 355,210 C 365,170 355,130 330,110" strokeWidth="1.8" />
          <path d="M 330,240 C 330,195 320,160 305,145" strokeWidth="2" />

          {/* Center Heart Cleavage Twigs */}
          <path d="M 300,260 C 298,210 300,170 300,130" strokeWidth="2" />
          <path d="M 295,180 C 285,160 280,140 285,125" strokeWidth="1.5" />
          <path d="M 305,180 C 315,160 320,140 315,125" strokeWidth="1.5" />
        </g>

        {/* ======================================================== */}
        {/* GIAI ĐOẠN C: CANOPY FOLIAGE & COLORED PENCIL BLOOMS */}
        {/* ======================================================== */}
        <g
          style={{
            opacity: stage >= 3 ? bloomsProgress : 0,
            transform: `scale(${0.6 + 0.4 * bloomsProgress})`,
            transformOrigin: '300px 240px',
            transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Soft Colored Pencil Foliage Clouds (Forming the Heart silhouette) */}
          {/* Left Heart Lobe */}
          <circle cx="210" cy="170" r="75" fill="url(#foliage-rose)" filter="url(#pencil-stroke)" opacity="0.65" />
          <circle cx="160" cy="210" r="55" fill="url(#foliage-gold)" filter="url(#pencil-stroke)" opacity="0.6" />
          <circle cx="255" cy="130" r="65" fill="url(#foliage-sage)" filter="url(#pencil-stroke)" opacity="0.6" />
          <circle cx="180" cy="260" r="50" fill="url(#foliage-rose)" filter="url(#pencil-stroke)" opacity="0.55" />

          {/* Right Heart Lobe */}
          <circle cx="390" cy="170" r="75" fill="url(#foliage-rose)" filter="url(#pencil-stroke)" opacity="0.65" />
          <circle cx="440" cy="210" r="55" fill="url(#foliage-gold)" filter="url(#pencil-stroke)" opacity="0.6" />
          <circle cx="345" cy="130" r="65" fill="url(#foliage-sage)" filter="url(#pencil-stroke)" opacity="0.6" />
          <circle cx="420" cy="260" r="50" fill="url(#foliage-rose)" filter="url(#pencil-stroke)" opacity="0.55" />

          {/* Center Heart Lobe */}
          <circle cx="300" cy="200" r="70" fill="url(#foliage-rose)" filter="url(#pencil-stroke)" opacity="0.6" />
          <circle cx="300" cy="140" r="55" fill="url(#foliage-gold)" filter="url(#pencil-stroke)" opacity="0.6" />

          {/* ======================================================== */}
          {/* HAND-DRAWN LEAVES WITH PENCIL VEINS */}
          {/* ======================================================== */}
          <g stroke="#5E514B" strokeWidth="1.2">
            {/* Cluster of leaves across branches */}
            {[
              { x: 150, y: 170, r: -35, fill: '#A9B99A' },
              { x: 190, y: 130, r: 20, fill: '#899873' },
              { x: 230, y: 110, r: -15, fill: '#A9B99A' },
              { x: 270, y: 125, r: 40, fill: '#A9B99A' },
              { x: 330, y: 125, r: -40, fill: '#A9B99A' },
              { x: 370, y: 110, r: 15, fill: '#899873' },
              { x: 410, y: 130, r: -20, fill: '#A9B99A' },
              { x: 450, y: 170, r: 35, fill: '#899873' },
              { x: 430, y: 230, r: 60, fill: '#A9B99A' },
              { x: 170, y: 230, r: -60, fill: '#899873' },
              { x: 210, y: 260, r: 10, fill: '#A9B99A' },
              { x: 390, y: 260, r: -10, fill: '#A9B99A' },
            ].map((leaf, idx) => (
              <g key={idx} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.r})`}>
                <path
                  d="M0,0 C8,-12 24,-10 28,0 C24,10 8,12 0,0 Z"
                  fill={leaf.fill}
                />
                <line x1="0" y1="0" x2="24" y2="0" strokeWidth="0.8" />
              </g>
            ))}
          </g>

          {/* ======================================================== */}
          {/* HAND-DRAWN 5-PETAL BLOSSOMS & HEART FLOWERS */}
          {/* ======================================================== */}
          <g>
            {[
              { x: 210, y: 165, size: 26, petal: '#DDA0A5', center: '#E1C17A' },
              { x: 250, y: 140, size: 22, petal: '#C9757C', center: '#FFFDF8' },
              { x: 170, y: 195, size: 24, petal: '#C8B4D4', center: '#E1C17A' },
              { x: 140, y: 220, size: 20, petal: '#DDA0A5', center: '#E1C17A' },
              { x: 300, y: 150, size: 28, petal: '#C9757C', center: '#FFFDF8' },
              { x: 350, y: 140, size: 22, petal: '#DDA0A5', center: '#E1C17A' },
              { x: 390, y: 165, size: 26, petal: '#C8B4D4', center: '#E1C17A' },
              { x: 430, y: 195, size: 24, petal: '#DDA0A5', center: '#FFFDF8' },
              { x: 460, y: 220, size: 20, petal: '#C9757C', center: '#E1C17A' },
              { x: 200, y: 240, size: 22, petal: '#E1C17A', center: '#5E514B' },
              { x: 400, y: 240, size: 22, petal: '#E1C17A', center: '#5E514B' },
              { x: 260, y: 220, size: 20, petal: '#DDA0A5', center: '#C9757C' },
              { x: 340, y: 220, size: 20, petal: '#C8B4D4', center: '#C9757C' },
            ].map((fl, i) => (
              <g key={i} transform={`translate(${fl.x - fl.size / 2}, ${fl.y - fl.size / 2})`}>
                {/* 5 Petals */}
                <circle cx={fl.size / 2} cy={fl.size * 0.25} r={fl.size * 0.25} fill={fl.petal} stroke="#5E514B" strokeWidth="1.2" />
                <circle cx={fl.size * 0.75} cy={fl.size * 0.4} r={fl.size * 0.25} fill={fl.petal} stroke="#5E514B" strokeWidth="1.2" />
                <circle cx={fl.size * 0.65} cy={fl.size * 0.75} r={fl.size * 0.25} fill={fl.petal} stroke="#5E514B" strokeWidth="1.2" />
                <circle cx={fl.size * 0.35} cy={fl.size * 0.75} r={fl.size * 0.25} fill={fl.petal} stroke="#5E514B" strokeWidth="1.2" />
                <circle cx={fl.size * 0.25} cy={fl.size * 0.4} r={fl.size * 0.25} fill={fl.petal} stroke="#5E514B" strokeWidth="1.2" />
                {/* Center */}
                <circle cx={fl.size / 2} cy={fl.size / 2} r={fl.size * 0.18} fill={fl.center} stroke="#5E514B" strokeWidth="1.2" />
              </g>
            ))}

            {/* Little Heart Fruits / Blossoms dangling from branches */}
            {[
              { x: 180, y: 265, s: 18, c: '#C9757C' },
              { x: 235, y: 185, s: 16, c: '#DDA0A5' },
              { x: 300, y: 110, s: 22, c: '#C9757C' },
              { x: 365, y: 185, s: 16, c: '#DDA0A5' },
              { x: 420, y: 265, s: 18, c: '#C9757C' },
            ].map((h, i) => (
              <g key={`heart-${i}`} transform={`translate(${h.x - h.s / 2}, ${h.y - h.s / 2})`}>
                <DoodleHeart size={h.s} fill={h.c} />
              </g>
            ))}
          </g>
        </g>

        {/* ======================================================== */}
        {/* GROUND SKETCH DETAILS: Grass tufts & tiny daisies */}
        {/* ======================================================== */}
        <g stroke="#5E514B" strokeWidth="1.4" strokeLinecap="round" fill="none">
          {/* Grass Tufts */}
          <path d="M 230,545 C 228,535 220,530 215,532 M 230,545 C 232,532 236,528 238,530" stroke="#899873" />
          <path d="M 250,548 C 248,536 242,532 238,535 M 250,548 C 253,534 258,530 262,533" stroke="#899873" />
          <path d="M 350,548 C 348,536 342,532 338,535 M 350,548 C 353,534 358,530 362,533" stroke="#899873" />
          <path d="M 370,545 C 368,535 362,530 358,532 M 370,545 C 372,532 376,528 380,530" stroke="#899873" />
        </g>
      </svg>

      {/* Floating Canvas Petals Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Small Hand-drawn Artist Note at base */}
      <div className="absolute bottom-1 font-hand text-pencil-lead text-xs sm:text-sm tracking-wider opacity-60 flex items-center gap-1.5">
        <span>Cây Tình Yêu — phác họa bằng chì & ngàn lời thương</span>
        <DoodleHeart size={14} fill="#C9757C" />
      </div>
    </div>
  );
};
