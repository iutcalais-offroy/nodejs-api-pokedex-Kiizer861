import { Request, Response } from 'express'
import { authService, cardService, deckService } from '../service/decks.service'

export const authController = {
  /* -------------------- AUTH -------------------- */
  async signUp(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body
      if (!email || !username || !password) {
        return res.status(400).json({ message: 'Missing fields' })
      }

      const result = await authService.signUp(email, username, password)
      return res.status(201).json(result)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      if (!email || !password)
        return res.status(400).json({ message: 'Missing fields' })

      const result = await authService.signIn(email, password)
      return res.status(200).json(result)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      const user = await authService.getProfile(userId)
      return res.status(200).json({ user })
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  /* -------------------- CARDS -------------------- */
  async getAllCards(_req: Request, res: Response) {
    try {
      const cards = await cardService.getAllCards()
      return res.status(200).json(cards)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  /* -------------------- DECKS -------------------- */
  async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const { name, cardIds } = req.body
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })
      if (!name)
        return res.status(400).json({ message: 'Deck name is required' })
      if (!Array.isArray(cardIds) || cardIds.length !== 10)
        return res
          .status(400)
          .json({ message: 'Deck must contain exactly 10 cards' })

      const allCards = await cardService.getAllCards()
      const invalidIds = cardIds.filter(
        (id: number) => !allCards.find((c) => c.id === id),
      )
      if (invalidIds.length > 0)
        return res
          .status(400)
          .json({ message: 'Some card IDs are invalid', invalidIds })

      const deck = await deckService.create({ name, cardIds }, userId)
      return res.status(201).json(deck)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  async getMine(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      const decks = await deckService.getMine(userId)
      return res.status(200).json(decks)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const deckId = Number(req.params.id)
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      const deck = await deckService.getOne(deckId, userId)
      if (!deck)
        return res.status(404).json({ message: 'Deck not found or not yours' })

      return res.status(200).json(deck)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const deckId = Number(req.params.id)
      const { name, cardIds } = req.body
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      if (!name && !cardIds)
        return res.status(400).json({ message: 'Nothing to update' })
      if (cardIds && (!Array.isArray(cardIds) || cardIds.length !== 10))
        return res
          .status(400)
          .json({ message: 'Deck must contain exactly 10 cards' })

      if (cardIds) {
        const allCards = await cardService.getAllCards()
        const invalidIds = cardIds.filter(
          (id: number) => !allCards.find((c) => c.id === id),
        )
        if (invalidIds.length > 0)
          return res
            .status(400)
            .json({ message: 'Some card IDs are invalid', invalidIds })
      }

      const deck = await deckService.update(deckId, { name, cardIds }, userId)
      if (!deck)
        return res.status(404).json({ message: 'Deck not found or not yours' })

      return res.status(200).json(deck)
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const deckId = Number(req.params.id)
      if (!userId) return res.status(401).json({ message: 'Unauthorized' })

      const deck = await deckService.delete(deckId, userId)
      if (!deck)
        return res.status(404).json({ message: 'Deck not found or not yours' })

      return res.status(200).json({ message: 'Deck deleted successfully' })
    } catch (error: unknown) {
      if (error instanceof Error)
        return res.status(500).json({ message: error.message })
      return res.status(500).json({ message: 'Server error' })
    }
  },
}
