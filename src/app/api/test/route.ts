import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface TestResponse {
  status: string;
  message: string;
}

export async function GET(_request: Request): Promise<NextResponse<TestResponse | { error: string }>> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to connect to Ollama server');
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Successfully connected to Ollama server'
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Ollama server' },
      { status: 503 }
    );
  }
} 