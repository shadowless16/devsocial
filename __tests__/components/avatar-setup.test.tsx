import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvatarSetup } from '@/components/onboarding/avatar-setup';
import { useAuth } from '@/contexts/auth-context';
import * as avatarGenerator from '@/utils/avatar-generator';

// Mock dependencies
vi.mock('@/contexts/auth-context');
vi.mock('@/utils/avatar-generator');

const mockUseAuth = useAuth as any;
const mockGenerateRandomAvatar = avatarGenerator.generateRandomAvatar as any;

describe('AvatarSetup Component', () => {
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();
  
  const defaultProps = {
    data: {
      avatar: '',
      bio: '',
      gender: '',
      userType: '',
      socials: { twitter: '', linkedin: '' }
    },
    onNext: mockOnNext,
    onBack: mockOnBack
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user123',
        username: 'testuser',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser'
      }
    });
    mockGenerateRandomAvatar.mockReturnValue('https://api.dicebear.com/7.x/avataaars/svg?seed=random123');
  });

  it('should render avatar setup form', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    expect(screen.getByText("Let's set up your profile!")).toBeInTheDocument();
    expect(screen.getByText('Upload Avatar')).toBeInTheDocument();
    expect(screen.getByText('Generate New')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select your gender')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Select your role')).toBeInTheDocument();
  });

  it('should show user avatar from context', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    const avatarImage = screen.getByRole('img');
    expect(avatarImage).toHaveAttribute('src', expect.stringContaining('testuser'));
  });

  it('should disable upload button with message', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    const uploadButton = screen.getByText('Upload Avatar').closest('button');
    expect(uploadButton).toBeDisabled();
    expect(uploadButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(screen.getByText('Upload is disabled during beta. Use "Generate New" for random avatars!')).toBeInTheDocument();
  });

  it('should generate new avatar when clicking Generate New', async () => {
    render(<AvatarSetup {...defaultProps} />);
    
    const generateButton = screen.getByText('Generate New');
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(mockGenerateRandomAvatar).toHaveBeenCalledWith(undefined);
    });
    
    expect(generateButton).toHaveTextContent('Generating...');
  });

  it('should regenerate avatar when gender changes', async () => {
    render(<AvatarSetup {...defaultProps} />);
    
    // Open gender select
    const genderSelect = screen.getByPlaceholderText('Select your gender');
    fireEvent.click(genderSelect);
    
    // Select male
    const maleOption = screen.getByText('Male');
    fireEvent.click(maleOption);
    
    await waitFor(() => {
      expect(mockGenerateRandomAvatar).toHaveBeenCalledWith('male');
    });
  });

  it('should update bio with character count', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    const bioTextarea = screen.getByPlaceholderText('Tell us something cool about yourself! What are you passionate about?');
    fireEvent.change(bioTextarea, { target: { value: 'I love coding!' } });
    
    expect(screen.getByText('13/250 characters')).toBeInTheDocument();
  });

  it('should handle form submission', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    // Fill form
    const bioTextarea = screen.getByPlaceholderText('Tell us something cool about yourself! What are you passionate about?');
    fireEvent.change(bioTextarea, { target: { value: 'I love coding!' } });
    
    // Submit form
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    expect(mockOnNext).toHaveBeenCalledWith(
      expect.objectContaining({
        bio: 'I love coding!'
      })
    );
  });

  it('should show back button when onBack is provided', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    const backButton = screen.getByText('Back');
    expect(backButton).toBeInTheDocument();
    
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should not show back button when onBack is not provided', () => {
    const propsWithoutBack = { ...defaultProps, onBack: undefined };
    render(<AvatarSetup {...propsWithoutBack} />);
    
    expect(screen.queryByText('Back')).not.toBeInTheDocument();
  });

  it('should handle social links input', () => {
    render(<AvatarSetup {...defaultProps} />);
    
    const twitterInput = screen.getByPlaceholderText('@yourusername');
    const linkedinInput = screen.getByPlaceholderText('linkedin.com/in/yourprofile');
    
    fireEvent.change(twitterInput, { target: { value: '@testuser' } });
    fireEvent.change(linkedinInput, { target: { value: 'linkedin.com/in/testuser' } });
    
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    expect(mockOnNext).toHaveBeenCalledWith(
      expect.objectContaining({
        socials: {
          twitter: '@testuser',
          linkedin: 'linkedin.com/in/testuser'
        }
      })
    );
  });
});