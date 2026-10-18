import { GiftData, PhotoItem } from '../types';

// Supports optional external API URL (e.g. Render/Railway), defaults to relative '/api' for Vercel/Vite
const getApiBase = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const giftService = {
  /**
   * Upload image files.
   * Priority: Direct signed upload to Cloudinary (bypasses Vercel 4.5MB limit, high-speed CDN).
   * Fallback: Server proxy upload (for local dev or if Cloudinary is not configured).
   */
  async uploadPhotos(files: File[]): Promise<PhotoItem[]> {
    if (!files.length) return [];

    const apiBase = getApiBase();

    // 1. Check if direct signed Cloudinary upload is available
    try {
      const signRes = await fetch(`${apiBase}/api/upload/sign`);
      if (signRes.ok) {
        const signJson = await signRes.json();
        if (signJson.configured && signJson.data) {
          const { signature, timestamp, apiKey, cloudName, folder } = signJson.data;

          // Upload each file directly from browser to Cloudinary CDN
          const uploadPromises = files.map(async (file, idx) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', String(timestamp));
            formData.append('signature', signature);
            formData.append('folder', folder);

            const cldRes = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              {
                method: 'POST',
                body: formData,
              }
            );

            if (!cldRes.ok) {
              const err = await cldRes.json().catch(() => ({}));
              throw new Error(err.error?.message || 'Tải ảnh lên Cloudinary thất bại.');
            }

            const cldData = await cldRes.json();
            return {
              id: `photo-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
              url: cldData.secure_url,
              publicId: cldData.public_id,
              caption: file.name.replace(/\.[^/.]+$/, '').slice(0, 20),
              rotation: (Math.random() - 0.5) * 6,
            } as PhotoItem;
          });

          return await Promise.all(uploadPromises);
        }
      }
    } catch (signErr) {
      console.warn('Direct Cloudinary signed upload unavailable, falling back to server upload:', signErr);
    }

    // 2. Fallback: upload through backend /api/upload
    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));

    const res = await fetch(`${apiBase}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể tải ảnh lên máy chủ.');
    }

    const json = await res.json();
    return (json.data || []).map((item: any) => ({
      id: item.id,
      url: item.url,
      caption: item.originalName?.replace(/\.[^/.]+$/, '').slice(0, 20) || '',
      rotation: (Math.random() - 0.5) * 6,
      publicId: item.publicId,
    }));
  },

  /**
   * Create a new gift in MongoDB Atlas via backend API
   */
  async createGift(
    giftData: Omit<GiftData, 'id' | 'slug' | 'created_at'>
  ): Promise<GiftData> {
    const apiBase = getApiBase();

    // 1. Separate pending files from already uploaded photos
    const filesToUpload: File[] = [];
    const readyPhotos: PhotoItem[] = [];

    for (const photo of giftData.photos) {
      if (photo.file) {
        filesToUpload.push(photo.file);
      } else {
        readyPhotos.push(photo);
      }
    }

    // 2. Upload pending image files if any
    if (filesToUpload.length > 0) {
      const uploadedPhotos = await this.uploadPhotos(filesToUpload);
      readyPhotos.push(...uploadedPhotos);
    }

    // 3. Send gift data to backend API to store in MongoDB Atlas
    const payload = {
      recipient_name: giftData.recipient_name,
      sender_name: giftData.sender_name,
      opening_message: giftData.opening_message,
      messages: giftData.messages,
      closing_message: giftData.closing_message,
      photos: readyPhotos,
      theme_color: giftData.theme_color,
    };

    const res = await fetch(`${apiBase}/api/gifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi lưu quà tặng vào MongoDB Atlas.');
    }

    const json = await res.json();
    return json.data as GiftData;
  },

  /**
   * Fetch gift by slug from MongoDB Atlas via backend API
   */
  async getGiftBySlug(slug: string): Promise<GiftData> {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/gifts/${encodeURIComponent(slug)}`);

    if (res.status === 404) {
      throw new Error('GIFT_NOT_FOUND');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi kết nối máy chủ khi lấy dữ liệu món quà.');
    }

    const json = await res.json();
    return json.data as GiftData;
  },
};
