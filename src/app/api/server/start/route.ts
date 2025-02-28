// /ollama-ui/src/app/api/server/start/route.ts
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Check if server is already running
    try {
      const response = await fetch('http://localhost:11434/api/tags')
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'Server is already running' })
      }
    } catch {
      // Server is not running, continue with start
    }

    // On macOS, use launchctl if available
    if (process.platform === 'darwin') {
      await execAsync('launchctl start com.ollama.ollama')
    } else {
      // Fallback to direct command
      await execAsync('ollama serve > /dev/null 2>&1 &')
    }
    
    // Wait for server to start
    let attempts = 0
    while (attempts < 10) {
      try {
        const response = await fetch('http://localhost:11434/api/tags')
        if (response.ok) {
          return NextResponse.json({ success: true })
        }
      } catch {
        // Keep trying
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      attempts++
    }
    
    throw new Error('Server failed to start after multiple attempts')
  } catch (error) {
    console.error('Failed to start Ollama server:', error)
    return NextResponse.json(
      { error: 'Failed to start Ollama server' },
      { status: 500 }
    )
  }
} 