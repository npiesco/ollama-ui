import { GET } from '@/app/api/models/route'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Main Models API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use HTML scraping from ollama.com/library', async () => {
    // Mock successful response with HTML from ollama.com/library
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

    // Verify the response contains the scraped data
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

    // Verify that fetch was called with the correct URL and HTML headers
    expect(mockFetch).toHaveBeenCalledWith(
      'https://ollama.com/library',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      })
    )
  })

  it('should fail if HTML scraping fails', async () => {
    // Mock failed response
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch from ollama.com/library'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to fetch from ollama.com/library'
    })
  })

  it('should handle malformed HTML gracefully', async () => {
    // Mock response with malformed HTML
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(`
        <html>
          <body>
            <ul>
              <li x-test-model>
                <!-- Missing required elements -->
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
        name: '',
        description: '',
        parameterSizes: [],
        capabilities: [],
        pullCount: '0',
        tagCount: '0',
        lastUpdated: ''
      }]
    })
  })

  it('should ONLY use HTML scraping and NEVER use JSON', async () => {
    // Create a spy to track which method is called
    const textSpy = jest.fn(() => Promise.resolve('<html><body></body></html>'))
    const jsonSpy = jest.fn()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: textSpy,
      json: jsonSpy
    })

    await GET()

    // Verify we called text() for HTML parsing and NEVER called json()
    expect(textSpy).toHaveBeenCalled()
    expect(jsonSpy).not.toHaveBeenCalled()
    
    // Verify we're requesting HTML
    expect(mockFetch).toHaveBeenCalledWith(
      'https://ollama.com/library',
      expect.objectContaining({
        headers: {
          'Accept': 'text/html'
        }
      })
    )
  })
}) 