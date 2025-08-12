# Signup Flow Integration Test Documentation

## Overview
This integration test suite validates the complete signup flow functionality for the DevSocial platform, ensuring all user registration scenarios work correctly.

## Test File Location
`__tests__/integration/signup-flow.test.ts`

## Test Coverage

### 1. Successful Signup Flow
- **Purpose**: Validates complete successful user registration
- **Scenario**: User fills all required fields correctly and submits
- **Assertions**:
  - Form submission calls signup API with correct data
  - User is redirected to onboarding page
  - All form fields are properly validated

### 2. Signup with Referral Code
- **Purpose**: Tests referral system integration
- **Scenario**: User accesses signup page with referral code in URL
- **Assertions**:
  - Referral code is displayed in UI
  - Signup API is called with referral code
  - Referral code is extracted from URL parameters

### 3. Password Mismatch Validation
- **Purpose**: Ensures password confirmation works
- **Scenario**: User enters different passwords in password fields
- **Assertions**:
  - Error message is displayed
  - Signup API is not called
  - Form submission is prevented

### 4. API Error Handling
- **Purpose**: Tests error handling for signup failures
- **Scenario**: API returns error (e.g., email already exists)
- **Assertions**:
  - Error message is displayed to user
  - Form remains interactive
  - User can retry signup

### 5. Loading State Display
- **Purpose**: Validates UI feedback during signup process
- **Scenario**: Signup API call is in progress
- **Assertions**:
  - Submit button is disabled
  - Loading text is displayed
  - Form is in loading state

### 6. Required Field Validation
- **Purpose**: Ensures all required fields are validated
- **Scenario**: User submits empty form
- **Assertions**:
  - Validation errors are shown for all required fields
  - Signup API is not called
  - Form submission is prevented

### 7. Email Format Validation
- **Purpose**: Validates email input format
- **Scenario**: User enters invalid email format
- **Assertions**:
  - Email validation error is displayed
  - Form submission is prevented
  - Signup API is not called

### 8. Password Strength Validation
- **Purpose**: Ensures password meets security requirements
- **Scenario**: User enters weak password
- **Assertions**:
  - Password strength error is displayed
  - Form submission is prevented
  - Security requirements are enforced

### 9. Affiliation Loading Error
- **Purpose**: Tests error handling for affiliation data loading
- **Scenario**: API fails to load affiliation options
- **Assertions**:
  - Error message is displayed
  - User can still proceed with signup
  - Graceful error handling

### 10. Navigation to Login
- **Purpose**: Tests navigation between auth pages
- **Scenario**: User clicks login link
- **Assertions**:
  - Router navigation is triggered
  - Correct route is navigated to

## Mocked Dependencies

### External Services
- `next/navigation` - Router functionality
- `@/contexts/auth-context` - Authentication state management
- `@/lib/api-client` - API communication
- `sonner` - Toast notifications

### Mock Data
- Affiliation data with tech bootcamps and federal universities
- User signup data with all required fields
- Error responses for various failure scenarios

## Test Setup

### Before Each Test
- Clear all mocks
- Setup router mock with push function
- Setup auth context mock with signup function
- Setup API client mock with affiliation data
- Mock window.location for URL parameter testing

### After Each Test
- Restore all mocks to prevent test interference

## Key Testing Patterns

### Form Interaction
- Uses `fireEvent.change` for input field testing
- Uses `fireEvent.click` for button and select interactions
- Validates form state changes

### Async Operations
- Uses `waitFor` for async assertions
- Tests loading states and API call completion
- Handles promise-based operations

### Error Scenarios
- Tests both client-side and server-side errors
- Validates error message display
- Ensures graceful error recovery

## Dependencies
- **Vitest**: Test runner and assertion library
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation

## Running the Tests
```bash
npm run test signup-flow.test.ts
# or
yarn test signup-flow.test.ts
```

## Coverage Goals
- 100% line coverage for signup flow components
- All user interaction paths tested
- All error scenarios covered
- All validation rules verified

## Maintenance Notes
- Update tests when signup form fields change
- Maintain mock data consistency with actual API
- Review test scenarios when business rules change
- Keep error messages in sync with actual implementation