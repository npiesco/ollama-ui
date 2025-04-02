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

  console.debug('[FormattedMessage] Initializing component:', {
    role: message.role,
    contentLength: message.content.length,
    darkMode: _darkMode,
    hasHighlighter: !!highlighter
  });

  useEffect(() => {
    const initHighlighter = async () => {
      console.debug('[FormattedMessage] Initializing highlighter');
      try {
        const { getSingletonHighlighter } = await import('shiki/dist/bundle-full.mjs');
        const highlighter = await getSingletonHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: ['typescript', 'javascript', 'python', 'bash', 'plaintext', 'rust', 'json', 'html', 'css']
        });
        console.debug('[FormattedMessage] Highlighter initialized successfully');
        setHighlighter(highlighter);
      } catch (error) {
        console.error('[FormattedMessage] Failed to initialize highlighter:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    initHighlighter();
  }, [_darkMode]);

  const getTheme = () => {
    const theme = _darkMode ? 'github-dark' : 'github-light';
    console.debug('[FormattedMessage] Selected theme:', theme);
    return theme;
  };

  const components: Record<string, React.ComponentType<CodeComponentProps>> = {
    code: ({ inline, className, children, ...props }: CodeComponentProps) => {
      console.debug('[FormattedMessage] Rendering code block:', {
        inline,
        className,
        hasHighlighter: !!highlighter,
        codeLength: String(children || '').length
      });

      if (!highlighter) {
        console.debug('[FormattedMessage] No highlighter available, rendering plain code');
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : 'plaintext';
      const code = String(children || '').replace(/\n$/, '');

      console.debug('[FormattedMessage] Processing code block:', {
        language,
        codeLength: code.length,
        theme: getTheme()
      });

      try {
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: getTheme()
        });

        console.debug('[FormattedMessage] Code highlighting successful:', {
          language,
          htmlLength: html.length
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
        console.error('[FormattedMessage] Error highlighting code:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          language,
          codeLength: code.length
        });
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