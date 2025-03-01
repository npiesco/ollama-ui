// /ollama-ui/src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/chat`, {
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

    // Create a TransformStream to intercept and log the data
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Convert the chunk to text
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              
              // Format and log the JSON response
              if (parsed.message?.content) {
                // For regular messages
                process.stdout.write(parsed.message.content);
              } else if (parsed.done) {
                console.log('\n[Response Complete]');
              } else {
                // For JSON responses, pretty print them
                const formatted = JSON.stringify(parsed, null, 2);
                console.log('\nJSON Response:');
                console.log(formatted);
                console.log(); // Extra newline for readability
              }
            } catch (e) {
              console.error('Error parsing line:', e);
            }
          }
        }
        
        // Forward the chunk
        controller.enqueue(chunk);
      }
    });

    // Pipe through our transform stream
    const loggedStream = stream.pipeThrough(transformStream);

    // Return the transformed stream
    return new Response(loggedStream, {
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