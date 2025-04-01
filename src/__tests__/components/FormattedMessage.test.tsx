// /ollama-ui/src/__tests__/components/FormattedMessage.test.tsx
import React, { type JSX } from 'react';
import { render, screen } from '@testing-library/react';
import FormattedMessage from '@/components/FormattedMessage';
import { Message } from '@/store/chat';

// Mock all external markdown-related modules
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children, components }: { 
    children: string, 
    components: {
      code: (props: { className?: string; children: string; inline: boolean }) => JSX.Element;
    }
  }) {
    // Basic markdown processing simulation
    const processCodeBlock = (content: string) => {
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      return content.replace(codeBlockRegex, (_, lang, code) => {
        const processed = components.code({
          className: lang ? `language-${lang}` : '',
          children: code.trim(),
          inline: false
        });
        return processed.props.children.props.children;
      });
    };
    
    const processed = processCodeBlock(children);
    return React.createElement('div', {}, processed);
  };
});

jest.mock('react-syntax-highlighter', () => ({
  Prism: function MockPrism({ children }: { children: React.ReactNode }) {
    return React.createElement('code', {}, children);
  }
}));

jest.mock('remark-gfm', () => ({}));
jest.mock('remark-math', () => ({}));
jest.mock('rehype-katex', () => ({}));

describe('FormattedMessage', () => {
  const createMessage = (content: string): Message => ({
    id: '1',
    role: 'assistant',
    content,
    images: [],
    isEditing: false
  });

  it('renders plain text correctly', () => {
    render(<FormattedMessage message={createMessage("Hello, world!")} />);
    expect(screen.getByTestId('formatted-message')).toHaveTextContent('Hello, world!');
  });

  it('renders markdown headings correctly', () => {
    render(<FormattedMessage message={createMessage("# Heading 1")} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('renders lists correctly', () => {
    render(<FormattedMessage message={createMessage("- Item 1\n- Item 2")} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('renders code blocks with syntax highlighting', () => {
    const codeBlock = `\`\`\`rust
fn main() {
    println!("Hello World!");
}
\`\`\``;
    render(<FormattedMessage message={createMessage(codeBlock)} />);
    const container = screen.getByTestId('formatted-message');
    expect(container).toHaveTextContent('fn main()');
    expect(container).toHaveTextContent('println!("Hello World!")');
  });

  it('handles code blocks without trailing newlines correctly', () => {
    const codeBlock = `\`\`\`js
const x = 1;\`\`\``;
    render(<FormattedMessage message={createMessage(codeBlock)} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('handles code blocks with multiple trailing newlines correctly', () => {
    const codeBlock = `\`\`\`js
const x = 1;


\`\`\``;
    render(<FormattedMessage message={createMessage(codeBlock)} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('renders inline code correctly', () => {
    render(<FormattedMessage message={createMessage("`const x = 1;`")} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('renders blockquotes correctly', () => {
    render(<FormattedMessage message={createMessage("> Quote")} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('renders tables correctly', () => {
    const content = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;
    render(<FormattedMessage message={createMessage(content)} />);
    expect(screen.getByTestId('formatted-message')).toBeInTheDocument();
  });

  it('preserves whitespace in paragraphs', () => {
    const content = 'Line 1\nLine 2';
    render(<FormattedMessage message={createMessage(content)} />);
    const container = screen.getByTestId('formatted-message');
    expect(container).toHaveTextContent('Line 1');
    expect(container).toHaveTextContent('Line 2');
  });

  it('handles empty content gracefully', () => {
    render(<FormattedMessage message={createMessage("")} />);
    const container = screen.getByTestId('formatted-message');
    expect(container).toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('applies dark mode classes', () => {
    render(<FormattedMessage message={createMessage("Test content")} />);
    const container = screen.getByTestId('formatted-message');
    expect(container).toHaveClass('dark:prose-invert');
  });

  it('handles code blocks with trailing text correctly', () => {
    const content = `\`\`\`rust
fn main() {
    println!("Hello World!");
}
\`\`\`
Some text after the code block`;
    render(<FormattedMessage message={createMessage(content)} />);
    const container = screen.getByTestId('formatted-message');
    expect(container).toHaveTextContent('fn main()');
    expect(container).toHaveTextContent('println!("Hello World!")');
    expect(container).toHaveTextContent('Some text after the code block');
  });

  it('handles code blocks with inline text after closing backticks correctly', () => {
    const content = `\`\`\`rust
fn main() {
    println!("Hello World!");
}
\`\`\` This text should be on a new line`;
    render(<FormattedMessage message={createMessage(content)} />);
    const container = screen.getByTestId('formatted-message');
    expect(container).toHaveTextContent('fn main()');
    expect(container).toHaveTextContent('println!("Hello World!")');
    expect(container).toHaveTextContent('This text should be on a new line');
    // Check that the text appears after the code block
    const text = container.textContent || '';
    const codeIndex = text.indexOf('fn main()');
    const textIndex = text.indexOf('This text should be on a new line');
    expect(codeIndex).toBeLessThan(textIndex);
  });
}); 