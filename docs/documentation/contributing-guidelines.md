# Contributing Guidelines

How to contribute to the DevSocial project.

## Welcome Contributors! 🎉

Thank you for your interest in contributing to DevSocial! This document provides guidelines and information for contributors to help maintain code quality and project consistency.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- Git configured with your GitHub account
- MongoDB running locally or Atlas account
- Familiarity with TypeScript, React, and Next.js

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/devsocial-frontend.git
   cd devsocial-frontend
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/devsocial-frontend.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

6. **Run development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

We use a feature branch workflow:

```
main (production-ready code)
├── develop (integration branch)
├── feature/user-authentication
├── feature/gamification-system
├── bugfix/feed-loading-issue
└── hotfix/security-patch
```

### Creating a Feature Branch

1. **Sync with upstream**:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit regularly

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Branch Naming Convention

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

Examples:
- `feature/user-profile-page`
- `bugfix/login-validation-error`
- `docs/api-documentation-update`

## Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// ✅ Good - Explicit interface
interface User {
  id: string
  username: string
  email: string
  xp: number
  level: number
}

// ❌ Avoid - Using any
const user: any = getUserData()

// ✅ Good - Proper typing
const user: User = getUserData()
```

#### Component Props
```typescript
// ✅ Good - Interface for props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  children 
}) => {
  // Component implementation
}
```

### React Guidelines

#### Component Structure
```typescript
// ✅ Good component structure
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

interface MyComponentProps {
  title: string
  onSubmit: (data: FormData) => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  // Hooks at the top
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Effects
  useEffect(() => {
    // Effect logic
  }, [])

  // Event handlers
  const handleSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  // Early returns
  if (!user) {
    return <div>Please log in</div>
  }

  // Main render
  return (
    <div>
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  )
}
```

#### Hooks Usage
```typescript
// ✅ Good - Custom hook
const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const data = await getUserProfile(userId)
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, loading, error }
}
```

### CSS/Styling Guidelines

#### Tailwind CSS Usage
```tsx
// ✅ Good - Semantic class grouping
<div className="
  flex items-center justify-between
  p-4 rounded-lg
  bg-white dark:bg-gray-800
  border border-gray-200 dark:border-gray-700
  hover:shadow-md transition-shadow
">
  Content
</div>

// ✅ Good - Responsive design
<div className="
  grid grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  Cards
</div>
```

#### Component Variants
```typescript
// ✅ Good - Using class-variance-authority
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

### API Guidelines

#### Route Handlers
```typescript
// ✅ Good - Proper error handling and validation
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'

const CreatePostSchema = z.object({
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).max(10),
})

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate request body
    const body = await request.json()
    const validatedData = CreatePostSchema.parse(body)

    // Business logic
    const post = await createPost({
      ...validatedData,
      authorId: session.user.id
    })

    return NextResponse.json(
      { success: true, data: post },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples

```bash
# Feature
feat(auth): add user registration with email verification

# Bug fix
fix(feed): resolve infinite scroll loading issue

# Documentation
docs(api): update authentication endpoint documentation

# Refactoring
refactor(components): extract common button variants

# Breaking change
feat(api)!: change user profile endpoint structure

BREAKING CHANGE: The user profile endpoint now returns nested objects for better data organization.
```

### Commit Best Practices

1. **Make atomic commits** - One logical change per commit
2. **Write descriptive messages** - Explain what and why, not how
3. **Use present tense** - "Add feature" not "Added feature"
4. **Keep first line under 50 characters**
5. **Add body for complex changes**

## Pull Request Process

### Before Creating a PR

1. **Ensure your branch is up to date**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run tests and linting**:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

### PR Template

When creating a PR, use this template:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

### PR Review Process

1. **Automated checks** must pass (CI/CD, tests, linting)
2. **Code review** by at least one maintainer
3. **Manual testing** if UI changes are involved
4. **Documentation** updates if needed
5. **Approval** from maintainer before merge

## Issue Guidelines

### Creating Issues

#### Bug Reports
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. iOS]
- Browser: [e.g. chrome, safari]
- Version: [e.g. 22]
```

#### Feature Requests
```markdown
**Feature Description**
A clear description of what you want to happen.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Any alternative solutions you've considered.

**Additional Context**
Any other context or screenshots.
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `status: in progress` - Currently being worked on

## Testing Requirements

### Unit Tests

Write unit tests for:
- Utility functions
- Custom hooks
- Component logic
- API route handlers

```typescript
// Example unit test
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests

Test component interactions and API endpoints:

```typescript
// Example integration test
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'

describe('LoginForm Integration', () => {
  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    
    render(<LoginForm onSubmit={onSubmit} />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
```

### Test Coverage

Maintain minimum test coverage:
- **Components**: 80%
- **Utilities**: 90%
- **API Routes**: 85%

## Documentation

### Code Documentation

#### JSDoc Comments
```typescript
/**
 * Calculates XP required for the next level
 * @param currentLevel - The user's current level
 * @returns The XP amount needed for next level
 */
function calculateXPForNextLevel(currentLevel: number): number {
  return currentLevel * 100 + 500
}
```

#### Component Documentation
```typescript
/**
 * Button component with multiple variants and sizes
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
interface ButtonProps {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'danger'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Disabled state */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
  /** Button content */
  children: React.ReactNode
}
```

### README Updates

When adding new features, update relevant documentation:
- Component usage examples
- API endpoint documentation
- Configuration instructions
- Deployment guides

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README
- Release notes for significant contributions

## Getting Help

- **Discord**: Join our development Discord server
- **GitHub Discussions**: For questions and discussions
- **Issues**: For bug reports and feature requests
- **Email**: dev@devsocial.com for private matters

## License

By contributing to DevSocial, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to DevSocial! Your efforts help make this platform better for the entire developer community. 🚀