import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

/* ── Allowed MIME types ── */
const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/* ── Memory storage for Cloudinary uploads ── */
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowedExts.includes(ext) || !IMAGE_MIMES.includes(file.mimetype)) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

/**
 * Middleware to validate file magic bytes after multer has parsed the upload.
 * Use AFTER multer middleware. Only works with memoryStorage (req.file.buffer).
 */
export function validateFileBytes(req: Request, res: Response, next: NextFunction): void {
  if (!req.file?.buffer) {
    next();
    return;
  }

  const buf = req.file.buffer;

  // Check magic bytes for common image formats
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  const isWebp = buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
    && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;

  if (!isPng && !isJpeg && !isWebp) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_FILE', message: 'File content does not match an allowed image format' },
    });
    return;
  }

  next();
}
