// src/app/blobs/page.tsx
"use client"

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BlobManagement() {
  const [file, setFile] = useState<File | null>(null);
  const [digest, setDigest] = useState('');

  const uploadBlob = async () => {
    if (!file || !digest) return;

    try {
      const response = await fetch(`http://localhost:11434/api/blobs/${digest}`, {
        method: 'POST',
        body: file
      });

      if (response.ok) {
        toast.success('Blob uploaded successfully');
      } else {
        throw new Error('Failed to upload blob');
      }
    } catch (error) {
      toast.error('Error uploading blob');
    }
  };

  const checkBlob = async () => {
    try {
      const response = await fetch(`http://localhost:11434/api/blobs/${digest}`, {
        method: 'HEAD'
      });

      toast.info(`Blob ${response.ok ? 'exists' : 'does not exist'}`);
    } catch (error) {
      toast.error('Error checking blob');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Blob Management</h1>
      
      <div className="space-y-2">
        <Input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        
        <Input
          placeholder="SHA256 Digest"
          value={digest}
          onChange={(e) => setDigest(e.target.value)}
        />
        
        <div className="space-x-2">
          <Button onClick={uploadBlob}>Upload Blob</Button>
          <Button variant="secondary" onClick={checkBlob}>Check Blob</Button>
        </div>
      </div>
    </div>
  );
} 