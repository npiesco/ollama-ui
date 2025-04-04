// /ollama-ui/src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface Message {
  role: "user" | "assistant"
  content: string
  images?: string[]
}

interface RequestBody {
  messages: Message[]
  model: string
}

interface ChatResponse {
  message: Message;
  done: boolean;
}

export async function POST(request: Request): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    let body: RequestBody;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { messages, model } = body;

    // Format the messages with proper handling for images
    const formattedMessages = messages.map(msg => {
      // Properly format user messages with images according to Ollama API
      if (msg.role === 'user' && msg.images && msg.images.length > 0) {
        // Process images to ensure proper base64 format
        const processedImages = msg.images.map(img => {
          // If it's already a data URL, extract just the base64 part
          if (img.startsWith('data:')) {
            return img.split(',')[1]; // Extract base64 data without data URL prefix
          }
          return img; // Already base64 encoded
        });
        
        console.log(`[API] Processing message with ${processedImages.length} images`);
        
        // Return properly formatted message with images
        return {
          role: msg.role,
          content: msg.content,
          images: processedImages
        };
      }
      return msg;
    });

    console.log(`[API] Sending request to Ollama with model: ${model}, messages: ${formattedMessages.length}`);

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error(`[API] Error from Ollama: ${response.status} ${response.statusText}`);
      throw new Error('Failed to get response from Ollama');
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 503 }
    );
  }
} 