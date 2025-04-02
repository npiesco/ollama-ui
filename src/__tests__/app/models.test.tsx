import { GET } from '@/app/api/models/route'
import { config } from '@/lib/config'
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react'
import ModelsPage from '@/app/models/page'
import { toast } from 'sonner'
import { useModelDownload } from '@/store/model-download'
import { ModelResponse } from '@/types/ollama'

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Mock fetch with a simple implementation
global.fetch = jest.fn()

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any) => ({
      json: () => Promise.resolve(data),
      status: 200
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
  TabsList: ({ children, ...props }: any) => <div role="tablist" {...props}>{children}</div>,
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button role="tab" aria-selected={value === props['data-state']} {...props}>
      {children}
    </button>
  )
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

// Mock the model download store
jest.mock('@/store/model-download', () => ({
  useModelDownload: jest.fn()
}))

// Define mock data
const mockInstalledModels = [
  {
    name: 'test-model',
    capabilities: ['chat', 'tools'],
    description: 'Test model',
    parameterSizes: ['7b', '13b'],
    pullCount: 100,
    tagCount: 5,
    lastUpdated: '2024-03-20',
    details: {
      format: 'gguf',
      family: 'llama2',
      parameter_size: '7b',
      quantization_level: 'Q4_K_M'
    }
  }
];

const mockModels = [
  {
    name: 'test-model',
    capabilities: ['chat', 'tools'],
    description: 'Test model',
    parameterSizes: ['7b', '13b'],
    pullCount: 100,
    tagCount: 5,
    lastUpdated: '2024-03-20'
  },
  {
    name: 'code-model',
    capabilities: ['code'],
    description: 'Code model',
    parameterSizes: ['7b'],
    pullCount: 50,
    tagCount: 2,
    lastUpdated: '2024-03-19'
  },
  {
    name: 'vision-model',
    capabilities: ['vision'],
    description: 'Vision model',
    parameterSizes: ['13b'],
    pullCount: 75,
    tagCount: 3,
    lastUpdated: '2024-03-18'
  }
];

describe('Models API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches local models from Ollama API', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ models: [] })
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

    const response = await GET(new Request('http://localhost/api/models'))
    const data = await response.json()

    expect(data).toEqual({ models: [] })
    expect(global.fetch).toHaveBeenCalledWith(
      `${config.OLLAMA_API_HOST}/api/tags`,
      { method: 'GET' }
    )
  })

  it('handles API errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    const response = await GET(new Request('http://localhost/api/models'))
    const data = await response.json()

    expect(data).toEqual({ error: 'Failed to fetch models' })
  })
})

describe('ModelsPage API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock the model download store
    ;(useModelDownload as unknown as jest.Mock).mockReturnValue({
      isDownloading: false,
      currentModel: null,
      progress: 0,
      status: 'idle',
      startDownload: jest.fn(),
      updateProgress: jest.fn(),
      setStatus: jest.fn(),
      setError: jest.fn(),
      reset: jest.fn()
    });

    // Mock fetch for models
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      const urlString = url?.toString() || '';
      if (urlString === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: mockModels })
        });
      }
      if (urlString === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: mockInstalledModels })
        });
      }
      return Promise.reject(new Error('API Error'));
    });
  })

  it('makes required API calls on mount', async () => {
    await act(async () => {
      render(<ModelsPage />)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/models')
    expect(global.fetch).toHaveBeenCalledWith('/api/models/library')
  })

  it('handles API errors', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch models'))
    
    await act(async () => {
      render(<ModelsPage />)
    })

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch models')
  })
})

describe('ModelsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the model download store
    (useModelDownload as unknown as jest.Mock).mockReturnValue({
      isDownloading: false,
      currentModel: null,
      progress: 0,
      status: 'idle',
      startDownload: jest.fn(),
      updateProgress: jest.fn(),
      setStatus: jest.fn(),
      setError: jest.fn(),
      reset: jest.fn()
    });

    // Mock fetch responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      const urlString = url?.toString() || '';
      if (urlString === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: mockInstalledModels })
        });
      }
      if (urlString === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: mockModels })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      });
    });
  });

  it('renders the page with models', async () => {
    render(<ModelsPage />);

    // Wait for loading state to complete
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });

    // Basic page elements should now be visible
    expect(screen.getByText('Models')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to chat/i })).toBeInTheDocument();
    
    // Model card should be visible
    expect(screen.getByTestId('model-card-test-model')).toBeInTheDocument();
  });

  it('makes API calls on mount', async () => {
    render(<ModelsPage />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/models');
      expect(global.fetch).toHaveBeenCalledWith('/api/models/library');
    });
  });

  it('shows basic model information', async () => {
    render(<ModelsPage />);

    // Wait for loading state to complete
    await waitFor(() => {
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
    });

    const modelCard = screen.getByTestId('model-card-test-model');
    expect(modelCard).toBeInTheDocument();
    expect(within(modelCard).getByText('test-model')).toBeInTheDocument();
    expect(within(modelCard).getByText('Test model')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Failed to fetch models'))
      .mockRejectedValueOnce(new Error('Failed to fetch models'));
    
    render(<ModelsPage />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch models');
    });
  });
}); 