// src/__tests__/api/embeddings.test.ts
import { POST } from '@/app/api/embeddings/route'
import { config } from '@/lib/config'
import { NextResponse } from 'next/server'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ ...data, status: init?.status }))
  }
}))

describe('Embeddings API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate embeddings successfully', async () => {
    const mockEmbeddings = [[0.1, 0.2, 0.3]]
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ embeddings: mockEmbeddings })
      } as Response)
    )

    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text',
        input: 'test text'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.embeddings).toEqual(mockEmbeddings)
    expect(global.fetch).toHaveBeenCalledWith(
      `${config.OLLAMA_API_HOST}/api/embeddings`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          model: 'nomic-embed-text',
          input: 'test text'
        })
      })
    )
  })

  it('should handle model not found error', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'model not found'
        })
      } as Response)
    )

    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text',
        input: 'test text'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Model not found')
  })

  it('should handle invalid request body', async () => {
    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: 'invalid json'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/Invalid request body/)
  })

  it('should handle missing required fields', async () => {
    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toMatch(/Missing required fields/)
  })

  it('should handle API errors', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    )

    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text',
        input: 'test text'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('API Error')
  })

  it('should handle non-JSON API responses', async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Internal Server Error'),
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response)
    )

    const request = new Request('http://localhost:3000/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text',
        input: 'test text'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toMatch(/Failed to generate embeddings/)
  })
}) 