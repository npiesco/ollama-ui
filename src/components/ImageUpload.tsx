// /ollama-ui/src/components/ImageUpload.tsx
import { type ChangeEvent, useState, useRef } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageUpload: (file: File) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input accept="image/*" className="hidden" ref={fileInputRef} type="file" onChange={handleFileChange} />
      <Button onClick={handleButtonClick}>Upload Image</Button>
      {preview && (
        <div className="mt-2">
          <Image
            alt="Upload preview"
            className="max-w-full h-auto"
            height={200}
            src={preview}
            width={200}
          />
        </div>
      )}
    </div>
  );
}

