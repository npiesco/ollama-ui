import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/version`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch version' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch version' }, { status: 500 });
  }
}
