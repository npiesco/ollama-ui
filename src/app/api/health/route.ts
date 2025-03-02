// ollama-ui/src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/version');
    if (!response.ok) {
      throw new Error('Ollama API returned non-200 status');
    }

    return NextResponse.json({
      status: 'healthy',
      ollama: {
        status: 'connected',
        version: (await response.json()).version
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      ollama: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 503 });
  }
} 