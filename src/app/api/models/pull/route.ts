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

    console.log(`Pulling model: ${name}${tag ? `:${tag}` : ''}`)
    
    // First check if the model is already installed
    const checkResponse = await fetch(`${config.OLLAMA_API_HOST}/api/tags`)
    if (checkResponse.ok) {
      const { models } = await checkResponse.json()
      const isInstalled = models.some((model: any) => model.name === name)
      if (isInstalled) {
        return NextResponse.json({ status: 'success', message: 'Model already installed' })
      }
    }

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: tag ? `${name}:${tag}` : name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to pull model')
    }

    // Handle both application/x-ndjson and text/event-stream responses
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/x-ndjson') || contentType?.includes('text/event-stream')) {
      // Create a TransformStream to process the response
      const stream = new TransformStream({
        async transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk)
          const lines = text.split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              // Ensure each line is properly formatted as a JSON string with a newline
              controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'))
            } catch (e) {
              console.error('Failed to parse line:', line, e)
              // Send error status
              controller.enqueue(new TextEncoder().encode(JSON.stringify({ 
                status: 'error', 
                error: 'Failed to parse response from Ollama' 
              }) + '\n'))
            }
          }
        }
      })

      // Create a new response with the transformed stream
      const transformedResponse = new Response(response.body?.pipeThrough(stream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Transfer-Encoding': 'chunked'
        },
      })

      return transformedResponse
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error pulling model:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to pull model' },
      { status: 500 }
    );
  }
} 