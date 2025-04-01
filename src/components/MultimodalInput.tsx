// src/components/MultimodalInput.tsx
import { useRef } from 'react';
import Image from 'next/image';

import { Button } from './ui/button';
import { Input } from './ui/input';

interface MultimodalInputProps {
  onImageSelect: (image: File | null) => void;
  imagePreview: string | null;
}

export function MultimodalInput({ onImageSelect, imagePreview }: MultimodalInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    onImageSelect(file);
  };

  return (
    <div className="space-y-4">
      <Input 
        accept="image/*" 
        className="hidden"
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
      />
      
      <Button onClick={() => fileInputRef.current?.click()}>
        Upload Image
      </Button>

      {imagePreview && (
        <div className="relative w-32 h-32">
          <Image
            fill
            alt="Preview"
            className="object-contain"
            sizes="(max-width: 128px) 100vw, 128px"
            src={imagePreview}
          />
        </div>
      )}
    </div>
  );
} 