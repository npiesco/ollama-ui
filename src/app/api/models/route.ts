// /ollama-ui/src/app/api/models/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config'

export async function GET() {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return NextResponse.json(data.models);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 