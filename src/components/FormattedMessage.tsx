// /ollama-ui/src/components/FormattedMessage.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { getSingletonHighlighter } from 'shiki/dist/bundle-full.mjs';
import { cn } from "@/lib/utils";

import 'katex/dist/katex.min.css';

interface Message {
  content: string;
  role: string;
}

interface FormattedMessageProps {
  message: Message;
  _darkMode?: boolean;
}

interface CodeProps {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
  [key: string]: any;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ message, _darkMode = false }) => {
  const [highlighter, setHighlighter] = useState<any>(null);

  useEffect(() => {
    const initHighlighter = async () => {
      try {
        const h = await getSingletonHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: ['typescript', 'javascript', 'python', 'bash', 'plaintext', 'rust', 'json', 'html', 'css']
        });
        setHighlighter(h);
      } catch (error) {
        console.error('Error initializing highlighter:', error);
      }
    };

    initHighlighter();
  }, []);

  const getTheme = () => _darkMode ? 'github-dark' : 'github-light';

  return (
    <div 
      className={cn("prose dark:prose-invert max-w-none", {
        "dark": _darkMode
      })}
      data-testid="formatted-message"
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({ className, children, inline, ...props }: CodeProps) => {
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
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage; 