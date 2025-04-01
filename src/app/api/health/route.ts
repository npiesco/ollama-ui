// ollama-ui/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(): Promise<NextResponse> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/health`);
    const data = await response.json();

    return NextResponse.json({
      status: 'healthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST
      },
      ollama: {
        host: config.OLLAMA_API_HOST,
        status: 'connected',
        version: data.version
      }
    });
  } catch (error) {
    console.error('Error checking health:', error);
    return NextResponse.json({
      status: 'unhealthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST
      },
      ollama: {
        host: config.OLLAMA_API_HOST,
        status: 'disconnected',
        version: null
      }
    }, { status: 503 });
  }
} 