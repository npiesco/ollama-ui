// /ollama-ui/src/app/api/blobs/delete/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface DeleteBlobResponse {
  status: string;
}

export async function DELETE(request: Request): Promise<NextResponse<DeleteBlobResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const digest = searchParams.get('digest');

    if (!digest) {
      return NextResponse.json(
        { error: 'Digest is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/blobs/${digest}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete blob');
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error deleting blob:', error);
    return NextResponse.json(
      { error: 'Failed to delete blob' },
      { status: 500 }
    );
  }
} 