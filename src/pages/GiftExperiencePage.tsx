import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GiftData, ExperienceStep } from '../types';
import { DEFAULT_MOCK_GIFT } from '../data/mockGift';
import { BalloonGame } from '../components/game/BalloonGame';
import { LoveMessages } from '../components/romance/LoveMessages';
import { RomanceExperience } from '../components/romance/RomanceExperience';
import { DoodleHeart, DoodleFlower } from '../components/ui/DoodleDecorations';
import { BackgroundMusicPlayer } from '../components/ui/BackgroundMusicPlayer';
import { giftService } from '../services/gifts';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const GiftExperiencePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ExperienceStep>('game');
  const [musicPlaying, setMusicPlaying] = useState(false);

  const handleGameComplete = () => {
    setCurrentStep('messages');
    setMusicPlaying(true);
  };

  const handleReplay = () => {
    setCurrentStep('game');
    setMusicPlaying(false);
  };

  const fetchGift = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      if (!slug || slug === 'demo' || slug === 'love-demo') {
        // Explicit demo route
        setGift(DEFAULT_MOCK_GIFT);
      } else {
        // Real MongoDB Atlas record fetched from backend API
        const data = await giftService.getGiftBySlug(slug);
        if (data) {
          setGift(data);
        } else {
          setGift(null);
          setErrorMessage('Không tìm thấy cuốn sổ quà tặng này trong hệ thống.');
        }
      }
    } catch (err: any) {
      console.error('Error fetching gift from MongoDB Atlas backend:', err);
      if (err.message === 'GIFT_NOT_FOUND') {
        setErrorMessage('Không tìm thấy cuốn sổ quà tặng này. Vui lòng kiểm tra lại đường dẫn.');
      } else {
        setErrorMessage(
          err.message || 'Không thể kết nối đến máy chủ để tải dữ liệu món quà. Vui lòng thử lại sau.'
        );
      }
      setGift(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGift();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen h-[100dvh] bg-paper flex flex-col items-center justify-center p-4">
        <div className="bg-paper-white sketch-border shadow-sketch p-8 text-center max-w-sm">
          <Loader2 className="w-8 h-8 text-pencil-rose animate-spin mx-auto mb-3" />
          <p className="font-hand text-pencil-graphite text-lg">
            Đang mở cuốn sổ phác thảo...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !gift) {
    return (
      <div className="min-h-screen h-[100dvh] bg-paper flex flex-col items-center justify-center p-4">
        <div className="bg-paper-white sketch-border shadow-sketch p-8 text-center max-w-md w-full animate-float">
          <div className="w-12 h-12 rounded-full bg-pencil-rose/10 flex items-center justify-center text-pencil-rose mx-auto mb-3">
            <AlertCircle size={28} />
          </div>
          <h3 className="font-serif italic font-bold text-xl text-pencil-rose mb-2">
            Không Thể Mở Món Quà
          </h3>
          <p className="font-hand text-pencil-graphite text-base mb-6">
            {errorMessage || 'Không tìm thấy cuốn sổ quà tặng này trong cơ sở dữ liệu.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={fetchGift}
              className="sketch-btn bg-paper-white text-pencil-graphite px-4 py-2 font-hand text-sm flex items-center gap-1.5 hover:text-pencil-rose"
            >
              <RefreshCw size={14} />
              <span>Thử tải lại</span>
            </button>
            <button
              onClick={() => navigate('/create')}
              className="sketch-btn bg-pencil-rose text-paper-white px-4 py-2 font-hand text-sm flex items-center gap-1.5"
            >
              <DoodleFlower size={14} petalColor="#FFFFFF" />
              <span>Tạo cuốn sổ mới</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEPS: 1 (Balloon Game) -> 2 (Love Messages) -> 3 (3D Tree & Photo Gallery)
  // BackgroundMusicPlayer remains mounted so the music loops continuously across steps 2 and 3!
  return (
    <>
      <BackgroundMusicPlayer
        isPlaying={musicPlaying}
        onTogglePlay={(playing) => setMusicPlaying(playing)}
        songTitle="Đừng Làm Trái Tim Anh Đau - Obito (remake)"
      />

      {currentStep === 'tree' ? (
        <div className="w-full h-screen h-[100dvh] bg-paper overflow-hidden relative select-none">
          <RomanceExperience
            gift={gift}
            onReplay={handleReplay}
          />
          {/* Discreet watermark */}
          <div className="absolute bottom-1 right-4 pointer-events-none opacity-40 font-hand text-xs text-pencil-lead flex items-center gap-1 z-30">
            <span>Một nét vẽ, ngàn yêu thương</span>
            <DoodleHeart size={12} fill="#C9757C" />
          </div>
        </div>
      ) : (
        <div className="min-h-screen min-h-[100dvh] bg-paper py-4 px-2 sm:px-6 flex flex-col justify-between">
          <main className="max-w-5xl w-full mx-auto flex-1 flex flex-col justify-center">
            {currentStep === 'game' && (
              <div className="w-full">
                <BalloonGame onComplete={handleGameComplete} targetScore={20} />
              </div>
            )}

            {currentStep === 'messages' && (
              <div className="w-full animate-float">
                <LoveMessages
                  messages={gift.messages}
                  recipientName={gift.recipient_name}
                  senderName={gift.sender_name}
                  onComplete={() => setCurrentStep('tree')}
                />
              </div>
            )}
          </main>

          {/* Subtle Footer */}
          <footer className="text-center py-2 font-hand text-pencil-lead text-xs sm:text-sm flex items-center justify-center gap-1.5 opacity-70">
            <span>Được vẽ bằng tình yêu & sự trân trọng</span>
            <DoodleHeart size={14} fill="#C9757C" />
          </footer>
        </div>
      )}
    </>
  );
};
