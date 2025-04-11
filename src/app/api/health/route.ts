// ollama-ui/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(): Promise<NextResponse> {
  try {
    // Basic health check that doesn't depend on Ollama
    return NextResponse.json({
      status: 'healthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST
      },
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0'
    });
  } catch (error) {
    console.error('Error checking health:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 