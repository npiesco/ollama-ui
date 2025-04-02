// /ollama-ui/src/app/api/chat/stream/route.ts
import { NextRequest } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  console.log('Chat stream route: Received request');
  
  try {
    const body = await request.json();
    console.log('Chat stream route: Request body:', body);

    const { model, messages, stream = true } = body;

    if (!model || !messages) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400 }
      );
    }

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
      }),
    });

    console.log('Chat stream route: Ollama response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok
    });

    if (!response.ok) {
      console.log('Chat stream route: Ollama response not ok');
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }),
        { status: 503 }
      );
    }

    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    console.log('Chat stream route: Setting response headers:', Object.fromEntries(headers.entries()));

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.log('Chat stream route: Error:', error);
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400 }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 503 }
    );
  }
} 