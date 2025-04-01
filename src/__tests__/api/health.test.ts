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
}); 