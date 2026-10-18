import React, { useState, useEffect } from 'react';
import { PencilButton } from '../ui/PencilButton';
import { DoodleHeart, DoodleFlower, DoodleLeaf, DoodlePencil } from '../ui/DoodleDecorations';
import { ChevronRight, FastForward } from 'lucide-react';

interface LoveMessagesProps {
  messages: string[];
  recipientName: string;
  senderName: string;
  onComplete: () => void;
}

export const LoveMessages: React.FC<LoveMessagesProps> = ({
  messages,
  recipientName,
  senderName,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentMessage = messages[currentIndex] || 'Chúc em một ngày tràn ngập niềm vui và yêu thương!';

  // Typewriter effect simulating pencil writing
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 28); // Smooth typewriter speed

    return () => clearInterval(interval);
  }, [currentIndex, currentMessage]);

  const handleNext = () => {
    if (isTyping) {
      // If still typing, complete current text instantly
      setDisplayedText(currentMessage);
      setIsTyping(false);
      return;
    }

    if (currentIndex < messages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      {/* Notebook Page Header */}
      <div className="relative bg-paper-white sketch-border shadow-sketch-lg p-6 sm:p-10 transition-all lined-paper">
        {/* Decorative Tape at top */}
        <div className="washi-tape washi-tape-pink" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-pencil-graphite/20 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <DoodlePencil size={24} />
            <h3 className="font-serif italic font-bold text-xl sm:text-2xl text-pencil-rose">
              Gửi {recipientName}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 font-hand text-pencil-lead text-sm">
            <span>Trang {currentIndex + 1}/{messages.length}</span>
            <DoodleHeart size={14} fill="#DDA0A5" />
          </div>
        </div>

        {/* Corner Flora */}
        <div className="absolute top-3 right-4 pointer-events-none opacity-50">
          <DoodleFlower size={24} petalColor="#DDA0A5" />
        </div>
        <div className="absolute bottom-4 left-4 pointer-events-none opacity-40">
          <DoodleLeaf size={22} fill="#A9B99A" />
        </div>

        {/* Message Content Area */}
        <div className="min-h-[140px] flex items-center justify-center py-4">
          <p className="font-hand text-pencil-graphite text-xl sm:text-2xl leading-relaxed tracking-wide text-center">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-2 h-5 ml-1 bg-pencil-graphite animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Handwritten Underline */}
        <div className="w-24 mx-auto my-4 hand-drawn-underline" />

        {/* Sender Signoff on final message */}
        {currentIndex === messages.length - 1 && (
          <div className="text-right mt-2 font-hand text-pencil-graphite text-lg italic">
            — {senderName} thân yêu —
          </div>
        )}

        {/* Interactive Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-pencil-graphite/15">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 text-xs sm:text-sm font-hand text-pencil-lead hover:text-pencil-graphite transition-colors py-1 px-2"
          >
            <FastForward size={14} />
            <span>Bỏ qua đọc</span>
          </button>

          <PencilButton
            variant="rose"
            size="md"
            onClick={handleNext}
            icon={currentIndex < messages.length - 1 ? <ChevronRight size={18} /> : <DoodleHeart size={18} fill="#FFFDF8" stroke="#FFFDF8" />}
          >
            {isTyping
              ? 'Hiện hết chữ'
              : currentIndex < messages.length - 1
              ? 'Tiếp tục'
              : 'Xem Cây Tình Yêu'}
          </PencilButton>
        </div>
      </div>
    </div>
  );
};
