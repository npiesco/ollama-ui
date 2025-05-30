// /ollama-ui/src/components/Chat.tsx
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { AlertCircle, MessageSquare, Maximize2, Minimize2, X } from 'lucide-react'
import { config } from '@/lib/config'

import { AdvancedParametersControl } from '@/components/AdvancedParameters'
import AnimatedMessage from "@/components/AnimatedMessage"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from '@/components/ui/label'
import { MultimodalInput } from '@/components/MultimodalInput'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { Textarea } from "@/components/ui/textarea"
import type { AdvancedParameters, Tool, ModelResponse } from '@/types/ollama'
import { useChatStore, type Message } from '@/store/chat'

interface ChatProps {
  isPopped?: boolean
}

export function Chat({ isPopped = false }: ChatProps): React.ReactElement {
  const router = useRouter()
  const chatStore = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const defaultParams = {
    temperature: 0.7,
    top_p: 0.9,
    num_predict: 2048,
    top_k: 40,
    repeat_penalty: 1.8,
    presence_penalty: 0.5
  }
  const [temperature, setTemperature] = useState(chatStore.parameters?.temperature ?? defaultParams.temperature)
  const [topP, setTopP] = useState(chatStore.parameters?.top_p ?? defaultParams.top_p)
  const [advancedParams, setAdvancedParams] = useState<AdvancedParameters>({
    temperature: chatStore.parameters?.temperature ?? defaultParams.temperature,
    top_p: chatStore.parameters?.top_p ?? defaultParams.top_p,
    num_predict: chatStore.parameters?.num_predict ?? defaultParams.num_predict,
    top_k: chatStore.parameters?.top_k ?? defaultParams.top_k,
    repeat_penalty: chatStore.parameters?.repeat_penalty ?? defaultParams.repeat_penalty,
    presence_penalty: chatStore.parameters?.presence_penalty ?? defaultParams.presence_penalty
  })
  const [images, setImages] = useState<string[]>([])
  const [tools] = useState<Tool[]>([])
  const [format, setFormat] = useState<'json' | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelResponse[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [modelCapabilities, setModelCapabilities] = useState<string[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  console.debug('[Chat] Component initialization:', {
    isPopped,
    messageCount: chatStore.messages.length,
    selectedModel: chatStore.model,
    parameters: chatStore.parameters,
    isLoadingModels,
    availableModelsCount: availableModels.length
  });

  useEffect(() => {
    if (!isPopped) {
      console.debug('[Chat] Clearing chat store');
      sessionStorage.removeItem('chat-store');
      sessionStorage.removeItem('chatState');
    }
  }, [isPopped]);

  const fetchModelCapabilities = useCallback(async (modelName: string) => {
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelName })
      });
      if (!response.ok) throw new Error('Failed to fetch model capabilities');
      const data = await response.json();
      // Extract capabilities from model info
      const capabilities: string[] = [];
      if (data.model_info) {
        // Simply check if any key contains 'vision'
        const hasVision = Object.keys(data.model_info).some(key => key.toLowerCase().includes('vision'));
        if (hasVision) {
          capabilities.push('vision');
        }
      }
      setModelCapabilities(capabilities);
      console.log('Model capabilities:', capabilities, 'for model:', modelName); // Debug log
    } catch (error) {
      console.error('Error fetching model capabilities:', error);
      setModelCapabilities([]);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch(`${config.OLLAMA_API_HOST}/api/tags`)
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setAvailableModels(data.models || [])
    } catch {
      toast.error('Failed to fetch models')
    } finally {
      setIsLoadingModels(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  useEffect(() => {
    if (availableModels.length > 0 && !chatStore.model) {
      const firstModel = availableModels.sort((a, b) => a.name.localeCompare(b.name))[0].name;
      chatStore.setModel(firstModel);
      fetchModelCapabilities(firstModel);
    }
  }, [availableModels, chatStore, fetchModelCapabilities]);

  // Fetch model capabilities when model changes
  useEffect(() => {
    if (chatStore.model) {
      fetchModelCapabilities(chatStore.model);
    }
  }, [chatStore.model, fetchModelCapabilities]);

  const scrollToBottom = useCallback((force: boolean = false) => {
    if (messagesEndRef.current) {
      const element = messagesEndRef.current;
      const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
      
      if (force || isNearBottom) {
        try {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: force ? 'instant' : 'smooth'
          });
        } catch {
          element.scrollTop = element.scrollHeight;
        }
      }
    }
  }, [])

  // Scroll on new messages
  useEffect(() => {
    if (chatStore.messages.length > 0) {
      const lastMessage = chatStore.messages[chatStore.messages.length - 1];
      // Only force scroll on brand new empty messages (start of streaming)
      // or when the last message is from the assistant and is actively being updated
      if (lastMessage.content === '' || (lastMessage.role === 'assistant' && isGenerating)) {
        scrollToBottom(true);
      }
    }
  }, [chatStore.messages, scrollToBottom, isGenerating]);

  // Remove the initial scroll effect as it's handled by the above
  useEffect(() => {
    if (isPopped) {
      const element = messagesEndRef.current;
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'instant'
        });
      }
    }
  }, [isPopped]);

  // Update scroll during streaming - only when actively generating
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    
    if (isGenerating && chatStore.messages.length > 0) {
      const lastMessage = chatStore.messages[chatStore.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // Auto-scroll during active generation
        scrollInterval = setInterval(() => scrollToBottom(false), 100);
        return () => clearInterval(scrollInterval);
      }
    }
    
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [chatStore.messages, scrollToBottom, isGenerating]);

  const handleModelNotFound = () => {
    toast.error(
      <div className="space-y-2">
        <p>Model {chatStore.model} is not installed.</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/models')}
        >
          Go to Models Page
        </Button>
      </div>
    )
  }

  const handleTerminate = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsGenerating(false)
    }
  }, [])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isGenerating) return

    try {
      setIsGenerating(true)
      abortControllerRef.current = new AbortController()

      const userMessage: Message = {
        role: 'user' as const,
        content: input,
        images: images.length > 0 ? images : undefined
      }

      setInput("")
      setImages([])
      chatStore.addMessage(userMessage)
      scrollToBottom(true)

      // Add thinking indicator immediately
      const thinkingMessage: Message = {
        role: 'assistant',
        content: 'Thinking...'
      }
      chatStore.addMessage(thinkingMessage)
      scrollToBottom(true)

      const payload = {
        model: chatStore.model,
        messages: chatStore.getFormattedMessages(),
        format,
        tools,
        ...advancedParams
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error?.includes('not found')) {
          handleModelNotFound()
          return
        }
        throw new Error(errorData.error || "Chat request failed")
      }

      const reader = response.body?.getReader()
      let assistantMessageContent = ""
      let buffer = ""
      let chunkCount = 0
      let responseStartTime = Date.now()

      try {
        while (true) {
          if (!reader) {
            throw new Error('Failed to read response stream')
          }
          
          const { done, value } = await reader.read()
          if (done) break

          chunkCount++
          
          const chunk = new TextDecoder().decode(value)
          buffer += chunk
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          let updatedContent = assistantMessageContent
          let foundContent = false

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line)
                if (parsed.message?.content) {
                  const content = parsed.message.content
                  updatedContent += content
                  foundContent = true
                  
                  // If this is the first content chunk, replace "Thinking..." with actual content
                  if (assistantMessageContent === "" && updatedContent.trim()) {
                    updatedContent = content
                  }
                }
              } catch (error) {
                console.error("Failed to parse message:", error)
              }
            }
          }
          
          if (foundContent) {
            assistantMessageContent = updatedContent
            chatStore.updateLastMessage(assistantMessageContent)
            
            // Log progress
            const elapsedSeconds = ((Date.now() - responseStartTime) / 1000).toFixed(1)
            console.debug(`[Chat] Processing response: ${chunkCount} chunks, ${elapsedSeconds}s elapsed`)
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          chatStore.updateLastMessage(assistantMessageContent + "\n[Message generation terminated]")
          return
        }
        throw error
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer)
          if (parsed.message?.content) {
            assistantMessageContent += parsed.message.content
            chatStore.updateLastMessage(assistantMessageContent)
          }
        } catch (error) {
          console.error("Failed to parse final buffer:", buffer, error instanceof Error ? error.message : 'Unknown error')
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Chat error:", error)
        toast.error(error.message)
      } else {
        console.error("Unknown chat error:", error)
        toast.error("Failed to send message")
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
      scrollToBottom()
    }
  }

  const handleAdvancedParamsChange = useCallback((params: AdvancedParameters) => {
    if (typeof params.temperature === 'number') setTemperature(params.temperature)
    if (typeof params.top_p === 'number') setTopP(params.top_p)
    setAdvancedParams(params)
    chatStore.setParameters(params)  // Save parameters to persistent store
  }, [chatStore])

  const handlePopOut = () => {
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    // Save current chat state before opening popup
    const state: {
      messages: Message[];
      model: string | null;
      parameters: AdvancedParameters;
    } = {
      messages: chatStore.messages,
      model: chatStore.model,
      parameters: advancedParams
    }
    sessionStorage.setItem('chatState', JSON.stringify(state))
    
    window.open(
      '/chat/popout',
      'Chat',
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }

  // Load state in popup window
  useEffect(() => {
    const { addMessage, clearMessages, setModel } = chatStore
    
    if (isPopped) {
      try {
        const savedState = sessionStorage.getItem('chatState')
        if (savedState) {
          const { messages, model, parameters } = JSON.parse(savedState) as {
            messages: Message[];
            model: string | null;
            parameters: AdvancedParameters;
          }
          clearMessages()
          messages.forEach((msg: Message) => {
            addMessage(msg)
          })
          if (model) setModel(model)
          if (parameters) handleAdvancedParamsChange(parameters)
          sessionStorage.removeItem('chatState')
        }
      } catch (error) {
        console.error('Failed to load chat state:', error)
      }
    }
  }, [isPopped, chatStore, handleAdvancedParamsChange])

  // Save state when popup closes
  useEffect(() => {
    if (isPopped) {
      const handleBeforeUnload = () => {
        sessionStorage.setItem('chatState', JSON.stringify({
          messages: chatStore.messages,
          model: chatStore.model,
          parameters: advancedParams
        }))
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isPopped, chatStore, advancedParams])

  // Check for state changes in main window
  useEffect(() => {
    const { addMessage, clearMessages, setModel } = chatStore
    let intervalId: NodeJS.Timeout | null = null
    
    if (!isPopped) {
      const checkPopupState = () => {
        try {
          const savedState = sessionStorage.getItem('chatState')
          if (savedState) {
            const { messages, model, parameters } = JSON.parse(savedState) as {
              messages: Message[];
              model: string | null;
              parameters: AdvancedParameters;
            }
            if (model) {
              setModel(model)
            }
            if (Array.isArray(messages)) {
              clearMessages()
              messages.forEach((msg: Message) => addMessage(msg))
            }
            if (parameters) {
              handleAdvancedParamsChange(parameters)
            }
            sessionStorage.removeItem('chatState')
          }
        } catch (error) {
          console.error('Failed to load chat state:', error)
        }
      }
      
      intervalId = setInterval(checkPopupState, 1000)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isPopped, chatStore, handleAdvancedParamsChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        handleSubmit();
      }
    }
  };

  const handleRegenerateFromEdit = async (messageId: string) => {
    console.debug('[Chat] Starting regeneration from edit:', {
      messageId,
      messageCount: chatStore.messages.length,
      messageIndex: chatStore.messages.findIndex(msg => msg.id === messageId)
    });

    chatStore.editMessage(messageId, chatStore.messages.find(msg => msg.id === messageId)?.content || '');
    chatStore.regenerateFromMessage(messageId);
    
    try {
      setIsGenerating(true);
      abortControllerRef.current = new AbortController();

      const payload = {
        model: chatStore.model,
        messages: chatStore.getFormattedMessages(),
        format,
        tools,
        ...advancedParams
      };

      console.debug('[Chat] Sending regeneration request:', {
        model: chatStore.model,
        messageCount: payload.messages.length,
        format,
        parameters: advancedParams
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Chat] Regeneration request failed:', {
          status: response.status,
          error: errorData.error
        });
        if (errorData.error?.includes('not found')) {
          handleModelNotFound();
          return;
        }
        throw new Error(errorData.error || "Chat request failed");
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: 'Thinking...'
      };
      chatStore.addMessage(assistantMessage);
      
      const reader = response.body?.getReader();
      let assistantMessageContent = "";
      let buffer = "";
      let chunkCount = 0;
      let responseStartTime = Date.now();
      let lastChunkTime = Date.now();

      console.debug('[Chat] Starting to read response stream');

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        buffer += chunk;

        try {
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              console.debug('[Chat] Received chunk:', {
                type: data.type,
                contentLength: data.content?.length || 0,
                contentPreview: data.content?.substring(0, 50) + (data.content?.length > 50 ? '...' : '')
              });

              if (data.type === 'content') {
                assistantMessageContent += data.content;
                chatStore.updateLastMessage(assistantMessageContent);
              }
            }
          }
        } catch (error) {
          console.error('[Chat] Error processing chunk:', {
            error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            chunkPreview: chunk.substring(0, 50) + (chunk.length > 50 ? '...' : '')
          });
        }
      }

      console.debug('[Chat] Regeneration complete:', {
        messageId,
        contentLength: assistantMessageContent.length,
        contentPreview: assistantMessageContent.substring(0, 50) + (assistantMessageContent.length > 50 ? '...' : '')
      });
    } catch (error) {
      console.error('[Chat] Regeneration failed:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      });
      toast.error("Failed to regenerate response");
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const onImageSelect = (file: File | null, index?: number) => {
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        // Extract just the base64 data, removing the data URL prefix
        const base64Data = dataUrl.split(',')[1]
        console.log(`[Chat] Image selected: ${file.name}, ${file.type}, size: ${file.size} bytes`)
        setImages(prev => [...prev, base64Data])
      }
      reader.readAsDataURL(file)
    } else if (typeof index === 'number') {
      setImages(prev => prev.filter((_, i) => i !== index))
    } else {
      setImages([])
    }
  }

  console.debug('[Chat] Rendering component:', {
    messageCount: chatStore.messages.length,
    selectedModel: chatStore.model,
    isGenerating,
    isLoadingModels,
    availableModelsCount: availableModels.length,
    hasInput: !!input,
    inputLength: input.length,
    hasImages: images.length > 0,
    imageCount: images.length
  });

  if (isPopped) {
    return (
      <div className="h-full flex flex-col">
        <div className="absolute top-0 right-0 z-10 p-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => window.close()}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth p-4" ref={messagesEndRef}>
          <div className="pt-8">
            {chatStore.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>Start a conversation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatStore.messages.map((message: Message, index: number) => (
                  <AnimatedMessage 
                    key={message.id ?? index} 
                    message={message}
                    onRegenerate={handleRegenerateFromEdit}
                    isGenerating={isGenerating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 pt-2">
          <form onSubmit={(e) => handleSubmit(e)} className="space-y-2">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${chatStore.model}`}
                className="w-full font-mono min-h-[80px] placeholder:text-muted-foreground"
                disabled={isGenerating}
              />
              <span className="absolute left-[14px] top-[38px] text-xs text-muted-foreground italic pointer-events-none md:static md:mt-1 md:ml-2">
                (Enter to send, Shift+Enter for new line)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
              {isGenerating ? (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleTerminate}
                  title="Stop generating"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                  <Button type="submit" disabled={!input.trim() && images.length === 0}>Send</Button>
                )}
              </div>
              <div className="flex-1 flex justify-center">
                {modelCapabilities.includes('vision') && (
                  <div className="relative">
                    <MultimodalInput 
                      onImageSelect={(file, index) => onImageSelect(file, index)}
                      imagePreview={null}
                      images={images}
                    />
                  </div>
                )}
              </div>
              <Button 
                type="button"
                variant="outline" 
                onClick={chatStore.clearMessages}
              >
                Clear Chat
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (isLoadingModels) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              Loading models...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (availableModels.length === 0) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Models Installed</AlertTitle>
          <AlertDescription>
            You need to install at least one model to start chatting.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <MessageSquare className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <h2 className="text-lg font-semibold">Welcome to Ollama UI</h2>
                <p className="text-gray-500 mt-2">
                  To get started, you&apos;ll need to install a model first.
                </p>
              </div>
              <Button onClick={() => router.push('/models')}>
                Go to Models Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">Chat</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <Select 
                  value={chatStore.model ?? undefined} 
                  onValueChange={chatStore.setModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.sort((a, b) => a.name.localeCompare(b.name)).map(model => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="border p-4 h-[400px] relative overflow-hidden">
                  <div className="absolute top-2 right-2 z-10">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="bg-background/80 backdrop-blur-sm"
                      onClick={handlePopOut}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div 
                    ref={messagesEndRef}
                    className="h-full overflow-y-auto overflow-x-hidden scroll-smooth pb-4 w-full"
                    style={{ maxHeight: "calc(100% - 8px)" }}
                  >
                    {chatStore.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p>Start a conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chatStore.messages.map((message: Message, index: number) => (
                          <AnimatedMessage 
                            key={message.id ?? index} 
                            message={message}
                            onRegenerate={handleRegenerateFromEdit}
                            isGenerating={isGenerating}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={(e) => handleSubmit(e)} className="space-y-2">
                  <div className="relative">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Message ${chatStore.model}`}
                      className="w-full font-mono min-h-[80px] placeholder:text-muted-foreground"
                      disabled={isGenerating}
                    />
                    <span className="absolute left-[14px] top-[38px] text-xs text-muted-foreground italic pointer-events-none md:static md:mt-1 md:ml-2">
                      (Enter to send, Shift+Enter for new line)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                    {isGenerating ? (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleTerminate}
                        title="Stop generating"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                        <Button type="submit" disabled={!input.trim() && images.length === 0}>Send</Button>
                      )}
                    </div>
                    <div className="flex-1 flex justify-center">
                      {modelCapabilities.includes('vision') && (
                        <div className="relative">
                          <MultimodalInput 
                            onImageSelect={(file, index) => onImageSelect(file, index)}
                            imagePreview={null}
                            images={images}
                          />
                        </div>
                      )}
                    </div>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={chatStore.clearMessages}
                    >
                      Clear Chat
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="w-full md:w-[160px] lg:w-[160px] space-y-2">
              <div>
                <AdvancedParametersControl 
                  temperature={temperature}
                  topP={topP}
                  onParamsChange={handleAdvancedParamsChange}
                />
              </div>
              
              <Card className="mt-2">
                <CardHeader className="p-2">
                  <CardTitle className="text-sm">Options</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="json-mode"
                      checked={format === 'json'}
                      onCheckedChange={(checked) => setFormat(checked ? 'json' : null)}
                    />
                    <Label htmlFor="json-mode" className="text-xs">JSON Output</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 