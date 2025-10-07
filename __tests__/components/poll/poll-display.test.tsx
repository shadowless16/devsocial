import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PollDisplay } from '@/components/poll/poll-display'

const mockPoll = {
  question: 'What is your favorite language?',
  options: [
    { id: '1', text: 'JavaScript', votes: 10, voters: [] },
    { id: '2', text: 'Python', votes: 8, voters: [] },
    { id: '3', text: 'TypeScript', votes: 12, voters: [] }
  ],
  settings: {
    multipleChoice: false,
    maxChoices: 1,
    showResults: 'afterVote' as const,
    allowAddOptions: false
  },
  totalVotes: 30
}

describe('PollDisplay', () => {
  const mockOnVote = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders poll question and options', () => {
    render(<PollDisplay poll={mockPoll} onVote={mockOnVote} />)
    
    expect(screen.getByText('What is your favorite language?')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('displays total vote count', () => {
    render(<PollDisplay poll={mockPoll} onVote={mockOnVote} />)
    
    expect(screen.getByText(/30 votes/i)).toBeInTheDocument()
  })

  it('allows selecting option in single choice mode', () => {
    render(<PollDisplay poll={mockPoll} onVote={mockOnVote} />)
    
    const jsOption = screen.getByText('JavaScript').closest('button')
    fireEvent.click(jsOption!)
    
    expect(screen.getByText(/^vote$/i)).toBeInTheDocument()
  })

  it('submits vote when vote button clicked', async () => {
    render(<PollDisplay poll={mockPoll} onVote={mockOnVote} />)
    
    const jsOption = screen.getByText('JavaScript').closest('button')
    fireEvent.click(jsOption!)
    
    const voteButton = screen.getByText(/^vote$/i)
    fireEvent.click(voteButton)
    
    await waitFor(() => {
      expect(mockOnVote).toHaveBeenCalledWith(['1'])
    })
  })

  it('shows results after voting when setting is afterVote', () => {
    render(
      <PollDisplay 
        poll={mockPoll} 
        userVotes={['1']} 
        onVote={mockOnVote} 
      />
    )
    
    expect(screen.getByText(/33%/)).toBeInTheDocument()
    expect(screen.getByText(/27%/)).toBeInTheDocument()
    expect(screen.getByText(/40%/)).toBeInTheDocument()
  })

  it('highlights winning option', () => {
    render(
      <PollDisplay 
        poll={mockPoll} 
        userVotes={['1']} 
        onVote={mockOnVote} 
      />
    )
    
    const tsOption = screen.getByText('TypeScript').closest('button')
    expect(tsOption).toHaveClass('border-emerald-400')
  })

  it('allows multiple selections in multiple choice mode', () => {
    const multiPoll = {
      ...mockPoll,
      settings: { ...mockPoll.settings, multipleChoice: true, maxChoices: 2 }
    }
    
    render(<PollDisplay poll={multiPoll} onVote={mockOnVote} />)
    
    fireEvent.click(screen.getByText('JavaScript').closest('button')!)
    fireEvent.click(screen.getByText('Python').closest('button')!)
    
    expect(screen.getByText(/vote \(2\/2\)/i)).toBeInTheDocument()
  })

  it('prevents voting after poll ends', () => {
    const endedPoll = {
      ...mockPoll,
      endsAt: new Date(Date.now() - 1000).toISOString()
    }
    
    render(<PollDisplay poll={endedPoll} onVote={mockOnVote} />)
    
    expect(screen.getByText(/poll ended/i)).toBeInTheDocument()
    expect(screen.queryByText(/^vote$/i)).not.toBeInTheDocument()
  })

  it('shows countdown for active timed poll', () => {
    const timedPoll = {
      ...mockPoll,
      endsAt: new Date(Date.now() + 3600000).toISOString()
    }
    
    render(<PollDisplay poll={timedPoll} onVote={mockOnVote} />)
    
    expect(screen.getByText(/left/i)).toBeInTheDocument()
  })

  it('displays voted confirmation message', () => {
    render(
      <PollDisplay 
        poll={mockPoll} 
        userVotes={['1']} 
        onVote={mockOnVote} 
      />
    )
    
    expect(screen.getByText(/you voted for: javascript/i)).toBeInTheDocument()
  })
})
