// /ollama-ui/src/store/chat.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdvancedParameters } from '@/types/ollama';

export interface Message {
  role: 'user' | 'assistant';  // Restrict roles to user/assistant
  content: string;
  images?: string[];  // Make images an array and optional
  id?: string;  // Add unique identifier for messages
  isEditing?: boolean;  // Add editing state
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
  getFormattedMessages: () => Message[];  // Add new function to get formatted messages
  editMessage: (id: string, content: string) => void;  // Add edit function
  setMessageEditing: (id: string, isEditing: boolean) => void;  // Add edit state function
  regenerateFromMessage: (id: string) => void;  // Add regeneration function
  setMessages: (messages: Message[]) => void;  // Add new function
}

// Clear any existing storage on app load
if (typeof window !== 'undefined') {
  sessionStorage.removeItem('chat-store');
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
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
          messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
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
      getFormattedMessages: () => get().messages,  // Return properly formatted messages
      editMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === id
              ? { ...msg, content, isEditing: false }
              : msg
          ),
        })),
      setMessageEditing: (id, isEditing) =>
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === id
              ? { ...msg, isEditing }
              : { ...msg, isEditing: false }
          ),
        })),
      regenerateFromMessage: (id) =>
        set((state) => {
          const messageIndex = state.messages.findIndex(msg => msg.id === id);
          if (messageIndex === -1) return state;
          
          // Keep messages up to and including the edited message
          const messages = state.messages.slice(0, messageIndex + 1);
          return { messages };
        }),
      setMessages: (messages) => set({ messages }),  // Add new function implementation
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