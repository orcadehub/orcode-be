const mongoose = require('mongoose')
const User = require('../models/User')
require('dotenv').config()

const createModerator = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    
    // Update all existing users to student role
    await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'student' } }
    )
    
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
    
    console.log('Moderator created successfully!')
    console.log('Credentials:')
    console.log('Email: moderator@conceptpractice.com')
    console.log('Password: Moderator@123')
    console.log('Role: moderator')
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createModerator()