import React, { useRef } from 'react';
import { PhotoItem } from '../../types';
import { DoodleHeart, DoodleFlower } from '../ui/DoodleDecorations';
import { Upload, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { PhotoLightboxModal } from '../ui/PhotoLightboxModal';

interface ImageUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

// Compress image on client using Canvas 2D
export const compressImage = (file: File, maxWidth = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 30,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [warningMessage, setWarningMessage] = React.useState<string | null>(null);
  const [previewingPhoto, setPreviewingPhoto] = React.useState<PhotoItem | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      setWarningMessage(`Đã đạt giới hạn tối đa ${maxPhotos} ảnh.`);
      return;
    }

    if (files.length > remainingSlots) {
      setWarningMessage(`Chỉ có thể nhận thêm ${remainingSlots} ảnh (tối đa ${maxPhotos} ảnh).`);
    } else {
      setWarningMessage(null);
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newItems: PhotoItem[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressedDataUrl = await compressImage(file);
        newItems.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: compressedDataUrl,
          caption: file.name.replace(/\.[^/.]+$/, '').slice(0, 20),
          rotation: (Math.random() - 0.5) * 6,
          file,
        });
      } catch (err) {
        console.error('Lỗi nén ảnh:', err);
      }
    }

    onChange([...photos, ...newItems]);
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(
      photos.map((p) => (p.id === id ? { ...p, caption } : p))
    );
  };

  return (
    <div className="w-full">
      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="w-full border-2 border-dashed border-pencil-graphite/40 rounded-lg p-6 bg-paper-white/60 hover:bg-paper-white hover:border-pencil-rose transition-all cursor-pointer flex flex-col items-center justify-center text-center group select-none"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-full bg-pencil-pink/20 flex items-center justify-center text-pencil-rose mb-3 group-hover:scale-110 transition-transform">
          <Upload size={24} />
        </div>
        <p className="font-hand font-bold text-lg text-pencil-graphite">
          Kéo thả ảnh vào đây hoặc nhấn để chọn
        </p>
        <p className="font-hand text-sm text-pencil-lead mt-1">
          Hỗ trợ tối đa {maxPhotos} ảnh kỷ niệm • Đã chọn {photos.length}/{maxPhotos}
        </p>
      </div>

      {/* Warning Notification */}
      {warningMessage && (
        <div className="mt-3 p-3 bg-paper-white sketch-border-subtle border-pencil-rose text-pencil-rose text-sm font-hand flex items-center justify-between shadow-sketch-sm">
          <span>⚠️ {warningMessage}</span>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="text-pencil-lead hover:text-pencil-rose px-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Selected Photos Grid Preview */}
      {photos.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-hand font-bold text-pencil-graphite text-base flex items-center gap-1.5">
              <ImageIcon size={18} />
              <span>Ảnh đã chọn ({photos.length})</span>
            </span>
            <button
              onClick={() => onChange([])}
              className="font-hand text-xs text-pencil-rose hover:underline flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Xóa tất cả</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2.5 max-h-[340px] overflow-y-auto p-2 border border-pencil-graphite/20 bg-paper-white/40 rounded-sm">
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                style={{ transform: `rotate(${photo.rotation || 0}deg)` }}
                className="relative bg-paper-white sketch-border-subtle p-1.5 pb-2.5 sm:p-2 sm:pb-3 shadow-xs transition-transform hover:scale-105 group"
              >
                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  title="Xóa ảnh"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pencil-rose text-paper-white flex items-center justify-center text-xs opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 transition-all z-10 shadow-xs"
                >
                  <X size={12} />
                </button>

                {/* Photo Thumbnail - tap to preview enlarged */}
                <div
                  onClick={() => setPreviewingPhoto(photo)}
                  title="Chạm để xem phóng to ảnh"
                  className="aspect-square w-full overflow-hidden bg-[#FAF6ED] border border-[#5E514B]/20 rounded-xs mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || `Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>

                {/* Caption Input */}
                <input
                  type="text"
                  value={photo.caption || ''}
                  onChange={(e) => updateCaption(photo.id, e.target.value)}
                  placeholder="Chú thích..."
                  className="w-full text-center font-hand text-[11px] sm:text-xs text-pencil-graphite bg-transparent border-b border-transparent hover:border-pencil-graphite/30 focus:border-pencil-rose outline-hidden px-0.5 truncate focus:overflow-visible transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Preview */}
      <PhotoLightboxModal
        photo={previewingPhoto}
        onClose={() => setPreviewingPhoto(null)}
      />
    </div>
  );
};
