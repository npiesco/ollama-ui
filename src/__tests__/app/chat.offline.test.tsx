/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, act } from '@testing-library/react';

import { Chat } from '@/components/Chat';

// Mock essential dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>
}));

// Mock FormattedMessage component
jest.mock('@/components/FormattedMessage', () => ({
  FormattedMessage: ({ content }: { content: string }) => <div>{content}</div>
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Maximize2: () => <div data-testid="maximize-icon" />,
  Minimize2: () => <div data-testid="minimize-icon" />,
  X: () => <div data-testid="x-icon" />,
  Pencil: () => <div data-testid="pencil-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock store
const createStore = () => {
  const state = {
    messages: [],
    model: null,
    parameters: {}
  };

  return {
    get messages() {
      return state.messages; 
    },
    get model() {
      return state.model; 
    },
    get parameters() {
      return state.parameters; 
    },
    setModel: jest.fn((model) => {
      state.model = model;
    }),
    clearMessages: jest.fn(() => {
      state.messages = [];
    })
  };
};

const store = createStore();

jest.mock('@/store/chat', () => ({
  useChatStore: () => store
}));

describe('Chat Offline Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle offline mode gracefully', async () => {
    // Mock network failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      render(<Chat />);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify component doesn't crash
    expect(document.body).toBeInTheDocument();
  });

  it('should preserve model selection when offline', async () => {
    // Set initial model
    store.setModel('model1');
    
    // Mock network failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    await act(async () => {
      render(<Chat />);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify model selection is preserved
    expect(store.model).toBe('model1');
  });

  it('should handle empty model list', async () => {
    // Mock empty model list
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [] })
    });

    await act(async () => {
      render(<Chat />);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify null model state
    expect(store.model).toBeNull();
  });
}); 