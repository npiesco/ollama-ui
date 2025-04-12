import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import Embeddings from '@/app/embeddings/page';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Binary: () => <div data-testid="binary-icon" />
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

describe('Embeddings Page', () => {
  const mockRouter = {
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should show loading state initially', () => {
    render(<Embeddings />);
    expect(screen.getByText('Checking model availability...')).toBeInTheDocument();
  });

  it('should correctly check for nomic-embed-text model using Ollama API', async () => {
    // Mock successful Ollama API response with nomic-embed-text installed
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [
            { name: 'nomic-embed-text:latest' }
          ]
        })
      } as Response)
    );

    await act(async () => {
      render(<Embeddings />);
    });

    // Should show the embeddings interface since model is installed
    expect(screen.getByRole('heading', { name: 'Generate Embeddings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Embeddings' })).toBeInTheDocument();
  });

  it('should show install prompt when nomic-embed-text is not installed', async () => {
    // Mock Ollama API response with no models installed
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: []
        })
      } as Response)
    );

    await act(async () => {
      render(<Embeddings />);
    });

    expect(screen.getByText('Model Required')).toBeInTheDocument();
    expect(screen.getByText('Install nomic-embed-text Model')).toBeInTheDocument();
  });

  it('should handle Ollama API errors gracefully', async () => {
    // Mock Ollama API error
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    await act(async () => {
      render(<Embeddings />);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to check model installation');
  });

  it('should recheck model installation when window gains focus', async () => {
    // Mock initial Ollama API response with model installed
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [
            { name: 'nomic-embed-text:latest' }
          ]
        })
      }))
      // Mock second call when focus event triggers to return no models
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: []
        })
      }));

    await act(async () => {
      render(<Embeddings />);
    });

    // Initially, embeddings interface should be shown
    expect(screen.getByRole('heading', { name: 'Generate Embeddings' })).toBeInTheDocument();

    // Simulate window focus event
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    // After focus event, model required message should be shown
    expect(screen.getByText('Model Required')).toBeInTheDocument();
  });

  it('should handle model name variations with tags', async () => {
    // Mock Ollama API response with tagged model name
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [
            { name: 'nomic-embed-text:latest' }
          ]
        })
      } as Response)
    );

    await act(async () => {
      render(<Embeddings />);
    });

    // Should show the embeddings interface since model is installed (even with tag)
    expect(screen.getByRole('heading', { name: 'Generate Embeddings' })).toBeInTheDocument();
  });

  it('should generate embeddings when form is submitted', async () => {
    // Mock successful model check
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'nomic-embed-text' }]
        })
      }))
      // Mock successful embeddings generation
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          embeddings: [[0.1, 0.2, 0.3]]
        })
      }));

    await act(async () => {
      render(<Embeddings />);
    });

    const input = screen.getByPlaceholderText(/Enter text to generate embeddings/);
    const submitButton = screen.getByRole('button', { name: 'Generate Embeddings' });

    fireEvent.change(input, { target: { value: 'test text' } });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/embed'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          model: 'nomic-embed-text',
          input: 'test text'
        })
      })
    );
    expect(toast.success).toHaveBeenCalledWith('Embeddings generated successfully');
  });

  it('should handle embeddings generation errors', async () => {
    // Mock successful model check but failed embeddings generation
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'nomic-embed-text' }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Failed to generate embeddings'
        })
      }));

    await act(async () => {
      render(<Embeddings />);
    });

    const input = screen.getByPlaceholderText(/Enter text to generate embeddings/);
    const submitButton = screen.getByRole('button', { name: 'Generate Embeddings' });

    fireEvent.change(input, { target: { value: 'test text' } });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to generate embeddings');
  });

  it('should handle model not found error during generation', async () => {
    // Mock successful model check but model not found during generation
    global.fetch = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [{ name: 'nomic-embed-text' }]
        })
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'model not found'
        })
      }));

    await act(async () => {
      render(<Embeddings />);
    });

    const input = screen.getByPlaceholderText(/Enter text to generate embeddings/);
    const submitButton = screen.getByRole('button', { name: 'Generate Embeddings' });

    fireEvent.change(input, { target: { value: 'test text' } });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(screen.getByText('Model Required')).toBeInTheDocument();
  });
}); 