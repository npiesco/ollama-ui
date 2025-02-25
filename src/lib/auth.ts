// src/lib/auth.ts
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret"

export function verifyToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export function createToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

