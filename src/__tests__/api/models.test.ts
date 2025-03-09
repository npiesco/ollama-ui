// src/__tests__/api/models.test.ts
import { GET } from '@/app/api/models/route'
import { config } from '@/lib/config'

// Mock NextResponse
const mockJson = jest.fn()
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      mockJson(data, init)
      return {
        ...data,
        status: init?.status || 200,
        json: () => Promise.resolve(data)
      }
    }
  }
}))

// Mock global Request and Response objects
global.Request = class {
  constructor(public url: string, public init?: RequestInit) {}
  json() {
    return Promise.resolve({})
  }
} as any

global.Response = class {
  constructor(public body: any, public init?: ResponseInit) {}
  json() {
    return Promise.resolve(this.body)
  }
} as any

// Set up test environment
const setupTestEnv = () => {
  // Mock fetch
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      status: 200,
      statusText: "OK",
      headers: new Headers(),
    } as Response)
  )

  // Mock Headers
  global.Headers = class Headers {
    constructor(init?: HeadersInit) {}
    append(name: string, value: string): void {}
    delete(name: string): void {}
    get(name: string): string | null { return null }
    has(name: string): boolean { return false }
    set(name: string, value: string): void {}
    forEach(callback: (value: string, name: string) => void): void {}
  } as any
}

describe('Models API', () => {
  beforeEach(() => {
    setupTestEnv()
    jest.clearAllMocks()
    mockJson.mockClear()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should return models when fetch is successful', async () => {
    const mockModels = [
      {
        name: 'mock-model',
        modified_at: '2024-03-09T00:00:00Z',
        size: 1000000,
        digest: 'mock-digest',
        details: {
          format: 'gguf',
          family: 'mock-family',
          parameter_size: '7B',
          quantization_level: 'Q4_0'
        }
      }
    ]

    // Mock global fetch
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: mockModels })
      })
    )

    const response = await GET()
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ models: mockModels })

    expect(global.fetch).toHaveBeenCalledWith(`${config.OLLAMA_API_HOST}/api/tags`, {
      method: 'GET'
    })
    expect(mockJson).toHaveBeenCalledWith({ models: mockModels }, undefined)
  })

  it('should handle fetch error with appropriate error response', async () => {
    // Mock global fetch to return error
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    )

    const response = await GET()
    expect(response).toBeDefined()
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Failed to fetch models' })

    expect(global.fetch).toHaveBeenCalledWith(`${config.OLLAMA_API_HOST}/api/tags`, {
      method: 'GET'
    })
    expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch models' }, { status: 500 })
  })

  it('should handle network error with appropriate error response', async () => {
    // Mock global fetch to throw network error
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    )

    const response = await GET()
    expect(response).toBeDefined()
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Network error' })

    expect(global.fetch).toHaveBeenCalledWith(`${config.OLLAMA_API_HOST}/api/tags`, {
      method: 'GET'
    })
    expect(mockJson).toHaveBeenCalledWith({ error: 'Network error' }, { status: 500 })
  })

  it('should handle malformed response data', async () => {
    // Mock global fetch to return malformed data
    ;(global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ invalid: 'response' })
      })
    )

    const response = await GET()
    expect(response).toBeDefined()
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ models: undefined })

    expect(global.fetch).toHaveBeenCalledWith(`${config.OLLAMA_API_HOST}/api/tags`, {
      method: 'GET'
    })
    expect(mockJson).toHaveBeenCalledWith({ models: undefined }, undefined)
  })
}) 