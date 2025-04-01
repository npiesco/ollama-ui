import { GET } from '@/app/api/models/library/route'

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

// Mock fetch
global.fetch = jest.fn()

describe('Library API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('successfully fetches and parses library models', async () => {
    // Mock the HTML response
    const mockHtml = `
      <li x-test-model>
        <div x-test-model-title title="llama2"></div>
        <div class="text-neutral-800">Llama 2 is a collection of foundation language models.</div>
        <div x-test-size>7b</div>
        <div x-test-size>13b</div>
        <div x-test-capability>tools</div>
        <div x-test-pull-count>3.1M</div>
        <div x-test-tag-count>102</div>
        <div x-test-updated>15 months ago</div>
      </li>
    `

    // Mock fetch response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    })

    const response = await GET()
    const data = await response.json()

    expect(data.models).toHaveLength(1)
    expect(data.models[0]).toEqual({
      name: 'llama2',
      description: 'Llama 2 is a collection of foundation language models.',
      parameterSizes: ['7b', '13b'],
      capabilities: ['tools'],
      pullCount: '3.1M',
      tagCount: '102',
      lastUpdated: '15 months ago',
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock fetch error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch models from library'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to fetch models from library')
  })

  it('handles empty model list', async () => {
    // Mock empty HTML response
    const mockHtml = '<div></div>'

    // Mock fetch response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    })

    const response = await GET()
    const data = await response.json()

    expect(data.models).toHaveLength(0)
  })
}) 