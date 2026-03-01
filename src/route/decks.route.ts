import { Router } from 'express'
import { authController } from '../controller/decks.controller'
import { authMiddleware } from '../middleware/decks.middleware'

const router = Router()

/* -------------------- AUTH -------------------- */
router.post('/auth/sign-up', authController.signUp)
router.post('/auth/sign-in', authController.signIn)
router.get('/profile', authMiddleware, authController.getProfile)

/* -------------------- CARDS -------------------- */
router.get('/cards', authController.getAllCards)

/* -------------------- DECKS -------------------- */
// Toutes ces routes utilisent authMiddleware
router.post('/decks', authMiddleware, authController.create)        // POST /api/decks
router.get('/decks/mine', authMiddleware, authController.getMine)   // GET /api/decks/mine
router.get('/decks/:id', authMiddleware, authController.getOne)     // GET /api/decks/:id
router.patch('/decks/:id', authMiddleware, authController.update)   // PATCH /api/decks/:id
router.delete('/decks/:id', authMiddleware, authController.delete)  // DELETE /api/decks/:id

export default router