// /ollama-ui/src/app/api/blobs/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/blobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return NextResponse.json(data.blobs || []);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blobs';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 