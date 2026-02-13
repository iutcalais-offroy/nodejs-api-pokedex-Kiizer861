import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'
import { env } from '../env'

class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export const authService = {
  async signUp(email: string, username: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      throw new HttpError('Email already used', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    })

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
    }
  },

  async signIn(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new HttpError('Invalid credentials', 401)
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      throw new HttpError('Invalid credentials', 401)
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    }
  },
}

export const cardService = {
  async getAllCards() {
    return prisma.card.findMany({
      orderBy: {
        pokedexNumber: 'asc',
      },
    })
  },
}
