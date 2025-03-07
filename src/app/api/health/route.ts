// ollama-ui/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/version`);
    if (!response.ok) {
      throw new Error('Ollama API returned non-200 status');
    }

    const versionData = await response.json();

    return NextResponse.json({
      status: 'healthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST,
      },
      ollama: {
        status: 'connected',
        version: versionData.version,
        host: config.OLLAMA_API_HOST
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST,
      },
      ollama: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        host: config.OLLAMA_API_HOST
      }
    }, { status: 503 });
  }
} 