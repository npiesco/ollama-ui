// src/__tests__/api/health.test.ts
import { GET } from '@/app/api/health/route';

interface MockResponse extends Response {
  json: () => Promise<{ status: string }>;
}

interface MockErrorResponse extends Response {
  json: () => Promise<{ error: string }>;
}

const setupTestEnv = () => {
  // Mock fetch
  const mockResponse: MockResponse = {
    status: 200,
    json: async () => ({ status: 'ok' }),
  } as MockResponse;

  const mockErrorResponse: MockErrorResponse = {
    status: 500,
    json: async () => ({ error: 'Internal Server Error' }),
  } as MockErrorResponse;

  global.fetch = jest.fn().mockImplementation((url: string) => {
    if (url.includes('health')) {
      return Promise.resolve(mockResponse);
    }
    return Promise.resolve(mockErrorResponse);
  });

  // Mock Headers
  global.Headers = jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }));
};

describe('Health API', () => {
  beforeEach(() => {
    setupTestEnv();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and status ok when Ollama is healthy', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ status: 'ok' });
  });

  it('should return 500 when Ollama is not healthy', async () => {
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      } as MockErrorResponse)
    );

    const response = await GET();
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to check health' });
  });
}); 