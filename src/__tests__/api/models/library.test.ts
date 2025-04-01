import { GET } from '@/app/api/models/library/route'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200
    }))
  }
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Library Models API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 200 and empty models array when Ollama is healthy', async () => {
    // Mock successful response with empty HTML
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(`
        <html>
          <body>
            <ul>
              <!-- No model elements -->
            </ul>
          </body>
        </html>
      `)
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ models: [] })
  })

  it('should return 500 when Ollama is not healthy', async () => {
    // Mock failed response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch models from library'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to fetch models from library'
    })
  })

  it('should parse model data correctly', async () => {
    // Mock successful response with a model
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(`
        <html>
          <body>
            <ul>
              <li x-test-model>
                <div x-test-model-title title="llama2">Llama 2</div>
                <div class="text-neutral-800">A powerful language model</div>
                <div x-test-size>7B</div>
                <div x-test-capability>chat</div>
                <div x-test-pull-count>1000</div>
                <div x-test-tag-count>5</div>
                <div x-test-updated>2024-03-20</div>
              </li>
            </ul>
          </body>
        </html>
      `)
    })

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      models: [{
        name: 'llama2',
        description: 'A powerful language model',
        parameterSizes: ['7B'],
        capabilities: ['chat'],
        pullCount: '1000',
        tagCount: '5',
        lastUpdated: '2024-03-20'
      }]
    })
  })
}) 