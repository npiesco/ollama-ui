// /ollama-ui/src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Ollama response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error response:', errorText);
      throw new Error(errorText || 'Chat request failed');
    }

    // Get the response stream
    const stream = response.body;
    if (!stream) {
      throw new Error('No response stream available');
    }

    // Return the stream directly
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 