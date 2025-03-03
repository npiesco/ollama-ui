// src/__tests__/api/health.test.ts
import { GET } from '@/app/api/health/route';

describe('Health Check API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    delete process.env.MOCK_SERVER_DOWN;
    delete process.env.MOCK_SERVER_ERROR;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return healthy status when Ollama is running', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'healthy',
      ollama: {
        status: 'connected',
        version: '0.1.0'
      }
    });
  });

  it('should return unhealthy status when Ollama returns non-200', async () => {
    process.env.MOCK_SERVER_ERROR = 'true';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'unhealthy',
      ollama: {
        status: 'disconnected',
        error: 'Ollama API returned non-200 status'
      }
    });
  });

  it('should return unhealthy status when Ollama is not reachable', async () => {
    process.env.MOCK_SERVER_DOWN = 'true';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      status: 'unhealthy',
      ollama: {
        status: 'disconnected',
        error: expect.stringContaining('ECONNREFUSED')
      }
    });
  });

  it('should use OLLAMA_API_HOST from environment when set', async () => {
    process.env.OLLAMA_API_HOST = 'http://localhost:11435';

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'healthy',
      ollama: {
        status: 'connected',
        version: '0.2.0'
      }
    });
  });
}); 