// /ollama-ui/src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export async function POST(request: Request): Promise<NextResponse<LoginResponse | { error: string }>> {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
}

