import { createServer } from 'http'
import { env } from './env'
import express from 'express'
import cors from 'cors'
import authRoutes from './route/decks.route'

// Create Express app
export const app = express()

// Middlewares
app.use(
  cors({
    origin: true, // Autorise toutes les origines
    credentials: true,
  }),
)

app.use(express.json())

// Monte le routeur avec un seul préfixe
app.use('/api', authRoutes)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TCG Backend Server is running' })
})

// Serve static files (facultatif)
app.use(express.static('public'))

// Démarrage du serveur
const httpServer = createServer(app)

httpServer.listen(env.PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${env.PORT}`)
  console.log(
    `🧪 Socket.io Test Client available at http://localhost:${env.PORT}`,
  )
})