import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PencilButton } from '../ui/PencilButton';
import { DoodleHeart, DoodleFlower, DoodleLeaf, DoodlePencil } from '../ui/DoodleDecorations';
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BalloonGameProps {
  onComplete: () => void;
  targetScore?: number;
}

interface Balloon {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobblePhase: number;
  popped: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
}

export const BalloonGame: React.FC<BalloonGameProps> = ({
  onComplete,
  targetScore = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPageFlipping, setIsPageFlipping] = useState(false);

  // Audio Context for synthetic gentle pop sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playPopSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio not permitted or supported
    }
  }, [soundEnabled]);

  const balloonColors = [
    '#DDA0A5', // pink
    '#C9757C', // rose
    '#A9B99A', // sage
    '#899873', // olive
    '#E1C17A', // gold
    '#C8B4D4', // lavender
    '#B7D0D8', // sky
  ];

  // Game loop states
  const balloonsRef = useRef<Balloon[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const nextIdRef = useRef(1);
  const completedRef = useRef(false);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Main canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let spawnTimer: NodeJS.Timeout;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn a new hand-drawn sketch balloon
    const spawnBalloon = () => {
      if (completedRef.current) return;
      const width = canvas.width;
      const height = canvas.height;
      if (balloonsRef.current.length >= 8) return;

      const radius = 28 + Math.random() * 14;
      const speedBase = 1.0 + (scoreRef.current / targetScore) * 1.2;

      balloonsRef.current.push({
        id: nextIdRef.current++,
        x: radius + Math.random() * (width - radius * 2),
        y: height + radius + 10,
        radius,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        speedY: speedBase + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.6,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobblePhase: Math.random() * Math.PI * 2,
        popped: false,
      });

      // Gradually decrease spawn delay as score rises
      const delay = Math.max(700, 1500 - scoreRef.current * 45);
      spawnTimer = setTimeout(spawnBalloon, delay);
    };

    spawnBalloon();

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Balloons
      for (let i = balloonsRef.current.length - 1; i >= 0; i--) {
        const b = balloonsRef.current[i];
        if (b.popped) {
          balloonsRef.current.splice(i, 1);
          continue;
        }

        b.y -= b.speedY;
        b.wobblePhase += b.wobbleSpeed;
        const currentX = b.x + Math.sin(b.wobblePhase) * 12;

        // Remove if off screen
        if (b.y < -b.radius * 2) {
          balloonsRef.current.splice(i, 1);
          continue;
        }

        // Draw balloon with colored pencil texture & imperfect sketch outline
        ctx.save();
        ctx.translate(currentX, b.y);

        // Balloon string (dây buộc nguệch ngoạc)
        ctx.beginPath();
        ctx.moveTo(0, b.radius * 1.2);
        ctx.quadraticCurveTo(
          Math.sin(b.wobblePhase) * 10,
          b.radius * 1.8,
          Math.cos(b.wobblePhase) * 6,
          b.radius * 2.6
        );
        ctx.strokeStyle = '#5E514B';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 1]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Balloon body (oval with slight bottom taper)
        ctx.beginPath();
        ctx.moveTo(0, -b.radius * 1.2);
        ctx.bezierCurveTo(b.radius * 1.1, -b.radius * 1.2, b.radius * 1.15, b.radius * 0.7, 0, b.radius * 1.2);
        ctx.bezierCurveTo(-b.radius * 1.15, b.radius * 0.7, -b.radius * 1.1, -b.radius * 1.2, 0, -b.radius * 1.2);
        
        ctx.fillStyle = b.color;
        ctx.fill();

        // Graphite outline (nét viền chì không đều)
        ctx.strokeStyle = '#5E514B';
        ctx.lineWidth = 2.0;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Colored pencil hatch highlight on top-left
        ctx.beginPath();
        ctx.arc(-b.radius * 0.35, -b.radius * 0.45, b.radius * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFDF8';
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Balloon knot at bottom
        ctx.beginPath();
        ctx.moveTo(-4, b.radius * 1.2);
        ctx.lineTo(4, b.radius * 1.2);
        ctx.lineTo(0, b.radius * 1.35);
        ctx.closePath();
        ctx.fillStyle = '#5E514B';
        ctx.fill();

        ctx.restore();
      }

      // Render Particles (vụn màu chì khi nổ)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#5E514B';
        ctx.lineWidth = 0.8;

        // Irregular pencil flake shape
        ctx.beginPath();
        ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(spawnTimer);
      window.removeEventListener('resize', resize);
    };
  }, [targetScore]);

  // Click & Touch hit detection
  const handleInteraction = (clientX: number, clientY: number) => {
    if (completedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Check hit on balloons (top-most first)
    for (let i = balloonsRef.current.length - 1; i >= 0; i--) {
      const b = balloonsRef.current[i];
      if (b.popped) continue;

      const currentX = b.x + Math.sin(b.wobblePhase) * 12;
      const dist = Math.hypot(x - currentX, y - b.y);

      // Generous hit box for pleasant mobile experience
      if (dist <= b.radius * 1.35) {
        b.popped = true;
        playPopSound();

        // Spawn colored pencil flakes
        for (let j = 0; j < 14; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3.5;
          particlesRef.current.push({
            x: currentX,
            y: b.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: b.color,
            size: 3 + Math.random() * 5,
            alpha: 1,
            rotation: Math.random() * Math.PI,
          });
        }

        // Increment Score
        setScore((prev) => {
          const nextScore = prev + 1;
          if (nextScore >= targetScore && !completedRef.current) {
            completedRef.current = true;
            handleGameWin();
          }
          return nextScore;
        });

        break;
      }
    }
  };

  const handleGameWin = () => {
    setIsCompleted(true);
    // Soft confetti in pencil colors
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#DDA0A5', '#C9757C', '#A9B99A', '#E1C17A', '#C8B4D4'],
    });

    // Page flip transition after 1.8s
    setTimeout(() => {
      setIsPageFlipping(true);
      setTimeout(() => {
        onComplete();
      }, 700);
    }, 1600);
  };

  const restartGame = () => {
    completedRef.current = false;
    balloonsRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setIsCompleted(false);
    setIsPageFlipping(false);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[580px] flex flex-col items-center justify-between overflow-hidden select-none ${
        isPageFlipping ? 'page-turn-exit' : ''
      }`}
    >
      {/* Top Sketchbook Bar: Score & Sound Toggle */}
      <div className="w-full max-w-xl mx-auto px-4 pt-4 flex items-center justify-between z-20">
        {/* Handwritten Score Pad */}
        <div className="bg-paper-white sketch-border shadow-sketch px-4 py-2 flex items-center gap-2 transform -rotate-1">
          <DoodlePencil size={20} />
          <span className="font-hand font-bold text-lg sm:text-xl text-pencil-graphite">
            Điểm: {score}/{targetScore}
          </span>
          <DoodleHeart size={16} fill={score >= targetScore ? '#C9757C' : '#DDA0A5'} />
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-paper-white sketch-btn p-2 text-pencil-graphite hover:text-pencil-rose flex items-center gap-1.5"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="font-hand text-xs hidden sm:inline">
            {soundEnabled ? 'Âm thanh bật' : 'Âm thanh tắt'}
          </span>
        </button>
      </div>

      {/* Center Instruction Banner (Fades out as game progresses) */}
      {score < 4 && !isCompleted && (
        <div className="z-10 bg-paper-white/90 sketch-border shadow-sketch px-6 py-2.5 my-auto text-center animate-bounce pointer-events-none">
          <p className="font-hand text-pencil-graphite text-lg sm:text-xl">
            ✨ Chạm để làm vỡ 20 quả bóng kỷ niệm nhé!
          </p>
        </div>
      )}

      {/* Completion Modal / Celebration */}
      {isCompleted && (
        <div className="z-20 bg-paper-white sketch-border shadow-sketch-lg p-6 sm:p-8 text-center max-w-md mx-4 animate-float">
          <div className="washi-tape washi-tape-pink" />
          <div className="flex justify-center mb-2">
            <Sparkles className="w-8 h-8 text-pencil-gold animate-spin" />
          </div>
          <h3 className="font-serif italic font-bold text-2xl text-pencil-rose mb-2">
            Tuyệt vời! 20/20 điểm!
          </h3>
          <p className="font-hand text-pencil-graphite text-lg mb-4">
            Trang giấy tình yêu đang được lật mở dành riêng cho em...
          </p>
          <div className="flex items-center justify-center gap-3">
            <PencilButton variant="paper" size="sm" onClick={restartGame} icon={<RefreshCw size={14} />}>
              Chơi lại
            </PencilButton>
            <PencilButton variant="rose" size="sm" onClick={onComplete}>
              Xem lời chúc ngay
            </PencilButton>
          </div>
        </div>
      )}

      {/* Interactive 2D Canvas for Balloons */}
      <canvas
        ref={canvasRef}
        onClick={(e) => handleInteraction(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        className="absolute inset-0 w-full h-full cursor-pointer z-0 touch-none"
      />

      {/* Bottom Corner Sketchbook Doodles */}
      <div className="w-full max-w-xl mx-auto px-4 pb-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 opacity-60">
          <DoodleLeaf size={20} fill="#A9B99A" />
          <span className="font-hand text-xs text-pencil-lead">Tập trung vẽ những điều yêu thích...</span>
        </div>
        <DoodleFlower size={22} petalColor="#DDA0A5" />
      </div>
    </div>
  );
};
