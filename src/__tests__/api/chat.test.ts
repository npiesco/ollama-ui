import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

describe('Chat API', () => {
  it('returns chat response when Ollama is available', async () => {
    // Mock fetch to simulate successful chat response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        message: {
          role: 'assistant',
          content: 'Hello! How can I help you today?'
        }
      })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'test-model'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      message: {
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      }
    });
  });

  it('returns error when Ollama is not available', async () => {
    // Mock fetch to simulate connection failure
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'test-model'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ error: 'Failed to generate response' });
  });

  it('returns error when Ollama returns error response', async () => {
    // Mock fetch to simulate error from Ollama
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' })
    });

    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'test-model'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({ error: 'Failed to generate response' });
  });

  it('returns error when request body is invalid', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: 'invalid json'
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid request body' });
  });
}); 