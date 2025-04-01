// /ollama-ui/src/__tests__/components/chat.test.tsx
import { render, act } from '@testing-library/react';

import { Chat } from '@/components/Chat';
import type { Message } from '@/store/chat';

// Mock essential dependencies
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
  Maximize2: () => <div data-testid="maximize2-icon" />,
  Minimize2: () => <div data-testid="minimize2-icon" />,
  X: () => <div data-testid="x-icon" />,
  Pencil: () => <div data-testid="pencil-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Settings2: () => <div data-testid="settings2-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  Check: () => <div data-testid="check-icon" />
}));

// Mock chat store
interface StoreState {
  messages: Message[];
  model: string | null;
  parameters: Record<string, unknown>;
}

const createMockStore = () => {
  const state: StoreState = {
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
    addMessage: jest.fn((message: Message) => {
      state.messages = [...state.messages, { ...message, id: `test-id-${  state.messages.length}` }];
    }),
    setModel: jest.fn((model: string) => {
      state.model = model;
    }),
    clearMessages: jest.fn(() => {
      state.messages = [];
    }),
    getFormattedMessages: jest.fn(() => state.messages)
  };
};

let mockStore = createMockStore();

jest.mock('@/store/chat', () => ({
  useChatStore: () => mockStore
}));

// Mock fetch for model loading
const mockModels = [
  { name: 'test-model-1' },
  { name: 'test-model-2' }
];

global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ models: mockModels })
  } as Response)
);

describe('Chat Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = createMockStore();
  });

  it('loads available models on mount', async () => {
    await act(async () => {
      render(<Chat />);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify fetch was called
    expect(global.fetch).toHaveBeenCalledWith('/api/models');
  });

  it('handles model not found error', async () => {
    // Mock error response
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ models: [] })
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    await act(async () => {
      render(<Chat />);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify error handling
    expect(mockStore.model).toBeNull();
  });

  it('preserves chat state', async () => {
    // Set initial state
    mockStore.setModel('test-model-1');
    mockStore.addMessage({ role: 'user', content: 'test message' });

    await act(async () => {
      render(<Chat />);
      // Wait for state updates to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify state is preserved
    expect(mockStore.messages).toHaveLength(1);
    expect(mockStore.model).toBe('test-model-1');
  });
});