const express = require('express')
const axios = require('axios')
const rateLimit = require('express-rate-limit')
const auth = require('../middleware/auth')
const router = express.Router()

// Piston API configuration
const PISTON_API_URL = process.env.PISTON_API_URL || 'http://localhost:2000'
const PISTON_TIMEOUT = parseInt(process.env.PISTON_TIMEOUT) || 10000
const MAX_RETRIES = parseInt(process.env.PISTON_MAX_RETRIES) || 3

// Rate limiting for code execution
const executeRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many code execution requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

// Language mapping with security constraints
const languageMap = {
  'python': { language: 'python', version: '3.10.0', maxMemory: 128 },
  'javascript': { language: 'javascript', version: '18.15.0', maxMemory: 128 },
  'java': { language: 'java', version: '15.0.2', maxMemory: 256 },
  'cpp': { language: 'c++', version: '10.2.0', maxMemory: 128 },
  'c': { language: 'c', version: '10.2.0', maxMemory: 128 }
}

// Input validation and sanitization
const validateInput = (code, language, input) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid code provided')
  }
  if (code.length > 50000) { // 50KB limit
    throw new Error('Code too large (max 50KB)')
  }
  if (!languageMap[language]) {
    throw new Error('Unsupported language')
  }
  if (input && input.length > 10000) { // 10KB input limit
    throw new Error('Input too large (max 10KB)')
  }
  return true
}

// Retry mechanism with exponential backoff
const executeWithRetry = async (requestData, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(`${PISTON_API_URL}/api/v2/execute`, requestData, {
        timeout: PISTON_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Backend-API/1.0'
        }
      })
      return response.data
    } catch (error) {
      console.error(`Piston execution attempt ${attempt} failed:`, error.message)
      
      if (attempt === retries) {
        throw error
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Helper function to get proper file names
function getFileName(lang) {
  const extensions = {
    'python': 'main.py',
    'javascript': 'main.js', 
    'java': 'Main.java',
    'cpp': 'main.cpp',
    'c': 'main.c'
  }
  return extensions[lang] || 'main'
}

// Execute code endpoint
router.post('/execute', auth, executeRateLimit, async (req, res) => {
  const startTime = Date.now()
  
  try {
    const { code, language, input = '' } = req.body
    
    // Validate input
    validateInput(code, language, input)
    
    const pistonLang = languageMap[language]
    
    const pistonRequest = {
      language: pistonLang.language,
      version: pistonLang.version,
      files: [{
        name: getFileName(language),
        content: code
      }],
      stdin: input
    }
    
    const result = await executeWithRetry(pistonRequest)
    const executionTime = Date.now() - startTime
    
    // Process result
    const output = {
      success: true,
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || '',
      compile_output: result.compile?.stdout || '',
      compile_error: result.compile?.stderr || '',
      exit_code: result.run?.code || 0,
      signal: result.run?.signal || null,
      execution_time: executionTime,
      language: language,
      version: pistonLang.version
    }
    
    // Log execution for monitoring
    console.log(`Code execution: ${language} | Time: ${executionTime}ms | User: ${req.user.id}`)
    
    res.json(output)
    
  } catch (error) {
    const executionTime = Date.now() - startTime
    
    console.error('Code execution error:', {
      error: error.message,
      user: req.user.id,
      language: req.body.language,
      time: executionTime
    })
    
    // Don't expose internal errors to client
    const clientError = error.response?.status === 400 
      ? 'Invalid code or input' 
      : 'Code execution service temporarily unavailable'
    
    res.status(500).json({
      success: false,
      error: clientError,
      execution_time: executionTime
    })
  }
})

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/api/v2/runtimes`, {
      timeout: 5000
    })
    
    res.json({
      status: 'healthy',
      piston_status: 'connected',
      available_languages: Object.keys(languageMap),
      piston_runtimes: response.data.length
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      piston_status: 'disconnected',
      error: 'Cannot connect to code execution service'
    })
  }
})

module.exports = router