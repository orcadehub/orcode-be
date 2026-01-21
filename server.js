require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')
const authRoutes = require('./routes/auth')
const setupRoutes = require('./routes/setup')

const app = express()
const PORT = process.env.PORT || 5001

// Connect to MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    /https:\/\/.*\.vercel\.app$/
  ],
  credentials: true
}))
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ConceptPractice API is running!' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/setup', setupRoutes)
app.use('/api/moderator', require('./routes/moderator'))
app.use('/api/user', require('./routes/progress'))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})