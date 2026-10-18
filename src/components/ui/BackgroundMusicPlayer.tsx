import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { DoodleVinyl, DoodleHeart } from './DoodleDecorations';

interface BackgroundMusicPlayerProps {
  isPlaying: boolean;
  musicUrl?: string;
  songTitle?: string;
  onTogglePlay?: (playing: boolean) => void;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  isPlaying,
  musicUrl = '/music.mp3',
  songTitle = 'Đừng Làm Trái Tim Anh Đau - Obito (remake)',
  onTogglePlay,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [actualPlaying, setActualPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth Volume Fade In (from 0 to targetVolume over 1.5s)
  const fadeIn = useCallback((targetVolume = 0.7, durationMs = 1500) => {
    if (!audioRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audioRef.current.volume = 0;
    const stepTime = 50;
    const stepCount = durationMs / stepTime;
    const stepVolume = targetVolume / stepCount;
    let currentVol = 0;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        return;
      }
      currentVol = Math.min(targetVolume, currentVol + stepVolume);
      audioRef.current.volume = currentVol;
      if (currentVol >= targetVolume) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      }
    }, stepTime);
  }, []);

  // Play audio safely with browser autoplay policy handling
  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.muted = isMuted;
      audio.loop = true;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
        setActualPlaying(true);
        setNeedsUserInteraction(false);
        fadeIn(0.75, 1200);
      }
    } catch (err: any) {
      console.warn('[MusicPlayer] Autoplay was prevented by browser policy:', err?.message);
      setActualPlaying(false);
      setNeedsUserInteraction(true);
    }
  }, [fadeIn, isMuted]);

  // Pause audio safely
  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    audio.pause();
    setActualPlaying(false);
  }, []);

  // React to prop `isPlaying`
  useEffect(() => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  // If autoplay was blocked, any click/tap on the document unlocks audio
  useEffect(() => {
    if (!needsUserInteraction || !isPlaying) return;

    const handleUnlock = () => {
      if (audioRef.current && isPlaying) {
        playAudio();
      }
    };

    window.addEventListener('click', handleUnlock, { once: true });
    window.addEventListener('touchstart', handleUnlock, { once: true });

    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
    };
  }, [needsUserInteraction, isPlaying, playAudio]);

  // Manual Toggle Play/Pause
  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (actualPlaying) {
      pauseAudio();
      onTogglePlay?.(false);
    } else {
      playAudio();
      onTogglePlay?.(true);
    }
  };

  // Toggle Mute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const newMute = !isMuted;
    audioRef.current.muted = newMute;
    setIsMuted(newMute);
  };

  // Only render floating player once music has been requested (step === 'messages' or 'tree')
  if (!isPlaying && !actualPlaying && !needsUserInteraction) {
    return (
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        <source src={musicUrl} type="audio/mpeg" />
        <source src="/%C4%90%E1%BB%ABng%20L%C3%A0m%20Tr%C3%A1i%20Tim%20Anh%20%C4%90au%20-%20Obito%20(remake).mp3" type="audio/mpeg" />
      </audio>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        <source src={musicUrl} type="audio/mpeg" />
        <source src="/%C4%90%E1%BB%ABng%20L%C3%A0m%20Tr%C3%A1i%20Tim%20Anh%20%C4%90au%20-%20Obito%20(remake).mp3" type="audio/mpeg" />
      </audio>

      {/* Floating Sketchbook Music Player Pill */}
      <div
        className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex items-center select-none"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Floating animated music notes when playing */}
        {actualPlaying && !isMuted && (
          <div className="absolute -top-3 left-2 pointer-events-none z-10">
            <span
              className="absolute text-pencil-rose text-xs animate-float-note font-serif"
              style={{ animationDelay: '0s', left: '-6px' }}
            >
              ♪
            </span>
            <span
              className="absolute text-pencil-pink text-xs animate-float-note font-serif"
              style={{ animationDelay: '0.8s', left: '10px' }}
            >
              ♫
            </span>
            <span
              className="absolute text-pencil-gold text-[10px] animate-float-note font-serif"
              style={{ animationDelay: '1.6s', left: '4px' }}
            >
              ♥
            </span>
          </div>
        )}

        {/* Player Container */}
        <div
          onClick={handleToggle}
          role="button"
          tabIndex={0}
          title={actualPlaying ? 'Nhấn để tạm dừng nhạc' : 'Nhấn để bật nhạc'}
          className={`flex items-center gap-2 bg-paper-white/95 sketch-border shadow-sketch px-3 py-1.5 cursor-pointer backdrop-blur-xs transition-all duration-300 hover:scale-102 ${
            needsUserInteraction ? 'ring-2 ring-pencil-rose animate-bounce' : ''
          }`}
        >
          {/* Hand-drawn Vinyl Icon (Spins when playing) */}
          <div className="relative flex items-center justify-center">
            <div className={`${actualPlaying && !isMuted ? 'animate-spin-slow' : ''}`}>
              <DoodleVinyl size={28} labelColor={actualPlaying ? '#C9757C' : '#91877F'} />
            </div>
            {/* Center play/pause indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {!actualPlaying ? (
                <Play size={10} className="text-paper-white fill-paper-white ml-0.5" />
              ) : isMuted ? (
                <VolumeX size={10} className="text-paper-white" />
              ) : null}
            </div>
          </div>

          {/* Song Info & Text */}
          <div className="flex flex-col text-left max-w-[140px] sm:max-w-[190px]">
            <div className="flex items-center gap-1">
              <span className="font-hand font-bold text-pencil-graphite text-xs sm:text-sm truncate">
                {needsUserInteraction ? 'Chạm để bật nhạc' : songTitle}
              </span>
            </div>
            <span className="font-hand text-[10px] text-pencil-lead truncate flex items-center gap-1">
              {actualPlaying && !isMuted ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-pencil-rose animate-ping" />
                  <span>Đang phát lặp lại...</span>
                </>
              ) : isMuted ? (
                <span>Đã tắt tiếng</span>
              ) : (
                <span>Đã tạm dừng</span>
              )}
            </span>
          </div>

          {/* Quick Mute Toggle Button */}
          <button
            onClick={handleToggleMute}
            className="p-1 rounded-full text-pencil-lead hover:text-pencil-rose transition-colors ml-1"
            title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
            aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
          >
            {isMuted ? (
              <VolumeX size={16} className="text-pencil-rose" />
            ) : (
              <Volume2 size={16} className={actualPlaying ? 'text-pencil-graphite' : 'text-pencil-lead'} />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
