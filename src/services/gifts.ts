import { GiftData, PhotoItem } from '../types';

const API_BASE = '/api';

export const giftService = {
  /**
   * Upload image files to backend (Cloudinary / server storage)
   */
  async uploadPhotos(files: File[]): Promise<PhotoItem[]> {
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((file) => formData.append('photos', file));

    const res = await fetch(`${API_BASE}/upload`, {
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
    // 1. Separate pending files from already uploaded photos
    const filesToUpload: { file: File; caption?: string; rotation?: number }[] = [];
    const readyPhotos: PhotoItem[] = [];

    for (const photo of giftData.photos) {
      if (photo.file) {
        filesToUpload.push({
          file: photo.file,
          caption: photo.caption,
          rotation: photo.rotation,
        });
      } else {
        readyPhotos.push(photo);
      }
    }

    // 2. Upload pending image files if any
    if (filesToUpload.length > 0) {
      const formData = new FormData();
      filesToUpload.forEach((item) => formData.append('photos', item.file));

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        throw new Error(errJson.message || 'Tải ảnh lên máy chủ thất bại.');
      }

      const uploadJson = await uploadRes.json();
      const uploadedData = uploadJson.data || [];

      uploadedData.forEach((item: any, idx: number) => {
        readyPhotos.push({
          id: item.id,
          url: item.url,
          caption: filesToUpload[idx]?.caption || item.originalName?.replace(/\.[^/.]+$/, '').slice(0, 20) || '',
          rotation: filesToUpload[idx]?.rotation ?? (Math.random() - 0.5) * 6,
        });
      });
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

    const res = await fetch(`${API_BASE}/gifts`, {
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
    const res = await fetch(`${API_BASE}/gifts/${encodeURIComponent(slug)}`);

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
