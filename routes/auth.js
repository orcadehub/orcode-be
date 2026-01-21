const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { generateOTP, sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService')

const router = express.Router()

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    
    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      otp,
      otpExpires
    })
    
    await user.save()
    await sendVerificationEmail(email, otp)
    
    res.status(201).json({ message: 'User created. Please verify your email with the OTP sent.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    
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
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
    })
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

module.exports = router