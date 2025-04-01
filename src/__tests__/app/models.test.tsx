import { GET } from '@/app/api/models/route'
import { config } from '@/lib/config'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    })
  }
}))

describe('Models API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches local models from Ollama API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ models: [] })
    })

    const response = await GET(new Request('http://localhost/api/models'))
    const data = await response.json()

    expect(data).toEqual({ models: [] })
    expect(mockFetch).toHaveBeenCalledWith(
      `${config.OLLAMA_API_HOST}/api/tags`,
      { method: 'GET' }
    )
  })

  it('handles API errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const response = await GET(new Request('http://localhost/api/models'))
    const data = await response.json()

    expect(data).toEqual({ error: 'Failed to fetch models' })
  })
}) 