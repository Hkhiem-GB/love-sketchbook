import { Router, Request, Response } from 'express';
import { Gift, IPhoto } from '../models/Gift';
export const giftRouter = Router();

// Helper to generate a clean, safe, unguessable slug
function generateGiftSlug(name?: string): string {
  const prefix = name
    ? name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 15)
    : 'love';

  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix || 'love'}-${randomStr}`;
}

/**
 * GET /api/gifts/:slug
 * Retrieve a gift by public unique slug
 */
giftRouter.get('/:slug', async (req: Request, res: Response) => {
  try {
    const rawSlug = req.params.slug;
    if (!rawSlug || typeof rawSlug !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid gift identifier.',
      });
    }

    const cleanSlug = rawSlug.toLowerCase().trim();

    // Query MongoDB Atlas
    const gift = await Gift.findOne({ slug: cleanSlug }).lean();

    if (!gift) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cuốn sổ quà tặng này trong hệ thống.',
      });
    }

    return res.status(200).json({
      success: true,
      data: gift,
    });
  } catch (error: any) {
    console.error('[Gifts] Error retrieving gift:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi truy vấn cơ sở dữ liệu MongoDB Atlas.',
    });
  }
});

/**
 * POST /api/gifts
 * Create a new gift in MongoDB Atlas
 */
giftRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      recipient_name,
      sender_name,
      opening_message,
      messages,
      closing_message,
      photos = [],
      theme_color,
    } = req.body;

    // 1. Validate mandatory fields
    if (!recipient_name || typeof recipient_name !== 'string' || !recipient_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên người nhận không được để trống.',
      });
    }

    if (!sender_name || typeof sender_name !== 'string' || !sender_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên người gửi không được để trống.',
      });
    }

    if (!Array.isArray(messages) || messages.filter((m) => typeof m === 'string' && m.trim()).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập ít nhất một lời chúc yêu thương.',
      });
    }

    if (!Array.isArray(photos)) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách ảnh không hợp lệ.',
      });
    }

    if (photos.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Mỗi món quà chỉ được tối đa 30 ảnh.',
      });
    }

    // 2. Process and validate photos
    // All photos must be hosted externally (e.g. ImgBB direct browser upload or existing storage).
    // ZERO binary or base64 data is accepted or stored on Vercel/MongoDB.
    const processedPhotos: IPhoto[] = [];

    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      const photoUrl = typeof p?.url === 'string' ? p.url.trim() : '';

      // Reject raw base64 Data URLs with 400 Bad Request
      if (photoUrl.startsWith('data:image/') || photoUrl.startsWith('data:')) {
        return res.status(400).json({
          success: false,
          message: `Ảnh thứ ${i + 1} đang ở định dạng Base64. Tất cả ảnh phải được tải trực tiếp lên ImgBB từ trình duyệt trước khi tạo quà.`,
        });
      }

      // Reject empty or invalid photo URLs
      if (!photoUrl) {
        return res.status(400).json({
          success: false,
          message: `Ảnh thứ ${i + 1} không có đường dẫn URL hợp lệ.`,
        });
      }

      processedPhotos.push({
        id: p.id || `photo-${Date.now()}-${i}`,
        url: photoUrl,
        displayUrl: typeof p.displayUrl === 'string' && p.displayUrl.trim() ? p.displayUrl.trim() : photoUrl,
        deleteUrl: typeof p.deleteUrl === 'string' ? p.deleteUrl.trim() : '',
        caption: typeof p.caption === 'string' ? p.caption.trim().slice(0, 100) : '',
        rotation: typeof p.rotation === 'number' ? p.rotation : 0,
        publicId: typeof p.publicId === 'string' ? p.publicId.trim() : '',
        width: typeof p.width === 'number' ? p.width : undefined,
        height: typeof p.height === 'number' ? p.height : undefined,
        bytes: typeof p.bytes === 'number' ? p.bytes : undefined,
        format: typeof p.format === 'string' ? p.format : undefined,
        order: i,
      });
    }

    // 3. Generate unique slug with retry if collided
    let slug = generateGiftSlug(recipient_name);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await Gift.findOne({ slug }).select('_id').lean();
      if (!existing) break;
      slug = generateGiftSlug(recipient_name);
      attempts++;
    }

    // 4. Create document in MongoDB Atlas
    const newGift = await Gift.create({
      slug,
      recipient_name: recipient_name.trim(),
      sender_name: sender_name.trim(),
      opening_message: (opening_message || '').trim(),
      messages: messages.map((m: any) => String(m).trim()).filter(Boolean),
      closing_message: (closing_message || '').trim(),
      photos: processedPhotos,
      theme_color: theme_color || '#C9757C',
    });

    console.log(`[Gifts] Created gift "${slug}" for recipient "${newGift.recipient_name}" with ${processedPhotos.length} photos.`);

    return res.status(201).json({
      success: true,
      data: newGift,
    });
  } catch (error: any) {
    console.error('[Gifts] Error creating gift:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi lưu trữ quà tặng vào MongoDB Atlas.',
    });
  }
});
