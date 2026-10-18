import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '../config/cloudinary';

export const uploadRouter = Router();

const MAX_PHOTOS = 30;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_PHOTOS,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type "${file.mimetype}". Only JPEG, PNG, WEBP, and GIF are allowed.`));
    }
  },
});

/**
 * POST /api/upload
 * Upload 1 or more images to Cloudinary (or server storage)
 */
uploadRouter.post('/', upload.array('photos', MAX_PHOTOS), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No image files provided for upload.',
    });
  }

  const uploadedResults: any[] = [];
  const uploadedPublicIds: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadImage(file.buffer, file.originalname, file.mimetype);

      if (result.publicId) {
        uploadedPublicIds.push(result.publicId);
      }

      uploadedResults.push({
        id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        originalName: file.originalname,
      });
    }

    return res.status(200).json({
      success: true,
      data: uploadedResults,
    });
  } catch (error: any) {
    console.error('[Upload] Error uploading files:', error);

    // Clean up already uploaded orphan images if one file failed
    for (const pid of uploadedPublicIds) {
      deleteImage(pid).catch((err) => console.warn('[Upload Cleanup Error]:', err));
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images.',
    });
  }
});
