import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, ChevronUp } from 'lucide-react';
import { DoodleVinyl } from './DoodleDecorations';

interface BackgroundMusicPlayerProps {
  isPlaying: boolean;
  musicUrl?: string;
  songTitle?: string;
  onTogglePlay?: (playing: boolean) => void;
  titleBanner?: React.ReactNode;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  isPlaying,
  musicUrl = '/music.mp3',
  songTitle = 'Đừng Làm Trái Tim Anh Đau - Obito (remake)',
  onTogglePlay,
  titleBanner,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [actualPlaying, setActualPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);
  const [hasEverPlayed, setHasEverPlayed] = useState(isPlaying);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const expandedCardRef = useRef<HTMLDivElement | null>(null);
  const vinylBtnRef = useRef<HTMLButtonElement | null>(null);

  // Track if music was ever played/requested so player UI never disappears on pause
  useEffect(() => {
    if (isPlaying || actualPlaying) {
      setHasEverPlayed(true);
    }
  }, [isPlaying, actualPlaying]);

  // Close expanded music card when tapping outside
  useEffect(() => {
    if (!isMusicExpanded) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        expandedCardRef.current &&
        !expandedCardRef.current.contains(target) &&
        vinylBtnRef.current &&
        !vinylBtnRef.current.contains(target)
      ) {
        setIsMusicExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMusicExpanded]);

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

  return (
    <>
      {/* Background Audio Instance (persists continuously without unmounting) */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        <source src={musicUrl} type="audio/mpeg" />
        <source src="/%C4%90%E1%BB%ABng%20L%C3%A0m%20Tr%C3%A1i%20Tim%20Anh%20%C4%90au%20-%20Obito%20(remake).mp3" type="audio/mpeg" />
      </audio>

      {/* Render player UI once music has been requested, activated, or titleBanner present */}
      {(hasEverPlayed || isPlaying || actualPlaying || needsUserInteraction || Boolean(titleBanner)) && (
        <>
          {/* ========================================================================= */}
          {/* 1. DESKTOP / TABLET LAYOUT (sm: and up): Unchanged original design        */}
          {/*    - Title banner is centered at top-4                                   */}
          {/*    - Full music player pill is fixed at top-4 right-4                    */}
          {/* ========================================================================= */}
          {titleBanner && (
            <div className="hidden sm:flex fixed top-4 left-0 right-0 z-30 flex-col items-center pointer-events-none px-4 text-center">
              {titleBanner}
            </div>
          )}

          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 hidden sm:flex items-center select-none">
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

            {/* Desktop Music Player Pill */}
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
                <div className={actualPlaying && !isMuted ? 'animate-spin-slow' : ''}>
                  <DoodleVinyl size={28} labelColor={actualPlaying ? '#C9757C' : '#91877F'} />
                </div>
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

          {/* ========================================================================= */}
          {/* 2. MOBILE LAYOUT (< sm: screen widths 320px - 639px)                      */}
          {/*    - Collapsed: Rotating vinyl toggle button + title banner in normal flow */}
          {/*    - Expanded: Full controls expand ABOVE title, title smoothly slides down*/}
          {/* ========================================================================= */}
          {titleBanner ? (
            /* MOBILE HEADER WITH TITLE BANNER (Step 3: Romance Tree & Photos) */
            <div className="fixed top-2 left-0 right-0 z-40 px-2 sm:hidden flex flex-col items-center pointer-events-none select-none">
              {/* Floating notes above mobile vinyl */}
              {actualPlaying && !isMuted && (
                <div className="relative w-full max-w-xs h-0 pointer-events-none z-10">
                  <span
                    className="absolute -top-1 left-8 text-pencil-rose text-xs animate-float-note font-serif"
                    style={{ animationDelay: '0s' }}
                  >
                    ♪
                  </span>
                  <span
                    className="absolute -top-2 left-14 text-pencil-pink text-xs animate-float-note font-serif"
                    style={{ animationDelay: '0.8s' }}
                  >
                    ♫
                  </span>
                  <span
                    className="absolute -top-1 left-11 text-pencil-gold text-[10px] animate-float-note font-serif"
                    style={{ animationDelay: '1.6s' }}
                  >
                    ♥
                  </span>
                </div>
              )}

              {/* Title & Permanent Vinyl Toggle Button Row */}
              <div className="w-full flex flex-col items-center pointer-events-auto">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {/* The Vinyl Record Button - Stays permanently visible, never disappears! */}
                  <button
                    ref={vinylBtnRef}
                    type="button"
                    onClick={() => setIsMusicExpanded((prev) => !prev)}
                    aria-label={isMusicExpanded ? 'Đóng trình phát nhạc' : 'Mở trình phát nhạc'}
                    aria-expanded={isMusicExpanded}
                    className={`inline-flex items-center gap-1.5 bg-paper-white/95 sketch-border shadow-sketch px-2.5 py-1 cursor-pointer backdrop-blur-xs transition-transform duration-200 active:scale-95 shrink-0 ${
                      needsUserInteraction ? 'ring-2 ring-pencil-rose animate-bounce' : ''
                    }`}
                    title={isMusicExpanded ? 'Chạm đĩa than để đóng trình phát nhạc' : 'Chạm đĩa than để mở trình phát nhạc'}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className={actualPlaying && !isMuted ? 'animate-spin-slow' : ''}>
                        <DoodleVinyl size={24} labelColor={actualPlaying ? '#C9757C' : '#91877F'} />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {!actualPlaying ? (
                          <Play size={8} className="text-paper-white fill-paper-white ml-0.5" />
                        ) : isMuted ? (
                          <VolumeX size={8} className="text-paper-white" />
                        ) : null}
                      </div>
                    </div>
                    <span className="font-hand font-bold text-xs text-pencil-graphite flex items-center gap-1">
                      <Music size={11} className="text-pencil-rose" />
                      {actualPlaying && !isMuted && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-pencil-rose animate-ping" />
                      )}
                    </span>
                  </button>

                  {/* Title Banner Content */}
                  <div>
                    {titleBanner}
                  </div>
                </div>

                {/* Dropdown Expanded Music Player Card (Opens/closes right beneath the header) */}
                <div
                  ref={expandedCardRef}
                  className={`w-full max-w-xs overflow-hidden transition-all duration-300 ease-in-out pointer-events-auto ${
                    isMusicExpanded
                      ? 'max-h-60 opacity-100 mt-2 pointer-events-auto'
                      : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                  }`}
                >
                  <div className="w-full bg-paper-white/98 sketch-border shadow-sketch-lg p-3 backdrop-blur-sm relative">
                    <div className="washi-tape washi-tape-pink" />

                    {/* Top Row: Song Info + Close Button */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-hand font-bold text-pencil-graphite text-xs truncate">
                          {needsUserInteraction ? 'Chạm để bật nhạc' : songTitle}
                        </p>
                        <p className="font-hand text-[10px] text-pencil-lead truncate flex items-center gap-1">
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
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsMusicExpanded(false)}
                        aria-label="Thu gọn trình phát nhạc"
                        className="text-pencil-lead hover:text-pencil-rose p-1 transition-colors"
                        title="Đóng trình phát nhạc"
                      >
                        <ChevronUp size={18} />
                      </button>
                    </div>

                    {/* Bottom Row Controls: Play/Pause and Mute */}
                    <div className="flex items-center justify-between pt-2 border-t border-pencil-graphite/15 font-hand text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle();
                        }}
                        className="flex items-center gap-1.5 text-pencil-graphite hover:text-pencil-rose transition-colors py-1 px-3 sketch-border-subtle bg-paper/60 rounded-xs active:scale-95"
                      >
                        {actualPlaying ? (
                          <>
                            <Pause size={12} className="text-pencil-rose fill-pencil-rose" />
                            <span>Tạm dừng</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} className="text-pencil-rose fill-pencil-rose" />
                            <span>Phát nhạc</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMute(e);
                        }}
                        className="flex items-center gap-1.5 text-pencil-graphite hover:text-pencil-rose transition-colors py-1 px-3 sketch-border-subtle bg-paper/60 rounded-xs active:scale-95"
                      >
                        {isMuted ? (
                          <>
                            <VolumeX size={14} className="text-pencil-rose" />
                            <span>Bật tiếng</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={14} className="text-pencil-lead" />
                            <span>Tắt tiếng</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MOBILE HEADER WITHOUT TITLE BANNER (Step 2: Love Messages) */
            <div className="fixed top-2 right-2 z-50 sm:hidden select-none flex flex-col items-end">
              <button
                ref={vinylBtnRef}
                type="button"
                onClick={() => setIsMusicExpanded((prev) => !prev)}
                aria-label={isMusicExpanded ? 'Đóng trình phát nhạc' : 'Mở trình phát nhạc'}
                aria-expanded={isMusicExpanded}
                className={`flex items-center gap-1.5 bg-paper-white/95 sketch-border shadow-sketch px-2.5 py-1 cursor-pointer backdrop-blur-xs transition-transform duration-200 active:scale-95 ${
                  needsUserInteraction ? 'ring-2 ring-pencil-rose animate-bounce' : ''
                }`}
                title={isMusicExpanded ? 'Chạm đĩa than để đóng trình phát nhạc' : 'Chạm đĩa than để mở trình phát nhạc'}
              >
                <div className="relative flex items-center justify-center">
                  <div className={actualPlaying && !isMuted ? 'animate-spin-slow' : ''}>
                    <DoodleVinyl size={24} labelColor={actualPlaying ? '#C9757C' : '#91877F'} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {!actualPlaying ? (
                      <Play size={8} className="text-paper-white fill-paper-white ml-0.5" />
                    ) : isMuted ? (
                      <VolumeX size={8} className="text-paper-white" />
                    ) : null}
                  </div>
                </div>
                <span className="font-hand font-bold text-xs text-pencil-graphite flex items-center gap-1">
                  <Music size={11} className="text-pencil-rose" />
                  {actualPlaying && !isMuted && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-pencil-rose animate-ping" />
                  )}
                </span>
              </button>

              <div
                ref={expandedCardRef}
                className={`w-64 bg-paper-white/95 sketch-border shadow-sketch-lg p-2.5 backdrop-blur-xs relative transition-all duration-300 ease-in-out mt-1.5 ${
                  isMusicExpanded ? 'max-h-56 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-hand font-bold text-pencil-graphite text-xs truncate">
                      {needsUserInteraction ? 'Chạm để bật nhạc' : songTitle}
                    </p>
                    <p className="font-hand text-[10px] text-pencil-lead truncate">
                      {actualPlaying && !isMuted ? 'Đang phát...' : 'Đã tạm dừng'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsMusicExpanded(false)}
                    aria-label="Thu gọn"
                    className="text-pencil-lead hover:text-pencil-rose p-0.5"
                  >
                    <ChevronUp size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-pencil-graphite/15 font-hand text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle();
                    }}
                    className="text-pencil-graphite hover:text-pencil-rose px-2 py-0.5 sketch-border-subtle"
                  >
                    {actualPlaying ? 'Tạm dừng' : 'Phát'}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMute(e);
                    }}
                    className="text-pencil-graphite hover:text-pencil-rose px-2 py-0.5 sketch-border-subtle"
                  >
                    {isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};
