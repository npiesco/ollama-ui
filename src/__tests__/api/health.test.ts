// src/__tests__/api/health.test.ts
import { NextResponse } from 'next/server';
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

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Health API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and status ok when Ollama is healthy', async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ version: '1.0.0' })
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'healthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST,
      },
      ollama: {
        status: 'connected',
        version: '1.0.0',
        host: config.OLLAMA_API_HOST
      }
    });
  });

  it('should return 503 when Ollama is not healthy', async () => {
    // Mock failed response
    mockFetch.mockRejectedValueOnce(new Error('Ollama API returned non-200 status'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'unhealthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST,
      },
      ollama: {
        status: 'disconnected',
        error: 'Ollama API returned non-200 status',
        host: config.OLLAMA_API_HOST
      }
    });
  });
}); 