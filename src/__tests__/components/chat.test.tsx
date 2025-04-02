// /ollama-ui/src/__tests__/components/chat.test.tsx
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Chat } from '@/components/Chat';
import { useChatStore, type Message } from '@/store/chat';
import { toast } from 'sonner';
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

// Mock the chat store
const mockStore = {
  messages: [],
  model: 'test-model',
  parameters: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
    seed: -1
  },
  addMessage: jest.fn(),
  setModel: jest.fn(),
  setParameters: jest.fn(),
  clearMessages: jest.fn()
};

jest.mock('@/store/chat', () => ({
  useChatStore: jest.fn(() => mockStore)
}));

describe('Chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock store state
    mockStore.messages = [];
    mockStore.model = 'test-model';
    mockStore.parameters = {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      repeat_penalty: 1.1,
      seed: -1
    };
  });

  it('fetches and sets models on mount', async () => {
    const mockModels = [
      { name: 'test-model', size: 1000 },
      { name: 'model2', size: 2000 }
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ models: mockModels })
    });

    await act(async () => {
      render(<Chat />);
    });

    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('handles model fetch error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch models' })
    });

    await act(async () => {
      render(<Chat />);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch models');
  });

  it('handles input change and submission', async () => {
    // Mock the models API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [{ name: 'test-model', size: 1000 }]
      })
    });

    await act(async () => {
      render(<Chat />);
    });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    const form = textarea.closest('form');
    fireEvent.submit(form!);

    expect(mockStore.addMessage).toHaveBeenCalledWith({
      role: 'user',
      content: 'Hello'
    });
  });

  it('handles model selection', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [
          { name: 'test-model', size: 1000 },
          { name: 'model2', size: 2000 }
        ]
      })
    });

    await act(async () => {
      render(<Chat />);
    });

    const selectTrigger = screen.getByTestId('select-trigger');
    fireEvent.click(selectTrigger);

    const testModelOption = screen.getByRole('option', { name: 'test-model' });
    await act(async () => {
      fireEvent.click(testModelOption);
    });

    expect(mockStore.setModel).toHaveBeenCalledWith('test-model');
  });

  it('handles model not found error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Model not found' })
    });

    await act(async () => {
      render(<Chat />);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to fetch models');
  });

  it('handles keyboard shortcuts', async () => {
    // Mock the models API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [{ name: 'test-model', size: 1000 }]
      })
    });

    await act(async () => {
      render(<Chat />);
    });

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(mockStore.addMessage).toHaveBeenCalledWith({
      role: 'user',
      content: 'Hello'
    });
  });

  it('handles pop out functionality', async () => {
    // Mock the models API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        models: [{ name: 'test-model', size: 1000 }]
      })
    });

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