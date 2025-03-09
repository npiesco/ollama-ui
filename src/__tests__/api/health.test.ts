// src/__tests__/api/health.test.ts
import { GET } from '@/app/api/health/route';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...data,
      status: init?.status || (data.status === 'healthy' ? 200 : 503),
      json: () => Promise.resolve(data)
    }))
  }
}));

// Mock global Request and Response objects
global.Request = class {
  constructor(public url: string, public init?: RequestInit) {}
  json() {
    return Promise.resolve({ version: '1.0.0' });
  }
} as any;

global.Response = class {
  constructor(public body: any, public init?: ResponseInit) {}
  json() {
    return Promise.resolve(this.body);
  }
} as any;

// Set up test environment
const setupTestEnv = () => {
  // Mock fetch
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ version: '1.0.0' }),
      status: 200,
      statusText: "OK",
      headers: new Headers(),
    } as Response)
  );

  // Mock Headers
  global.Headers = class Headers {
    constructor(init?: HeadersInit) {}
    append(name: string, value: string): void {}
    delete(name: string): void {}
    get(name: string): string | null { return null; }
    has(name: string): boolean { return false; }
    set(name: string, value: string): void {}
    forEach(callback: (value: string, name: string) => void): void {}
  } as any;
};

describe('Health API', () => {
  beforeEach(() => {
    setupTestEnv();
    jest.clearAllMocks();
  });

  it('should return healthy status with environment info', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    
    expect(data).toEqual({
      status: 'healthy',
      environment: {
        nodeEnv: 'test',
        ollamaHost: 'http://ollama:11434',
      },
      ollama: {
        status: 'connected',
        version: '1.0.0',
        host: 'http://ollama:11434'
      }
    });
  });

  it('should return unhealthy status when Ollama returns non-200', async () => {
    process.env.MOCK_SERVER_ERROR = 'true';
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers(),
      } as Response)
    );

    const response = await GET();
    expect(response.status).toBe(503);
    const data = await response.json();

    expect(data).toEqual({
      status: 'unhealthy',
      environment: {
        nodeEnv: 'test',
        ollamaHost: expect.any(String),
      },
      ollama: {
        status: 'disconnected',
        error: 'Ollama API returned non-200 status',
        host: expect.any(String)
      }
    });
  });

  it('should return unhealthy status when Ollama is not reachable', async () => {
    process.env.MOCK_SERVER_DOWN = 'true';
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('ECONNREFUSED'))
    );

    const response = await GET();
    expect(response.status).toBe(503);
    const data = await response.json();

    expect(data).toEqual({
      status: 'unhealthy',
      environment: {
        nodeEnv: 'test',
        ollamaHost: expect.any(String),
      },
      ollama: {
        status: 'disconnected',
        error: 'ECONNREFUSED',
        host: expect.any(String)
      }
    });
  });

  it('should use default OLLAMA_API_HOST in test environment', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();

    // In test environment, we expect the default host
    expect(data).toEqual({
      status: 'healthy',
      environment: {
        nodeEnv: 'test',
        ollamaHost: 'http://ollama:11434',
      },
      ollama: {
        status: 'connected',
        version: '1.0.0',
        host: 'http://ollama:11434'
      }
    });
  });
}); 