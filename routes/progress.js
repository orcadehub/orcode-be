const express = require('express')
const UserProgress = require('../models/UserProgress')
const Question = require('../models/Question')
const Topic = require('../models/Topic')
const Activity = require('../models/Activity')
const auth = require('../middleware/auth')
const router = express.Router()

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user.id })
      .populate('completedQuestions', 'title difficulty points')
      .populate('submissions.questionId', 'title difficulty points')
    
    if (!progress) {
      progress = new UserProgress({ userId: req.user.id })
      await progress.save()
    }
    
    res.json(progress)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Save/update current code
router.post('/save-code', auth, async (req, res) => {
  try {
    const { questionId, code, language } = req.body
    
    let progress = await UserProgress.findOne({ userId: req.user.id })
    if (!progress) {
      progress = new UserProgress({ userId: req.user.id })
    }
    
    // Update or add current code for specific language
    const existingCodeIndex = progress.currentCodes.findIndex(
      c => c.questionId.toString() === questionId && c.language === language
    )
    
    if (existingCodeIndex >= 0) {
      progress.currentCodes[existingCodeIndex] = {
        questionId,
        code,
        language,
        lastUpdated: new Date()
      }
    } else {
      progress.currentCodes.push({
        questionId,
        code,
        language,
        lastUpdated: new Date()
      })
    }
    
    progress.totalRuns += 1
    progress.lastActive = new Date()
    
    await progress.save()
    res.json({ message: 'Code saved' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get saved code for a question and language
router.get('/code/:questionId/:language', auth, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user.id })
    if (!progress) {
      return res.json({ code: '', language: req.params.language })
    }
    
    const savedCode = progress.currentCodes.find(
      c => c.questionId.toString() === req.params.questionId && c.language === req.params.language
    )
    
    if (savedCode) {
      res.json({ code: savedCode.code, language: savedCode.language })
    } else {
      res.json({ code: '', language: req.params.language })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get saved code for a question (legacy route)
router.get('/code/:questionId', auth, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user.id })
    if (!progress) {
      return res.json({ code: '', language: 'python' })
    }
    
    const savedCode = progress.currentCodes.find(
      c => c.questionId.toString() === req.params.questionId
    )
    
    if (savedCode) {
      res.json({ code: savedCode.code, language: savedCode.language })
    } else {
      res.json({ code: '', language: 'python' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Submit solution
router.post('/submit', auth, async (req, res) => {
  try {
    const { questionId, code, language, status, runtime, memory, testCasesPassed, totalTestCases } = req.body
    
    let progress = await UserProgress.findOne({ userId: req.user.id })
    if (!progress) {
      progress = new UserProgress({ userId: req.user.id })
    }
    
    // Get question and topic details for activity
    const question = await Question.findById(questionId).populate('topicId')
    if (!question) {
      return res.status(404).json({ message: 'Question not found' })
    }
    
    // Record activity
    const activityStatus = status === 'accepted' ? 'Solved' : 'Attempted'
    await Activity.create({
      userId: req.user.id,
      questionId,
      topicId: question.topicId._id,
      questionTitle: question.title,
      topicTitle: question.topicId.title,
      difficulty: question.difficulty,
      status: activityStatus,
      language
    })
    
    // Add submission
    const submission = {
      questionId,
      code,
      language,
      status,
      runtime,
      memory,
      testCasesPassed,
      totalTestCases
    }
    
    progress.submissions.push(submission)
    progress.totalSubmissions += 1
    progress.lastActive = new Date()
    
    // If first attempt on this question
    const hasAttempted = progress.submissions.some(s => 
      s.questionId.toString() === questionId && s !== submission
    )
    if (!hasAttempted) {
      progress.questionsAttempted += 1
    }
    
    // If successful submission
    if (status === 'accepted') {
      progress.successfulSubmissions += 1
      
      // If first successful completion
      if (!progress.completedQuestions.includes(questionId)) {
        progress.completedQuestions.push(questionId)
        progress.questionsCompleted += 1
        
        // Add coins
        if (question && question.points) {
          progress.totalCoins += question.points
        }
      }
    }
    
    // Calculate accuracy
    progress.accuracy = progress.totalSubmissions > 0 
      ? Math.round((progress.successfulSubmissions / progress.totalSubmissions) * 100)
      : 0
    
    await progress.save()
    res.json({ message: 'Submission recorded', progress })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user streak based on daily activity
router.get('/streak', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
    
    if (activities.length === 0) {
      return res.json({ currentStreak: 0, longestStreak: 0 })
    }
    
    // Group activities by date
    const activityDates = [...new Set(activities.map(activity => 
      new Date(activity.createdAt).toDateString()
    ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    
    // Calculate current streak
    let currentStreak = 0
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    // Check if user was active today or yesterday
    if (activityDates[0] === today || activityDates[0] === yesterday) {
      currentStreak = 1
      
      // Count consecutive days
      for (let i = 1; i < activityDates.length; i++) {
        const currentDate = new Date(activityDates[i-1])
        const nextDate = new Date(activityDates[i])
        const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1
    
    for (let i = 1; i < activityDates.length; i++) {
      const currentDate = new Date(activityDates[i-1])
      const nextDate = new Date(activityDates[i])
      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)
    
    res.json({ currentStreak, longestStreak })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user rank based on problems solved
router.get('/rank', auth, async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ userId: req.user.id })
    if (!userProgress) {
      return res.json({ rank: 0, questionsCompleted: 0 })
    }
    
    const rank = await UserProgress.countDocuments({
      questionsCompleted: { $gt: userProgress.questionsCompleted }
    }) + 1
    
    res.json({ rank, questionsCompleted: userProgress.questionsCompleted })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get recent activities
router.get('/activities', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)
    
    res.json(activities)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get submissions for a specific question
router.get('/submissions/:questionId', auth, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.user.id })
    if (!progress) {
      return res.json([])
    }
    
    const questionSubmissions = progress.submissions
      .filter(s => s.questionId.toString() === req.params.questionId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    
    res.json(questionSubmissions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await UserProgress.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName email role',
        match: { role: 'student' }
      })
    
    // Filter out entries where userId is null (non-students)
    const studentLeaderboard = leaderboard
      .filter(entry => entry.userId !== null)
      .sort((a, b) => {
        // First sort by problems solved (descending)
        if (b.questionsCompleted !== a.questionsCompleted) {
          return b.questionsCompleted - a.questionsCompleted
        }
        // If problems solved are same, sort by accuracy (descending)
        return b.accuracy - a.accuracy
      })
      .slice(0, 50)
    
    res.json(studentLeaderboard)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router