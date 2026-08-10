import imageCompression from 'browser-image-compression';
import { supabase } from './client';

// Below this, compression is skipped — re-encoding an already-small file
// (most logos/icons/avatars) risks quality loss for no real size gain.
const SKIP_COMPRESSION_BELOW_BYTES = 150 * 1024;

async function compressIfNeeded(file: File, maxWidthOrHeight: number): Promise<File> {
  if (file.type === 'image/svg+xml' || file.size < SKIP_COMPRESSION_BELOW_BYTES) {
    return file;
  }
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type,
  });
}

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf('.');
  const ext = lastDot >= 0 ? name.slice(lastDot + 1) : '';
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin';
  return `${crypto.randomUUID()}.${safeExt}`;
}

export interface UploadCompressedImageOptions {
  // Small graphics (avatars/logos/icons) compress to a tighter max dimension
  // than banner-style images. Defaults to a banner-sized 1920px.
  maxWidthOrHeight?: number;
  pathPrefix?: string;
}

// Compresses (raster images only — SVGs pass through untouched) and uploads
// `file` to an already-provisioned Supabase Storage bucket, returning its
// public URL. Buckets are provisioned via migration ahead of time (see
// supabase/migrations) — this never attempts to create one, since the
// client's anon/authenticated role has no RLS grant to do so.
export async function uploadCompressedImage(
  file: File,
  bucket: string,
  options: UploadCompressedImageOptions = {}
): Promise<string> {
  const { maxWidthOrHeight = 1920, pathPrefix } = options;

  try {
    const compressed = await compressIfNeeded(file, maxWidthOrHeight);
    const fileName = sanitizeFileName(file.name);
    const path = pathPrefix ? `${pathPrefix}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, compressed, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
}
