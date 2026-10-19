import React, { useState } from 'react';
import { GiftData, PhotoItem } from '../types';
import { ImageUploader } from '../components/creator/ImageUploader';
import { GiftPreview } from '../components/creator/GiftPreview';
import { QrSharePanel } from '../components/creator/QrSharePanel';
import { PencilButton } from '../components/ui/PencilButton';
import { DoodleHeart, DoodleFlower, DoodleLeaf, DoodlePencil } from '../components/ui/DoodleDecorations';
import { giftService } from '../services/gifts';
import { Plus, Trash2, Sparkles, Loader2, Heart, ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateGiftPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states initialized with sample values
  const [recipientName, setRecipientName] = useState('Em Yêu');
  const [senderName, setSenderName] = useState('Anh');
  const [openingMessage, setOpeningMessage] = useState('Một cuốn sổ nhỏ lưu giữ những điều ngọt ngào nhất...');
  const [messages, setMessages] = useState<string[]>([
    'Chào em, cô gái hay cười và yêu những nét vẽ mộc mạc của anh!',
    'Mỗi ngày trôi qua bên em là một trang giấy trắng được tô thêm màu sắc ấm áp...',
    'Hôm nay, tất cả kỷ niệm cùng nở rộ thành một Cây Tình Yêu kỳ diệu dành riêng cho em.',
    'Chúc em ngày 20/10 tràn ngập nụ cười, luôn hạnh phúc và an yên bên anh nhé! ❤️'
  ]);
  const [closingMessage, setClosingMessage] = useState('Mỗi nét vẽ là một lời thương gửi đến em. Yêu em rất nhiều!');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdGift, setCreatedGift] = useState<GiftData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeStep, setActiveStep] = useState<'form' | 'created'>('form');

  // Messages handling
  const addMessage = () => {
    if (messages.length < 8) {
      setMessages([...messages, '']);
    }
  };

  const updateMessage = (index: number, text: string) => {
    const next = [...messages];
    next[index] = text;
    setMessages(next);
  };

  const removeMessage = (index: number) => {
    if (messages.length > 1) {
      setMessages(messages.filter((_, i) => i !== index));
    }
  };

  // Create current gift state for preview
  const previewGiftData: GiftData = {
    id: 'preview',
    slug: 'preview',
    recipient_name: recipientName || 'Em Yêu',
    sender_name: senderName || 'Anh',
    opening_message: openingMessage,
    messages: messages.filter((m) => m.trim().length > 0),
    closing_message: closingMessage,
    photos: photos,
  };

  // Submit & create gift
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setSubmitError('Vui lòng nhập tên người nhận.');
      return;
    }
    if (messages.every((m) => !m.trim())) {
      setSubmitError('Vui lòng nhập ít nhất một lời chúc yêu thương.');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Đang chuẩn bị ảnh...');
    setSubmitError(null);

    try {
      const savedGift = await giftService.createGift(
        {
          recipient_name: recipientName.trim(),
          sender_name: senderName.trim(),
          opening_message: openingMessage.trim(),
          messages: messages.filter((m) => m.trim().length > 0),
          closing_message: closingMessage.trim(),
          photos,
        },
        (completed, total, currentName) => {
          if (total > 0) {
            setUploadStatus(`Đang tải ảnh lên ImgBB (${completed}/${total}): ${currentName || ''}...`);
          } else {
            setUploadStatus('Đang lưu thông tin vào MongoDB Atlas...');
          }
        }
      );

      setCreatedGift(savedGift);
      setActiveStep('created');
    } catch (err: any) {
      console.error('Lỗi tạo món quà:', err);
      const msg = err.message || 'Đã xảy ra lỗi khi lưu món quà. Vui lòng thử lại.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStatus(null);
    }
  };

  const publicGiftUrl = createdGift
    ? `${window.location.origin}/g/${createdGift.slug}`
    : '';

  return (
    <div className="min-h-screen bg-paper py-6 px-3 sm:px-6">
      {/* Top Banner Header */}
      <header className="max-w-6xl w-full mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-paper-white sketch-border shadow-sketch px-6 py-2 mb-3 transform -rotate-0.5">
          <DoodlePencil size={24} />
          <h1 className="font-serif italic font-bold text-2xl sm:text-3xl text-pencil-rose">
            Tạo Cuốn Sổ Quà Tặng 20/10
          </h1>
          <DoodleHeart size={20} fill="#C9757C" />
        </div>
        <p className="font-hand text-pencil-graphite text-base sm:text-lg max-w-xl mx-auto">
          "Một trang giấy trắng dần được lấp đầy bằng những nét vẽ, những lời thương và những kỷ niệm."
        </p>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl w-full mx-auto">
        {activeStep === 'created' && createdGift ? (
          // ==========================================================
          // SUCCESS STATE: QR CODE & SHARE PANEL
          // ==========================================================
          <div className="max-w-2xl mx-auto animate-float">
            <div className="bg-paper-white sketch-border shadow-sketch-lg p-6 sm:p-8 mb-6 text-center">
              <div className="washi-tape washi-tape-pink" />
              <div className="w-16 h-16 rounded-full bg-pencil-sage/20 border-2 border-pencil-sage flex items-center justify-center mx-auto mb-3 text-pencil-olive">
                <Sparkles size={32} />
              </div>
              <h2 className="font-serif italic font-bold text-2xl sm:text-3xl text-pencil-rose mb-2">
                Cuốn Sổ Quà Tặng Đã Hoàn Thành!
              </h2>
              <p className="font-hand text-pencil-graphite text-lg mb-6">
                Món quà dành riêng cho <strong className="text-pencil-rose">{createdGift.recipient_name}</strong> đã sẵn sàng được trao gửi.
              </p>

              <QrSharePanel
                giftUrl={publicGiftUrl}
                recipientName={createdGift.recipient_name}
              />

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <PencilButton
                  variant="paper"
                  size="md"
                  onClick={() => {
                    setActiveStep('form');
                    setCreatedGift(null);
                  }}
                >
                  Tạo thêm cuốn sổ khác
                </PencilButton>

                <PencilButton
                  variant="rose"
                  size="md"
                  onClick={() => navigate(`/g/${createdGift.slug}`)}
                  icon={<ExternalLink size={16} />}
                >
                  Mở xem trang người nhận
                </PencilButton>
              </div>
            </div>
          </div>
        ) : (
          // ==========================================================
          // 3-COLUMN CREATOR DESKTOP LAYOUT (RESPONSIVE 1-COL MOBILE)
          // ==========================================================
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* COLUMN A: Thông tin & Lời chúc (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-paper-white sketch-border shadow-sketch p-6 relative lined-paper">
                <div className="washi-tape washi-tape-gold" />
                <div className="flex items-center gap-2 border-b border-pencil-graphite/20 pb-2 mb-4">
                  <DoodleHeart size={20} fill="#DDA0A5" />
                  <h3 className="font-serif italic font-bold text-lg text-pencil-rose">
                    A. Thông tin người thương
                  </h3>
                </div>

                <div className="space-y-4 font-hand">
                  <div>
                    <label className="block text-sm text-pencil-graphite mb-1 font-bold">
                      Tên / Biệt danh người nhận *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Ví dụ: Bé Yêu, Ánh Dương, Em..."
                      className="w-full bg-[#FAF6ED] sketch-border-subtle px-3 py-2 text-base text-pencil-graphite outline-hidden focus:border-pencil-rose"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-pencil-graphite mb-1 font-bold">
                      Tên người gửi (bạn) *
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Ví dụ: Anh, Người bí mật..."
                      className="w-full bg-[#FAF6ED] sketch-border-subtle px-3 py-2 text-base text-pencil-graphite outline-hidden focus:border-pencil-rose"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-pencil-graphite mb-1">
                      Lời mở đầu cuốn sổ (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={openingMessage}
                      onChange={(e) => setOpeningMessage(e.target.value)}
                      placeholder="Lời nhắn ghi ở bìa cuốn sổ..."
                      className="w-full bg-[#FAF6ED] sketch-border-subtle px-3 py-2 text-sm text-pencil-graphite outline-hidden focus:border-pencil-rose"
                    />
                  </div>
                </div>
              </div>

              {/* Lời chúc tuần tự */}
              <div className="bg-paper-white sketch-border shadow-sketch p-6 relative lined-paper">
                <div className="washi-tape washi-tape-pink" />
                <div className="flex items-center justify-between border-b border-pencil-graphite/20 pb-2 mb-4">
                  <div className="flex items-center gap-2">
                    <DoodleFlower size={20} petalColor="#DDA0A5" />
                    <h3 className="font-serif italic font-bold text-lg text-pencil-rose">
                      Danh sách lời chúc (Xuất hiện lần lượt)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={addMessage}
                    className="font-hand text-xs text-pencil-rose hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Thêm lời chúc</span>
                  </button>
                </div>

                <div className="space-y-3 font-hand">
                  {messages.map((msg, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="w-5 pt-2 text-xs text-pencil-lead font-bold">
                        {index + 1}.
                      </span>
                      <textarea
                        rows={2}
                        value={msg}
                        onChange={(e) => updateMessage(index, e.target.value)}
                        placeholder={`Lời chúc thứ ${index + 1}...`}
                        className="flex-1 bg-[#FAF6ED] sketch-border-subtle px-3 py-1.5 text-sm text-pencil-graphite outline-hidden focus:border-pencil-rose resize-none"
                      />
                      {messages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMessage(index)}
                          className="pt-2 text-pencil-lead hover:text-pencil-rose"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 font-hand">
                  <label className="block text-sm text-pencil-graphite mb-1">
                    Lời nhắn kết thúc (Dưới Cây Tình Yêu)
                  </label>
                  <input
                    type="text"
                    value={closingMessage}
                    onChange={(e) => setClosingMessage(e.target.value)}
                    placeholder="Mãi yêu em..."
                    className="w-full bg-[#FAF6ED] sketch-border-subtle px-3 py-2 text-sm text-pencil-graphite outline-hidden focus:border-pencil-rose"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN B: Tải ảnh & Thao tác (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-paper-white sketch-border shadow-sketch p-6 relative">
                <div className="washi-tape washi-tape-sage" />
                <div className="flex items-center justify-between border-b border-pencil-graphite/20 pb-2 mb-4">
                  <div className="flex items-center gap-2">
                    <DoodleLeaf size={20} fill="#A9B99A" />
                    <h3 className="font-serif italic font-bold text-lg text-pencil-rose">
                      B. Ảnh kỷ niệm quay quanh cây (Tối đa 30 ảnh)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="font-hand text-xs sm:text-sm text-pencil-rose hover:underline flex items-center gap-1 font-bold"
                  >
                    <Sparkles size={14} />
                    <span>Xem trước toàn màn hình</span>
                  </button>
                </div>

                <ImageUploader
                  photos={photos}
                  onChange={setPhotos}
                  maxPhotos={30}
                />
              </div>

              {/* ERROR BANNER IF UPLOAD OR CREATION FAILS */}
              {submitError && (
                <div className="bg-paper-white sketch-border border-pencil-rose p-4 text-pencil-graphite flex items-start gap-3 shadow-sketch">
                  <div className="w-8 h-8 rounded-full bg-pencil-rose/10 flex items-center justify-center text-pencil-rose shrink-0 mt-0.5">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1 font-hand text-sm sm:text-base leading-relaxed">
                    <strong className="text-pencil-rose block mb-1 font-bold">Chưa thể tạo món quà:</strong>
                    <span>{submitError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitError(null)}
                    className="text-pencil-lead hover:text-pencil-rose text-sm font-hand px-2 py-0.5"
                    title="Đóng thông báo"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ACTION & SUBMIT BAR */}
              <div className="bg-paper-white sketch-border shadow-sketch p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-hand text-pencil-lead text-sm text-center sm:text-left">
                  <span>✨ Đã sẵn sàng {photos.length} bức ảnh và {messages.length} lời thương.</span>
                  {uploadStatus && (
                    <div className="flex items-center gap-2 text-pencil-rose font-bold mt-1 animate-pulse">
                      <Loader2 size={14} className="animate-spin" />
                      <span>{uploadStatus}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <PencilButton
                    type="button"
                    variant="paper"
                    size="md"
                    onClick={() => setShowPreviewModal(true)}
                  >
                    Xem thử
                  </PencilButton>

                  <PencilButton
                    type="submit"
                    variant="rose"
                    size="lg"
                    disabled={isSubmitting}
                    icon={isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} fill="#FFFDF8" />}
                  >
                    {isSubmitting ? (uploadStatus ? 'Đang tải ảnh...' : 'Đang xử lý...') : 'Tạo món quà'}
                  </PencilButton>
                </div>
              </div>

              {/* Live Inline Preview */}
              <div className="mt-2">
                <GiftPreview gift={previewGiftData} />
              </div>
            </div>
          </form>
        )}
      </div>

      {/* FULLSCREEN PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-[#5E514B]/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-6">
          <div className="bg-paper sketch-border shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 bg-paper-white sketch-btn w-9 h-9 flex items-center justify-center text-pencil-graphite hover:text-pencil-rose z-50"
            >
              ✕
            </button>
            <GiftPreview gift={previewGiftData} />
          </div>
        </div>
      )}
    </div>
  );
};
