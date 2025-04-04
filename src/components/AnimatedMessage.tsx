// /ollama-ui/src/components/AnimatedMessage.tsx
'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Pencil, RotateCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { FormattedMessage } from '@/components/FormattedMessage';
import { cn } from '@/lib/utils';
import type { Message } from '@/store/chat';
import { useChatStore } from '@/store/chat';

interface AnimatedMessageProps {
  message: Message;
  onRegenerate?: (messageId: string) => Promise<void>;
  isGenerating?: boolean;
}

export default function AnimatedMessage({ 
  message, 
  onRegenerate, 
  isGenerating = false
}: AnimatedMessageProps) {
  const chatStore = useChatStore();

  const handleEditClick = useCallback(() => {
    chatStore.setMessageEditing(message.id || '', true);
  }, [message.id, chatStore]);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    chatStore.editMessage(message.id || '', e.target.value);
  }, [message.id, chatStore]);

  const handleCancelEdit = useCallback(() => {
    chatStore.setMessageEditing(message.id || '', false);
  }, [message.id, chatStore]);

  const handleSaveAndRegenerate = useCallback(async () => {
    if (message.id && onRegenerate) {
      chatStore.setMessageEditing(message.id, false);
      await onRegenerate(message.id);
    }
  }, [message.id, onRegenerate, chatStore]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveAndRegenerate();
    }
  }, [handleCancelEdit, handleSaveAndRegenerate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-${message.role} slide-in ${isGenerating ? 'opacity-50' : ''} group relative`}
    >
      {message.isEditing ? (
        <div className="flex flex-col gap-2">
          <Textarea
            autoFocus
            className="w-full font-mono min-h-[80px]"
            value={message.content}
            onChange={handleEditChange}
            onKeyDown={handleKeyDown}
          />
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAndRegenerate}
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
                onClick={handleEditClick}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
            {message.role === 'assistant' && message.id && message.content && message.content !== 'Thinking...' && (
              <Button
                className="h-6 w-6"
                size="icon"
                variant="ghost"
                onClick={handleSaveAndRegenerate}
                disabled={isGenerating}
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {message.content === 'Thinking...' ? (
            <div className="flex items-center gap-2 text-muted-foreground p-2">
              <Spinner size="sm" />
              <span>Thinking...</span>
            </div>
          ) : message.role === 'user' ? (
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

