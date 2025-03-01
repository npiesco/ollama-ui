// /ollama-ui/src/app/api/ps/route.ts
import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    const response = await fetch(`${config.OLLAMA_API_HOST}/api/ps`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch running models')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('PS API error:', err)
    return NextResponse.json(
      { error: 'Failed to connect to Ollama server' },
      { status: 503 }
    )
  }
} 