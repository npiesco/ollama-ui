// /ollama-ui/src/components/AnimatedMessage.tsx
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Message } from '@/store/chat';
import FormattedMessage from '@/components/FormattedMessage';

interface AnimatedMessageProps {
  message: Message;
  onRegenerate: (messageId: string) => Promise<void>;
  isGenerating: boolean;
}

export function AnimatedMessage({ message, onRegenerate, isGenerating }: AnimatedMessageProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`message-${message.role} slide-in ${isGenerating ? 'opacity-50' : ''} group relative`}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {message.isEditing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            autoFocus
            className="w-full font-mono min-h-[80px]"
            value={message.content}
            onChange={() => {
              // Handle edit change
            }}
            onKeyDown={(_e) => {
              if (_e.key === 'Enter' && !_e.shiftKey) {
                _e.preventDefault();
                void onRegenerate(message.id || '');
              }
            }}
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Handle cancel edit
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => void onRegenerate(message.id || '')}
            >
              Save & Regenerate
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.role === 'user' && (
              <Button
                className="h-6 w-6"
                size="icon"
                variant="ghost"
                onClick={() => {
                  // Handle edit mode
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
          {message.role === 'user' ? (
            <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 shadow-sm">
              {message.content}
            </div>
          ) : (
            <FormattedMessage message={message} />
          )}
        </>
      )}
    </motion.div>
  );
}

