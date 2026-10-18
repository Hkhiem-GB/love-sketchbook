import { GiftData, PhotoItem } from '../types';
import { imgbbService } from './imgbb';

// Supports optional external API URL (e.g. Render/Railway), defaults to relative '/api' for Vercel/Vite
const getApiBase = () => (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const giftService = {
  /**
   * Upload image files directly to ImgBB from browser
   */
  async uploadPhotos(
    photos: PhotoItem[],
    onProgress?: (completed: number, total: number, currentPhotoName?: string) => void
  ): Promise<PhotoItem[]> {
    return await imgbbService.uploadPhotos(photos, onProgress);
  },

  /**
   * Create a new gift in MongoDB Atlas via backend API.
   * Photos are first uploaded directly to ImgBB, and only light JSON metadata is sent to backend.
   */
  async createGift(
    giftData: Omit<GiftData, 'id' | 'slug' | 'created_at'>,
    onProgress?: (completed: number, total: number, currentPhotoName?: string) => void
  ): Promise<GiftData> {
    const apiBase = getApiBase();

    // 1. Upload any pending photo files directly to ImgBB
    const uploadedPhotos = await this.uploadPhotos(giftData.photos, onProgress);

    // 2. Prepare lightweight JSON metadata payload (NO binary, NO base64)
    const payload = {
      recipient_name: giftData.recipient_name,
      sender_name: giftData.sender_name,
      opening_message: giftData.opening_message,
      messages: giftData.messages,
      closing_message: giftData.closing_message,
      photos: uploadedPhotos.map((p, index) => ({
        id: p.id,
        url: p.url,
        displayUrl: p.displayUrl,
        deleteUrl: p.deleteUrl,
        caption: p.caption,
        rotation: p.rotation,
        width: p.width,
        height: p.height,
        bytes: p.bytes,
        format: p.format,
        order: index,
      })),
      theme_color: giftData.theme_color,
    };

    // 3. Send metadata to backend API to store in MongoDB Atlas
    const res = await fetch(`${apiBase}/api/gifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi lưu quà tặng vào cơ sở dữ liệu MongoDB Atlas.');
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
