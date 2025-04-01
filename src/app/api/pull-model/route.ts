import { NextResponse } from "next/server"
import { config } from '@/lib/config';

interface PullModelRequest {
  name: string
}

interface PullModelResponse {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export async function POST(request: Request): Promise<NextResponse<PullModelResponse | { error: string }>> {
  try {
    const body: PullModelRequest = await request.json()
    const { name } = body

    const response = await fetch(`${config.OLLAMA_API_HOST}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error("Failed to pull model")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error pulling model:", error)
    return NextResponse.json(
      { error: "Failed to pull model" },
      { status: 500 }
    )
  }
} 