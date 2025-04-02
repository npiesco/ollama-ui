import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chat } from '@/components/Chat';
import { useChatStore } from '@/store/chat';
import { config } from '@/lib/config';

// Mock the chat store
const mockChatStore = {
  messages: [],
  model: null,
  parameters: {
    temperature: 0.7,
    top_p: 0.9,
    num_predict: 2048,
    top_k: 40,
    repeat_penalty: 1.8,
    presence_penalty: 0.5
  },
  addMessage: jest.fn(),
  updateLastMessage: jest.fn(),
  clearMessages: jest.fn(),
  setModel: jest.fn(),
  setParameters: jest.fn(),
  getFormattedMessages: jest.fn(),
  editMessage: jest.fn(),
  setMessageEditing: jest.fn(),
  regenerateFromMessage: jest.fn(),
  setMessages: jest.fn()
};

jest.mock('@/store/chat', () => ({
  useChatStore: jest.fn(() => mockChatStore)
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Radix UI Select component
jest.mock('@radix-ui/react-select', () => {
  const SelectPrimitive = {
    Root: ({ children, onValueChange }: any) => (
      <div data-testid="select-root" onClick={() => onValueChange && onValueChange('test-model')}>
        {children}
      </div>
    ),
    Trigger: ({ children }: any) => <button data-testid="select-trigger">{children}</button>,
    Value: ({ children }: any) => <span data-testid="select-value">{children}</span>,
    Portal: ({ children }: any) => <div data-testid="select-portal">{children}</div>,
    Content: ({ children }: any) => <div data-testid="select-content">{children}</div>,
    Viewport: ({ children }: any) => <div data-testid="select-viewport">{children}</div>,
    Item: ({ children, value }: any) => (
      <div data-testid="select-item" data-value={value}>
        {children}
      </div>
    ),
    ItemText: ({ children }: any) => <span data-testid="select-item-text">{children}</span>,
    ItemIndicator: ({ children }: any) => <span data-testid="select-item-indicator">{children}</span>,
    ScrollUpButton: ({ children }: any) => <div data-testid="select-scroll-up">{children}</div>,
    ScrollDownButton: ({ children }: any) => <div data-testid="select-scroll-down">{children}</div>,
    Group: ({ children }: any) => <div data-testid="select-group">{children}</div>,
    Label: ({ children }: any) => <div data-testid="select-label">{children}</div>,
    Separator: ({ children }: any) => <div data-testid="select-separator">{children}</div>,
    Icon: ({ children }: any) => <div data-testid="select-icon">{children}</div>
  }

  // Add displayName to all components
  Object.keys(SelectPrimitive).forEach((key) => {
    (SelectPrimitive as any)[key].displayName = `Select${key}`
  })

  return SelectPrimitive
})

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Maximize2: () => <div data-testid="maximize-icon">Maximize Icon</div>,
  MessageSquare: () => <div data-testid="message-square-icon">Message Icon</div>,
  Send: () => <div data-testid="send-icon">Send Icon</div>,
  Image: () => <div data-testid="image-icon">Image Icon</div>,
  X: () => <div data-testid="x-icon">X Icon</div>,
  Settings: () => <div data-testid="settings-icon">Settings Icon</div>,
  Settings2: () => <div data-testid="settings2-icon">Settings2 Icon</div>,
  ChevronDown: () => <div data-testid="chevron-down-icon">Chevron Down Icon</div>,
  ChevronUp: () => <div data-testid="chevron-up-icon">Chevron Up Icon</div>,
  Loader2: () => <div data-testid="loader-icon">Loader Icon</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh Icon</div>,
  Copy: () => <div data-testid="copy-icon">Copy Icon</div>,
  Check: () => <div data-testid="check-icon">Check Icon</div>
}));

// Mock the FormattedMessage component to avoid markdown dependencies
jest.mock('@/components/FormattedMessage', () => ({
  FormattedMessage: ({ message }: { message: any }) => (
    <div data-testid="formatted-message">{message.content}</div>
  )
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset mock store state
  mockChatStore.messages = [];
  mockChatStore.model = null;
  // Setup default fetch mock for models
  ;(global.fetch as jest.Mock).mockImplementation((url) => {
    if (url.endsWith('/api/tags')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          models: [
            { name: 'test-model' },
            { name: 'another-model' }
          ]
        })
      });
    }
    if (url.endsWith('/api/show')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          model_info: {}
        })
      });
    }
    return Promise.reject(new Error('Not found'));
  });
});

describe('Chat Component', () => {
  it('renders input field and handles basic input', async () => {
    render(<Chat />);
    
    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    // Type in the input
    await userEvent.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  it('initializes with available models', async () => {
    render(<Chat />);
    
    // Wait for models to load and verify model selector
    await waitFor(() => {
      const modelSelect = screen.getByTestId('select-trigger');
      expect(modelSelect).toBeInTheDocument();
    });

    // Click the select to trigger model selection
    const modelSelect = screen.getByTestId('select-root');
    fireEvent.click(modelSelect);

    // Verify the store was updated with the first model
    expect(mockChatStore.setModel).toHaveBeenCalledWith('test-model');
  });

  it('handles model selection change', async () => {
    render(<Chat />);
    
    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    // Click the select to trigger model selection
    const modelSelect = screen.getByTestId('select-root');
    fireEvent.click(modelSelect);

    // Verify the store was updated
    expect(mockChatStore.setModel).toHaveBeenCalledWith('test-model');
  });

  it('handles message submission', async () => {
    const mockResponse = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"response": "Test response"}'));
          controller.close();
        }
      })
    );

    ;(global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.endsWith('/api/tags')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            models: [{ name: 'test-model' }]
          })
        });
      }
      if (url.endsWith('/api/show')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            model_info: {}
          })
        });
      }
      if (url.endsWith('/api/chat')) {
        return Promise.resolve(mockResponse);
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<Chat />);
    
    // Wait for models to load
    await waitFor(() => {
      expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    });

    // Type a message
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message{enter}');

    // Verify the message was added to the store
    expect(mockChatStore.addMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: 'Test message'
      })
    );
  });
}); 