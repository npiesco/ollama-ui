"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AnimatedMessage } from "@/components/AnimatedMessage"
import Image from "next/image"
import { AdvancedParametersControl } from '@/components/AdvancedParameters'
import { MultimodalInput } from '@/components/MultimodalInput'
import { AdvancedParameters, Tool, ModelResponse } from '@/types/ollama'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MessageSquare, Maximize2, Minimize2 } from 'lucide-react'
import { useChatStore } from '@/store/chat'

interface ChatProps {
  isPopped?: boolean
}

export function Chat({ isPopped = false }: ChatProps) {
  const router = useRouter()
  const chatStore = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [advancedParams, setAdvancedParams] = useState<AdvancedParameters>({})
  const [images, setImages] = useState<string[]>([])
  const [tools] = useState<Tool[]>([])
  const [format, setFormat] = useState<'json' | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelResponse[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    if (availableModels.length > 0 && !chatStore.model) {
      const firstModel = availableModels.sort((a, b) => a.name.localeCompare(b.name))[0].name;
      chatStore.setModel(firstModel);
    }
  }, [availableModels, chatStore]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
      }, 100);
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatStore.messages])

  useEffect(() => {
    if (isPopped) {
      // Call multiple times to ensure it scrolls after content is fully loaded
      scrollToBottom()
      setTimeout(scrollToBottom, 100)
      setTimeout(scrollToBottom, 500)
    }
  }, [isPopped])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setAvailableModels(data)
    } catch {
      toast.error('Failed to fetch models')
    } finally {
      setIsLoadingModels(false)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!availableModels.some(m => m.name === chatStore.model)) {
      handleModelNotFound()
      return
    }
    
    const payload = {
      model: chatStore.model,
      messages: [{
        role: 'user',
        content: input,
        ...(images.length > 0 && { images })
      }],
      format,
      tools,
      ...advancedParams
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error?.includes('not found')) {
          handleModelNotFound()
          return
        }
        throw new Error(errorData.error || "Chat request failed")
      }

      chatStore.addMessage({ role: "user", content: input })
      setInput("")

      // Add initial empty assistant message
      chatStore.addMessage({ role: "assistant", content: "" })
      
      const reader = response.body?.getReader()
      let assistantMessage = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        buffer += new TextDecoder().decode(value)
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line)
              if (parsed.message?.content) {
                const content = parsed.message.content
                assistantMessage += content
                chatStore.updateLastMessage(assistantMessage)
              }
            } catch (error) {
              console.error("Failed to parse line:", line, error instanceof Error ? error.message : 'Unknown error')
            }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer)
          if (parsed.message?.content) {
            assistantMessage += parsed.message.content
            chatStore.updateLastMessage(assistantMessage)
          }
        } catch (error) {
          console.error("Failed to parse final buffer:", buffer, error instanceof Error ? error.message : 'Unknown error')
        }
      }

    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred"
      toast.error(error)
    }
  }

  const handleAdvancedParamsChange = (params: AdvancedParameters) => {
    setAdvancedParams(params)
    if (typeof params.temperature === 'number') setTemperature(params.temperature)
    if (typeof params.top_p === 'number') setTopP(params.top_p)
  }

  const handlePopOut = () => {
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    // Save current chat state before opening popup
    const state = {
      messages: chatStore.messages,
      model: chatStore.model
    }
    localStorage.setItem('chatState', JSON.stringify(state))
    
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
        const savedState = localStorage.getItem('chatState')
        if (savedState) {
          const state = JSON.parse(savedState) as {
            messages: Array<{ role: string; content: string; image?: string }>;
            model: string;
          }
          if (state.model) {
            setModel(state.model)
          }
          if (Array.isArray(state.messages)) {
            clearMessages()
            state.messages.forEach(msg => addMessage(msg))
          }
          localStorage.removeItem('chatState')
        }
      } catch (error) {
        console.error('Failed to load chat state:', error)
      }
    }
  }, [isPopped, chatStore])

  // Save state when popup closes
  useEffect(() => {
    if (isPopped) {
      const handleBeforeUnload = () => {
        localStorage.setItem('chatState', JSON.stringify({
          messages: chatStore.messages,
          model: chatStore.model
        }))
      }
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isPopped, chatStore])

  // Check for state changes in main window
  useEffect(() => {
    const { addMessage, clearMessages, setModel } = chatStore
    let intervalId: NodeJS.Timeout | null = null
    
    if (!isPopped) {
      const checkPopupState = () => {
        try {
          const savedState = localStorage.getItem('chatState')
          if (savedState) {
            const state = JSON.parse(savedState) as {
              messages: Array<{ role: string; content: string; image?: string }>;
              model: string;
            }
            if (state.model) {
              setModel(state.model)
            }
            if (Array.isArray(state.messages)) {
              clearMessages()
              state.messages.forEach(msg => addMessage(msg))
            }
            localStorage.removeItem('chatState')
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
  }, [isPopped, chatStore])

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
                {chatStore.messages.map((message: { role: string; content: string; image?: string }, index: number) => (
                  <AnimatedMessage key={index} isUser={message.role === "user"}>
                    {message.image && (
                      <Image 
                        src={message.image} 
                        alt="Generated image"
                        width={512}
                        height={512}
                        className="rounded-lg"
                      />
                    )}
                    <div className={`whitespace-pre-wrap font-mono ${message.role === "user" ? "bg-gray-200 text-black" : "bg-black text-white"} p-2 rounded border-0 ring-0 ring-offset-0`}>{message.content}</div>
                  </AnimatedMessage>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 pt-2">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder={`Message ${chatStore.model}...\n(Enter to send, Shift+Enter for new line)`}
              className="w-full font-mono min-h-[80px]"
            />
            <div className="flex justify-between items-center">
              <Button type="submit" disabled={!input.trim()}>Send</Button>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Chat with {chatStore.model} model. {chatStore.model === 'llava' && 'You can also share images for discussion.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="w-2/3">
              <div className="space-y-2">
                <Select 
                  value={chatStore.model} 
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

                <div className="border p-4 h-[400px] relative" ref={messagesEndRef}>
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

                  <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth">
                    {chatStore.messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p>Start a conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chatStore.messages.map((message: { role: string; content: string; image?: string }, index: number) => (
                          <AnimatedMessage key={index} isUser={message.role === "user"}>
                            {message.image && (
                              <Image 
                                src={message.image} 
                                alt="Generated image"
                                width={512}
                                height={512}
                                className="rounded-lg"
                              />
                            )}
                            <div className={`whitespace-pre-wrap font-mono ${message.role === "user" ? "bg-gray-200 text-black" : "bg-black text-white"} p-2 rounded border-0 ring-0 ring-offset-0`}>{message.content}</div>
                          </AnimatedMessage>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim()) {
                          handleSubmit(e);
                        }
                      }
                    }}
                    placeholder={`Message ${chatStore.model}...\n(Enter to send, Shift+Enter for new line)`}
                    className="w-full font-mono min-h-[80px]"
                  />
                  <div className="flex justify-between items-center">
                    <Button type="submit" disabled={!input.trim()}>Send</Button>
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
            
            <div className="w-1/3 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdvancedParametersControl 
                    temperature={temperature}
                    topP={topP}
                    onParamsChange={handleAdvancedParamsChange}
                  />
                </CardContent>
              </Card>
              
              {chatStore.model === "llava" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Image Input</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MultimodalInput 
                      onImageSelect={(img) => {
                        if (img) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const base64 = e.target?.result as string;
                            if (base64) {
                              setImages([...images, base64]);
                            }
                          };
                          reader.readAsDataURL(img);
                        }
                      }}
                      imagePreview={null}
                    />
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="json-mode"
                      checked={format === 'json'}
                      onCheckedChange={(checked) => setFormat(checked ? 'json' : null)}
                    />
                    <Label htmlFor="json-mode">JSON Output</Label>
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