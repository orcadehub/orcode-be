require('dotenv').config()
const mongoose = require('mongoose')
const Topic = require('./models/Topic')
const Question = require('./models/Question')
const User = require('./models/User')

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find or create a moderator user
    let moderator = await User.findOne({ role: 'moderator' })
    if (!moderator) {
      moderator = await User.findOne({ role: 'admin' })
    }
    if (!moderator) {
      console.log('No moderator found, creating sample user...')
      moderator = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        role: 'moderator',
        isVerified: true
      })
      await moderator.save()
    }

    // Clear existing data
    await Topic.deleteMany({})
    await Question.deleteMany({})

    // Create topics
    const topics = [
      {
        title: 'Arrays & Strings',
        description: 'Master array manipulation and string processing fundamentals',
        difficulty: 'Easy',
        order: 1,
        createdBy: moderator._id
      },
      {
        title: 'Linked Lists',
        description: 'Learn pointer manipulation and linked list operations',
        difficulty: 'Medium',
        order: 2,
        createdBy: moderator._id
      },
      {
        title: 'Trees & Graphs',
        description: 'Explore tree traversals and graph algorithms',
        difficulty: 'Hard',
        order: 3,
        createdBy: moderator._id
      }
    ]

    const createdTopics = await Topic.insertMany(topics)
    console.log('Topics created:', createdTopics.length)

    // Create questions for Arrays & Strings topic
    const arraysTopic = createdTopics[0]
    const questions = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        constraints: [
          '2 <= nums.length <= 10^4',
          '-10^9 <= nums[i] <= 10^9',
          'Only one valid answer exists.'
        ],
        example: {
          input: '[2,7,11,15], target = 9',
          output: '[0,1]'
        },
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
        testCases: {
          public: [
            {
              input: '4\\n2 7 11 15\\n9',
              output: '0 1',
              explanation: 'nums[0] + nums[1] = 2 + 7 = 9'
            }
          ],
          private: [
            { input: '2\\n3 3\\n6', output: '0 1' },
            { input: '3\\n3 2 4\\n6', output: '1 2' }
          ]
        },
        difficulty: 'Easy',
        topicId: arraysTopic._id,
        order: 1,
        points: 10,
        tags: ['Array', 'Hash Table'],
        createdBy: moderator._id
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        constraints: [
          '1 <= s.length <= 10^4',
          's consists of parentheses only \'()[]{}\''
        ],
        example: {
          input: '()[]{}',
          output: 'true'
        },
        explanation: 'All brackets are properly matched.',
        testCases: {
          public: [
            {
              input: '()[]{}',
              output: 'true',
              explanation: 'All brackets match'
            }
          ],
          private: [
            { input: '()', output: 'true' },
            { input: '([)]', output: 'false' }
          ]
        },
        difficulty: 'Easy',
        topicId: arraysTopic._id,
        order: 2,
        points: 15,
        tags: ['String', 'Stack'],
        createdBy: moderator._id
      }
    ]

    await Question.insertMany(questions)
    console.log('Questions created:', questions.length)

    console.log('✅ Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedData()