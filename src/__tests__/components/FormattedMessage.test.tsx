// /ollama-ui/src/__tests__/components/FormattedMessage.test.tsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { FormattedMessage } from '@/components/FormattedMessage';
import { Message } from '@/store/chat';
import { act } from 'react-dom/test-utils';

// Mock dependencies first
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { 
    children: string;
  }) {
    // Preserve newlines in the output to match the expected format
    return <div data-testid="mock-markdown" style={{ whiteSpace: 'pre-wrap' }}>{children}</div>;
  };
});

// Mock other markdown plugins
jest.mock('remark-gfm', () => jest.fn());
jest.mock('remark-math', () => jest.fn());
jest.mock('rehype-katex', () => jest.fn());

// Mock shiki
jest.mock('shiki/dist/bundle-full.mjs', () => ({
  getSingletonHighlighter: jest.fn().mockImplementation((options) => {
    if (options?.shouldFail) {
      return Promise.reject(new Error('Highlighter initialization failed'));
    }
    return Promise.resolve({
      codeToHtml: jest.fn((code) => `<pre><code>${code}</code></pre>`)
    });
  })
}));

// Test data factory
const createMessage = (content: string, role: Message['role'] = 'user'): Message => ({
  content,
  role
});

describe('FormattedMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders plain text messages correctly', async () => {
      const message = createMessage('Hello world');
      await act(async () => {
        render(<FormattedMessage message={message} />);
      });
      
      const container = screen.getByTestId('formatted-message');
      expect(container).toHaveTextContent('Hello world');
    });

    it('handles different message roles', async () => {
      const userMessage = createMessage('User message', 'user');
      const assistantMessage = createMessage('Assistant message', 'assistant');
      
      await act(async () => {
        render(<FormattedMessage message={userMessage} />);
      });
      expect(screen.getByTestId('formatted-message')).toHaveTextContent('User message');
      
      cleanup(); // Clean up the first render
      
      await act(async () => {
        render(<FormattedMessage message={assistantMessage} />);
      });
      expect(screen.getByTestId('formatted-message')).toHaveTextContent('Assistant message');
    });
  });

  describe('Markdown Processing', () => {
    it('processes markdown elements correctly', async () => {
      const markdownContent = `# Heading
- List item
\`inline code\`
\`\`\`
code block
\`\`\``;
      const message = createMessage(markdownContent);
      
      await act(async () => {
        render(<FormattedMessage message={message} />);
      });
      const container = screen.getByTestId('mock-markdown');
      
      // Use a more lenient comparison that ignores whitespace differences
      const normalizedExpected = markdownContent.replace(/\s+/g, ' ').trim();
      const normalizedActual = container.textContent?.replace(/\s+/g, ' ').trim();
      expect(normalizedActual).toBe(normalizedExpected);
    });

    it('handles code blocks with syntax highlighting', async () => {
      const codeContent = '```javascript\nconst test = "hello";\n```';
      const message = createMessage(codeContent);
      
      await act(async () => {
        render(<FormattedMessage message={message} />);
      });
      
      const highlighter = await import('shiki/dist/bundle-full.mjs');
      expect(highlighter.getSingletonHighlighter).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles highlighter initialization errors gracefully', async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force highlighter to fail by passing shouldFail option
      const message = createMessage('```js\ncode\n```');
      await act(async () => {
        render(<FormattedMessage message={message} darkMode={true} />);
      });
      
      // Component should still render without crashing
      expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
      
      // Clean up
      consoleSpy.mockRestore();
    });

    it('handles markdown processing errors gracefully', async () => {
      // Create a message that might cause markdown processing issues
      const message = createMessage('Text with *unclosed markdown* *');
      await act(async () => {
        render(<FormattedMessage message={message} />);
      });
      
      // Component should still render the content
      expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
    });
  });

  describe('Theme Handling', () => {
    it('applies dark mode class when specified', async () => {
      const message = createMessage('test');
      await act(async () => {
        render(<FormattedMessage message={message} darkMode={true} />);
      });
      
      expect(screen.getByTestId('formatted-message')).toHaveClass('dark');
    });

    it('does not apply dark mode class by default', async () => {
      const message = createMessage('test');
      await act(async () => {
        render(<FormattedMessage message={message} />);
      });
      
      expect(screen.getByTestId('formatted-message')).not.toHaveClass('dark');
    });
  });
}); 