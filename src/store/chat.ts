// /ollama-ui/src/store/chat.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdvancedParameters } from '@/types/ollama';

interface Message {
  role: string;
  content: string;
  image?: string;
}

interface ChatState {
  messages: Message[];
  model: string | null;
  parameters: AdvancedParameters;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setModel: (model: string) => void;
  setParameters: (params: AdvancedParameters) => void;
}

// Clear any existing storage on app load
if (typeof window !== 'undefined') {
  sessionStorage.removeItem('chat-store');
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      model: null,
      parameters: {
        temperature: 0.2,
        top_p: 0.1,
        num_predict: 1024,
        top_k: 20,
        repeat_penalty: 1.3,
        presence_penalty: 0.2
      },
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      updateLastMessage: (content) =>
        set((state) => ({
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? { ...msg, content }
              : msg
          ),
        })),
      clearMessages: () => set({ messages: [] }),
      setModel: (model) => set({ model }),
      setParameters: (params) => set({ parameters: params }),
    }),
    {
      name: 'chat-store',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
); 