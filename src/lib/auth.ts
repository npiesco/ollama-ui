// src/lib/auth.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret"

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

interface TokenPayload {
  [key: string]: unknown
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

