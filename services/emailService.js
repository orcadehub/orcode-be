const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ConceptPractice - Email Verification',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  }
  
  await transporter.sendMail(mailOptions)
}

const sendResetPasswordEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ConceptPractice - Reset Password',
    html: `
      <h2>Reset Password</h2>
      <p>Your reset password code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  }
  
  await transporter.sendMail(mailOptions)
}

module.exports = {
  generateOTP,
  sendVerificationEmail,
  sendResetPasswordEmail
}