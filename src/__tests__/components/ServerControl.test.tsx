// ollama-ui/src/__tests__/components/ServerControl.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ServerControl } from '@/components/ServerControl'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// Mock the dependencies
jest.mock('@/lib/api')
jest.mock('sonner')
jest.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play Icon</div>,
  Square: () => <div data-testid="square-icon">Square Icon</div>,
}))

describe('ServerControl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', async () => {
    // Mock initial server check to be pending
    const checkPromise = new Promise<boolean>(() => {})
    jest.mocked(api.checkServer).mockImplementationOnce(() => checkPromise)

    render(<ServerControl />)
    expect(screen.getByText('Checking server...')).toBeInTheDocument()
  })

  it('shows start button when server is not running', async () => {
    // Mock server check to return false (not running)
    jest.mocked(api.checkServer).mockResolvedValueOnce(false)

    await act(async () => {
      render(<ServerControl />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Start Server')).toBeInTheDocument()
      expect(screen.getByTestId('play-icon')).toBeInTheDocument()
    })
  })

  it('shows server running status when server is running', async () => {
    // Mock server check to return true (running)
    jest.mocked(api.checkServer).mockResolvedValueOnce(true)

    await act(async () => {
      render(<ServerControl />)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Server Running')).toBeInTheDocument()
    })
  })

  it('handles server start successfully', async () => {
    // Mock server check to return false initially
    jest.mocked(api.checkServer).mockResolvedValueOnce(false)

    await act(async () => {
      render(<ServerControl />)
    })
    
    // Wait for start button to appear
    const startButton = await screen.findByText('Start Server')
    
    // Mock the fetch call for starting the server
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })

    // Click start button
    await act(async () => {
      fireEvent.click(startButton)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.any(String))
    })
  })

  it('handles server start error', async () => {
    // Mock server check to return false initially
    jest.mocked(api.checkServer).mockResolvedValueOnce(false)

    await act(async () => {
      render(<ServerControl />)
    })
    
    // Wait for start button to appear
    const startButton = await screen.findByText('Start Server')
    
    // Mock the fetch call to fail
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to start server'))

    // Click start button
    await act(async () => {
      fireEvent.click(startButton)
    })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.any(String))
    })
  })
}) 