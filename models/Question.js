const mongoose = require('mongoose')

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
  isPublic: { type: Boolean, default: true }
})

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  example: {
    input: { type: String, required: true },
    output: { type: String, required: true }
  },
  explanation: { type: String, required: true },
  testCases: {
    public: [testCaseSchema],
    private: [testCaseSchema]
  },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  points: { type: Number, required: true, min: 1 },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  order: { type: Number, required: true },
  timeLimit: { type: Number, default: 2000 }, // milliseconds
  memoryLimit: { type: Number, default: 256 }, // MB
  tags: [{ type: String }],
  hints: [{ type: String }],
  solution: {
    approach: { type: String },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    code: {
      cpp: { type: String },
      java: { type: String },
      python: { type: String },
      c: { type: String }
    }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

module.exports = mongoose.model('Question', questionSchema)