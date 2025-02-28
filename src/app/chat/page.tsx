// /ollama-ui/src/app/chat/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ImageUpload"
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
import { AlertCircle, MessageSquare } from 'lucide-react'

export default function Chat() {
  const router = useRouter()
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([])
  const [input, setInput] = useState("")
  const [model, setModel] = useState("llama2")
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [image, setImage] = useState<File | null>(null)
  const [advancedParams, setAdvancedParams] = useState<AdvancedParameters>({})
  const [images, setImages] = useState<string[]>([])
  const [tools] = useState<Tool[]>([])
  const [format, setFormat] = useState<'json' | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelResponse[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) throw new Error('Failed to fetch models')
      const data = await response.json()
      setAvailableModels(data)
    } catch (error) {
      toast.error('Failed to fetch models')
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleModelNotFound = () => {
    toast.error(
      <div className="space-y-2">
        <p>Model {model} is not installed.</p>
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
    
    // Check if model is installed
    if (!availableModels.some(m => m.name === model)) {
      handleModelNotFound()
      return
    }
    
    const payload = {
      model,
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

      setMessages(prev => [...prev, { role: "user", content: input }])
      setInput("")

      const reader = response.body?.getReader()
      let assistantMessage = ""

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\\n")
        lines.forEach((line) => {
          if (line.trim() !== "") {
            const parsed = JSON.parse(line)
            assistantMessage += parsed.message?.content || ""
          }
        })
        setMessages(prev => {
          const newMessages = [...prev]
          // Update or add the assistant's message
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage?.role === "assistant") {
            lastMessage.content = assistantMessage
            return [...newMessages]
          }
          return [...newMessages, { role: "assistant", content: assistantMessage }]
        })
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred"
      toast.error(error)
    }
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
                  To get started, you'll need to install a model first.
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
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            Chat with {model} model. {model === 'llava' && 'You can also share images for discussion.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="w-2/3">
              <div className="space-y-2">
                <Select 
                  value={model} 
                  onValueChange={setModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="border p-4 h-[400px] overflow-y-auto rounded-lg">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="h-8 w-8 mb-2" />
                      <p>Start a conversation</p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
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
                        {message.content}
                      </AnimatedMessage>
                    ))
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${model}...`}
                    className="w-full"
                  />
                  <Button type="submit" disabled={!input.trim()}>Send</Button>
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
                    onParamsChange={setAdvancedParams}
                  />
                </CardContent>
              </Card>
              
              {model === "llava" && (
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
                      imagePreview={image ? URL.createObjectURL(image) : null}
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

