// /ollama-ui/src/__tests__/components/chat.test.tsx
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { Chat } from "@/components/Chat"
import { toast } from "sonner"
import React from "react"

// Mock essential dependencies
jest.mock("sonner")

// Mock FormattedMessage component
jest.mock("@/components/FormattedMessage", () => ({
  FormattedMessage: ({ content }: { content: string }) => <div>{content}</div>
}))

// Mock chat store
interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  id?: string;
  isEditing?: boolean;
}

interface Parameters {
  temperature?: number;
  top_p?: number;
  num_predict?: number;
  top_k?: number;
  repeat_penalty?: number;
  presence_penalty?: number;
}

interface MockStore {
  messages: Message[];
  model: string | null;
  parameters: Parameters;
  addMessage: jest.Mock<void, [Message]>;
  updateLastMessage: jest.Mock<void, [string]>;
  clearMessages: jest.Mock<void, []>;
  setModel: jest.Mock<void, [string]>;
  setParameters: jest.Mock<void, [Parameters]>;
  getFormattedMessages: jest.Mock<Message[]>;
  editMessage: jest.Mock<void, [string, string]>;
  setMessageEditing: jest.Mock<void, [string, boolean]>;
  regenerateFromMessage: jest.Mock<void, [string]>;
  setMessages: jest.Mock<void, [Message[]]>;
}

const createMockStore = (): MockStore => {
  const state = {
    messages: [] as Message[],
    model: null as string | null,
    parameters: {}
  };

  return {
    get messages() { return state.messages; },
    get model() { return state.model; },
    get parameters() { return state.parameters; },
    addMessage: jest.fn((message: Message) => {
      state.messages = [...state.messages, { ...message, id: 'test-id-' + state.messages.length }];
    }),
    updateLastMessage: jest.fn((content: string) => {
      if (state.messages.length > 0) {
        const lastIndex = state.messages.length - 1;
        state.messages = state.messages.map((msg, idx) => 
          idx === lastIndex ? { ...msg, content } : msg
        );
      }
    }),
    clearMessages: jest.fn(() => {
      state.messages = [];
    }),
    setModel: jest.fn((model: string) => {
      state.model = model;
    }),
    setParameters: jest.fn((params: Parameters) => {
      state.parameters = { ...state.parameters, ...params };
    }),
    getFormattedMessages: jest.fn(() => state.messages),
    editMessage: jest.fn((id: string, content: string) => {
      state.messages = state.messages.map(msg =>
        msg.id === id ? { ...msg, content, isEditing: false } : msg
      );
    }),
    setMessageEditing: jest.fn((id: string, isEditing: boolean) => {
      state.messages = state.messages.map(msg =>
        msg.id === id ? { ...msg, isEditing } : { ...msg, isEditing: false }
      );
    }),
    regenerateFromMessage: jest.fn((id: string) => {
      const messageIndex = state.messages.findIndex(msg => msg.id === id);
      if (messageIndex !== -1) {
        state.messages = state.messages.slice(0, messageIndex + 1);
      }
    }),
    setMessages: jest.fn((messages: Message[]) => {
      state.messages = messages;
    })
  };
};

let mockStore = createMockStore();

jest.mock("@/store/chat", () => ({
  useChatStore: () => mockStore
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
}

// Mock essential UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type = "button", disabled }: ButtonProps) => (
    <button type={type} onClick={onClick} disabled={disabled}>{children}</button>
  )
}))

jest.mock("@/components/ui/textarea", () => ({
  Textarea: ({ value, onChange, placeholder, onKeyDown }: TextareaProps) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
    />
  )
}))

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange }: SelectProps) => {
    React.useEffect(() => {
      onValueChange("Mistral");
    }, [onValueChange]);
    return (
      <div role="combobox" aria-controls="model-list" aria-expanded="false">
        {children}
      </div>
    );
  },
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-value={value}>
      {children}
    </div>
  )
}))

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  AlertTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

// Mock other essential components
jest.mock("@/components/AnimatedMessage", () => ({
  AnimatedMessage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock("@/components/AdvancedParameters", () => ({
  AdvancedParametersControl: () => <div>Advanced Parameters</div>
}))

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  MessageSquare: () => <div>MessageSquare</div>,
  AlertCircle: () => <div>AlertCircle</div>,
  Maximize2: () => <div>Maximize2</div>,
  Minimize2: () => <div>Minimize2</div>
}))

// Mock fetch for model loading
const mockModels = [
  { name: "Mistral" },
  { name: "Llama" },
  { name: "GPT-4" }
]

global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockModels),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: "OK",
    type: "default" as ResponseType,
    url: "",
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(""),
    clone: function() { return this }
  } as Response)
)

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  }
}));

describe("Chat Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = createMockStore();
    // Reset fetch mock
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockModels)
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it("selects a model and sends a message", async () => {
    // Mock chat API
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockModels)
        });
      } else if (url === '/api/chat') {
        return Promise.resolve({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.close();
            }
          }),
          headers: new Headers(),
          status: 200
        });
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<Chat />);
    
    // Wait for model to be selected
    await waitFor(() => {
      expect(mockStore.model).toBe("Mistral");
    });

    // Send message
    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
    });

    // Wait for/verify user message added
    await waitFor(() => {
      expect(mockStore.messages[0]).toEqual({
        role: "user",
        content: "Test message"
      });
    });
  });

  it("handles API errors gracefully", async () => {
    const errorMessage = "Failed to send message";
    
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === '/api/models') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockModels)
        });
      } else if (url === '/api/chat') {
        return Promise.reject(new Error(errorMessage));
      }
      return Promise.reject(new Error('Not found'));
    });

    render(<Chat />);
    
    // Wait for model selection
    await waitFor(() => {
      expect(mockStore.model).toBe("Mistral");
    });

    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it("allows editing a user message", async () => {
    render(<Chat />);
    
    // Wait for model to be selected
    await waitFor(() => {
      expect(mockStore.model).toBe("Mistral");
    });

    // Send initial message
    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: "Initial message" } });
      fireEvent.click(sendButton);
    });

    // Verify message was added
    await waitFor(() => {
      expect(mockStore.messages[0]).toMatchObject({
        role: "user",
        content: "Initial message"
      });
    });

    // Start editing
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    // Verify edit mode is active
    await waitFor(() => {
      expect(mockStore.setMessageEditing).toHaveBeenCalledWith("test-id-0", true);
    });

    // Edit the message
    const editTextarea = screen.getByDisplayValue("Initial message");
    fireEvent.change(editTextarea, { target: { value: "Edited message" } });

    // Save and regenerate
    const saveButton = screen.getByRole("button", { name: /save & regenerate/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verify message was edited and regeneration was triggered
    await waitFor(() => {
      expect(mockStore.editMessage).toHaveBeenCalledWith("test-id-0", "Edited message");
      expect(mockStore.regenerateFromMessage).toHaveBeenCalledWith("test-id-0");
    });
  });

  it("allows canceling message edit", async () => {
    render(<Chat />);
    
    // Wait for model to be selected
    await waitFor(() => {
      expect(mockStore.model).toBe("Mistral");
    });

    // Send message
    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole("button", { name: /send/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);
    });

    // Start editing
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);

    // Cancel editing
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Verify edit mode was canceled
    await waitFor(() => {
      expect(mockStore.setMessageEditing).toHaveBeenCalledWith("test-id-0", false);
    });
  });
})