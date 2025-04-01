import { GET } from '@/app/api/models/library/route'
import { config } from '@/lib/config'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), init)
      response.json = () => Promise.resolve(data)
      return response
    },
  },
}))

describe('Library API', () => {
  const mockRequest = new Request('http://localhost/api/models/library')

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('successfully fetches and parses library models', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        models: [
          {
            name: 'llama2',
            description: 'Llama 2 is a collection of foundation language models.',
            tags: ['base']
          }
        ]
      })
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(data.models).toHaveLength(1)
    expect(data.models[0]).toEqual({
      name: 'llama2',
      description: 'Llama 2 is a collection of foundation language models.',
      tags: ['base']
    })
  })

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch library models'))

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch library models')
  })

  it('handles empty model list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [] })
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(data.models).toHaveLength(0)
  })
}) 