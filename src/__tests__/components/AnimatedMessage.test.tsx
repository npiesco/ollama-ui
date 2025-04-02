import { render, screen, fireEvent, act } from '@testing-library/react';
import AnimatedMessage from '@/components/AnimatedMessage';
import type { Message } from '@/store/chat';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock FormattedMessage
jest.mock('@/components/FormattedMessage', () => ({
  FormattedMessage: ({ message }: { message: Message }) => <div data-testid="formatted-message">{message.content}</div>
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Pencil: () => <div data-testid="pencil-icon">Pencil</div>
}));

const createMessage = (content: string) => ({
  id: '1',
  role: 'user' as const,
  content,
  isEditing: false,
  timestamp: new Date().toISOString()
});

describe('AnimatedMessage', () => {
  const mockMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Test message',
    isEditing: false
  };

  const mockOnRegenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user message correctly', () => {
    render(
      <AnimatedMessage
        message={mockMessage}
        onRegenerate={mockOnRegenerate}
        isGenerating={false}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByTestId('pencil-icon')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(
      <AnimatedMessage
        message={{ ...mockMessage, role: 'assistant' }}
        onRegenerate={mockOnRegenerate}
        isGenerating={false}
      />
    );

    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
    expect(screen.queryByTestId('pencil-icon')).not.toBeInTheDocument();
  });

  it('shows edit mode when edit button is clicked', () => {
    render(
      <AnimatedMessage
        message={{ ...mockMessage, isEditing: true }}
        onRegenerate={mockOnRegenerate}
        isGenerating={false}
      />
    );

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save & Regenerate')).toBeInTheDocument();
  });

  it('applies opacity when generating', () => {
    const message = createMessage('Test message');
    render(<AnimatedMessage message={message} onRegenerate={mockOnRegenerate} isGenerating={true} />);

    const messageWrapper = screen.getByText('Test message').closest('.message-user');
    expect(messageWrapper).toHaveClass('opacity-50');
  });
}); 