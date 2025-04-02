import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/stream/route';

describe('Chat Stream API', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    (global.fetch as jest.Mock).mockReset();
  });

  it('should stream chat response when Ollama is available', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"response": "Hello"}\n\n'));
        controller.close();
      }
    });

    const mockResponse = new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
    Object.defineProperty(mockResponse, 'ok', { value: true });

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const requestBody = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true
    };

    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is null');
    }

    const { value } = await reader.read();
    const text = new TextDecoder().decode(value);
    expect(text).toContain('data: {"response": "Hello"}');
  });

  it('should handle connection failure when Ollama is not available', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const requestBody = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true
    };

    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }));

    expect(response.status).toBe(503);
    const responseData = await response.text();
    expect(responseData).toBe(JSON.stringify({ error: 'Failed to generate response' }));
  });

  it('should handle error response from Ollama', async () => {
    const mockResponse = new Response(JSON.stringify({ error: 'Ollama error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
    Object.defineProperty(mockResponse, 'ok', { value: false });

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const requestBody = {
      model: 'test-model',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: true
    };

    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    }));

    expect(response.status).toBe(503);
    const responseData = await response.text();
    expect(responseData).toBe(JSON.stringify({ error: 'Failed to generate response' }));
  });

  it('should handle invalid request body', async () => {
    const response = await POST(new NextRequest('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    }));

    expect(response.status).toBe(400);
    const responseData = await response.text();
    expect(responseData).toBe(JSON.stringify({ error: 'Invalid request body' }));
  });
}); 