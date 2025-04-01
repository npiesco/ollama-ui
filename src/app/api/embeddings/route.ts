// src/app/api/embeddings/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface EmbeddingsRequest {
  model: string;
  prompt: string;
}

interface EmbeddingsResponse {
  embedding: number[];
}

export async function POST(request: Request): Promise<NextResponse<EmbeddingsResponse | { error: string }>> {
  try {
    // Parse request body
    const body: EmbeddingsRequest = await request.json();
    const { model, prompt } = body;
    
    // Validate required fields
    if (!model || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: model and prompt' },
        { status: 400 }
      );
    }

    // Forward request to Ollama API
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, prompt }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to generate embeddings' }));
      
      // Special handling for model not found
      if (error.error?.includes('not found')) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }

      throw new Error(error.error || 'Failed to generate embeddings');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Embeddings API error:', err);
    
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
} 