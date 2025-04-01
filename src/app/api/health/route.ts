// ollama-ui/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/health`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error checking health:', error);
    return NextResponse.json(
      { error: 'Failed to check health' },
      { status: 500 }
    );
  }
} 