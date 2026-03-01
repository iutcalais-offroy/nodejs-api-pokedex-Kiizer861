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

/* ---------------------- AUTH SERVICE ---------------------- */
export const authService = {
  async signUp(email: string, username: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) throw new HttpError('Email already used', 409)

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
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    }
  },

  async signIn(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new HttpError('Invalid credentials', 401)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new HttpError('Invalid credentials', 401)

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' },
    )

    return {
      token,
      user: { id: user.id, email: user.email, username: user.username },
    }
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true },
    })
    if (!user) throw new HttpError('User not found', 404)
    return user
  },
}

/* ---------------------- CARD SERVICE ---------------------- */
export const cardService = {
  async getAllCards() {
    return prisma.card.findMany({
      orderBy: { pokedexNumber: 'asc' },
    })
  },
}

/* ---------------------- DECK SERVICE ---------------------- */
export const deckService = {
  async create(
    data: { name: string; cardIds: number[] },
    userId: number
  ) {
    return prisma.deck.create({
      data: {
        name: data.name,
        userId,
        cards: {
          create: data.cardIds.map((cardId) => ({ cardId })),
        },
      },
      include: { cards: true },
    })
  },

  async getMine(userId: number) {
    return prisma.deck.findMany({
      where: { userId },
      include: { cards: { include: { card: true } } },
    })
  },

  async getOne(deckId: number, userId: number) {
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId },
      include: { cards: { include: { card: true } } },
    })
    if (!deck) throw new HttpError('Deck not found', 404)
    return deck
  },

  async update(
    deckId: number,
    data: { name?: string; cardIds?: number[] },
    userId: number
  ) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } })
    if (!deck) throw new HttpError('Deck not found', 404)

    return prisma.deck.update({
      where: { id: deckId },
      data: {
        name: data.name ?? deck.name,
        cards: data.cardIds
          ? {
              deleteMany: {}, // supprime les cartes existantes
              create: data.cardIds.map((cardId) => ({ cardId })),
            }
          : undefined,
      },
      include: { cards: { include: { card: true } } },
    })
  },

  async delete(deckId: number, userId: number) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } })
    if (!deck) throw new HttpError('Deck not found', 404)

    return prisma.deck.delete({ where: { id: deckId } })
  },
}