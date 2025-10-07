import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostModal } from '@/components/modals/post-modal'
import { FeedItem } from '@/components/feed/FeedItem'
import { apiClient } from '@/lib/api-client'

jest.mock('@/lib/api-client')
jest.mock('@/contexts/app-context', () => ({
  useAuth: () => ({ user: { id: 'user123', username: 'testuser' } })
}))

describe('Poll Integration Flow', () => {
  it('creates poll through post modal', async () => {
    const mockOnSubmit = jest.fn()
    render(<PostModal isOpen={true} onClose={() => {}} onSubmit={mockOnSubmit} />)
    
    // Switch to poll mode
    fireEvent.click(screen.getByText(/poll/i))
    
    // Fill poll question
    fireEvent.change(screen.getByLabelText(/poll question/i), {
      target: { value: 'Best framework?' }
    })
    
    // Fill options
    const options = screen.getAllByPlaceholderText(/option/i)
    fireEvent.change(options[0], { target: { value: 'React' } })
    fireEvent.change(options[1], { target: { value: 'Vue' } })
    
    // Create poll
    fireEvent.click(screen.getByText(/^create poll$/i))
    
    // Add content
    fireEvent.change(screen.getByPlaceholderText(/what's on your mind/i), {
      target: { value: 'Quick poll for the community!' }
    })
    
    // Submit post
    fireEvent.click(screen.getByText(/^post$/i))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Quick poll for the community!',
          poll: expect.objectContaining({
            question: 'Best framework?',
            options: expect.arrayContaining([
              expect.objectContaining({ text: 'React' }),
              expect.objectContaining({ text: 'Vue' })
            ])
          })
        })
      )
    })
  })

  it('displays and votes on poll in feed', async () => {
    const mockPost = {
      id: 'post123',
      author: { username: 'author', displayName: 'Author', avatar: '', level: 5 },
      content: 'Check out this poll!',
      poll: {
        question: 'Favorite language?',
        options: [
          { id: '1', text: 'JavaScript', votes: 10, voters: [] },
          { id: '2', text: 'Python', votes: 8, voters: [] }
        ],
        settings: {
          multipleChoice: false,
          maxChoices: 1,
          showResults: 'afterVote',
          allowAddOptions: false
        },
        totalVotes: 18
      },
      tags: [],
      likesCount: 5,
      commentsCount: 2,
      viewsCount: 50,
      xpAwarded: 20,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
      isLiked: false
    }
    
    ;(apiClient.request as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        poll: {
          ...mockPost.poll,
          options: [
            { id: '1', text: 'JavaScript', votes: 11, voters: ['user123'] },
            { id: '2', text: 'Python', votes: 8, voters: [] }
          ],
          totalVotes: 19
        },
        xpAwarded: 5
      }
    })
    
    render(
      <FeedItem 
        post={mockPost} 
        onLike={() => {}} 
        onComment={() => {}} 
      />
    )
    
    // Click on JavaScript option
    fireEvent.click(screen.getByText('JavaScript').closest('button')!)
    
    // Click vote button
    fireEvent.click(screen.getByText(/^vote$/i))
    
    await waitFor(() => {
      expect(apiClient.request).toHaveBeenCalledWith('/polls/vote', {
        method: 'POST',
        body: JSON.stringify({ postId: 'post123', optionIds: ['1'] })
      })
    })
  })

  it('shows poll results after voting', async () => {
    const mockPost = {
      id: 'post123',
      author: { username: 'author', displayName: 'Author', avatar: '', level: 5 },
      content: 'Poll results',
      poll: {
        question: 'Test?',
        options: [
          { id: '1', text: 'Yes', votes: 60, voters: ['user123'] },
          { id: '2', text: 'No', votes: 40, voters: [] }
        ],
        settings: {
          multipleChoice: false,
          maxChoices: 1,
          showResults: 'afterVote',
          allowAddOptions: false
        },
        totalVotes: 100
      },
      tags: [],
      likesCount: 5,
      commentsCount: 2,
      viewsCount: 50,
      xpAwarded: 20,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
      isLiked: false
    }
    
    render(
      <FeedItem 
        post={mockPost} 
        onLike={() => {}} 
        userVotes={['1']}
      />
    )
    
    expect(screen.getByText(/60%/)).toBeInTheDocument()
    expect(screen.getByText(/40%/)).toBeInTheDocument()
    expect(screen.getByText(/you voted for: yes/i)).toBeInTheDocument()
  })
})
