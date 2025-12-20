// Jest setup file
import 'dotenv/config'

// Polyfill TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Polyfill Web APIs for Next.js
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(public url: string, public init?: unknown) {}
    headers = new Map()
    method = 'GET'
    body = null
    json = async () => ({})
    text = async () => ''
  } as any
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(public body?: unknown, public init?: { status?: number }) {
      this.status = init?.status || 200
    }
    headers = new Map()
    status = 200
    statusText = 'OK'
    ok = true
    json = async () => {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }
    text = async () => String(this.body || '')
  } as any
}

if (typeof global.Headers === 'undefined') {
  global.Headers = Map as any
}

if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() => Promise.resolve(new Response('{}', { status: 200 }))) as any
}



// Mock next/server modules
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(public url: string, public init?: { method?: string; body?: string | null }) {
      this.method = init?.method || 'GET'
      this.body = init?.body || null
    }
    method = 'GET'
    body = null
    nextUrl = { pathname: '/', searchParams: new URLSearchParams() }
    cookies = { get: jest.fn(), set: jest.fn() }
    headers = new Map()
    async json() {
      return this.body ? JSON.parse(this.body) : {}
    }
  },
  NextResponse: class NextResponse {
    constructor(public body?: unknown, public init?: { status?: number }) {
      this.status = init?.status || 200
      this._data = body
    }
    status = 200
    _data: unknown
    headers = new Map()
    
    async json() {
      return this._data
    }
    
    static json: (data: unknown, init?: { status?: number }) => NextResponse = (data: unknown, init?: { status?: number }) => {
      const response = new NextResponse(data, init)
      response.status = init?.status || 200
      return response
    }
  }
}))

// Set reasonable timeout for tests
jest.setTimeout(30000)