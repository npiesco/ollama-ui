import { useState, useCallback } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface UseChatReturn {
  messages: Message[]
  input: string
  isLoading: boolean
  error: string | null
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value)
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      const userMessage: Message = {
        role: "user",
        content: input.trim(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.content,
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages]
  )

  return {
    messages,
    input,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
  }
} 