// src/components/MultimodalInput.tsx
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MultimodalInputProps {
  onImageSelect: (base64Image: string) => void;
  existingImage: File | null;
}

export function MultimodalInput({ onImageSelect, existingImage }: MultimodalInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64.split(',')[1]); // Remove data:image/... prefix
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button onClick={() => fileInputRef.current?.click()}>
        Upload Image
      </Button>

      {preview && (
        <div className="relative w-32 h-32">
          <img src={preview} alt="Preview" className="object-cover rounded-lg" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-0 right-0"
            onClick={() => {
              setPreview(null);
              onImageSelect('');
            }}
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
} 