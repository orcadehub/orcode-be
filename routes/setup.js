const express = require('express')
const User = require('../models/User')
const router = express.Router()

// Temporary route to create moderator - remove after use
router.post('/create-moderator', async (req, res) => {
  try {
    // Update all existing users to student role
    await User.updateMany({}, { $set: { role: 'student' } })
    
    // Check if moderator already exists
    const existingModerator = await User.findOne({ email: 'moderator@conceptpractice.com' })
    if (existingModerator) {
      return res.json({ message: 'Moderator already exists', credentials: { email: 'moderator@conceptpractice.com', password: 'Moderator@123' } })
    }
    
    // Create moderator user
    const moderator = new User({
      firstName: 'Admin',
      lastName: 'Moderator',
      email: 'moderator@conceptpractice.com',
      password: 'Moderator@123',
      role: 'moderator',
      isVerified: true
    })
    
    await moderator.save()
    
    res.json({ 
      message: 'Moderator created successfully!',
      credentials: {
        email: 'moderator@conceptpractice.com',
        password: 'Moderator@123',
        role: 'moderator'
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router