// /ollama-ui/src/app/api/models/pull/route.ts
import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    // Stream the response
    const stream = response.body
    if (!stream) {
      throw new Error('No response stream available')
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to pull model'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 