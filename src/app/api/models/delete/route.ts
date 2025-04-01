// /ollama-ui/src/app/api/models/delete/route.ts
import { NextResponse } from 'next/server';

import { config } from '@/lib/config';

interface DeleteModelResponse {
  status: string;
}

export async function DELETE(request: Request): Promise<NextResponse<DeleteModelResponse | { error: string }>> {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Model name is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete model');
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
} 