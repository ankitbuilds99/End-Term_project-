import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as musicMetadata from 'music-metadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage directories
export const UPLOAD_ROOT = path.join(__dirname, '../../uploads');
export const AUDIO_DIR = path.join(UPLOAD_ROOT, 'audio');
export const ARTWORK_DIR = path.join(UPLOAD_ROOT, 'artwork');

// Ensure directories exist
[UPLOAD_ROOT, AUDIO_DIR, ARTWORK_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, AUDIO_DIR);
    } else if (file.fieldname === 'artwork') {
      cb(null, ARTWORK_DIR);
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`), null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 30);
    cb(null, `${file.fieldname}-${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/x-wav',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/flac',
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    if (ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}. Permitted formats: MP3, WAV, OGG, M4A, FLAC, AAC`), false);
    }
  } else if (file.fieldname === 'artwork') {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported image format: ${file.mimetype}. Permitted formats: JPEG, PNG, WEBP`), false);
    }
  } else {
    cb(new Error(`Unexpected upload field: ${file.fieldname}`), false);
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 35 * 1024 * 1024, // 35 MB max audio size
  },
});

/**
 * Cleanup uploaded files on disk if an error occurs
 */
export const cleanupUploadedFiles = (files) => {
  if (!files) return;

  const fileList = [];
  if (Array.isArray(files)) {
    fileList.push(...files);
  } else if (typeof files === 'object') {
    Object.values(files).forEach((item) => {
      if (Array.isArray(item)) {
        fileList.push(...item);
      } else if (item && item.path) {
        fileList.push(item);
      }
    });
  }

  fileList.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`[Upload Cleanup] Deleted temporary file: ${file.path}`);
      } catch (err) {
        console.error(`[Upload Cleanup Error] Could not delete ${file.path}:`, err.message);
      }
    }
  });
};

/**
 * Remove local file from uploads directory when track is deleted or artwork replaced
 */
export const deleteLocalMedia = (mediaUrl) => {
  if (!mediaUrl || typeof mediaUrl !== 'string') return;
  if (!mediaUrl.includes('/uploads/')) return; // Ignore external cloud URLs

  try {
    const relativePath = mediaUrl.split('/uploads/')[1];
    if (relativePath) {
      const fullPath = path.join(UPLOAD_ROOT, relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[Media Delete] Removed file: ${fullPath}`);
      }
    }
  } catch (err) {
    console.warn(`[Media Delete Warning] Could not remove file for ${mediaUrl}:`, err.message);
  }
};

/**
 * Parse audio duration in seconds using music-metadata
 */
export const getAudioDuration = async (filePath) => {
  try {
    const metadata = await musicMetadata.parseFile(filePath, { duration: true });
    if (metadata.format && metadata.format.duration) {
      return Math.round(metadata.format.duration);
    }
    return null;
  } catch (err) {
    console.warn('[Audio Duration Detection] Failed to read audio duration:', err.message);
    return null;
  }
};
