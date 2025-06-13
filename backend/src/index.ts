import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/user'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(express.json())
app.use(errorHandler)

// Routes
app.use('/user', userRoutes)

app.get('/', (_req, res) => {
  res.send('Welcome to the Betmate backend 🎲💰')
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
