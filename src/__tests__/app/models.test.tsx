import { GET } from '@/app/api/models/route'
import { config } from '@/lib/config'
import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import ModelsPage from '@/app/models/page'
import { toast } from 'sonner'

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

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

// Mock icons
jest.mock('lucide-react', () => ({
  CheckCircle2: () => <div data-testid="check-circle-icon">CheckCircle2</div>,
  Trash2: () => <div data-testid="trash-icon">Trash2</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/store/model-download', () => ({
  useModelDownload: () => ({
    isDownloading: false,
    currentModel: null,
    progress: 0,
    status: 'idle',
    startDownload: jest.fn(),
    updateProgress: jest.fn(),
    setStatus: jest.fn(),
    setError: jest.fn(),
    reset: jest.fn()
  })
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

describe('ModelsPage API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log('[TEST SETUP] Clearing all mocks')
    
    // Mock successful API responses
    mockFetch.mockImplementation((url) => {
      console.log('[MOCK FETCH] Intercepting request to:', url)
      
      if (url === '/api/models') {
        console.log('[MOCK FETCH] Returning mocked local models')
        return Promise.resolve({
          ok: true,
          json: () => {
            const mockData = { models: [{ name: 'test-model:7b' }] }
            console.log('[MOCK FETCH] Local models response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      if (url === '/api/models/library') {
        console.log('[MOCK FETCH] Returning mocked library models')
        return Promise.resolve({
          ok: true,
          json: () => {
            const mockData = {
              models: [{
                name: 'test-model',
                description: 'Test model',
                parameterSizes: ['7b'],
                capabilities: ['chat'],
                pullCount: '1000',
                tagCount: '10',
                lastUpdated: '2024-03-20'
              }]
            }
            console.log('[MOCK FETCH] Library models response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      if (url.includes('/api/delete-model')) {
        console.log('[MOCK FETCH] Handling model deletion request')
        return Promise.resolve({
          ok: true,
          json: () => {
            const mockData = { status: 'success' }
            console.log('[MOCK FETCH] Delete model response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      console.error('[MOCK FETCH] Unhandled URL:', url)
      return Promise.reject(new Error('API Error'))
    })
  })

  it('makes required API calls on mount', async () => {
    console.log('[TEST] Starting mount API calls test')
    await act(async () => {
      render(<ModelsPage />)
      console.log('[TEST] Component rendered')
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/models')
    expect(mockFetch).toHaveBeenCalledWith('/api/models/library')
    console.log('[TEST] Verified API calls were made')
  })

  it('handles model deletion API call', async () => {
    console.log('[TEST] Starting model deletion test')
    
    // Mock the initial models fetch to include our test model
    mockFetch.mockImplementation((url) => {
      console.log('[MOCK FETCH] Deletion test - Intercepting request to:', url)
      
      if (url === '/api/models') {
        console.log('[MOCK FETCH] Returning test model in local models')
        return Promise.resolve({
          ok: true,
          json: () => {
            const mockData = { models: [{ name: 'test-model:7b' }] }
            console.log('[MOCK FETCH] Local models response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      if (url === '/api/models/library') {
        console.log('[MOCK FETCH] Returning library models')
        return Promise.resolve({
          ok: true,
          json: () => {
            const mockData = {
              models: [{
                name: 'test-model',
                description: 'Test model',
                parameterSizes: ['7b'],
                capabilities: ['chat'],
                pullCount: '1000',
                tagCount: '10',
                lastUpdated: '2024-03-20'
              }]
            }
            console.log('[MOCK FETCH] Library models response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      if (url.includes('/api/delete-model')) {
        console.log('[MOCK FETCH] Processing delete request')
        return Promise.resolve({
          ok: true,
          json: () => {
            const mockData = { status: 'success' }
            console.log('[MOCK FETCH] Delete response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      })
    })

    const { container } = render(<ModelsPage />)
    console.log('[TEST] Component rendered for deletion test')

    // Wait for initial data to load and component to update
    await act(async () => {
      console.log('[TEST] Waiting for initial data load')
      await new Promise(resolve => setTimeout(resolve, 1000))
    })

    // Find the delete button using the correct selector
    const deleteButton = container.querySelector('button[variant="destructive"]') as HTMLButtonElement
    console.log('[TEST] Delete button found:', Boolean(deleteButton))
    console.log('[TEST] Delete button HTML:', deleteButton?.outerHTML)
    expect(deleteButton).toBeTruthy()

    await act(async () => {
      console.log('[TEST] Clicking delete button')
      deleteButton?.click()
      console.log('[TEST] Waiting for deletion to complete')
      await new Promise(resolve => setTimeout(resolve, 1000))
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/delete-model',
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ name: 'test-model:7b' })
      })
    )
    console.log('[TEST] Verified delete API call was made')

    expect(toast.success).toHaveBeenCalledWith(
      'Successfully deleted test-model:7b',
      expect.objectContaining({
        position: 'top-right',
        duration: 3000,
        dismissible: true
      })
    )
    console.log('[TEST] Verified success toast was shown')
  })

  it('handles API errors', async () => {
    console.log('[TEST] Starting API error handling test')
    
    // Mock the models API call to fail
    mockFetch.mockImplementation((url) => {
      console.log('[MOCK FETCH] Error test - Intercepting request to:', url)
      
      if (url === '/api/models') {
        console.log('[MOCK FETCH] Simulating API error response')
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => {
            const mockData = { error: 'Failed to fetch models' }
            console.log('[MOCK FETCH] Error response:', mockData)
            return Promise.resolve(mockData)
          }
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      })
    })

    await act(async () => {
      console.log('[TEST] Rendering component for error test')
      render(<ModelsPage />)
    })

    // Wait for error state to be processed
    await act(async () => {
      console.log('[TEST] Waiting for error state to be processed')
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch models')
    console.log('[TEST] Verified error toast was shown')
  })
}) 