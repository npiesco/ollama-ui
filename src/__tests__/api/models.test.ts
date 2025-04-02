// src/__tests__/api/models.test.ts
import { GET } from '@/app/api/models/route';

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

    const response = await GET(new Request('http://localhost/api/models'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ models: [] });
  });

  it('should return 503 when Ollama is not healthy', async () => {
    // Mock failed response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch models'));

    const response = await GET(new Request('http://localhost/api/models'));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      error: 'Failed to fetch models from Ollama'
    });
  });

  it('returns models when Ollama is available', async () => {
    const mockModels = [
      { 
        name: 'model1', 
        size: 1000, 
        digest: 'abc123',
        modified_at: '2024-01-01',
        details: {
          format: 'gguf',
          family: 'llama',
          parameter_size: '7B',
          quantization_level: 'Q4_K_M'
        }
      },
      { 
        name: 'model2', 
        size: 2000, 
        digest: 'def456',
        modified_at: '2024-01-02',
        details: {
          format: 'gguf',
          family: 'llama',
          parameter_size: '13B',
          quantization_level: 'Q4_K_M'
        }
      }
    ];

    const mockResponse = new Response(JSON.stringify({ models: mockModels }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    Object.defineProperty(mockResponse, 'ok', { value: true });
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const response = await GET(new Request('http://localhost:3000/api/models'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ models: mockModels });
  });

  it('returns error when Ollama is not available', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection failed'));

    const response = await GET(new Request('http://localhost:3000/api/models'));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Failed to fetch models from Ollama' });
  });

  it('returns error when Ollama returns error response', async () => {
    // Mock fetch to simulate error response
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Internal server error'))
    });

    const request = new Request('http://localhost:3000/api/models');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      error: 'Failed to fetch models from Ollama'
    });
  });
}); 