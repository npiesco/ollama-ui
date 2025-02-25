import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Chat from "../app/chat/page"

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    body: {
      getReader: () => ({
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(JSON.stringify({ message: { content: "Test response" } })),
          })
          .mockResolvedValueOnce({ done: true }),
      }),
    },
  } as any),
)

describe("Chat Component", () => {
  it("renders the chat interface", () => {
    render(<Chat />)
    expect(screen.getByPlaceholderText("Type your message...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
  })

  it("sends a message and displays the response", async () => {
    render(<Chat />)
    const input = screen.getByPlaceholderText("Type your message...")
    const sendButton = screen.getByRole("button", { name: "Send" })

    fireEvent.change(input, { target: { value: "Hello" } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument()
      expect(screen.getByText("Test response")).toBeInTheDocument()
    })
  })

  it("allows model selection", () => {
    render(<Chat />)
    const modelSelect = screen.getByRole("combobox")
    fireEvent.click(modelSelect)
    fireEvent.click(screen.getByText("Mistral"))
    expect(modelSelect).toHaveTextContent("Mistral")
  })
})

