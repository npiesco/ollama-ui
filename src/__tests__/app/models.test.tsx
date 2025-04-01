import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Models from '@/app/models/page'
import { toast } from 'sonner'

// Mock fetch
global.fetch = jest.fn()

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left" />,
  ArrowRight: () => <div data-testid="arrow-right" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronUp: () => <div data-testid="chevron-up" />,
  Check: () => <div data-testid="check" />,
  Trash: () => <div data-testid="trash" />,
  Trash2: () => <div data-testid="trash2" />,
  CheckCircle2: () => <div data-testid="check-circle2" />,
  AlertCircle: () => <div data-testid="alert-circle" />,
}))

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}))

describe('ModelsPage', () => {
  const mockLibraryModels = [
    {
      name: 'llama2',
      description: 'Meta\'s Llama 2 model',
      parameterSizes: ['7b', '13b', '70b'],
      capabilities: ['chat', 'completion'],
      pullCount: '1M',
      tagCount: '50',
      lastUpdated: '2 months ago',
    },
    {
      name: 'mistral',
      description: 'The 7B model released by Mistral AI.',
      parameterSizes: ['7b'],
      capabilities: ['tools'],
      pullCount: '11M',
      tagCount: '84',
      lastUpdated: '8 months ago',
    },
    {
      name: 'codellama',
      description: 'A code-specialized version of Llama 2',
      parameterSizes: ['7b', '13b', '34b'],
      capabilities: ['tools'],
      pullCount: '5M',
      tagCount: '90',
      lastUpdated: '10 months ago',
    },
  ]

  const mockInstalledModels = [
    {
      name: 'llama2:7b',
      size: 1234567890,
      digest: 'sha256:abc123',
      modified_at: '2024-03-20T12:00:00Z',
      details: {
        format: 'gguf',
        family: 'llama',
        parameter_size: '7b',
        quantization_level: 'Q4_0',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
    })

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn()

    // Mock fetch responses
    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: mockInstalledModels }),
        })
      }
      if (url === '/api/models/library') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: mockLibraryModels }),
        })
      }
      if (url === '/api/models/pull') {
        const mockReader = {
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(JSON.stringify({ status: 'success' }))
            })
            .mockResolvedValueOnce({ done: true }),
        }
        return Promise.resolve({
          ok: true,
          body: {
            getReader: () => mockReader,
          },
        })
      }
      if (url === '/api/models/delete') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: 'success' }),
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('fetches and displays models on mount', async () => {
    await act(async () => {
      render(<Models />)
    })

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /models/i })).toBeInTheDocument()
    })

    // Wait for carousel content to be rendered
    await waitFor(() => {
      const carouselContent = document.querySelector('.carousel-content')
      expect(carouselContent).toBeInTheDocument()
      expect(carouselContent?.textContent).toContain('codellama')
      expect(carouselContent?.textContent).toContain('A code-specialized version of Llama 2')
    })
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch models'))

    await act(async () => {
      render(<Models />)
    })

    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch models')
    })
  })

  it('installs a model successfully', async () => {
    await act(async () => {
      render(<Models />)
    })

    // Wait for data to be loaded and model cards to be rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /models/i })).toBeInTheDocument()
      expect(screen.getByText('codellama')).toBeInTheDocument()
    })

    // Find and click install button for codellama
    const buttons = screen.getAllByRole('button', { name: /install model/i })
    const installButton = buttons.find(button => 
      button.closest('[data-model="codellama"]')
    )
    if (!installButton) {
      throw new Error('Install button not found')
    }
    await act(async () => {
      fireEvent.click(installButton)
    })

    // Verify success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Successfully downloaded'))
    })
  })

  it('deletes a model successfully', async () => {
    await act(async () => {
      render(<Models />)
    })

    // Wait for data to be loaded and model cards to be rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /models/i })).toBeInTheDocument()
      expect(screen.getByText('llama2')).toBeInTheDocument()
    })

    // Find and click delete button for llama2
    const deleteButton = screen.getByLabelText('Delete')
    if (!deleteButton) {
      throw new Error('Delete button not found')
    }
    await act(async () => {
      fireEvent.click(deleteButton)
    })

    // Verify success message
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted llama2:7b')
    })
  })

  it('focuses on a model from sessionStorage', async () => {
    // Mock sessionStorage to return a focused model
    window.sessionStorage.getItem = jest.fn().mockReturnValue('mistral')

    render(<Models />)

    // Wait for data to be loaded
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /models/i })).toBeInTheDocument()
    })

    // Verify that the model is focused
    expect(window.sessionStorage.getItem).toHaveBeenCalledWith('focusModel')
  })
}) 