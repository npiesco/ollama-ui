// /ollama-ui/src/app/api/ps/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface Process {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PsResponse {
  processes: Process[];
}

export async function GET(_request: Request): Promise<NextResponse<PsResponse | { error: string }>> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/ps`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch processes');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    );
  }
} 