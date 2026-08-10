import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploadField } from './ImageUploadField';

const { uploadCompressedImageMock } = vi.hoisted(() => ({ uploadCompressedImageMock: vi.fn() }));
vi.mock('@/integrations/supabase/imageUpload', () => ({
  uploadCompressedImage: (...args: any[]) => uploadCompressedImageMock(...args),
}));

describe('ImageUploadField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a preview thumbnail when a value is set', () => {
    render(
      <ImageUploadField value="https://example.com/logo.png" onChange={() => {}} bucket="admin-uploads" />
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('shows a placeholder box when there is no value', () => {
    render(<ImageUploadField value={null} onChange={() => {}} bucket="admin-uploads" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('lets an admin type a URL directly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ImageUploadField value="" onChange={onChange} bucket="admin-uploads" />);

    await user.type(screen.getByPlaceholderText('Paste a URL, or upload a file'), 'x');
    expect(onChange).toHaveBeenCalledWith('x');
  });

  it('uploads a selected file and calls onChange with the resulting URL', async () => {
    uploadCompressedImageMock.mockResolvedValue('https://example.com/uploaded.png');
    const onChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <ImageUploadField value="" onChange={onChange} bucket="admin-uploads" pathPrefix="logos" label="Logo" />
    );

    const file = new File(['abc'], 'logo.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://example.com/uploaded.png'));
    expect(uploadCompressedImageMock).toHaveBeenCalledWith(file, 'admin-uploads', {
      pathPrefix: 'logos',
      maxWidthOrHeight: undefined,
    });
  });

  it('toasts an error and stops the spinner when upload fails', async () => {
    uploadCompressedImageMock.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();

    const { container } = render(
      <ImageUploadField value="" onChange={() => {}} bucket="admin-uploads" label="Logo" />
    );

    const file = new File(['abc'], 'logo.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => expect(screen.getByRole('button', { name: /upload/i })).not.toBeDisabled());
  });
});
