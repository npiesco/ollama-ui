// /ollama-ui/src/app/api/server/stop/route.ts
import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Check if server is running first
    try {
      await fetch('http://localhost:11434/api/tags')
    } catch {
      // Server is already stopped
      return NextResponse.json({ success: true, message: 'Server is already stopped' })
    }

    // On macOS, use launchctl if available
    if (process.platform === 'darwin') {
      await execAsync('launchctl stop com.ollama.ollama')
    } else {
      // Fallback to pkill
      await execAsync('pkill -TERM ollama')
    }
    
    // Wait for server to stop
    let attempts = 0
    while (attempts < 10) {
      try {
        await fetch('http://localhost:11434/api/tags')
        // If we can still reach the server, wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 500))
        attempts++
      } catch {
        // Server is stopped
        return NextResponse.json({ success: true })
      }
    }
    
    throw new Error('Server failed to stop after multiple attempts')
  } catch (error) {
    console.error('Failed to stop Ollama server:', error)
    return NextResponse.json(
      { error: 'Failed to stop Ollama server' },
      { status: 500 }
    )
  }
}