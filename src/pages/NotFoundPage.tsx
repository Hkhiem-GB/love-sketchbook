import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilButton } from '../components/ui/PencilButton';
import { DoodleHeart, DoodlePencil, DoodleFlower } from '../components/ui/DoodleDecorations';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4">
      <div className="bg-paper-white sketch-border shadow-sketch-lg p-8 sm:p-12 text-center max-w-md w-full relative">
        <div className="washi-tape washi-tape-pink" />
        
        <div className="flex justify-center mb-4">
          <DoodlePencil size={48} />
        </div>

        <h1 className="font-serif italic font-bold text-3xl text-pencil-rose mb-2">
          404 — Trang Trắng
        </h1>

        <p className="font-hand text-pencil-graphite text-lg mb-6">
          Trang sổ này dường như chưa được vẽ hoặc đã được cất đi rồi...
        </p>

        <div className="flex items-center justify-center gap-3">
          <PencilButton variant="paper" size="md" onClick={() => navigate('/g/love-demo')}>
            Xem cuốn sổ mẫu
          </PencilButton>
          <PencilButton variant="rose" size="md" onClick={() => navigate('/create')}>
            Tạo cuốn sổ mới
          </PencilButton>
        </div>
      </div>
    </div>
  );
};
