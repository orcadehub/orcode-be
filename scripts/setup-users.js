// Run this script in your MongoDB shell or through your application

// 1. Update all existing users to have role 'student'
db.users.updateMany(
  { role: { $exists: false } },
  { $set: { role: 'student' } }
)

// 2. Create moderator user (password will be hashed automatically by the pre-save hook)
// You can run this through your application or create manually

/*
Moderator Credentials:
Email: moderator@conceptpractice.com  
Password: Moderator@123
Role: moderator

To create this user, you can:
1. Use the signup endpoint with these credentials and manually update the role to 'moderator' in the database
2. Or create directly in MongoDB with hashed password
*/

console.log('Moderator Credentials:')
console.log('Email: moderator@conceptpractice.com')
console.log('Password: Moderator@123')
console.log('Role: moderator')