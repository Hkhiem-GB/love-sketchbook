import { PhotoItem } from '../types';

export const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
export const MAX_PHOTO_COUNT = 30;
export const MAX_PHOTO_SIZE_MB = 16;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface ImgbbUploadResult {
  url: string;
  displayUrl?: string;
  deleteUrl?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

export interface ImgbbApiResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
  error?: {
    message: string;
    code: number;
  };
}

export const imgbbService = {
  /**
   * Retrieves the ImgBB API Key safely from Vite (client) or Node (test) environment
   */
  getApiKey(): string {
    const key =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_IMGBB_API_KEY) ||
      (typeof process !== 'undefined' && process.env && process.env.VITE_IMGBB_API_KEY) ||
      '';

    if (!key || key === 'your_imgbb_api_key' || key.trim() === '') {
      throw new Error(
        'Chưa cấu hình VITE_IMGBB_API_KEY. Vui lòng lấy API Key miễn phí tại https://api.imgbb.com và thêm vào file .env.local hoặc Vercel Environment Variables.'
      );
    }
    return key.trim();
  },

  /**
   * Checks whether the ImgBB API Key is defined
   */
  isConfigured(): boolean {
    const key =
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_IMGBB_API_KEY) ||
      (typeof process !== 'undefined' && process.env && process.env.VITE_IMGBB_API_KEY) ||
      '';
    return Boolean(key && key !== 'your_imgbb_api_key' && key.trim() !== '');
  },

  /**
   * Uploads a single image directly from browser to ImgBB API.
   * Completely bypasses Vercel Serverless Functions and 4.5MB limits!
   */
  async uploadSingleImage(file: File): Promise<ImgbbUploadResult> {
    // 1. Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Định dạng "${file.type}" không được hỗ trợ. Chỉ chấp nhận ảnh JPEG, PNG, WEBP, GIF.`);
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      throw new Error(
        `Dung lượng ảnh "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn ${MAX_PHOTO_SIZE_MB}MB.`
      );
    }

    const apiKey = this.getApiKey();

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, '').slice(0, 30));

    // 3. Send direct to ImgBB API with 45s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let response: Response;
    try {
      response = await fetch(`${IMGBB_API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Crucial: Do NOT set Content-Type header so browser adds the correct multipart boundary
      });
    } catch (netErr: any) {
      if (netErr.name === 'AbortError') {
        throw new Error(`Tải ảnh "${file.name}" quá thời gian chờ (timeout). Vui lòng kiểm tra lại mạng.`);
      }
      throw new Error(`Lỗi kết nối khi tải ảnh "${file.name}" lên ImgBB: ${netErr.message}`);
    } finally {
      clearTimeout(timeoutId);
    }

    let json: ImgbbApiResponse;
    try {
      json = await response.json();
    } catch {
      throw new Error(`Phản hồi không hợp lệ từ máy chủ ImgBB (HTTP ${response.status}).`);
    }

    if (!response.ok || !json.success || !json.data || !json.data.url) {
      const errMsg = json.error?.message || `Lỗi HTTP ${response.status} từ ImgBB`;
      throw new Error(`Tải ảnh "${file.name}" thất bại: ${errMsg}`);
    }

    return {
      url: json.data.url, // Direct CDN link (e.g. https://i.ibb.co/...)
      displayUrl: json.data.display_url || json.data.url,
      deleteUrl: json.data.delete_url,
      width: json.data.width,
      height: json.data.height,
      bytes: json.data.size,
      format: json.data.image?.extension || 'jpg',
    };
  },

  /**
   * Uploads multiple images to ImgBB with progress tracking.
   * If any image already has a real URL (and no pending .file), it will NOT be re-uploaded.
   */
  async uploadPhotos(
    photos: PhotoItem[],
    onProgress?: (completed: number, total: number, currentPhotoName?: string) => void
  ): Promise<PhotoItem[]> {
    if (photos.length > MAX_PHOTO_COUNT) {
      throw new Error(`Vượt quá giới hạn tối đa ${MAX_PHOTO_COUNT} ảnh.`);
    }

    const pendingPhotos = photos.filter((p) => Boolean(p.file));
    const totalToUpload = pendingPhotos.length;

    if (totalToUpload === 0) {
      return photos;
    }

    let completed = 0;
    const updatedPhotos: PhotoItem[] = [];

    // Process each photo sequentially to avoid network spikes on mobile connections
    for (const item of photos) {
      if (!item.file) {
        // Already uploaded previously or static URL
        updatedPhotos.push(item);
        continue;
      }

      onProgress?.(completed, totalToUpload, item.file.name);

      const result = await this.uploadSingleImage(item.file);
      completed++;
      onProgress?.(completed, totalToUpload, item.file.name);

      updatedPhotos.push({
        id: item.id,
        url: result.url,
        displayUrl: result.displayUrl,
        deleteUrl: result.deleteUrl,
        caption: item.caption,
        rotation: item.rotation,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
        file: undefined, // Clear the file object now that it has been uploaded
      });
    }

    return updatedPhotos;
  },
};
