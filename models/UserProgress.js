const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, enum: ['accepted', 'failed'], required: true },
  runtime: { type: Number }, // milliseconds
  memory: { type: Number }, // MB
  testCasesPassed: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
})

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalCoins: { type: Number, default: 0 },
  questionsAttempted: { type: Number, default: 0 },
  questionsCompleted: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  successfulSubmissions: { type: Number, default: 0 },
  totalRuns: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // percentage
  completedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  submissions: [submissionSchema],
  currentCodes: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now }
  }],
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model('UserProgress', userProgressSchema)