// /ollama-ui/src/components/FormattedMessage.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';
import type { CSSProperties } from 'react';
import 'katex/dist/katex.min.css';

interface FormattedMessageProps {
  content: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  // Pre-process the content to clean up code blocks and ensure proper line breaks
  const processedContent = content
    // First, handle code blocks with text immediately after closing backticks
    .replace(/```([\w-]*)\n([\s\S]*?)```\s*([^\n])/g, (match, lang, code, rest) => {
      return `\`\`\`${lang || ''}\n${code.trim()}\n\`\`\`\n\n${rest}`;
    })
    // Then handle regular code blocks
    .replace(/```([\w-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `\`\`\`${lang || ''}\n${code.trim()}\n\`\`\``;
    });

  const components: Components = {
    code: ({ inline, className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        const codeContent = String(children || '').trim();
        
        return (
          <div className="rounded-md my-2 w-full bg-black overflow-hidden">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              PreTag="div"
              showLineNumbers={false}
              wrapLongLines={true}
              customStyle={{
                margin: 0,
                padding: '1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'transparent',
                width: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                display: 'block'
              } as CSSProperties}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  display: 'block'
                }
              }}
              {...props}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      return (
        <code className={`bg-muted px-1.5 py-0.5 rounded-md ${className}`} {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }) => (
      <p className="mb-4 last:mb-0 whitespace-pre-wrap">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mb-2">{children}</h3>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-1">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-4">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="px-4 py-2 bg-muted font-semibold text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2 border-t border-border">
        {children}
      </td>
    ),
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap" data-testid="formatted-message">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
} 