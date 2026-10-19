import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { PencilButton } from '../ui/PencilButton';
import { DoodleHeart, DoodleFlower } from '../ui/DoodleDecorations';
import { Download, Copy, Share2, ExternalLink, Check } from 'lucide-react';

interface QrSharePanelProps {
  giftUrl: string;
  recipientName: string;
}

export const QrSharePanel: React.FC<QrSharePanelProps> = ({
  giftUrl,
  recipientName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Generate artistic QR code with frame onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !giftUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create temporary QR image
    QRCode.toDataURL(giftUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 220,
      color: {
        dark: '#5E514B', // Graphite dark
        light: '#FFFDF8', // Paper white
      },
    })
      .then((qrDataUrl) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          // Canvas size including sketchbook decorative polaroid frame
          const w = (canvas.width = 300);
          const h = (canvas.height = 360);

          // Clear
          ctx.clearRect(0, 0, w, h);

          // 1. Draw Paper Polaroid Background
          ctx.fillStyle = '#FFFDF8';
          ctx.fillRect(10, 10, w - 20, h - 20);

          // Graphite pencil border (imperfect hand-drawn stroke)
          ctx.strokeStyle = '#5E514B';
          ctx.lineWidth = 2.0;
          ctx.strokeRect(10, 10, w - 20, h - 20);

          // 2. Washi tape at top
          ctx.fillStyle = 'rgba(221, 160, 165, 0.7)';
          ctx.fillRect(w / 2 - 40, 2, 80, 16);
          ctx.strokeStyle = '#5E514B';
          ctx.lineWidth = 1;
          ctx.strokeRect(w / 2 - 40, 2, 80, 16);

          // 3. Draw standard scannable QR Code
          ctx.drawImage(qrImg, 40, 36, 220, 220);

          // 4. Subtle Heart border around QR
          ctx.strokeStyle = '#C9757C';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(36, 32, 228, 228);

          // 5. Handwritten text caption below QR
          ctx.fillStyle = '#5E514B';
          ctx.font = 'bold 18px "Patrick Hand", cursive, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Món quà gửi tặng ${recipientName}`, w / 2, 290);

          ctx.font = '14px "Patrick Hand", cursive, sans-serif';
          ctx.fillStyle = '#91877F';
          ctx.fillText('Quét mã để mở cuốn sổ tình yêu ❤️', w / 2, 315);
          ctx.fillText('lovesketchbook.art', w / 2, 335);
        };
        qrImg.src = qrDataUrl;
      })
      .catch((err) => {
        console.error('Lỗi tạo mã QR:', err);
      });
  }, [giftUrl, recipientName]);

  const [copyError, setCopyError] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(giftUrl);
      } else {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = giftUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 4000);
    }
  };

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `love-sketchbook-${recipientName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareGift = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Love Sketchbook dành cho ${recipientName}`,
          text: `Một cuốn sổ phác thảo tình yêu 20/10 với những nét vẽ kỳ diệu dành riêng cho ${recipientName}!`,
          url: giftUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(giftUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareZalo = () => {
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(giftUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <div className="bg-paper-white sketch-border shadow-sketch-lg p-6 text-center select-none">
      <div className="flex items-center justify-center gap-2 mb-3">
        <DoodleFlower size={22} petalColor="#DDA0A5" />
        <h3 className="font-serif italic font-bold text-xl text-pencil-rose">
          Mã QR & Chia Sẻ Món Quà
        </h3>
        <DoodleHeart size={18} fill="#C9757C" />
      </div>

      <p className="font-hand text-pencil-graphite text-sm mb-4">
        Người ấy chỉ cần quét mã hoặc mở liên kết là có thể bước vào hành trình kỳ diệu.
      </p>

      {/* QR Canvas Display */}
      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          className="w-[260px] h-[312px] shadow-photo rounded-xs transform -rotate-1 hover:rotate-0 transition-transform"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        <PencilButton
          variant="rose"
          size="sm"
          onClick={downloadQr}
          icon={<Download size={14} />}
        >
          Tải ảnh QR
        </PencilButton>

        <PencilButton
          variant="paper"
          size="sm"
          onClick={copyToClipboard}
          icon={copied ? <Check size={14} className="text-pencil-sage" /> : <Copy size={14} />}
        >
          {copied ? 'Đã sao chép link!' : 'Sao chép link'}
        </PencilButton>

        <PencilButton
          variant="sage"
          size="sm"
          onClick={shareGift}
          icon={<Share2 size={14} />}
        >
          {shareSuccess ? 'Đã chia sẻ!' : 'Chia sẻ'}
        </PencilButton>
      </div>

      {copyError && (
        <p className="font-hand text-xs text-pencil-rose mb-3">
          Không thể tự động sao chép. Vui lòng nhấn vào "Mở thử món quà" bên dưới rồi sao chép đường link trên trình duyệt.
        </p>
      )}

      {/* Social Shortcuts */}
      <div className="flex items-center justify-center gap-4 pt-3 border-t border-pencil-graphite/15 font-hand text-xs text-pencil-graphite">
        <button
          onClick={shareFacebook}
          className="hover:text-pencil-rose underline"
        >
          Chia sẻ Facebook
        </button>
        <span>•</span>
        <button
          onClick={shareZalo}
          className="hover:text-pencil-rose underline"
        >
          Gửi qua Zalo
        </button>
        <span>•</span>
        <a
          href={giftUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pencil-rose flex items-center gap-1 font-bold"
        >
          <span>Mở thử món quà</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
