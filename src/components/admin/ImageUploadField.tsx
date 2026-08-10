import { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { uploadCompressedImage } from '@/integrations/supabase/imageUpload';

interface ImageUploadFieldProps {
  value: string | null | undefined;
  onChange: (url: string) => void;
  bucket: string;
  pathPrefix?: string;
  // Small graphics (avatars/logos/icons) — compress to a tighter dimension
  // than the 1920px banner-image default.
  maxWidthOrHeight?: number;
  label?: string;
}

export function ImageUploadField({
  value,
  onChange,
  bucket,
  pathPrefix,
  maxWidthOrHeight,
  label,
}: ImageUploadFieldProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadCompressedImage(file, bucket, { pathPrefix, maxWidthOrHeight });
      onChange(url);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.message || `Failed to upload ${label?.toLowerCase() || 'image'}.`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value ? (
        <img
          src={value}
          alt={label || 'Preview'}
          className="w-12 h-12 rounded-md object-cover border border-border shrink-0 bg-muted"
        />
      ) : (
        <div className="w-12 h-12 rounded-md border border-dashed border-border shrink-0 bg-muted" />
      )}
      <Input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a URL, or upload a file"
        className="flex-1"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading…' : 'Upload'}
      </Button>
    </div>
  );
}
