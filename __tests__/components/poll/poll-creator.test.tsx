import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PollCreator } from '@/components/poll/poll-creator'

describe('PollCreator', () => {
  const mockOnPollCreate = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders poll creator with default options', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/poll question/i)).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2)
  })

  it('adds new option when clicking add button', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByText(/add option/i))
    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(3)
  })

  it('removes option when clicking remove button', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByText(/add option/i))
    const removeButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(removeButtons[0])
    
    expect(screen.getAllByPlaceholderText(/option/i)).toHaveLength(2)
  })

  it('prevents removing when only 2 options remain', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    const removeButtons = screen.queryAllByRole('button', { name: '' })
    expect(removeButtons).toHaveLength(0)
  })

  it('limits options to 10', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    for (let i = 0; i < 10; i++) {
      const addButton = screen.queryByText(/add option/i)
      if (addButton) fireEvent.click(addButton)
    }
    
    expect(screen.getAllByPlaceholderText(/option/i).length).toBeLessThanOrEqual(10)
  })

  it('creates poll with valid data', async () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    fireEvent.change(screen.getByLabelText(/poll question/i), {
      target: { value: 'What is your favorite framework?' }
    })
    
    const options = screen.getAllByPlaceholderText(/option/i)
    fireEvent.change(options[0], { target: { value: 'React' } })
    fireEvent.change(options[1], { target: { value: 'Vue' } })
    
    fireEvent.click(screen.getByText(/^create poll$/i))
    
    await waitFor(() => {
      expect(mockOnPollCreate).toHaveBeenCalledWith({
        question: 'What is your favorite framework?',
        options: expect.arrayContaining([
          expect.objectContaining({ text: 'React' }),
          expect.objectContaining({ text: 'Vue' })
        ]),
        settings: expect.any(Object)
      })
    })
  })

  it('does not create poll with empty question', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    const options = screen.getAllByPlaceholderText(/option/i)
    fireEvent.change(options[0], { target: { value: 'Option 1' } })
    fireEvent.change(options[1], { target: { value: 'Option 2' } })
    
    const createButton = screen.getByText(/^create poll$/i)
    expect(createButton).toBeDisabled()
  })

  it('toggles multiple choice setting', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByText(/show settings/i))
    const multipleSwitch = screen.getByLabelText(/multiple choice/i)
    
    fireEvent.click(multipleSwitch)
    expect(screen.getByLabelText(/max choices/i)).toBeInTheDocument()
  })

  it('calls onCancel when cancel button clicked', () => {
    render(<PollCreator onPollCreate={mockOnPollCreate} onCancel={mockOnCancel} />)
    
    fireEvent.click(screen.getByText(/^cancel$/i))
    expect(mockOnCancel).toHaveBeenCalled()
  })
})
