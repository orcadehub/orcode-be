const bcrypt = require('bcryptjs')

const generateHash = async () => {
  const password = 'Moderator@123'
  const hash = await bcrypt.hash(password, 12)
  console.log('Password hash for Moderator@123:')
  console.log(hash)
  
  console.log('\nMongoDB Insert Command:')
  console.log(`db.users.insertOne({
  firstName: "Admin",
  lastName: "Moderator", 
  email: "moderator@conceptpractice.com",
  password: "${hash}",
  role: "moderator",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})`)
}

generateHash()