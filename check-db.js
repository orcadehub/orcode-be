const mongoose = require('mongoose')
const Question = require('./models/Question')
const Topic = require('./models/Topic')

async function checkDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/competitive-programming')
    
    const topics = await Topic.find()
    console.log('Topics in DB:', topics.length)
    topics.forEach(t => console.log(`- ${t.title} (${t._id})`))
    
    const questions = await Question.find()
    console.log('\nQuestions in DB:', questions.length)
    questions.forEach(q => console.log(`- ${q.title} (Topic: ${q.topicId})`))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkDB()