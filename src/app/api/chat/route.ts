// /ollama-ui/src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface Message {
  role: "user" | "assistant"
  content: string
}

interface RequestBody {
  messages: Message[]
}

interface ChatResponse {
  message: Message;
  done: boolean;
}

export async function POST(request: Request): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const body: RequestBody = await request.json();
    const { messages } = body;

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama2",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 