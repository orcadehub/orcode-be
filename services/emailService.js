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
    subject: 'ORCODE - Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6a0dad 0%, #2c3e50 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 900; letter-spacing: 2px;">
                <span style="color: #6a0dad; background: white; padding: 8px 16px; border-radius: 12px; margin-right: 8px;">ORC</span>
                <span style="color: white;">ODE</span>
              </h1>
              <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">Welcome to the Future of Coding Practice</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 28px; font-weight: 700; text-align: center;">Verify Your Email</h2>
              <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.6; text-align: center;">Thanks for joining ORCODE! Please use the verification code below to complete your registration:</p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: white; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
                  <span style="font-size: 36px; font-weight: 900; color: #6a0dad; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
              </div>
              
              <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; color: #856404; font-size: 14px; font-weight: 600;">⏰ This code expires in 10 minutes</p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #666; font-size: 14px; line-height: 1.6; text-align: center;">If you didn't create an account with ORCODE, please ignore this email.</p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6a0dad; font-size: 18px; font-weight: 700;">Happy Coding! 🚀</p>
              <p style="margin: 0; color: #999; font-size: 12px;">© 2024 ORCODE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  await transporter.sendMail(mailOptions)
}

const sendResetPasswordEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ORCODE - Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); min-height: 100vh;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 900; letter-spacing: 2px;">
                <span style="color: #e74c3c; background: white; padding: 8px 16px; border-radius: 12px; margin-right: 8px;">ORC</span>
                <span style="color: white;">ODE</span>
              </h1>
              <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">Secure Password Recovery</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background: #fee; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">🔒</div>
                <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 28px; font-weight: 700;">Reset Your Password</h2>
                <p style="margin: 0; color: #666; font-size: 16px; line-height: 1.6;">We received a request to reset your password. Use the code below to create a new password:</p>
              </div>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: white; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Password Reset Code</p>
                <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
                  <span style="font-size: 36px; font-weight: 900; color: #e74c3c; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
                </div>
              </div>
              
              <div style="background: #fff3cd; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; font-weight: 600;">⚠️ Security Notice</p>
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">This code expires in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
              
              <div style="background: #d1ecf1; border-radius: 12px; padding: 20px; margin: 30px 0; border-left: 4px solid #17a2b8;">
                <p style="margin: 0; color: #0c5460; font-size: 14px; line-height: 1.5;">📝 <strong>Next Steps:</strong> Enter this code along with your new password on the reset page to complete the process.</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #e74c3c; font-size: 18px; font-weight: 700;">Stay Secure! 🔐</p>
              <p style="margin: 0; color: #999; font-size: 12px;">© 2024 ORCODE. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  await transporter.sendMail(mailOptions)
}

module.exports = {
  generateOTP,
  sendVerificationEmail,
  sendResetPasswordEmail
}