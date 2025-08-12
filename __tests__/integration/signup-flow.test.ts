import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SignupPage from '@/app/auth/signup/page';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import React from 'react';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/contexts/auth-context');
jest.mock('@/lib/api-client');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockRouter = useRouter as any;
const mockUseAuth = useAuth as any;
const mockApiClient = apiClient as any;

describe('Signup Flow Integration', () => {
  const mockPush = jest.fn();
  const mockSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRouter.mockReturnValue({
      push: mockPush
    });
    
    mockUseAuth.mockReturnValue({
      signup: mockSignup
    });
    
    mockApiClient.getAffiliations.mockResolvedValue({
      success: true,
      data: {
        affiliations: {
          techBootcamps: ['Tech Bootcamp 1', 'Tech Bootcamp 2'],
          federal: ['Federal University 1', 'Federal University 2']
        }
      }
    });

    // Reset window.location for each test
    window.location.search = '';
    window.location.href = '';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should complete successful signup flow', async () => {
    mockSignup.mockResolvedValue(undefined);

    render(React.createElement(SignupPage));

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    });

    // Select birth month and day
    const monthSelect = screen.getByDisplayValue('Select month');
    fireEvent.click(monthSelect);
    fireEvent.click(screen.getByText('May'));

    const daySelect = screen.getByDisplayValue('Select day');
    fireEvent.click(daySelect);
    fireEvent.click(screen.getByText('15'));

    // Select affiliation type
    const affiliationTypeSelect = screen.getByDisplayValue('Tech Bootcamps');
    fireEvent.click(affiliationTypeSelect);
    fireEvent.click(screen.getByText('Federal Universities'));

    // Wait for affiliations to load and select one
    await waitFor(() => {
      expect(mockApiClient.getAffiliations).toHaveBeenCalled();
    });

    // Fill passwords
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'Password123!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'Password123!' }
    });

    // Submit form
    const submitButton = screen.getByText('Create account');
    fireEvent.click(submitButton);

    // Verify signup was called with correct data
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        birthMonth: 5,
        birthDay: 15,
        affiliation: 'Other',
        referralCode: undefined
      });
    });

    // Verify redirect to onboarding
    await waitFor(() => {
      expect(window.location.href).toBe('/onboarding');
    }, { timeout: 1000 });
  });

  it('should handle signup with referral code', async () => {
    // Mock URL with referral code
    window.location.search = '?ref=TESTREF123';
    window.location.href = '';

    mockSignup.mockResolvedValue(undefined);

    render(React.createElement(SignupPage));

    // Verify referral code is displayed
    expect(screen.getByText('🎉 You\'re joining with a referral code:')).toBeInTheDocument();
    expect(screen.getByText('TESTREF123')).toBeInTheDocument();

    // Fill minimal required fields
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'Password123!' }
    });

    // Select birth month and day
    const monthSelect2 = screen.getByDisplayValue('Select month');
    fireEvent.click(monthSelect2);
    fireEvent.click(screen.getByText('January'));

    const daySelect2 = screen.getByDisplayValue('Select day');
    fireEvent.click(daySelect2);
    fireEvent.click(screen.getByText('1'));

    // Submit form
    fireEvent.click(screen.getByText('Create account'));

    // Verify signup was called with referral code
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        expect.objectContaining({
          referralCode: 'TESTREF123'
        })
      );
    });
  });

  it('should handle password mismatch error', async () => {
    render(React.createElement(SignupPage));

    // Fill passwords that don't match
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'DifferentPassword!' }
    });

    // Fill other required fields
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Create account'));

    // Verify error message is shown
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should handle signup API errors', async () => {
    const signupError = new Error('Email already exists');
    mockSignup.mockRejectedValue(signupError);

    render(React.createElement(SignupPage));

    // Fill form with valid data
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'Password123!' }
    });

    // Select birth month and day
    const monthSelect3 = screen.getByDisplayValue('Select month');
    fireEvent.click(monthSelect3);
    fireEvent.click(screen.getByText('January'));

    const daySelect3 = screen.getByDisplayValue('Select day');
    fireEvent.click(daySelect3);
    fireEvent.click(screen.getByText('1'));

    // Submit form
    fireEvent.click(screen.getByText('Create account'));

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    expect(mockSignup).toHaveBeenCalled();
  });

  it('should show loading state during signup', async () => {
    mockSignup.mockImplementation(() => new Promise(() => {}));

    render(React.createElement(SignupPage));

    // Fill minimal form
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'Password123!' }
    });

    // Select birth month and day
    const monthSelect4 = screen.getByDisplayValue('Select month');
    fireEvent.click(monthSelect4);
    fireEvent.click(screen.getByText('January'));

    const daySelect4 = screen.getByDisplayValue('Select day');
    fireEvent.click(daySelect4);
    fireEvent.click(screen.getByText('1'));

    // Submit form
    const submitButton4 = screen.getByText('Create account');
    fireEvent.click(submitButton4);

    // Verify loading state
    await waitFor(() => {
      expect(submitButton4).toBeDisabled();
    });

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(React.createElement(SignupPage));

    // Try to submit empty form
    fireEvent.click(screen.getByText('Create account'));

    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    render(React.createElement(SignupPage));

    // Fill invalid email
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'invalid-email' }
    });

    // Fill other required fields
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'Password123!' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'Password123!' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Create account'));

    // Verify email validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should validate password strength', async () => {
    render(React.createElement(SignupPage));

    // Fill weak password
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: '123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: '123' }
    });

    // Fill other required fields
    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Test' }
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'User' }
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a unique username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your email address'), {
      target: { value: 'test@example.com' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Create account'));

    // Verify password strength error
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });

    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('should handle affiliation loading error', async () => {
    mockApiClient.getAffiliations.mockRejectedValue(new Error('Failed to load affiliations'));

    render(React.createElement(SignupPage));

    // Select affiliation type to trigger API call
    const affiliationTypeSelect = screen.getByDisplayValue('Tech Bootcamps');
    fireEvent.click(affiliationTypeSelect);
    fireEvent.click(screen.getByText('Federal Universities'));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Failed to load affiliations')).toBeInTheDocument();
    });
  });

  it('should navigate to login page', async () => {
    render(React.createElement(SignupPage));

    // Click login link
    const loginLink = screen.getByText('Sign in');
    fireEvent.click(loginLink);

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
});