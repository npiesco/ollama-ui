// /ollama-ui/src/__tests__/components/chat.test.tsx
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Chat } from '@/components/Chat';
import { useChatStore, type Message } from '@/store/chat';
import { useModelDownload } from '@/store/model-download';
import { useSettings } from '@/store/settings';
import { toast } from 'sonner';
import type { AdvancedParameters } from '@/types/ollama';
import React from 'react';

// Debug logger
const debug = (context: string, data: any) => {
  console.debug(`[ChatTest] ${context}:`, JSON.stringify(data, null, 2));
};

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

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock AnimatedMessage component
jest.mock('@/components/AnimatedMessage', () => ({
  AnimatedMessage: ({ message }: { message: Message }) => {
    debug('AnimatedMessage render', { message });
    return (
      <div className="message-container">
        <div data-testid="animated-message" data-content={message.content}>
          {message.content}
        </div>
        {message.role === 'assistant' && (
          <button aria-label="Regenerate">Regenerate</button>
        )}
      </div>
    );
  }
}));

// Mock the toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

// Define interfaces for Select components
interface SelectItemProps {
  children: React.ReactNode;
  value?: string;
  onClick?: () => void;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

interface SelectContentProps {
  children: React.ReactNode;
}

// Mock Select components
jest.mock('@/components/ui/select', () => {
  const SelectItem = ({ children, value, onClick, ...props }: SelectItemProps) => (
    <div role="option" data-value={value} onClick={onClick} {...props}>{children}</div>
  );

  const Select = ({ children, onValueChange }: { children: React.ReactNode; onValueChange?: (value: string) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div data-testid="select">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<SelectTriggerProps>(child) && child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen)
            });
          }
          if (React.isValidElement<SelectContentProps>(child) && child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              children: React.Children.map(child.props.children, (item) => {
                if (React.isValidElement<SelectItemProps>(item) && item.type === SelectItem) {
                  return React.cloneElement(item, {
                    onClick: () => {
                      onValueChange?.(item.props.value || '');
                      setIsOpen(false);
                    }
                  });
                }
                return item;
              })
            });
          }
          return child;
        })}
      </div>
    );
  };

  const SelectTrigger = ({ children, ...props }: SelectTriggerProps) => (
    <button data-testid="select-trigger" {...props}>{children}</button>
  );

  const SelectContent = ({ children, ...props }: SelectContentProps) => (
    <div role="listbox" {...props}>{children}</div>
  );

  const SelectValue = ({ children, ...props }: { children: React.ReactNode }) => (
    <span {...props}>{children}</span>
  );

  return {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
  };
});

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ children, ...props }: any) => <textarea {...props}>{children}</textarea>
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

jest.mock('@/components/AdvancedParameters', () => ({
  AdvancedParametersControl: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

jest.mock('@/components/AnimatedMessage', () => ({
  AnimatedMessage: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

jest.mock('@/components/MultimodalInput', () => ({
  MultimodalInput: ({ children, ...props }: any) => <div {...props}>{children}</div>
}));

describe('Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset chat store with properly typed state
    const initialState = {
      messages: [] as Message[],
      model: 'test-model',
      parameters: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,
        presence_penalty: 0,
        num_predict: 128
      },
      addMessage: jest.fn(),
      updateLastMessage: jest.fn(),
      clearMessages: jest.fn(),
      setModel: jest.fn(),
      setParameters: jest.fn(),
      getFormattedMessages: jest.fn().mockReturnValue([]),
      editMessage: jest.fn(),
      setMessageEditing: jest.fn(),
      regenerateFromMessage: jest.fn(),
      setMessages: jest.fn()
    };
    
    useChatStore.setState(initialState);

    // Mock successful models fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'test-model' }
        ]
      })
    });
  });

  it('renders chat interface', () => {
    render(<Chat />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('handles message submission', () => {
    const mockAddMessage = jest.fn();
    useChatStore.setState({
      ...useChatStore.getState(),
      addMessage: mockAddMessage
    });

    render(<Chat />);
    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    expect(mockAddMessage).toHaveBeenCalledWith(expect.objectContaining({
      role: 'user',
      content: 'Hello'
    }));
  });

  it('renders chat interface with basic elements', async () => {
    render(<Chat />);

    // Wait for models to load
    await waitFor(() => {
      expect(screen.queryByText('Loading models...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
  });

  it('fetches and sets models on mount', async () => {
    const mockModels = [
      { name: 'model1' },
      { name: 'model2' }
    ];

    // Mock fetch to return models immediately
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ models: mockModels })
    });

    // Create a promise to track when setModel is called
    let resolveModelSet: (value: unknown) => void;
    const modelSetPromise = new Promise(resolve => {
      resolveModelSet = resolve;
    });

    const setModel = jest.fn().mockImplementation((model: string) => {
      debug('setModel called', { model });
      resolveModelSet(true);
    });

    // Reset store with proper state
    useChatStore.setState({
      messages: [],
      model: null,
      parameters: undefined,
      addMessage: jest.fn(),
      updateLastMessage: jest.fn(),
      setModel,
      setParameters: jest.fn(),
      getFormattedMessages: jest.fn().mockReturnValue([])
    });

    await act(async () => {
      render(<Chat />);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/models');
    
    // Wait for setModel to be called with a longer timeout
    await Promise.race([
      modelSetPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout waiting for setModel')), 5000)
      )
    ]);
    
    expect(setModel).toHaveBeenCalledWith('model1');
  }, 10000); // Increase test timeout to 10 seconds

  it('handles model fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    await act(async () => {
      render(<Chat />);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch models');
  });

  it('handles input change and submission', async () => {
    await act(async () => {
      render(<Chat />);
    });

    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input).toHaveValue('Hello');

    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(useChatStore.getState().addMessage).toHaveBeenCalledWith({
      role: 'user',
      content: 'Hello'
    });
    expect(input).toHaveValue('');
  });

  it('handles model selection', async () => {
    render(<Chat />);

    // Wait for models to load
    await waitFor(() => {
      expect(screen.queryByText('Loading models...')).not.toBeInTheDocument();
    });

    // Click the select button
    const selectButton = screen.getByTestId('select-trigger');
    await act(async () => {
      fireEvent.click(selectButton);
    });

    // Wait for SelectContent to be rendered and visible
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Click the model2 option
    const model2Option = screen.getByRole('option', { name: 'model2' });
    await act(async () => {
      fireEvent.click(model2Option);
    });

    // Verify the model was set
    await waitFor(() => {
      expect(useChatStore.getState().setModel).toHaveBeenCalledWith('model2');
    });
  });

  it('handles model not found error', async () => {
    useChatStore.setState({ model: null });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Model not found' })
    });

    await act(async () => {
      render(<Chat />);
    });

    expect(screen.getByText('No Models Installed')).toBeInTheDocument();
    expect(screen.getByText('You need to install at least one model to start chatting.')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', async () => {
    await act(async () => {
      render(<Chat />);
    });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });

    await act(async () => {
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    });

    expect(useChatStore.getState().addMessage).toHaveBeenCalledWith({
      role: 'user',
      content: 'Hello'
    });
  });

  it('handles pop out functionality', async () => {
    const originalWindow = window;
    const mockWindow = {
      open: jest.fn().mockReturnValue({
        document: {
          write: jest.fn(),
          close: jest.fn()
        }
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    (global as any).window = {
      ...originalWindow,
      ...mockWindow
    };

    debug('Setting up window mock', { 
      hasOpen: !!mockWindow.open,
      hasDocument: !!mockWindow.open()?.document
    });

    await act(async () => {
      render(<Chat />);
    });

    const maximizeButton = screen.getByTestId('maximize2-icon').closest('button');
    expect(maximizeButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(maximizeButton!);
    });

    debug('Window.open calls', {
      called: mockWindow.open.mock.calls.length,
      args: mockWindow.open.mock.calls
    });

    expect(mockWindow.open).toHaveBeenCalled();

    (global as any).window = originalWindow;
  });
});