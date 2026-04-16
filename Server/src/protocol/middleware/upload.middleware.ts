import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

/* ── Allowed MIME types ── */
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;        // 5MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;       // 50MB

/* ── Memory storage for Cloudinary uploads (images only) ── */
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!IMAGE_EXTS.includes(ext) || !IMAGE_MIMES.includes(file.mimetype)) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

/* ── Combined upload for offer media (banner image + short video) ── */
export const uploadOfferMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES }, // hard ceiling; per-field check below
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === 'banner') {
      if (!IMAGE_EXTS.includes(ext) || !IMAGE_MIMES.includes(file.mimetype)) {
        cb(new Error('Banner must be a PNG, JPEG, or WebP image'));
        return;
      }
      cb(null, true);
      return;
    }

    if (file.fieldname === 'video') {
      if (!VIDEO_EXTS.includes(ext) || !VIDEO_MIMES.includes(file.mimetype)) {
        cb(new Error('Video must be an MP4, WebM, or MOV file'));
        return;
      }
      cb(null, true);
      return;
    }

    cb(new Error(`Unexpected upload field: ${file.fieldname}`));
  },
}).fields([
  { name: 'banner', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

/**
 * Validate magic bytes for a single-file upload (req.file). Used for image-only routes.
 */
export function validateFileBytes(req: Request, res: Response, next: NextFunction): void {
  if (!req.file?.buffer) {
    next();
    return;
  }

  if (!isValidImageBuffer(req.file.buffer)) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_FILE', message: 'File content does not match an allowed image format' },
    });
    return;
  }

  next();
}

/**
 * Validate magic bytes + size for offer media (banner image + video) uploaded via .fields().
 */
export function validateOfferMediaBytes(req: Request, res: Response, next: NextFunction): void {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  const banner = files?.banner?.[0];
  if (banner) {
    if (banner.size > MAX_IMAGE_BYTES) {
      res.status(400).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Banner image must be 5MB or smaller' },
      });
      return;
    }
    if (!isValidImageBuffer(banner.buffer)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: 'Banner content does not match an allowed image format' },
      });
      return;
    }
  }

  const video = files?.video?.[0];
  if (video) {
    if (video.size > MAX_VIDEO_BYTES) {
      res.status(400).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Video must be 50MB or smaller' },
      });
      return;
    }
    if (!isValidVideoBuffer(video.buffer)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE', message: 'Video content does not match an allowed video format' },
      });
      return;
    }
  }

  next();
}

function isValidImageBuffer(buf: Buffer): boolean {
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
  return isPng || isJpeg || isWebp;
}

function isValidVideoBuffer(buf: Buffer): boolean {
  // MP4 / MOV: bytes 4..7 === 'ftyp'
  const isMp4OrMov = buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70;
  // WebM: starts with EBML header 0x1A 0x45 0xDF 0xA3
  const isWebm = buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3;
  return isMp4OrMov || isWebm;
}
