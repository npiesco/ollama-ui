// /ollama-ui/src/app/api/blobs/delete/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { digest } = await request.json();
    
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/blobs/${digest}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete blob';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 