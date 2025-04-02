// /ollama-ui/src/components/AnimatedMessage.tsx
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Message } from '@/store/chat';
import { FormattedMessage } from '@/components/FormattedMessage';
import { useChatStore } from '@/store/chat';

interface AnimatedMessageProps {
  message: Message;
  onRegenerate: (messageId: string) => Promise<void>;
  isGenerating: boolean;
}

function AnimatedMessage({ message, onRegenerate, isGenerating }: AnimatedMessageProps) {
  const chatStore = useChatStore();
  
  console.debug('[AnimatedMessage] Component initialization:', {
    messageId: message.id,
    role: message.role,
    contentLength: message.content.length,
    isEditing: message.isEditing,
    isGenerating,
    contentPreview: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '')
  });

  const handleEditClick = useCallback(() => {
    console.debug('[AnimatedMessage] Edit button clicked:', {
      messageId: message.id,
      currentContent: message.content
    });
    chatStore.setMessageEditing(message.id!, true);
  }, [message.id, message.content, chatStore]);

  const handleEditChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.debug('[AnimatedMessage] Edit content changed:', {
      messageId: message.id,
      newContentLength: e.target.value.length,
      contentPreview: e.target.value.substring(0, 50) + (e.target.value.length > 50 ? '...' : '')
    });
    chatStore.editMessage(message.id!, e.target.value);
  }, [message.id, chatStore]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.debug('[AnimatedMessage] Key pressed in edit mode:', {
      messageId: message.id,
      key: e.key,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey
    });
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveAndRegenerate();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }, [message.id]);

  const handleCancelEdit = useCallback(() => {
    console.debug('[AnimatedMessage] Edit cancelled:', {
      messageId: message.id,
      originalContent: message.content
    });
    chatStore.setMessageEditing(message.id!, false);
  }, [message.id, message.content, chatStore]);

  const handleSaveAndRegenerate = useCallback(async () => {
    console.debug('[AnimatedMessage] Saving and regenerating:', {
      messageId: message.id,
      contentLength: message.content.length,
      contentPreview: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
    });
    chatStore.setMessageEditing(message.id!, false);
    await onRegenerate(message.id!);
  }, [message.id, message.content, onRegenerate, chatStore]);

  console.debug('[AnimatedMessage] Rendering message:', {
    messageId: message.id,
    role: message.role,
    isEditing: message.isEditing,
    isGenerating,
    contentLength: message.content.length,
    hasContent: !!message.content
  });

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

export default AnimatedMessage;

