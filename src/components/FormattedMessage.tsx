// /ollama-ui/src/components/FormattedMessage.tsx
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as shiki from 'shiki';
import type { BundledLanguage, BundledTheme } from 'shiki';
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

// Initialize shiki highlighter
let highlighterPromise: Promise<shiki.Highlighter>;

async function initHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = shiki.createHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'javascript', 'python', 'bash', 'json', 'markdown', 'yaml', 'shell', 'jsx', 'tsx']
    });
  }
  return highlighterPromise;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  const [highlighter, setHighlighter] = useState<shiki.Highlighter | null>(null);

  useEffect(() => {
    initHighlighter().then(setHighlighter);
  }, []);

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
      
      if (!inline && language && highlighter) {
        const codeContent = String(children || '').trim();
        try {
          const html = highlighter.codeToHtml(codeContent, {
            lang: language as BundledLanguage,
            themes: {
              light: 'github-dark',
              dark: 'github-dark'
            }
          });
          
          return (
            <div 
              className="rounded-md my-4 w-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (error) {
          console.warn('Failed to highlight code:', error);
          return (
            <code className="block p-4 bg-muted rounded-md whitespace-pre-wrap" {...props}>
              {codeContent}
            </code>
          );
        }
      }
      
      return (
        <code className={`bg-muted px-1.5 py-0.5 rounded-md ${className}`} {...props}>
          {children}
        </code>
      );
    },
    p: ({ children }) => (
      <p className="mb-4 last:mb-0 whitespace-pre-wrap break-words">{children}</p>
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