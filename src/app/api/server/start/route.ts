// /ollama-ui/src/app/api/server/start/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface StartServerResponse {
  status: string;
}

export async function POST(_request: Request): Promise<NextResponse<StartServerResponse | { error: string }>> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/start`, {
      method: 'POST',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to start server' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ error: 'Failed to start server' }, { status: 500 });
  }
} 