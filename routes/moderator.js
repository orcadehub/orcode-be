const express = require('express')
const Topic = require('../models/Topic')
const Question = require('../models/Question')
const Activity = require('../models/Activity')
const auth = require('../middleware/auth')
const router = express.Router()

// Middleware to check if user is moderator
const checkModerator = (req, res, next) => {
  if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Moderator role required.' })
  }
  next()
}

// Get all topics
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await Topic.find().populate('createdBy', 'firstName lastName').sort({ order: 1 })
    res.json(topics)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create topic (moderator only)
router.post('/topics', auth, checkModerator, async (req, res) => {
  try {
    const topic = new Topic({
      ...req.body,
      createdBy: req.user.id
    })
    await topic.save()
    
    // Log moderator activity
    await Activity.create({
      userId: req.user.id,
      type: 'moderator_action',
      action: 'Created Topic',
      description: `Created topic: ${topic.title} (${topic.difficulty})`
    })
    
    res.status(201).json(topic)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get questions by topic
router.get('/topics/:topicId/questions', auth, async (req, res) => {
  try {
    const questions = await Question.find({ topicId: req.params.topicId })
      .populate('createdBy', 'firstName lastName')
      .sort({ order: 1 })
    res.json(questions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create question (moderator only)
router.post('/questions', auth, checkModerator, async (req, res) => {
  try {
    const question = new Question({
      ...req.body,
      createdBy: req.user.id
    })
    await question.save()
    
    // Log moderator activity
    await Activity.create({
      userId: req.user.id,
      type: 'moderator_action',
      action: 'Created Question',
      description: `Created question: ${question.title} (${question.difficulty})`
    })
    
    res.status(201).json(question)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Seed Two Sum problem
router.post('/seed-twosum', auth, checkModerator, async (req, res) => {
  try {
    // Create Arrays topic if not exists
    let topic = await Topic.findOne({ title: 'Arrays' })
    if (!topic) {
      topic = new Topic({
        title: 'Arrays',
        description: 'Array manipulation and algorithms',
        difficulty: 'Easy',
        order: 1,
        createdBy: req.user.id
      })
      await topic.save()
    }

    // Create Two Sum question
    const twoSum = new Question({
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      example: {
        input: '2 7 11 15\\n9',
        output: '[0, 1]'
      },
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      testCases: {
        public: [
          {
            input: '2 7 11 15\\n9',
            output: '[0, 1]',
            explanation: 'nums[0] + nums[1] = 2 + 7 = 9, so return [0,1]'
          },
          {
            input: '3 2 4\\n6',
            output: '[1, 2]',
            explanation: 'nums[1] + nums[2] = 2 + 4 = 6, so return [1,2]'
          }
        ],
        private: [
          { input: '3 3\\n6', output: '[0, 1]' },
          { input: '1 2 3 4\\n7', output: '[2, 3]' },
          { input: '5 10 15 20\\n25', output: '[0, 3]' },
          { input: '0 4 3 0\\n0', output: '[0, 3]' },
          { input: '1 5 3 7\\n8', output: '[0, 3]' }
        ]
      },
      difficulty: 'Easy',
      topicId: topic._id,
      order: 1,
      tags: ['Array', 'Hash Table'],
      solution: {
        approach: 'Use hash map to store complement values',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)'
      },
      createdBy: req.user.id
    })

    await twoSum.save()
    res.json({ message: 'Two Sum problem seeded successfully', topic, question: twoSum })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router

// Update topic order
router.put('/topics/:id', auth, checkModerator, async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true })
    
    // Log moderator activity
    await Activity.create({
      userId: req.user.id,
      type: 'moderator_action',
      action: 'Updated Topic',
      description: `Updated topic: ${topic.title}`
    })
    
    res.json(topic)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update question order
router.put('/questions/:id', auth, checkModerator, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true })
    
    // Log moderator activity
    await Activity.create({
      userId: req.user.id,
      type: 'moderator_action',
      action: 'Updated Question',
      description: `Updated question: ${question.title}`
    })
    
    res.json(question)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})