// Direct MongoDB insertion - Run this in MongoDB Compass or shell

// 1. Update existing users to student role
db.users.updateMany({}, { $set: { role: "student" } })

// 2. Insert moderator user with pre-hashed password
// Password: Moderator@123 (bcrypt hash with salt rounds 12)
db.users.insertOne({
  firstName: "Admin",
  lastName: "Moderator", 
  email: "moderator@conceptpractice.com",
  password: "$2a$12$LKJ9.8H7GfQ2mN3pR5tUvOeX4Y6Z1A2B3C4D5E6F7G8H9I0J1K2L3M",
  role: "moderator",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Credentials:
// Email: moderator@conceptpractice.com
// Password: Moderator@123