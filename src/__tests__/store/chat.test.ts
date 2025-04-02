import { useChatStore } from '@/store/chat';
import { type Message } from '@/store/chat';

// Mock crypto.randomUUID
const mockUUID = jest.fn();
let uuidCounter = 0;
mockUUID.mockImplementation(() => `test-uuid-${uuidCounter++}`);
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockUUID
  }
});

describe('Chat Store', () => {
  beforeEach(() => {
    // Reset UUID counter
    uuidCounter = 0;
    // Clear the store before each test
    useChatStore.setState({
      messages: [],
      model: null,
      parameters: {
        temperature: 0.2,
        top_p: 0.1,
        num_predict: 1024,
        top_k: 20,
        repeat_penalty: 1.3,
        presence_penalty: 0.2
      }
    });
  });

  it('adds a message with a unique ID', () => {
    const message: Message = {
      role: 'user',
      content: 'Hello'
    };

    useChatStore.getState().addMessage(message);
    const messages = useChatStore.getState().messages;

    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('test-uuid-0');
    expect(messages[0].content).toBe('Hello');
  });

  it('updates the last message', () => {
    // Add initial message
    useChatStore.getState().addMessage({
      role: 'user' as const,
      content: 'Hello'
    });

    // Update last message
    useChatStore.getState().updateLastMessage('Updated content');
    const messages = useChatStore.getState().messages;

    expect(messages[0].content).toBe('Updated content');
  });

  it('clears all messages', () => {
    // Add some messages
    useChatStore.getState().addMessage({
      role: 'user' as const,
      content: 'Hello'
    });
    useChatStore.getState().addMessage({
      role: 'assistant' as const,
      content: 'Hi'
    });

    // Clear messages
    useChatStore.getState().clearMessages();
    const messages = useChatStore.getState().messages;

    expect(messages).toHaveLength(0);
  });

  it('sets and gets the model', () => {
    useChatStore.getState().setModel('test-model');
    expect(useChatStore.getState().model).toBe('test-model');
  });

  it('sets and gets parameters', () => {
    const newParams = {
      temperature: 0.5,
      top_p: 0.2,
      num_predict: 2048,
      top_k: 40,
      repeat_penalty: 1.5,
      presence_penalty: 0.3
    };

    useChatStore.getState().setParameters(newParams);
    expect(useChatStore.getState().parameters).toEqual(newParams);
  });

  it('gets formatted messages', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' }
    ];

    messages.forEach(msg => useChatStore.getState().addMessage(msg));
    const formattedMessages = useChatStore.getState().getFormattedMessages();

    expect(formattedMessages).toHaveLength(2);
    expect(formattedMessages[0].content).toBe('Hello');
    expect(formattedMessages[1].content).toBe('Hi');
  });

  it('edits a message', () => {
    // Add a message
    useChatStore.getState().addMessage({
      role: 'user' as const,
      content: 'Original'
    });

    const messageId = useChatStore.getState().messages[0].id!;
    
    // Edit the message
    useChatStore.getState().editMessage(messageId, 'Edited');
    const messages = useChatStore.getState().messages;

    expect(messages[0].content).toBe('Edited');
    expect(messages[0].isEditing).toBe(false);
  });

  it('sets message editing state', () => {
    // Add two messages
    useChatStore.getState().addMessage({
      role: 'user' as const,
      content: 'First'
    });
    useChatStore.getState().addMessage({
      role: 'assistant' as const,
      content: 'Second'
    });

    const firstMessageId = useChatStore.getState().messages[0].id!;
    
    // Set editing state for first message
    useChatStore.getState().setMessageEditing(firstMessageId, true);
    const messages = useChatStore.getState().messages;

    // First message should be editing, second should not
    expect(messages[0].isEditing).toBe(true);
    expect(messages[1].isEditing).toBe(false);

    // Set editing state for second message
    const secondMessageId = messages[1].id!;
    useChatStore.getState().setMessageEditing(secondMessageId, true);
    const updatedMessages = useChatStore.getState().messages;

    // First message should not be editing, second should be
    expect(updatedMessages[0].isEditing).toBe(false);
    expect(updatedMessages[1].isEditing).toBe(true);
  });

  it('regenerates from a message', () => {
    // Add multiple messages
    useChatStore.getState().addMessage({
      role: 'user' as const,
      content: 'First'
    });
    useChatStore.getState().addMessage({
      role: 'assistant' as const,
      content: 'Second'
    });
    useChatStore.getState().addMessage({
      role: 'user' as const,
      content: 'Third'
    });

    const secondMessageId = useChatStore.getState().messages[1].id!;
    
    // Regenerate from the second message
    useChatStore.getState().regenerateFromMessage(secondMessageId);
    const messages = useChatStore.getState().messages;

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('First');
    expect(messages[1].content).toBe('Second');
    expect(messages[0].id).toBe('test-uuid-0');
    expect(messages[1].id).toBe('test-uuid-1');
  });

  it('sets messages directly', () => {
    const newMessages: Message[] = [
      { role: 'user', content: 'New 1' },
      { role: 'assistant', content: 'New 2' }
    ];

    useChatStore.getState().setMessages(newMessages);
    const messages = useChatStore.getState().messages;

    expect(messages).toHaveLength(2);
    expect(messages[0].content).toBe('New 1');
    expect(messages[1].content).toBe('New 2');
  });

  it('handles message with images', () => {
    const message: Message = {
      role: 'user',
      content: 'Hello',
      images: ['image1.jpg', 'image2.jpg']
    };

    useChatStore.getState().addMessage(message);
    const messages = useChatStore.getState().messages;

    expect(messages[0].images).toEqual(['image1.jpg', 'image2.jpg']);
  });
}); 