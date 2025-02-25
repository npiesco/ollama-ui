"use client"

import type React from "react"

import { useState } from "react"
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
import { AdvancedParameters, Tool } from '@/types/ollama'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([])
  const [input, setInput] = useState("")
  const [model, setModel] = useState("llama2")
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [image, setImage] = useState<File | null>(null)
  const [advancedParams, setAdvancedParams] = useState<AdvancedParameters>({})
  const [images, setImages] = useState<string[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [format, setFormat] = useState<'json' | null>(null)

  const handleImageUpload = (file: File) => {
    setImage(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Chat request failed")

      const reader = response.body?.getReader()
      let assistantMessage = ""

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split("\n")
        lines.forEach((line) => {
          if (line.trim() !== "") {
            const parsed = JSON.parse(line)
            assistantMessage += parsed.message?.content || ""
          }
        })
        setMessages([...messages, { role: "assistant", content: assistantMessage }])
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "An error occurred"
      toast.error(error)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex space-x-4">
        <div className="w-2/3">
          <div className="space-y-2">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama2">Llama 2</SelectItem>
                <SelectItem value="mistral">Mistral</SelectItem>
                <SelectItem value="codellama">CodeLlama</SelectItem>
                <SelectItem value="llava">Llava</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Temperature"
              value={temperature}
              onChange={(e) => setTemperature(Number.parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.1}
            />
            <Input
              type="number"
              placeholder="Top P"
              value={topP}
              onChange={(e) => setTopP(Number.parseFloat(e.target.value))}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <div className="border p-4 h-[400px] overflow-y-auto">
            {messages.map((message, index) => (
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
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full"
            />
            {model === "llava" && <ImageUpload onImageUpload={handleImageUpload} />}
            <Button type="submit">Send</Button>
          </form>
        </div>
        
        <div className="w-1/3 space-y-4">
          <AdvancedParametersControl 
            temperature={temperature}
            topP={topP}
            onParamsChange={setAdvancedParams}
          />
          
          {model === "llava" && (
            <MultimodalInput 
              onImageSelect={(img) => setImages([...images, img])}
              existingImage={image}
            />
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="json-mode"
              checked={format === 'json'}
              onCheckedChange={(checked) => setFormat(checked ? 'json' : null)}
            />
            <Label htmlFor="json-mode">JSON Output</Label>
          </div>
        </div>
      </div>
    </div>
  )
}

