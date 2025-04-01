// src/components/MultimodalInput.tsx
import { useRef } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

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

  const handleRemove = () => {
    onImageSelect(null);
  };

  return (
    <div className="space-y-4">
      <Input 
        accept="image/*" 
        className="hidden"
        data-testid="file-input"
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
      />
      
      {!imagePreview ? (
        <Button onClick={() => fileInputRef.current?.click()}>
          Upload Image
        </Button>
      ) : (
        <Button variant="destructive" onClick={handleRemove}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </Button>
      )}

      {imagePreview && (
        <div className="relative w-32 h-32">
          <Image
            src={imagePreview}
            alt="Selected image"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
} 