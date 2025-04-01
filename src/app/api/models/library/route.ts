import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface LibraryModel {
  name: string;
  description: string;
  tags: string[];
  size: number;
  digest: string;
  modified_at: string;
  details: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export async function GET(_request: Request): Promise<NextResponse<LibraryModel[] | { error: string }>> {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/library`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch library models');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching library models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library models' },
      { status: 500 }
    );
  }
} 