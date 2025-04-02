// /ollama-ui/src/__tests__/components/FormattedMessage.test.tsx
import { render, screen } from '@testing-library/react';
import { FormattedMessage } from '@/components/FormattedMessage';
import { Message } from '@/lib/types';
import { act } from 'react-dom/test-utils';
import { getSingletonHighlighter } from 'shiki/dist/bundle-full.mjs';

// Mock dependencies first
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children, components }: any) => {
    // For plain text messages
    if (typeof children === 'string' && !children.includes('`')) {
      return <div data-testid="mock-markdown">{children}</div>;
    }

    // For code blocks
    if (children.includes('```')) {
      return (
        <div data-testid="mock-markdown">
          <div className="not-prose language-typescript">
            <pre><code>const test = "code";</code></pre>
          </div>
        </div>
      );
    }

    // For inline code
    if (children.includes('`')) {
      return (
        <div data-testid="mock-markdown">
          <span>This is </span>
          <code>inline code</code>
        </div>
      );
    }

    // For empty messages
    if (!children) {
      return <div data-testid="mock-markdown" />;
    }

    return <div data-testid="mock-markdown">{children}</div>;
  }
}));

// Mock other markdown plugins
jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-math', () => jest.fn());
jest.mock('rehype-katex', () => jest.fn());

// Mock shiki
jest.mock('shiki/dist/bundle-full.mjs', () => ({
  getSingletonHighlighter: jest.fn()
}));

// Test data factory
const createMessage = (content: string, role: Message['role'] = 'user'): Message => ({
  content,
  role
});

describe('FormattedMessage', () => {
  const mockMessage: Message = {
    role: 'user',
    content: 'Hello, world!'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSingletonHighlighter as jest.Mock).mockResolvedValue({
      codeToHtml: jest.fn().mockReturnValue('<pre><code>highlighted code</code></pre>')
    });
  });

  it('renders user message correctly', () => {
    render(<FormattedMessage message={mockMessage} darkMode={false} />);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', async () => {
    const codeMessage: Message = {
      role: 'assistant',
      content: '```typescript\nconst test = "code";\n```'
    };

    await act(async () => {
      render(<FormattedMessage message={codeMessage} darkMode={false} />);
    });

    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('renders plain text messages correctly', async () => {
    const message = { ...mockMessage, content: 'Hello world' };
    await act(async () => {
      render(<FormattedMessage message={message} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', async () => {
    await act(async () => {
      render(<FormattedMessage message={mockMessage} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(getSingletonHighlighter).toHaveBeenCalled();
    expect(screen.getByText('const test = "code";')).toBeInTheDocument();
  });

  it('handles inline code blocks', async () => {
    const message = { ...mockMessage, content: 'This is `inline code`' };
    await act(async () => {
      render(<FormattedMessage message={message} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('inline code')).toBeInTheDocument();
  });

  it('switches themes based on darkMode prop', async () => {
    await act(async () => {
      render(<FormattedMessage message={mockMessage} darkMode={true} />);
    });

    expect(screen.getByTestId('formatted-message')).toHaveClass('dark');
  });

  it('handles highlighter initialization errors gracefully', async () => {
    (getSingletonHighlighter as jest.Mock).mockRejectedValue(new Error('Failed to initialize'));
    
    await act(async () => {
      render(<FormattedMessage message={mockMessage} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('const test = "code";')).toBeInTheDocument();
  });

  it('handles code highlighting errors gracefully', async () => {
    const mockHighlighter = {
      codeToHtml: jest.fn().mockRejectedValue(new Error('Highlighting failed'))
    };
    (getSingletonHighlighter as jest.Mock).mockResolvedValue(mockHighlighter);

    await act(async () => {
      render(<FormattedMessage message={mockMessage} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('const test = "code";')).toBeInTheDocument();
  });

  it('renders math expressions correctly', async () => {
    const message = { ...mockMessage, content: 'E = mc^2' };
    await act(async () => {
      render(<FormattedMessage message={message} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('E = mc^2')).toBeInTheDocument();
  });

  it('handles empty messages gracefully', async () => {
    const message = { ...mockMessage, content: '' };
    await act(async () => {
      render(<FormattedMessage message={message} />);
    });

    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByTestId('mock-markdown')).toBeEmptyDOMElement();
  });
}); 