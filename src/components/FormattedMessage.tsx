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

  console.debug('[FormattedMessage] Component initialization:', {
    role: message.role,
    contentLength: message.content.length,
    darkMode: _darkMode,
    hasHighlighter: !!highlighter,
    messageContent: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
  });

  useEffect(() => {
    const initHighlighter = async () => {
      console.debug('[FormattedMessage] Starting highlighter initialization');
      try {
        console.debug('[FormattedMessage] Importing shiki bundle');
        const { getSingletonHighlighter } = await import('shiki/dist/bundle-full.mjs');
        console.debug('[FormattedMessage] Creating highlighter instance');
        const highlighter = await getSingletonHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: ['typescript', 'javascript', 'python', 'bash', 'plaintext', 'rust', 'json', 'html', 'css']
        });
        console.debug('[FormattedMessage] Highlighter initialized successfully:', {
          hasHighlighter: !!highlighter,
          availableThemes: highlighter.getLoadedThemes(),
          availableLanguages: highlighter.getLoadedLanguages()
        });
        setHighlighter(highlighter);
      } catch (error) {
        console.error('[FormattedMessage] Highlighter initialization failed:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        });
      }
    };

    initHighlighter();
  }, [_darkMode]);

  const getTheme = () => {
    const theme = _darkMode ? 'github-dark' : 'github-light';
    console.debug('[FormattedMessage] Theme selection:', {
      darkMode: _darkMode,
      selectedTheme: theme,
      hasHighlighter: !!highlighter
    });
    return theme;
  };

  const components: Record<string, React.ComponentType<CodeComponentProps>> = {
    code: ({ inline, className, children, ...props }: CodeComponentProps) => {
      console.debug('[FormattedMessage] Code block rendering:', {
        inline,
        className,
        hasHighlighter: !!highlighter,
        codeLength: String(children || '').length,
        props: Object.keys(props)
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
        theme: getTheme(),
        hasHighlighter: !!highlighter,
        codePreview: code.substring(0, 50) + (code.length > 50 ? '...' : '')
      });

      try {
        const html = highlighter.codeToHtml(code, {
          lang: language,
          theme: getTheme()
        });

        console.debug('[FormattedMessage] Code highlighting successful:', {
          language,
          htmlLength: html.length,
          hasHtml: !!html,
          htmlPreview: html.substring(0, 100) + (html.length > 100 ? '...' : '')
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
          <code 
            className={cn("not-prose", className)}
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        );
      } catch (error) {
        console.error('[FormattedMessage] Code highlighting failed:', {
          error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          language,
          codeLength: code.length,
          codePreview: code.substring(0, 50) + (code.length > 50 ? '...' : '')
        });
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
    },
    pre: ({ children, ...props }) => {
      return (
        <pre className="not-prose my-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800" {...props}>
          {children}
        </pre>
      );
    },
    p: ({ children, ...props }) => {
      const hasOnlyCodeBlock = React.Children.toArray(children).every(
        child => React.isValidElement(child) && child.type === 'code'
      );
      
      if (hasOnlyCodeBlock) {
        return <>{children}</>;
      }
      
      return <p {...props}>{children}</p>;
    }
  };

  console.debug('[FormattedMessage] Rendering markdown:', {
    contentLength: message.content.length,
    hasHighlighter: !!highlighter,
    contentPreview: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
  });

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