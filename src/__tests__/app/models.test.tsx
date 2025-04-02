import { render, screen, waitFor } from '@testing-library/react'
import ModelsPage from '@/app/models/page'
import { toast } from 'sonner'
import { useModelDownload } from '@/store/model-download'

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

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className, ...props }: any) => <div data-testid="skeleton" className={className} {...props} />
}))

// Mock the model download store
jest.mock('@/store/model-download', () => ({
  useModelDownload: jest.fn()
}))

describe('ModelsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the model download store with default values
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
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [
              { name: 'test-model' }
            ]
          })
        });
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [
              {
                name: 'test-model',
                capabilities: ['chat', 'tools'],
                description: 'Test model',
                parameterSizes: ['7b', '13b'],
                pullCount: 100,
                tagCount: 5,
                lastUpdated: '2024-03-20'
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success' })
      });
    });
  });

  it('renders loading state initially', () => {
    render(<ModelsPage />);
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
  });
});
