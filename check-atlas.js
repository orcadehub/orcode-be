const mongoose = require('mongoose')
const Question = require('./models/Question')
const Topic = require('./models/Topic')

async function checkAtlasDB() {
  try {
    await mongoose.connect('mongodb+srv://orcadehub2:orcadehub2@orcadehub.twfptkz.mongodb.net/orcode?retryWrites=true&w=majority&appName=OrcadeHub')
    
    console.log('Connected to Atlas DB')
    
    const topics = await Topic.find()
    console.log('Topics in Atlas:', topics.length)
    topics.forEach(t => console.log(`- ${t.title} (${t._id})`))
    
    const questions = await Question.find()
    console.log('\nQuestions in Atlas:', questions.length)
    questions.forEach(q => console.log(`- ${q.title}`))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkAtlasDB()