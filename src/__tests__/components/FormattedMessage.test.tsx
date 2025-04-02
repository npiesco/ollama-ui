// /ollama-ui/src/__tests__/components/FormattedMessage.test.tsx
import { render, screen, act } from '@testing-library/react';
import { FormattedMessage } from '@/components/FormattedMessage';
import { getSingletonHighlighter } from 'shiki';    

jest.mock('shiki', () => ({
  getSingletonHighlighter: jest.fn().mockResolvedValue({
    codeToHtml: jest.fn().mockReturnValue('<pre><code>const test = "code";</code></pre>')
  })
}));

jest.mock('remark-math', () => ({
  __esModule: true,
  default: () => () => {}
}));

jest.mock('rehype-katex', () => ({
  __esModule: true,
  default: () => () => {}
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => {
    // Extract code content from markdown code blocks
    const codeMatch = children.match(/```[\s\S]*?\n([\s\S]*?)```/);
    const codeContent = codeMatch ? codeMatch[1].trim() : children;
    return <div data-testid="mock-markdown">{codeContent}</div>;
  }
}));

describe('FormattedMessage', () => {
  const mockMessage = {
    role: 'assistant',
    content: '```javascript\nconst test = "code";\n```'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders code blocks with syntax highlighting', async () => {
    await act(async () => {
      render(<FormattedMessage message={mockMessage} />);
    });
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(getSingletonHighlighter).toHaveBeenCalled();
    expect(screen.getByText('const test = "code";')).toBeInTheDocument();
  });

  it('handles highlighter initialization errors gracefully', async () => {
    (getSingletonHighlighter as jest.Mock).mockRejectedValueOnce(new Error('Failed to initialize'));
    await act(async () => {
      render(<FormattedMessage message={mockMessage} />);
    });
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('const test = "code";')).toBeInTheDocument();
  });

  it('handles code highlighting errors gracefully', async () => {
    (getSingletonHighlighter as jest.Mock).mockResolvedValueOnce({
      codeToHtml: jest.fn().mockRejectedValueOnce(new Error('Failed to highlight'))
    });
    await act(async () => {
      render(<FormattedMessage message={mockMessage} />);
    });
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('const test = "code";')).toBeInTheDocument();
  });

  it('renders math expressions correctly', async () => {
    const mathMessage = {
      role: 'assistant',
      content: 'Here is a math expression: $E = mc^2$'
    };
    await act(async () => {
      render(<FormattedMessage message={mathMessage} />);
    });
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText(/Here is a math expression:/)).toBeInTheDocument();
  });

  it('renders plain text messages correctly', async () => {
    const plainMessage = {
      role: 'assistant',
      content: 'Hello, world!'
    };
    await act(async () => {
      render(<FormattedMessage message={plainMessage} />);
    });
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('handles empty messages gracefully', async () => {
    const emptyMessage = {
      role: 'assistant',
      content: ''
    };
    await act(async () => {
      render(<FormattedMessage message={emptyMessage} />);
    });
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
  });
}); 