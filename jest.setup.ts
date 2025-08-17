// Jest setup file
import 'dotenv/config'
import '@testing-library/jest-dom'

// Mock DOM environment
const { JSDOM } = require('jsdom')
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
})

global.window = dom.window
global.document = dom.window.document
global.navigator = dom.window.navigator
global.self = dom.window
global.DocumentFragment = dom.window.DocumentFragment
global.requestIdleCallback = dom.window.requestIdleCallback || ((cb: any) => setTimeout(cb, 0))
global.cancelIdleCallback = dom.window.cancelIdleCallback || clearTimeout
global.IntersectionObserver = class IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
} as any
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Increase timeout for database operations
jest.setTimeout(30000)