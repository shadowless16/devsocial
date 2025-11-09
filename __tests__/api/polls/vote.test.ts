import { POST } from '@/app/api/polls/vote/route'
import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/jwt-auth'
import Post from '@/models/Post'
import User from '@/models/User'

jest.mock('next-auth')
jest.mock('@/models/Post')
jest.mock('@/models/User')
jest.mock('@/lib/db')

const mockSession = {
  user: { id: 'user123', email: 'test@test.com' }
}

const mockPost = {
  _id: 'post123',
  poll: {
    question: 'Test poll?',
    options: [
      { id: '1', text: 'Option 1', votes: 5, voters: [] },
      { id: '2', text: 'Option 2', votes: 3, voters: [] }
    ],
    settings: {
      multipleChoice: false,
      maxChoices: 1,
      showResults: 'afterVote',
      allowAddOptions: false
    },
    totalVotes: 8,
    endsAt: null
  },
  save: jest.fn()
}

describe('POST /api/polls/vote', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it('returns 401 if not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(401)
  })

  it('returns 400 if request data is invalid', async () => {
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123' })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 404 if poll not found', async () => {
    ;(Post.findById as jest.Mock).mockResolvedValue(null)
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(404)
  })

  it('returns 400 if poll has ended', async () => {
    const endedPost = {
      ...mockPost,
      poll: {
        ...mockPost.poll,
        endsAt: new Date(Date.now() - 1000)
      }
    }
    ;(Post.findById as jest.Mock).mockResolvedValue(endedPost)
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('returns 400 if user already voted', async () => {
    const votedPost = {
      ...mockPost,
      poll: {
        ...mockPost.poll,
        options: [
          { id: '1', text: 'Option 1', votes: 5, voters: ['user123'] },
          { id: '2', text: 'Option 2', votes: 3, voters: [] }
        ]
      }
    }
    ;(Post.findById as jest.Mock).mockResolvedValue(votedPost)
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('successfully records vote', async () => {
    ;(Post.findById as jest.Mock).mockResolvedValue(mockPost)
    ;(User.findByIdAndUpdate as jest.Mock).mockResolvedValue({})
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1'] })
    })
    
    const response = await POST(req)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.xpAwarded).toBe(5)
    expect(mockPost.save).toHaveBeenCalled()
  })

  it('validates single choice constraint', async () => {
    ;(Post.findById as jest.Mock).mockResolvedValue(mockPost)
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1', '2'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('allows multiple votes in multiple choice poll', async () => {
    const multiPoll = {
      ...mockPost,
      poll: {
        ...mockPost.poll,
        settings: { ...mockPost.poll.settings, multipleChoice: true, maxChoices: 2 }
      }
    }
    ;(Post.findById as jest.Mock).mockResolvedValue(multiPoll)
    ;(User.findByIdAndUpdate as jest.Mock).mockResolvedValue({})
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1', '2'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(200)
  })

  it('validates max choices in multiple choice poll', async () => {
    const multiPoll = {
      ...mockPost,
      poll: {
        ...mockPost.poll,
        settings: { ...mockPost.poll.settings, multipleChoice: true, maxChoices: 2 }
      }
    }
    ;(Post.findById as jest.Mock).mockResolvedValue(multiPoll)
    
    const req = new NextRequest('http://localhost/api/polls/vote', {
      method: 'POST',
      body: JSON.stringify({ postId: 'post123', optionIds: ['1', '2', '3'] })
    })
    
    const response = await POST(req)
    expect(response.status).toBe(400)
  })
})
