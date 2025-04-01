// /ollama-ui/src/app/api/blobs/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface BlobResponse {
  digest: string;
  size: number;
  mediaType: string;
}

export async function GET(_request: Request): Promise<NextResponse<BlobResponse[] | { error: string }>> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/blobs`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blobs');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching blobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blobs' },
      { status: 500 }
    );
  }
} 