// src/__tests__/api/models.test.ts
import { GET } from '@/app/api/models/route';

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

describe('Models API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and empty models array when Ollama is healthy', async () => {
    // Mock successful response with empty models
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ models: [] })
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ models: [] });
  });

  it('should return 500 when Ollama is not healthy', async () => {
    // Mock failed response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch models'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch models'
    });
  });
}); 