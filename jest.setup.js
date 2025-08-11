// Jest setup file
require('dotenv').config({ path: '.env.local' })

// Increase timeout for database operations
jest.setTimeout(30000)