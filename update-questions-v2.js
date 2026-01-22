const mongoose = require('mongoose')
const Question = require('./models/Question')
const Topic = require('./models/Topic')

const questions = [
  {
    title: "Read Integer Input",
    description: "Read a single integer from input and print it.",
    constraints: ["1 ≤ n ≤ 10^9"],
    example: { input: "42", output: "42" },
    explanation: "Simply read the integer and print it as output.",
    testCases: {
      public: [
        { input: "42", output: "42", explanation: "Read and print the integer" },
        { input: "0", output: "0", explanation: "Handle zero" },
        { input: "-15", output: "-15", explanation: "Handle negative numbers" }
      ],
      private: [
        { input: "999999999", output: "999999999" },
        { input: "-999999999", output: "-999999999" }
      ]
    },
    difficulty: "Easy",
    points: 10,
    order: 1
  },
  {
    title: "Read Float Input",
    description: "Read a single floating-point number from input and print it with 2 decimal places.",
    constraints: ["1.0 ≤ f ≤ 10^6"],
    example: { input: "3.14159", output: "3.14" },
    explanation: "Read the float and format it to 2 decimal places.",
    testCases: {
      public: [
        { input: "3.14159", output: "3.14", explanation: "Round to 2 decimal places" },
        { input: "42.0", output: "42.00", explanation: "Show trailing zeros" },
        { input: "0.999", output: "1.00", explanation: "Handle rounding up" }
      ],
      private: [
        { input: "123.456", output: "123.46" },
        { input: "0.001", output: "0.00" }
      ]
    },
    difficulty: "Easy",
    points: 10,
    order: 2
  },
  {
    title: "String with One Word",
    description: "Read a single word (no spaces) from input and print it.",
    constraints: ["1 ≤ length ≤ 100", "No spaces in the word"],
    example: { input: "hello", output: "hello" },
    explanation: "Read and print the single word.",
    testCases: {
      public: [
        { input: "hello", output: "hello", explanation: "Simple word" },
        { input: "Python", output: "Python", explanation: "Capitalized word" },
        { input: "123abc", output: "123abc", explanation: "Alphanumeric" }
      ],
      private: [
        { input: "programming", output: "programming" },
        { input: "X", output: "X" }
      ]
    },
    difficulty: "Easy",
    points: 10,
    order: 3
  },
  {
    title: "Multi Word String",
    description: "Read a line containing multiple words separated by spaces and print it.",
    constraints: ["1 ≤ length ≤ 1000"],
    example: { input: "Hello World Python", output: "Hello World Python" },
    explanation: "Read the entire line including spaces and print it.",
    testCases: {
      public: [
        { input: "Hello World Python", output: "Hello World Python", explanation: "Multiple words with spaces" },
        { input: "One", output: "One", explanation: "Single word" },
        { input: "  spaces  around  ", output: "  spaces  around  ", explanation: "Preserve extra spaces" }
      ],
      private: [
        { input: "This is a longer sentence with many words", output: "This is a longer sentence with many words" },
        { input: "123 456 789", output: "123 456 789" }
      ]
    },
    difficulty: "Easy",
    points: 15,
    order: 4
  },
  {
    title: "Three Integers Sum",
    description: "Read three integers from a single line and print their sum.",
    constraints: ["1 ≤ a,b,c ≤ 1000"],
    example: { input: "10 20 30", output: "60" },
    explanation: "Read three space-separated integers and calculate their sum.",
    testCases: {
      public: [
        { input: "10 20 30", output: "60", explanation: "Sum of 10+20+30" },
        { input: "1 2 3", output: "6", explanation: "Small numbers" },
        { input: "0 0 5", output: "5", explanation: "With zeros" }
      ],
      private: [
        { input: "100 200 300", output: "600" },
        { input: "999 1 1000", output: "2000" }
      ]
    },
    difficulty: "Easy",
    points: 15,
    order: 5
  },
  {
    title: "Three Floats Squares Sum",
    description: "Read three floating-point numbers from a single line and print the sum of their squares with 2 decimal places.",
    constraints: ["1.0 ≤ a,b,c ≤ 100.0"],
    example: { input: "1.0 2.0 3.0", output: "14.00" },
    explanation: "Calculate a² + b² + c² and format to 2 decimal places.",
    testCases: {
      public: [
        { input: "1.0 2.0 3.0", output: "14.00", explanation: "1² + 2² + 3² = 14" },
        { input: "0.5 1.5 2.5", output: "8.75", explanation: "0.25 + 2.25 + 6.25" },
        { input: "3.0 4.0 0.0", output: "25.00", explanation: "9 + 16 + 0" }
      ],
      private: [
        { input: "2.5 3.5 4.5", output: "36.75" },
        { input: "1.1 1.1 1.1", output: "3.63" }
      ]
    },
    difficulty: "Medium",
    points: 20,
    order: 6
  },
  {
    title: "Array with Given Size",
    description: "Read array size n, then read n integers and print them space-separated.",
    constraints: ["1 ≤ n ≤ 100", "1 ≤ elements ≤ 1000"],
    example: { input: "3\n10 20 30", output: "10 20 30" },
    explanation: "First line contains size, second line contains elements.",
    testCases: {
      public: [
        { input: "3\n10 20 30", output: "10 20 30", explanation: "Array of size 3" },
        { input: "1\n42", output: "42", explanation: "Single element" },
        { input: "5\n1 2 3 4 5", output: "1 2 3 4 5", explanation: "Sequential numbers" }
      ],
      private: [
        { input: "4\n100 200 300 400", output: "100 200 300 400" },
        { input: "2\n999 1", output: "999 1" }
      ]
    },
    difficulty: "Medium",
    points: 20,
    order: 7
  },
  {
    title: "Array without Size",
    description: "Read integers from a single line until end of line and print them space-separated.",
    constraints: ["1 ≤ count ≤ 100", "1 ≤ elements ≤ 1000"],
    example: { input: "10 20 30 40", output: "10 20 30 40" },
    explanation: "Read all integers from the line and print them.",
    testCases: {
      public: [
        { input: "10 20 30 40", output: "10 20 30 40", explanation: "Four integers" },
        { input: "5", output: "5", explanation: "Single integer" },
        { input: "1 2 3 4 5 6 7", output: "1 2 3 4 5 6 7", explanation: "Seven integers" }
      ],
      private: [
        { input: "100 200 300", output: "100 200 300" },
        { input: "999 888 777 666 555", output: "999 888 777 666 555" }
      ]
    },
    difficulty: "Medium",
    points: 25,
    order: 8
  },
  {
    title: "Matrix Input",
    description: "Read matrix dimensions (rows cols) from first line, then read matrix elements row by row and print them in the same format.",
    constraints: ["1 ≤ rows, cols ≤ 10", "1 ≤ elements ≤ 100"],
    example: { input: "2 3\n1 2 3\n4 5 6", output: "1 2 3\n4 5 6" },
    explanation: "First line has dimensions, followed by matrix elements row-wise.",
    testCases: {
      public: [
        { input: "2 3\n1 2 3\n4 5 6", output: "1 2 3\n4 5 6", explanation: "2x3 matrix" },
        { input: "1 1\n42", output: "42", explanation: "1x1 matrix" },
        { input: "3 2\n1 2\n3 4\n5 6", output: "1 2\n3 4\n5 6", explanation: "3x2 matrix" }
      ],
      private: [
        { input: "2 2\n10 20\n30 40", output: "10 20\n30 40" },
        { input: "4 1\n1\n2\n3\n4", output: "1\n2\n3\n4" }
      ]
    },
    difficulty: "Hard",
    points: 30,
    order: 9
  }
]

async function updateQuestions() {
  try {
    await mongoose.connect('mongodb+srv://orcadehub2:orcadehub2@orcadehub.twfptkz.mongodb.net/orcode?retryWrites=true&w=majority&appName=OrcadeHub')
    
    // Check existing topics
    const topics = await Topic.find()
    console.log('Existing topics:', topics.map(t => t.title))
    
    // Find or create the Input/Output Practice topic
    let topic = await Topic.findOne({ title: 'Input/Output Practice' })
    if (!topic) {
      topic = new Topic({
        title: 'Input/Output Practice',
        description: 'Learn basic input/output operations in programming',
        difficulty: 'Easy',
        order: 1,
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000')
      })
      await topic.save()
      console.log('Created topic: Input/Output Practice')
    }
    
    // Delete existing questions for this topic
    const deletedCount = await Question.deleteMany({ topicId: topic._id })
    console.log(`Deleted ${deletedCount.deletedCount} existing questions`)
    
    // Add new questions
    for (const questionData of questions) {
      const question = new Question({
        ...questionData,
        topicId: topic._id,
        createdBy: new mongoose.Types.ObjectId('000000000000000000000000')
      })
      await question.save()
      console.log(`Added: ${question.title}`)
    }
    
    console.log('Successfully updated all questions')
    
  } catch (error) {
    console.error('Error updating questions:', error)
  } finally {
    await mongoose.disconnect()
  }
}

updateQuestions()