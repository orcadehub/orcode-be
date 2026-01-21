const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['submission', 'moderator_action'], default: 'submission' },
  
  // For student submissions
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  questionTitle: { type: String },
  topicTitle: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  status: { type: String, enum: ['Solved', 'Attempted'] },
  language: { type: String },
  
  // For moderator actions
  action: { type: String }, // 'Created Topic', 'Created Question', 'Updated Topic Order', etc.
  description: { type: String } // Details about the action
}, { timestamps: true })

module.exports = mongoose.model('Activity', activitySchema)