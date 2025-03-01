// /ollama-ui/src/store/chat.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: string;
  content: string;
  image?: string;
}

interface ChatState {
  messages: Message[];
  model: string;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setModel: (model: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      model: '',
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateLastMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            messages[messages.length - 1].content = content;
          }
          return { messages };
        }),
      setModel: (model) => set({ model }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
      skipHydration: true, // Prevents hydration issues with Next.js
    }
  )
); 