// src/__tests__/api/embeddings.test.ts
import { POST } from '@/app/api/embeddings/route';
import { config } from '@/lib/config';
// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...data,
      status: init?.status || 200,
      json: async () => data
    }))
  }
}));

describe('Embeddings API', () => {
  const mockEmbeddings = [0.1, 0.2, 0.3];
  const mockRequest = new Request('http://localhost/api/embeddings', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama2',
      prompt: 'test prompt'
    })
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('should generate embeddings successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        embeddings: mockEmbeddings
      })
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.embeddings).toEqual(mockEmbeddings);
    expect(global.fetch).toHaveBeenCalledWith(
      `${config.OLLAMA_API_HOST}/api/embeddings`,
      expect.any(Object)
    );
  });

  it('should handle model not found error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({
        error: 'Model not found'
      })
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Model not found');
  });

  it('should handle invalid request body', async () => {
    const invalidRequest = new Request('http://localhost/api/embeddings', {
      method: 'POST',
      body: 'invalid json'
    });

    const response = await POST(invalidRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API Error');
  });

  it('should handle missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Missing required fields/);
  });

  it('should handle non-JSON API responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('Invalid JSON'); }
    });

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to generate embeddings');
  });
}); 