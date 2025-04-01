// /ollama-ui/src/components/FormattedMessage.tsx
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import type { Message } from '../lib/types';
import type { Highlighter } from 'shiki';

import 'katex/dist/katex.min.css';

interface FormattedMessageProps {
  message: Message;
  darkMode?: boolean;
}

interface CodeComponentProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

export function FormattedMessage({ message, darkMode: _darkMode = false }: FormattedMessageProps) {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    const initHighlighter = async () => {
      try {
        const { getSingletonHighlighter } = await import('shiki/dist/bundle-full.mjs');
        const highlighter = await getSingletonHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: ['typescript', 'javascript', 'python', 'bash', 'plaintext', 'rust', 'json', 'html', 'css']
        });
        setHighlighter(highlighter);
      } catch (error) {
        console.error('Failed to initialize highlighter:', error);
      }
    };

    initHighlighter();
  }, [_darkMode]);

  const getTheme = () => _darkMode ? 'github-dark' : 'github-light';

  const components: Record<string, React.ComponentType<CodeComponentProps>> = {
    code: ({ inline, className, children, ...props }: CodeComponentProps) => {
      if (!highlighter) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'plaintext';
      const code = String(children || '').replace(/\n$/, '');

      try {
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: getTheme()
        });

        if (inline) {
          return (
            <code 
              className={className} 
              dangerouslySetInnerHTML={{ __html: html }} 
              {...props}
            />
          );
        }

        return (
          <div 
            className={cn("not-prose", className)}
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        );
      } catch (error) {
        console.error('Error highlighting code:', error);
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
    }
  };

  return (
    <div data-testid="formatted-message" className={cn("prose dark:prose-invert max-w-none", _darkMode && "dark")}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
}

export default FormattedMessage; 