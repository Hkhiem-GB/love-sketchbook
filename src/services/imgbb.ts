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
   * Retrieves the ImgBB API Key safely from Vite environment.
   * Strictly uses `import.meta.env.VITE_IMGBB_API_KEY` (no `process.env` in browser code).
   */
  getApiKey(): string {
    const rawKey = import.meta.env.VITE_IMGBB_API_KEY;
    const key = typeof rawKey === 'string' ? rawKey.replace(/['"]/g, '').trim() : '';

    if (!key || key === 'your_imgbb_api_key') {
      throw new Error(
        'Chưa cấu hình VITE_IMGBB_API_KEY trên môi trường build (Vercel). Nếu bạn vừa thêm biến trên Vercel, BẮT BUỘC phải vào Deployments > bấm vào dấu 3 chấm (...) > chọn "Redeploy" để Vite nhúng biến vào bản build. Nếu chạy ở localhost, hãy thêm vào file .env.local và khởi động lại Vite.'
      );
    }
    return key;
  },

  /**
   * Checks whether the ImgBB API Key is defined
   */
  isConfigured(): boolean {
    const rawKey = import.meta.env.VITE_IMGBB_API_KEY;
    const key = typeof rawKey === 'string' ? rawKey.replace(/['"]/g, '').trim() : '';
    return Boolean(key && key !== 'your_imgbb_api_key');
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
        throw new Error(`Tải ảnh "${file.name}" quá thời gian chờ (timeout sau 45s). Vui lòng kiểm tra lại mạng.`);
      }
      throw new Error(
        `Lỗi kết nối khi tải ảnh "${file.name}" lên ImgBB: ${netErr.message || 'Mạng không ổn định hoặc tiện ích chặn quảng cáo/tracker đã chặn kết nối tới api.imgbb.com.'}`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    let json: ImgbbApiResponse;
    try {
      json = await response.json();
    } catch {
      throw new Error(`Máy chủ ImgBB phản hồi không hợp lệ (HTTP ${response.status}). Vui lòng thử lại sau.`);
    }

    if (!response.ok || !json.success || !json.data || !json.data.url) {
      const errCode = json.error?.code || json.status || response.status;
      const rawErrMsg = json.error?.message || `Lỗi HTTP ${response.status} từ ImgBB`;

      let friendlyNote = '';
      if (rawErrMsg.toLowerCase().includes('invalid api key') || errCode === 100) {
        friendlyNote = ' (Khóa API Key không hợp lệ hoặc đã bị vô hiệu hóa trên ImgBB. Vui lòng kiểm tra lại key tại https://api.imgbb.com)';
      } else if (response.status === 429) {
        friendlyNote = ' (Đã vượt quá giới hạn lượt tải ảnh lên ImgBB trong khoảng thời gian này. Vui lòng thử lại sau)';
      } else if (response.status === 400) {
        friendlyNote = ' (Dữ liệu ảnh không hợp lệ hoặc ImgBB từ chối xử lý)';
      }

      throw new Error(`Tải ảnh "${file.name}" lên ImgBB thất bại: ${rawErrMsg}${friendlyNote}`);
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
