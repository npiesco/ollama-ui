// /ollama-ui/src/app/api/models/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config'

interface ModelResponse {
  models: Array<{
    name: string;
    size: number;
    digest: string;
    modified_at: string;
    details: {
      format: string;
      family: string;
      parameter_size: string;
      quantization_level: string;
    };
  }>;
}

export async function GET(_request: Request): Promise<NextResponse<ModelResponse | { error: string }>> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
} 