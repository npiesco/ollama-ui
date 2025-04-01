// /ollama-ui/src/components/FormattedMessage.tsx
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { type Highlighter } from 'shiki';
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

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ message, _darkMode = false }) => {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    const initHighlighter = async () => {
      const shiki = await import('shiki');
      const highlighter = await shiki.createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['typescript', 'javascript', 'python', 'bash', 'plaintext']
      });
      setHighlighter(highlighter);
    };

    initHighlighter();
  }, []);

  const formatCodeBlocks = (text: string): string => {
    // Replace code blocks with highlighted code
    return text.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (match: string, lang: string | undefined, code: string, _rest: unknown[]): string => {
        if (!highlighter) return match;
        const language = lang || 'plaintext';
        try {
          return highlighter.codeToHtml(code.trim(), {
            lang: language,
            theme: 'github-dark'
          });
        } catch {
          return match;
        }
      }
    );
  };

  const formatInlineCode = (text: string): string => {
    // Replace inline code with highlighted code
    return text.replace(
      /`([^`]+)`/g,
      (match: string, code: string): string => {
        if (!highlighter) return match;
        try {
          return highlighter.codeToHtml(code.trim(), {
            lang: 'plaintext',
            theme: 'github-dark'
          });
        } catch {
          return match;
        }
      }
    );
  };

  const formattedContent = formatCodeBlocks(formatInlineCode(message.content));

  return (
    <div className={cn("prose dark:prose-invert max-w-none", {
      "dark": _darkMode
    })}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage; 