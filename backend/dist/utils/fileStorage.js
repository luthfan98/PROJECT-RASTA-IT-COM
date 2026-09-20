import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
/**
 * Mendeteksi kategori folder jenis media berdasarkan MIME type atau ekstensi
 */
export function detectMediaType(mimeType, extension) {
    const mime = (mimeType || '').toLowerCase();
    const ext = (extension || '').toLowerCase().replace('.', '');
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
        return 'images';
    }
    if (mime.startsWith('video/') || ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) {
        return 'videos';
    }
    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) {
        return 'audio';
    }
    if (mime.includes('pdf') ||
        mime.includes('document') ||
        mime.includes('sheet') ||
        mime.includes('text') ||
        ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx'].includes(ext)) {
        return 'documents';
    }
    return 'others';
}
/**
 * Membuat struktur direktori uploads/YYYY/MM/DD/<jenis_media>/
 * dan mengenkripsi nama file
 */
export async function prepareStoragePath(baseUploadDir, originalFilename, mimeType) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const ext = path.extname(originalFilename).toLowerCase();
    const mediaType = detectMediaType(mimeType, ext);
    // Enkripsi nama file dengan hash kriptografi (timestamp + random salt + nama asli)
    const salt = crypto.randomBytes(16).toString('hex');
    const encryptedName = crypto
        .createHash('sha256')
        .update(`${Date.now()}-${salt}-${originalFilename}`)
        .digest('hex')
        .substring(0, 32);
    const storedName = `${encryptedName}${ext || '.bin'}`;
    // Relatif: 2026/09/19/images/e8f49a1b...jpg
    const relativeSubDir = path.join(year, month, day, mediaType);
    const targetDir = path.resolve(baseUploadDir, relativeSubDir);
    // Pastikan direktori fisik sudah ada (recursive)
    await fs.promises.mkdir(targetDir, { recursive: true });
    const relativePath = path.posix.join(year, month, day, mediaType, storedName);
    return {
        targetDir,
        storedName,
        mediaType,
        relativePath,
    };
}
