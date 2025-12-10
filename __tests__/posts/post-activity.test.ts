import { setupMongoDB, teardownMongoDB, clearDatabase } from '../setup/mongodb'
import { NextRequest } from 'next/server'
import Activity from '@/models/Activity'

// Mock next-auth getServerSession so the POST route authenticates
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
import { getUserFromRequest } from '@/lib/jwt-auth'
const mockedGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>

import { POST as createPostRoute } from '@/app/api/posts/route'

beforeAll(async () => {
  await setupMongoDB()
})

afterAll(async () => {
  await teardownMongoDB()
})

beforeEach(async () => {
  await clearDatabase()
  mockedGetServerSession.mockReset()
})

test('creating a Post also creates an Activity record via POST handler', async () => {
  // Create a fake user
  const User = (await import('@/models/User')).default
  const user = await User.create({ username: 'tester', email: 'tester@example.com', password: 'pass123' })

  // Mock session to be this user
  mockedGetServerSession.mockResolvedValue({ user: { id: user._id.toString(), email: user.email } } as unknown)

  // Create a POST request to the route
  const body = { content: 'Hello world from route', tags: [] }
  const request = new NextRequest('http://localhost/api/posts', { method: 'POST', body: JSON.stringify(body) })

  const response = await createPostRoute(request as unknown)
  const resJson = await response.json()

  // Verify route responded with created post
  expect(response.status).toBe(201)
  const returned = resJson._data || resJson
  expect(returned.success).toBe(true)
  expect(returned.data.post).toBeDefined()

  // Check that an Activity was created for the user
  const activities = await Activity.find({ user: user._id }).lean()
  expect(activities.length).toBeGreaterThanOrEqual(1)
  const found = activities.find(a => a.metadata?.postId === returned.data.post.id || a.type === 'post_created')
  expect(found).toBeDefined()
})
