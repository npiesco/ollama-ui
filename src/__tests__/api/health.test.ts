// src/__tests__/api/health.test.ts
import { GET } from '@/app/api/health/route';
import { config } from '@/lib/config';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }))
  }
}));

describe('Health API', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should return 200 and status ok when Ollama is healthy', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ version: '1.0.0' })
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'healthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST
      },
      ollama: {
        host: config.OLLAMA_API_HOST,
        status: 'connected',
        version: '1.0.0'
      }
    });
  });

  it('should return 503 when Ollama is not healthy', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Ollama API returned non-200 status'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'unhealthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST
      },
      ollama: {
        host: config.OLLAMA_API_HOST,
        status: 'disconnected',
        version: null
      }
    });
  });

  it('returns 200 when Ollama is available', async () => {
    const mockResponse = new Response(JSON.stringify({ version: '1.0.0' }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    Object.defineProperty(mockResponse, 'ok', { value: true });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      environment: {
        nodeEnv: expect.any(String),
        ollamaHost: expect.any(String)
      },
      ollama: {
        host: expect.any(String),
        status: 'connected',
        version: '1.0.0'
      }
    });
  });

  it('returns 503 when Ollama is not available', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const response = await GET();
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'unhealthy',
      environment: {
        nodeEnv: expect.any(String),
        ollamaHost: expect.any(String)
      },
      ollama: {
        host: expect.any(String),
        status: 'disconnected',
        version: null
      }
    });
  });

  it('returns unhealthy status when Ollama returns error', async () => {
    // Mock fetch to simulate error response
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Internal server error'))
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      status: 'unhealthy',
      environment: {
        nodeEnv: 'test',
        ollamaHost: expect.any(String)
      },
      ollama: {
        host: expect.any(String),
        status: 'disconnected',
        version: null
      }
    });
  });
}); 