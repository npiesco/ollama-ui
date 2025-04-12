import { isModelInstalled } from '@/lib/model-verification'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Model Verification', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('returns true when model is installed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'llama2:7b' },
          { name: 'mistral:instruct' }
        ]
      })
    })

    const result = await isModelInstalled('llama2')
    expect(result).toBe(true)
  })

  it('returns true when model with specific tag is installed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'llama2:7b' },
          { name: 'mistral:instruct' }
        ]
      })
    })

    const result = await isModelInstalled('llama2:7b')
    expect(result).toBe(true)
  })

  it('returns false when model is not installed', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'llama2:7b' },
          { name: 'mistral:instruct' }
        ]
      })
    })

    const result = await isModelInstalled('phi')
    expect(result).toBe(false)
  })

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error'
    })

    const result = await isModelInstalled('llama2')
    expect(result).toBe(false)
  })

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await isModelInstalled('llama2')
    expect(result).toBe(false)
  })
}) 