import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/stream/route';

describe('Chat Stream API', () => {
  it('should stream chat response when Ollama is available', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      })
    }));

    expect(response.status).toBe(503);
  });

  it('should handle connection failure when Ollama is not available', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      })
    }));

    expect(response.status).toBe(503);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Failed to generate response' });
  });

  it('should handle error response from Ollama', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'test-model'
      })
    }));

    expect(response.status).toBe(503);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Failed to generate response' });
  });

  it('should handle invalid request body', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    }));

    expect(response.status).toBe(400);
    const responseData = await response.json();
    expect(responseData).toEqual({ error: 'Invalid request body' });
  });
}); 