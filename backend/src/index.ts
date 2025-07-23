import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/user'
import betRoutes from './routes/bets'
import { errorHandler } from './middleware/errorHandler'
import { startBetUpdateCron } from './cron/bet-updater'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(express.json())
app.use(errorHandler)

// Routes
app.use('/user', userRoutes)
app.use('/bets', betRoutes)

app.get('/', (_req, res) => {
  res.send('Backend listening on port' + port)
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  startBetUpdateCron();
})
