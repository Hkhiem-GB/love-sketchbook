import { Router, Request, Response } from 'express';

export const uploadRouter = Router();

/**
 * GET /api/upload
 * Status and configuration information for image upload service
 */
uploadRouter.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    provider: 'imgbb',
    directUpload: true,
    maxPhotos: 30,
    message: 'Hệ thống sử dụng ImgBB API. Ảnh được tải trực tiếp từ trình duyệt của người dùng lên ImgBB.',
  });
});

/**
 * GET/POST /api/upload/sign
 * Deprecated endpoint: signature generation was only used for Cloudinary.
 * ImgBB uses direct client API key upload without server-side signing.
 */
const handleLegacySign = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: false,
    configured: false,
    provider: 'imgbb',
    message: 'Dự án đã chuyển sang ImgBB. Không cần tạo chữ ký (signature) qua máy chủ.',
  });
};

uploadRouter.get('/sign', handleLegacySign);
uploadRouter.post('/sign', handleLegacySign);

/**
 * POST /api/upload
 * Deprecated server proxy upload endpoint.
 * Rejected with 400 Bad Request to prevent binary transmission to Vercel and avoid read-only filesystem writes.
 */
uploadRouter.post('/', (_req: Request, res: Response) => {
  return res.status(400).json({
    success: false,
    provider: 'imgbb',
    message: 'Tải ảnh qua máy chủ đã bị vô hiệu hóa. Tất cả ảnh phải được tải trực tiếp từ trình duyệt lên ImgBB.',
  });
});
