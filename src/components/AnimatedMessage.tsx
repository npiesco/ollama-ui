// /ollama-ui/src/components/AnimatedMessage.tsx
'use client';

import type React from 'react';
import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Message } from '@/store/chat';
import { FormattedMessage } from '@/components/FormattedMessage';

interface AnimatedMessageProps {
  message: Message;
  onRegenerate: (messageId: string) => Promise<void>;
  isGenerating: boolean;
}

function AnimatedMessage({ message, onRegenerate, isGenerating }: AnimatedMessageProps) {
  console.debug('[AnimatedMessage] Rendering message:', {
    id: message.id,
    role: message.role,
    isEditing: message.isEditing,
    isGenerating,
    contentLength: message.content.length
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.debug('[AnimatedMessage] Edit change:', {
      id: message.id,
      oldContent: message.content,
      newContent: e.target.value
    });
    // Handle edit change
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    console.debug('[AnimatedMessage] Key down:', {
      id: message.id,
      key: e.key,
      shiftKey: e.shiftKey
    });

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.debug('[AnimatedMessage] Triggering regeneration from key press:', {
        id: message.id
      });
      await onRegenerate(message.id || '');
    }
  };

  const handleCancelEdit = () => {
    console.debug('[AnimatedMessage] Canceling edit:', {
      id: message.id
    });
    // Handle cancel edit
  };

  const handleSaveAndRegenerate = async () => {
    console.debug('[AnimatedMessage] Saving and regenerating:', {
      id: message.id,
      content: message.content
    });
    await onRegenerate(message.id || '');
  };

  const handleEditClick = () => {
    console.debug('[AnimatedMessage] Entering edit mode:', {
      id: message.id
    });
    // Handle edit mode
  };

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

