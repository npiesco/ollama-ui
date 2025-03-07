/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import { Chat } from '@/components/Chat';
import { useChatStore } from '@/store/chat';

Mock the fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock the caches API
const mockMatch = jest.fn();
const mockOpen = jest.fn().mockResolvedValue({
  match: mockMatch,
  put: jest.fn()
});
global.caches = {
  open: mockOpen
} as any;

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

describe('Chat Component Offline Functionality', () => {
  const mockModels = [
    { 
      name: 'model1', 
      details: {
        format: "gguf",
        family: "llama",
        parameter_size: "7B",
        quantization_level: "Q4_0"
      }
    },
    { 
      name: 'model2',
      details: {
        format: "gguf",
        family: "mistral",
        parameter_size: "7B",
        quantization_level: "Q4_0"
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset chat store
    const store = useChatStore.getState();
    store.clearMessages();
    store.setModel('');
  });

  it('should fetch and display models when online', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockModels
    });

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('model1')).toBeInTheDocument();
      expect(screen.getByText('model2')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/models');
  });

  it('should use cached models when offline', async () => {
    // Mock failed API response (offline)
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock cached response
    mockMatch.mockResolvedValueOnce({
      json: async () => mockModels
    });

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('model1')).toBeInTheDocument();
      expect(screen.getByText('model2')).toBeInTheDocument();
    });

    expect(mockOpen).toHaveBeenCalledWith('model-cache');
    expect(mockMatch).toHaveBeenCalledWith('/api/models');
  });

  it('should fallback to store model when offline and no cache', async () => {
    // Set a model in the store
    const store = useChatStore.getState();
    store.setModel('stored-model');

    // Mock failed API response (offline)
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock empty cache
    mockMatch.mockResolvedValueOnce(null);

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('stored-model')).toBeInTheDocument();
    });
  });

  it('should show error when no models available offline', async () => {
    // Mock failed API response (offline)
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock empty cache
    mockMatch.mockResolvedValueOnce(null);

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('No Models Installed')).toBeInTheDocument();
      expect(screen.getByText('You need to install at least one model to start chatting.')).toBeInTheDocument();
    });
  });

  it('should handle cache errors gracefully', async () => {
    // Mock failed API response (offline)
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock cache error
    mockOpen.mockRejectedValueOnce(new Error('Cache error'));

    // Set a model in the store for fallback
    const store = useChatStore.getState();
    store.setModel('fallback-model');

    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('fallback-model')).toBeInTheDocument();
    });
  });

  it('should select first model when none selected', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockModels
    });

    render(<Chat />);

    await waitFor(() => {
      const store = useChatStore.getState();
      expect(store.model).toBe('model1'); // Should select first model alphabetically
    });
  });

  it('should preserve selected model when going offline', async () => {
    // Set initial model
    const store = useChatStore.getState();
    store.setModel('model2');

    // Mock failed API response (offline)
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Mock cached response
    mockMatch.mockResolvedValueOnce({
      json: async () => mockModels
    });

    render(<Chat />);

    await waitFor(() => {
      expect(store.model).toBe('model2'); // Should preserve selected model
      expect(screen.getByText('model2')).toBeInTheDocument();
    });
  });
}); 