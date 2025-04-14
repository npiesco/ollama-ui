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
  let originalToISOString: any;
  
  beforeEach(() => {
    // Save the original toISOString method
    originalToISOString = Date.prototype.toISOString;
    // Mock toISOString to return a fixed string
    Date.prototype.toISOString = jest.fn(() => '2025-04-14T02:34:44.095Z');
    // Mock process.env.npm_package_version
    process.env.npm_package_version = '0.1.0';
  });
  
  afterEach(() => {
    // Restore original toISOString method
    Date.prototype.toISOString = originalToISOString;
  });

  it('should return 200 and status healthy', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'healthy',
      environment: {
        nodeEnv: config.NODE_ENV,
        ollamaHost: config.OLLAMA_API_HOST
      },
      timestamp: '2025-04-14T02:34:44.095Z',
      version: '0.1.0'
    });
  });

  it('should return 503 when an error occurs', async () => {
    // Create a mock implementation that throws an error
    const originalNextResponseJson = require('next/server').NextResponse.json;
    require('next/server').NextResponse.json = jest.fn().mockImplementationOnce(() => {
      throw new Error('Test error');
    }).mockImplementationOnce((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toMatchObject({
      status: 'unhealthy',
      error: 'Test error',
      timestamp: '2025-04-14T02:34:44.095Z'
    });

    // Restore the original implementation
    require('next/server').NextResponse.json = originalNextResponseJson;
  });
}); 