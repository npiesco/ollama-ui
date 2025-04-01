import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { toast } from 'sonner'
import PullModel from '@/app/pull-model/page'
import { config } from '@/lib/config'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockLibraryModels = {
  models: [
    {
      name: 'llama2',
      description: 'Meta\'s Llama 2 model',
      parameterSizes: ['7b'],
      capabilities: ['text-generation'],
      pullCount: '1000',
      tagCount: '1',
      lastUpdated: '2024-03-20',
    },
  ],
}

describe('PullModel Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('loads and displays library models', async () => {
    // Mock the library models fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLibraryModels),
    })

    await act(async () => {
      render(<PullModel />)
    })

    // Wait for the loading state to be false
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveTextContent('Select a model...')
    })
  })

  it('handles the complete model pull flow', async () => {
    // Mock the library models fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLibraryModels),
    })

    // Create a mock stream reader
    const responses = [
      { status: 'pulling manifest' },
      { status: 'downloading', total: 100, completed: 50 },
      { status: 'success' },
    ]
    let responseIndex = 0

    const mockReader = {
      read: jest.fn().mockImplementation(async () => {
        if (responseIndex < responses.length) {
          const response = responses[responseIndex++]
          return {
            done: false,
            value: new TextEncoder().encode(JSON.stringify(response) + '\n'),
          }
        }
        return { done: true }
      }),
    }

    // Mock the pull request
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => mockReader,
      },
    })

    await act(async () => {
      render(<PullModel />)
    })

    // Enter model name manually
    const input = screen.getByPlaceholderText('e.g., llama2:7b')
    await act(async () => {
      fireEvent.change(input, { target: { value: 'llama2:7b' } })
    })

    // Submit the form
    const pullButton = screen.getByRole('button', { name: /^pull model$/i })
    await act(async () => {
      fireEvent.click(pullButton)
    })

    // Wait for all stream responses to be processed
    await act(async () => {
      while (responseIndex < responses.length) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    })

    // Verify success toast is shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Model pulled successfully')
    })
  })

  it('handles errors when fetching library models', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      render(<PullModel />)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch library models')
    })
  })

  it('handles errors when pulling models', async () => {
    // Mock the library models fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLibraryModels),
    })

    // Mock the pull request to fail
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to pull model'))

    await act(async () => {
      render(<PullModel />)
    })

    // Enter model name manually
    const input = screen.getByPlaceholderText('e.g., llama2:7b')
    await act(async () => {
      fireEvent.change(input, { target: { value: 'llama2:7b' } })
    })

    // Submit the form
    const pullButton = screen.getByRole('button', { name: /^pull model$/i })
    await act(async () => {
      fireEvent.click(pullButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to pull model')
    })
  })
}) 