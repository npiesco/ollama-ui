// /ollama-ui/src/app/api/models/pull/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface PullModelRequest {
  name: string;
  tag?: string;
}

interface PullModelResponse {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export async function POST(request: Request): Promise<NextResponse<PullModelResponse | { error: string }> | Response> {
  try {
    const body: PullModelRequest = await request.json();
    const { name, tag } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, tag }),
    });

    if (!response.ok) {
      throw new Error('Failed to pull model');
    }

    // If the response is a stream, return it directly
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error pulling model:', error);
    return NextResponse.json(
      { error: 'Failed to pull model' },
      { status: 500 }
    );
  }
} 