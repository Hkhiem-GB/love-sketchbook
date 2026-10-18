import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

// Detect if user accidentally pasted API_KEY into API_SECRET
const hasIdenticalKeyAndSecret = apiKey && apiSecret && apiKey === apiSecret;

export const isCloudinaryConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  cloudName !== 'your_cloud_name' &&
  !hasIdenticalKeyAndSecret
);

if (hasIdenticalKeyAndSecret) {
  console.warn(
    '\n⚠️  [Storage Warning] CLOUDINARY_API_SECRET đang bị điền trùng với CLOUDINARY_API_KEY!\n' +
    '   Trên Cloudinary Dashboard, API Secret là một chuỗi ký tự ngẫu nhiên (chữ và số),\n' +
    '   khác với API Key (dãy số 15 chữ số). Hệ thống sẽ tạm dùng local storage (/uploads/photos).\n'
  );
}

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  console.log('[Storage] Cloudinary configured successfully.');
} else {
  console.log('[Storage] Cloudinary not configured or invalid credentials. Using local server storage (/uploads/photos).');
}

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Save image to local disk
 */
async function saveLocally(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<UploadResult> {
  const uploadsDir = path.resolve(process.cwd(), 'uploads', 'photos');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalFilename) || (mimetype.includes('png') ? '.png' : '.jpg');
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  return {
    url: `/uploads/photos/${filename}`,
    publicId: filename,
    bytes: buffer.length,
    format: ext.replace('.', ''),
  };
}

/**
 * Upload buffer to Cloudinary with automatic local disk fallback
 */
export async function uploadImage(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<UploadResult> {
  if (isCloudinaryConfigured) {
    try {
      return await new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'love_sketchbook',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload to Cloudinary failed'));
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          }
        );
        uploadStream.end(buffer);
      });
    } catch (err: any) {
      console.warn('[Storage] Cloudinary upload error:', err.message);
      console.warn('[Storage] Falling back to local storage for this upload...');
      return await saveLocally(buffer, originalFilename, mimetype);
    }
  }

  // Local storage fallback
  return await saveLocally(buffer, originalFilename, mimetype);
}

/**
 * Delete image from Cloudinary or local disk
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) return;

  if (isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err: any) {
      console.warn('[Storage] Failed to delete image from Cloudinary:', err.message);
    }
  } else {
    try {
      const localPath = path.resolve(process.cwd(), 'uploads', 'photos', publicId);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
      }
    } catch (err: any) {
      console.warn('[Storage] Failed to delete local image file:', err.message);
    }
  }
}
