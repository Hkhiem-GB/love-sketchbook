import React, { useState } from 'react';
import { GiftData } from '../../types';
import { RomanceExperience } from '../romance/RomanceExperience';
import { LoveMessages } from '../romance/LoveMessages';
import { BalloonGame } from '../game/BalloonGame';
import { PencilButton } from '../ui/PencilButton';
import { DoodleHeart, DoodlePencil, DoodleFlower } from '../ui/DoodleDecorations';
import { Eye, Play, Sparkles } from 'lucide-react';

interface GiftPreviewProps {
  gift: GiftData;
}

export const GiftPreview: React.FC<GiftPreviewProps> = ({ gift }) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'messages' | 'game'>('tree');

  return (
    <div className="bg-paper-white sketch-border shadow-sketch-lg p-4 sm:p-6 select-none">
      <div className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-4 border-b border-pencil-graphite/20 gap-3">
        <div className="flex items-center gap-2">
          <Eye size={20} className="text-pencil-rose" />
          <h3 className="font-serif italic font-bold text-xl text-pencil-rose">
            Xem Trước Món Quà (Live Preview)
          </h3>
          <DoodleHeart size={16} fill="#DDA0A5" />
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tree')}
            className={`sketch-btn px-3 py-1 font-hand text-xs sm:text-sm ${
              activeTab === 'tree'
                ? 'bg-pencil-rose text-paper-white'
                : 'bg-paper text-pencil-graphite'
            }`}
          >
            Cây Tình Yêu & Ảnh
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`sketch-btn px-3 py-1 font-hand text-xs sm:text-sm ${
              activeTab === 'messages'
                ? 'bg-pencil-rose text-paper-white'
                : 'bg-paper text-pencil-graphite'
            }`}
          >
            Lời Chúc
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`sketch-btn px-3 py-1 font-hand text-xs sm:text-sm ${
              activeTab === 'game'
                ? 'bg-pencil-rose text-paper-white'
                : 'bg-paper text-pencil-graphite'
            }`}
          >
            Mini-Game
          </button>
        </div>
      </div>

      {/* Preview Body */}
      <div className="min-h-[500px] flex items-center justify-center bg-paper rounded-xs p-2 overflow-hidden border border-pencil-graphite/15">
        {activeTab === 'tree' && (
          <div className="w-full">
            <RomanceExperience gift={gift} skipTreeAnimation={true} />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="w-full max-w-lg">
            <LoveMessages
              messages={gift.messages}
              recipientName={gift.recipient_name}
              senderName={gift.sender_name}
              onComplete={() => setActiveTab('tree')}
            />
          </div>
        )}

        {activeTab === 'game' && (
          <div className="w-full h-[520px]">
            <BalloonGame
              targetScore={5} // Fast preview score
              onComplete={() => setActiveTab('messages')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
