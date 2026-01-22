require('dotenv').config()
const mongoose = require('mongoose')
const Topic = require('./models/Topic')
const Question = require('./models/Question')
const User = require('./models/User')

const seedIPData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Find moderator user
    let moderator = await User.findOne({ role: 'moderator' })
    if (!moderator) {
      moderator = await User.findOne({ role: 'admin' })
    }
    if (!moderator) {
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

    // Create IP topic
    const ipTopic = new Topic({
      title: 'Input/Output Practice',
      description: 'Master basic input and output operations with different data types',
      difficulty: 'Easy',
      order: 1,
      createdBy: moderator._id
    })
    await ipTopic.save()

    // Create questions with integer inputs
    const questions = [
      {
        title: 'Add Two Numbers',
        description: 'Read two integers from input and print their sum.',
        constraints: [
          '1 <= a, b <= 1000'
        ],
        example: {
          input: '5 3',
          output: '8'
        },
        explanation: 'Read two integers and add them together.',
        testCases: {
          public: [
            {
              input: '5 3',
              output: '8',
              explanation: '5 + 3 = 8',
              inputType: 'integer',
              outputType: 'integer'
            },
            {
              input: '10 20',
              output: '30',
              explanation: '10 + 20 = 30',
              inputType: 'integer',
              outputType: 'integer'
            }
          ],
          private: [
            { input: '1 1', output: '2', inputType: 'integer', outputType: 'integer' },
            { input: '100 200', output: '300', inputType: 'integer', outputType: 'integer' },
            { input: '50 75', output: '125', inputType: 'integer', outputType: 'integer' }
          ]
        },
        difficulty: 'Easy',
        topicId: ipTopic._id,
        order: 1,
        points: 10,
        tags: ['Input/Output', 'Math'],
        createdBy: moderator._id
      },
      {
        title: 'Square of Number',
        description: 'Read an integer and print its square.',
        constraints: [
          '1 <= n <= 100'
        ],
        example: {
          input: '4',
          output: '16'
        },
        explanation: 'Read an integer n and print n * n.',
        testCases: {
          public: [
            {
              input: '4',
              output: '16',
              explanation: '4 * 4 = 16',
              inputType: 'integer',
              outputType: 'integer'
            },
            {
              input: '7',
              output: '49',
              explanation: '7 * 7 = 49',
              inputType: 'integer',
              outputType: 'integer'
            }
          ],
          private: [
            { input: '1', output: '1', inputType: 'integer', outputType: 'integer' },
            { input: '5', output: '25', inputType: 'integer', outputType: 'integer' },
            { input: '10', output: '100', inputType: 'integer', outputType: 'integer' }
          ]
        },
        difficulty: 'Easy',
        topicId: ipTopic._id,
        order: 2,
        points: 10,
        tags: ['Input/Output', 'Math'],
        createdBy: moderator._id
      },
      {
        title: 'Even or Odd',
        description: 'Read an integer and print "Even" if it is even, "Odd" if it is odd.',
        constraints: [
          '1 <= n <= 1000'
        ],
        example: {
          input: '6',
          output: 'Even'
        },
        explanation: 'Check if the number is divisible by 2.',
        testCases: {
          public: [
            {
              input: '6',
              output: 'Even',
              explanation: '6 is divisible by 2',
              inputType: 'integer',
              outputType: 'string'
            },
            {
              input: '7',
              output: 'Odd',
              explanation: '7 is not divisible by 2',
              inputType: 'integer',
              outputType: 'string'
            }
          ],
          private: [
            { input: '2', output: 'Even', inputType: 'integer', outputType: 'string' },
            { input: '3', output: 'Odd', inputType: 'integer', outputType: 'string' },
            { input: '100', output: 'Even', inputType: 'integer', outputType: 'string' }
          ]
        },
        difficulty: 'Easy',
        topicId: ipTopic._id,
        order: 3,
        points: 15,
        tags: ['Input/Output', 'Conditionals'],
        createdBy: moderator._id
      }
    ]

    await Question.insertMany(questions)
    console.log(`✅ Created ${questions.length} IP questions successfully!`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedIPData()