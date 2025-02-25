import { NextResponse } from "next/server"
import { generateToken } from "@/lib/auth"

export async function POST(request: Request) {
  const { username, password } = await request.json()

  // In a real application, you would validate the username and password against a database
  if (username === "admin" && password === "password") {
    const token = generateToken(username)
    const response = NextResponse.json({ success: true })
    response.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    return response
  }

  return NextResponse.json({ success: false }, { status: 401 })
}

