// /ollama-ui/src/app/api/models/delete/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    const response = await fetch('http://localhost:11434/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete model'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 