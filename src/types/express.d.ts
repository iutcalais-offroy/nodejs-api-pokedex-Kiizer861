import 'express'

declare module 'express' {
  interface Request {
    user?: {
      id: number        // 👈 unique
      email: string
      username?: string // optionnel si tu veux
    }
  }
}