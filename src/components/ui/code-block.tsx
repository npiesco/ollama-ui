import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

export function CodeBlock({ language, value, className }: CodeBlockProps) {
  return (
    <div className={cn("not-prose", className)}>
      <pre>
        <code className={`language-${language}`}>{value}</code>
      </pre>
    </div>
  );
} 