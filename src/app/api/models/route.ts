// /ollama-ui/src/app/api/models/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return NextResponse.json(data.models);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 