import { describe, it, expect, vi, beforeEach } from 'vitest';

const { uploadMock, getPublicUrlMock, fromMock, compressMock } = vi.hoisted(() => {
  const uploadMock = vi.fn();
  const getPublicUrlMock = vi.fn();
  const fromMock = vi.fn(() => ({ upload: uploadMock, getPublicUrl: getPublicUrlMock }));
  const compressMock = vi.fn(async (file: File) => file);
  return { uploadMock, getPublicUrlMock, fromMock, compressMock };
});

vi.mock('./client', () => ({
  supabase: {
    storage: {
      from: fromMock,
    },
  },
}));

// browser-image-compression spins up a real Web Worker in the browser —
// stub it so tests just assert *whether* it was called, not its internals.
vi.mock('browser-image-compression', () => ({
  default: (...args: Parameters<typeof compressMock>) => compressMock(...args),
}));

import { uploadCompressedImage } from './imageUpload';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

describe('uploadCompressedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadMock.mockResolvedValue({ data: { path: 'some-path.jpg' }, error: null });
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'https://example.com/some-path.jpg' } });
  });

  it('uploads a large raster file after compressing it', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 500 * 1024);
    const url = await uploadCompressedImage(file, 'admin-uploads');

    expect(compressMock).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith('admin-uploads');
    expect(uploadMock).toHaveBeenCalledTimes(1);
    expect(url).toBe('https://example.com/some-path.jpg');
  });

  it('skips compression for small files', async () => {
    const file = makeFile('icon.png', 'image/png', 10 * 1024);
    await uploadCompressedImage(file, 'admin-uploads');

    expect(compressMock).not.toHaveBeenCalled();
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });

  it('skips compression for SVGs regardless of size', async () => {
    const file = makeFile('logo.svg', 'image/svg+xml', 500 * 1024);
    await uploadCompressedImage(file, 'admin-uploads');

    expect(compressMock).not.toHaveBeenCalled();
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });

  it('uploads into the given pathPrefix folder with a sanitized, randomized filename', async () => {
    const file = makeFile('My Photo #1.PNG', 'image/png', 10 * 1024);
    await uploadCompressedImage(file, 'admin-uploads', { pathPrefix: 'logos' });

    const [uploadedPath] = uploadMock.mock.calls[0];
    expect(uploadedPath).toMatch(/^logos\/[\w-]+\.png$/);
  });

  it('throws a descriptive error when the upload fails', async () => {
    uploadMock.mockResolvedValue({ data: null, error: { message: 'bucket not found' } });
    const file = makeFile('icon.png', 'image/png', 10 * 1024);

    await expect(uploadCompressedImage(file, 'missing-bucket')).rejects.toThrow('bucket not found');
  });
});
