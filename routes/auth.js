const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { generateOTP, sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService')

const router = express.Router()

// Temporary storage for unverified users (in production, use Redis)
const tempUsers = new Map()

// Cleanup expired temp users every 15 minutes
setInterval(() => {
  const now = Date.now()
  for (const [email, userData] of tempUsers.entries()) {
    if (userData.otpExpires < now) {
      tempUsers.delete(email)
    }
  }
}, 15 * 60 * 1000)

// Signup - Store temporarily until verified
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    
    // Check if user already exists in database
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    // Check if user is already in temp storage
    if (tempUsers.has(email)) {
      return res.status(400).json({ message: 'Verification email already sent. Please check your email or wait before requesting again.' })
    }
    
    const otp = generateOTP()
    const otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    // Store user data temporarily
    tempUsers.set(email, {
      firstName,
      lastName,
      email,
      password,
      otp,
      otpExpires
    })
    
    await sendVerificationEmail(email, otp)
    
    res.status(201).json({ message: 'Verification email sent. Please verify your email with the OTP to complete registration.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Verify OTP - Create user in database only after verification
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    
    // Check temp storage first
    const tempUser = tempUsers.get(email)
    if (tempUser && tempUser.otp === otp && tempUser.otpExpires > Date.now()) {
      // Create user in database
      const user = new User({
        firstName: tempUser.firstName,
        lastName: tempUser.lastName,
        email: tempUser.email,
        password: tempUser.password,
        isVerified: true
      })
      
      await user.save()
      
      // Remove from temp storage
      tempUsers.delete(email)
      
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
      
      return res.json({ 
        message: 'Email verified successfully. Account created!',
        token,
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
      })
    }
    
    // Check database for existing users (for password reset flow)
    const user = await User.findOne({ 
      email, 
      otp, 
      otpExpires: { $gt: Date.now() } 
    })
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }
    
    user.isVerified = true
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
    
    res.json({ 
      message: 'Email verified successfully',
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Resend OTP for signup verification
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body
    
    // Check if user is in temp storage
    const tempUser = tempUsers.get(email)
    if (!tempUser) {
      return res.status(404).json({ message: 'No pending verification found for this email' })
    }
    
    // Generate new OTP
    const otp = generateOTP()
    const otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    
    // Update temp storage
    tempUsers.set(email, {
      ...tempUser,
      otp,
      otpExpires
    })
    
    await sendVerificationEmail(email, otp)
    
    res.json({ message: 'New verification OTP sent to your email' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' })
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET)
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const otp = generateOTP()
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    user.resetPasswordOtp = otp
    user.resetPasswordExpires = resetPasswordExpires
    await user.save()
    
    await sendResetPasswordEmail(email, otp)
    
    res.json({ message: 'Reset password OTP sent to your email' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    })
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }
    
    user.password = newPassword
    user.resetPasswordOtp = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    
    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Resend OTP for password reset
router.post('/resend-reset-otp', async (req, res) => {
  try {
    const { email } = req.body
    
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const otp = generateOTP()
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    user.resetPasswordOtp = otp
    user.resetPasswordExpires = resetPasswordExpires
    await user.save()
    
    await sendResetPasswordEmail(email, otp)
    
    res.json({ message: 'New reset password OTP sent to your email' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router