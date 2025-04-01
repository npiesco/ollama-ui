import { NextResponse } from "next/server"
import { config } from '@/lib/config';

interface GenerateRequest {
  model: string
  prompt: string
  stream?: boolean
}

interface GenerateResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function POST(request: Request): Promise<NextResponse<GenerateResponse | { error: string }> | Response> {
  try {
    const body: GenerateRequest = await request.json()
    const { model, prompt, stream = false } = body

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, prompt, stream }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate response")
    }

    if (stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating response:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
} 