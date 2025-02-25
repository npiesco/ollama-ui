"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ImageUpload } from "@/components/ImageUpload"
import { AnimatedMessage } from "@/components/AnimatedMessage"

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([])
  const [input, setInput] = useState("")
  const [model, setModel] = useState("llama2")
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(0.9)
  const [image, setImage] = useState<File | null>(null)

  const handleImageUpload = (file: File) => {
    setImage(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newMessage: { role: string; content: string; image?: string } = { role: "user", content: input }

    if (image) {
      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onloadend = async () => {
        newMessage.image = reader.result as string
        await sendMessage(newMessage)
      }
    } else {
      await sendMessage(newMessage)
    }
  }

  const sendMessage = async (newMessage: { role: string; content: string; image?: string }) => {
    const newMessages = [...messages, newMessage]
    setMessages(newMessages)
    setInput("")
    setImage(null)

    try {
      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: newMessages,
          stream: true,
          options: { temperature, top_p: topP },
        }),
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
        setMessages([...newMessages, { role: "assistant", content: assistantMessage }])
      }
    } catch (error) {
      toast({ title: "Error", description: "Chat request failed", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
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
              <img src={message.image || "/placeholder.svg"} alt="User uploaded" className="max-w-xs h-auto mb-2" />
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
  )
}

