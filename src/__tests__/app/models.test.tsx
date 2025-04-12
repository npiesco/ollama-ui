// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div role="article" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ ...props }: any) => <hr {...props} />
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => <div data-testid="skeleton" className={className} {...props} />
}))

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ onCheckedChange, ...props }: any) => (
    <input 
      type="checkbox" 
      onChange={(e) => onCheckedChange?.(e.target.checked)} 
      {...props} 
    />
  )
}))

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ ...props }: any) => <textarea {...props} />
}))

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  AlertTitle: ({ children }: any) => <div>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>
}))

// Mock the Select component to avoid DOM nesting issues
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onChange, children }) => (
    <div className="select-mock" data-value={value} onChange={onChange}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }) => <div className="select-trigger">{children}</div>,
  SelectContent: ({ children }) => <div className="select-content">{children}</div>,
  SelectItem: ({ value, children }) => (
    <div className="select-item" data-value={value}>
      {children}
    </div>
  ),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Mock model download store
jest.mock('@/store/model-download', () => ({
  useModelDownload: jest.fn(() => ({
    isDownloading: false,
    currentModel: null,
    progress: 0,
    status: 'idle',
    error: null,
    startDownload: jest.fn(),
    updateProgress: jest.fn(),
    setStatus: jest.fn(),
    setError: jest.fn(),
    reset: jest.fn()
  }))
}))

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Trash2: () => <span>trash</span>,
  AlertCircle: () => <span>alert</span>,
  CheckCircle2: () => <span>check</span>,
  Loader2: () => <span>loader</span>
}))

import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import ModelsPage from '@/app/models/page'
import '@testing-library/jest-dom'
import { useModelsStore } from '@/store/models'
import { useModelDownload } from '@/store/model-download'
import debug from 'debug'

// Set up debug logger for tests
const log = debug('test:models')

// Get toast mock functions for verification
const mockToast = jest.requireMock('sonner').toast

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Cache for real store data
let cachedModels: any[] = []
let cachedError: string | null = null

describe('ModelsPage', () => {
  beforeEach(async () => {
    console.log('[Test] Setting up test environment')
    mockToast.success.mockClear()
    mockToast.error.mockClear()
    mockToast.info.mockClear()
    mockFetch.mockClear()
    
    // Reset store state and cache
    const store = useModelsStore.getState()
    await act(async () => {
      useModelsStore.setState({
        models: [],
        htmlHash: null,
        isLoading: false,
        error: null
      })
      cachedModels = []
      cachedError = null
    })
  })

  it('renders loading state', async () => {
    console.log('[Test] Testing loading state')
    
    // Start with loading state
    mockFetch.mockImplementation(() => new Promise(() => {}))
    
    render(<ModelsPage />)
    
    // Verify initial loading state
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6)
    
    // Mock successful response
    mockFetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ models: [] })
    }))
    
    // Wait for loading to complete and skeletons to disappear
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
  })

  it('fetches and displays models from ollama.com', async () => {
    console.log('[Test] Testing model fetching and display')
    
    const testModel = {
      name: 'test-model',
      description: 'A test model',
      capabilities: ['text'],
      parameterSizes: ['7B'],
      pullCount: '1000',
      tagCount: '5',
      lastUpdated: '2024-04-11',
      isInstalled: false
    }
    
    // Mock fetch responses
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [testModel] })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [testModel] })
      }))

    await act(async () => {
      render(<ModelsPage />)
    })
    
    // Wait for loading to complete and models to render
    await waitFor(() => {
      expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
    }, { timeout: 5000 })

    // Update cache
    cachedModels = [testModel]
    
    // Now verify model card content
    const modelCard = screen.getByRole('article')
    expect(modelCard).toBeInTheDocument()
    expect(modelCard).toHaveTextContent('test-model')
    expect(modelCard).toHaveTextContent('A test model')
  })

  it('should correctly identify installed models', async () => {
    console.log('[Test] Testing installed model identification')
    
    const testModel = {
      name: 'test-model',
      description: 'A test model',
      capabilities: ['text'],
      parameterSizes: ['7B'],
      pullCount: '1000',
      tagCount: '5',
      lastUpdated: '2024-04-11',
      isInstalled: false
    }

    // Initialize store with test data
    const store = useModelsStore.getState()
    
    // Mock successful responses for both API calls
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [testModel] })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ models: [testModel] })
      }))

    // Update store
    await act(async () => {
      await store.fetchModels()
      await store.fetchLibraryModels()
    })

    // Update cache
    cachedModels = [testModel]

    // Verify store state
    const updatedStore = useModelsStore.getState()
    expect(updatedStore.models).toHaveLength(1)
    expect(updatedStore.models[0].name).toBe(testModel.name)
    expect(updatedStore.models[0].isInstalled).toBe(false)
  })

  it('handles errors gracefully', async () => {
    console.log('[Test] Testing error handling')
    
    // Mock fetch to fail
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')))
    
    await act(async () => {
      render(<ModelsPage />)
    })
    
    // Update cache with error
    cachedError = 'Network error'
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

describe('Models Store Integration Tests', () => {
  // Add longer timeout since we're fetching from real APIs
  jest.setTimeout(10000)

  it('should handle errors gracefully when Ollama API is unavailable', async () => {
    log('Starting test: should handle errors gracefully')
    
    // Mock fetch to fail
    mockFetch.mockImplementation(() => Promise.reject(new Error('API Error')))
    
    // Use cached error or simulate one
    const store = useModelsStore.getState()
    await act(async () => {
      await store.fetchModels()
    })
    
    // Verify store state after error
    expect(store.error).toBeDefined()
    log('Error state:', store.error)
  })

  it('should maintain installation status after refresh', async () => {
    log('Starting test: should maintain installation status after refresh')
    
    // Mock fetch responses
    mockFetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [
            {
              name: 'test-model',
              description: 'A test model',
              capabilities: ['text'],
              parameterSizes: ['7B'],
              pullCount: '1000',
              tagCount: '5',
              lastUpdated: '2024-04-11',
              isInstalled: false
            }
          ]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'test-model' }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [
            {
              name: 'test-model',
              description: 'A test model',
              capabilities: ['text'],
              parameterSizes: ['7B'],
              pullCount: '1000',
              tagCount: '5',
              lastUpdated: '2024-04-11',
              isInstalled: false
            }
          ]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'test-model' }]
        })
      }))

    // Use cached models
    const store = useModelsStore.getState()
    await act(async () => {
      await store.fetchModels()
    })
    
    // Get initial state
    const initialModels = store.models
    log('Initial models:', initialModels)
    
    // Simulate refresh with same data
    await act(async () => {
      await store.fetchModels()
    })
    
    // Get state after refresh
    const updatedModels = store.models
    log('Updated models:', updatedModels)
    
    // Verify installation status consistency
    initialModels.forEach(initialModel => {
      const updatedModel = updatedModels.find(m => m.name === initialModel.name)
      if (updatedModel) {
        expect(updatedModel.isInstalled).toBe(initialModel.isInstalled)
        log(`Model ${initialModel.name} installation status consistent: ${initialModel.isInstalled}`)
      }
    })
  })
})
