import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../env'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: number
      email: string
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    }

    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
